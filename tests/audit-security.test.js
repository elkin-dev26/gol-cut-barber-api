const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const auditSql = readFileSync(join(__dirname, '..', 'supabase', 'audit_and_security.sql'), 'utf8');
const cleanupSql = readFileSync(join(__dirname, '..', 'supabase', 'quarterly_cleanup.sql'), 'utf8');

test('defines scoped audit history and triggers for account, settings, password and appointment changes', () => {
  assert.match(auditSql, /create table if not exists public\.audit_logs/i);
  for (const column of ['tenant_id', 'actor_name', 'actor_role', 'action_type', 'details_before_after', 'created_at']) {
    assert.match(auditSql, new RegExp(`\\b${column}\\b`, 'i'));
  }
  for (const trigger of [
    'booking_entities_audit_change',
    'user_profiles_audit_change',
    'tenants_audit_change',
    'appointments_audit_change',
    'system_settings_audit_change'
  ]) {
    assert.match(auditSql, new RegExp(`create trigger ${trigger}`, 'i'));
  }
  assert.match(auditSql, /drop constraint if exists audit_logs_tenant_id_fkey/i);
  assert.match(auditSql, /details_before_after ->> 'target_id'/i);
  assert.doesNotMatch(auditSql, /password\s*['"]?\s*:/i);
});

test('production shield tightens booking limits and protects public and storage access', () => {
  assert.match(auditSql, /production_shield_enabled boolean not null default false/i);
  assert.match(auditSql, /when shield_enabled then least\(max_requests, 4\)/i);
  assert.match(auditSql, /revoke all on public\.tenants from public, anon/i);
  assert.match(auditSql, /tenant asset objects stay within staff scope/i);
  assert.match(auditSql, /alter table storage\.objects enable row level security/i);
  assert.doesNotMatch(auditSql, /force row level security/i);
});

test('quarterly cleanup also expires retained audit entries using the configured cutoff', () => {
  assert.match(cleanupSql, /production_shield_enabled boolean not null default false/i);
  assert.match(cleanupSql, /cancelled_appointments integer not null default 0/i);
  assert.match(cleanupSql, /status in \('completed', 'cancelled'\)/i);
  assert.match(cleanupSql, /delete from public\.audit_logs\s+where created_at < cutoff_timestamp/i);
});
