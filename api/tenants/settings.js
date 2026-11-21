const {
  authenticateStaff,
  isConfigured,
  serviceRequest
} = require('../../lib/supabase-server');

const isId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const allowedSettings = new Set(['products', 'services', 'incentives', 'chairFeeConfig', 'slotDuration', 'independentServices']);

module.exports = async (req, res) => {
  if (!['GET', 'PATCH'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!isConfigured()) {
    return res.status(503).json({ error: 'El servidor no tiene configuradas las credenciales de Supabase.' });
  }

  res.setHeader('Cache-Control', 'no-store');
  try {
    const caller = await authenticateStaff(req);
    if (!caller || !['admin', 'developer', 'independent'].includes(caller.role)) {
      return res.status(403).json({ error: 'No tienes permiso para consultar esta configuración.' });
    }

    const id = req.method === 'GET' ? String(req.query?.id || '') : req.body?.id;
    if (!isId(id)) return res.status(400).json({ error: 'Se requiere un ID de sede válido.' });
    if (['admin', 'independent'].includes(caller.role) && caller.tenant_id !== id) {
      return res.status(403).json({ error: 'Solo puedes modificar la configuración de tu propia sede.' });
    }

    if (req.method === 'GET') {
      const tenants = await serviceRequest(
        `tenants?select=id,app_settings&id=eq.${encodeURIComponent(id)}&limit=1`
      );
      if (!tenants?.[0]) return res.status(404).json({ error: 'No se encontró la sede.' });
      const settings = tenants[0].app_settings || {};
      if (caller.role === 'independent') {
        return res.status(200).json({
          settings: {
            independentServices: {
              [caller.entity_id]: settings.independentServices?.[caller.entity_id] || []
            }
          }
        });
      }
      return res.status(200).json({ settings });
    }

    const settings = req.body?.settings;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return res.status(400).json({ error: 'La configuración enviada no es válida.' });
    }
    const keys = Object.keys(settings);
    if (!keys.length || keys.some(key => !allowedSettings.has(key)) || Buffer.byteLength(JSON.stringify(settings), 'utf8') > 200000) {
      return res.status(400).json({ error: 'La configuración contiene campos no permitidos o supera el tamaño máximo.' });
    }
    if (caller.role === 'independent') {
      const servicesByEntity = settings.independentServices;
      if (keys.length !== 1
        || !servicesByEntity
        || typeof servicesByEntity !== 'object'
        || Array.isArray(servicesByEntity)
        || Object.keys(servicesByEntity).some(entityId => entityId !== caller.entity_id)
        || !Array.isArray(servicesByEntity[caller.entity_id])
      ) {
        return res.status(403).json({ error: 'Solo puedes guardar los servicios de tu perfil independiente.' });
      }
    }

    const updated = await serviceRequest('rpc/update_tenant_app_settings', {
      method: 'POST',
      body: JSON.stringify({ target_tenant_id: id, settings_patch: settings })
    });
    if (!updated) return res.status(404).json({ error: 'No se encontró la sede.' });
    return res.status(200).json({ settings: Array.isArray(updated) ? updated[0] : updated });
  } catch (error) {
    console.error('Tenant settings update failed:', error.message);
    return res.status(500).json({ error: 'No se pudo guardar la configuración de la sede.' });
  }
};
