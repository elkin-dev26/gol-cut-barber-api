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
const escapeText = (value) => String(value).replace(/[&<>"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
}[character]));

const sendWhatsApp = async (phone, appointment, entityName) => {
  const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TEMPLATE_NAME, WHATSAPP_API_VERSION } = process.env;
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_TEMPLATE_NAME || !WHATSAPP_API_VERSION) {
    return { status: 'failed', error: 'WhatsApp is not configured.' };
  }

  const response = await fetch(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: WHATSAPP_TEMPLATE_NAME,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'es' },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: entityName },
            { type: 'text', text: appointment.customer_name },
            { type: 'text', text: appointment.service_name },
            { type: 'text', text: appointment.appointment_date },
            { type: 'text', text: appointment.appointment_time }
          ]
        }]
      }
    })
  });

  if (!response.ok) return { status: 'failed', error: `WhatsApp provider returned HTTP ${response.status}.` };
  return { status: 'sent' };
};

const sendEmail = async (email, appointment, entityName) => {
  const { RESEND_API_KEY, EMAIL_FROM } = process.env;
  if (!RESEND_API_KEY || !EMAIL_FROM) return { status: 'failed', error: 'Email is not configured.' };

  const lines = [
    `Nueva cita para ${entityName}`,
    `Cliente: ${appointment.customer_name}`,
    `Servicio: ${appointment.service_name}`,
    `Fecha: ${appointment.appointment_date}`,
    `Hora: ${appointment.appointment_time}`
  ];
  const html = `<h2>Nueva cita para ${escapeText(entityName)}</h2><p><strong>Cliente:</strong> ${escapeText(appointment.customer_name)}</p><p><strong>Servicio:</strong> ${escapeText(appointment.service_name)}</p><p><strong>Fecha:</strong> ${escapeText(appointment.appointment_date)}</p><p><strong>Hora:</strong> ${escapeText(appointment.appointment_time)}</p>`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [email],
      subject: `Nueva cita: ${appointment.customer_name}`,
      text: lines.join('\n'),
      html
    })
  });

  if (!response.ok) return { status: 'failed', error: `Email provider returned HTTP ${response.status}.` };
  return { status: 'sent' };
};

const attemptDelivery = async (deliver) => {
  try {
    return await deliver();
  } catch (error) {
    console.error('Appointment notification delivery failed:', error.message);
    return { status: 'failed', error: 'Delivery request failed.' };
  }
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
      `booking_entities?select=id,tenant_id,entity_type,name,contact_email,whatsapp_phone,active&id=eq.${encodeURIComponent(entityId)}&limit=1`
    );
    const entity = entities?.[0];
    if (!entity || !entity.active) return res.status(404).json({ error: 'Este perfil no está disponible para reservas.' });

    const tenants = await serviceRequest(
      `tenants?select=id,name,license_status,developer_blocked&id=eq.${encodeURIComponent(entity.tenant_id)}&limit=1`
    );
    const tenant = tenants?.[0];
    if (!tenant || tenant.license_status !== 'active' || tenant.developer_blocked) {
      return res.status(409).json({ error: 'Este perfil no está disponible actualmente.' });
    }

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
    }

    const existing = await serviceRequest(
      `booking_notifications?select=status,whatsapp_status,email_status,updated_at&appointment_id=eq.${encodeURIComponent(appointmentId)}&limit=1`
    );
    let claim;
    if (existing?.[0]?.status === 'sending') {
      const staleBefore = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      if (new Date(existing[0].updated_at).getTime() > Date.now() - 10 * 60 * 1000) {
        return res.status(202).json({ appointmentId, message: 'Los avisos de esta cita ya se están procesando.' });
      }
      claim = await serviceRequest(
        `booking_notifications?appointment_id=eq.${encodeURIComponent(appointmentId)}&status=eq.sending&updated_at=lt.${encodeURIComponent(staleBefore)}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ updated_at: new Date().toISOString() })
        }
      );
      if (!claim?.length) {
        return res.status(202).json({ appointmentId, message: 'Los avisos de esta cita ya se están procesando.' });
      }
    } else if (existing?.[0] && existing[0].status !== 'failed') {
      return res.status(200).json({
        appointmentId,
        notifications: {
          status: existing[0].status,
          whatsapp: existing[0].whatsapp_status,
          email: existing[0].email_status
        },
        duplicate: true
      });
    }

    if (!claim && existing?.[0]?.status === 'failed') {
      claim = await serviceRequest(
        `booking_notifications?appointment_id=eq.${encodeURIComponent(appointmentId)}&status=eq.failed`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ status: 'sending', updated_at: new Date().toISOString() })
        }
      );
    } else if (!claim) {
      claim = await serviceRequest('booking_notifications?on_conflict=appointment_id', {
        method: 'POST',
        headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
        body: JSON.stringify({ appointment_id: appointmentId, status: 'sending' })
      });
    }
    if (!claim?.length) {
      return res.status(202).json({ appointmentId, message: 'Los avisos de esta cita ya se están procesando.' });
    }

    const [whatsappResult, emailResult] = await Promise.all([
      entity.whatsapp_phone
        ? attemptDelivery(() => sendWhatsApp(entity.whatsapp_phone, appointment, entity.name))
        : Promise.resolve({ status: 'skipped', error: 'WhatsApp contact is not set.' }),
      entity.contact_email
        ? attemptDelivery(() => sendEmail(entity.contact_email, appointment, entity.name))
        : Promise.resolve({ status: 'skipped', error: 'Email contact is not set.' })
    ]);
    const statuses = [whatsappResult.status, emailResult.status];
    const sentCount = statuses.filter(status => status === 'sent').length;
    const status = sentCount === statuses.length ? 'sent' : sentCount > 0 ? 'partial' : 'failed';
    const errors = [whatsappResult.error, emailResult.error].filter(Boolean);

    await serviceRequest(`booking_notifications?appointment_id=eq.${encodeURIComponent(appointmentId)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        status,
        whatsapp_status: whatsappResult.status,
        email_status: emailResult.status,
        error_message: errors.join(' ').slice(0, 1000) || null,
        updated_at: new Date().toISOString()
      })
    });

    return res.status(200).json({
      appointmentId,
      notifications: {
        status,
        whatsapp: whatsappResult.status,
        email: emailResult.status
      },
      message: status === 'sent'
        ? 'La cita se guardó y se enviaron los avisos.'
        : 'La cita se guardó, pero no se pudieron enviar todos los avisos.'
    });
  } catch (error) {
    console.error('Appointment notification failed:', error.message);
    return res.status(500).json({ error: 'La cita pudo guardarse, pero no se pudo confirmar el envío de los avisos. Revisa antes de volver a intentarlo.' });
  }
};
