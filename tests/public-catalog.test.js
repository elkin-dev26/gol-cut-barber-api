const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://supabase.example.test';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

const handler = require('../api/public/catalog');
let tenant;
let appSettings;
let requests;

beforeEach(() => {
  tenant = {
    id: 'shop-1',
    public_code: 'shop-1',
    name: 'Barbería',
    entity_type: 'shop',
    license_status: 'active',
    developer_blocked: false,
    booking_blackouts: []
  };
  appSettings = { logo: 'https://cdn.example.test/shop.png' };
  requests = [];
  global.fetch = async (url) => {
    const requestUrl = String(url);
    requests.push(requestUrl);
    if (requestUrl.includes('/rest/v1/tenants?select=id,public_code')) {
      return jsonResponse([tenant]);
    }
    if (requestUrl.includes('/rest/v1/tenants?select=app_settings')) {
      return jsonResponse([{ app_settings: appSettings }]);
    }
    if (requestUrl.includes('/rest/v1/booking_entities?')) {
      return jsonResponse([{
        id: 'entity-1',
        entity_type: tenant.entity_type === 'independent' ? 'independent' : 'barber',
        name: 'Barbero',
        active: true,
        access_blocked: false,
        billing_cycle_days: 30,
        billing_cycle_started_at: new Date().toISOString(),
        user_id: 'staff-1'
      }]);
    }
    if (requestUrl.includes('/rest/v1/user_profiles?select=id,disabled_at')) {
      return jsonResponse([{ id: 'staff-1', disabled_at: null }]);
    }
    if (requestUrl.includes('/rest/v1/user_profiles?select=display_name')) {
      return jsonResponse([{ display_name: 'Barbero' }]);
    }
    throw new Error(`Unexpected mocked request: ${requestUrl}`);
  };
});

const jsonResponse = (data) => ({
  ok: true,
  status: 200,
  text: async () => JSON.stringify(data)
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

test('public catalog returns the shop logo in logo_url', async () => {
  const response = makeResponse();
  await handler({ method: 'GET', query: { code: 'shop-1' } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.logo_url, appSettings.logo);
  assert.equal(response.body.logo, appSettings.logo);
});

test('public catalog returns the independent profile logo in logo_url', async () => {
  tenant.entity_type = 'independent';
  appSettings = { independentLogos: { 'entity-1': 'https://cdn.example.test/independent.png' } };
  const response = makeResponse();
  await handler({ method: 'GET', query: { code: 'shop-1' } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.logo_url, appSettings.independentLogos['entity-1']);
});
