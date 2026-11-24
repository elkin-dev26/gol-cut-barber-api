const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getExpiresAt, isSubscriptionExpired, isValidSubscriptionDays } = require('../lib/subscriptions');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

test('subscription expiration prefers its own expiry date and respects indefinite accounts', () => {
  const now = Date.parse('2026-01-01T00:00:00.000Z');
  assert.equal(getExpiresAt({ expires_at: '2025-12-31T23:59:59.000Z' }), now - 1000);
  assert.equal(isSubscriptionExpired({ expires_at: '2025-12-31T23:59:59.000Z' }, now), true);
  assert.equal(isSubscriptionExpired({
    expires_at: '2025-12-31T23:59:59.000Z',
    is_indefinite: true
  }, now), false);
});

test('subscription durations are limited to positive whole days up to ten years', () => {
  assert.equal(isValidSubscriptionDays(1), true);
  assert.equal(isValidSubscriptionDays(3650), true);
  assert.equal(isValidSubscriptionDays(0), false);
  assert.equal(isValidSubscriptionDays(30.5), false);
  assert.equal(isValidSubscriptionDays(3651), false);
});

test('renewal SQL extends from the later of current expiry or now', () => {
  const sql = readFileSync(join(__dirname, '..', 'supabase', 'audit_and_security.sql'), 'utf8');

  assert.match(sql, /greatest\(coalesce\(expires_at,\s*now\(\)\),\s*now\(\)\)\s*\+\s*make_interval\(days\s*=>\s*subscription_days\)/i);
  assert.match(sql, /if updated_entity\.entity_type = 'independent' then[\s\S]*?update public\.tenants/i);
});
