import { Check, Copy, HeartHandshake, MessageCircle, Phone, Send, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { profileRepo } from '../../repositories/storageRepository';
import type { ActiveLocation, ActiveRescueInfo } from '../../types/rescue';
import {
  buildSosSharePayload,
  copyTextSafely,
  getExactUserCoordinates,
  shareViaMessenger,
  shareViaZalo,
} from '../../utils/sosLocationShare';

interface EmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSos?: (phone: string) => void;
  activeLocation?: ActiveLocation | null;
  activeRescue?: ActiveRescueInfo | null;
}

export function EmergencyContactModal({
  isOpen,
  onClose,
  onTriggerSos,
  activeLocation,
  activeRescue,
}: EmergencyContactModalProps) {
  const [phone, setPhone] = useState('0946499329');
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number; address: string }>({
    lat: activeLocation?.lat ?? 10.7769,
    lng: activeLocation?.lng ?? 106.7009,
    address: activeLocation?.address ?? '63 Đường Lý Tự Trọng, P. Bến Thành, Q.1',
  });

  useEffect(() => {
    if (!isOpen) return;
    const stored = profileRepo.getEmergencyContact();
    setPhone(stored || '0946499329');

    // Fetch fresh exact GPS coordinates on modal open
    getExactUserCoordinates(activeLocation).then((res) => {
      setCoords(res);
    });
  }, [isOpen, activeLocation]);

  if (!isOpen || typeof document === 'undefined') return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyLink = async () => {
    const payload = buildSosSharePayload({
      location: coords,
      address: coords.address,
      activeRescue,
    });
    const copied = await copyTextSafely(payload.mapsUrl);
    if (copied) showToast('Đã sao chép link bản đồ GPS!');
  };

  const handleSendZalo = async () => {
    const payload = buildSosSharePayload({
      location: coords,
      address: coords.address,
      activeRescue,
    });
    const res = await shareViaZalo(phone || '0946499329', payload);
    showToast(res.message);
    if (onTriggerSos) onTriggerSos(phone);
  };

  const handleSendMessenger = async () => {
    const payload = buildSosSharePayload({
      location: coords,
      address: coords.address,
      activeRescue,
    });
    const res = await shareViaMessenger(payload);
    showToast(res.message);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.trim();
    if (!clean) return;
    profileRepo.saveEmergencyContact(clean);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 450);
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cài đặt SOS Gia đình"
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cảnh báo an toàn */}
        <div className="mt-3.5 rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-xs text-rose-900">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <p className="leading-snug">
              Khi bạn gửi SOS, hệ thống tự động soạn sẵn vị trí thực tế kèm link Google Maps gửi ngay tới người thân.
            </p>
          </div>
        </div>

        {/* Khung hiển thị tọa độ GPS trực tiếp */}
        <div className="mt-3 rounded-2xl bg-[#F4F8F6] border border-emerald-600/15 p-3 flex items-start justify-between gap-2 shadow-xs">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-500">Vị trí GPS thực tế hiện tại:</p>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">{coords.address}</p>
            <p className="text-[11px] font-mono text-slate-600 mt-0.5 font-semibold">
              GPS: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            data-testid="sos-copy-link-btn"
            className="text-[11px] font-bold text-[#13693E] underline shrink-0 hover:text-emerald-800 pt-0.5"
          >
            Sao chép link
          </button>
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
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0946499329"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 focus:border-[#13693E] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Cụm 2 nút chia sẻ trực tiếp (Hàng 1) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleSendZalo}
              data-testid="sos-send-zalo-btn"
              className="bg-[#0068FF] hover:bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Gửi Zalo người thân</span>
            </button>

            <button
              type="button"
              onClick={handleSendMessenger}
              data-testid="sos-send-messenger-btn"
              className="bg-[#0084FF] hover:bg-sky-600 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors active:scale-95"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Gửi Messenger / Bạn bè</span>
            </button>
          </div>

          {/* Nút chính dưới đáy (Hàng 2) */}
          <button
            type="submit"
            data-testid="sos-save-contact-btn"
            className="w-full py-3 rounded-xl bg-[#13693E] hover:bg-[#0F5C36] text-white font-extrabold text-[13px] shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
          >
            {isSaved ? <Check className="h-4 w-4" /> : null}
            <span>{isSaved ? 'Đã lưu liên hệ!' : 'Lưu liên hệ SOS'}</span>
          </button>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
