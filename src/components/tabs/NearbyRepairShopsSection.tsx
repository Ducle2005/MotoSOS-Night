import { Bike, Loader2, Navigation, Phone } from 'lucide-react';
import type { RepairShop } from '../../types/rescue';
import { useSmoothHorizontalWheel } from '../../hooks/useSmoothHorizontalWheel';
import { formatShopCompactMeta } from '../../utils/repairShopApi';

interface NearbyRepairShopsSectionProps {
  shops: RepairShop[];
  isLoading: boolean;
  onSelectShop: (shopId: string) => void;
  onViewAllOnMap: () => void;
}

export function NearbyRepairShopsSection({
  shops,
  isLoading,
  onSelectShop,
  onViewAllOnMap,
}: NearbyRepairShopsSectionProps) {
  const visibleShops = shops.slice(0, 6);
  const { containerRef, isHovered, isDragging, dragHandlers } =
    useSmoothHorizontalWheel();

  return (
    <section aria-label="Tiệm sửa xe đang mở gần bạn" className="mt-4">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900">
            Tiệm sửa xe đang mở gần bạn
          </h2>
        </div>

        {isLoading ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            <span>Đang lọc</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={onViewAllOnMap}
            className={`text-xs font-semibold transition-colors duration-200 ${
              isHovered ? 'text-emerald-500 font-bold' : 'text-emerald-700 hover:text-emerald-800'
            }`}
          >
            Xem bản đồ →
          </button>
        )}
      </div>

      {visibleShops.length === 0 ? (
        <div className="mt-2.5 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-xs text-slate-500 shadow-xs">
          Hiện chưa ghi nhận tiệm mở cửa trong bán kính 2.5km. Bạn có thể gọi thợ lưu động 24/7 phía trên.
        </div>
      ) : (
        <div
          ref={containerRef}
          {...dragHandlers}
          className={`-mx-4 mt-2.5 flex items-stretch gap-2.5 overflow-x-auto overscroll-x-contain px-4 py-1.5 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {visibleShops.map((shop) => (
            <article
              key={shop.id}
              data-testid={`home-repair-shop-${shop.id}`}
              className="flex w-[250px] shrink-0 flex-col justify-between rounded-2xl border border-slate-100 bg-white p-3 shadow-xs select-none focus-visible:outline-none transform-gpu transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_12px_26px_-6px_rgba(16,185,129,0.16),0_4px_12px_-2px_rgba(15,23,42,0.06)] active:scale-[0.985]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs">
                      <Bike className="h-4 w-4" aria-hidden="true" />
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white" />
                    </span>
                    <p className="truncate text-xs font-bold text-slate-900">
                      {shop.name}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-sans text-[10.5px] font-semibold text-emerald-700 whitespace-nowrap">
                    Đang mở
                  </span>
                </div>

                <p className="mt-1.5 truncate text-[11px] text-slate-500">
                  {formatShopCompactMeta(shop.distanceMeters, shop.address)}
                </p>
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <a
                  href={`tel:${shop.phone.replace(/\s+/g, '')}`}
                  className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-50 px-2 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200 transition-colors hover:bg-emerald-100 active:scale-95 whitespace-nowrap"
                >
                  <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>Gọi</span>
                </a>

                <button
                  type="button"
                  onClick={() => onSelectShop(shop.id)}
                  className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-xl bg-slate-900 px-2 text-[11px] font-bold text-white transition-colors hover:bg-slate-800 active:scale-95 whitespace-nowrap"
                >
                  <Navigation className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>Đường đi</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
