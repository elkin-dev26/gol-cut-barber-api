const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://supabase.example.test';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

const handler = require('../api/staff/credentials');
let requests;
let callerRole;

beforeEach(() => {
  requests = [];
  callerRole = 'developer';
  global.fetch = async (url, options = {}) => {
    requests.push({ url: String(url), options });
    if (String(url).endsWith('/auth/v1/user')) {
      return { ok: true, json: async () => ({ id: '10000000-0000-4000-8000-000000000001' }) };
    }
    if (String(url).includes('/rest/v1/user_profiles?')) {
      const targetProfile = String(url).includes('20000000-0000-4000-8000-000000000001');
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: targetProfile ? '20000000-0000-4000-8000-000000000001' : '10000000-0000-4000-8000-000000000001',
          role: targetProfile ? 'barber' : callerRole,
          disabled_at: null
        }])
      };
    }
    if (String(url).includes('/auth/v1/admin/users/')) {
      return { ok: true, status: 200, text: async () => '{}' };
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

test('developer can reset a staff password without retrieving the old one', async () => {
  const response = makeResponse();
  await handler(makeRequest({
    userId: '20000000-0000-4000-8000-000000000001',
    action: 'reset',
    password: 'a-new-secret-123'
  }), response);

  assert.equal(response.statusCode, 200);
  const authUpdate = requests.find(request => request.url.includes('/auth/v1/admin/users/'));
  assert.equal(authUpdate.options.method, 'PUT');
  assert.deepEqual(JSON.parse(authUpdate.options.body), { password: 'a-new-secret-123' });
  assert.ok(response.body.passwordChangedAt);
  const passwordTimestampUpdate = requests.find(request => (
    request.url.includes('/rest/v1/user_profiles?id=eq.20000000-0000-4000-8000-000000000001')
    && request.options.method === 'PATCH'
  ));
  assert.ok(JSON.parse(passwordTimestampUpdate.options.body).password_changed_at);
});

test('non-developers cannot reset staff passwords', async () => {
  callerRole = 'admin';
  const response = makeResponse();
  await handler(makeRequest({
    userId: '20000000-0000-4000-8000-000000000001',
    action: 'reset',
    password: 'a-new-secret-123'
  }), response);

  assert.equal(response.statusCode, 403);
  assert.equal(requests.some(request => request.url.includes('/auth/v1/admin/users/')), false);
});

test('login activity updates the caller profile timestamp', async () => {
  const response = makeResponse();
  await handler(makeRequest({ action: 'activity' }), response);

  assert.equal(response.statusCode, 200);
  assert.ok(response.body.lastActiveAt);
  const activityUpdate = requests.find(request => (
    request.url.includes('/rest/v1/user_profiles?id=eq.10000000-0000-4000-8000-000000000001')
    && request.options.method === 'PATCH'
  ));
  assert.ok(JSON.parse(activityUpdate.options.body).last_active_at);
});
