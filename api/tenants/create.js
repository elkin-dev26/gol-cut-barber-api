const {
  authenticateStaff,
  getSupabaseUrl,
  isConfigured,
  serviceRequest
} = require('../../lib/supabase-server');

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

    const {
      id,
      publicCode,
      name,
      entityType = 'shop',
      email,
      password,
      username,
      displayName,
      whatsappPhone
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
    const phoneDigits = typeof whatsappPhone === 'string' ? whatsappPhone.replace(/\D/g, '') : '';
    if (entityType === 'independent' && (phoneDigits.length < 8 || phoneDigits.length > 15)) {
      return res.status(400).json({ error: 'Ingresa el WhatsApp del barbero con código de país.' });
    }

    await serviceRequest('tenants', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        id,
        public_code: publicCode,
        name: name.trim(),
        entity_type: entityType
      })
    });
    createdTenantId = id;

    const authResponse = await fetch(`${getSupabaseUrl()}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
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
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        id: authData.id,
        role,
        display_name: displayName.trim(),
        username: username?.trim().toLowerCase() || null,
        tenant_id: id,
        entity_id: id
      })
    });

    if (entityType === 'independent') {
      await serviceRequest('booking_entities', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          id,
          tenant_id: id,
          entity_type: 'independent',
          name: name.trim(),
          user_id: authData.id,
          contact_email: email.trim().toLowerCase(),
          whatsapp_phone: phoneDigits ? `+${phoneDigits}` : null
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
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          }
        });
        if (!cleanupResponse.ok) console.error('Tenant auth-user rollback failed:', cleanupResponse.status);
      } catch (cleanupError) {
        console.error('Tenant auth-user rollback failed:', cleanupError.message);
      }
    }
    if (createdTenantId) {
      try {
        await serviceRequest(`tenants?id=eq.${encodeURIComponent(createdTenantId)}`, { method: 'DELETE' });
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
