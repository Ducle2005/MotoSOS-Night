import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { ActiveRescueInfo, GeoCoord, MechanicInfo, OrderPricing, TrackingStatus } from '../../types/rescue';
import { formatVnd } from '../../utils/pricingAndSimLogic';
import { CancelRescueModal } from '../CancelRescueModal';
import { RescueSupportModal } from '../RescueSupportModal';
import { AcceptedMechanicCard } from './AcceptedMechanicCard';

interface TrackingStepProps {
  status: TrackingStatus; issueSummary: string; pickupTitle: string; pickupAddress: string;
  mechanic: MechanicInfo; liveEtaMinutes: number; hasArrived: boolean; pricing: OrderPricing;
  rescueOtp: string; elapsedSeconds: number; onOpenChat: () => void; onDemoAdvance: () => void;
  onConfirmOtp: () => void; onCancelOrder: () => void; onCompleteReset: () => void;
  onConfirmCancelDetailed?: (reason: string, feeAmount: number) => void;
  activeRescue?: ActiveRescueInfo | null; userCoord?: GeoCoord; mechanicCoord?: GeoCoord;
  pickupCoord?: GeoCoord; gpsGapMeters?: number; onShareZalo?: () => void;
}

export function TrackingStep({
  status, issueSummary, pickupTitle, pickupAddress, mechanic, liveEtaMinutes,
  hasArrived, pricing, rescueOtp, elapsedSeconds, onOpenChat, onDemoAdvance,
  onConfirmOtp, onCancelOrder, onConfirmCancelDetailed, onCompleteReset,
  activeRescue, userCoord, mechanicCoord, pickupCoord, gpsGapMeters, onShareZalo,
}: TrackingStepProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isCancelUnlocked, setIsCancelUnlocked] = useState(false);

  const handleCancelDetailed = (reason: string, feeAmount: number) => {
    if (onConfirmCancelDetailed) onConfirmCancelDetailed(reason, feeAmount);
    else onCancelOrder();
    setIsCancelModalOpen(false);
  };

  if (status === 'searching') {
    return (
      <div className="flex min-h-0 flex-1 flex-col" data-testid="tracking-searching">
        <div className="flex-1 overflow-y-auto px-5 pt-1 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="mx-auto h-1 w-8 rounded-full bg-slate-300 mb-2.5" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                  Đang tìm thợ gần bạn...
                </h1>
                <p className="truncate text-xs text-slate-500">
                  Kết nối đội cứu hộ trong bán kính 3km
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onDemoAdvance}
              className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 whitespace-nowrap"
            >
              Giả lập thợ nhận đơn
            </button>
          </div>

          <div
            className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5"
            aria-hidden="true"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />
                <div className="h-2.5 w-1/2 rounded bg-slate-200/70 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="mt-2.5 space-y-2 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="shrink-0 text-slate-500">Sự cố & Giá chốt</span>
              <span className="font-sans font-bold tabular-nums text-slate-900">
                {issueSummary} · {formatVnd(pricing.finalPrice)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3 border-t border-slate-100 pt-2">
              <span className="shrink-0 text-slate-500">Điểm đón</span>
              <span className="text-right font-medium text-slate-700">
                {pickupTitle} · {pickupAddress}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-3">
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="min-h-[46px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Hủy yêu cầu cứu hộ
          </button>
        </div>

        <CancelRescueModal
          isOpen={isCancelModalOpen}
          elapsedSeconds={elapsedSeconds}
          mechanicName={mechanic.name}
          isMechanicArrived={false}
          onConfirmCancel={handleCancelDetailed}
          onClose={() => setIsCancelModalOpen(false)}
        />
      </div>
    );
  }

  if (status === 'accepted' || status === 'arrived' || status === 'repairing') {
    return (
      <>
        <AcceptedMechanicCard
          issueSummary={issueSummary}
          pickupTitle={pickupTitle}
          pickupAddress={pickupAddress}
          mechanic={mechanic}
          liveEtaMinutes={liveEtaMinutes}
          hasArrived={status === 'arrived' || hasArrived}
          pricing={pricing}
          otp={rescueOtp}
          trackingStatus={status}
          elapsedSeconds={elapsedSeconds}
          onOpenChat={onOpenChat}
          onConfirmOtp={onConfirmOtp}
          onRequestCancel={() => setIsCancelModalOpen(true)}
          onOpenSupport={() => setIsSupportModalOpen(true)}
          isCancelUnlocked={isCancelUnlocked}
        />

        <CancelRescueModal
          isOpen={isCancelModalOpen}
          elapsedSeconds={elapsedSeconds}
          mechanicName={mechanic.name}
          isMechanicArrived={!isCancelUnlocked && (status === 'arrived' || hasArrived || status === 'repairing')}
          onConfirmCancel={handleCancelDetailed}
          onClose={() => setIsCancelModalOpen(false)}
        />

        <RescueSupportModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
          activeRescue={activeRescue ?? {
            status: status === 'arrived' ? 'arrived' : 'en_route',
            etaMinutes: liveEtaMinutes, mechanic, otpCode: rescueOtp,
            serviceName: issueSummary, finalPrice: pricing.finalPrice,
            pickupAddress, elapsedSeconds,
          }}
          mechanic={mechanic}
          userCoord={userCoord}
          mechanicCoord={mechanicCoord}
          pickupCoord={pickupCoord}
          gpsGapMeters={gpsGapMeters}
          onUnlockCancel={() => {
            setIsCancelUnlocked(true);
            setIsCancelModalOpen(true);
          }}
          onForceCancel={(fee) => {
            handleCancelDetailed('Cần hủy chuyến bất khả kháng (Phí công thợ di chuyển)', fee);
          }}
          onShareZalo={onShareZalo}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="tracking-completed">
      <div className="flex-1 overflow-y-auto px-5 pt-1 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mx-auto h-1 w-8 rounded-full bg-slate-300 mb-2.5" />
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-600">Cứu hộ hoàn tất</p>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900">
              Xe bạn đã an toàn lăn bánh!
            </h1>
          </div>
        </div>

        <div className="mt-3.5 space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="shrink-0 text-slate-500">Thợ phụ trách</span>
            <span className="text-right font-bold text-slate-900">
              {mechanic.name}{' '}
              <span className="font-sans whitespace-nowrap tabular-nums text-emerald-700">
                · {mechanic.licensePlate}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-2">
            <span className="shrink-0 text-slate-500">Sự cố &amp; Thanh toán</span>
            <span className="font-sans font-bold tabular-nums text-slate-900">
              {issueSummary} · {formatVnd(pricing.finalPrice)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 border-t border-slate-200/70 pt-2">
            <span className="shrink-0 text-slate-500">Điểm đón</span>
            <span className="text-right text-slate-700">{pickupAddress}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-2">
            <span className="shrink-0 text-slate-500">Mã đối soát an toàn</span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              #{rescueOtp}
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-3">
        <button
          type="button"
          onClick={onCompleteReset}
          className="min-h-[46px] w-full rounded-xl bg-emerald-500 px-5 text-sm font-extrabold text-white shadow-md shadow-emerald-500/20 transition-colors hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.98]"
        >
          Lưu lịch sử &amp; Về Trang chủ
        </button>
      </div>
    </div>
  );
}
