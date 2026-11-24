const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://supabase.example.test';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

const handler = require('../api/tenants/[...path]');
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
    if (String(url).includes('/rest/v1/tenants?select=id,license_status,developer_blocked,expires_at,is_indefinite')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'shop-1',
          license_status: 'active',
          developer_blocked: false,
          is_indefinite: true
        }])
      };
    }
    if (String(url).includes('/rest/v1/booking_entities?select=id,tenant_id,entity_type,active,access_blocked')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'shop-1',
          tenant_id: 'shop-1',
          entity_type: 'independent',
          active: true,
          access_blocked: false,
          is_indefinite: true
        }])
      };
    }
    if (String(url).includes('/rest/v1/booking_entities?select=active')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          active: true,
          access_blocked: false,
          billing_cycle_days: 30,
          billing_cycle_started_at: new Date().toISOString()
        }])
      };
    }
    if (String(url).includes('/rest/v1/tenants?select=id,app_settings')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'shop-1',
          app_settings: {
            services: [{ id: 's1' }],
            independentServices: { 'shop-1': [{ id: 'independent-service' }], 'other-entity': [{ id: 'private-service' }] },
            independentLogos: { 'shop-1': 'data:image/png;base64,logo', 'other-entity': 'private-logo' }
          }
        }])
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
  query: { path: ['settings'], ...query }
});

test('admin can reload saved business settings', async () => {
  const response = makeResponse();
  await handler(makeRequest('GET', {}, { id: 'shop-1' }), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.settings.services, [{ id: 's1' }]);
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('dispatches tenant settings from the request URL when the catch-all parameter is absent', async () => {
  const request = makeRequest('GET', {}, { id: 'shop-1' });
  delete request.query.path;
  request.url = '/api/tenants/settings?id=shop-1';

  const response = makeResponse();
  await handler(request, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.settings.services, [{ id: 's1' }]);
});

test('independent profiles can read only their own services and logo', async () => {
  callerRole = 'independent';
  const response = makeResponse();
  await handler(makeRequest('GET', {}, { id: 'shop-1' }), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.settings, {
    independentServices: { 'shop-1': [{ id: 'independent-service' }] },
    independentLogos: { 'shop-1': 'data:image/png;base64,logo' }
  });
});

test('business settings updates use the atomic merge function', async () => {
  const settings = { services: [{ id: 's2' }] };
  const response = makeResponse();
  await handler(makeRequest('PATCH', { id: 'shop-1', settings }), response);

  assert.equal(response.statusCode, 200);
  const update = requests.find(request => request.url.includes('rpc/update_tenant_app_settings'));
  assert.deepEqual(JSON.parse(update.options.body), { target_tenant_id: 'shop-1', settings_patch: settings });
});

test('admin can save a business logo through settings', async () => {
  const settings = { logo: 'data:image/png;base64,logo' };
  const response = makeResponse();
  await handler(makeRequest('PATCH', { id: 'shop-1', settings }), response);

  assert.equal(response.statusCode, 200);
  const update = requests.find(request => request.url.includes('rpc/update_tenant_app_settings'));
  assert.deepEqual(JSON.parse(update.options.body).settings_patch, settings);
});

test('independent profiles can save only their own logo map', async () => {
  callerRole = 'independent';
  const settings = {
    independentServices: { 'shop-1': [{ id: 's1' }] },
    independentLogos: { 'shop-1': 'data:image/png;base64,logo' }
  };
  const response = makeResponse();
  await handler(makeRequest('PATCH', { id: 'shop-1', settings }), response);

  assert.equal(response.statusCode, 200);
  const update = requests.find(request => request.url.includes('rpc/update_tenant_app_settings'));
  assert.deepEqual(JSON.parse(update.options.body).settings_patch, settings);
});

test('independent profiles cannot save a logo for another entity', async () => {
  callerRole = 'independent';
  const response = makeResponse();
  await handler(makeRequest('PATCH', {
    id: 'shop-1',
    settings: { independentLogos: { 'another-entity': 'data:image/png;base64,logo' } }
  }), response);

  assert.equal(response.statusCode, 403);
  assert.equal(requests.some(request => request.url.includes('rpc/update_tenant_app_settings')), false);
});

test('admin cannot read another business settings', async () => {
  const response = makeResponse();
  await handler(makeRequest('GET', {}, { id: 'shop-2' }), response);

  assert.equal(response.statusCode, 403);
  assert.equal(requests.some(request => request.url.includes('/rest/v1/tenants?select=id,app_settings')), false);
});
