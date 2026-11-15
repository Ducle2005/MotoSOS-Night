import { Fuel, MapPin, Shield, ShieldCheck } from 'lucide-react';
import { useHorizontalDragScroll } from '../../hooks/useHorizontalDragScroll';
import type { SafeStation, PoliceStation, GasStation, UserLocation } from '../../types/rescue';

export interface NearbySafePillItem {
  id: string;
  name: string;
  distanceMeters: number;
  distanceText: string;
  Icon: typeof ShieldCheck;
  badgeClass: string;
  onClick: () => void;
}

interface CurrentLocationPickupViewProps {
  userLocation: UserLocation;
  pills: NearbySafePillItem[];
  onOpenLocationSearch?: () => void;
}

export function buildNearbySafePills(
  stations: SafeStation[],
  policeStations: PoliceStation[],
  gasStations: GasStation[],
  onSelectSafeStation: (s: SafeStation) => void,
  onRoutePolice: (p: PoliceStation) => void,
  onSelectGasStation: (g: GasStation) => void,
): NearbySafePillItem[] {
  const list: NearbySafePillItem[] = [];
  stations.forEach((s) => {
    list.push({
      id: `ss-${s.id}`, name: s.name, distanceMeters: s.walkingDistanceMeters,
      distanceText: s.walkingDistanceMeters < 1000 ? `${Math.round(s.walkingDistanceMeters)}m` : `${(s.walkingDistanceMeters / 1000).toFixed(1)}km`,
      Icon: ShieldCheck, badgeClass: 'border-emerald-200/90 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80',
      onClick: () => onSelectSafeStation(s),
    });
  });
  policeStations.forEach((p) => {
    list.push({
      id: `ps-${p.id}`, name: p.name, distanceMeters: p.distanceMeters,
      distanceText: p.distanceMeters < 1000 ? `${Math.round(p.distanceMeters)}m` : `${(p.distanceMeters / 1000).toFixed(1)}km`,
      Icon: Shield, badgeClass: 'border-indigo-200/90 bg-indigo-50 text-indigo-800 hover:bg-indigo-100/80',
      onClick: () => onRoutePolice(p),
    });
  });
  gasStations.forEach((g) => {
    list.push({
      id: `gs-${g.id}`, name: g.name, distanceMeters: g.walkingDistanceMeters,
      distanceText: g.walkingDistanceMeters < 1000 ? `${Math.round(g.walkingDistanceMeters)}m` : `${(g.walkingDistanceMeters / 1000).toFixed(1)}km`,
      Icon: Fuel, badgeClass: 'border-amber-200/90 bg-amber-50 text-amber-800 hover:bg-amber-100/80',
      onClick: () => onSelectGasStation(g),
    });
  });
  list.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return list;
}

export function CurrentLocationPickupView({
  userLocation,
  pills,
  onOpenLocationSearch,
}: CurrentLocationPickupViewProps) {
  const { scrollRef, isDragging, dragHandlers } = useHorizontalDragScroll();

  return (
    <div className="mt-2 space-y-2">
      {/* 1-Line Current Location Card */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-2.5 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span className="truncate text-xs font-semibold text-slate-800" title={userLocation.address}>
            {userLocation.address}
          </span>
        </div>
        {onOpenLocationSearch && (
          <button
            type="button"
            onClick={onOpenLocationSearch}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-emerald-600 active:scale-95 transition-all"
          >
            <span>Đổi vị trí</span>
          </button>
        )}
      </div>

      {/* Horizontal Recommendation Strip */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-2">
        <p className="text-[11px] font-bold text-slate-600">
          Điểm an toàn quanh bạn (bấm nếu muốn dắt xe tới):
        </p>
        <div
          ref={scrollRef}
          {...dragHandlers}
          className={`mt-1.5 flex gap-2 overflow-x-auto overscroll-x-contain touch-pan-x select-none py-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {pills.map((pill) => {
            const PillIcon = pill.Icon;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={(e) => {
                  pill.onClick();
                  e.currentTarget.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'nearest',
                  });
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-2xs transition-all hover:scale-[1.02] active:scale-95 ${pill.badgeClass}`}
              >
                <PillIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="font-bold text-slate-900">{pill.name}</span>
                <span className="font-sans text-[11px] opacity-80">· {pill.distanceText}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
