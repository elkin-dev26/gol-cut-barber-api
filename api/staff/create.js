const {
  authenticateStaff,
  auditActorHeaders,
  getServiceRoleKey,
  getSupabaseUrl,
  isConfigured,
  serviceRequest
} = require('../../lib/supabase-server');
const { DAY_MS, isValidSubscriptionDays } = require('../../lib/subscriptions');

const isEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const isUsername = (value) => !value || (typeof value === 'string' && /^[a-zA-Z0-9_.-]{1,64}$/.test(value));

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!isConfigured()) {
    return res.status(503).json({ error: 'El servidor no tiene configuradas las credenciales de Supabase.' });
  }

  try {
    const caller = await authenticateStaff(req);
    if (!caller) return res.status(401).json({ error: 'Primero inicia sesión con una cuenta del equipo.' });

    const {
      role,
      email,
      password,
      username,
      displayName,
      tenantId,
      entityId,
      subscriptionDays,
      isIndefinite = false
    } = req.body || {};
    const canCreateRole = caller.role === 'developer'
      ? ['admin', 'barber', 'independent'].includes(role)
      : caller.role === 'admin' && role === 'barber' && caller.tenant_id === tenantId;

    if (!canCreateRole) return res.status(403).json({ error: 'No tienes permiso para crear esta cuenta.' });
    if ((subscriptionDays !== undefined || req.body?.isIndefinite !== undefined)
      && (caller.role !== 'developer' || role === 'admin')
    ) {
      return res.status(403).json({ error: 'Solo el desarrollador puede asignar planes de suscripción.' });
    }
    if (typeof isIndefinite !== 'boolean'
      || (!isIndefinite && !isValidSubscriptionDays(subscriptionDays === undefined ? 30 : subscriptionDays))
    ) {
      return res.status(400).json({ error: 'El plan de suscripción no es válido.' });
    }
    if (!isEmail(email) || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Ingresa un correo válido y una contraseña de al menos 8 caracteres.' });
    }
    if (typeof displayName !== 'string' || !displayName.trim() || displayName.length > 120 || !isId(entityId) || !isId(tenantId) || !isUsername(username)) {
      return res.status(400).json({ error: 'Se requieren nombre, ID de perfil e ID de sede.' });
    }
    if (role === 'independent' && entityId !== tenantId) {
      return res.status(400).json({ error: 'El ID del barbero independiente debe coincidir con su sede.' });
    }
    if (caller.role === 'admin' && role === 'barber' && caller.tenant_id !== tenantId) {
      return res.status(403).json({ error: 'Solo puedes crear barberos para tu propia sede.' });
    }

    const tenantRows = await serviceRequest(
      `tenants?select=id,license_status,developer_blocked&id=eq.${encodeURIComponent(tenantId)}&limit=1`
    );
    if (!tenantRows?.length) return res.status(404).json({ error: 'La sede seleccionada no está registrada.' });
    if (caller.role === 'admin' && (
      tenantRows[0].license_status !== 'active'
      || tenantRows[0].developer_blocked
    )) {
      return res.status(403).json({ error: 'La sede está bloqueada y no puede crear cuentas de equipo.' });
    }

    const now = new Date();
    const subscriptionExpiresAt = isIndefinite
      ? null
      : new Date(now.getTime() + (subscriptionDays === undefined ? 30 : subscriptionDays) * DAY_MS).toISOString();
    const authResponse = await fetch(`${getSupabaseUrl()}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: getServiceRoleKey(),
        Authorization: `Bearer ${getServiceRoleKey()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName.trim(), username: username?.trim() || null }
      })
    });
    const authData = await authResponse.json();
    if (!authResponse.ok) {
      return res.status(400).json({ error: 'No se pudo crear la cuenta. Verifica que el correo no esté registrado.' });
    }

    const profile = {
      id: authData.id,
      role,
      display_name: displayName.trim(),
      username: username?.trim().toLowerCase() || null,
      tenant_id: tenantId,
      entity_id: entityId,
      password_changed_at: now.toISOString(),
      last_active_at: null
    };
    const entityType = role === 'independent' ? 'independent' : 'barber';

    try {
      await serviceRequest('user_profiles', {
        method: 'POST',
        headers: { Prefer: 'return=minimal', ...auditActorHeaders(caller) },
        body: JSON.stringify(profile)
      });

      if (role !== 'admin') {
        await serviceRequest('booking_entities', {
          method: 'POST',
          headers: { Prefer: 'return=minimal', ...auditActorHeaders(caller) },
          body: JSON.stringify({
            id: entityId,
            tenant_id: tenantId,
            entity_type: entityType,
            name: displayName.trim(),
            user_id: authData.id,
            expires_at: subscriptionExpiresAt,
            is_indefinite: isIndefinite,
            password_changed_at: now.toISOString(),
            last_active_at: null
          })
        });
      }
    } catch (error) {
      try {
        const cleanupResponse = await fetch(`${getSupabaseUrl()}/auth/v1/admin/users/${encodeURIComponent(authData.id)}`, {
          method: 'DELETE',
          headers: {
            apikey: getServiceRoleKey(),
            Authorization: `Bearer ${getServiceRoleKey()}`
          }
        });
        if (!cleanupResponse.ok) console.error('Staff auth-user rollback failed:', cleanupResponse.status);
      } catch (cleanupError) {
        console.error('Staff auth-user rollback failed:', cleanupError.message);
      }
      throw error;
    }

    return res.status(201).json({ userId: authData.id, profile });
  } catch (error) {
    console.error('Staff account creation failed:', error.message);
    return error.status === 409
      ? res.status(409).json({ error: 'El correo, usuario o ID ya está registrado.' })
      : res.status(500).json({ error: 'No se pudo crear la cuenta del barbero.' });
  }
};
