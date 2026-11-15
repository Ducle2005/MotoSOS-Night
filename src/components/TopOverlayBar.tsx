import { ArrowLeft, RotateCcw, ShieldCheck } from 'lucide-react';
import type { RescueStep, TrackingStatus } from '../types/rescue';

interface TopOverlayBarProps {
  step: RescueStep;
  trackingStatus: TrackingStatus;
  isOffline?: boolean;
  onToggleOffline?: () => void;
  onBackToHome: () => void;
  onDemoAdvance: () => void;
  onOpenScopeApproval?: () => void;
}

export function TopOverlayBar({
  step,
  trackingStatus,
  isOffline = false,
  onToggleOffline,
  onBackToHome,
  onDemoAdvance,
  onOpenScopeApproval,
}: TopOverlayBarProps) {
  const getDemoLabel = (): string => {
    if (step === 'tracking') {
      if (trackingStatus === 'searching') return 'Giả lập thợ';
      if (trackingStatus === 'accepted' || trackingStatus === 'arrived') return 'Xong ca';
      if (trackingStatus === 'completed') return 'Thử lại';
    }
    return 'Test thợ';
  };

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-1.5 px-3 pt-3 pb-2">
      <div className="pointer-events-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onBackToHome}
          aria-label="Quay về Trang chủ"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md shadow-slate-900/10 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 shadow-md shadow-slate-900/10">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <p className="text-xs font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
            MotoSOS
          </p>
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-1.5">
        {onToggleOffline && (
          <button
            type="button"
            onClick={onToggleOffline}
            data-testid="network-status-btn"
            aria-label={isOffline ? 'Chế độ Offline (bấm để kết nối lại)' : 'Đang có mạng 4G (bấm để thử giả lập Offline)'}
            className={`flex h-9 items-center gap-1.5 rounded-full border px-2.5 shadow-md shadow-slate-900/10 transition-all active:scale-95 ${
              isOffline
                ? 'border-amber-400/80 bg-amber-50 text-amber-700 ring-1 ring-amber-400'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              {isOffline && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${isOffline ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            </span>
            <span className="text-[11px] font-bold tracking-tight">
              {isOffline ? 'Offline' : '4G'}
            </span>
          </button>
        )}

        {step === 'tracking' && trackingStatus !== 'completed' && onOpenScopeApproval && (
          <button
            type="button"
            onClick={onOpenScopeApproval}
            data-testid="test-scope-approval-btn"
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 text-xs font-bold text-amber-700 shadow-md shadow-slate-900/10 transition-colors hover:bg-amber-100 active:scale-95 whitespace-nowrap"
          >
            <span>+ Báo phát sinh</span>
          </button>
        )}

        <button
          type="button"
          onClick={onDemoAdvance}
          aria-label={getDemoLabel()}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-700 shadow-md shadow-slate-900/10 transition-colors hover:border-emerald-400 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.98] whitespace-nowrap"
        >
          {step === 'tracking' && trackingStatus === 'completed' && (
            <RotateCcw className="h-3 w-3 shrink-0" aria-hidden="true" />
          )}
          <span>{getDemoLabel()}</span>
        </button>
      </div>
    </header>
  );
}
