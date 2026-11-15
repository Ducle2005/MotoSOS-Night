import { useState, useMemo } from 'react';
import {
  ChevronDown, ChevronUp, Fuel, MapPin, Navigation, Shield, ShieldAlert, Store,
} from 'lucide-react';
import type { ActiveLocation, GasStation, PoliceStation, SafeStation } from '../../types/rescue';
import { cleanSafetyAddress, deduplicateShelterItems, type ShelterItem } from '../../utils/placeDeduplication';
import { SOSModal } from '../modals/SOSModal';
import { EmergencyHotlineGrid } from '../safety/EmergencyHotlineGrid';
import { SafetyGuidelinesAccordion } from '../safety/SafetyGuidelinesAccordion';
import { TrustedContactCard } from '../safety/TrustedContactCard';

interface SafetyTabProps {
  activeLocation: ActiveLocation;
  stations: SafeStation[];
  gasStations: GasStation[];
  policeStations: PoliceStation[];
  onRouteToStation: (stationId: string) => void;
  onRouteToGasStation: (gas: GasStation) => void;
  onRouteToPoliceStation: (pol: PoliceStation) => void;
  onPickStationForRescue: (station: SafeStation) => void;
  onPickGasForRescue: (gas: GasStation) => void;
  onTriggerSos: () => void;
}

type ShelterFilter = 'all' | 'convenience' | 'police' | 'gas_station';

const TABS: Array<{ id: ShelterFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'convenience', label: 'Cửa hàng 24/7' },
  { id: 'police', label: 'Công an' },
  { id: 'gas_station', label: 'Cây xăng' },
];

export function SafetyTab({
  activeLocation, stations, gasStations, policeStations,
  onRouteToStation, onRouteToGasStation, onRouteToPoliceStation,
  onPickStationForRescue, onPickGasForRescue, onTriggerSos,
}: SafetyTabProps) {
  const [filter, setFilter] = useState<ShelterFilter>('all');
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [sosPhone, setSosPhone] = useState('0946499329');
  const [isExpanded, setIsExpanded] = useState(false);

  const shelterItems = useMemo<ShelterItem[]>(() => {
    const raw: ShelterItem[] = [];
    if (filter === 'all' || filter === 'police') {
      policeStations.forEach((p) => raw.push({ kind: 'police_station', distance: p.distanceMeters, police: p }));
    }
    if (filter === 'all' || filter === 'convenience') {
      stations.forEach((s) => raw.push({ kind: 'safe_station', distance: s.walkingDistanceMeters, station: s }));
    }
    if (filter === 'all' || filter === 'gas_station') {
      gasStations.forEach((g) => raw.push({ kind: 'gas_station', distance: g.walkingDistanceMeters, gas: g }));
    }
    return deduplicateShelterItems(raw);
  }, [filter, stations, policeStations, gasStations]);

  const visibleItems = isExpanded ? shelterItems : shelterItems.slice(0, 5);
  const hiddenCount = Math.max(0, shelterItems.length - 5);

  return (
    <div className="relative flex-1 bg-white min-h-full pb-20 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* 1. Header Trắng Tinh Gọn */}
      <header className="bg-white px-4 pt-4 pb-1">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-extrabold text-slate-950 tracking-tight">Trung tâm An toàn</h1>
          <span className="bg-[#E6F4EC] text-[#13693E] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#13693E] animate-pulse" />
            <span>Lá chắn 24/7</span>
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#13693E]" aria-hidden="true" />
          <span className="truncate">{activeLocation.address}</span>
        </div>
      </header>

      {/* Thẻ SOS Khẩn Cấp Tương Phản Cao */}
      <div className="mx-4 mt-2.5 rounded-2xl bg-rose-50/90 border border-rose-200/80 p-3.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/60">
            <ShieldAlert className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-slate-950 leading-tight">Tín hiệu SOS khẩn cấp</p>
            <p className="text-[11px] text-slate-600 truncate mt-0.5">Gửi GPS trực tiếp qua Zalo</p>
          </div>
        </div>
        <button
          type="button" onClick={() => setIsSosOpen(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shrink-0 shadow-xs active:scale-95 transition-transform"
        >
          Gửi SOS
        </button>
      </div>

      {/* 2. Dải 4 Đường Dây Nóng 1 Hàng Siêu Gọn */}
      <EmergencyHotlineGrid />

      {/* 3. Thanh Người Thân Tin Cậy 1 Dòng Sạch Sẽ */}
      <TrustedContactCard onOpenSosModal={(phone) => { setSosPhone(phone); setIsSosOpen(true); }} />

      {/* 4. Danh Sách Điểm Trú Ẩn Dạng Phẳng Chuẩn Grab */}
      <section className="mt-4">
        <div className="px-4 mb-2 flex items-center justify-between">
          <h2 className="text-[14px] font-extrabold text-slate-950">Điểm trú ẩn an toàn gần bạn</h2>
          <span className="text-[11.5px] font-medium text-slate-400">{shelterItems.length} địa điểm</span>
        </div>

        {/* Thanh tab lọc gạch chân kiểu Grab */}
        <div className="px-4 border-b border-slate-100 flex items-center gap-5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => {
            const active = filter === t.id;
            return (
              <button
                key={t.id} type="button" onClick={() => setFilter(t.id)}
                className={`py-2 text-xs transition-colors relative whitespace-nowrap ${active ? 'text-[#13693E] font-bold' : 'text-slate-500 font-medium hover:text-slate-800'}`}
              >
                {t.label}
                {active && <span className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#13693E] rounded-full" />}
              </button>
            );
          })}
        </div>

        {/* Danh sách phẳng ngăn cách bằng đường kẻ mảnh */}
        <div className="divide-y divide-slate-100 bg-white">
          {visibleItems.map((item, idx) => {
            const rawName = item.kind === 'police_station' ? item.police.name : item.kind === 'safe_station' ? item.station.name : item.gas.name;
            const rawAddress = item.kind === 'police_station' ? item.police.address : item.kind === 'safe_station' ? item.station.address : item.gas.address;
            const displayAddress = cleanSafetyAddress(rawAddress);
            const meters = Math.max(0, Math.round(item.kind === 'police_station' ? item.police.distanceMeters : item.kind === 'safe_station' ? item.station.walkingDistanceMeters : item.gas.walkingDistanceMeters));
            const minutes = Math.max(1, Math.round(item.kind === 'police_station' ? item.police.durationMinutes : item.kind === 'safe_station' ? item.station.walkingMinutes : item.gas.walkingMinutes));

            const handleRoute = () => {
              if (item.kind === 'police_station') onRouteToPoliceStation(item.police);
              else if (item.kind === 'gas_station') onRouteToGasStation(item.gas);
              else onRouteToStation(item.station.id);
            };

            const handlePickRescue = () => {
              if (item.kind === 'safe_station') onPickStationForRescue(item.station);
              else if (item.kind === 'gas_station') onPickGasForRescue(item.gas);
              else onPickStationForRescue({
                id: item.police.id, name: item.police.name, category: 'police', categoryLabel: 'Công an phường',
                address: item.police.address, walkingDistanceMeters: item.police.distanceMeters, walkingMinutes: item.police.durationMinutes,
                openHours: '24/7', amenities: ['police', 'safety'], coord: item.police.coord,
              });
            };

            return (
              <div
                key={item.kind === 'police_station' ? `pol-${item.police.id}` : item.kind === 'safe_station' ? `saf-${item.station.id}` : `gas-${item.gas.id}`}
                className="px-4 py-3 flex items-center justify-between gap-2.5 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${
                    item.kind === 'safe_station' ? 'bg-[#E6F4EC] text-[#13693E]' : item.kind === 'police_station' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {item.kind === 'safe_station' && <Store className="w-4 h-4" />}
                    {item.kind === 'police_station' && <Shield className="w-4.5 h-4.5" />}
                    {item.kind === 'gas_station' && <Fuel className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="text-[13px] font-bold text-slate-950 truncate">{rawName}</p>
                      {idx === 0 && <span className="text-[9.5px] font-bold bg-[#E6F4EC] text-[#13693E] px-1.5 py-0.2 rounded-full shrink-0">Gần nhất</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      <strong className="font-bold text-[#13693E]">{meters}m</strong> • {minutes}p đi bộ • {displayAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button" onClick={handleRoute} title="Chỉ đường" aria-label="Chỉ đường"
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Navigation className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                  <button
                    type="button" onClick={handlePickRescue}
                    className="px-2.5 py-1.5 rounded-full bg-[#13693E] hover:bg-[#0F5C36] text-white text-[11px] font-bold active:scale-95 transition-transform shadow-2xs"
                  >
                    Đón (-20k)
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nút Xem Thêm / Thu Gọn */}
        {shelterItems.length > 5 && (
          <button
            type="button" onClick={() => setIsExpanded((prev) => !prev)}
            className="w-full py-2.5 text-center text-xs font-bold text-[#13693E] hover:bg-emerald-50/50 flex items-center justify-center gap-1 transition-colors border-t border-slate-100"
          >
            <span>{isExpanded ? 'Thu gọn danh sách' : `Xem thêm ${hiddenCount} điểm an toàn khác`}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </section>

      {/* 5. Cẩm Nang An Toàn */}
      <SafetyGuidelinesAccordion />

      {/* Modal SOS */}
      <SOSModal isOpen={isSosOpen} activeLocation={activeLocation} savedPhone={sosPhone} onTriggerSos={onTriggerSos} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}
