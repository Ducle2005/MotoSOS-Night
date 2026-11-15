import { useState } from 'react';
import { Bike, ChevronDown, MapPin, MessageCircle, Phone, ShieldCheck, Wrench } from 'lucide-react';
import type { ActiveRescueInfo } from '../types/rescue';
import { formatVnd } from '../utils/pricingAndSimLogic';

interface ActiveRescueHomeCardProps {
  rescue: ActiveRescueInfo;
  onOpenTrackingMap: () => void;
  onOpenMechanicChat?: () => void;
}

export function ActiveRescueHomeCard({
  rescue,
  onOpenTrackingMap,
  onOpenMechanicChat,
}: ActiveRescueHomeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isArrived = rescue.status === 'arrived';
  const progressRatio = Math.min(1, Math.max(0, (rescue.elapsedSeconds || 0) / 50));
  const progressPercent = isArrived ? 100 : Math.round(18 + progressRatio * 74);
  const otpDigits = rescue.otpCode.padStart(4, '0').slice(0, 4).split('');

  return (
    <article
      data-testid="active-rescue-home-card"
      aria-label="Tiến độ cứu hộ đang diễn ra"
      onClick={() => setIsExpanded((prev) => !prev)}
      className={`mx-4 mt-2.5 mb-3.5 rounded-2xl bg-white border cursor-pointer select-none overflow-hidden transition-all duration-200 ${
        isArrived
          ? 'border-amber-400 ring-1 ring-amber-400/30 shadow-[0_10px_26px_rgba(245,158,11,0.12)]'
          : 'border-slate-200/90 shadow-[0_10px_26px_rgba(15,23,42,0.08)] hover:border-emerald-300'
      }`}
    >
      {/* Tầng 1: Tên thợ trọn vẹn, Biển số xe & Cụm nút Gọi/Nhắn/Chevron */}
      <div className="flex items-center justify-between gap-2 px-3.5 pt-3 pb-1.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[14px] font-extrabold text-slate-950 whitespace-nowrap">
            {rescue.mechanic.name}
          </span>
          <span className="shrink-0 rounded-md bg-slate-100 border border-slate-200/60 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
            {rescue.mechanic.licensePlate}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={`tel:${rescue.mechanic.phone}`}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Gọi thợ ${rescue.mechanic.name}`}
            className="flex h-7 items-center gap-1 rounded-full bg-[#13693E] hover:bg-[#0F5C36] px-2.5 text-[11px] font-bold text-white transition-transform active:scale-95 shadow-xs"
          >
            <Phone className="h-3 w-3" aria-hidden="true" />
            <span>Gọi</span>
          </a>

          {onOpenMechanicChat && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenMechanicChat(); }}
              aria-label="Nhắn tin cho thợ"
              className="flex h-7 items-center gap-1 rounded-full bg-slate-100 hover:bg-slate-200 px-2.5 text-[11px] font-bold text-slate-700 transition-transform active:scale-95"
            >
              <MessageCircle className="h-3 w-3" aria-hidden="true" />
              <span>Nhắn</span>
            </button>
          )}

          <span
            className={`flex h-6 w-6 items-center justify-center text-slate-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-emerald-600' : ''
            }`}
            aria-hidden="true"
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Tầng 2: Thanh lộ trình trực quan có đệm dưới đủ thoáng không chạm viền */}
      <div className="px-3.5 pt-1 pb-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                  isArrived ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  isArrived ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
            </span>
            <span className="truncate text-[11.5px] font-bold text-slate-700">
              {isArrived ? 'Thợ đã tới điểm hẹn!' : 'Thợ đang di chuyển tới'}
            </span>
          </div>

          <span
            className={`shrink-0 text-[11px] font-extrabold ${
              isArrived ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {isArrived ? 'Sẵn sàng hỗ trợ' : `Còn ~${rescue.etaMinutes} phút`}
          </span>
        </div>

        {/* Thanh đường ray & icon xe máy trượt */}
        <div className="relative flex h-6 w-full items-center">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isArrived ? 'bg-amber-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div
            className="absolute -top-0.5 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-[#090D16] border-2 border-white shadow-md transition-all duration-500"
            style={{ left: `${progressPercent}%` }}
            aria-hidden="true"
          >
            {isArrived ? (
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Bike className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </div>

          <div
            className={`absolute right-0 h-2.5 w-2.5 rounded-full border border-white shadow-xs ${
              isArrived ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Ngăn Chi Tiết Mở Rộng */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/90 px-3.5 py-2.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500">Mã OTP thợ cần xác nhận:</span>
            <div className="flex items-center gap-1">
              {otpDigits.map((digit, idx) => (
                <span
                  key={idx}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 font-mono text-xs font-extrabold text-slate-950 shadow-xs"
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/60 bg-white p-2 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1 font-semibold truncate">
                <Wrench className="h-3 w-3 text-emerald-600 shrink-0" />
                <span className="truncate">{rescue.serviceName}</span>
              </span>
              <span className="font-extrabold text-slate-950 shrink-0">
                {formatVnd(rescue.finalPrice)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{rescue.pickupAddress}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenTrackingMap(); }}
            className="flex w-full items-center justify-center gap-1 rounded-xl bg-[#090D16] py-2 text-xs font-bold text-emerald-400 shadow-sm transition-transform active:scale-[0.99] hover:bg-slate-800"
          >
            <span>Xem vị trí thợ trên Bản đồ</span>
            <span aria-hidden="true">›</span>
          </button>
        </div>
      )}
    </article>
  );
}
