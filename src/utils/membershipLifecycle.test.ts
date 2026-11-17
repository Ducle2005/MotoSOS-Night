import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  cancelSubscriptionAutoRenew,
  formatDateVi,
  getDaysRemaining,
  getMembershipSubscription,
  isSubscriptionBenefitActive,
  reactivateSubscriptionAutoRenew,
  recordNewSubscription,
  THIRTY_DAYS_MS,
} from './membershipLifecycle';

describe('membershipLifecycle 30-day subscription tests', () => {
  test('initializes 30-day subscription with autoRenew true', () => {
    const sub = recordNewSubscription('priority_247');
    assert.equal(sub.planId, 'priority_247');
    assert.equal(sub.autoRenew, true);
    assert.equal(sub.expiresAt - sub.subscribedAt, THIRTY_DAYS_MS);
    assert.ok(isSubscriptionBenefitActive(sub));
    assert.ok(getDaysRemaining(sub.expiresAt) >= 29);
  });

  test('cancelling auto-renew preserves expiresAt and active rights strictly', () => {
    const fresh = recordNewSubscription('moto_gold');
    const originalExpiresAt = fresh.expiresAt;

    const cancelled = cancelSubscriptionAutoRenew('Ít di chuyển đêm');
    assert.equal(cancelled.autoRenew, false);
    assert.equal(cancelled.cancelReason, 'Ít di chuyển đêm');
    assert.ok(typeof cancelled.cancelledAt === 'number');

    // CRITICAL: expiresAt must remain exactly unchanged!
    assert.equal(cancelled.expiresAt, originalExpiresAt);

    // Benefits must remain 100% active!
    assert.equal(isSubscriptionBenefitActive(cancelled), true);
    assert.ok(getDaysRemaining(cancelled.expiresAt) >= 29);
  });

  test('reactivateSubscriptionAutoRenew restores autoRenew without modifying expiresAt', () => {
    cancelSubscriptionAutoRenew('Tạm dừng');
    const restored = reactivateSubscriptionAutoRenew();
    assert.equal(restored.autoRenew, true);
    assert.equal(restored.cancelledAt, undefined);
    assert.equal(restored.cancelReason, undefined);
    assert.ok(isSubscriptionBenefitActive(restored));
  });

  test('formatDateVi formats date to DD/MM/YYYY accurately', () => {
    const testDate = new Date('2026-12-17T12:00:00Z').getTime();
    const formatted = formatDateVi(testDate);
    assert.match(formatted, /\d{2}\/\d{2}\/2026/);
  });

  test('expired subscription evaluates to inactive', () => {
    const past = {
      planId: 'priority_247',
      subscribedAt: Date.now() - 35 * 86400000,
      expiresAt: Date.now() - 5 * 86400000,
      autoRenew: false,
    };
    assert.equal(isSubscriptionBenefitActive(past), false);
    assert.equal(getDaysRemaining(past.expiresAt), 0);
  });
});
