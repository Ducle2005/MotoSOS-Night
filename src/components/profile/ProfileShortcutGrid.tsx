import { Bike, HeartHandshake, Wallet } from 'lucide-react';
import type { UserProfileData } from '../../types/profile';

interface ProfileShortcutGridProps {
  profile: UserProfileData;
  onOpenPayment: () => void;
  onOpenVehicle: () => void;
  onOpenSos: () => void;
}

export function ProfileShortcutGrid({
  profile,
  onOpenPayment,
  onOpenVehicle,
  onOpenSos,
}: ProfileShortcutGridProps) {
  return (
    <section className="grid grid-cols-3 gap-2.5">
      <button
        type="button"
        onClick={onOpenPayment}
        className="flex flex-col items-start gap-2 rounded-2xl border border-slate-100/90 bg-white p-3.5 shadow-2xs transition-transform active:scale-[0.97]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 shadow-2xs">
          <Wallet className="h-5 w-5" />
        </span>
        <div className="text-left">
          <p className="text-xs font-bold text-slate-900">Thanh toán</p>
          <p className="text-[10px] text-slate-400 capitalize">{profile.defaultPayment}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={onOpenVehicle}
        className="flex flex-col items-start gap-2 rounded-2xl border border-slate-100/90 bg-white p-3.5 shadow-2xs transition-transform active:scale-[0.97]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-100 to-blue-50 text-sky-600 shadow-2xs">
          <Bike className="h-5 w-5" />
        </span>
        <div className="text-left min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">Xe của tôi</p>
          <p className="text-[10px] text-slate-400 truncate">{profile.licensePlate || 'Chưa lưu'}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={onOpenSos}
        className="flex flex-col items-start gap-2 rounded-2xl border border-slate-100/90 bg-white p-3.5 shadow-2xs transition-transform active:scale-[0.97]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-100 to-amber-50 text-rose-600 shadow-2xs">
          <HeartHandshake className="h-5 w-5" />
        </span>
        <div className="text-left">
          <p className="text-xs font-bold text-slate-900">SOS Gia đình</p>
          <p className="text-[10px] text-slate-400">Tin cậy 24/7</p>
        </div>
      </button>
    </section>
  );
}
