import { ChevronDown, Moon, Ticket } from 'lucide-react';
import { useState } from 'react';
import type { OrderPricing } from '../../types/rescue';
import { formatVnd } from '../../utils/pricingAndSimLogic';

interface OrderInvoiceBarProps {
  pricing: OrderPricing;
  availableVoucherCount: number;
  onOpenVouchers: () => void;
  simulateNight?: boolean;
  onToggleNight?: () => void;
}

export function OrderInvoiceBar({
  pricing,
  availableVoucherCount,
  onOpenVouchers,
  simulateNight,
  onToggleNight,
}: OrderInvoiceBarProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const hasDiscount = pricing.appliedVoucher !== null && pricing.discountAmount > 0;
  const hasNightSurcharge = (pricing.nightSurcharge && pricing.nightSurcharge > 0) || simulateNight;

  return (
    <div className="mb-2 space-y-1.5">
      {/* 1 Single Summary Bar */}
      <div className="flex h-10 items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/90 px-3">
        {/* Left: Voucher trigger */}
        <button
          type="button"
          onClick={onOpenVouchers}
          data-testid="voucher-picker-trigger"
          className="flex min-w-0 items-center gap-1.5 text-left text-xs transition-colors hover:opacity-80 focus-visible:outline-none"
        >
          <Ticket
            className={`h-3.5 w-3.5 shrink-0 ${hasDiscount ? 'text-emerald-600' : 'text-amber-500'}`}
            aria-hidden="true"
          />
          <span className="truncate font-semibold text-slate-800">
            {hasDiscount && pricing.appliedVoucher ? (
              <span className="font-bold text-emerald-700">
                Ưu đãi: {pricing.appliedVoucher.code} (-{formatVnd(pricing.discountAmount)})
              </span>
            ) : (
              <span>Ưu đãi: Chọn mã ({availableVoucherCount}) &gt;</span>
            )}
          </span>
        </button>

        {/* Right: Night toggle chip & Collapsible price details toggle */}
        <div className="flex items-center gap-1.5">
          {onToggleNight && (
            <button
              type="button"
              onClick={onToggleNight}
              data-testid="toggle-night-test-btn"
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all ${
                simulateNight
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300'
              }`}
            >
              <Moon className="h-2.5 w-2.5" />
              <span>{simulateNight ? 'Đêm +20k' : 'Test đêm'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDetailsOpen((prev) => !prev)}
            aria-expanded={isDetailsOpen}
            className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none"
          >
            <span>Chi tiết</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isDetailsOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <span data-testid="invoice-final-price" className="sr-only">
        {formatVnd(pricing.finalPrice)}
      </span>

      {/* Expandable Price Breakdown */}
      {isDetailsOpen && (
        <div className="animate-fade-in space-y-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Giá dịch vụ gốc</span>
            <span className="font-semibold text-slate-800">
              {formatVnd(pricing.basePrice)}
            </span>
          </div>

          {hasNightSurcharge && !pricing.isNightWaivedByMember && (
            <div className="flex items-center justify-between text-amber-700 font-medium">
              <span className="flex items-center gap-1">
                <Moon className="h-3 w-3 text-amber-600" />
                <span>Phụ phí đêm khuya (22h - 5h)</span>
              </span>
              <span className="font-sans font-bold tabular-nums">
                +{formatVnd(pricing.nightSurcharge || 20000)}
              </span>
            </div>
          )}

          {pricing.isNightWaivedByMember && (
            <div className="flex items-center justify-between text-emerald-700 font-medium">
              <span className="flex items-center gap-1">
                <Moon className="h-3 w-3 text-emerald-600" />
                <span>Phụ phí đêm khuya</span>
              </span>
              <span className="font-sans font-bold text-[11px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                Miễn phí (Hội viên)
              </span>
            </div>
          )}

          {pricing.memberDiscountAmount && (
            <div className="flex items-center justify-between font-medium text-emerald-700">
              <span>Ưu đãi {pricing.memberPlanName || 'Hội viên'}</span>
              <span className="font-sans font-semibold tabular-nums">
                -{formatVnd(pricing.memberDiscountAmount)}
              </span>
            </div>
          )}

          {hasDiscount && (
            <div className="flex items-center justify-between font-medium text-emerald-600">
              <span>Voucher ({pricing.appliedVoucher?.code})</span>
              <span className="font-sans font-semibold tabular-nums">
                -{formatVnd(pricing.discountAmount - (pricing.memberDiscountAmount || 0))}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-1 font-bold text-slate-900">
            <span>Tổng thanh toán</span>
            <span className="font-sans tabular-nums text-emerald-600">
              {formatVnd(pricing.finalPrice)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
