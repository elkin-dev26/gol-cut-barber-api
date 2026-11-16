const {
  authenticateStaff,
  isConfigured,
  serviceRequest
} = require('../../lib/supabase-server');

const normalizePhone = (value) => {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
};

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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
    if (!caller) return res.status(401).json({ error: 'Primero inicia sesión con una cuenta del equipo.' });

    const { entityId, email, whatsappPhone } = req.body || {};
    if (typeof entityId !== 'string' || !entityId || !isEmail(email)
      || typeof whatsappPhone !== 'string' || !whatsappPhone.trim()
    ) {
      return res.status(400).json({ error: 'Se requiere un ID de perfil y un correo válido.' });
    }

    const entities = await serviceRequest(
      `booking_entities?select=id,tenant_id,user_id&id=eq.${encodeURIComponent(entityId)}&limit=1`
    );
    const entity = entities?.[0];
    if (!entity) return res.status(404).json({ error: 'No se encontró el perfil de reservas.' });

    const isOwner = entity.user_id === caller.id;
    const canManage = caller.role === 'developer'
      || (caller.role === 'admin' && caller.tenant_id === entity.tenant_id);
    if (!isOwner && !canManage) return res.status(403).json({ error: 'No tienes permiso para actualizar este contacto.' });
    if (caller.role !== 'developer') {
      const tenants = await serviceRequest(
        `tenants?select=license_status,developer_blocked&id=eq.${encodeURIComponent(entity.tenant_id)}&limit=1`
      );
      if (!tenants?.[0] || tenants[0].license_status !== 'active' || tenants[0].developer_blocked) {
        return res.status(403).json({ error: 'La cuenta está bloqueada y no puede actualizar su perfil.' });
      }
    }

    const phone = normalizePhone(whatsappPhone);
    if (!phone) {
      return res.status(400).json({ error: 'Ingresa el WhatsApp con código de país.' });
    }

    const updated = await serviceRequest(
      `booking_entities?id=eq.${encodeURIComponent(entityId)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          contact_email: email.trim().toLowerCase(),
          whatsapp_phone: phone,
          updated_at: new Date().toISOString()
        })
      }
    );

    return res.status(200).json({ contact: updated?.[0] });
  } catch (error) {
    console.error('Contact update failed:', error.message);
    return res.status(500).json({ error: 'No se pudo actualizar la información de contacto.' });
  }
};
