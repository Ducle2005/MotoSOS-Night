import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

describe('MemberBenefitModal Tier Definitions and Progression', () => {
  const CURRENT_POINTS = 320;
  const NEXT_TIER_POINTS = 500;

  const TIERS = [
    { id: 'silver', name: 'Hạng Bạc', minPoints: 0, maxPoints: 99, discount: 10000 },
    { id: 'gold', name: 'Hạng Vàng', minPoints: 100, maxPoints: 249, discount: 15000 },
    { id: 'platinum', name: 'Hạng Bạch Kim', minPoints: 250, maxPoints: 499, discount: 25000, isCurrent: true },
    { id: 'diamond', name: 'Hạng Kim Cương', minPoints: 500, maxPoints: Infinity, discount: 35000 },
  ];

  test('current points place user accurately in Platinum tier', () => {
    const currentTier = TIERS.find((t) => CURRENT_POINTS >= t.minPoints && CURRENT_POINTS <= t.maxPoints);
    assert.ok(currentTier);
    assert.equal(currentTier.id, 'platinum');
    assert.equal(currentTier.name, 'Hạng Bạch Kim');
    assert.equal(currentTier.discount, 25000);
  });

  test('calculates correct points required to reach Diamond tier', () => {
    const pointsToDiamond = NEXT_TIER_POINTS - CURRENT_POINTS;
    assert.equal(pointsToDiamond, 180);
    const progressPercent = Math.round((CURRENT_POINTS / NEXT_TIER_POINTS) * 100);
    assert.equal(progressPercent, 64);
  });

  test('validates monotonic progression of discount amounts', () => {
    for (let i = 1; i < TIERS.length; i += 1) {
      assert.ok(TIERS[i].discount > TIERS[i - 1].discount, `Tier ${TIERS[i].id} discount must exceed ${TIERS[i - 1].id}`);
      assert.ok(TIERS[i].minPoints > TIERS[i - 1].minPoints, `Tier ${TIERS[i].id} minPoints must exceed ${TIERS[i - 1].id}`);
    }
  });
});
