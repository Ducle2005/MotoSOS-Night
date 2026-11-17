import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  MEMBERSHIP_GROUPS,
  MEMBERSHIP_PLANS,
  PROMO_PROGRAMS,
  getActiveMembershipId,
  getActivePurchasedMembership,
  getMembershipPlan,
  getPurchasedMemberships,
  purchaseOrSwitchMembership,
  setActiveMembershipId,
} from './membershipCatalog';

describe('membershipCatalog 15 Cards & Promos Data Integrity', () => {
  test('has exactly 15 membership plans divided into 3 groups with 5 cards each', () => {
    assert.equal(MEMBERSHIP_PLANS.length, 15);
    assert.equal(MEMBERSHIP_GROUPS.length, 3);

    const groupIds = MEMBERSHIP_GROUPS.map((g) => g.id);
    assert.deepEqual(groupIds, ['daily', 'pro', 'vip']);

    MEMBERSHIP_GROUPS.forEach((group) => {
      const cardsInGroup = MEMBERSHIP_PLANS.filter((p) => p.group === group.id);
      assert.equal(cardsInGroup.length, 5, `Group ${group.id} must have exactly 5 cards`);
    });
  });

  test('driver group is completely removed and old driver IDs fallback to priority_247', () => {
    const driverIds = ['driver_day', 'driver_night', 'shipper_express', 'driver_pro_quarter', 'street_god_year'];
    driverIds.forEach((id) => {
      assert.ok(!MEMBERSHIP_PLANS.some((p) => p.id === id), `Driver plan ${id} must not exist`);
      const fallback = getMembershipPlan(id);
      assert.equal(fallback.id, 'priority_247');
    });
  });

  test('every plan has unique id, valid pricing, discount limit and 3 highlights', () => {
    const ids = new Set<string>();
    MEMBERSHIP_PLANS.forEach((plan) => {
      assert.ok(!ids.has(plan.id), `Duplicate ID: ${plan.id}`);
      ids.add(plan.id);

      assert.ok(plan.name.length > 0);
      assert.ok(plan.price > 0);
      assert.ok(plan.discountPercent >= 10 && plan.discountPercent <= 50);
      assert.ok(plan.maxDiscountPerOrder > 0);
      assert.ok(plan.monthlyQuota > 0);
      assert.ok(plan.insuranceLimit >= 20000000);
      assert.ok(plan.cardGradient.length > 0);
      assert.equal(plan.highlights.length, 3, `${plan.id} must have exactly 3 highlights`);
    });
  });

  test('default plan is priority_247 with nightFeeWaived enabled', () => {
    const defaultPlan = getMembershipPlan('priority_247');
    assert.equal(defaultPlan.id, 'priority_247');
    assert.equal(defaultPlan.name, 'Priority 24/7');
    assert.equal(defaultPlan.nightFeeWaived, true);
    assert.equal(defaultPlan.discountPercent, 30);
  });

  test('promo programs contains 6 transparent promotions', () => {
    assert.equal(PROMO_PROGRAMS.length, 6);
    const codes = PROMO_PROGRAMS.map((p) => p.code);
    assert.deepEqual(codes, ['BANMOI25', 'ANTOAN20', 'DEMKHUYA15', 'VIP50K', 'FREEDEM', 'MUAANHTHAN']);
  });

  test('fallback returns priority_247 plan if id is invalid or empty', () => {
    const plan = getMembershipPlan('non_existent_id');
    assert.equal(plan.id, 'priority_247');
    const emptyPlan = getMembershipPlan('');
    assert.equal(emptyPlan.id, 'priority_247');
  });

  test('purchased memberships defaults to priority_247 with valid quota and card number', () => {
    const list = getPurchasedMemberships();
    assert.ok(list.length >= 1);
    const active = getActivePurchasedMembership();
    assert.equal(active.record.id, 'priority_247');
    assert.equal(active.record.status, 'active');
    assert.equal(active.record.cardNumber, 'MS-VIP-8429');
    assert.equal(active.record.remainingQuota, 4);
    assert.equal(active.record.totalQuota, 4);
    assert.equal(active.record.savedAmount, 65000);
  });

  test('purchaseOrSwitchMembership activates target plan and syncs active status', () => {
    purchaseOrSwitchMembership('ev_hybrid');
    const active = getActivePurchasedMembership();
    assert.equal(active.record.id, 'ev_hybrid');
    assert.equal(active.record.status, 'active');
    assert.equal(active.plan.name, 'Xe Điện & Hybrid');
    assert.equal(active.record.totalQuota, 3);
    assert.equal(active.record.remainingQuota, 3);

    // Switch back to priority_247
    purchaseOrSwitchMembership('priority_247');
    const restored = getActivePurchasedMembership();
    assert.equal(restored.record.id, 'priority_247');
    assert.equal(restored.record.status, 'active');
  });
});
