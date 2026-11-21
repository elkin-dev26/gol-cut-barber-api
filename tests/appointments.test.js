const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://supabase.example.test';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

const handler = require('../api/appointments/create');
let requests;
let rateAllowed;
let entityRecord;
let tenantRecord;

beforeEach(() => {
  requests = [];
  rateAllowed = true;
  entityRecord = { id: 'barber-1', tenant_id: 'shop-1', active: true };
  tenantRecord = { id: 'shop-1', license_status: 'active', developer_blocked: false };
  global.fetch = async (url, options = {}) => {
    requests.push({ url: String(url), options });
    if (String(url).includes('/rpc/consume_booking_rate_limit')) {
      return { ok: true, status: 200, text: async () => JSON.stringify(rateAllowed) };
    }
    if (String(url).includes('/rest/v1/booking_entities?')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([entityRecord])
      };
    }
    if (String(url).includes('/rest/v1/tenants?')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([tenantRecord])
      };
    }
    if (String(url).includes('/rest/v1/appointments?on_conflict=id')) {
      return {
        ok: true,
        status: 201,
        text: async () => JSON.stringify([JSON.parse(options.body)])
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
  method: 'POST',
  headers: { 'x-forwarded-for': '203.0.113.1' },
  socket: { remoteAddress: '203.0.113.1' },
  body
});

const appointmentInput = {
  appointmentId: 'appointment-1',
  entityId: 'barber-1',
  customerName: 'Cliente',
  serviceName: 'Corte',
  appointmentDate: '2027-02-10',
  appointmentTime: '10:00 AM',
  price: 25000
};

test('stores the appointment without requiring WhatsApp or email services', async () => {
  const response = makeResponse();
  await handler(makeRequest(appointmentInput), response);

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.appointmentId, appointmentInput.appointmentId);
  assert.equal(response.body.message, 'La cita se guardó correctamente.');
  assert.equal(requests.length, 4);
  assert.ok(requests.every(request => request.url.startsWith(process.env.SUPABASE_URL)));
});

test('rejects bookings when the rate limit is exceeded', async () => {
  rateAllowed = false;
  const response = makeResponse();
  await handler(makeRequest(appointmentInput), response);

  assert.equal(response.statusCode, 429);
  assert.equal(requests.length, 1);
});

test('rejects bookings for manually blocked barbers', async () => {
  entityRecord.access_blocked = true;
  const response = makeResponse();
  await handler(makeRequest(appointmentInput), response);

  assert.equal(response.statusCode, 404);
  assert.match(response.body.error, /no está disponible/i);
  assert.equal(requests.some(request => request.url.includes('/rest/v1/appointments?on_conflict=id')), false);
});

test('rejects bookings in a date and shift blocked by the administrator', async () => {
  tenantRecord.booking_blackouts = [{ date: appointmentInput.appointmentDate, shift: 'Mañana' }];
  const response = makeResponse();
  await handler(makeRequest(appointmentInput), response);

  assert.equal(response.statusCode, 409);
  assert.match(response.body.error, /horario seleccionado/i);
  assert.equal(requests.some(request => request.url.includes('/rest/v1/appointments?on_conflict=id')), false);
});
