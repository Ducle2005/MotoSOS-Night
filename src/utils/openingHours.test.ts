import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateOpeningHours } from './openingHours';

test('evaluateOpeningHours marks 24/7 as open at any hour', () => {
  const lateNight = new Date('2026-11-14T02:15:00');
  const res = evaluateOpeningHours('24/7', lateNight);
  assert.equal(res.isOpen, true);
  assert.equal(res.hasExplicitHours, true);
  assert.equal(res.statusLabel, 'Đang mở cửa');
});

test('evaluateOpeningHours evaluates daytime ranges accurately against current time', () => {
  const noonSaturday = new Date('2026-11-14T12:30:00'); // Saturday
  const openRes = evaluateOpeningHours('Mo-Sa 07:30-21:00; Su off', noonSaturday);
  assert.equal(openRes.isOpen, true);
  assert.equal(openRes.statusLabel, 'Đang mở cửa');

  const nightSaturday = new Date('2026-11-14T22:30:00');
  const closedRes = evaluateOpeningHours('Mo-Sa 07:30-21:00; Su off', nightSaturday);
  assert.equal(closedRes.isOpen, false);
  assert.equal(closedRes.statusLabel, 'Đã đóng cửa');

  const noonSunday = new Date('2026-11-15T12:00:00'); // Sunday
  const sundayOffRes = evaluateOpeningHours('Mo-Sa 07:30-21:00; Su off', noonSunday);
  assert.equal(sundayOffRes.isOpen, false);
});

test('evaluateOpeningHours supports overnight shifts and missing opening_hours fallback', () => {
  const afterMidnight = new Date('2026-11-14T01:30:00');
  const overnightOpen = evaluateOpeningHours('Mo-Su 18:00-03:00', afterMidnight);
  assert.equal(overnightOpen.isOpen, true);
  assert.equal(overnightOpen.statusLabel, 'Đang mở cửa');

  const noHours = evaluateOpeningHours(null, afterMidnight);
  assert.equal(noHours.isOpen, true);
  assert.equal(noHours.hasExplicitHours, false);
  assert.equal(noHours.statusLabel, 'Mở cửa • Gọi xác nhận trước');
});
