import { Star } from 'lucide-react';
import type { MechanicInfo, OrderPricing } from '../../types/rescue';
import { formatVnd } from '../../utils/pricingAndSimLogic';
import { MotoRescueBadgeIcon } from '../MotoRescueBadgeIcon';

interface MechanicVipBadgeCardProps {
  mechanic: MechanicInfo;
  issueSummary: string;
  cleanLocation: string;
  pricing: OrderPricing;
  hasDiscount: boolean;
}

export function MechanicVipBadgeCard({
  mechanic,
  issueSummary,
  cleanLocation,
  pricing,
  hasDiscount,
}: MechanicVipBadgeCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#131C31] p-3 text-white shadow-[0_12px_24px_-6px_rgba(9,13,22,0.35)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl"
      />

      <div className="relative z-10">
        {/* Dòng 1: Tên + Sao đánh giá bên trái | Biển số xe bên phải */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300/50 bg-gradient-to-br from-amber-500/20 via-slate-900 to-black text-amber-300 shadow-sm ring-1 ring-amber-400/20">
              <MotoRescueBadgeIcon variant="verified" className="h-4 w-4 text-amber-300" />
            </div>

            <div className="min-w-0 flex items-center gap-1.5">
              <h2 className="truncate text-[14px] font-bold text-white tracking-tight">
                {mechanic.name}
              </h2>
              <span className="flex shrink-0 items-center gap-0.5 text-[11.5px] font-semibold text-amber-300">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span>{mechanic.rating}</span>
                <span className="text-slate-400">({mechanic.completedRescues})</span>
              </span>
            </div>
          </div>

          {/* Khung biển số xe trắng nổi khối */}
          <div className="shrink-0 text-right">
            <span className="rounded-md border border-slate-300 bg-white px-2 py-0.5 font-mono text-[11px] font-extrabold tracking-wider text-slate-950 shadow-xs whitespace-nowrap">
              {mechanic.licensePlate}
            </span>
          </div>
        </div>

        {/* Dòng 2: Sự cố • Điểm đón bên trái | Giá chốt bên phải */}
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="truncate text-slate-300 text-[11.5px] font-medium mr-2">
            {issueSummary} • {cleanLocation}
          </span>

          <span className="flex shrink-0 items-center gap-1 tabular-nums">
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through">
                {formatVnd(pricing.basePrice)}
              </span>
            )}
            <span className="font-extrabold text-emerald-400 text-[13px]">
              {formatVnd(pricing.finalPrice)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
