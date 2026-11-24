const {
  authenticateStaff,
  getServiceRoleKey,
  getSupabaseUrl,
  isConfigured,
  serviceRequest
} = require('../supabase-server');

const isUserId = (value) => typeof value === 'string'
  && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

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
  if (!response.ok) {
    const error = new Error(`Supabase Auth user deletion failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
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
    if (!response.ok) {
      throw new Error(`Supabase Storage deletion failed (${response.status}).`);
    }
  }
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

    const routePath = Array.isArray(req.query?.path) ? req.query.path : [];
    const userId = req.params?.userId
      || req.query?.userId
      || (routePath[0] === 'hard-delete-user' ? routePath[1] : undefined);
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

      const tenantRows = await serviceRequest(
        `tenants?select=id,entity_type,app_settings&id=eq.${encodeURIComponent(profile.tenant_id)}&limit=1`
      );
      const tenant = tenantRows?.[0];
      if (!tenant) {
        return res.status(409).json({ error: 'No se encontró la barbería asociada al perfil.' });
      }
      if (profile.role === 'independent' && tenant.entity_type !== 'independent') {
        return res.status(409).json({ error: 'El perfil independiente no coincide con el tipo de barbería.' });
      }

      const [tenantProfiles, entities] = await Promise.all([
        serviceRequest(
          `user_profiles?select=id,role&tenant_id=eq.${encodeURIComponent(profile.tenant_id)}`
        ),
        serviceRequest(
          `booking_entities?select=id,user_id&tenant_id=eq.${encodeURIComponent(profile.tenant_id)}`
        )
      ]);
      if ((tenantProfiles || []).some(item => item.role === 'developer')) {
        return res.status(409).json({ error: 'La barbería contiene un perfil de desarrollador y no puede eliminarse.' });
      }

      const associatedUserIds = new Set([
        ...(tenantProfiles || []).map(item => item.id),
        ...(entities || []).map(entity => entity.user_id).filter(Boolean)
      ]);
      associatedUserIds.delete(userId);

      const appSettings = tenant.app_settings && typeof tenant.app_settings === 'object'
        ? tenant.app_settings
        : {};
      const logos = [
        appSettings.logo,
        ...Object.values(appSettings.independentLogos || {})
      ];
      await deleteStorageObjects(logos);

      for (const associatedUserId of associatedUserIds) {
        await deleteAuthUser(associatedUserId);
      }

      await serviceRequest(
        `appointments?tenant_id=eq.${encodeURIComponent(profile.tenant_id)}`,
        { method: 'DELETE', headers: { Prefer: 'return=minimal' } }
      );
      await serviceRequest(
        `tenants?id=eq.${encodeURIComponent(profile.tenant_id)}`,
        { method: 'DELETE', headers: { Prefer: 'return=minimal' } }
      );
      await deleteAuthUser(userId);

      return res.status(200).json({
        userId,
        tenantId: profile.tenant_id,
        deleted: true,
        deletedAccounts: associatedUserIds.size + 1
      });
    }

    if (profile.role !== 'barber') {
      return res.status(400).json({ error: 'El rol de usuario no se puede eliminar desde este endpoint.' });
    }
    if (!profile.entity_id) {
      return res.status(409).json({ error: 'El perfil de barbero no tiene una entidad asociada.' });
    }

    const entities = await serviceRequest(
      `booking_entities?select=id,tenant_id,user_id&id=eq.${encodeURIComponent(profile.entity_id)}&limit=1`
    );
    const entity = entities?.[0];
    if (entity && (
      entity.tenant_id !== profile.tenant_id
      || (entity.user_id && entity.user_id !== userId)
    )) {
      return res.status(409).json({ error: 'La entidad de trabajo no coincide con el perfil.' });
    }

    if (entity) {
      await serviceRequest(
        `appointments?booking_entity_id=eq.${encodeURIComponent(entity.id)}`,
        { method: 'DELETE', headers: { Prefer: 'return=minimal' } }
      );
      await serviceRequest(
        `booking_entities?id=eq.${encodeURIComponent(entity.id)}`,
        { method: 'DELETE', headers: { Prefer: 'return=minimal' } }
      );
    }
    await serviceRequest(
      `user_profiles?id=eq.${encodeURIComponent(userId)}`,
      { method: 'DELETE', headers: { Prefer: 'return=minimal' } }
    );
    await deleteAuthUser(userId);

    return res.status(200).json({ userId, deleted: true });
  } catch (error) {
    console.error('Hard delete user failed:', error.message);
    const status = error.status === 404 ? 404 : 500;
    return res.status(status).json({ error: 'No se pudo completar la eliminación definitiva.' });
  }
};
