// Create React App only embeds REACT_APP_* variables, while the Vercel
// Supabase integration injects STORAGE_*/VITE_* names. Map them before building.
const fallbacks = {
  REACT_APP_SUPABASE_URL: ['STORAGE_SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_URL'],
  REACT_APP_SUPABASE_ANON_KEY: ['STORAGE_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY']
};

for (const [target, sources] of Object.entries(fallbacks)) {
  if (process.env[target]) continue;
  const source = sources.find((name) => process.env[name]);
  if (source) process.env[target] = process.env[source];
}

if (process.env.VERCEL === '1') {
  const missing = [];
  if (!process.env.REACT_APP_SUPABASE_URL) missing.push('REACT_APP_SUPABASE_URL');
  if (!process.env.REACT_APP_SUPABASE_ANON_KEY) missing.push('REACT_APP_SUPABASE_ANON_KEY');
  const serverSupabaseUrl = process.env.SUPABASE_URL || process.env.STORAGE_SUPABASE_URL;
  if (!serverSupabaseUrl) missing.push('SUPABASE_URL');
  if (!(process.env.SUPABASE_ANON_KEY || process.env.STORAGE_SUPABASE_ANON_KEY)) missing.push('SUPABASE_ANON_KEY');
  if (!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY)) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }
  const normalizeUrl = (value) => value.replace(/\/+$/, '');
  if (process.env.REACT_APP_SUPABASE_URL && serverSupabaseUrl
    && normalizeUrl(process.env.REACT_APP_SUPABASE_URL) !== normalizeUrl(serverSupabaseUrl)) {
    throw new Error('REACT_APP_SUPABASE_URL and SUPABASE_URL must point to the same Supabase project.');
  }
  if (missing.length) {
    throw new Error(`Missing required Vercel environment variables: ${missing.join(', ')}. Configure them for the Production environment and redeploy.`);
  }
}

process.env.CI = 'false';
require('react-scripts/scripts/build');
