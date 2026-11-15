import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { BellRing, X } from 'lucide-react';
import type {
  AppNotification,
  BrowserPushPermission,
  NotificationFilterTab,
} from '../../types/notification';
import { filterNotifications } from '../../utils/notificationLogic';
import { NotificationItemRow } from './NotificationItemRow';

interface NotificationCenterModalProps {
  isOpen: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  permission: BrowserPushPermission;
  isDevicePushEnabled: boolean;
  onToggleDevicePush: () => void;
  onMarkAllRead: () => void;
  onSelectNotification: (item: AppNotification) => void;
  onClose: () => void;
}

const FILTER_TABS: Array<{ id: NotificationFilterTab; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'rescue', label: 'Cứu hộ' },
  { id: 'promo', label: 'Ưu đãi' },
  { id: 'safety', label: 'An toàn' },
];

export function NotificationCenterModal({
  isOpen,
  notifications,
  unreadCount,
  permission,
  isDevicePushEnabled,
  onToggleDevicePush,
  onMarkAllRead,
  onSelectNotification,
  onClose,
}: NotificationCenterModalProps) {
  const [activeFilter, setActiveFilter] = useState<NotificationFilterTab>('all');

  const visibleItems = useMemo(
    () => filterNotifications(notifications, activeFilter),
    [notifications, activeFilter],
  );

  if (!isOpen || typeof document === 'undefined') return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Thông báo"
      data-testid="notification-center-modal"
      className="fixed inset-0 z-[999] bg-slate-950/40 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] max-h-[86vh] bg-white rounded-t-[24px] sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Thanh nắm kéo mảnh căn giữa ở đỉnh */}
        <div className="w-9 h-1 rounded-full bg-slate-200 mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Hàng tiêu đề */}
        <div className="px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h2 className="text-[19px] font-extrabold text-slate-950 tracking-tight">Thông báo</h2>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-2xs">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              data-testid="mark-all-read-btn"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className={`text-xs font-bold transition-colors whitespace-nowrap focus:outline-none ${
                unreadCount > 0
                  ? 'text-[#13693E] hover:underline cursor-pointer'
                  : 'text-slate-400 cursor-default'
              }`}
            >
              {unreadCount > 0 ? 'Đọc tất cả' : 'Đã đọc tất cả'}
            </button>

            <button
              type="button"
              aria-label="Đóng thông báo"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Thanh trạng thái thông báo đẩy siêu mảnh */}
        <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-[#F4F8F6] border border-emerald-600/10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <BellRing className="h-4 w-4 shrink-0 text-[#13693E]" aria-hidden="true" />
            <span className="truncate text-xs font-semibold text-slate-700">Thông báo đẩy thiết bị</span>
          </div>
          <button
            type="button"
            data-testid="toggle-device-push-btn"
            onClick={() => {
              try {
                onToggleDevicePush();
              } catch {}
            }}
            disabled={permission === 'unsupported'}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all active:scale-95 ${
              permission === 'unsupported'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isDevicePushEnabled
                ? 'bg-[#13693E] text-white shadow-2xs'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            {permission === 'unsupported' ? 'Không hỗ trợ' : isDevicePushEnabled ? 'Đã bật' : 'Bật ngay'}
          </button>
        </div>

        {/* Thanh tab lọc gạch chân kiểu Grab */}
        <div className="px-4 border-b border-slate-100 flex items-center gap-5 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {FILTER_TABS.map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`notif-filter-${tab.id}`}
                onClick={() => setActiveFilter(tab.id)}
                className={`py-2.5 text-xs transition-colors relative whitespace-nowrap ${
                  active ? 'text-[#13693E] font-bold' : 'text-slate-500 font-medium hover:text-slate-800'
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#13693E] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Danh sách thông báo phẳng mật độ cao */}
        <div className="flex-1 overflow-y-auto bg-white divide-y divide-slate-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {visibleItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-400">Chưa có thông báo nào trong mục này</p>
            </div>
          ) : (
            visibleItems.map((item) => (
              <NotificationItemRow
                key={item.id}
                item={item}
                onSelect={onSelectNotification}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
