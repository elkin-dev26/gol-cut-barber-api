const {
  authenticateStaff,
  isConfigured,
  serviceRequest
} = require('../../lib/supabase-server');

const isId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!isConfigured()) {
    return res.status(503).json({ error: 'El servidor no tiene configuradas las credenciales de Supabase.' });
  }

  try {
    const caller = await authenticateStaff(req);
    if (!caller || !['admin', 'developer'].includes(caller.role)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta cuenta.' });
    }

    const { entityId, accessBlocked, billingCycleDays } = req.body || {};
    if (!isId(entityId)) return res.status(400).json({ error: 'Se requiere un ID de barbero válido.' });
    if (accessBlocked !== undefined && typeof accessBlocked !== 'boolean') {
      return res.status(400).json({ error: 'El estado del bloqueo no es válido.' });
    }
    if (billingCycleDays !== undefined && ![8, 15, 30].includes(billingCycleDays)) {
      return res.status(400).json({ error: 'El ciclo debe ser de 8, 15 o 30 días.' });
    }
    if (accessBlocked === undefined && billingCycleDays === undefined) {
      return res.status(400).json({ error: 'No se enviaron cambios válidos.' });
    }

    const entities = await serviceRequest(
      `booking_entities?select=id,tenant_id,entity_type,active,access_blocked,billing_cycle_days,billing_cycle_started_at&id=eq.${encodeURIComponent(entityId)}&limit=1`
    );
    const entity = entities?.[0];
    if (!entity || !['barber', 'independent'].includes(entity.entity_type)) {
      return res.status(404).json({ error: 'No se encontró el perfil de trabajo.' });
    }
    if (entity.entity_type === 'independent' && caller.role !== 'developer') {
      return res.status(403).json({ error: 'Solo el desarrollador puede modificar el ciclo de un perfil independiente.' });
    }
    if (caller.role === 'admin' && caller.tenant_id !== entity.tenant_id) {
      return res.status(403).json({ error: 'Solo puedes modificar barberos de tu propia sede.' });
    }

    const now = new Date();
    const cycleExpiresAt = new Date(entity.billing_cycle_started_at).getTime()
      + Number(entity.billing_cycle_days) * 24 * 60 * 60 * 1000;
    const updates = { updated_at: now.toISOString() };

    if (billingCycleDays !== undefined) {
      updates.billing_cycle_days = billingCycleDays;
      updates.billing_cycle_started_at = now.toISOString();
      if (entity.access_blocked || cycleExpiresAt <= now.getTime()) {
        updates.access_blocked = true;
      }
    }
    if (accessBlocked === true) updates.access_blocked = true;
    if (accessBlocked === false) {
      updates.active = true;
      updates.access_blocked = false;
      updates.billing_cycle_started_at = now.toISOString();
    }

    const updated = await serviceRequest(`booking_entities?id=eq.${encodeURIComponent(entityId)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(updates)
    });
    if (!updated?.length) return res.status(404).json({ error: 'No se encontró el barbero.' });
    return res.status(200).json({ entity: updated[0] });
  } catch (error) {
    console.error('Staff account update failed:', error.message);
    return res.status(500).json({ error: 'No se pudo actualizar la cuenta del barbero.' });
  }
};
