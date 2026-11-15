import type {
  AppNotification,
  NotificationFilterTab,
  TriggerNotificationInput,
} from '../types/notification';
import type { VoucherId, VoucherOption } from '../types/rescue';
import { formatVnd } from './pricingAndSimLogic';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'seed-welcome-banmoi25',
    title: 'Chào mừng tới MotoSOS Priority — Tặng mã BANMOI25 giảm 25.000đ',
    message: 'Áp dụng ngay mã BANMOI25 cho chuyến cứu hộ đầu tiên trong hôm nay.',
    type: 'promo',
    timestamp: Date.now() - 3 * 60 * 1000,
    isRead: false,
    targetTab: 'home',
  },
  {
    id: 'seed-night-safety',
    title: 'Cảnh báo an toàn đêm: Luôn ưu tiên chờ thợ tại Trạm An Toàn 24/7',
    message: 'Chọn điểm đón có đèn sáng, camera và bảo vệ 24/7 khi xe gặp sự cố ban đêm.',
    type: 'safety',
    timestamp: Date.now() - 12 * 60 * 1000,
    isRead: false,
    targetTab: 'safety',
  },
];

export function filterNotifications(
  items: AppNotification[],
  tab: NotificationFilterTab,
): AppNotification[] {
  if (tab === 'all') return items;
  if (tab === 'rescue') {
    return items.filter((item) => item.type === 'rescue' || item.type === 'chat');
  }
  return items.filter((item) => item.type === tab);
}

export function countUnreadNotifications(items: AppNotification[]): number {
  return items.reduce((acc, item) => acc + (item.isRead ? 0 : 1), 0);
}

export function markNotificationRead(
  items: AppNotification[],
  id: string,
): AppNotification[] {
  return items.map((item) => (item.id === id ? { ...item, isRead: true } : item));
}

export function markAllNotificationsRead(items: AppNotification[]): AppNotification[] {
  return items.map((item) => (item.isRead ? item : { ...item, isRead: true }));
}

export function createAppNotification(
  input: TriggerNotificationInput,
  nowMs = Date.now(),
  uniqueSuffix = Math.random().toString(36).slice(2, 7),
): AppNotification {
  return {
    id: `notif-${nowMs}-${uniqueSuffix}`,
    title: input.title,
    message: input.message,
    type: input.type,
    timestamp: nowMs,
    isRead: false,
    targetTab: input.targetTab,
  };
}

export function formatNotificationTime(timestamp: number, nowMs = Date.now()): string {
  const diffSec = Math.max(0, Math.floor((nowMs - timestamp) / 1000));
  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const d = new Date(timestamp);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function buildVoucherNotificationMessage(
  voucherId: VoucherId,
  vouchers: VoucherOption[],
): string {
  const matched = vouchers.find((v) => v.id === voucherId);
  if (!matched) return `Đã áp dụng mã ${voucherId} vào đơn cứu hộ.`;
  return `Mã ${matched.code} giảm ${formatVnd(matched.discountAmount)} đã được áp dụng.`;
}
