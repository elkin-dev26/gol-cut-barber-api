const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://supabase.example.test';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

const handler = require('../api/staff/remove');
let requests;
let callerRole;
let callerTenantId;

beforeEach(() => {
  requests = [];
  callerRole = 'admin';
  callerTenantId = 'shop-1';
  global.fetch = async (url, options = {}) => {
    requests.push({ url: String(url), options });
    if (String(url).endsWith('/auth/v1/user')) {
      return { ok: true, json: async () => ({ id: 'admin-1' }) };
    }
    if (String(url).includes('/rest/v1/user_profiles?select=id,role,display_name')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'admin-1',
          role: callerRole,
          tenant_id: callerTenantId,
          disabled_at: null
        }])
      };
    }
    if (String(url).includes('/rest/v1/booking_entities?select=id,tenant_id,entity_type,user_id')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'barber-1',
          tenant_id: 'shop-1',
          entity_type: 'barber',
          user_id: 'barber-user-1'
        }])
      };
    }
    if (String(url).includes('/rest/v1/user_profiles?id=eq.barber-user-1')) {
      return { ok: true, status: 204, text: async () => '' };
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

const makeRequest = (body) => ({
  method: 'POST',
  headers: { authorization: 'Bearer test-token' },
  body
});

test('admin disables a barber account while preserving its booking history', async () => {
  const response = makeResponse();
  await handler(makeRequest({ entityId: 'barber-1' }), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.disabled, true);
  const disableProfile = requests.find(request => request.url.includes('/rest/v1/user_profiles?id=eq.barber-user-1'));
  assert.equal(disableProfile.options.method, 'PATCH');
  assert.ok(JSON.parse(disableProfile.options.body).disabled_at);
  assert.equal(requests.some(request => request.url.includes('/rest/v1/booking_entities?id=')), false);
});

test('admin cannot disable a barber from another tenant', async () => {
  callerTenantId = 'other-shop';
  const response = makeResponse();
  await handler(makeRequest({ entityId: 'barber-1' }), response);

  assert.equal(response.statusCode, 403);
  assert.equal(requests.some(request => request.options.method === 'PATCH'), false);
});
