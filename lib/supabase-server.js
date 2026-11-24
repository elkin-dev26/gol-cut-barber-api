// The Vercel Supabase integration injects STORAGE_-prefixed variables.
const { isSubscriptionExpired } = require('./subscriptions');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.STORAGE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.STORAGE_SUPABASE_ANON_KEY;

const isConfigured = () => Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_ANON_KEY);

const serviceRequest = async (path, options = {}) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error('Supabase returned an invalid response.');
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Supabase request failed.');
    error.status = response.status;
    throw error;
  }
  return data;
};

const authenticateStaff = async (req, { allowInactive = false } = {}) => {
  const authorization = req.headers.authorization || '';
  const accessToken = authorization.replace(/^Bearer\s+/i, '');
  if (!accessToken) return null;

  const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!authResponse.ok) return null;

  const authUser = await authResponse.json();
  const profiles = await serviceRequest(
    `user_profiles?select=id,role,display_name,username,tenant_id,entity_id,disabled_at,password_changed_at,last_active_at,created_at&id=eq.${encodeURIComponent(authUser.id)}&limit=1`
  );
  if (!profiles?.length) return null;

  const profile = profiles[0];
  if (profile.disabled_at) return null;
  if (profile.role !== 'developer' && profile.tenant_id) {
    const tenants = await serviceRequest(
      `tenants?select=id,license_status,developer_blocked,expires_at,is_indefinite&id=eq.${encodeURIComponent(profile.tenant_id)}&limit=1`
    );
    const tenant = tenants?.[0];
    if (!tenant) return null;
    if (!allowInactive && (
      tenant.license_status !== 'active'
      || tenant.developer_blocked
      || isSubscriptionExpired(tenant)
    )) return null;
  }
  if (profile.role === 'barber' || profile.role === 'independent') {
    const entities = await serviceRequest(
      `booking_entities?select=id,tenant_id,entity_type,active,access_blocked,billing_cycle_days,billing_cycle_started_at,expires_at,is_indefinite&id=eq.${encodeURIComponent(profile.entity_id)}&limit=1`
    );
    const entity = entities?.[0];
    if (!entity
      || entity.tenant_id !== profile.tenant_id
      || entity.entity_type !== profile.role
      || (!allowInactive && (
      !entity.active
      || entity.access_blocked
      || isSubscriptionExpired(entity)
      ))
    ) return null;
  }

  return { ...profile, authUser };
};

const getSupabaseUrl = () => SUPABASE_URL;
const getServiceRoleKey = () => SUPABASE_SERVICE_ROLE_KEY;
const auditActorHeaders = (caller) => ({
  'x-audit-actor': String(caller?.display_name || caller?.username || 'Cliente')
    .replace(/[\r\n]/g, ' ')
    .slice(0, 120),
  'x-audit-role': String(caller?.role || 'cliente')
});

module.exports = {
  authenticateStaff,
  auditActorHeaders,
  getServiceRoleKey,
  getSupabaseUrl,
  isConfigured,
  serviceRequest
};
