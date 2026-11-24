const DAY_MS = 24 * 60 * 60 * 1000;

const getExpiresAt = (account) => {
  if (!account || account.is_indefinite || account.isIndefinite) return null;
  const explicitExpiry = account.expires_at || account.expiresAt;
  if (explicitExpiry) {
    const timestamp = new Date(explicitExpiry).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }
  if (account.billing_cycle_started_at || account.billingCycleStartedAt) {
    const startedAt = new Date(account.billing_cycle_started_at || account.billingCycleStartedAt).getTime();
    const days = Number(account.billing_cycle_days || account.billingCycleDays || 30);
    if (Number.isFinite(startedAt) && Number.isFinite(days)) return startedAt + days * DAY_MS;
  }
  return null;
};

const isSubscriptionExpired = (account, now = Date.now()) => {
  if (account?.is_indefinite || account?.isIndefinite) return false;
  const expiresAt = getExpiresAt(account);
  return expiresAt !== null && expiresAt <= now;
};

const isValidSubscriptionDays = (days) => Number.isInteger(days) && days >= 1 && days <= 3650;

module.exports = {
  DAY_MS,
  getExpiresAt,
  isSubscriptionExpired,
  isValidSubscriptionDays
};
