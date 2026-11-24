module.exports = (req) => {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;
  const prefix = '/api/dev/';
  if (pathname.startsWith(prefix)) {
    return pathname.slice(prefix.length).split('/').filter(Boolean);
  }

  const dynamicPath = req.query?.path;
  const routePath = Array.isArray(dynamicPath)
    ? dynamicPath
    : typeof dynamicPath === 'string'
      ? dynamicPath.split('/').filter(Boolean)
      : [];
  const devIndex = routePath.indexOf('dev');
  return devIndex >= 0 ? routePath.slice(devIndex + 1) : routePath;
};
