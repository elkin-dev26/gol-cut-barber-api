const {
  authenticateStaff,
  auditActorHeaders,
  getServiceRoleKey,
  getSupabaseUrl,
  isConfigured,
  serviceRequest
} = require('../supabase-server');
const getRoutePath = require('./get-route-path');

const isUserId = (value) => typeof value === 'string'
  && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const isRecordId = (value) => typeof value === 'string'
  && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const httpError = (status, message) => Object.assign(new Error(message), { status });

const deleteAuthUser = async (userId) => {
  const response = await fetch(
    `${getSupabaseUrl()}/auth/v1/admin/users/${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      headers: {
        apikey: getServiceRoleKey(),
        Authorization: `Bearer ${getServiceRoleKey()}`
      }
    }
  );
  if (response.status === 404) return false;
  if (!response.ok) {
    const error = new Error(`Supabase Auth user deletion failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return true;
};

const getStorageObject = (value) => {
  if (typeof value !== 'string') return null;

  try {
    const baseUrl = new URL(getSupabaseUrl());
    const logoUrl = new URL(value, baseUrl);
    if (logoUrl.origin !== baseUrl.origin) return null;

    const prefix = '/storage/v1/object/';
    if (!logoUrl.pathname.startsWith(prefix)) return null;

    const parts = logoUrl.pathname.slice(prefix.length).split('/').map(decodeURIComponent);
    if (!['public', 'sign', 'authenticated'].includes(parts[0]) || !parts[1] || !parts.slice(2).length) {
      return null;
    }
    if (parts.some(part => part === '.' || part === '..')) return null;

    return { bucket: parts[1], path: parts.slice(2).join('/') };
  } catch {
    return null;
  }
};

const deleteStorageObjects = async (values) => {
  const objectsByBucket = new Map();
  for (const value of values) {
    const object = getStorageObject(value);
    if (!object) continue;
    if (!objectsByBucket.has(object.bucket)) objectsByBucket.set(object.bucket, new Set());
    objectsByBucket.get(object.bucket).add(object.path);
  }

  for (const [bucket, paths] of objectsByBucket) {
    const response = await fetch(
      `${getSupabaseUrl()}/storage/v1/object/${encodeURIComponent(bucket)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: getServiceRoleKey(),
          Authorization: `Bearer ${getServiceRoleKey()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prefixes: [...paths] })
      }
    );
    if (response.status === 404) continue;
    if (!response.ok) {
      throw new Error(`Supabase Storage deletion failed (${response.status}).`);
    }
  }
};

const deleteTenantAccount = async (tenantId, requestedUserId, expectedType, actor) => {
  const tenantRows = await serviceRequest(
    `tenants?select=id,entity_type,app_settings&id=eq.${encodeURIComponent(tenantId)}&limit=1`
  );
  const tenant = tenantRows?.[0];
  if (!tenant) throw httpError(404, 'No se encontró la sede asociada a la cuenta.');
  if (expectedType && tenant.entity_type !== expectedType) {
    throw httpError(409, 'El registro no coincide con el tipo de cuenta seleccionado.');
  }

  const [tenantProfiles, entities] = await Promise.all([
    serviceRequest(`user_profiles?select=id,role,entity_id&tenant_id=eq.${encodeURIComponent(tenantId)}`),
    serviceRequest(`booking_entities?select=id,user_id,entity_type&tenant_id=eq.${encodeURIComponent(tenantId)}`)
  ]);
  if ((tenantProfiles || []).some(profile => profile.role === 'developer')) {
    throw httpError(409, 'La barbería contiene un perfil de desarrollador y no puede eliminarse.');
  }
  if (expectedType === 'shop' && (
    (tenantProfiles || []).some(profile => profile.role === 'independent')
    || (entities || []).some(entity => entity.entity_type === 'independent')
  )) {
    throw httpError(409, 'La sede contiene registros independientes que no pertenecen a esta cuenta.');
  }
  if (expectedType === 'independent' && (
    (tenantProfiles || []).some(profile => profile.role !== 'independent' || profile.entity_id !== tenantId)
    || (entities || []).some(entity => entity.id !== tenantId || entity.entity_type !== 'independent')
  )) {
    throw httpError(409, 'El perfil independiente no coincide con sus registros asociados.');
  }

  const userIds = new Set([
    ...(tenantProfiles || []).map(profile => profile.id),
    ...(entities || []).map(entity => entity.user_id),
    requestedUserId
  ].filter(isUserId));
  const appSettings = tenant.app_settings && typeof tenant.app_settings === 'object'
    ? tenant.app_settings
    : {};
  const independentLogos = appSettings.independentLogos
    && typeof appSettings.independentLogos === 'object'
    ? Object.values(appSettings.independentLogos)
    : [];
  await deleteStorageObjects([appSettings.logo, ...independentLogos]);

  await serviceRequest(
    `appointments?tenant_id=eq.${encodeURIComponent(tenantId)}`,
    { method: 'DELETE', headers: { Prefer: 'return=minimal', ...auditActorHeaders(actor) } }
  );
  await serviceRequest(
    `booking_entities?tenant_id=eq.${encodeURIComponent(tenantId)}`,
    { method: 'DELETE', headers: { Prefer: 'return=minimal', ...auditActorHeaders(actor) } }
  );
  await serviceRequest(
    `user_profiles?tenant_id=eq.${encodeURIComponent(tenantId)}`,
    { method: 'DELETE', headers: { Prefer: 'return=minimal', ...auditActorHeaders(actor) } }
  );
  for (const userId of userIds) {
    await deleteAuthUser(userId);
  }
  await serviceRequest(
    `tenants?id=eq.${encodeURIComponent(tenantId)}`,
    { method: 'DELETE', headers: { Prefer: 'return=minimal', ...auditActorHeaders(actor) } }
  );

  return { tenantId, deleted: true, deletedAccounts: userIds.size };
};

const deleteBarberAccount = async (entityId, requestedUserId, requestedProfile, actor) => {
  const entities = await serviceRequest(
    `booking_entities?select=id,tenant_id,user_id,entity_type&id=eq.${encodeURIComponent(entityId)}&limit=1`
  );
  const entity = entities?.[0];
  const profiles = await serviceRequest(
    `user_profiles?select=id,role,tenant_id,entity_id&entity_id=eq.${encodeURIComponent(entityId)}`
  );
  if (entity && entity.entity_type !== 'barber') {
    throw httpError(409, 'La entidad seleccionada no es un barbero de sede.');
  }
  if ((profiles || []).some(profile => profile.role === 'developer')) {
    throw httpError(409, 'La entidad contiene un perfil de desarrollador y no puede eliminarse.');
  }
  if ((profiles || []).some(profile => profile.role !== 'barber')) {
    throw httpError(409, 'La entidad está vinculada a un perfil que no es de barbero.');
  }
  if (entity && (profiles || []).some(profile => (
    profile.tenant_id !== entity.tenant_id
    || profile.entity_id !== entity.id
    || (entity.user_id && entity.user_id !== profile.id)
  ))) {
    throw httpError(409, 'La entidad de trabajo no coincide con los perfiles asociados.');
  }
  if (!entity && !profiles?.length && !requestedProfile) {
    throw httpError(404, 'No se encontró el perfil de barbero.');
  }
  const profile = requestedProfile || profiles?.[0];
  if (profile && profile.role !== 'barber') {
    throw httpError(409, 'El perfil asociado no es de barbero.');
  }
  if (entity && profile && (
    entity.tenant_id !== profile.tenant_id
    || (entity.user_id && entity.user_id !== profile.id)
  )) {
    throw httpError(409, 'La entidad de trabajo no coincide con el perfil.');
  }

  const userIds = new Set([
    ...(profiles || []).map(item => item.id),
    entity?.user_id,
    requestedUserId,
    requestedProfile?.id
  ].filter(isUserId));
  await serviceRequest(
    `appointments?booking_entity_id=eq.${encodeURIComponent(entityId)}`,
    { method: 'DELETE', headers: { Prefer: 'return=minimal', ...auditActorHeaders(actor) } }
  );
  await serviceRequest(
    `booking_entities?id=eq.${encodeURIComponent(entityId)}`,
    { method: 'DELETE', headers: { Prefer: 'return=minimal', ...auditActorHeaders(actor) } }
  );
  await serviceRequest(
    `user_profiles?entity_id=eq.${encodeURIComponent(entityId)}&role=eq.barber`,
    { method: 'DELETE', headers: { Prefer: 'return=minimal', ...auditActorHeaders(actor) } }
  );
  if (requestedUserId) {
    await serviceRequest(
      `user_profiles?id=eq.${encodeURIComponent(requestedUserId)}`,
      { method: 'DELETE', headers: { Prefer: 'return=minimal', ...auditActorHeaders(actor) } }
    );
  }
  for (const userId of userIds) {
    await deleteAuthUser(userId);
  }

  return { userId: requestedUserId || entity?.user_id || profile?.id || null, deleted: true };
};

const deleteResourceById = async (resourceId, actor) => {
  const [tenants, entities] = await Promise.all([
    serviceRequest(`tenants?select=id,entity_type&id=eq.${encodeURIComponent(resourceId)}&limit=1`),
    serviceRequest(`booking_entities?select=id,entity_type&id=eq.${encodeURIComponent(resourceId)}&limit=1`)
  ]);
  const tenant = tenants?.[0];
  const entity = entities?.[0];

  if (tenant && entity && tenant.entity_type !== 'independent') {
    throw httpError(409, 'El identificador coincide con más de un registro.');
  }
  if (tenant) {
    return deleteTenantAccount(
      resourceId,
      undefined,
      tenant.entity_type === 'independent' ? 'independent' : 'shop',
      actor
    );
  }
  if (entity?.entity_type === 'barber') {
    return deleteBarberAccount(resourceId, undefined, undefined, actor);
  }
  if (entity?.entity_type === 'independent') {
    return deleteTenantAccount(resourceId, undefined, 'independent', actor);
  }
  throw httpError(404, 'No se encontró el registro seleccionado.');
};

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!isConfigured()) {
    return res.status(503).json({ error: 'El servidor no tiene configuradas las credenciales de Supabase.' });
  }

  try {
    const caller = await authenticateStaff(req);
    if (!caller) return res.status(401).json({ error: 'Inicia sesión con una cuenta habilitada.' });
    if (caller.role !== 'developer') {
      return res.status(403).json({ error: 'Solo el desarrollador puede eliminar cuentas definitivamente.' });
    }

    const routePath = getRoutePath(req);
    if (routePath[0] === 'hard-delete' && routePath.length === 2) {
      if (!isRecordId(routePath[1])) {
        return res.status(400).json({ error: 'Se requiere un identificador de registro válido.' });
      }
      const result = await deleteResourceById(routePath[1], caller);
      return res.status(200).json(result);
    }
    if (routePath[0]?.startsWith('hard-delete-') && routePath.length === 1) {
      const resourceId = routePath[0].slice('hard-delete-'.length);
      if (!isRecordId(resourceId)) {
        return res.status(400).json({ error: 'Se requiere un identificador de registro válido.' });
      }
      const result = await deleteResourceById(resourceId, caller);
      return res.status(200).json(result);
    }
    if (routePath[0] !== 'hard-delete-user') {
      return res.status(404).json({ error: 'Ruta de eliminación no encontrada.' });
    }

    if (routePath[1] === 'by-resource') {
      if (routePath.length !== 4) {
        return res.status(404).json({ error: 'Ruta de eliminación no encontrada.' });
      }
      const [, , resourceType, resourceId] = routePath;
      if (!isRecordId(resourceId)) {
        return res.status(400).json({ error: 'Se requiere un identificador de registro válido.' });
      }
      if (resourceType === 'barber') {
        const result = await deleteBarberAccount(resourceId, undefined, undefined, caller);
        return res.status(200).json(result);
      }
      if (resourceType === 'tenant') {
        const result = await deleteTenantAccount(resourceId, undefined, 'shop', caller);
        return res.status(200).json(result);
      }
      if (resourceType === 'independent') {
        const result = await deleteTenantAccount(resourceId, undefined, 'independent', caller);
        return res.status(200).json(result);
      }
      return res.status(400).json({ error: 'El tipo de registro no se puede eliminar.' });
    }

    if (routePath.length !== 2) {
      return res.status(404).json({ error: 'Ruta de eliminación no encontrada.' });
    }
    const userId = req.params?.userId || req.query?.userId || routePath[1];
    if (!isUserId(userId)) {
      return res.status(400).json({ error: 'Se requiere un ID de usuario válido.' });
    }
    const profiles = await serviceRequest(
      `user_profiles?select=id,role,tenant_id,entity_id&id=eq.${encodeURIComponent(userId)}&limit=1`
    );
    const profile = profiles?.[0];
    if (!profile) {
      return res.status(404).json({ error: 'No se encontró un perfil asociado a ese usuario.' });
    }
    if (profile.role === 'developer') {
      return res.status(403).json({ error: 'No se permite eliminar perfiles de desarrollador.' });
    }

    if (profile.role === 'admin' || profile.role === 'independent') {
      if (!profile.tenant_id || profile.entity_id !== profile.tenant_id) {
        return res.status(409).json({ error: 'El perfil no tiene una barbería asociada válida.' });
      }
      const expectedType = profile.role === 'independent' ? 'independent' : 'shop';
      const result = await deleteTenantAccount(profile.tenant_id, userId, expectedType, caller);
      return res.status(200).json({ ...result, userId });
    }

    if (profile.role !== 'barber') {
      return res.status(400).json({ error: 'El rol de usuario no se puede eliminar desde este endpoint.' });
    }
    if (!profile.entity_id) {
      return res.status(409).json({ error: 'El perfil de barbero no tiene una entidad asociada.' });
    }
    const result = await deleteBarberAccount(profile.entity_id, userId, profile, caller);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Hard delete user failed:', error.message);
    const status = [400, 403, 404, 409].includes(error.status) ? error.status : 500;
    return res.status(status).json({ error: 'No se pudo completar la eliminación definitiva.' });
  }
};
