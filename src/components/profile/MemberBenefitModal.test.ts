import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import { VIP_TIER_STYLES, type TierId } from './MemberBenefitModal';

describe('MemberBenefitModal Tier Definitions and Progression', () => {
  const CURRENT_POINTS = 320;
  const NEXT_TIER_POINTS = 500;

  test('current points place user accurately in Platinum tier', () => {
    assert.equal(VIP_TIER_STYLES.platinum.id, 'platinum');
    assert.equal(VIP_TIER_STYLES.platinum.name, 'Hạng Bạch Kim');
    assert.equal(VIP_TIER_STYLES.platinum.discountLabel, 'Giảm 25.000đ/chuyến');
  });

  test('calculates correct points required to reach Diamond tier', () => {
    const pointsToDiamond = NEXT_TIER_POINTS - CURRENT_POINTS;
    assert.equal(pointsToDiamond, 180);
    assert.equal(VIP_TIER_STYLES.platinum.progressPercent, 64);
  });

  test('VIP_TIER_STYLES defines all 4 tiers with unique styles and escalating luxury', () => {
    const tiers: TierId[] = ['silver', 'gold', 'platinum', 'diamond'];
    tiers.forEach((id) => {
      const cfg = VIP_TIER_STYLES[id];
      assert.ok(cfg.name.length > 0);
      assert.ok(cfg.cardStyle.includes('bg-gradient-to-br'));
      assert.ok(cfg.progressBar.length > 0);
      assert.ok(cfg.bottomText.length > 0);
    });

    // Check Silver style
    assert.ok(VIP_TIER_STYLES.silver.cardStyle.includes('from-slate-100'));
    assert.ok(VIP_TIER_STYLES.silver.progressBar.includes('#13693E'));

    // Check Gold style
    assert.ok(VIP_TIER_STYLES.gold.cardStyle.includes('from-[#FDF8EC]'));
    assert.ok(VIP_TIER_STYLES.gold.progressBar.includes('bg-amber-600'));

    // Check Platinum style
    assert.ok(VIP_TIER_STYLES.platinum.cardStyle.includes('from-[#18222F]'));

    // Check Diamond quiet luxury obsidian style
    assert.ok(VIP_TIER_STYLES.diamond.cardStyle.includes('from-[#07090C]'));
    assert.equal(VIP_TIER_STYLES.diamond.progressHeight, 'h-1');
    assert.ok(VIP_TIER_STYLES.diamond.bottomText.includes('Giảm 35.000đ mọi chuyến • Ưu tiên điều thợ số 1'));
  });
});
