import { Fuel, Shield, ShieldCheck, Wrench } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useHorizontalDragScroll } from '../../hooks/useHorizontalDragScroll';
import type { MapLayerFilter } from '../../types/rescue';

interface MapFilterChipsProps {
  activeFilter: MapLayerFilter;
  openShopCount: number;
  gasStationCount: number;
  policeStationCount: number;
  stationCount: number;
  onSelectFilter: (filter: MapLayerFilter) => void;
}

export function MapFilterChips({
  activeFilter,
  openShopCount,
  gasStationCount,
  policeStationCount,
  stationCount,
  onSelectFilter,
}: MapFilterChipsProps) {
  const { scrollRef, isDragging, dragHandlers } = useHorizontalDragScroll();

  const handleChipClick = (
    filter: MapLayerFilter,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    onSelectFilter(filter);
    event.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  };

  return (
    <div
      ref={scrollRef}
      role="tablist"
      aria-label="Bộ lọc lớp bản đồ"
      data-testid="map-filter-chips"
      {...dragHandlers}
      className={`pointer-events-auto absolute inset-x-0 top-14 z-30 flex w-full touch-pan-x select-none items-center gap-2 overflow-x-auto overscroll-x-contain px-4 py-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeFilter === 'all'}
        onClick={(e) => handleChipClick('all', e)}
        className={`inline-flex h-8 shrink-0 select-none items-center gap-1.5 rounded-full px-3 text-xs font-semibold shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap ${
          activeFilter === 'all'
            ? 'bg-slate-900 text-white shadow-sm'
            : 'border border-slate-200/90 bg-white/95 text-slate-700 shadow-xs hover:border-slate-300'
        }`}
      >
        <span>Tất cả</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeFilter === 'police_stations'}
        onClick={(e) => handleChipClick('police_stations', e)}
        className={`inline-flex h-8 shrink-0 select-none items-center gap-1.5 rounded-full px-3 text-xs font-semibold shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 whitespace-nowrap ${
          activeFilter === 'police_stations'
            ? 'bg-indigo-700 text-white shadow-sm'
            : 'border border-slate-200/90 bg-white/95 text-slate-700 shadow-xs hover:border-indigo-300'
        }`}
      >
        <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Công an</span>
        {policeStationCount > 0 && (
          <span
            className={`font-sans text-[10px] font-bold tabular-nums ${
              activeFilter === 'police_stations' ? 'text-indigo-200' : 'text-slate-400'
            }`}
          >
            {policeStationCount}
          </span>
        )}
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeFilter === 'gas_stations'}
        onClick={(e) => handleChipClick('gas_stations', e)}
        className={`inline-flex h-8 shrink-0 select-none items-center gap-1.5 rounded-full px-3 text-xs font-semibold shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 whitespace-nowrap ${
          activeFilter === 'gas_stations'
            ? 'bg-amber-500 text-white shadow-sm'
            : 'border border-slate-200/90 bg-white/95 text-slate-700 shadow-xs hover:border-amber-300'
        }`}
      >
        <Fuel className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Cây xăng</span>
        {gasStationCount > 0 && (
          <span
            className={`font-sans text-[10px] font-bold tabular-nums ${
              activeFilter === 'gas_stations' ? 'text-amber-100' : 'text-slate-400'
            }`}
          >
            {gasStationCount}
          </span>
        )}
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeFilter === 'repair_shops'}
        onClick={(e) => handleChipClick('repair_shops', e)}
        className={`inline-flex h-8 shrink-0 select-none items-center gap-1.5 rounded-full px-3 text-xs font-semibold shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap ${
          activeFilter === 'repair_shops'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'border border-slate-200/90 bg-white/95 text-slate-700 shadow-xs hover:border-blue-300'
        }`}
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            activeFilter === 'repair_shops' ? 'bg-emerald-300' : 'bg-emerald-500'
          }`}
          aria-hidden="true"
        />
        <Wrench className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Tiệm sửa xe (Đang mở)</span>
        {openShopCount > 0 && (
          <span
            className={`font-sans text-[10px] font-bold tabular-nums ${
              activeFilter === 'repair_shops' ? 'text-blue-100' : 'text-slate-400'
            }`}
          >
            {openShopCount}
          </span>
        )}
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeFilter === 'safe_stations'}
        onClick={(e) => handleChipClick('safe_stations', e)}
        className={`inline-flex h-8 shrink-0 select-none items-center gap-1.5 rounded-full px-3 text-xs font-semibold shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap ${
          activeFilter === 'safe_stations'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'border border-slate-200/90 bg-white/95 text-slate-700 shadow-xs hover:border-emerald-300'
        }`}
      >
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Trạm An Toàn 24/7</span>
        {stationCount > 0 && (
          <span
            className={`font-sans text-[10px] font-bold tabular-nums ${
              activeFilter === 'safe_stations' ? 'text-emerald-100' : 'text-slate-400'
            }`}
          >
            {stationCount}
          </span>
        )}
      </button>
    </div>
  );
}
