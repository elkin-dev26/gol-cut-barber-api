const createAppointment = require('../../lib/appointments/create');
const updateAppointment = require('../../lib/appointments/update');

module.exports = async (req, res) => {
  const routePath = Array.isArray(req.query?.path)
    ? req.query.path
    : typeof req.query?.path === 'string'
      ? req.query.path.split('/').filter(Boolean)
      : [];

  if (routePath.length === 1 && routePath[0] === 'create') {
    return createAppointment(req, res);
  }
  if (routePath.length === 1 && routePath[0] === 'update') {
    return updateAppointment(req, res);
  }
  return res.status(404).json({ error: 'Ruta de citas no encontrada.' });
};
