import { AlertTriangle, Copy, ExternalLink, MapPin, Send, ShieldAlert, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { ActiveLocation } from '../../types/rescue';

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

  if (!isOpen) return null;

  const lat = activeLocation.lat;
  const lng = activeLocation.lng;
  const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}`;
  const sosMessage = `[CẦN HỖ TRỢ KHẨN CẤP] Xe mình gặp sự cố ban đêm tại: ${activeLocation.address}. Định vị GPS: ${mapsUrl}`;

  const handleShareZalo = () => {
    const cleanPhone = savedPhone ? savedPhone.replace(/\D/g, '') : '';
    const zaloUrl = cleanPhone
      ? `https://zalo.me/${cleanPhone}`
      : `https://zalo.me/`;
    // Copy the SOS message and navigate to Zalo
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sosMessage).catch(() => {});
    }
    setCopied(true);
    window.open(zaloUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyLocation = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sosMessage).catch(() => {});
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

          {/* Actions */}
          <div className="mt-4 space-y-2.5">
            <button
              type="button"
              onClick={handleShareZalo}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#0068FF] px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-600 active:scale-[0.99] transition-all"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>Gửi định vị qua Zalo {savedPhone ? `cho ${savedPhone}` : ''}</span>
            </button>

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
