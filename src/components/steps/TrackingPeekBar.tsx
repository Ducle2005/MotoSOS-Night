import { ChevronUp, MessageCircle, Phone } from 'lucide-react';
import type { MechanicInfo } from '../../types/rescue';

interface TrackingPeekBarProps {
  mechanic: MechanicInfo;
  liveEtaMinutes: number;
  otp: string;
  onOpenChat: () => void;
  onExpand: () => void;
  onCall: () => void;
}

export function TrackingPeekBar({
  mechanic,
  liveEtaMinutes,
  otp,
  onOpenChat,
  onExpand,
  onCall,
}: TrackingPeekBarProps) {
  const mechanicFirstName = mechanic.name.split(' ').slice(-1)[0] || 'Tuấn';

  return (
    <div
      data-testid="tracking-peek-mode"
      className="flex h-[120px] flex-col justify-between px-4 py-2 bg-[#F8FAFC]"
    >
      <button
        type="button"
        onClick={onExpand}
        className="mx-auto flex h-3 w-12 items-center justify-center"
        aria-label="Mở rộng bảng điều khiển"
      >
        <span className="h-1 w-8 rounded-full bg-slate-300" />
      </button>

      <div className="flex items-center justify-between gap-2.5">
        <div
          onClick={onExpand}
          className="min-w-0 flex-1 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <p className="truncate text-xs font-bold text-slate-900">
              Thợ {mechanicFirstName} tới sau {liveEtaMinutes}p • Mã OTP: <span className="font-mono text-emerald-700 font-extrabold">{otp}</span>
            </p>
          </div>
          <p className="mt-0.5 truncate text-[10.5px] text-slate-500">
            {mechanic.licensePlate} • Chạm để mở rộng
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <a
            href={`tel:${mechanic.phone}`}
            onClick={onCall}
            data-testid="call-mechanic-btn"
            title="Gọi điện"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white shadow-xs hover:bg-slate-800 active:scale-95 transition-all"
          >
            <Phone className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={onOpenChat}
            data-testid="chat-mechanic-btn"
            title="Nhắn tin"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
          </button>

          <button
            type="button"
            onClick={onExpand}
            data-testid="peek-expand-btn"
            title="Mở rộng"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 hover:bg-slate-300 transition-colors ml-0.5"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 pb-0.5">
        <div className="h-0.5 rounded-full bg-emerald-500" />
        <div className="h-0.5 rounded-full bg-emerald-500" />
        <div className="h-0.5 rounded-full bg-emerald-500" />
      </div>
    </div>
  );
}
