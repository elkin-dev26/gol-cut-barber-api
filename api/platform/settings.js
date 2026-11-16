const {
  authenticateStaff,
  isConfigured,
  serviceRequest
} = require('../../lib/supabase-server');

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
    if (!caller || caller.role !== 'developer') {
      return res.status(403).json({ error: 'Solo el desarrollador puede cambiar la configuración de plataforma.' });
    }

    const { platformName, supportWhatsapp, renewalMessage } = req.body || {};
    const digits = typeof supportWhatsapp === 'string' ? supportWhatsapp.replace(/\D/g, '') : '';
    if (
      typeof platformName !== 'string'
      || !platformName.trim()
      || platformName.trim().length > 80
      || digits.length < 8
      || digits.length > 15
      || typeof renewalMessage !== 'string'
      || !renewalMessage.trim()
      || renewalMessage.length > 500
    ) {
      return res.status(400).json({ error: 'Ingresa un nombre, un WhatsApp válido y un mensaje de soporte.' });
    }

    const settings = await serviceRequest('platform_settings?id=eq.global', {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        platform_name: platformName.trim(),
        support_whatsapp: digits,
        renewal_message: renewalMessage.trim(),
        updated_at: new Date().toISOString()
      })
    });
    if (!settings?.length) return res.status(404).json({ error: 'No se configuraron los ajustes de plataforma.' });
    return res.status(200).json({ settings: settings[0] });
  } catch (error) {
    console.error('Platform settings update failed:', error.message);
    return res.status(500).json({ error: 'No se pudo actualizar la configuración de plataforma.' });
  }
};
