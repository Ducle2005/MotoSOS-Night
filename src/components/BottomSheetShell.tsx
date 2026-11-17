import { ArrowLeft, ChevronDown, ChevronUp, LocateFixed } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import type { RescueStep } from '../types/rescue';

interface BottomSheetShellProps {
  step: RescueStep;
  isShopDetailOpen?: boolean;
  isGasListOpen?: boolean;
  isPoliceListOpen?: boolean;
  isConvenienceOpen?: boolean;
  floatingTopSlot?: ReactNode;
  onBack?: () => void;
  onRecenter: () => void;
  children: ReactNode;
}

const STEP_INDEX: Record<RescueStep, number> = {
  idle: 0,
  issue: 1,
  pickup: 2,
  tracking: 3,
};

export function BottomSheetShell({
  step,
  isShopDetailOpen = false,
  isGasListOpen = false,
  isPoliceListOpen = false,
  isConvenienceOpen = false,
  floatingTopSlot,
  onBack,
  onRecenter,
  children,
}: BottomSheetShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(false);
  }, [step]);

  const currentIndex = STEP_INDEX[step];
  const expandedHeightClass =
    step === 'idle'
      ? isConvenienceOpen
        ? 'max-h-[42%]'
        : isGasListOpen || isPoliceListOpen
          ? 'max-h-[50%]'
          : isShopDetailOpen
            ? 'max-h-[44%]'
            : 'max-h-[34%]'
      : step === 'issue'
        ? 'max-h-[52%]'
        : step === 'pickup'
          ? 'max-h-[48%]'
          : 'h-auto max-h-[48%]';

  const heightClass = isCollapsed && step !== 'tracking' ? 'max-h-[72px]' : expandedHeightClass;

  return (
    <aside
      aria-label="Bảng điều khiển cứu hộ xe máy"
      className={`pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex ${heightClass} flex-col transition-[max-height] duration-200 ${
        step === 'tracking'
          ? 'rounded-t-[32px] bg-[#F8FAFC] shadow-[0_-18px_48px_rgba(9,13,22,0.16)] border-t border-white'
          : isConvenienceOpen
            ? 'rounded-t-[28px] bg-white shadow-[0_-12px_36px_rgba(15,23,42,0.12)] border-t border-slate-100'
            : 'rounded-t-3xl border-t border-slate-100 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)]'
      }`}
    >
      {/* Floating slot (e.g. UserSafeRouteBanner) & Recenter button above Bottom Sheet */}
      <div className="pointer-events-none absolute inset-x-0 bottom-full z-30 flex flex-col">
        {floatingTopSlot}
        <div className="flex justify-end px-4 mb-3">
          <button
            type="button"
            onClick={onRecenter}
            aria-label="Về vị trí của tôi"
            title="Về vị trí của tôi"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/90 bg-white text-emerald-600 shadow-lg shadow-slate-900/10 transition-all hover:border-emerald-400 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95"
          >
            <LocateFixed className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Drag handle & Header logic */}
      {step === 'issue' ? (
        <div className="shrink-0 px-4 pt-2 pb-0.5">
          <div className="mx-auto mb-1.5 h-1 w-9 rounded-full bg-slate-200" aria-hidden="true" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="truncate text-[16px] font-extrabold tracking-tight text-slate-950">
                Xe bạn đang gặp sự cố gì?
              </h1>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Giá niêm yết
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <span className="font-sans text-[11px] font-bold text-emerald-600">
                Bước 1/3
              </span>
              <button
                type="button"
                data-testid="toggle-sheet-btn"
                aria-expanded={!isCollapsed}
                onClick={() => setIsCollapsed((prev) => !prev)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors focus-visible:outline-none"
              >
                {isCollapsed ? (
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div
            className="mt-1.5 mb-2 grid grid-cols-3 gap-1.5"
            role="progressbar"
            aria-valuenow={1}
            aria-valuemin={1}
            aria-valuemax={3}
            aria-label="Tiến trình đặt cứu hộ"
          >
            <div className="h-1 rounded-full bg-emerald-500" />
            <div className="h-1 rounded-full bg-slate-100" />
            <div className="h-1 rounded-full bg-slate-100" />
          </div>
        </div>
      ) : step !== 'tracking' ? (
        <>
          <div className="flex shrink-0 items-center justify-between px-4 pt-2 pb-1">
            <span className="w-16" aria-hidden="true" />
            <div className="h-1 w-9 rounded-full bg-slate-200" aria-hidden="true" />
            <button
              type="button"
              data-testid="toggle-sheet-btn"
              aria-expanded={!isCollapsed}
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="inline-flex h-6 items-center gap-1 rounded-full bg-slate-100 px-2.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
            >
              {isCollapsed ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Mở rộng</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Thu gọn</span>
                </>
              )}
            </button>
          </div>

          {/* Step progress indicator during active flow */}
          {currentIndex > 0 && (
            <div className="shrink-0 px-5 pt-0.5 pb-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {onBack && currentIndex === 2 && (
                    <button
                      type="button"
                      onClick={onBack}
                      aria-label="Quay lại"
                      className="flex h-5 w-5 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900 active:scale-95 transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                  <span className="font-sans font-semibold tabular-nums text-slate-900">
                    Bước {currentIndex} / 3
                  </span>
                </div>
                <span className="font-semibold text-emerald-600">
                  {currentIndex === 1 && 'Chọn sự cố'}
                  {currentIndex === 2 && 'Chọn điểm chờ'}
                  {currentIndex === 3 && 'Theo dõi thợ'}
                </span>
              </div>
              <div
                className="mt-1 grid grid-cols-3 gap-1.5"
                role="progressbar"
                aria-valuenow={currentIndex}
                aria-valuemin={1}
                aria-valuemax={3}
                aria-label="Tiến trình đặt cứu hộ"
              >
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-colors duration-200 ${
                      idx <= currentIndex ? 'bg-emerald-500' : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      {(!isCollapsed || step === 'tracking') && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-3xl">
          {children}
        </div>
      )}
    </aside>
  );
}
