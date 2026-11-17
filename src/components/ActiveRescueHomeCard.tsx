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
  const rawProgress = isArrived ? 100 : Math.round(18 + progressRatio * 74);
  const clampedProgress = Math.min(100, Math.max(0, rawProgress));
  const otpDigits = rescue.otpCode.padStart(4, '0').slice(0, 4).split('');

  return (
    <article
      data-testid="active-rescue-home-card"
      aria-label="Tiến độ cứu hộ đang diễn ra"
      onClick={() => setIsExpanded((prev) => !prev)}
      className={`mx-4 mb-3 rounded-2xl bg-white border shadow-[0_6px_20px_rgba(15,23,42,0.06)] p-3.5 transition-all cursor-pointer select-none ${
        isArrived ? 'border-emerald-500/40' : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* 2. Tách Thông Tin Thợ: 2 Dòng Bên Trái + Cụm Nút Tròn Gọn Bên Phải */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <h4 className="text-[14.5px] font-extrabold text-slate-950 truncate">
            {rescue.mechanic.name}
          </h4>
          <div className="mt-1 flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md shrink-0">
              {rescue.mechanic.licensePlate}
            </span>
            <span className="text-[11px] font-medium text-slate-500 truncate">
              • {rescue.serviceName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={`tel:${rescue.mechanic.phone}`}
            onClick={(e) => e.stopPropagation()}
            aria-label="Gọi thợ"
            data-testid="active-card-call-btn"
            className="w-9 h-9 rounded-full bg-[#13693E] hover:bg-[#0F5C36] text-white flex items-center justify-center shadow-xs active:scale-95 transition-transform"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
          </a>

          {onOpenMechanicChat && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMechanicChat();
              }}
              aria-label="Nhắn tin"
              data-testid="active-card-chat-btn"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center relative active:scale-95 transition-transform"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            aria-label={isExpanded ? 'Thu gọn chi tiết' : 'Mở rộng chi tiết'}
            className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180 text-[#13693E]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Hàng Trạng Thái & Thanh Tiến Trình Nằm Gọn Trong Khung */}
      <div className="mt-3 pt-2.5 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2 text-[11.5px]">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  isArrived ? 'bg-[#13693E]' : 'bg-emerald-500'
                }`}
              />
            </span>
            <span className={isArrived ? 'text-[#13693E]' : 'text-slate-800'}>
              {isArrived ? 'Thợ đã tới điểm hẹn!' : 'Thợ đang di chuyển tới bạn'}
            </span>
          </div>

          <span className={`font-bold text-[11px] shrink-0 ${isArrived ? 'text-[#13693E]' : 'text-amber-600'}`}>
            {isArrived ? 'Sẵn sàng hỗ trợ' : `Còn ~${rescue.etaMinutes} phút`}
          </span>
        </div>

        {/* Thanh tiến trình mượt 60fps & kẹp icon giới hạn từ 0% đến 100% */}
        <div className="mt-2.5 mb-0.5 h-1.5 w-full rounded-full bg-slate-100 relative overflow-visible">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isArrived ? 'bg-[#13693E]' : 'bg-amber-500'
            }`}
            style={{ width: `${clampedProgress}%` }}
          />
          <div
            className={`w-5 h-5 rounded-full bg-white border-2 shadow-xs flex items-center justify-center absolute top-1/2 -translate-y-1/2 transition-all duration-300 ${
              isArrived ? 'border-[#13693E]' : 'border-amber-500'
            }`}
            style={{ left: `calc(${clampedProgress}% - ${clampedProgress * 0.2}px)` }}
            aria-hidden="true"
          >
            {isArrived ? (
              <ShieldCheck className="h-3 w-3 text-[#13693E]" />
            ) : (
              <Bike className="h-3 w-3 text-amber-500" />
            )}
          </div>
        </div>
      </div>

      {/* 4. Phần Mở Rộng Chi Tiết */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500">
              {isArrived ? 'Mã OTP đối soát (đọc cho thợ):' : 'Mã OTP an toàn:'}
            </span>
            <div className="flex items-center gap-1">
              {otpDigits.map((digit, idx) => (
                <span
                  key={idx}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border font-mono text-xs font-extrabold shadow-xs ${
                    isArrived
                      ? 'border-[#13693E]/40 bg-emerald-50 text-[#13693E] ring-1 ring-[#13693E]/20'
                      : 'border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-[#F8FAF9] p-2.5 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
                <Wrench className="h-3.5 w-3.5 text-[#13693E] shrink-0" />
                <span className="truncate">{rescue.serviceName}</span>
              </span>
              <span className="font-extrabold text-slate-950 tabular-nums shrink-0">
                {formatVnd(rescue.finalPrice)}
              </span>
            </div>
            <div className="flex items-start gap-1 text-[11px] text-slate-500 border-t border-slate-200/50 pt-1.5 mt-1">
              <MapPin className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
              <span className="truncate">{rescue.pickupAddress}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTrackingMap();
            }}
            data-testid="active-card-view-map-btn"
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 text-[12px] font-bold text-[#13693E] flex items-center justify-center gap-1 active:scale-[0.99] transition-all"
          >
            <span>Xem trên bản đồ ›</span>
          </button>
        </div>
      )}
    </article>
  );
}
