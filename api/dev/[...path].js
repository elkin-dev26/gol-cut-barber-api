const hardDeleteUser = require('../../lib/dev/hard-delete-user');
const runCleanup = require('../../lib/dev/run-cleanup');

module.exports = async (req, res) => {
  const routePath = Array.isArray(req.query?.path)
    ? req.query.path
    : typeof req.query?.path === 'string'
      ? req.query.path.split('/').filter(Boolean)
      : [];

  if (routePath.length === 1 && routePath[0] === 'run-cleanup') {
    return runCleanup(req, res);
  }
  if (routePath.length === 2 && routePath[0] === 'hard-delete-user') {
    return hardDeleteUser(req, res);
  }
  return res.status(404).json({ error: 'Ruta de desarrollador no encontrada.' });
};
