import { memo } from 'react';
import { MessageSquare, Shield, ShieldAlert, Sparkles } from 'lucide-react';
import type { AppNotification } from '../../types/notification';
import { formatNotificationTime } from '../../utils/notificationLogic';

interface NotificationItemRowProps {
  item: AppNotification;
  onSelect: (item: AppNotification) => void;
}

export const NotificationItemRow = memo(function NotificationItemRow({
  item,
  onSelect,
}: NotificationItemRowProps) {
  const isUnread = !item.isRead;

  return (
    <button
      type="button"
      data-testid={`notif-item-${item.id}`}
      onClick={() => onSelect(item)}
      className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors cursor-pointer ${
        isUnread ? 'bg-[#F4FBF7] hover:bg-[#EDF8F2]' : 'bg-white hover:bg-slate-50/80'
      }`}
    >
      {/* Cột trái — Icon tròn phân loại */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          item.type === 'rescue'
            ? 'bg-[#E6F4EC] text-[#13693E]'
            : item.type === 'promo'
            ? 'bg-amber-50 text-amber-600'
            : item.type === 'safety'
            ? 'bg-rose-50 text-rose-600'
            : 'bg-indigo-50 text-indigo-600'
        }`}
      >
        {item.type === 'rescue' && <Shield className="w-4.5 h-4.5" />}
        {item.type === 'promo' && <Sparkles className="w-4.5 h-4.5" />}
        {item.type === 'safety' && <ShieldAlert className="w-4.5 h-4.5" />}
        {item.type === 'chat' && <MessageSquare className="w-4.5 h-4.5" />}
      </div>

      {/* Cột phải — Nội dung gọn 2 tầng */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-[#13693E] shrink-0" aria-label="Chưa đọc" />
            )}
            <p className={`text-[13px] truncate ${isUnread ? 'font-extrabold text-slate-950' : 'font-semibold text-slate-800'}`}>
              {item.title}
            </p>
          </div>
          <span className="text-[10.5px] font-medium text-slate-400 shrink-0">
            {formatNotificationTime(item.timestamp)}
          </span>
        </div>
        <p className="mt-0.5 text-[12px] text-slate-600 leading-[1.4] line-clamp-2">
          {item.message}
        </p>
      </div>
    </button>
  );
});
