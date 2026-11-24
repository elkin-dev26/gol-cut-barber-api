const {
  authenticateStaff,
  auditActorHeaders,
  isConfigured,
  serviceRequest
} = require('../../lib/supabase-server');

const isId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);

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
    if (!caller || !['admin', 'developer'].includes(caller.role)) {
      return res.status(403).json({ error: 'No tienes permiso para desactivar esta cuenta.' });
    }
    const { entityId } = req.body || {};
    if (!isId(entityId)) return res.status(400).json({ error: 'Se requiere un ID de barbero válido.' });

    const entities = await serviceRequest(
      `booking_entities?select=id,tenant_id,entity_type,user_id&id=eq.${encodeURIComponent(entityId)}&limit=1`
    );
    const entity = entities?.[0];
    if (!entity || entity.entity_type !== 'barber') {
      return res.status(404).json({ error: 'No se encontró el barbero.' });
    }
    if (caller.role === 'admin' && caller.tenant_id !== entity.tenant_id) {
      return res.status(403).json({ error: 'Solo puedes desactivar barberos de tu propia sede.' });
    }

    if (entity.user_id) {
      await serviceRequest(`user_profiles?id=eq.${encodeURIComponent(entity.user_id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal', ...auditActorHeaders(caller) },
        body: JSON.stringify({ disabled_at: new Date().toISOString() })
      });
    } else {
      await serviceRequest(`booking_entities?id=eq.${encodeURIComponent(entityId)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal', ...auditActorHeaders(caller) },
        body: JSON.stringify({ active: false, access_blocked: true, updated_at: new Date().toISOString() })
      });
    }
    return res.status(200).json({ entityId, disabled: true });
  } catch (error) {
    console.error('Staff removal failed:', error.message);
    return res.status(500).json({ error: 'No se pudo desactivar la cuenta del barbero.' });
  }
};
