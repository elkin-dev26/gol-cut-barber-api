const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://supabase.example.test';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

const handler = require('../api/appointments/[...path]');
let requests;
let appointmentEntityId;

beforeEach(() => {
  requests = [];
  appointmentEntityId = 'barber-1';
  global.fetch = async (url, options = {}) => {
    requests.push({ url: String(url), options });
    if (String(url).endsWith('/auth/v1/user')) {
      return { ok: true, json: async () => ({ id: 'user-1', email: 'barber@example.test' }) };
    }
    if (String(url).includes('/rest/v1/user_profiles?')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'user-1',
          role: 'barber',
          tenant_id: 'shop-1',
          entity_id: 'barber-1',
          disabled_at: null
        }])
      };
    }
    if (String(url).includes('/rest/v1/tenants?')) {
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
    if (String(url).includes('/rest/v1/booking_entities?')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'barber-1',
          tenant_id: 'shop-1',
          entity_type: 'barber',
          active: true,
          access_blocked: false,
          is_indefinite: true,
          billing_cycle_days: 30,
          billing_cycle_started_at: new Date().toISOString()
        }])
      };
    }
    if (String(url).includes('/rest/v1/appointments?select=')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'appointment-1',
          tenant_id: 'shop-1',
          booking_entity_id: appointmentEntityId
        }])
      };
    }
    if (String(url).includes('/rest/v1/appointments?id=eq.')) {
      return {
        ok: true,
        status: options.method === 'DELETE' ? 204 : 200,
        text: async () => (options.method === 'DELETE' ? '' : JSON.stringify([JSON.parse(options.body)]))
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
  query: { path: ['update'], ...query }
});

test('persists appointment status changes for the assigned barber', async () => {
  const response = makeResponse();
  await handler(makeRequest('PATCH', { appointmentId: 'appointment-1', status: 'completada' }), response);

  assert.equal(response.statusCode, 200);
  const update = requests.find(request => request.options.method === 'PATCH');
  assert.deepEqual(JSON.parse(update.options.body), { status: 'completed' });
});

test('does not let a barber change a different barber appointment', async () => {
  appointmentEntityId = 'barber-2';
  const response = makeResponse();
  await handler(makeRequest('PATCH', { appointmentId: 'appointment-1', status: 'cancelada' }), response);

  assert.equal(response.statusCode, 403);
  assert.equal(requests.some(request => request.options.method === 'PATCH'), false);
});

test('persists appointment deletion for the assigned barber', async () => {
  const response = makeResponse();
  await handler(makeRequest('DELETE', {}, { id: 'appointment-1' }), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.deleted, true);
  assert.ok(requests.some(request => request.options.method === 'DELETE'));
});
