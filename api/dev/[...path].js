const hardDeleteUser = require('../../lib/dev/hard-delete-user');
const getRoutePath = require('../../lib/dev/get-route-path');
const runCleanup = require('../../lib/dev/run-cleanup');

module.exports = async (req, res) => {
  const routePath = getRoutePath(req);

  if (routePath.length === 1 && routePath[0] === 'run-cleanup') {
    return runCleanup(req, res);
  }
  if (
    (routePath.length === 2 && routePath[0] === 'hard-delete-user')
    || (routePath.length === 4
      && routePath[0] === 'hard-delete-user'
      && routePath[1] === 'by-resource')
    || (routePath.length === 2 && routePath[0] === 'hard-delete')
    || (routePath.length === 1 && routePath[0].startsWith('hard-delete-'))
  ) {
    return hardDeleteUser(req, res);
  }
  return res.status(404).json({ error: 'Ruta de desarrollador no encontrada.' });
};
