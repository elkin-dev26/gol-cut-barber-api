// The Vercel Supabase integration injects STORAGE_-prefixed variables.
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

const authenticateStaff = async (req) => {
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
    `user_profiles?select=id,role,display_name,username,tenant_id,entity_id,disabled_at&id=eq.${encodeURIComponent(authUser.id)}&limit=1`
  );
  if (!profiles?.length) return null;

  const profile = profiles[0];
  if (profile.disabled_at) return null;
  if (profile.role === 'barber' || profile.role === 'independent') {
    const entities = await serviceRequest(
      `booking_entities?select=active,access_blocked,billing_cycle_days,billing_cycle_started_at&id=eq.${encodeURIComponent(profile.entity_id)}&limit=1`
    );
    const entity = entities?.[0];
    if (!entity || !entity.active) return null;
    const cycleExpiresAt = new Date(entity.billing_cycle_started_at).getTime()
      + Number(entity.billing_cycle_days) * 24 * 60 * 60 * 1000;
    if (entity.access_blocked || cycleExpiresAt <= Date.now()) return null;
  }

  return { ...profile, authUser };
};

const getSupabaseUrl = () => SUPABASE_URL;
const getServiceRoleKey = () => SUPABASE_SERVICE_ROLE_KEY;

module.exports = {
  authenticateStaff,
  getServiceRoleKey,
  getSupabaseUrl,
  isConfigured,
  serviceRequest
};
