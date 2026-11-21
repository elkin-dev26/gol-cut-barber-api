const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://supabase.example.test';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

const handler = require('../api/staff/update');
let requests;
let entityTenantId;

beforeEach(() => {
  requests = [];
  entityTenantId = 'shop-1';
  global.fetch = async (url, options = {}) => {
    requests.push({ url: String(url), options });
    if (String(url).endsWith('/auth/v1/user')) {
      return { ok: true, json: async () => ({ id: 'admin-user', email: 'admin@example.test' }) };
    }
    if (String(url).includes('/rest/v1/user_profiles?')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'admin-user',
          role: 'admin',
          tenant_id: 'shop-1',
          disabled_at: null
        }])
      };
    }
    if (String(url).includes('/rest/v1/booking_entities?select=')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'barber-1',
          tenant_id: entityTenantId,
          entity_type: 'barber',
          access_blocked: true,
          billing_cycle_days: 15,
          billing_cycle_started_at: '2026-01-01T00:00:00.000Z'
        }])
      };
    }
    if (String(url).includes('/rest/v1/booking_entities?id=eq.')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{ ...JSON.parse(options.body), id: 'barber-1' }])
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

const makeRequest = (body) => ({
  method: 'PATCH',
  headers: { authorization: 'Bearer test-token' },
  body
});

test('reactivating a barber clears the lock and restarts the payment cycle', async () => {
  const response = makeResponse();
  await handler(makeRequest({ entityId: 'barber-1', accessBlocked: false }), response);

  assert.equal(response.statusCode, 200);
  const update = requests.find(request => request.options.method === 'PATCH');
  const body = JSON.parse(update.options.body);
  assert.equal(body.access_blocked, false);
  assert.ok(Date.parse(body.billing_cycle_started_at) > Date.parse('2026-01-01T00:00:00.000Z'));
});

test('an administrator cannot block a barber in another location', async () => {
  entityTenantId = 'shop-2';
  const response = makeResponse();
  await handler(makeRequest({ entityId: 'barber-1', accessBlocked: true }), response);

  assert.equal(response.statusCode, 403);
  assert.equal(requests.some(request => request.options.method === 'PATCH'), false);
});
