import { ChevronRight, Clock, MapPin, Navigation, Sparkles, Wrench } from 'lucide-react';
import type { MechanicInfo, RescueStep, TrackingStatus } from '../../types/rescue';
import { formatVnd } from '../../utils/pricingAndSimLogic';

interface ActivityHeroCardProps {
  step: RescueStep;
  trackingStatus: TrackingStatus;
  activeIssueLabel: string;
  activePickupAddress: string;
  mechanic: MechanicInfo;
  totalCompletedTrips: number;
  totalSavedAmount: number;
  onOpenMapTracking: () => void;
  onTriggerDemoAdvance: () => void;
  onStartNewRescue: () => void;
}

export function ActivityHeroCard({
  step,
  trackingStatus,
  activeIssueLabel,
  activePickupAddress,
  mechanic,
  totalCompletedTrips,
  totalSavedAmount,
  onOpenMapTracking,
  onTriggerDemoAdvance,
  onStartNewRescue,
}: ActivityHeroCardProps) {
  const isLiveOrder = step === 'tracking';

  if (isLiveOrder) {
    const statusText =
      trackingStatus === 'searching'
        ? 'Đang tìm thợ gần bạn...'
        : trackingStatus === 'accepted'
          ? `Thợ đang tới · ~${mechanic.etaMinutes} phút`
          : trackingStatus === 'arrived'
            ? 'Thợ đã tới vị trí đón'
            : 'Đã hoàn tất cứu hộ';

    return (
      <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-slate-900/80 p-4 shadow-lg backdrop-blur-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{statusText}</span>
          </span>
          <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-200">
            {mechanic.licensePlate}
          </span>
        </div>

        <div className="mt-2.5">
          <h2 className="text-sm font-bold text-white">{activeIssueLabel}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
            <span className="truncate">{activePickupAddress}</span>
          </p>
        </div>

        <div className="mt-3.5 flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMapTracking}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.98] transition-all"
          >
            <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Theo dõi trực tiếp</span>
          </button>
          <button
            type="button"
            onClick={onTriggerDemoAdvance}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-xs font-semibold text-white hover:bg-white/20 active:scale-[0.98] transition-all"
          >
            {trackingStatus === 'completed' ? 'Hoàn tất' : 'Giả lập thợ'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span className="text-xs font-bold text-white">Thống kê cá nhân</span>
          </div>
          <div className="mt-2 flex items-baseline gap-4">
            <div>
              <p className="text-[11px] text-slate-400">Đã cứu hộ</p>
              <p className="font-sans text-base font-extrabold text-white">
                {totalCompletedTrips}{' '}
                <span className="text-xs font-normal text-slate-400">chuyến</span>
              </p>
            </div>
            <div className="h-6 w-px bg-white/10" aria-hidden="true" />
            <div>
              <p className="text-[11px] text-slate-400">Đã tiết kiệm</p>
              <p className="font-sans text-base font-extrabold text-emerald-400">
                {formatVnd(totalSavedAmount)}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartNewRescue}
          className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 active:scale-[0.98]"
        >
          Gọi thợ ngay
        </button>
      </div>
    </div>
  );
}
