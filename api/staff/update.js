const {
  authenticateStaff,
  auditActorHeaders,
  isConfigured,
  serviceRequest
} = require('../../lib/supabase-server');
const { isValidSubscriptionDays } = require('../../lib/subscriptions');

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

    const {
      entityId,
      accessBlocked,
      billingCycleDays,
      subscriptionDays,
      isIndefinite
    } = req.body || {};
    const hasSubscriptionUpdate = subscriptionDays !== undefined || isIndefinite !== undefined || billingCycleDays !== undefined;
    if (!isId(entityId)) return res.status(400).json({ error: 'Se requiere un ID de barbero válido.' });
    if (accessBlocked !== undefined && typeof accessBlocked !== 'boolean') {
      return res.status(400).json({ error: 'El estado del bloqueo no es válido.' });
    }
    if (hasSubscriptionUpdate && caller.role !== 'developer') {
      return res.status(403).json({ error: 'Solo el desarrollador puede cambiar planes de suscripción.' });
    }
    if (billingCycleDays !== undefined
      || (hasSubscriptionUpdate && (
        typeof isIndefinite !== 'boolean'
        || (!isIndefinite && !isValidSubscriptionDays(subscriptionDays))
      ))
    ) {
      return res.status(400).json({ error: 'El plan de suscripción no es válido.' });
    }
    if (accessBlocked === undefined && !hasSubscriptionUpdate) {
      return res.status(400).json({ error: 'No se enviaron cambios válidos.' });
    }

    const entities = await serviceRequest(
      `booking_entities?select=id,tenant_id,entity_type,active,access_blocked,billing_cycle_days,billing_cycle_started_at,expires_at,is_indefinite&id=eq.${encodeURIComponent(entityId)}&limit=1`
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

    const updates = { updated_at: new Date().toISOString() };
    if (accessBlocked === true) updates.access_blocked = true;
    if (accessBlocked === false) {
      updates.active = true;
      updates.access_blocked = false;
    }

    let updatedEntity = entity;
    if (hasSubscriptionUpdate) {
      updatedEntity = await serviceRequest('rpc/renew_subscription', {
        method: 'POST',
        headers: auditActorHeaders(caller),
        body: JSON.stringify({
          target_kind: 'booking_entity',
          target_id: entityId,
          subscription_days: isIndefinite ? null : subscriptionDays,
          make_indefinite: isIndefinite
        })
      });
    }
    if (accessBlocked !== undefined) {
      const updated = await serviceRequest(`booking_entities?id=eq.${encodeURIComponent(entityId)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation', ...auditActorHeaders(caller) },
        body: JSON.stringify(updates)
      });
      if (!updated?.length) return res.status(404).json({ error: 'No se encontró el barbero.' });
      updatedEntity = { ...updatedEntity, ...updated[0] };
    } else if (!hasSubscriptionUpdate) {
      return res.status(400).json({ error: 'No se enviaron cambios válidos.' });
    }
    return res.status(200).json({ entity: updatedEntity });
  } catch (error) {
    console.error('Staff account update failed:', error.message);
    return res.status(500).json({ error: 'No se pudo actualizar la cuenta del barbero.' });
  }
};
