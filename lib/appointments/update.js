const {
  authenticateStaff,
  auditActorHeaders,
  isConfigured,
  serviceRequest
} = require('../supabase-server');
const { isSubscriptionExpired } = require('../subscriptions');

const isId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);

module.exports = async (req, res) => {
  if (!['PATCH', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'PATCH, DELETE');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!isConfigured()) {
    return res.status(503).json({ error: 'El servidor no tiene configuradas las credenciales de Supabase.' });
  }

  try {
    const caller = await authenticateStaff(req);
    if (!caller) return res.status(401).json({ error: 'Primero inicia sesión con una cuenta habilitada.' });

    const appointmentId = req.method === 'DELETE'
      ? String(req.query?.id || '')
      : req.body?.appointmentId;
    if (!isId(appointmentId)) return res.status(400).json({ error: 'Se requiere un ID de cita válido.' });

    const appointments = await serviceRequest(
      `appointments?select=id,tenant_id,booking_entity_id&id=eq.${encodeURIComponent(appointmentId)}&limit=1`
    );
    const appointment = appointments?.[0];
    if (!appointment) return res.status(404).json({ error: 'No se encontró la cita.' });

    const canManageTenant = caller.role === 'developer'
      || (caller.role === 'admin' && caller.tenant_id === appointment.tenant_id);
    const ownsAppointment = ['barber', 'independent'].includes(caller.role)
      && caller.entity_id === appointment.booking_entity_id;
    if (!canManageTenant && !ownsAppointment) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta cita.' });
    }

    if (req.method === 'DELETE') {
      await serviceRequest(`appointments?id=eq.${encodeURIComponent(appointmentId)}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal', ...auditActorHeaders(caller) }
      });
      return res.status(200).json({ appointmentId, deleted: true });
    }

    const { status, bookingEntityId, cancellationReason } = req.body || {};
    const updates = {};
    if (status !== undefined) {
      const statuses = { confirmada: 'confirmed', completada: 'completed', cancelada: 'cancelled' };
      if (!Object.prototype.hasOwnProperty.call(statuses, status)) {
        return res.status(400).json({ error: 'El estado de la cita no es válido.' });
      }
      updates.status = statuses[status];
    }
    if (cancellationReason !== undefined) {
      if (typeof cancellationReason !== 'string' || cancellationReason.length > 300) {
        return res.status(400).json({ error: 'El motivo de cancelación no es válido.' });
      }
      updates.cancellation_reason = cancellationReason.trim();
    }
    if (bookingEntityId !== undefined) {
      if (!canManageTenant || !isId(bookingEntityId)) {
        return res.status(403).json({ error: 'No tienes permiso para reasignar esta cita.' });
      }
      const entities = await serviceRequest(
        `booking_entities?select=id,tenant_id,entity_type,active,access_blocked,billing_cycle_days,billing_cycle_started_at,expires_at,is_indefinite,user_id&id=eq.${encodeURIComponent(bookingEntityId)}&limit=1`
      );
      const target = entities?.[0];
      const targetUserProfiles = target?.user_id
        ? await serviceRequest(`user_profiles?select=disabled_at&id=eq.${encodeURIComponent(target.user_id)}&limit=1`)
        : [];
      if (!target
        || target.tenant_id !== appointment.tenant_id
        || target.entity_type !== 'barber'
        || !target.active
        || target.access_blocked
        || isSubscriptionExpired(target)
        || (target.user_id && (!targetUserProfiles?.[0] || targetUserProfiles[0].disabled_at))
      ) {
        return res.status(400).json({ error: 'El barbero seleccionado no está disponible en esta sede.' });
      }
      updates.booking_entity_id = bookingEntityId;
    }
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No se enviaron cambios válidos.' });

    const updated = await serviceRequest(`appointments?id=eq.${encodeURIComponent(appointmentId)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation', ...auditActorHeaders(caller) },
      body: JSON.stringify(updates)
    });
    if (!updated?.length) return res.status(404).json({ error: 'No se encontró la cita.' });
    return res.status(200).json({ appointment: updated[0] });
  } catch (error) {
    console.error('Appointment update failed:', error.message);
    return res.status(500).json({ error: 'No se pudo actualizar la cita.' });
  }
};
