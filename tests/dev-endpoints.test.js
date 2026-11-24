const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://supabase.example.test';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

const devHandler = require('../api/dev/[...path]');

const developerId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const targetId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const staffId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
let requests;
let callerRole;
let targetRole;
let targetAppSettings;
let targetProfileExists;
let entityUserId;
let entityProfileExists;
let missingAuthUserIds;

const jsonResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => data === null ? '' : JSON.stringify(data),
  json: async () => data
});

beforeEach(() => {
  requests = [];
  callerRole = 'developer';
  targetRole = 'barber';
  targetAppSettings = {};
  targetProfileExists = true;
  entityUserId = targetId;
  entityProfileExists = true;
  missingAuthUserIds = new Set();
  global.fetch = async (url, options = {}) => {
    const request = { url: String(url), options };
    requests.push(request);

    if (request.url.endsWith('/auth/v1/user')) {
      return { ok: true, json: async () => ({ id: developerId }) };
    }
    if (request.url.includes('/rest/v1/user_profiles?select=id,role,display_name')) {
      return jsonResponse([{
        id: developerId,
        role: callerRole,
        display_name: 'Developer',
        username: null,
        tenant_id: null,
        entity_id: null,
        disabled_at: null
      }]);
    }
    if (request.url.includes(`/rest/v1/user_profiles?select=id,role,tenant_id,entity_id&id=eq.${targetId}`)) {
      return jsonResponse(targetProfileExists ? [{
          id: targetId,
          role: targetRole,
          tenant_id: 'shop-1',
          entity_id: targetRole === 'barber' ? 'barber-1' : 'shop-1'
        }] : []);
    }
    if (request.url.includes('/rest/v1/user_profiles?select=id,role,tenant_id,entity_id&entity_id=eq.barber-1')) {
      return jsonResponse(entityProfileExists ? [{
        id: targetId,
        role: 'barber',
        tenant_id: 'shop-1',
        entity_id: 'barber-1'
      }] : []);
    }
    if (request.url.includes('/rest/v1/booking_entities?select=id,tenant_id,user_id&id=eq.barber-1')) {
      return jsonResponse([{
        id: 'barber-1',
        tenant_id: 'shop-1',
        user_id: entityUserId
      }]);
    }
    if (request.url.includes('/rest/v1/tenants?select=id,entity_type,app_settings&id=eq.shop-1')) {
      return jsonResponse([{
        id: 'shop-1',
        entity_type: 'shop',
        app_settings: targetAppSettings
      }]);
    }
    if (request.url.includes('/rest/v1/user_profiles?select=id,role&tenant_id=eq.shop-1')) {
      return jsonResponse([
        { id: targetId, role: targetRole },
        { id: staffId, role: 'barber' }
      ]);
    }
    if (request.url.includes('/rest/v1/booking_entities?select=id,user_id&tenant_id=eq.shop-1')) {
      return jsonResponse([{ id: 'barber-1', user_id: staffId }]);
    }
    if (request.url.includes('/rest/v1/appointments?booking_entity_id=eq.barber-1')) {
      return jsonResponse(null, 204);
    }
    if (request.url.includes('/rest/v1/appointments?tenant_id=eq.shop-1')) {
      return jsonResponse(null, 204);
    }
    if (request.url.includes('/rest/v1/booking_entities?tenant_id=eq.shop-1')) {
      return jsonResponse(null, 204);
    }
    if (request.url.includes('/rest/v1/user_profiles?tenant_id=eq.shop-1')) {
      return jsonResponse(null, 204);
    }
    if (request.url.includes('/rest/v1/booking_entities?id=eq.barber-1')) {
      return jsonResponse(null, 204);
    }
    if (request.url.includes('/rest/v1/user_profiles?entity_id=eq.barber-1&role=eq.barber')) {
      return jsonResponse(null, 204);
    }
    if (request.url.includes('/rest/v1/tenants?id=eq.shop-1')) {
      return jsonResponse(null, 204);
    }
    if (request.url.includes(`/rest/v1/user_profiles?id=eq.${targetId}`)) {
      return jsonResponse(null, 204);
    }
    if (request.url.includes('/storage/v1/object/logos')) {
      return jsonResponse(null, 200);
    }
    if (request.url.includes('/auth/v1/admin/users/')) {
      const missing = [...missingAuthUserIds].some(userId => request.url.endsWith(`/auth/v1/admin/users/${userId}`));
      return jsonResponse(null, missing ? 404 : 200);
    }
    if (request.url.includes('/rest/v1/rpc/run_quarterly_cleanup')) {
      return jsonResponse(null, 204);
    }
    throw new Error(`Unexpected mocked request: ${request.url}`);
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

const makeRequest = (method, userId = targetId, route = 'hard-delete-user') => ({
  method,
  headers: { authorization: 'Bearer test-token' },
  query: {
    path: Array.isArray(route)
      ? route
      : route === 'hard-delete-user'
        ? [route, userId]
        : [route]
  },
  body: {}
});

test('developer hard delete removes a barber appointment and entity before Auth', async () => {
  const response = makeResponse();
  await devHandler(makeRequest('DELETE'), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.deleted, true);
  const appointmentDelete = requests.findIndex(request => request.url.includes('/rest/v1/appointments?'));
  const entityDelete = requests.findIndex(request => request.url.includes('/rest/v1/booking_entities?id='));
  const authDelete = requests.findIndex(request => request.url.includes('/auth/v1/admin/users/'));
  assert.ok(appointmentDelete < entityDelete);
  assert.ok(entityDelete < authDelete);
  assert.equal(requests[authDelete].options.method, 'DELETE');
});

test('developer hard delete resolves its route from req.url when catch-all query data is missing', async () => {
  const request = makeRequest('DELETE');
  delete request.query.path;
  request.url = `/api/dev/hard-delete-user/${targetId}`;

  const response = makeResponse();
  await devHandler(request, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.deleted, true);
});

test('developer can delete a barber entity with no Auth user or user profile', async () => {
  entityUserId = null;
  entityProfileExists = false;
  const request = makeRequest('DELETE', 'barber-1');
  delete request.query.path;
  request.url = '/api/dev/hard-delete-user/by-resource/barber/barber-1';
  const response = makeResponse();
  await devHandler(request, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.deleted, true);
  assert.ok(requests.some(request => request.url.includes('/rest/v1/appointments?booking_entity_id=eq.barber-1')));
  assert.ok(requests.some(request => request.url.includes('/rest/v1/booking_entities?id=eq.barber-1')));
  assert.equal(requests.some(request => request.url.includes('/auth/v1/admin/users/')), false);
});

test('developer hard delete succeeds when the Auth user is already absent', async () => {
  missingAuthUserIds.add(targetId);
  const response = makeResponse();
  await devHandler(makeRequest('DELETE'), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.deleted, true);
});

test('deleting a tenant owner removes tenant records, linked accounts, and stored logos', async () => {
  targetRole = 'admin';
  targetAppSettings = {
    logo: 'https://supabase.example.test/storage/v1/object/public/logos/shop.png'
  };
  const response = makeResponse();
  await devHandler(makeRequest('DELETE'), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.deletedAccounts, 2);
  const storageDelete = requests.find(request => request.url.includes('/storage/v1/object/logos'));
  assert.deepEqual(JSON.parse(storageDelete.options.body), { prefixes: ['shop.png'] });
  const appointmentDelete = requests.findIndex(request => request.url.includes('/rest/v1/appointments?tenant_id='));
  const entityDelete = requests.findIndex(request => request.url.includes('/rest/v1/booking_entities?tenant_id='));
  const profileDelete = requests.findIndex(request => request.url.includes('/rest/v1/user_profiles?tenant_id='));
  const tenantDelete = requests.findIndex(request => request.url.includes('/rest/v1/tenants?id='));
  const siblingAuthDelete = requests.findIndex(request => request.url.endsWith(`/auth/v1/admin/users/${staffId}`));
  const targetAuthDelete = requests.findIndex(request => request.url.endsWith(`/auth/v1/admin/users/${targetId}`));
  assert.ok(storageDelete);
  assert.ok(appointmentDelete < entityDelete);
  assert.ok(entityDelete < profileDelete);
  assert.ok(profileDelete < siblingAuthDelete);
  assert.ok(siblingAuthDelete < tenantDelete);
  assert.ok(targetAuthDelete < tenantDelete);
});

test('non-developers cannot invoke hard deletion or cleanup', async () => {
  callerRole = 'admin';
  let response = makeResponse();
  await devHandler(makeRequest('DELETE'), response);

  assert.equal(response.statusCode, 403);
  assert.equal(requests.some(request => request.options.method === 'DELETE'), false);

  requests = [];
  response = makeResponse();
  await devHandler(makeRequest('POST', targetId, 'run-cleanup'), response);

  assert.equal(response.statusCode, 403);
  assert.equal(requests.some(request => request.url.includes('/rpc/run_quarterly_cleanup')), false);
});

test('hard deletion rejects developers and users without a staff profile', async () => {
  targetRole = 'developer';
  let response = makeResponse();
  await devHandler(makeRequest('DELETE'), response);
  assert.equal(response.statusCode, 403);
  assert.equal(requests.some(request => request.url.includes('/auth/v1/admin/users/')), false);

  targetProfileExists = false;
  response = makeResponse();
  await devHandler(makeRequest('DELETE'), response);
  assert.equal(response.statusCode, 404);
  assert.equal(requests.some(request => request.url.includes('/auth/v1/admin/users/')), false);
});

test('manual cleanup invokes the RPC with force_run enabled for developers', async () => {
  const response = makeResponse();
  await devHandler(makeRequest('POST', targetId, 'run-cleanup'), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { success: true });
  const rpcRequest = requests.find(request => request.url.includes('/rpc/run_quarterly_cleanup'));
  assert.deepEqual(JSON.parse(rpcRequest.options.body), { force_run: true });
});
