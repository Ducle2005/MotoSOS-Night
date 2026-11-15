import { AlertTriangle, CheckCircle2, ShieldCheck, Wrench, X } from 'lucide-react';
import type { ScopeApprovalItem } from '../types/rescue';
import { formatVnd } from '../utils/pricingAndSimLogic';

interface ScopeApprovalDrawerProps {
  isOpen: boolean;
  item: ScopeApprovalItem | null;
  currentTotal: number;
  onApprove: (item: ScopeApprovalItem) => void;
  onReject: () => void;
  onClose: () => void;
}

export function ScopeApprovalDrawer({
  isOpen,
  item,
  currentTotal,
  onApprove,
  onReject,
  onClose,
}: ScopeApprovalDrawerProps) {
  if (!isOpen || !item) return null;

  const newTotal = currentTotal + item.cost;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scope-drawer-title"
      className="fixed inset-0 z-[125] flex items-end justify-center pointer-events-auto animate-step-enter"
    >
      {/* Dark backdrop without backdrop-blur to preserve 60fps WebGL canvas */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-[430px] rounded-t-[28px] bg-white p-5 shadow-2xl transition-all">
        {/* Drag handle */}
        <div className="flex justify-center -mt-2 pb-3">
          <div className="h-1 w-10 rounded-full bg-slate-300" aria-hidden="true" />
        </div>

        {/* Header with amber badge & close button */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>ĐỀ XUẤT PHÁT SINH TỪ KỸ THUẬT VIÊN</span>
            </div>
            <h2 id="scope-drawer-title" className="mt-1.5 text-base font-extrabold text-slate-900">
              Yêu cầu xử lý kỹ thuật tại chỗ
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng ngăn kéo phát sinh"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Item detail card */}
        <div className="mt-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Wrench className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">{item.title}</p>
              <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{item.reason}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/70 pt-2 text-xs">
            <span className="text-slate-600 font-medium">Chi phí linh kiện phụ tùng:</span>
            <span className="font-bold text-amber-600 text-sm">+{formatVnd(item.cost)}</span>
          </div>

          <div className="flex items-baseline justify-between border-t border-slate-200/70 pt-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Tổng thanh toán mới:
            </span>
            <span className="text-lg font-black text-emerald-600 font-sans tabular-nums">
              {formatVnd(newTotal)}
            </span>
          </div>
        </div>

        {/* Warranty guarantee note */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Linh kiện chính hãng • Áp dụng bảo hành điện tử 7 ngày</span>
        </div>

        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onReject}
            data-testid="scope-reject-btn"
            className="flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 active:scale-98"
          >
            Từ chối (Giữ giá cũ)
          </button>

          <button
            type="button"
            onClick={() => onApprove(item)}
            data-testid="scope-approve-btn"
            className="flex min-h-[46px] items-center justify-center gap-1.5 rounded-2xl bg-[#090D16] px-3 text-xs font-bold text-emerald-400 shadow-lg shadow-slate-950/20 transition-transform hover:bg-slate-900 active:scale-98"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Đồng ý (+{formatVnd(item.cost)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
