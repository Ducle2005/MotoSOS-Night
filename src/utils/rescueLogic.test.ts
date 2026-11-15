import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FALLBACK_USER_LOCATION,
  ISSUE_OPTIONS,
  MOCK_SAFE_STATIONS,
} from '../data/mockRescueData';
import {
  buildMechanicApproachCoord,
  calculateCancelFee,
  computeActiveCarouselIndex,
  computeBoundsBox,
  computeHaversineMeters,
  estimateWalkingMinutes,
  findStationByCategory,
  formatCompactStationAddress,
  formatWalkingDistance,
  getIssueLabel,
  getNearestSafeStation,
  getNextDemoTrackingStatus,
  getStationSafetyBadgeText,
  GRACE_PERIOD_SECONDS,
  NIGHT_FUEL_COMPENSATION_FEE,
  resolvePickupTarget,
} from './rescueLogic';

test('getNearestSafeStation returns the closest station by walking meters', () => {
  const nearest = getNearestSafeStation(MOCK_SAFE_STATIONS);
  assert.ok(nearest);
  assert.equal(nearest.id, 'mock-station-circle-k');
  assert.equal(nearest.walkingDistanceMeters, 185);
});

test('resolvePickupTarget returns user current location when mode is current_location', () => {
  const result = resolvePickupTarget(
    'current_location',
    FALLBACK_USER_LOCATION,
    MOCK_SAFE_STATIONS,
    'mock-station-police',
  );
  assert.equal(result.address, FALLBACK_USER_LOCATION.address);
  assert.equal(result.station, null);
  assert.deepEqual(result.coord, FALLBACK_USER_LOCATION.coord);
});

test('resolvePickupTarget updates pickup address and coord to selected Safe Station', () => {
  const result = resolvePickupTarget(
    'safe_station',
    FALLBACK_USER_LOCATION,
    MOCK_SAFE_STATIONS,
    'mock-station-police',
  );
  assert.equal(result.title, 'Công an Phường Bến Nghé');
  assert.equal(result.address, '27 Nguyễn Trung Trực, P. Bến Nghé, Quận 1');
  assert.equal(result.station?.id, 'mock-station-police');
  assert.deepEqual(result.coord, { lat: 10.7751, lng: 106.6968 });
});

test('computeHaversineMeters and estimateWalkingMinutes return realistic values', () => {
  const meters = computeHaversineMeters(
    { lat: 10.7769, lng: 106.7009 },
    { lat: 10.7782, lng: 106.7021 },
  );
  assert.ok(meters > 150 && meters < 250);
  assert.equal(estimateWalkingMinutes(meters), 3);
});

test('getNextDemoTrackingStatus advances searching -> accepted -> completed', () => {
  assert.equal(getNextDemoTrackingStatus('searching'), 'accepted');
  assert.equal(getNextDemoTrackingStatus('accepted'), 'completed');
  assert.equal(getNextDemoTrackingStatus('completed'), 'completed');
});

test('formatWalkingDistance formats meters and minutes cleanly', () => {
  assert.equal(formatWalkingDistance(160, 2), '160m · 2 phút đi bộ');
  assert.equal(formatWalkingDistance(0, 0), '0m · 1 phút đi bộ');
});

test('getIssueLabel handles custom note, battery_jump, and null fallback', () => {
  assert.equal(getIssueLabel(null, ISSUE_OPTIONS), 'Cứu hộ xe máy khẩn cấp');
  assert.equal(getIssueLabel('flat_tire', ISSUE_OPTIONS), 'Lủng lốp');
  assert.equal(getIssueLabel('battery_jump', ISSUE_OPTIONS), 'Kích bình');
  assert.equal(
    getIssueLabel('other', ISSUE_OPTIONS, 'Đứt dây curoa'),
    'Sự cố khác (Đứt dây curoa)',
  );
});

test('findStationByCategory selects closest station of requested category', () => {
  const gasStation = findStationByCategory(MOCK_SAFE_STATIONS, 'gas_station');
  assert.equal(gasStation?.id, 'mock-station-petrolimex');
  const policeStation = findStationByCategory(MOCK_SAFE_STATIONS, 'police');
  assert.equal(policeStation?.id, 'mock-station-police');
});

test('computeBoundsBox and buildMechanicApproachCoord compute valid geographic bounds', () => {
  const bounds = computeBoundsBox([
    [106.7, 10.77],
    [106.71, 10.78],
  ]);
  assert.deepEqual(bounds, [
    [106.7, 10.77],
    [106.71, 10.78],
  ]);
  const origin = buildMechanicApproachCoord({ lat: 10.7769, lng: 106.7009 });
  assert.ok(origin.lat > 10.7769 && origin.lng < 106.7009);
  const distMeters = computeHaversineMeters({ lat: 10.7769, lng: 106.7009 }, origin);
  assert.ok(distMeters >= 700 && distMeters <= 900);
});

test('getStationSafetyBadgeText returns concise night-safety cues without duplicate 24/7 text', () => {
  assert.equal(getStationSafetyBadgeText('convenience'), 'Mở 24/7 • Đèn sáng & Camera');
  assert.equal(getStationSafetyBadgeText('gas_station'), 'Trực 24/7 • Có nhân viên');
  assert.equal(getStationSafetyBadgeText('police'), 'Trực ban 24/7 • An ninh cao');
});

test('formatCompactStationAddress strips verbose Geoapify tails and formats street + district cleanly', () => {
  assert.equal(
    formatCompactStationAddress('Ly Tu Trong Street, Saigon, Ho Chi Minh City, 71016, Vietnam'),
    'Đ. Ly Tu Trong, Q.1',
  );
  assert.equal(
    formatCompactStationAddress('84 Lê Thánh Tôn, P. Bến Nghé, Quận 1'),
    '84 Lê Thánh Tôn, Q.1',
  );
  assert.equal(
    formatCompactStationAddress('Đường Pasteur, District 3, Ho Chi Minh City, Vietnam'),
    'Đ. Pasteur, Q.3',
  );
});

test('computeActiveCarouselIndex resolves snapped card index and end-of-scroll index', () => {
  assert.equal(computeActiveCarouselIndex(0, 600, 4, 274), 0);
  assert.equal(computeActiveCarouselIndex(270, 600, 4, 274), 1);
  assert.equal(computeActiveCarouselIndex(550, 600, 4, 274), 2);
  assert.equal(computeActiveCarouselIndex(598, 600, 4, 274), 3);
  assert.equal(computeActiveCarouselIndex(100, 0, 1, 274), 0);
});

test('calculateCancelFee enforces free cancellation in grace period and 30k fee after 3 minutes', () => {
  assert.equal(GRACE_PERIOD_SECONDS, 180);
  assert.equal(NIGHT_FUEL_COMPENSATION_FEE, 30000);

  // Within 3 minutes
  const under3Min = calculateCancelFee(60);
  assert.equal(under3Min.feeAmount, 0);
  assert.equal(under3Min.isGracePeriod, true);
  assert.equal(under3Min.remainingGraceSeconds, 120);

  // Exactly at 3 minutes
  const exactly3Min = calculateCancelFee(180);
  assert.equal(exactly3Min.feeAmount, 0);
  assert.equal(exactly3Min.isGracePeriod, true);
  assert.equal(exactly3Min.remainingGraceSeconds, 0);

  // Over 3 minutes (e.g. 181s or 210s)
  const over3Min = calculateCancelFee(210);
  assert.equal(over3Min.feeAmount, 30000);
  assert.equal(over3Min.isGracePeriod, false);
  assert.equal(over3Min.remainingGraceSeconds, 0);

  // Test fast-forward toggle (forceFee)
  const forceTest = calculateCancelFee(30, true);
  assert.equal(forceTest.feeAmount, 30000);
  assert.equal(forceTest.isGracePeriod, false);
});
