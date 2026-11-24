const {
  authenticateStaff,
  auditActorHeaders,
  getServiceRoleKey,
  getSupabaseUrl,
  isConfigured,
  serviceRequest
} = require('../supabase-server');
const { DAY_MS, isValidSubscriptionDays } = require('../subscriptions');

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

  let createdTenantId;
  let createdUserId;
  try {
    const caller = await authenticateStaff(req);
    if (!caller || caller.role !== 'developer') {
      return res.status(403).json({ error: 'Solo el desarrollador puede crear sedes y cuentas independientes.' });
    }
    const systemSettings = await serviceRequest(
      'system_settings?select=production_shield_enabled&id=eq.1&limit=1'
    );
    if (systemSettings?.[0]?.production_shield_enabled) {
      if (!process.env.APP_ORIGIN || req.headers.origin !== process.env.APP_ORIGIN) {
        return res.status(403).json({ error: 'El Escudo de Producción bloqueó esta solicitud de creación.' });
      }
    }

    const {
      id,
      publicCode,
      name,
      entityType = 'shop',
      email,
      password,
      username,
      displayName,
      subscriptionDays = 30,
      isIndefinite = false
    } = req.body || {};
    if (!isId(id) || publicCode !== id || !isId(publicCode)
      || typeof name !== 'string' || !name.trim() || name.length > 120
      || typeof displayName !== 'string' || !displayName.trim() || displayName.length > 120
      || !isEmail(email) || !isUsername(username)
    ) {
      return res.status(400).json({ error: 'Se requieren ID, código público, nombres y un correo válido.' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }
    if (!['shop', 'independent'].includes(entityType)) {
      return res.status(400).json({ error: 'El tipo de cuenta no es válido.' });
    }
    if (typeof isIndefinite !== 'boolean'
      || (!isIndefinite && !isValidSubscriptionDays(subscriptionDays))
    ) {
      return res.status(400).json({ error: 'El plan de suscripción no es válido.' });
    }
    const now = new Date();
    const expiresAt = isIndefinite
      ? null
      : new Date(now.getTime() + subscriptionDays * DAY_MS).toISOString();
    await serviceRequest('tenants', {
      method: 'POST',
      headers: { Prefer: 'return=minimal', ...auditActorHeaders(caller) },
      body: JSON.stringify({
        id,
        public_code: publicCode,
        name: name.trim(),
        entity_type: entityType,
        expires_at: expiresAt,
        is_indefinite: isIndefinite,
        app_settings: entityType === 'independent' ? {
          independentServices: {
            [id]: [{ id: 'si1', nombre: 'Corte Ejecutivo Solo', precio: 30000, duracion: '30 min' }]
          }
        } : {}
      })
    });
    createdTenantId = id;

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
      const error = new Error('No se pudo crear la cuenta. Verifica que el correo no esté registrado.');
      error.status = 400;
      throw error;
    }
    createdUserId = authData.id;

    const role = entityType === 'independent' ? 'independent' : 'admin';
    await serviceRequest('user_profiles', {
      method: 'POST',
      headers: { Prefer: 'return=minimal', ...auditActorHeaders(caller) },
      body: JSON.stringify({
        id: authData.id,
        role,
        display_name: displayName.trim(),
        username: username?.trim().toLowerCase() || null,
        tenant_id: id,
        entity_id: id,
        password_changed_at: now.toISOString(),
        last_active_at: null
      })
    });

    if (entityType === 'independent') {
      await serviceRequest('booking_entities', {
        method: 'POST',
        headers: { Prefer: 'return=minimal', ...auditActorHeaders(caller) },
        body: JSON.stringify({
          id,
          tenant_id: id,
          entity_type: 'independent',
          name: name.trim(),
          user_id: authData.id,
          expires_at: expiresAt,
          is_indefinite: isIndefinite,
          password_changed_at: now.toISOString(),
          last_active_at: null
        })
      });
    }

    return res.status(201).json({ userId: authData.id, tenantId: id });
  } catch (error) {
    if (createdUserId) {
      try {
        const cleanupResponse = await fetch(`${getSupabaseUrl()}/auth/v1/admin/users/${encodeURIComponent(createdUserId)}`, {
          method: 'DELETE',
          headers: {
            apikey: getServiceRoleKey(),
            Authorization: `Bearer ${getServiceRoleKey()}`
          }
        });
        if (!cleanupResponse.ok) console.error('Tenant auth-user rollback failed:', cleanupResponse.status);
      } catch (cleanupError) {
        console.error('Tenant auth-user rollback failed:', cleanupError.message);
      }
    }
    if (createdTenantId) {
      try {
        await serviceRequest(`tenants?id=eq.${encodeURIComponent(createdTenantId)}`, {
          method: 'DELETE',
          headers: auditActorHeaders(caller)
        });
      } catch (cleanupError) {
        console.error('Tenant database rollback failed:', cleanupError.message);
      }
    }
    console.error('Tenant creation failed:', error.message);
    if (error.status === 409) {
      return res.status(409).json({ error: 'El correo, usuario o ID ya está registrado.' });
    }
    if (error.status === 400) return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: 'No se pudo crear la sede o el perfil independiente.' });
  }
};
