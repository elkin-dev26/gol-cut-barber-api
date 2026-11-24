const {
  authenticateStaff,
  auditActorHeaders,
  getSupabaseUrl,
  isConfigured,
  serviceRequest
} = require('../../lib/supabase-server');
const { DAY_MS } = require('../../lib/subscriptions');
const { touchPasswordChangedAt, touchStaffActivity } = require('../../lib/staff-activity');

const isUserId = (value) => typeof value === 'string'
  && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!isConfigured()) {
    return res.status(503).json({ error: 'El servidor no tiene configuradas las credenciales de Supabase.' });
  }

  try {
    const { userId, password, action } = req.body || {};
    const caller = await authenticateStaff(req, { allowInactive: action === 'activity' });
    if (!caller) return res.status(401).json({ error: 'Inicia sesión con una cuenta habilitada.' });

    if (action === 'activity') {
      const timestamp = await touchStaffActivity({
        userId: caller.id,
        entityId: caller.entity_id,
        entityType: caller.role
      });
      return res.status(200).json({ lastActiveAt: timestamp });
    }

    if (action === 'password-updated') {
      if (!['admin', 'barber', 'independent', 'developer'].includes(caller.role)) {
        return res.status(403).json({ error: 'Esta cuenta no puede cambiar su contraseña.' });
      }
      if (caller.role === 'barber') {
        const passwordChangedAt = Date.parse(caller.password_changed_at || caller.created_at || '');
        if (!Number.isFinite(passwordChangedAt) || Date.now() - passwordChangedAt < 90 * DAY_MS) {
          return res.status(403).json({ error: 'El cambio de contraseña estará disponible al cumplir 90 días.' });
        }
      }
      const timestamp = await touchPasswordChangedAt({
        userId: caller.id,
        entityId: caller.entity_id,
        entityType: caller.role,
        actor: caller
      });
      return res.status(200).json({ passwordChangedAt: timestamp });
    }

    if (caller.role !== 'developer') {
      return res.status(403).json({ error: 'Solo el desarrollador puede restablecer estas claves.' });
    }
    if (!isUserId(userId) || !['reset', 'revoke', 'activate'].includes(action)) {
      return res.status(400).json({ error: 'La cuenta o la acción solicitada no es válida.' });
    }
    if (action === 'reset' && (typeof password !== 'string' || password.length < 8)) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }
    const profiles = await serviceRequest(
      `user_profiles?select=id,role,entity_id&id=eq.${encodeURIComponent(userId)}&limit=1`
    );
    if (!profiles?.[0] || profiles[0].role === 'developer') {
      return res.status(404).json({ error: 'No se encontró una cuenta que pueda ser restablecida.' });
    }

    const authPayload = action === 'reset'
      ? { password }
      : { ban_duration: action === 'revoke' ? '876000h' : 'none' };
    const updateProfileAccess = () => serviceRequest(`user_profiles?id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal', ...auditActorHeaders(caller) },
      body: JSON.stringify({ disabled_at: action === 'revoke' ? new Date().toISOString() : null })
    });
    if (action === 'revoke') await updateProfileAccess();
    const response = await fetch(`${getSupabaseUrl()}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authPayload)
    });
    if (!response.ok) {
      console.error('Credential operation failed:', response.status);
      return res.status(400).json({ error: 'Supabase no pudo completar el cambio de acceso.' });
    }

    let passwordChangedAt;
    if (action === 'reset') {
      passwordChangedAt = await touchPasswordChangedAt({
        userId,
        entityId: profiles[0].entity_id,
        entityType: profiles[0].role,
        actor: caller
      });
    }
    if (action === 'activate') await updateProfileAccess();
    return res.status(200).json({
      userId,
      action,
      ...(passwordChangedAt ? { passwordChangedAt } : {})
    });
  } catch (error) {
    console.error('Credential reset failed:', error.message);
    return res.status(500).json({ error: 'No se pudo restablecer la contraseña.' });
  }
};
