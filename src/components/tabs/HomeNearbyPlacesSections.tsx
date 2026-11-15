import { useMemo, useState, useEffect } from 'react';
import { Fuel, ShieldCheck, Store, Wrench } from 'lucide-react';
import { MOCK_REPAIR_SHOPS_SEED } from '../../data/mockRepairShops';
import { MOCK_SAFE_STATIONS } from '../../data/mockRescueData';
import { useSmoothHorizontalWheel } from '../../hooks/useSmoothHorizontalWheel';
import type { GasStation, GeoCoord, PoliceStation, RepairShop, SafeStation } from '../../types/rescue';
import { buildFallbackGasStations } from '../../utils/gasStationApi';
import { isSameOrNearbyPlace } from '../../utils/placeDeduplication';
import { buildFallbackPoliceStations } from '../../utils/policeStationApi';
import { computeHaversineMeters } from '../../utils/rescueLogic';

interface Props {
  originCoord: GeoCoord;
  activeAddress?: string;
  stations?: SafeStation[];
  policeStations?: PoliceStation[];
  gasStations?: GasStation[];
  openRepairShops?: RepairShop[];
  onOpenTrackingMap?: () => void;
  onSelectStationCard: (stationId: string) => void;
  onRouteToPoliceStation?: (station: PoliceStation) => void;
  onRouteToGasStation?: (gas: GasStation) => void;
  onRouteToRepairShop?: (shop: RepairShop) => void;
}

type FilterChip = 'all' | 'safe' | 'police' | 'fuel_repair';

interface SupportPlaceItem {
  id: string;
  name: string;
  kind: 'safe' | 'police' | 'fuel' | 'repair';
  dist: number;
  subtitle: string;
  coord: GeoCoord;
  onAction: () => void;
}

const CHIPS: Array<{ id: FilterChip; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'safe', label: 'Trạm 24/7' },
  { id: 'police', label: 'Công an' },
  { id: 'fuel_repair', label: 'Cây xăng & Sửa xe' },
];

export function HomeNearbyPlacesSections({
  originCoord, activeAddress, stations, policeStations, gasStations, openRepairShops,
  onOpenTrackingMap, onSelectStationCard, onRouteToPoliceStation, onRouteToGasStation, onRouteToRepairShop,
}: Props) {
  const [activeChip, setActiveChip] = useState<FilterChip>('all');
  const { containerRef: listRef, ...wheelProps } = useSmoothHorizontalWheel(`${activeAddress}_${activeChip}`);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollLeft = 0;
  }, [listRef, activeChip, activeAddress]);

  const allPlaces = useMemo(() => {
    const safeSource = stations && stations.length > 0 ? stations : MOCK_SAFE_STATIONS;
    const polSource = policeStations && policeStations.length > 0 ? policeStations : buildFallbackPoliceStations(originCoord);
    const gasSource = gasStations && gasStations.length > 0 ? gasStations : buildFallbackGasStations(originCoord);
    const rawShops: RepairShop[] = openRepairShops && openRepairShops.length > 0 ? openRepairShops : MOCK_REPAIR_SHOPS_SEED.map((s) => {
      const dist = Math.round(computeHaversineMeters(originCoord, s.coord));
      return {
        id: s.id, name: s.name, address: s.address, phone: s.phone, distanceMeters: dist,
        rideMinutes: Math.max(1, Math.round(dist / 400)), openingHoursRaw: s.openingHoursRaw,
        isOpen: true, openStatusLabel: 'Đang mở', hasExplicitHours: true, coord: s.coord,
      };
    });
    const cleanShops = rawShops.filter((s) => !/toyota|hyundai|ford|kia|mazda|mercedes|honda ô tô|ô tô|auto/i.test(s.name));

    const combined: SupportPlaceItem[] = [
      ...safeSource.map((s) => {
        const dist = Math.round(computeHaversineMeters(originCoord, s.coord));
        return {
          id: s.id, name: s.name, kind: 'safe' as const, dist, subtitle: `${dist}m • ${s.categoryLabel || 'Trạm 24/7'}`, coord: s.coord,
          onAction: () => onSelectStationCard(s.id),
        };
      }),
      ...polSource.map((p) => {
        const dist = Math.round(computeHaversineMeters(originCoord, p.coord));
        return {
          id: p.id, name: p.name, kind: 'police' as const, dist, subtitle: `${dist}m • Đồn công an 24/7`, coord: p.coord,
          onAction: () => { if (onRouteToPoliceStation) onRouteToPoliceStation(p); else onSelectStationCard(p.id); },
        };
      }),
      ...gasSource.map((g) => {
        const dist = Math.round(computeHaversineMeters(originCoord, g.coord));
        return {
          id: g.id, name: g.name, kind: 'fuel' as const, dist, subtitle: `${dist}m • Cây xăng`, coord: g.coord,
          onAction: () => { if (onRouteToGasStation) onRouteToGasStation(g); else onSelectStationCard(g.id); },
        };
      }),
      ...cleanShops.map((sh) => {
        const dist = Math.round(computeHaversineMeters(originCoord, sh.coord));
        return {
          id: sh.id, name: sh.name, kind: 'repair' as const, dist, subtitle: `${dist}m • Tiệm sửa xe`, coord: sh.coord,
          onAction: () => { if (onRouteToRepairShop) onRouteToRepairShop(sh); else onSelectStationCard(sh.id); },
        };
      }),
    ];

    const deduplicated: SupportPlaceItem[] = [];
    for (const item of combined) {
      if (!deduplicated.some((u) => isSameOrNearbyPlace(u.coord, u.name, item.coord, item.name, 35))) {
        deduplicated.push(item);
      }
    }
    return deduplicated.sort((a, b) => a.dist - b.dist);
  }, [stations, policeStations, gasStations, openRepairShops, originCoord.lat, originCoord.lng]);

  const filteredPlaces = useMemo(() => {
    if (activeChip === 'all') return allPlaces.slice(0, 10);
    if (activeChip === 'safe') return allPlaces.filter((p) => p.kind === 'safe').slice(0, 8);
    if (activeChip === 'police') return allPlaces.filter((p) => p.kind === 'police').slice(0, 8);
    return allPlaces.filter((p) => p.kind === 'fuel' || p.kind === 'repair').slice(0, 8);
  }, [allPlaces, activeChip]);

  return (
    <div className="space-y-2 pb-20">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-extrabold text-slate-900 tracking-tight">
          Điểm hỗ trợ an toàn gần bạn
        </span>
        {onOpenTrackingMap && (
          <button
            type="button"
            onClick={onOpenTrackingMap}
            className="text-[11.5px] font-bold text-[#13693E] hover:underline"
          >
            Bản đồ ›
          </button>
        )}
      </div>

      {/* Thanh chip lọc 4 danh mục */}
      <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden py-0.5">
        {CHIPS.map((chip) => {
          const isSelected = activeChip === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setActiveChip(chip.id)}
              className={`rounded-full px-3 py-1 text-[11px] whitespace-nowrap transition-all active:scale-95 ${
                isSelected
                  ? 'bg-[#13693E] text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/90 font-medium hover:bg-slate-50'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Dải thẻ ngang duy nhất (Zero-Lag 120fps) */}
      <div
        ref={listRef}
        {...wheelProps.dragHandlers}
        className="-mx-4 px-4 flex items-center justify-start gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden will-change-scroll [contain:paint] pt-1"
      >
        {filteredPlaces.map((item) => (
          <div
            key={item.id}
            className="w-[245px] shrink-0 rounded-xl bg-white border border-slate-200/80 p-2.5 flex items-center justify-between gap-2 shadow-2xs transition-colors duration-150 hover:border-emerald-500/50 hover:bg-emerald-50/15"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                  item.kind === 'safe'
                    ? 'bg-emerald-50 text-[#13693E]'
                    : item.kind === 'police'
                    ? 'bg-indigo-50 text-indigo-600'
                    : item.kind === 'fuel'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-teal-50 text-teal-700'
                }`}
              >
                {item.kind === 'safe' && <Store className="w-4 h-4" />}
                {item.kind === 'police' && <ShieldCheck className="w-4.5 h-4.5" />}
                {item.kind === 'fuel' && <Fuel className="w-4 h-4" />}
                {item.kind === 'repair' && <Wrench className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-slate-950 truncate">{item.name}</p>
                <p className="text-[10.5px] font-medium text-slate-500 truncate mt-0.5">{item.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={item.onAction}
              className="bg-[#13693E] hover:bg-[#0F5C36] text-white text-[10.5px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition-transform active:scale-95 shadow-2xs"
            >
              Đi tới
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
