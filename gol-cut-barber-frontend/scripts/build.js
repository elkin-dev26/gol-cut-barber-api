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

process.env.CI = 'false';
require('react-scripts/scripts/build');
