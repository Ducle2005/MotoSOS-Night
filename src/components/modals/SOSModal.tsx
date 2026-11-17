import { AlertTriangle, Copy, MapPin, MessageCircle, Send, ShieldAlert, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { EMERGENCY_CONTACT_KEY, loadUserProfile } from '../../types/profile';
import type { ActiveLocation } from '../../types/rescue';
import {
  buildSosSharePayload,
  copyTextSafely,
  shareViaMessenger,
  shareViaZalo,
} from '../../utils/sosLocationShare';

interface SOSModalProps {
  isOpen: boolean;
  activeLocation: ActiveLocation;
  savedPhone?: string;
  onTriggerSos: () => void;
  onClose: () => void;
}

export function SOSModal({
  isOpen,
  activeLocation,
  savedPhone,
  onTriggerSos,
  onClose,
}: SOSModalProps) {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const lat = activeLocation.lat;
  const lng = activeLocation.lng;
  const profile = loadUserProfile();
  const emergencyPhone = (typeof window !== 'undefined' ? localStorage.getItem(EMERGENCY_CONTACT_KEY) : null) || savedPhone || profile.phone;

  const getPayload = () => buildSosSharePayload({
    location: activeLocation,
    address: activeLocation.address,
    vehiclePlate: profile.licensePlate,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareZalo = async () => {
    const res = await shareViaZalo(emergencyPhone || '', getPayload());
    showToast(res.message);
  };

  const handleShareMessenger = async () => {
    const res = await shareViaMessenger(getPayload());
    showToast(res.message);
  };

  const handleCopyLocation = async () => {
    const success = await copyTextSafely(getPayload().text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleActivateSosSignal = () => {
    onTriggerSos();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[120] flex flex-col justify-end bg-slate-950/70"
        onClick={onClose}
      >
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-label="Tín hiệu SOS & Định vị khẩn cấp"
          data-testid="sos-modal"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white p-5 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Tín hiệu SOS &amp; Định vị khẩn cấp
                </h2>
                <p className="text-xs text-slate-500">
                  Chia sẻ tọa độ GPS cứu hộ với người thân
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Đóng bảng SOS"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Current GPS Card */}
          <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-rose-700">Tọa độ sự cố hiện tại</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-900 line-clamp-2">
                  {activeLocation.address}
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  GPS: {lat.toFixed(5)}, {lng.toFixed(5)}
                </p>
              </div>
            </div>
          </div>

          {/* Sender & Vehicle Info */}
          <div className="mt-2.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Người gửi cứu hộ</span>
              <p className="font-extrabold text-slate-800 truncate">{profile.fullName} • {profile.phone}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phương tiện</span>
              <p className="font-extrabold text-[#13693E]">{profile.licensePlate}</p>
            </div>
          </div>

          {/* Toast thông báo */}
          {toastMessage && (
            <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 text-center animate-in fade-in duration-150">
              {toastMessage}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareZalo}
                data-testid="sos-modal-zalo-btn"
                className="flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl bg-[#0068FF] px-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-600 active:scale-[0.99] transition-all"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Gửi Zalo {emergencyPhone ? `(${emergencyPhone.slice(-4)})` : ''}</span>
              </button>

              <button
                type="button"
                onClick={handleShareMessenger}
                data-testid="sos-modal-messenger-btn"
                className="flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl bg-[#0084FF] px-3 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-600 active:scale-[0.99] transition-all"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Gửi Messenger</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyLocation}
              className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{copied ? 'Đã sao chép nội dung SOS!' : 'Sao chép tin nhắn cứu hộ'}</span>
            </button>

            <button
              type="button"
              onClick={handleActivateSosSignal}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 active:scale-[0.99] transition-all"
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <span>Kích hoạt cứu hộ khẩn cấp ngay trên MotoSOS</span>
            </button>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
