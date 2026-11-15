import { ExternalLink, Navigation, Phone, Wrench, X } from 'lucide-react';
import type { RepairShop } from '../../types/rescue';
import {
  buildGoogleMapsSearchUrl,
  formatShopDistanceLabel,
  formatShortCallLabel,
} from '../../utils/repairShopApi';

interface RepairShopDetailSheetProps {
  shop: RepairShop;
  routeSummary: { distanceMeters: number; durationMinutes: number } | null;
  isLoadingRoute: boolean;
  onClose: () => void;
}

export function RepairShopDetailSheet({
  shop,
  routeSummary,
  isLoadingRoute,
  onClose,
}: RepairShopDetailSheetProps) {
  const gmapsUrl = buildGoogleMapsSearchUrl(shop);
  const distance = routeSummary?.distanceMeters ?? shop.distanceMeters;
  const minutes = routeSummary?.durationMinutes ?? shop.rideMinutes;

  return (
    <div
      data-testid="repair-shop-detail-sheet"
      className="flex min-h-0 flex-1 flex-col px-4 pt-1 pb-3 text-slate-900"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200/80 bg-blue-50 text-blue-600 shadow-2xs">
            <Wrench className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-bold text-slate-950">
                {shop.name}
              </h2>
              <span className="shrink-0 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 whitespace-nowrap">
                {shop.openStatusLabel}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {shop.address}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng chi tiết tiệm"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
        <span className="font-sans font-semibold text-blue-700">
          {isLoadingRoute ? 'Đang tính đường...' : formatShopDistanceLabel(distance, minutes)}
        </span>
        <span className="font-mono text-slate-400 text-[11px]">{shop.phone}</span>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <a
          href={`tel:${shop.phone}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{formatShortCallLabel(shop.phone)}</span>
        </a>

        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition-all"
        >
          <Navigation className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
          <span>Mở chỉ đường</span>
          <ExternalLink className="h-3 w-3 text-slate-400 ml-0.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
