import { ArrowRight, Fuel, HeartPulse, Loader2, Shield, Store } from 'lucide-react';
import type { SafeStation, SafeStationCategory } from '../../types/rescue';
import { useSmoothHorizontalWheel } from '../../hooks/useSmoothHorizontalWheel';
import { formatCompactStationAddress } from '../../utils/rescueLogic';

interface NearbyStationsCarouselProps {
  stations: SafeStation[];
  isLoadingStations: boolean;
  onSelectStationCard: (stationId: string) => void;
  onViewMap: () => void;
}

function StationSquircleIcon({ category }: { category: SafeStationCategory }) {
  if (category === 'convenience') return <Store className="h-4 w-4" aria-hidden="true" />;
  if (category === 'gas_station') return <Fuel className="h-4 w-4" aria-hidden="true" />;
  if (category === 'hospital') return <HeartPulse className="h-4 w-4" aria-hidden="true" />;
  return <Shield className="h-4 w-4" aria-hidden="true" />;
}

export function NearbyStationsCarousel({
  stations,
  isLoadingStations,
  onSelectStationCard,
  onViewMap,
}: NearbyStationsCarouselProps) {
  const { containerRef, isHovered, isDragging, dragHandlers, consumeDidDrag } =
    useSmoothHorizontalWheel();

  return (
    <section aria-label="Trạm An Toàn gần bạn" className="mt-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold tracking-tight text-slate-900">
          Trạm An Toàn gần bạn
        </h2>
        {isLoadingStations ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            <span>Đang quét</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={onViewMap}
            className={`text-xs font-semibold transition-colors duration-200 ${
              isHovered ? 'text-emerald-500 font-bold' : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            Xem bản đồ →
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        {...dragHandlers}
        className={`-mx-4 mt-2.5 flex items-stretch gap-2.5 overflow-x-auto overscroll-x-contain px-4 py-1.5 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {stations.map((station, index) => {
          const isNearest = index === 0;
          const compactAddress = formatCompactStationAddress(station.address);
          const safeMeters = Math.max(0, Math.round(station.walkingDistanceMeters));
          const safeMinutes = Math.max(1, Math.round(station.walkingMinutes));

          return (
            <button
              key={station.id}
              type="button"
              onClick={() => {
                if (consumeDidDrag()) return;
                onSelectStationCard(station.id);
              }}
              draggable={false}
              className="group flex w-[255px] shrink-0 flex-col justify-between rounded-2xl border border-slate-100/90 bg-white p-3 text-left shadow-xs select-none focus-visible:outline-none transform-gpu transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_12px_26px_-6px_rgba(16,185,129,0.16),0_4px_12px_-2px_rgba(15,23,42,0.06)] active:scale-[0.985]"
            >
              {/* Dòng 1: Tên trạm + khoảng cách */}
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-500/10">
                    <StationSquircleIcon category={station.category} />
                  </span>
                  <p className="truncate text-xs font-bold text-slate-900">
                    {station.name}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {isNearest && (
                    <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9.5px] font-bold text-white whitespace-nowrap">
                      Gần nhất
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-sans text-[10.5px] font-semibold text-emerald-700 whitespace-nowrap">
                    {safeMeters}m · {safeMinutes}p
                  </span>
                </div>
              </div>

              {/* Dòng 2: Địa chỉ làm sạch + nút nhỏ Đi tới → */}
              <div className="mt-2.5 flex w-full items-center justify-between gap-2">
                <p className="max-w-[155px] truncate text-[11px] text-slate-400">
                  {compactAddress}
                </p>
                <span className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white transition-colors group-hover:bg-emerald-600 whitespace-nowrap">
                  <span>Đi tới</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
