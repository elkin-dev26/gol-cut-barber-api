const { auditActorHeaders, serviceRequest } = require('./supabase-server');

const touchStaffActivity = async ({ userId, entityId, entityType }) => {
  const timestamp = new Date().toISOString();
  if (userId) {
    await serviceRequest(`user_profiles?id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ last_active_at: timestamp })
    });
  }
  if (entityId && ['barber', 'independent'].includes(entityType)) {
    await serviceRequest(
      `booking_entities?id=eq.${encodeURIComponent(entityId)}&entity_type=eq.${entityType}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ last_active_at: timestamp })
      }
    );
  }
  return timestamp;
};

const touchPasswordChangedAt = async ({ userId, entityId, entityType, actor }) => {
  const timestamp = new Date().toISOString();
  await serviceRequest(`user_profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal', ...auditActorHeaders(actor) },
    body: JSON.stringify({ password_changed_at: timestamp })
  });
  if (entityId && ['barber', 'independent'].includes(entityType)) {
    await serviceRequest(
      `booking_entities?id=eq.${encodeURIComponent(entityId)}&entity_type=eq.${entityType}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal', ...auditActorHeaders(actor) },
        body: JSON.stringify({ password_changed_at: timestamp })
      }
    );
  }
  return timestamp;
};

module.exports = { touchPasswordChangedAt, touchStaffActivity };
