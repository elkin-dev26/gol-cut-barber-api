const {
  authenticateStaff,
  auditActorHeaders,
  isConfigured,
  serviceRequest
} = require('../supabase-server');
const { isValidSubscriptionDays } = require('../subscriptions');
const isId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const isIsoDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const isValidBlackout = (item) => (
  item
  && typeof item === 'object'
  && isIsoDate(item.date)
  && ['Mañana', 'Tarde', 'Noche', 'Día completo'].includes(item.shift)
);

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
    const {
      id,
      name,
      licenseStatus,
      developerBlocked,
      bookingBlackouts,
      subscriptionDays,
      isIndefinite
    } = req.body || {};
    const hasSubscriptionUpdate = subscriptionDays !== undefined || isIndefinite !== undefined;
    if (!caller || !['admin', 'developer'].includes(caller.role)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta sede.' });
    }
    if (!isId(id)) return res.status(400).json({ error: 'Se requiere un ID de sede válido.' });
    if (hasSubscriptionUpdate && caller.role !== 'developer') {
      return res.status(403).json({ error: 'Solo el desarrollador puede cambiar planes de suscripción.' });
    }
    if (hasSubscriptionUpdate && (
      typeof isIndefinite !== 'boolean'
      || (!isIndefinite && !isValidSubscriptionDays(subscriptionDays))
    )) {
      return res.status(400).json({ error: 'El plan de suscripción no es válido.' });
    }
    if (caller.role === 'admin') {
      if (caller.tenant_id !== id || licenseStatus !== undefined || developerBlocked !== undefined) {
        return res.status(403).json({ error: 'Los administradores solo pueden cambiar el nombre de su propia sede activa.' });
      }
      const tenants = await serviceRequest(
        `tenants?select=license_status,developer_blocked&id=eq.${encodeURIComponent(id)}&limit=1`
      );
      if (!tenants?.[0] || tenants[0].license_status !== 'active' || tenants[0].developer_blocked) {
        return res.status(403).json({ error: 'La sede está bloqueada y no puede modificarse.' });
      }
    }
    const updates = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'El nombre de la sede no puede estar vacío.' });
      }
      updates.name = name.trim();
    }
    if (licenseStatus !== undefined) {
      if (!['active', 'paused'].includes(licenseStatus)) {
        return res.status(400).json({ error: 'El estado de licencia no es válido.' });
      }
      updates.license_status = licenseStatus;
    }
    if (developerBlocked !== undefined) {
      if (typeof developerBlocked !== 'boolean') {
        return res.status(400).json({ error: 'El bloqueo de mantenimiento debe ser verdadero o falso.' });
      }
      updates.developer_blocked = developerBlocked;
    }
    if (bookingBlackouts !== undefined) {
      if (!Array.isArray(bookingBlackouts) || bookingBlackouts.length > 100 || !bookingBlackouts.every(isValidBlackout)) {
        return res.status(400).json({ error: 'La lista de cierres contiene fechas o turnos no válidos.' });
      }
      const uniqueBlackouts = new Set(bookingBlackouts.map(item => `${item.date}:${item.shift}`));
      if (uniqueBlackouts.size !== bookingBlackouts.length) {
        return res.status(400).json({ error: 'No se pueden registrar cierres duplicados.' });
      }
      updates.booking_blackouts = bookingBlackouts;
    }
    if (Object.keys(updates).length === 0 && !hasSubscriptionUpdate) {
      return res.status(400).json({ error: 'No se enviaron campos de sede válidos.' });
    }

    let tenant;
    if (Object.keys(updates).length) {
      const updated = await serviceRequest(`tenants?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation', ...auditActorHeaders(caller) },
        body: JSON.stringify(updates)
      });
      tenant = updated?.[0];
      if (!tenant) return res.status(404).json({ error: 'No se encontró la sede.' });
    }
    if (hasSubscriptionUpdate) {
      const tenantRows = await serviceRequest(
        `tenants?select=id,entity_type,expires_at,is_indefinite&id=eq.${encodeURIComponent(id)}&limit=1`
      );
      const currentTenant = tenantRows?.[0];
      if (!currentTenant) return res.status(404).json({ error: 'No se encontró la sede.' });
      const targetKind = currentTenant.entity_type === 'independent' ? 'booking_entity' : 'tenant';
      const subscription = await serviceRequest('rpc/renew_subscription', {
        method: 'POST',
        headers: auditActorHeaders(caller),
        body: JSON.stringify({
          target_kind: targetKind,
          target_id: id,
          subscription_days: isIndefinite ? null : subscriptionDays,
          make_indefinite: isIndefinite
        })
      });
      tenant = targetKind === 'tenant'
        ? subscription
        : { ...tenant, ...currentTenant, expires_at: subscription.expires_at, is_indefinite: subscription.is_indefinite };
    }
    let entity;
    if (tenant?.entity_type === 'independent') {
      const entityUpdates = {
        ...(updates.name ? { name: updates.name, updated_at: new Date().toISOString() } : {}),
        ...(hasSubscriptionUpdate ? {
          expires_at: tenant.expires_at,
          is_indefinite: tenant.is_indefinite
        } : {})
      };
      if (Object.keys(entityUpdates).length && !hasSubscriptionUpdate) {
        const updatedEntities = await serviceRequest(
          `booking_entities?tenant_id=eq.${encodeURIComponent(id)}&entity_type=eq.independent`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=representation', ...auditActorHeaders(caller) },
            body: JSON.stringify(entityUpdates)
          }
        );
        entity = updatedEntities?.[0];
      } else if (hasSubscriptionUpdate) {
        const entities = await serviceRequest(
          `booking_entities?select=id,tenant_id,entity_type,name,expires_at,is_indefinite&id=eq.${encodeURIComponent(id)}&entity_type=eq.independent&limit=1`
        );
        entity = entities?.[0];
        if (updates.name && entity) {
          const updatedEntities = await serviceRequest(
            `booking_entities?id=eq.${encodeURIComponent(id)}&entity_type=eq.independent`,
            {
              method: 'PATCH',
              headers: { Prefer: 'return=representation', ...auditActorHeaders(caller) },
              body: JSON.stringify({ name: updates.name, updated_at: new Date().toISOString() })
            }
          );
          entity = updatedEntities?.[0] || entity;
        }
      }
    }
    return res.status(200).json({ tenant, ...(entity ? { entity } : {}) });
  } catch (error) {
    console.error('Tenant update failed:', error.message);
    return res.status(500).json({ error: 'No se pudo actualizar la sede.' });
  }
};
