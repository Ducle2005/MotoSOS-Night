import { CheckCheck, ChevronDown, ChevronUp, PlusCircle, ShieldAlert, Sparkles, Wrench, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '../../context/NotificationContext';
import type { AppNotification } from '../../types/notification';
import { GrabToggle } from '../ui/GrabToggle';

interface Props { isOpen: boolean; onClose: () => void; }
interface NotifPrefs { mechanicLive: boolean; safetyAlerts: boolean; promos: boolean; soundVibration: boolean; }
const PREF_KEY = 'motosos_notif_prefs';
const DEFAULT_PREFS: NotifPrefs = { mechanicLive: true, safetyAlerts: true, promos: true, soundVibration: true };
const PREF_ITEMS: Array<{ key: keyof NotifPrefs; label: string; desc: string }> = [
  { key: 'mechanicLive', label: 'Trạng thái thợ cứu hộ trực tiếp', desc: 'Cập nhật trạng thái nhận đơn, đang đến và hoàn tất' },
  { key: 'safetyAlerts', label: 'Cảnh báo an toàn & chia sẻ SOS', desc: 'Cảnh báo điểm nóng ban đêm và tín hiệu khẩn cấp' },
  { key: 'promos', label: 'Ưu đãi & hạng thành viên', desc: 'Mã giảm giá mới và nhắc gia hạn quyền lợi cứu hộ' },
  { key: 'soundVibration', label: 'Âm thanh & rung thông báo', desc: 'Phát chuông âm lượng nhẹ chuẩn Grab Quiet Luxury' },
];

export function NotificationsModal({ isOpen, onClose }: Props) {
  const notif = useNotifications();
  const [tab, setTab] = useState<'inbox' | 'settings'>('inbox');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [prefs, setPrefs] = useState<NotifPrefs>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFS;
    try { const raw = localStorage.getItem(PREF_KEY); return raw ? JSON.parse(raw) : DEFAULT_PREFS; } catch { return DEFAULT_PREFS; }
  });

  const togglePref = (key: keyof NotifPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    if (typeof window !== 'undefined') localStorage.setItem(PREF_KEY, JSON.stringify(next));
  };

  const filteredItems = useMemo(() => notif.notifications.filter((n) => filter === 'all' || !n.isRead), [notif.notifications, filter]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleItemClick = (item: AppNotification) => {
    if (!item.isRead) notif.markAsRead(item.id);
    setExpandedId(expandedId === item.id ? null : item.id);
  };

  const handleSendTestNotif = () => {
    notif.triggerNotification({
      title: 'Kỹ thuật viên đã xuất phát', message: 'Kỹ thuật viên Nguyễn Văn Bình (59-S2 999.88) đang di chuyển tới vị trí của bạn.',
      type: 'rescue', targetTab: 'map',
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] bg-slate-950/60 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[430px] max-h-[88vh] bg-white rounded-t-[26px] sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-950 tracking-tight">Thông báo</h2>
            {notif.unreadCount > 0 && <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10.5px] font-extrabold">{notif.unreadCount} mới</span>}
          </div>
          <div className="flex items-center gap-3">
            {tab === 'inbox' && notif.unreadCount > 0 && (
              <button type="button" onClick={notif.markAllAsRead} className="text-xs font-bold text-[#13693E] hover:underline flex items-center gap-1">
                <CheckCheck className="h-3.5 w-3.5" /><span>Đọc tất cả</span>
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Đóng" className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-slate-100 px-5 gap-6 text-xs font-bold shrink-0">
          <button type="button" onClick={() => setTab('inbox')} className={`py-3 relative ${tab === 'inbox' ? 'text-[#13693E]' : 'text-slate-400 hover:text-slate-600'}`}>
            <span>Hộp thư ({notif.notifications.length})</span>
            {tab === 'inbox' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#13693E] rounded-full" />}
          </button>
          <button type="button" onClick={() => setTab('settings')} className={`py-3 relative ${tab === 'settings' ? 'text-[#13693E]' : 'text-slate-400 hover:text-slate-600'}`}>
            <span>Tùy chỉnh nhận tin</span>
            {tab === 'settings' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#13693E] rounded-full" />}
          </button>
        </div>

        {tab === 'inbox' ? (
          <div className="flex-1 overflow-y-auto flex flex-col [&::-webkit-scrollbar]:hidden">
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <button type="button" onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${filter === 'all' ? 'bg-[#13693E] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                Tất cả ({notif.notifications.length})
              </button>
              <button type="button" onClick={() => setFilter('unread')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${filter === 'unread' ? 'bg-[#13693E] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                Chưa đọc ({notif.unreadCount})
              </button>
            </div>

            <div className="flex-1 divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-semibold">Chưa có thông báo nào</div>
              ) : (
                filteredItems.map((item) => {
                  const isExp = expandedId === item.id;
                  return (
                    <div key={item.id} onClick={() => handleItemClick(item)} className={`px-5 py-3.5 transition-colors cursor-pointer ${item.isRead ? 'bg-white hover:bg-slate-50/50' : 'bg-emerald-50/30 hover:bg-emerald-50/50'}`}>
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                          item.type === 'rescue' ? 'bg-emerald-100 text-[#13693E]' : item.type === 'promo' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.type === 'rescue' ? <Wrench className="h-3.5 w-3.5" /> : item.type === 'promo' ? <Sparkles className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs ${item.isRead ? 'font-bold text-slate-800' : 'font-black text-slate-950'}`}>{item.title}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className={`mt-0.5 text-xs text-slate-600 ${isExp ? '' : 'line-clamp-2'}`}>{item.message}</p>
                        </div>
                        {isExp ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-300 shrink-0" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
              <button type="button" onClick={handleSendTestNotif} className="w-full py-2.5 rounded-xl border border-dashed border-[#13693E] bg-emerald-50/60 hover:bg-emerald-100/60 text-[#13693E] text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                <PlusCircle className="h-4 w-4" /><span>Gửi tin thông báo thử nghiệm</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <p className="text-xs text-slate-500">Tùy chỉnh các kênh bạn muốn MotoSOS gửi cập nhật tức thì.</p>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
              {PREF_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 px-2">
                  <div className="pr-3">
                    <p className="text-xs font-bold text-slate-800">{item.label}</p>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                  <GrabToggle checked={prefs[item.key]} onChange={() => togglePref(item.key)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
export default NotificationsModal;
