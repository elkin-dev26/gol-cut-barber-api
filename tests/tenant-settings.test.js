const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://supabase.example.test';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

const handler = require('../api/tenants/settings');
let requests;
let callerRole;

beforeEach(() => {
  requests = [];
  callerRole = 'admin';
  global.fetch = async (url, options = {}) => {
    requests.push({ url: String(url), options });
    if (String(url).endsWith('/auth/v1/user')) {
      return { ok: true, json: async () => ({ id: 'user-1' }) };
    }
    if (String(url).includes('/rest/v1/user_profiles?')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'user-1',
          role: callerRole,
          tenant_id: 'shop-1',
          entity_id: 'shop-1',
          disabled_at: null
        }])
      };
    }
    if (String(url).includes('/rest/v1/tenants?select=id,app_settings')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{ id: 'shop-1', app_settings: { services: [{ id: 's1' }] } }])
      };
    }
    if (String(url).includes('/rest/v1/rpc/update_tenant_app_settings')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ services: [{ id: 's2' }] })
      };
    }
    throw new Error(`Unexpected mocked request: ${url}`);
  };
});

const makeResponse = () => ({
  headers: {},
  setHeader(name, value) {
    this.headers[name] = value;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

const makeRequest = (method, body = {}, query = {}) => ({
  method,
  headers: { authorization: 'Bearer test-token' },
  body,
  query
});

test('admin can reload saved business settings', async () => {
  const response = makeResponse();
  await handler(makeRequest('GET', {}, { id: 'shop-1' }), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.settings.services, [{ id: 's1' }]);
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('business settings updates use the atomic merge function', async () => {
  const settings = { services: [{ id: 's2' }] };
  const response = makeResponse();
  await handler(makeRequest('PATCH', { id: 'shop-1', settings }), response);

  assert.equal(response.statusCode, 200);
  const update = requests.find(request => request.url.includes('rpc/update_tenant_app_settings'));
  assert.deepEqual(JSON.parse(update.options.body), { target_tenant_id: 'shop-1', settings_patch: settings });
});

test('admin cannot read another business settings', async () => {
  const response = makeResponse();
  await handler(makeRequest('GET', {}, { id: 'shop-2' }), response);

  assert.equal(response.statusCode, 403);
  assert.equal(requests.some(request => request.url.includes('/rest/v1/tenants?')), false);
});
