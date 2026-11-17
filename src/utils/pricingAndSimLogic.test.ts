import test from 'node:test';
import assert from 'node:assert/strict';
import { ISSUE_OPTIONS, VOUCHER_OPTIONS } from '../data/mockRescueData';
import {
  NIGHT_SURCHARGE,
  buildMechanicAutoReply,
  calculateRescuePricing,
  cleanAddressSnippet,
  computeStepEtaMinutes,
  formatVnd,
  isNightTimeWindow,
  isVoucherEligible,
  resampleRouteWaypoints,
} from './pricingAndSimLogic';

test('formatVnd formats exact VND currency cleanly with dot separators', () => {
  assert.equal(formatVnd(85000), '85.000đ');
  assert.equal(formatVnd(120000), '120.000đ');
  assert.equal(formatVnd(0), '0đ');
});

test('isVoucherEligible enforces Safe Station constraint exclusively for ANTOAN20', () => {
  const antoan = VOUCHER_OPTIONS.find((v) => v.id === 'ANTOAN20')!;
  const demkhuya = VOUCHER_OPTIONS.find((v) => v.id === 'DEMKHUYA15')!;
  assert.equal(isVoucherEligible(antoan, 'current_location'), false);
  assert.equal(isVoucherEligible(antoan, 'safe_station'), true);
  assert.equal(isVoucherEligible(demkhuya, 'current_location'), true);
});

test('calculateRescuePricing computes exact package prices and valid voucher discounts', () => {
  const baseOnly = calculateRescuePricing(
    'engine_dead',
    ISSUE_OPTIONS,
    'current_location',
    null,
    VOUCHER_OPTIONS,
  );
  assert.equal(baseOnly.basePrice, 120000);
  assert.equal(baseOnly.discountAmount, 0);
  assert.equal(baseOnly.finalPrice, 120000);

  const invalidSafeVoucher = calculateRescuePricing(
    'flat_tire',
    ISSUE_OPTIONS,
    'current_location',
    'ANTOAN20',
    VOUCHER_OPTIONS,
  );
  assert.equal(invalidSafeVoucher.basePrice, 85000);
  assert.equal(invalidSafeVoucher.discountAmount, 0);
  assert.equal(invalidSafeVoucher.finalPrice, 85000);
  assert.equal(invalidSafeVoucher.appliedVoucher, null);

  const validSafeVoucher = calculateRescuePricing(
    'flat_tire',
    ISSUE_OPTIONS,
    'safe_station',
    'ANTOAN20',
    VOUCHER_OPTIONS,
  );
  assert.equal(validSafeVoucher.basePrice, 85000);
  assert.equal(validSafeVoucher.discountAmount, 20000);
  assert.equal(validSafeVoucher.finalPrice, 65000);
  assert.equal(validSafeVoucher.appliedVoucher?.id, 'ANTOAN20');

  const newMemberVoucher = calculateRescuePricing(
    'other',
    ISSUE_OPTIONS,
    'current_location',
    'BANMOI25',
    VOUCHER_OPTIONS,
  );
  assert.equal(newMemberVoucher.basePrice, 50000);
  assert.equal(newMemberVoucher.discountAmount, 25000);
  assert.equal(newMemberVoucher.finalPrice, 25000);
});

test('resampleRouteWaypoints interpolates polyline into evenly spaced animation steps', () => {
  const waypoints = resampleRouteWaypoints(
    [
      [106.7, 10.77],
      [106.705, 10.775],
      [106.71, 10.78],
    ],
    10,
  );
  assert.equal(waypoints.length, 11);
  assert.ok(Math.abs(waypoints[0].lng - 106.7) < 1e-6);
  assert.ok(Math.abs(waypoints[10].lng - 106.71) < 1e-6);
});

test('computeStepEtaMinutes counts down smoothly to 0 on final waypoint', () => {
  assert.equal(computeStepEtaMinutes(0, 17, 6), 6);
  assert.equal(computeStepEtaMinutes(8, 17, 6), 3);
  assert.equal(computeStepEtaMinutes(16, 17, 6), 0);
});

test('buildMechanicAutoReply crafts context-aware responses for quick suggestions', () => {
  const reply = buildMechanicAutoReply(
    'Mình đang đứng ở Trạm An Toàn sáng đèn',
    'Circle K Lê Thánh Tôn',
    4,
  );
  assert.ok(reply.includes('Circle K Lê Thánh Tôn'));
  assert.ok(reply.includes('4 phút'));
});

test('isNightTimeWindow evaluates simulateNight flag and default hours', () => {
  assert.equal(isNightTimeWindow(true), true);
  assert.equal(isNightTimeWindow(false), false);
  assert.equal(typeof isNightTimeWindow(), 'boolean');
});

test('calculateRescuePricing applies night surcharge and approved scope item cost', () => {
  assert.equal(NIGHT_SURCHARGE, 20000);

  // Flat tire (85k) + night surcharge (20k) = 105k
  const nightPricing = calculateRescuePricing(
    'flat_tire',
    ISSUE_OPTIONS,
    'current_location',
    null,
    VOUCHER_OPTIONS,
    true,
  );
  assert.equal(nightPricing.basePrice, 85000);
  assert.equal(nightPricing.nightSurcharge, 20000);
  assert.equal(nightPricing.finalPrice, 105000);

  // Flat tire (85k) + night (20k) - ANTOAN20 (20k) + spark plug extra (45k) = 130k
  const fullPricing = calculateRescuePricing(
    'flat_tire',
    ISSUE_OPTIONS,
    'safe_station',
    'ANTOAN20',
    VOUCHER_OPTIONS,
    true,
    45000,
    'Thay bugi NGK chính hãng',
  );
  assert.equal(fullPricing.basePrice, 85000);
  assert.equal(fullPricing.nightSurcharge, 20000);
  assert.equal(fullPricing.discountAmount, 20000);
  assert.equal(fullPricing.extraCost, 45000);
  assert.equal(fullPricing.extraItemTitle, 'Thay bugi NGK chính hãng');
  assert.equal(fullPricing.finalPrice, 130000);
});

test('calculateRescuePricing applies membership discount and waives night fee when plan supports it', () => {
  // Flat tire 85k with priority_247 (30% discount = 25.5k, night fee waived)
  const priorityPricing = calculateRescuePricing(
    'flat_tire',
    ISSUE_OPTIONS,
    'current_location',
    null,
    VOUCHER_OPTIONS,
    true, // isNight
    0,
    undefined,
    false,
    'priority_247',
  );
  assert.equal(priorityPricing.basePrice, 85000);
  assert.equal(priorityPricing.isNightWaivedByMember, true);
  assert.equal(priorityPricing.nightSurcharge, 0);
  assert.equal(priorityPricing.memberDiscountAmount, 25500);
  assert.equal(priorityPricing.finalPrice, 85000 - 25500);

  // Daily plan without night fee waiver
  const litePricing = calculateRescuePricing(
    'flat_tire',
    ISSUE_OPTIONS,
    'current_location',
    null,
    VOUCHER_OPTIONS,
    true, // isNight
    0,
    undefined,
    false,
    'moto_lite_7d', // 15% max 20k, nightFeeWaived: false
  );
  assert.equal(litePricing.basePrice, 85000);
  assert.equal(litePricing.isNightWaivedByMember, false);
  assert.equal(litePricing.nightSurcharge, 20000);
  // 15% of 85k is 12750
  assert.equal(litePricing.memberDiscountAmount, 12750);
  assert.equal(litePricing.finalPrice, 85000 + 20000 - 12750);
});

test('cleanAddressSnippet cleans Street, Saigon, Ho Chi Minh and formats clean street snippet', () => {
  const result = cleanAddressSnippet('Circle K', 'Ly Tu Trong Street, Saigon, Ho Chi Minh');
  assert.equal(result, 'Circle K, Đ. Lý Tự Trọng');

  const result2 = cleanAddressSnippet('Trạm An Toàn 24/7', 'Hai Ba Trung Street, District 1, Ho Chi Minh City, Vietnam');
  assert.equal(result2, 'Trạm An Toàn 24/7, Đ. Hai Bà Trưng');
});

