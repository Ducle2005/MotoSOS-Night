import { ExternalLink, Fuel, Loader2, MapPin, Route, ShieldCheck } from 'lucide-react';
import type { GasStation } from '../../types/rescue';
import { buildGoogleMapsDirectionsUrl } from '../../utils/gasStationApi';
import { formatWalkingDistance } from '../../utils/rescueLogic';

interface GasStationListSheetProps {
  gasStations: GasStation[];
  selectedGasStationId: string | null;
  hasActiveGasRoute: boolean;
  isLoadingStations: boolean;
  isLoadingRoute: boolean;
  onDrawRoute: (station: GasStation) => void;
  onPickForRescue: (station: GasStation) => void;
}

export function GasStationListSheet({
  gasStations,
  selectedGasStationId,
  hasActiveGasRoute,
  isLoadingStations,
  isLoadingRoute,
  onDrawRoute,
  onPickForRescue,
}: GasStationListSheetProps) {
  return (
    <div
      data-testid="gas-station-list-sheet"
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-5 pt-0.5 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Fuel className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
              Cây xăng gần bạn nhất
            </h2>
            <p className="text-[11px] text-slate-500">
              Sắp xếp theo khoảng cách · Có ưu đãi ANTOAN20
            </p>
          </div>
        </div>

        {isLoadingStations ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            <span>Đang quét</span>
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-sans text-[11px] font-bold tabular-nums text-amber-700">
            {gasStations.length} điểm
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto px-5 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {gasStations.map((station) => {
          const isSelected = selectedGasStationId === station.id;
          const isRoutingThis = isSelected && isLoadingRoute;
          const isRoutedThis = isSelected && hasActiveGasRoute;

          return (
            <div
              key={station.id}
              data-testid={`gas-station-item-${station.id}`}
              className={`rounded-2xl border p-3 transition-all ${
                isSelected
                  ? 'border-amber-400 bg-amber-50/40 shadow-sm'
                  : 'border-slate-100 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {station.isNearest && (
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap">
                        Gần nhất
                      </span>
                    )}
                    <h3 className="truncate text-sm font-bold text-slate-900">
                      {station.name}
                    </h3>
                  </div>

                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-500">
                    <MapPin className="h-3 w-3 shrink-0 text-amber-500" aria-hidden="true" />
                    <span className="truncate">{station.address}</span>
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 font-sans text-[11px] font-semibold tabular-nums text-emerald-700 whitespace-nowrap">
                    {formatWalkingDistance(
                      station.walkingDistanceMeters,
                      station.walkingMinutes,
                    )}
                  </span>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-500 whitespace-nowrap">
                    {station.openStatusLabel}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onDrawRoute(station)}
                  disabled={isRoutingThis}
                  className={`flex min-h-[38px] items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-bold transition-all active:scale-[0.98] whitespace-nowrap ${
                    isRoutedThis
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  {isRoutingThis ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />
                  ) : (
                    <Route className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span>Vẽ đường</span>
                </button>

                <a
                  href={buildGoogleMapsDirectionsUrl(station.coord.lat, station.coord.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[38px] items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98] whitespace-nowrap"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                  <span>Google Maps</span>
                </a>

                <button
                  type="button"
                  onClick={() => onPickForRescue(station)}
                  className="flex min-h-[38px] items-center justify-center gap-1 rounded-xl bg-emerald-500 px-2 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-emerald-500/20 transition-colors hover:bg-emerald-600 active:scale-[0.98] whitespace-nowrap"
                >
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Đón tại đây</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
