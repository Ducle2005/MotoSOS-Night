import assert from 'node:assert/strict';
import test from 'node:test';
import { VOUCHER_OPTIONS } from '../data/mockRescueData';
import {
  INITIAL_NOTIFICATIONS,
  buildVoucherNotificationMessage,
  countUnreadNotifications,
  createAppNotification,
  filterNotifications,
  formatNotificationTime,
  markAllNotificationsRead,
  markNotificationRead,
} from './notificationLogic';

test('INITIAL_NOTIFICATIONS starts with 2 unread promo & safety items', () => {
  assert.equal(INITIAL_NOTIFICATIONS.length, 2);
  assert.equal(countUnreadNotifications(INITIAL_NOTIFICATIONS), 2);
  assert.equal(INITIAL_NOTIFICATIONS[0].type, 'promo');
  assert.equal(INITIAL_NOTIFICATIONS[1].type, 'safety');
});

test('filterNotifications groups chat notifications under rescue tab', () => {
  const rescue = createAppNotification({
    title: 'Đã gửi yêu cầu cứu hộ',
    message: 'Đang tìm thợ...',
    type: 'rescue',
    targetTab: 'map',
  });
  const chat = createAppNotification({
    title: 'Tin nhắn mới từ Thợ Tuấn',
    message: 'Mình tới ngay',
    type: 'chat',
    targetTab: 'map',
  });
  const list = [rescue, chat, ...INITIAL_NOTIFICATIONS];

  assert.equal(filterNotifications(list, 'all').length, 4);
  assert.equal(filterNotifications(list, 'rescue').length, 2);
  assert.equal(filterNotifications(list, 'promo').length, 1);
  assert.equal(filterNotifications(list, 'safety').length, 1);
});

test('markNotificationRead and markAllNotificationsRead update unread count accurately', () => {
  const firstId = INITIAL_NOTIFICATIONS[0].id;
  const afterSingle = markNotificationRead(INITIAL_NOTIFICATIONS, firstId);
  assert.equal(countUnreadNotifications(afterSingle), 1);

  const afterAll = markAllNotificationsRead(afterSingle);
  assert.equal(countUnreadNotifications(afterAll), 0);
});

test('formatNotificationTime returns readable Vietnamese relative labels', () => {
  const now = 1_700_000_000_000;
  assert.equal(formatNotificationTime(now - 20_000, now), 'Vừa xong');
  assert.equal(formatNotificationTime(now - 5 * 60_000, now), '5 phút trước');
  assert.equal(formatNotificationTime(now - 2 * 3_600_000, now), '2 giờ trước');
});

test('buildVoucherNotificationMessage resolves discount amount from VOUCHER_OPTIONS', () => {
  const msg = buildVoucherNotificationMessage('BANMOI25', VOUCHER_OPTIONS);
  assert.match(msg, /BANMOI25/);
  assert.match(msg, /25\.000đ/);
});
