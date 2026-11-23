const { isConfigured, serviceRequest } = require('../../lib/supabase-server');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!isConfigured()) {
    return res.status(503).json({ error: 'El servidor no tiene configuradas las credenciales de Supabase.' });
  }

  res.setHeader('Cache-Control', 'no-store');
  const code = String(req.query?.code || '').trim();
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(code)) {
    return res.status(400).json({ error: 'Ingresa un código público válido.' });
  }

  try {
    const tenants = await serviceRequest(
      `tenants?select=id,public_code,name,entity_type,license_status,developer_blocked,booking_blackouts&id=eq.${encodeURIComponent(code)}&limit=1`
    );
    const tenant = tenants?.[0];
    if (!tenant || tenant.license_status !== 'active' || tenant.developer_blocked) {
      return res.status(404).json({ error: 'No encontramos un perfil activo con ese código.' });
    }
    const tenantSettingsRows = await serviceRequest(
      `tenants?select=app_settings&id=eq.${encodeURIComponent(tenant.id)}&limit=1`
    );
    const appSettings = tenantSettingsRows?.[0]?.app_settings || {};

    const entities = await serviceRequest(
      `booking_entities?select=id,entity_type,name,active,access_blocked,billing_cycle_days,billing_cycle_started_at,user_id&tenant_id=eq.${encodeURIComponent(tenant.id)}&active=eq.true&order=name.asc`
    );
    const now = Date.now();
    const userIds = (entities || []).map(entity => entity.user_id).filter(Boolean);
    const disabledProfiles = userIds.length
      ? await serviceRequest(`user_profiles?select=id,disabled_at&id=in.(${userIds.map(encodeURIComponent).join(',')})`)
      : [];
    const disabledUserIds = new Set((disabledProfiles || []).filter(profile => profile.disabled_at).map(profile => profile.id));
    const availableEntities = (entities || []).filter(entity => (
      !entity.access_blocked
      && !disabledUserIds.has(entity.user_id)
      && new Date(entity.billing_cycle_started_at).getTime() + Number(entity.billing_cycle_days) * 24 * 60 * 60 * 1000 > now
    ));
    if (tenant.entity_type === 'independent' && !availableEntities.length) {
      return res.status(404).json({ error: 'No encontramos un perfil independiente activo con ese código.' });
    }
    const ownerProfiles = tenant.entity_type === 'independent' && availableEntities[0]?.user_id
      ? await serviceRequest(
        `user_profiles?select=display_name&id=eq.${encodeURIComponent(availableEntities[0].user_id)}&limit=1`
      )
      : [];
    return res.status(200).json({
      tenant,
      bookingBlackouts: tenant.booking_blackouts || [],
      services: Array.isArray(appSettings.services) ? appSettings.services : [],
      independentServices: tenant.entity_type === 'independent' && availableEntities[0]
        ? appSettings.independentServices?.[availableEntities[0].id] || []
        : [],
      logo: tenant.entity_type === 'independent' && availableEntities[0]
        ? appSettings.independentLogos?.[availableEntities[0].id] || ''
        : appSettings.logo || '',
      entities: availableEntities.map(entity => ({
        id: entity.id,
        entity_type: entity.entity_type,
        name: entity.name,
        active: entity.active,
        owner_name: ownerProfiles?.[0]?.display_name || null
      }))
    });
  } catch (error) {
    console.error('Public booking lookup failed:', error.message);
    return res.status(500).json({ error: 'No se pudo cargar el perfil de reservas.' });
  }
};
