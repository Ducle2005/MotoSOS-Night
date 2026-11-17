import { Check, ExternalLink, HeartHandshake, MessageCircle, Phone, RotateCw, Send, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { profileRepo } from '../../repositories/storageRepository';
import type { ActiveLocation, ActiveRescueInfo } from '../../types/rescue';
import {
  buildSosSharePayload, copyTextSafely, getExactUserCoordinates,
  shareViaMessenger, shareViaZalo, type ExactLocationResult,
} from '../../utils/sosLocationShare';

interface EmergencyContactModalProps {
  isOpen: boolean; onClose: () => void; onTriggerSos?: (phone: string) => void;
  activeLocation?: ActiveLocation | null; activeRescue?: ActiveRescueInfo | null;
}

export function EmergencyContactModal({
  isOpen, onClose, onTriggerSos, activeLocation, activeRescue,
}: EmergencyContactModalProps) {
  const [phone, setPhone] = useState('0946499329');
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);
  const [locResult, setLocResult] = useState<ExactLocationResult>({
    lat: activeLocation?.lat ?? 10.7769, lng: activeLocation?.lng ?? 106.7009,
    latStr: (activeLocation?.lat ?? 10.7769).toFixed(6), lngStr: (activeLocation?.lng ?? 106.7009).toFixed(6),
    address: activeLocation?.address ?? '63 Đường Lý Tự Trọng, P. Bến Thành, Q.1',
    source: activeLocation?.isCurrentGPS ? 'gps' : 'map_pin',
    sourceLabel: activeLocation?.isCurrentGPS ? 'GPS thực tế' : 'Tọa độ điểm đón trên bản đồ',
  });

  const fetchGps = async () => {
    setIsRefreshingGps(true);
    const res = await getExactUserCoordinates(activeLocation);
    setLocResult(res);
    setIsRefreshingGps(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    setPhone(profileRepo.getEmergencyContact() || '0946499329');
    fetchGps();
  }, [isOpen, activeLocation]);

  if (!isOpen || typeof document === 'undefined') return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getPayload = () => buildSosSharePayload({
    location: locResult, address: locResult.address, activeRescue,
  });

  const handleCopyCoords = async () => {
    const text = `${locResult.latStr}, ${locResult.lngStr}`;
    if (await copyTextSafely(text)) showToast(`Đã sao chép tọa độ: ${text}`);
  };

  const handleCopyMapsLink = async () => {
    if (await copyTextSafely(getPayload().pinUrl)) showToast('Đã sao chép link Google Maps!');
  };

  const handleSendZalo = async () => {
    const res = await shareViaZalo(phone || '0946499329', getPayload());
    showToast(res.message);
    if (onTriggerSos) onTriggerSos(phone);
  };

  const handleSendMessenger = async () => {
    const res = await shareViaMessenger(getPayload());
    showToast(res.message);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.trim();
    if (!clean) return;
    profileRepo.saveEmergencyContact(clean);
    setIsSaved(true);
    setTimeout(() => { setIsSaved(false); onClose(); }, 450);
  };

  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label="Cài đặt SOS Gia đình"
      className="fixed inset-0 z-[999] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] rounded-t-[28px] border-t border-slate-100 bg-white p-5 shadow-2xl sm:rounded-[28px] sm:border overflow-hidden"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <HeartHandshake className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">SOS Gia đình</h2>
              <p className="text-xs text-slate-500">Người thân nhận cảnh báo khẩn cấp khi xe gặp nạn</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cảnh báo an toàn */}
        <div className="mt-3.5 rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-xs text-rose-900 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <p className="leading-snug">Khi bạn gửi SOS, hệ thống tự động soạn sẵn vị trí thực tế kèm link Google Maps gửi ngay tới người thân.</p>
        </div>

        {/* Khung hiển thị tọa độ GPS trực tiếp */}
        <div className="mt-3 rounded-2xl bg-[#F4F8F6] border border-emerald-600/15 p-3 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
              locResult.source === 'gps' ? 'bg-emerald-100 text-[#13693E]' : 'bg-amber-100 text-amber-800'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${locResult.source === 'gps' ? 'bg-[#13693E]' : 'bg-amber-600'}`} />
              <span>{locResult.source === 'gps' ? locResult.sourceLabel : '● Theo điểm đón'}</span>
            </span>

            <button type="button" onClick={fetchGps} disabled={isRefreshingGps} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#13693E] hover:underline disabled:opacity-50">
              <RotateCw className={`h-3 w-3 ${isRefreshingGps ? 'animate-spin' : ''}`} />
              <span>{isRefreshingGps ? 'Đang định vị...' : 'Làm mới GPS'}</span>
            </button>
          </div>

          <div>
            <p className="font-mono font-bold text-slate-950 text-xs tracking-tight">{locResult.latStr}, {locResult.lngStr}</p>
            <p className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">{locResult.address}</p>
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-emerald-600/10 text-[11px] font-bold">
            <button type="button" onClick={handleCopyCoords} data-testid="copy-coords-btn" className="text-slate-700 hover:text-slate-950 underline">Chép tọa độ</button>
            <span className="text-slate-300">•</span>
            <button type="button" onClick={handleCopyMapsLink} data-testid="copy-maps-link-btn" className="text-slate-700 hover:text-slate-950 underline">Chép link Maps</button>
            <span className="text-slate-300">•</span>
            <a href={`https://www.google.com/maps/search/?api=1&query=${locResult.latStr},${locResult.lngStr}`} target="_blank" rel="noopener noreferrer" data-testid="test-open-map-link" className="text-[#13693E] hover:text-emerald-800 underline inline-flex items-center gap-0.5">
              <span>Mở thử bản đồ</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>

        {/* Toast thông báo nhanh */}
        {toastMessage && (
          <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 text-center animate-in fade-in duration-150">
            {toastMessage}
          </div>
        )}

        {/* Form nhập & Cụm nút gửi */}
        <form onSubmit={handleSave} className="mt-3.5 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Số điện thoại Zalo người thân</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0946499329" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 focus:border-[#13693E] focus:bg-white focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button type="button" onClick={handleSendZalo} data-testid="sos-send-zalo-btn" className="bg-[#0068FF] hover:bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors active:scale-95">
              <Send className="h-3.5 w-3.5" />
              <span>Gửi Zalo người thân</span>
            </button>
            <button type="button" onClick={handleSendMessenger} data-testid="sos-send-messenger-btn" className="bg-[#0084FF] hover:bg-sky-600 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors active:scale-95">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Gửi Messenger / Bạn bè</span>
            </button>
          </div>

          <button type="submit" data-testid="sos-save-contact-btn" className="w-full py-3 rounded-xl bg-[#13693E] hover:bg-[#0F5C36] text-white font-extrabold text-[13px] shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-1.5">
            {isSaved ? <Check className="h-4 w-4" /> : null}
            <span>{isSaved ? 'Đã lưu liên hệ!' : 'Lưu liên hệ SOS'}</span>
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
