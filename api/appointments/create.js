const { createHash } = require('crypto');
const {
  isConfigured,
  serviceRequest
} = require('../../lib/supabase-server');

const isText = (value, limit) => (
  typeof value === 'string'
  && value.trim().length > 0
  && value.length <= limit
  && !/[\r\n]/.test(value)
);

const isIsoDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const getShift = (value) => {
  const match = typeof value === 'string' && value.match(/^(\d{1,2}):\d{2}\s*(AM|PM)$/i);
  if (!match) return null;
  const hour = Number(match[1]) % 12 + (match[2].toUpperCase() === 'PM' ? 12 : 0);
  if (hour < 13) return 'Mañana';
  if (hour < 17) return 'Tarde';
  return 'Noche';
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!isConfigured()) {
    return res.status(503).json({ error: 'El servidor no tiene configuradas las credenciales de Supabase.' });
  }
  if (process.env.APP_ORIGIN && req.headers.origin && req.headers.origin !== process.env.APP_ORIGIN) {
    return res.status(403).json({ error: 'El origen de esta solicitud no está permitido.' });
  }

  try {
    const {
      appointmentId,
      entityId,
      customerName,
      serviceName,
      appointmentDate,
      appointmentTime,
      price
    } = req.body || {};
    if (
      !isText(appointmentId, 100)
      || !isText(entityId, 100)
      || !isText(customerName, 120)
      || !isText(serviceName, 120)
      || !isIsoDate(appointmentDate)
      || !isText(appointmentTime, 40)
      || typeof price !== 'number'
      || !Number.isFinite(price)
      || price < 0
    ) {
      return res.status(400).json({ error: 'Los datos de la cita están incompletos o no son válidos.' });
    }

    const forwardedFor = req.headers['x-forwarded-for'] || '';
    const clientIp = (
      req.headers['x-real-ip']
      || req.headers['x-vercel-forwarded-for']
      || forwardedFor.split(',').pop()
      || req.socket?.remoteAddress
      || ''
    ).trim();
    if (!clientIp) return res.status(400).json({ error: 'No se pudo verificar la solicitud de reserva.' });

    const rateLimitKey = createHash('sha256').update(`${clientIp}:${entityId}`).digest('hex');
    const rateLimit = await serviceRequest('rpc/consume_booking_rate_limit', {
      method: 'POST',
      body: JSON.stringify({
        rate_key_hash: rateLimitKey,
        max_requests: 8,
        window_seconds: 900
      })
    });
    if (rateLimit !== true) return res.status(429).json({ error: 'Se realizaron demasiados intentos. Inténtalo más tarde.' });

    const entities = await serviceRequest(
      `booking_entities?select=id,tenant_id,active,access_blocked,billing_cycle_days,billing_cycle_started_at,user_id&id=eq.${encodeURIComponent(entityId)}&limit=1`
    );
    const entity = entities?.[0];
    const cycleExpiresAt = entity
      ? new Date(entity.billing_cycle_started_at).getTime() + Number(entity.billing_cycle_days) * 24 * 60 * 60 * 1000
      : 0;
    if (!entity || !entity.active || entity.access_blocked || cycleExpiresAt <= Date.now()) {
      return res.status(404).json({ error: 'Este perfil no está disponible para reservas.' });
    }
    if (entity.user_id) {
      const profiles = await serviceRequest(
        `user_profiles?select=disabled_at&id=eq.${encodeURIComponent(entity.user_id)}&limit=1`
      );
      if (!profiles?.[0] || profiles[0].disabled_at) {
        return res.status(404).json({ error: 'Este perfil no está disponible para reservas.' });
      }
    }

    const tenants = await serviceRequest(
      `tenants?select=id,license_status,developer_blocked,booking_blackouts&id=eq.${encodeURIComponent(entity.tenant_id)}&limit=1`
    );
    const tenant = tenants?.[0];
    if (!tenant || tenant.license_status !== 'active' || tenant.developer_blocked) {
      return res.status(409).json({ error: 'Este perfil no está disponible actualmente.' });
    }
    const shift = getShift(appointmentTime);
    const isBlocked = (tenant.booking_blackouts || []).some(blackout => (
      blackout.date === appointmentDate
      && (blackout.shift === 'Día completo' || (shift && blackout.shift === shift))
    ));
    if (isBlocked) return res.status(409).json({ error: 'La sede no recibe citas en la fecha u horario seleccionado.' });

    const appointment = {
      id: appointmentId,
      tenant_id: entity.tenant_id,
      booking_entity_id: entity.id,
      customer_name: customerName.trim(),
      service_name: serviceName.trim(),
      appointment_date: appointmentDate,
      appointment_time: appointmentTime.trim(),
      price: Number(price)
    };
    const insertedAppointments = await serviceRequest('appointments?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify(appointment)
    });

    if (!insertedAppointments?.length) {
      const previousAppointments = await serviceRequest(
        `appointments?select=tenant_id,booking_entity_id,customer_name,service_name,appointment_date,appointment_time,price&id=eq.${encodeURIComponent(appointmentId)}&limit=1`
      );
      const previousAppointment = previousAppointments?.[0];
      if (!previousAppointment
        || previousAppointment.tenant_id !== appointment.tenant_id
        || previousAppointment.booking_entity_id !== appointment.booking_entity_id
        || previousAppointment.customer_name !== appointment.customer_name
        || previousAppointment.service_name !== appointment.service_name
        || previousAppointment.appointment_date !== appointment.appointment_date
        || previousAppointment.appointment_time !== appointment.appointment_time
        || Number(previousAppointment.price) !== appointment.price
      ) {
        return res.status(409).json({ error: 'El identificador de esta cita ya está en uso.' });
      }

      return res.status(200).json({ appointmentId, duplicate: true });
    }

    return res.status(201).json({ appointmentId, message: 'La cita se guardó correctamente.' });
  } catch (error) {
    console.error('Appointment creation failed:', error.message);
    return res.status(500).json({ error: 'No se pudo registrar la cita.' });
  }
};
