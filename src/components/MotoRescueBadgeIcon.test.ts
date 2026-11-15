import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveBadgeVariant } from './MotoRescueBadgeIcon';

describe('MotoRescueBadgeIcon', () => {
  it('resolves promo and safety types properly', () => {
    assert.strictEqual(resolveBadgeVariant('promo', 'Ưu đãi đặc biệt'), 'promo');
    assert.strictEqual(resolveBadgeVariant('safety', 'Cảnh báo ngập lụt'), 'sos');
    assert.strictEqual(resolveBadgeVariant('sos', 'Khẩn cấp'), 'sos');
    assert.strictEqual(resolveBadgeVariant('chat', 'Tin nhắn từ thợ'), 'chat');
  });

  it('resolves title keywords to en_route, verified, and dispatch variants', () => {
    assert.strictEqual(resolveBadgeVariant('rescue', 'Thợ Tuấn đang tới điểm hẹn'), 'en_route');
    assert.strictEqual(resolveBadgeVariant('rescue', 'Thợ đang di chuyển'), 'en_route');
    assert.strictEqual(resolveBadgeVariant('rescue', 'Đã hoàn tất ca cứu hộ'), 'verified');
    assert.strictEqual(resolveBadgeVariant('rescue', 'Xác thực OTP thành công'), 'verified');
    assert.strictEqual(resolveBadgeVariant('rescue', 'Đã gửi yêu cầu cứu hộ'), 'dispatch');
  });
});
