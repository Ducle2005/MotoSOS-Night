import {
  AlertTriangle,
  ExternalLink,
  Fuel,
  HeartPulse,
  Navigation,
  Shield,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useHorizontalDragScroll } from '../../hooks/useHorizontalDragScroll';
import type { SafeStation } from '../../types/rescue';
import { buildGoogleMapsDirectionsUrl } from '../../utils/gasStationApi';
import {
  formatCompactStationAddress,
  formatWalkingDistance,
} from '../../utils/rescueLogic';
import { RemoteAreaNoticeCard } from '../safety/RemoteAreaNoticeCard';

interface ConvenienceStoreSheetProps {
  selectedStation?: SafeStation | null;
  stations: SafeStation[];
  routeSummary: { distanceMeters: number; durationMinutes: number } | null;
  isLoadingRoute: boolean;
  onSelectStation: (station: SafeStation) => void;
  onPickForRescue: (station: SafeStation) => void;
  onPickCurrentWithDiscount?: () => void;
  onOpenSosModal?: () => void;
}

function getStationIcon(category?: SafeStation['category']) {
  if (category === 'police') return Shield;
  if (category === 'gas_station') return Fuel;
  if (category === 'hospital') return HeartPulse;
  return Store;
}

export function ConvenienceStoreSheet({
  selectedStation,
  stations,
  routeSummary,
  isLoadingRoute,
  onSelectStation,
  onPickForRescue,
  onPickCurrentWithDiscount,
  onOpenSosModal,
}: ConvenienceStoreSheetProps) {
  const { scrollRef, isDragging, scrollByAmount, dragHandlers } = useHorizontalDragScroll();

  if (!selectedStation || stations.length === 0) {
    return (
      <div data-testid="convenience-store-empty" className="px-4 pt-1 pb-3">
        <RemoteAreaNoticeCard
          onPickCurrentWithDiscount={() => onPickCurrentWithDiscount?.()}
          onOpenSosModal={() => onOpenSosModal?.()}
        />
      </div>
    );
  }

  const displayList = stations;
  const StationIcon = getStationIcon(selectedStation.category);
  const distanceMeters =
    routeSummary?.distanceMeters ?? selectedStation.walkingDistanceMeters;
  const durationMinutes =
    routeSummary?.durationMinutes ?? selectedStation.walkingMinutes;
  const isTooFarToWalk = distanceMeters > 1000;

  const gmapsUrl = buildGoogleMapsDirectionsUrl(
    selectedStation.coord.lat,
    selectedStation.coord.lng,
  );

  return (
    <div
      data-testid="convenience-store-sheet"
      className="flex min-h-0 flex-1 flex-col px-4 pt-1 pb-3 text-slate-900"
    >
      {/* 1. Thẻ Điểm An Toàn đang chọn */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200/80 bg-emerald-50 text-emerald-600 shadow-2xs">
              <StationIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-bold text-slate-950">
                  {selectedStation.name}
                </h2>
                <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 whitespace-nowrap">
                  {selectedStation.categoryLabel || 'Điểm sáng đèn 24/7'}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {formatCompactStationAddress(selectedStation.address)}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="font-sans text-xs font-bold tabular-nums text-emerald-700 whitespace-nowrap">
              {isLoadingRoute
                ? 'Đang tính...'
                : formatWalkingDistance(distanceMeters, durationMinutes)}
            </span>
          </div>
        </div>

        {/* Cảnh báo khoảng cách dắt bộ > 1.000m */}
        {isTooFarToWalk && (
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-200/90 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
            <span>Hơi xa để dắt bộ • Nên chọn đón tại chỗ</span>
          </div>
        )}

        {/* 2 Nút thao tác chính */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() => onSelectStation(selectedStation)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-200 active:scale-[0.98]"
            >
              <Navigation className="h-3.5 w-3.5 text-slate-700" aria-hidden="true" />
              <span>Chỉ đường</span>
            </button>
            <a
              href={gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mở trên Google Maps"
              title="Mở Google Maps"
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => onPickForRescue(selectedStation)}
            className="flex-[1.4] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#090D16] py-2.5 text-xs font-bold text-emerald-400 shadow-md transition-all hover:bg-slate-900 active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>Đón thợ tại đây (-20k)</span>
          </button>
        </div>
      </div>

      {/* 2. Dải chọn nhanh các điểm an toàn sáng đèn khác */}
      <div className="mt-2.5 border-t border-slate-100 pt-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-500">
            Điểm an toàn sáng đèn lân cận ({displayList.length})
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollByAmount(-180)}
              aria-label="Cuộn sang trái"
              title="Cuộn sang trái"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all text-xs font-bold"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(180)}
              aria-label="Cuộn sang phải"
              title="Cuộn sang phải"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all text-xs font-bold"
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          {...dragHandlers}
          className={`mt-1.5 flex items-center gap-2 overflow-x-auto overscroll-x-contain touch-pan-x select-none pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {displayList.map((station) => {
            const isSelected = station.id === selectedStation.id;
            const ItemIcon = getStationIcon(station.category);
            return (
              <button
                key={station.id}
                type="button"
                onClick={(e) => {
                  onSelectStation(station);
                  e.currentTarget.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'nearest',
                  });
                }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap active:scale-[0.98] ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ItemIcon className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                <span>{station.name}</span>
                <span
                  className={`ml-0.5 font-sans font-bold tabular-nums text-[11px] ${
                    isSelected ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  · {station.walkingDistanceMeters}m
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
