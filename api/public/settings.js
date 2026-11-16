const { isConfigured, serviceRequest } = require('../../lib/supabase-server');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!isConfigured()) {
    return res.status(503).json({ error: 'El servidor no tiene configuradas las credenciales de Supabase.' });
  }

  res.setHeader('Cache-Control', 'no-store');
  try {
    const settings = await serviceRequest(
      'platform_settings?select=platform_name,support_whatsapp,renewal_message&id=eq.global&limit=1'
    );
    if (!settings?.[0]) return res.status(404).json({ error: 'No se configuraron los ajustes de la plataforma.' });
    return res.status(200).json({ settings: settings[0] });
  } catch (error) {
    console.error('Platform settings lookup failed:', error.message);
    return res.status(500).json({ error: 'No se pudo cargar la configuración de la plataforma.' });
  }
};
