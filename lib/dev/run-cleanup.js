const { authenticateStaff, isConfigured, serviceRequest } = require('../supabase-server');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!isConfigured()) {
    return res.status(503).json({ error: 'El servidor no tiene configuradas las credenciales de Supabase.' });
  }

  try {
    const caller = await authenticateStaff(req);
    if (!caller) return res.status(401).json({ error: 'Inicia sesión con una cuenta habilitada.' });
    if (caller.role !== 'developer') {
      return res.status(403).json({ error: 'Solo el desarrollador puede ejecutar la limpieza.' });
    }

    await serviceRequest('rpc/run_quarterly_cleanup', {
      method: 'POST',
      body: JSON.stringify({ force_run: true })
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Manual cleanup failed:', error.message);
    return res.status(500).json({ error: 'No se pudo ejecutar la limpieza.' });
  }
};
