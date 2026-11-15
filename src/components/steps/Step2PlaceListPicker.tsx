import { Check, Fuel, Loader2, Phone, Shield, ShieldCheck, Wrench } from 'lucide-react';
import type {
  GasStation,
  InspectedPlace,
  MapLayerFilter,
  PoliceStation,
  RepairShop,
  SafeStation,
} from '../../types/rescue';
import {
  deduplicateStep2Places,
  type Step2RowItem,
} from '../../utils/placeDeduplication';
import { formatPoliceDistanceLabel } from '../../utils/policeStationApi';
import { formatShortCallLabel, formatShopDistanceLabel } from '../../utils/repairShopApi';
import { formatWalkingDistance } from '../../utils/rescueLogic';
import { RemoteAreaNoticeCard } from '../safety/RemoteAreaNoticeCard';

interface Step2PlaceListPickerProps {
  mapFilter: MapLayerFilter;
  stations: SafeStation[];
  openRepairShops: RepairShop[];
  gasStations: GasStation[];
  policeStations: PoliceStation[];
  selectedStationId: string | null;
  inspectedPlace: InspectedPlace | null;
  isLoadingRoute: boolean;
  onSelectSafeStation: (station: SafeStation) => void;
  onSelectGasStation: (station: GasStation) => void;
  onRouteShop: (shop: RepairShop) => void;
  onRoutePolice: (station: PoliceStation) => void;
  onPickCurrentWithDiscount?: () => void;
  onOpenSosModal?: () => void;
}

export function Step2PlaceListPicker({
  mapFilter,
  stations,
  openRepairShops,
  gasStations,
  policeStations,
  selectedStationId,
  isLoadingRoute,
  onSelectSafeStation,
  onSelectGasStation,
  onRouteShop,
  onRoutePolice,
  onPickCurrentWithDiscount,
  onOpenSosModal,
}: Step2PlaceListPickerProps) {
  const rawList: Step2RowItem[] = [];

  if (mapFilter === 'all' || mapFilter === 'safe_stations') {
    stations.forEach((st) => rawList.push({ kind: 'safe_station', distance: st.walkingDistanceMeters, station: st }));
  }
  if (mapFilter === 'all' || mapFilter === 'repair_shops') {
    openRepairShops.forEach((sh) => rawList.push({ kind: 'repair_shop', distance: sh.distanceMeters, shop: sh }));
  }
  if (mapFilter === 'all' || mapFilter === 'gas_stations') {
    gasStations.forEach((gs) => rawList.push({ kind: 'gas_station', distance: gs.walkingDistanceMeters, gasStation: gs }));
  }
  if (mapFilter === 'all' || mapFilter === 'police_stations') {
    policeStations.forEach((ps) => rawList.push({ kind: 'police_station', distance: ps.distanceMeters, policeStation: ps }));
  }

  rawList.sort((a, b) => a.distance - b.distance);
  const filteredPlaces = deduplicateStep2Places(rawList);

  if (filteredPlaces.length === 0) {
    return (
      <div className="mt-2">
        <RemoteAreaNoticeCard
          onPickCurrentWithDiscount={() => onPickCurrentWithDiscount?.()}
          onOpenSosModal={() => onOpenSosModal?.()}
        />
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50/75 p-2">
      <div className="flex items-center justify-between px-1.5 pb-1">
        <p className="text-[11px] font-bold text-slate-700">
          Địa điểm gần bạn ({filteredPlaces.length} kết quả):
        </p>
        {isLoadingRoute && (
          <Loader2
            className="h-3.5 w-3.5 animate-spin text-emerald-600"
            aria-label="Đang tìm tuyến đường"
          />
        )}
      </div>

      <div
        data-testid="step2-place-list"
        className="max-h-[140px] space-y-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
      >
        {filteredPlaces.map((row) => {
          if (row.kind === 'repair_shop') {
            const shop = row.shop;
            const isSelected = Boolean(selectedStationId && shop.id === selectedStationId);

            return (
              <div
                key={`rs-${shop.id}`}
                data-testid={`step2-shop-${shop.id}`}
                className={`rounded-xl border px-2.5 py-2 transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-white shadow-xs ring-1 ring-blue-500/30'
                    : 'border-slate-200/70 bg-white hover:border-blue-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onRouteShop(shop)}
                  className="flex w-full items-start gap-2 text-left"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900">{shop.name}</p>
                    <p className="truncate font-sans text-[11px] tabular-nums text-slate-500">
                      <span className="font-semibold text-emerald-600">● Đang mở</span> · {formatShopDistanceLabel(shop.distanceMeters, shop.rideMinutes)}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                      <Check className="h-3 w-3" aria-hidden="true" />
                      <span>Đang chọn</span>
                    </span>
                  )}
                </button>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <a
                    href={`tel:${shop.phone.replace(/\s+/g, '')}`}
                    className="inline-flex h-6 flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-50 px-2 text-[10.5px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100 whitespace-nowrap"
                  >
                    <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span>{formatShortCallLabel(shop.phone)}</span>
                  </a>
                </div>
              </div>
            );
          }

          if (row.kind === 'police_station') {
            const p = row.policeStation;
            const isSelected = Boolean(selectedStationId && p.id === selectedStationId);

            return (
              <button
                key={`ps-${p.id}`}
                type="button"
                onClick={() => onRoutePolice(p)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors ${
                  isSelected
                    ? 'border-indigo-500 bg-white shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-slate-200/70 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                    <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">{p.name}</p>
                    <p className="truncate font-sans text-[11px] tabular-nums text-indigo-700">
                      Công an · {formatPoliceDistanceLabel(p.distanceMeters, p.durationMinutes)}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    <span>Đang chọn</span>
                  </span>
                )}
              </button>
            );
          }

          const isSafe = row.kind === 'safe_station';
          const item = isSafe ? row.station : row.gasStation;
          const isSelected = Boolean(selectedStationId && item.id === selectedStationId);
          const onPick = () =>
            isSafe ? onSelectSafeStation(row.station) : onSelectGasStation(row.gasStation);

          return (
            <button
              key={`${isSafe ? 'ss' : 'gs'}-${item.id}`}
              type="button"
              onClick={onPick}
              className={`flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors ${
                isSelected
                  ? isSafe
                    ? 'border-emerald-500 bg-white shadow-xs ring-1 ring-emerald-500/30'
                    : 'border-amber-500 bg-white shadow-xs ring-1 ring-amber-500/30'
                  : isSafe
                    ? 'border-slate-200/70 bg-white hover:border-emerald-300'
                    : 'border-slate-200/70 bg-white hover:border-amber-300'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isSafe ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {isSafe ? (
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Fuel className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900">{item.name}</p>
                  <p className="truncate font-sans text-[11px] tabular-nums text-slate-500">
                    {isSafe ? 'Trạm 24/7' : 'Cây xăng'} ·{' '}
                    {formatWalkingDistance(item.walkingDistanceMeters, item.walkingMinutes)}
                  </p>
                </div>
              </div>
              {isSelected && (
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isSafe ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  <Check className="h-3 w-3" aria-hidden="true" />
                  <span>Đang chọn</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
