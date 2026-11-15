import { Check, HeartHandshake, Phone, Send, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { profileRepo } from '../../repositories/storageRepository';

interface EmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSos?: (phone: string) => void;
}

export function EmergencyContactModal({
  isOpen,
  onClose,
  onTriggerSos,
}: EmergencyContactModalProps) {
  const [phone, setPhone] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPhone(profileRepo.getEmergencyContact());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.trim();
    if (!clean) return;
    profileRepo.saveEmergencyContact(clean);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cài đặt SOS Gia đình"
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4"
    >
      <div className="w-full max-w-[430px] rounded-t-[28px] border-t border-slate-100 bg-white p-5 shadow-2xl sm:rounded-[28px] sm:border">
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

        <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-xs text-rose-900">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <p>
              Khi bạn bấm nút <strong>SOS Khẩn Cấp</strong>, hệ thống tự động soạn tin nhắn Zalo kèm tọa độ GPS trực tiếp gửi đến số điện thoại này.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Số điện thoại Zalo người thân</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+84 912 345 678"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {onTriggerSos && (
              <button
                type="button"
                onClick={() => {
                  onTriggerSos(phone);
                  onClose();
                }}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Gửi thử Zalo</span>
              </button>
            )}

            <button
              type="submit"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              {isSaved ? <Check className="h-4 w-4 text-emerald-400" /> : null}
              <span>{isSaved ? 'Đã lưu!' : 'Lưu liên hệ SOS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
