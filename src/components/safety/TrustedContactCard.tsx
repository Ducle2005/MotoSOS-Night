import { useEffect, useState } from 'react';
import { Check, Phone, Send, UserCheck } from 'lucide-react';
import { profileRepo } from '../../repositories/storageRepository';

interface TrustedContactCardProps {
  onOpenSosModal: (phone: string) => void;
}

export function TrustedContactCard({ onOpenSosModal }: TrustedContactCardProps) {
  const [savedPhone, setSavedPhone] = useState('0946499329');
  const [inputPhone, setInputPhone] = useState('0946499329');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const stored = profileRepo.getEmergencyContact();
    const phone = stored || '0946499329';
    setSavedPhone(phone); setInputPhone(phone);
  }, []);

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputPhone.trim();
    if (!clean) return;
    profileRepo.saveEmergencyContact(clean);
    setSavedPhone(clean); setIsEditing(false);
  };

  return (
    <div className="mx-4 mt-2.5 rounded-2xl bg-white border border-slate-200/80 px-3.5 py-2.5 shadow-xs">
      {!isEditing ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-full bg-blue-50 text-[#0068FF] flex items-center justify-center shrink-0">
              <UserCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center text-[11px] text-slate-500">
                <span>Người thân tin cậy</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-[11px] font-bold text-[#13693E] underline ml-1.5 hover:text-emerald-800"
                >
                  Sửa
                </button>
              </div>
              <p className="text-[13.5px] font-extrabold text-slate-950 leading-tight">{savedPhone}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenSosModal(savedPhone)}
            className="bg-[#0068FF] hover:bg-blue-600 text-white font-bold text-[11.5px] px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0 active:scale-95 transition-transform shadow-xs"
          >
            <Send className="h-3 w-3" />
            <span>Gửi Zalo</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSavePhone} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Phone className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              value={inputPhone}
              onChange={(e) => setInputPhone(e.target.value)}
              placeholder="Nhập SĐT Zalo..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#13693E] focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!inputPhone.trim()}
            className="rounded-xl bg-[#13693E] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-xl px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
          >
            Hủy
          </button>
        </form>
      )}
    </div>
  );
}
