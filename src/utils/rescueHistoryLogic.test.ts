import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_RESCUE_HISTORY,
  buildReceiptPlainText,
  calculateHistoryStats,
  formatCompletedAtDate,
  generateRescueReceiptId,
  resolveReplacedParts,
} from './rescueHistoryLogic';

test('DEFAULT_RESCUE_HISTORY contains 3 initial valid sample items with clean Vietnamese addresses', () => {
  assert.equal(DEFAULT_RESCUE_HISTORY.length, 3);
  const first = DEFAULT_RESCUE_HISTORY[0];
  assert.equal(first.id, 'MS-8492');
  assert.equal(first.serviceName, 'Lủng lốp');
  assert.equal(first.locationAddress, 'Đ. Mạc Thị Bưởi, P. Bến Nghé, Q.1');
  assert.equal(first.finalPrice, 65000);
});

test('resolveReplacedParts returns detailed technical specs per issue type', () => {
  assert.match(resolveReplacedParts('flat_tire'), /Vá ép nấm/);
  assert.match(resolveReplacedParts('engine_dead'), /bugi/);
  assert.match(resolveReplacedParts('out_of_fuel'), /xăng RON 95/);
  assert.match(resolveReplacedParts('battery_jump'), /ắc quy/);
  assert.equal(resolveReplacedParts('other', 'Đứt sên'), 'Cứu hộ khẩn cấp: Đứt sên');
});

test('generateRescueReceiptId creates MS-xxxx prefixed code', () => {
  const id = generateRescueReceiptId();
  assert.match(id, /^MS-\d{4}$/);
});

test('formatCompletedAtDate formats readable date string', () => {
  const fixedDate = new Date(2026, 10, 14, 23, 42); // 14/11/2026
  assert.equal(formatCompletedAtDate(fixedDate), '23:42 • 14/11/2026');
});

test('calculateHistoryStats sums trips and discounts accurately', () => {
  const stats = calculateHistoryStats(DEFAULT_RESCUE_HISTORY);
  assert.equal(stats.totalTrips, 3);
  assert.equal(stats.totalSavedAmount, 20000 + 15000 + 25000);
  assert.equal(stats.totalSpent, 65000 + 75000 + 55000);
});

test('buildReceiptPlainText compiles complete copyable receipt', () => {
  const text = buildReceiptPlainText(DEFAULT_RESCUE_HISTORY[0]);
  assert.match(text, /MS-8492/);
  assert.match(text, /65\.000đ/);
  assert.match(text, /59-P2 842\.19/);
});

test('createRescueReceiptFromOrder persists rescueOtp and formats in buildReceiptPlainText', () => {
  const receipt = {
    ...DEFAULT_RESCUE_HISTORY[0],
    rescueOtp: '5821',
    nightSurcharge: 20000,
    extraCost: 45000,
    extraItemTitle: 'Thay bugi NGK chính hãng',
  };
  const text = buildReceiptPlainText(receipt);
  assert.match(text, /OTP xác thực: #5821/);
  assert.match(text, /Phụ phí đêm khuya \(22h - 5h\): \+20\.000đ/);
  assert.match(text, /Phát sinh đã duyệt: \+45\.000đ/);
  assert.match(text, /Bảo hành kỹ thuật điện tử 7 ngày/);
  assert.match(text, /Bảo hiểm trách nhiệm dân sự/);
});
