import { ChevronDown, Clock, Lock, MessageCircle, Phone, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { MechanicInfo, OrderPricing, TrackingStatus } from '../../types/rescue';
import { cleanAddressSnippet } from '../../utils/pricingAndSimLogic';
import { RescueHandshakeCard } from '../RescueHandshakeCard';
import { MechanicVipBadgeCard } from './MechanicVipBadgeCard';
import { TrackingPeekBar } from './TrackingPeekBar';

interface AcceptedMechanicCardProps {
  issueSummary: string;
  pickupTitle: string;
  pickupAddress: string;
  mechanic: MechanicInfo;
  liveEtaMinutes: number;
  hasArrived: boolean;
  pricing: OrderPricing;
  otp: string;
  trackingStatus: TrackingStatus;
  elapsedSeconds: number;
  onOpenChat: () => void;
  onConfirmOtp: () => void;
  onRequestCancel: () => void;
  onOpenSupport?: () => void;
  isCancelUnlocked?: boolean;
}

export function AcceptedMechanicCard({
  issueSummary, pickupTitle, pickupAddress, mechanic, liveEtaMinutes,
  hasArrived, pricing, otp, trackingStatus, elapsedSeconds,
  onOpenChat, onConfirmOtp, onRequestCancel, onOpenSupport, isCancelUnlocked,
}: AcceptedMechanicCardProps) {
  const [callNotice, setCallNotice] = useState(false);
  const [isPeekMode, setIsPeekMode] = useState(false);

  const hasDiscount = pricing.appliedVoucher !== null && pricing.discountAmount > 0;
  const isRepairing = trackingStatus === 'repairing';
  const isArrived = !isCancelUnlocked && (trackingStatus === 'arrived' || hasArrived || isRepairing);
  const cleanLocation = cleanAddressSnippet(pickupTitle, pickupAddress);

  if (isPeekMode) {
    return (
      <TrackingPeekBar
        mechanic={mechanic}
        liveEtaMinutes={liveEtaMinutes}
        otp={otp}
        onOpenChat={onOpenChat}
        onExpand={() => setIsPeekMode(false)}
        onCall={() => setCallNotice(true)}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="tracking-accepted">
      {/* Scrollable sheet body - 60fps no scrollbar */}
      <div className="flex-1 overflow-y-auto px-4 pt-1 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mx-auto h-1 w-8 rounded-full bg-slate-300 mb-1.5" />

        {/* Hàng tiến trình Bước 3/3 & Nút Thu gọn */}
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-slate-700">Bước 3 / 3</span>
          <button
            type="button"
            onClick={() => setIsPeekMode(true)}
            data-testid="step3-collapse-btn"
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
            <span>Thu gọn</span>
            <span className="text-slate-400">· Theo dõi thợ</span>
          </button>
        </div>

        {/* Thanh tiến trình 3 bước thu mảnh h-1 */}
        <div
          className="mb-2.5 grid grid-cols-3 gap-1.5"
          role="progressbar"
          aria-valuenow={3}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label="Tiến trình cứu hộ bước 3"
        >
          <div className="h-1 rounded-full bg-emerald-500" />
          <div className="h-1 rounded-full bg-emerald-500" />
          <div className="h-1 rounded-full bg-emerald-500" />
        </div>

        {/* 1. Header Bước 3/3 thông thoáng: 2 Hàng sắc nét */}
        {/* Hàng trên: Chấm xanh nhịp tim + Trạng thái (trái) | Huy hiệu thời gian nền tối viền vàng champagne (phải) */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="truncate text-[11px] font-extrabold tracking-wider text-emerald-600 uppercase">
              {isRepairing
                ? 'ĐANG SỬA CHỮA XE'
                : hasArrived
                  ? 'ĐÃ TỚI ĐIỂM HẸN'
                  : 'ĐANG DI CHUYỂN TỚI BẠN'}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full bg-[#090D16] border border-amber-300/40 px-2.5 py-0.5 text-xs font-bold font-sans text-amber-300 shadow-xs tabular-nums shrink-0">
            <Clock className="h-3 w-3 text-amber-300" aria-hidden="true" />
            <span>{liveEtaMinutes} phút</span>
          </div>
        </div>

        {/* Hàng dưới: Tiêu đề "Dự kiến tới sau X phút" hiển thị trọn vẹn một mình */}
        <div className="mt-0.5 mb-2.5">
          <h1
            data-testid="live-eta-heading"
            className="text-lg font-extrabold text-slate-950 tracking-tight"
          >
            {isRepairing
              ? 'Thợ đang tiến hành sửa chữa'
              : hasArrived
                ? 'Thợ đã có mặt tại điểm hẹn'
                : `Dự kiến tới sau ${liveEtaMinutes} phút`}
          </h1>
        </div>

        {/* 2. Thẻ Thợ VIP Đen Obsidian */}
        <MechanicVipBadgeCard
          mechanic={mechanic}
          issueSummary={issueSummary}
          cleanLocation={cleanLocation}
          pricing={pricing}
          hasDiscount={hasDiscount}
        />

        {/* 3. Dải Xác Thực OTP 1-Hàng Siêu Gọn */}
        <RescueHandshakeCard
          otp={otp}
          trackingStatus={trackingStatus}
          mechanicName={mechanic.name}
          onConfirmOtp={onConfirmOtp}
        />

        {callNotice && (
          <div
            role="status"
            data-testid="call-connecting-status"
            className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"
          >
            <span>Đang kết nối cuộc gọi tới {mechanic.phone}...</span>
            <button
              type="button"
              onClick={() => setCallNotice(false)}
              className="text-[11px] font-bold text-emerald-700 underline"
            >
              Ẩn
            </button>
          </div>
        )}
      </div>

      {/* 4. Cụm Nút Hành Động Đáy Tinh Gọn */}
      <div className="shrink-0 border-t border-slate-100 bg-white px-4 pt-2.5 pb-2">
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${mechanic.phone}`}
            onClick={() => setCallNotice(true)}
            data-testid="call-mechanic-btn"
            className="inline-flex py-2.5 items-center justify-center gap-1.5 rounded-xl bg-[#090D16] px-3 text-[13px] font-bold text-white shadow-sm hover:bg-slate-900 active:scale-[0.98] transition-transform"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Gọi điện</span>
          </a>

          <button
            type="button"
            onClick={onOpenChat}
            data-testid="chat-mechanic-btn"
            className="inline-flex py-2.5 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-transform"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <MessageCircle className="h-3.5 w-3.5 text-slate-700" aria-hidden="true" />
            <span>Nhắn tin</span>
          </button>
        </div>

        {/* Nút Hủy / Thẻ khóa khi thợ đã có mặt */}
        {isArrived ? (
          <div
            data-testid="cancel-locked-banner"
            className="w-full mt-2.5 py-2.5 px-3.5 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Lock className="h-4 w-4 text-[#13693E] shrink-0" aria-hidden="true" />
              <span className="text-[11.5px] font-bold text-slate-700 truncate">
                Thợ đã có mặt • Không thể hủy chuyến
              </span>
            </div>
            {onOpenSupport ? (
              <button
                type="button"
                onClick={onOpenSupport}
                data-testid="support-locked-btn"
                className="text-[11px] font-bold text-[#13693E] underline shrink-0 hover:text-emerald-800"
              >
                Hỗ trợ
              </button>
            ) : (
              <a
                href="tel:1900636812"
                className="text-[11px] font-bold text-[#13693E] underline shrink-0 hover:text-emerald-800"
              >
                Hỗ trợ
              </a>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onRequestCancel}
            data-testid="request-cancel-btn"
            className="w-full mt-2.5 py-2.5 px-3.5 rounded-xl bg-rose-50/80 hover:bg-rose-100/90 border border-rose-200/70 flex items-center justify-between transition-colors active:scale-[0.99]"
          >
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-rose-600" aria-hidden="true" />
              <span className="text-xs font-semibold text-rose-600">Hủy yêu cầu cứu hộ</span>
            </div>
            <span
              className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                elapsedSeconds <= 180
                  ? 'bg-emerald-100/80 text-emerald-700'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {elapsedSeconds <= 180 ? 'Miễn phí trong 3p đầu' : 'Phí xăng đêm 30.000đ'}
            </span>
          </button>
        )}

        {/* Dòng Cam Kết Bảo Hiểm Tinh Gọn */}
        <p className="mt-2 text-center text-[10.5px] text-slate-400">
          Giá đã chốt • Bảo hiểm cứu hộ 50.000.000đ
        </p>
      </div>
    </div>
  );
}
