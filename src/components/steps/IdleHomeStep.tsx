import { AlertTriangle, MapPin, ShieldCheck } from 'lucide-react';
import type { UserLocation } from '../../types/rescue';

interface IdleHomeStepProps {
  userLocation: UserLocation;
  onStartOrder: () => void;
  onOpenSafeStations: () => void;
}

export function IdleHomeStep({
  userLocation,
  onStartOrder,
  onOpenSafeStations,
}: IdleHomeStepProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-1 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
          <span className="truncate">{userLocation.address}</span>
        </div>

        <button
          type="button"
          onClick={onStartOrder}
          className="mt-3 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-extrabold tracking-tight text-white shadow-lg shadow-emerald-500/20 transition-all duration-150 hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>GỌI SỬA XE KHẨN CẤP</span>
        </button>

        <div className="mt-2.5 flex justify-center">
          <button
            type="button"
            onClick={onOpenSafeStations}
            className="inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-4 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.99]"
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>Tìm Trạm An Toàn gần đây (24/7) →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
