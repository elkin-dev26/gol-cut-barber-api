const createTenant = require('../../lib/tenants/create');
const tenantSettings = require('../../lib/tenants/settings');
const updateTenant = require('../../lib/tenants/update');

const getRoutePath = (req) => {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;
  const prefix = '/api/tenants/';
  if (pathname.startsWith(prefix)) {
    return pathname.slice(prefix.length).split('/').filter(Boolean);
  }

  const dynamicPath = req.query?.path;
  const routePath = Array.isArray(dynamicPath)
    ? dynamicPath
    : typeof dynamicPath === 'string'
      ? dynamicPath.split('/').filter(Boolean)
      : [];
  return routePath;
};

module.exports = async (req, res) => {
  const routePath = getRoutePath(req);

  if (routePath.length !== 1) {
    return res.status(404).json({ error: 'Ruta de sedes no encontrada.' });
  }
  if (routePath[0] === 'create') return createTenant(req, res);
  if (routePath[0] === 'settings') return tenantSettings(req, res);
  if (routePath[0] === 'update') return updateTenant(req, res);
  return res.status(404).json({ error: 'Ruta de sedes no encontrada.' });
};
