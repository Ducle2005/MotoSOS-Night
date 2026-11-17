import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import { PROMO_PROGRAMS } from '../data/membershipCatalog';

describe('PromoCarouselTab Filter Categories & Promotions', () => {
  test('all filter includes exactly 6 promo programs', () => {
    assert.equal(PROMO_PROGRAMS.length, 6);
  });

  test('members filter matches promos for all members (4 items)', () => {
    const memberPromos = PROMO_PROGRAMS.filter((p) => p.eligibleTiers.includes('Tất cả'));
    assert.equal(memberPromos.length, 4);
    const codes = memberPromos.map((p) => p.code);
    assert.deepEqual(codes, ['BANMOI25', 'ANTOAN20', 'DEMKHUYA15', 'MUAANHTHAN']);
  });

  test('vip filter matches exclusive VIP and Specialized tiers (2 items)', () => {
    const vipPromos = PROMO_PROGRAMS.filter((p) => !p.eligibleTiers.includes('Tất cả'));
    assert.equal(vipPromos.length, 2);
    const codes = vipPromos.map((p) => p.code);
    assert.deepEqual(codes, ['VIP50K', 'FREEDEM']);
  });

  test('every promo program has positive discount amount and non-empty condition', () => {
    PROMO_PROGRAMS.forEach((promo) => {
      assert.ok(promo.discountAmount > 0, `Discount must be positive: ${promo.code}`);
      assert.ok(promo.title.length > 0, `Title must not be empty: ${promo.code}`);
      assert.ok(promo.condition.length > 0, `Condition must not be empty: ${promo.code}`);
    });
  });
});
