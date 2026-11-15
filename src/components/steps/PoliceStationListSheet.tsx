import {
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  Shield,
} from 'lucide-react';
import type { PoliceStation } from '../../types/rescue';
import {
  buildPoliceGoogleMapsUrl,
  formatPoliceDistanceLabel,
} from '../../utils/policeStationApi';

interface PoliceStationListSheetProps {
  policeStations: PoliceStation[];
  selectedPoliceStationId: string | null;
  hasActivePoliceRoute: boolean;
  isLoadingStations: boolean;
  isLoadingRoute: boolean;
  onDrawRoute: (station: PoliceStation) => void;
}

export function PoliceStationListSheet({
  policeStations,
  selectedPoliceStationId,
  hasActivePoliceRoute,
  isLoadingStations,
  isLoadingRoute,
  onDrawRoute,
}: PoliceStationListSheetProps) {
  return (
    <div
      data-testid="police-station-list-sheet"
      className="flex min-h-0 flex-1 flex-col"
    >
      {/* Emergency 113 bar + night safety prompt */}
      <div className="mx-5 mb-2.5 flex items-center justify-between gap-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/75 px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 shrink-0 text-indigo-700" aria-hidden="true" />
            <h2 className="truncate text-xs font-extrabold tracking-tight text-slate-900">
              Công an Phường/Xã gần bạn
            </h2>
            {isLoadingStations ? (
              <Loader2 className="h-3 w-3 shrink-0 animate-spin text-indigo-700" aria-hidden="true" />
            ) : (
              <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 font-sans text-[10px] font-bold tabular-nums text-indigo-800">
                {policeStations.length}
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[10.5px] font-medium text-rose-800">
            Ban đêm hãy giữ liên lạc &amp; di chuyển tới nơi sáng đèn gần nhất.
          </p>
        </div>

        <a
          href="tel:113"
          data-testid="emergency-113-btn"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-rose-600 px-3 text-xs font-extrabold text-white shadow-sm shadow-rose-600/25 transition-colors hover:bg-rose-700 active:scale-[0.98] whitespace-nowrap"
        >
          <PhoneCall className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Gọi khẩn cấp 113</span>
        </a>
      </div>

      {/* Scrollable police stations sorted nearest first */}
      <div className="flex-1 space-y-2.5 overflow-y-auto px-5 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {policeStations.map((station) => {
          const isSelected = selectedPoliceStationId === station.id;
          const isRoutingThis = isSelected && isLoadingRoute;
          const isRoutedThis = isSelected && hasActivePoliceRoute;
          const mapsUrl = buildPoliceGoogleMapsUrl(station);

          return (
            <article
              key={station.id}
              data-testid={`police-station-item-${station.id}`}
              className={`rounded-2xl border p-3 transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/35 shadow-sm'
                  : 'border-slate-100 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {station.isNearest && (
                      <span className="rounded-full bg-indigo-700 px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap">
                        Gần nhất
                      </span>
                    )}
                    <h3 className="truncate text-sm font-bold text-slate-900">
                      {station.name}
                    </h3>
                  </div>

                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-500">
                    <MapPin className="h-3 w-3 shrink-0 text-indigo-600" aria-hidden="true" />
                    <span className="truncate">{station.address}</span>
                  </p>

                  {station.phone && (
                    <p className="mt-0.5 flex items-center gap-1 font-sans text-[11px] font-bold tabular-nums text-indigo-700">
                      <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>Trực ban: {station.phone}</span>
                    </p>
                  )}
                </div>

                <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 font-sans text-[11px] font-semibold tabular-nums text-indigo-700 whitespace-nowrap">
                  {formatPoliceDistanceLabel(station.distanceMeters, station.durationMinutes)}
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onDrawRoute(station)}
                  disabled={isRoutingThis}
                  className={`flex min-h-[36px] items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-bold transition-all active:scale-[0.98] whitespace-nowrap ${
                    isRoutedThis
                      ? 'bg-indigo-700 text-white shadow-sm'
                      : 'border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                  }`}
                >
                  {isRoutingThis ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />
                  ) : (
                    <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span>Đường đi</span>
                </button>

                {station.phone ? (
                  <a
                    href={`tel:${station.phone.replace(/\s+/g, '')}`}
                    className="flex min-h-[36px] items-center justify-center gap-1 rounded-xl bg-emerald-500 px-2 py-1.5 text-[11px] font-bold text-white shadow-xs transition-colors hover:bg-emerald-600 active:scale-[0.98] whitespace-nowrap"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Gọi điện</span>
                  </a>
                ) : (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Mở Google Maps để xem số trực ban"
                    className="flex min-h-[36px] items-center justify-center gap-1 rounded-xl border border-indigo-200 bg-white px-2 py-1.5 text-[11px] font-bold text-indigo-700 transition-colors hover:bg-indigo-50 active:scale-[0.98] whitespace-nowrap"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Gọi điện</span>
                  </a>
                )}

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[36px] items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98] whitespace-nowrap"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                  <span>Google Maps</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
