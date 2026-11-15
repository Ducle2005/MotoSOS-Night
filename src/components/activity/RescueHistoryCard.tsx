import { BatteryCharging, ChevronRight, CircleDot, Fuel, Zap } from 'lucide-react';
import type { RescueReceipt } from '../../types/rescue';
import { formatVnd } from '../../utils/pricingAndSimLogic';
import { MotoRescueBadgeIcon } from '../MotoRescueBadgeIcon';

interface RescueHistoryCardProps {
  receipt: RescueReceipt;
  onSelect: (receipt: RescueReceipt) => void;
}

function getServiceIcon(serviceName: string, issueType?: string) {
  const normalized = (serviceName + ' ' + (issueType || '')).toLowerCase();
  if (normalized.includes('xăng') || normalized.includes('fuel')) {
    return <Fuel className="h-5 w-5" aria-hidden="true" />;
  }
  if (normalized.includes('bình') || normalized.includes('battery') || normalized.includes('kích')) {
    return <Zap className="h-5 w-5" aria-hidden="true" />;
  }
  if (normalized.includes('lốp') || normalized.includes('tire') || normalized.includes('ruột')) {
    return <CircleDot className="h-5 w-5" aria-hidden="true" />;
  }
  return <MotoRescueBadgeIcon variant="dispatch" className="h-5 w-5" />;
}

export function RescueHistoryCard({ receipt, onSelect }: RescueHistoryCardProps) {
  return (
    <article
      onClick={() => onSelect(receipt)}
      className="group relative cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all active:scale-[0.99] hover:border-slate-200"
    >
      {/* Hàng trên: Icon + Tên dịch vụ + Tổng tiền */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-emerald-400">
            {getServiceIcon(receipt.serviceName, receipt.issueType)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {receipt.serviceName}
            </h3>
            <p className="text-[11px] font-mono font-medium text-slate-400">
              #{receipt.id}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-[15px] font-bold text-slate-950">
            {formatVnd(receipt.finalPrice)}
          </span>
          {receipt.discountAmount > 0 && (
            <p className="text-[10px] font-semibold text-emerald-600">
              Tiết kiệm {formatVnd(receipt.discountAmount)}
            </p>
          )}
        </div>
      </div>

      {/* Hàng giữa: Địa chỉ + Mô tả hạng mục */}
      <div className="mt-3 space-y-1">
        <p className="line-clamp-1 text-xs text-slate-500">
          {receipt.locationAddress}
        </p>
        <p className="line-clamp-1 text-xs font-medium text-slate-600">
          {receipt.replacedParts}
        </p>
      </div>

      {/* Hàng dưới: Thợ + Biển số + Thời gian + Xem chi tiết */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
        <div className="flex items-center gap-1.5 truncate text-slate-500">
          <span className="font-medium text-slate-800">{receipt.mechanicName}</span>
          <span>•</span>
          <span className="font-mono text-[11px] font-bold text-slate-700">
            {receipt.mechanicPlate}
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline text-slate-400">{receipt.completedAt}</span>
        </div>

        <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-emerald-600 group-hover:text-emerald-700">
          <span>Xem chi tiết</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
