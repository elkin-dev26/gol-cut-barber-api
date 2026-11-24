const createTenant = require('../../lib/tenants/create');
const tenantSettings = require('../../lib/tenants/settings');
const updateTenant = require('../../lib/tenants/update');

module.exports = async (req, res) => {
  const routePath = Array.isArray(req.query?.path)
    ? req.query.path
    : typeof req.query?.path === 'string'
      ? req.query.path.split('/').filter(Boolean)
      : [];

  if (routePath.length !== 1) {
    return res.status(404).json({ error: 'Ruta de sedes no encontrada.' });
  }
  if (routePath[0] === 'create') return createTenant(req, res);
  if (routePath[0] === 'settings') return tenantSettings(req, res);
  if (routePath[0] === 'update') return updateTenant(req, res);
  return res.status(404).json({ error: 'Ruta de sedes no encontrada.' });
};
