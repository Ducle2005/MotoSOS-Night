import { Fuel, HeartPulse, MapPin, Navigation, Shield, Store } from 'lucide-react';
import type { GasStation, PoliceStation, SafeStation } from '../../types/rescue';
import { cleanSafetyAddress, type ShelterItem } from '../../utils/placeDeduplication';

export type { ShelterItem };

interface ShelterPlaceCardProps {
  item: ShelterItem;
  isNearest: boolean;
  onRouteToStation: (stationId: string) => void;
  onRouteToGasStation: (gas: GasStation) => void;
  onRouteToPoliceStation: (pol: PoliceStation) => void;
  onPickStationForRescue: (station: SafeStation) => void;
  onPickGasForRescue: (gas: GasStation) => void;
}

function getCategoryMeta(item: ShelterItem) {
  if (item.kind === 'police_station') {
    return {
      label: 'Công an phường',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-700',
      Icon: Shield,
    };
  }
  if (item.kind === 'gas_station') {
    return {
      label: 'Cây xăng sáng đèn',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      Icon: Fuel,
    };
  }
  const cat = item.station.category;
  if (cat === 'hospital') {
    return {
      label: 'Cơ sở y tế',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      Icon: HeartPulse,
    };
  }
  if (cat === 'gas_station') {
    return {
      label: 'Cây xăng sáng đèn',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      Icon: Fuel,
    };
  }
  if (cat === 'police') {
    return {
      label: 'Công an khu vực',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-700',
      Icon: Shield,
    };
  }
  return {
    label: 'Trạm 24/7',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    Icon: Store,
  };
}

export function ShelterPlaceCard({
  item,
  isNearest,
  onRouteToStation,
  onRouteToGasStation,
  onRouteToPoliceStation,
  onPickStationForRescue,
  onPickGasForRescue,
}: ShelterPlaceCardProps) {
  const meta = getCategoryMeta(item);
  const IconComponent = meta.Icon;

  const rawName =
    item.kind === 'police_station'
      ? item.police.name
      : item.kind === 'safe_station'
        ? item.station.name
        : item.gas.name;

  const rawAddress =
    item.kind === 'police_station'
      ? item.police.address
      : item.kind === 'safe_station'
        ? item.station.address
        : item.gas.address;

  const displayAddress = cleanSafetyAddress(rawAddress);

  const meters = Math.max(
    0,
    Math.round(
      item.kind === 'police_station'
        ? item.police.distanceMeters
        : item.kind === 'safe_station'
          ? item.station.walkingDistanceMeters
          : item.gas.walkingDistanceMeters,
    ),
  );

  const minutes = Math.max(
    1,
    Math.round(
      item.kind === 'police_station'
        ? item.police.durationMinutes
        : item.kind === 'safe_station'
          ? item.station.walkingMinutes
          : item.gas.walkingMinutes,
    ),
  );

  const handleRoute = () => {
    if (item.kind === 'police_station') onRouteToPoliceStation(item.police);
    else if (item.kind === 'gas_station') onRouteToGasStation(item.gas);
    else onRouteToStation(item.station.id);
  };

  const handlePickForRescue = () => {
    if (item.kind === 'safe_station') {
      onPickStationForRescue(item.station);
    } else if (item.kind === 'gas_station') {
      onPickGasForRescue(item.gas);
    } else {
      onPickStationForRescue({
        id: item.police.id,
        name: item.police.name,
        category: 'police',
        categoryLabel: 'Công an phường',
        address: item.police.address,
        walkingDistanceMeters: item.police.distanceMeters,
        walkingMinutes: item.police.durationMinutes,
        openHours: '24/7',
        amenities: ['police', 'safety'],
        coord: item.police.coord,
      });
    }
  };

  return (
    <article
      data-testid="shelter-place-card"
      className="space-y-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-xs transition-all hover:border-slate-200"
    >
      {/* Tầng 1: Icon + Tên + Địa chỉ bên trái; Huy hiệu khoảng cách bên phải */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${meta.iconBg} ${meta.iconColor}`}
          >
            <IconComponent className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-[13px] font-bold text-slate-950">
              {rawName}
            </h3>
            <p className="line-clamp-1 text-[11px] text-slate-500">
              {displayAddress}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 gap-0.5">
          {isNearest && (
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-700 whitespace-nowrap">
              Gần nhất
            </span>
          )}
          <span className="font-sans text-[11px] font-bold text-emerald-600 whitespace-nowrap">
            {meters}m · {minutes}p đi bộ
          </span>
        </div>
      </div>

      {/* Tầng 2: Nhãn loại hình bên trái; 2 nút hành động bên phải */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100/80 pt-1.5">
        <span className="text-[10.5px] font-semibold text-slate-500">
          {meta.label}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleRoute}
            className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-800 transition-colors hover:bg-slate-200 active:scale-95 whitespace-nowrap"
          >
            <Navigation className="h-3 w-3" />
            <span>Chỉ đường</span>
          </button>

          <button
            type="button"
            onClick={handlePickForRescue}
            className="flex items-center gap-1 rounded-lg bg-[#090D16] px-2.5 py-1.5 text-[11px] font-bold text-emerald-400 transition-colors hover:bg-slate-800 active:scale-95 whitespace-nowrap"
          >
            <MapPin className="h-3 w-3" />
            <span>Đón tại đây (-20k)</span>
          </button>
        </div>
      </div>
    </article>
  );
}
