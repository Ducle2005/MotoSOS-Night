import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  MEMBERSHIP_GROUPS,
  MEMBERSHIP_PLANS,
  PROMO_PROGRAMS,
  getActiveMembershipId,
  getMembershipPlan,
  setActiveMembershipId,
} from './membershipCatalog';

describe('membershipCatalog 20 Cards & Promos Data Integrity', () => {
  test('has exactly 20 membership plans divided into 4 groups with 5 cards each', () => {
    assert.equal(MEMBERSHIP_PLANS.length, 20);
    assert.equal(MEMBERSHIP_GROUPS.length, 4);

    MEMBERSHIP_GROUPS.forEach((group) => {
      const cardsInGroup = MEMBERSHIP_PLANS.filter((p) => p.group === group.id);
      assert.equal(cardsInGroup.length, 5, `Group ${group.id} must have exactly 5 cards`);
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

  test('fallback returns priority_247 plan if id is invalid', () => {
    const plan = getMembershipPlan('non_existent_id');
    assert.equal(plan.id, 'priority_247');
  });
});
