const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://supabase.example.test';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.WHATSAPP_ACCESS_TOKEN = 'test-whatsapp-token';
process.env.WHATSAPP_PHONE_NUMBER_ID = 'test-phone-number-id';
process.env.WHATSAPP_API_VERSION = 'v22.0';
process.env.WHATSAPP_TEMPLATE_NAME = 'new_appointment';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.EMAIL_FROM = 'Bookings <appointments@example.test>';

const handler = require('./appointment');
let requests;
let rateAllowed;

beforeEach(() => {
  requests = [];
  rateAllowed = true;
  global.fetch = async (url, options = {}) => {
    requests.push({ url: String(url), options });
    if (String(url).includes('/rpc/consume_booking_rate_limit')) {
      return { ok: true, status: 200, text: async () => JSON.stringify(rateAllowed) };
    }
    if (String(url).includes('/rest/v1/booking_entities?')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'barber-1',
          tenant_id: 'shop-1',
          entity_type: 'barber',
          name: 'Barbero Uno',
          contact_email: 'barber@example.test',
          whatsapp_phone: '+573001234567',
          active: true
        }])
      };
    }
    if (String(url).includes('/rest/v1/tenants?')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{
          id: 'shop-1',
          name: 'Barbería Uno',
          license_status: 'active',
          developer_blocked: false
        }])
      };
    }
    if (String(url).includes('/rest/v1/appointments?on_conflict=id')) {
      return {
        ok: true,
        status: 201,
        text: async () => JSON.stringify([JSON.parse(options.body)])
      };
    }
    if (String(url).includes('/rest/v1/booking_notifications?select=')) {
      return { ok: true, status: 200, text: async () => '[]' };
    }
    if (String(url).includes('/rest/v1/booking_notifications?on_conflict=')) {
      return {
        ok: true,
        status: 201,
        text: async () => JSON.stringify([{ appointment_id: 'appointment-1', status: 'sending' }])
      };
    }
    if (String(url).includes('/rest/v1/booking_notifications?appointment_id=') && options.method === 'PATCH') {
      return { ok: true, status: 204, text: async () => '' };
    }
    if (String(url).includes('graph.facebook.com') || String(url).includes('api.resend.com')) {
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
  method: 'POST',
  headers: { 'x-forwarded-for': '203.0.113.1' },
  socket: { remoteAddress: '203.0.113.1' },
  body
});

test('stores an appointment and delivers to contacts resolved from the server', async () => {
  const response = makeResponse();
  await handler(makeRequest({
    appointmentId: 'appointment-1',
    entityId: 'barber-1',
    customerName: 'Cliente',
    serviceName: 'Corte',
    appointmentDate: '2027-02-10',
    appointmentTime: '10:00 AM',
    price: 25000,
    email: 'attacker@example.test',
    whatsappPhone: '+19999999999'
  }), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.notifications.status, 'sent');
  const whatsappRequest = requests.find(request => request.url.includes('graph.facebook.com'));
  const emailRequest = requests.find(request => request.url.includes('api.resend.com'));
  assert.equal(JSON.parse(whatsappRequest.options.body).to, '573001234567');
  assert.deepEqual(JSON.parse(emailRequest.options.body).to, ['barber@example.test']);
});

test('rejects bookings when the rate limit is exceeded', async () => {
  rateAllowed = false;
  const response = makeResponse();
  await handler(makeRequest({
    appointmentId: 'appointment-1',
    entityId: 'barber-1',
    customerName: 'Cliente',
    serviceName: 'Corte',
    appointmentDate: '2027-02-10',
    appointmentTime: '10:00 AM',
    price: 25000
  }), response);

  assert.equal(response.statusCode, 429);
  assert.equal(requests.length, 1);
});
