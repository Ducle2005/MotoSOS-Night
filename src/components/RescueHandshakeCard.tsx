import { CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import type { TrackingStatus } from '../types/rescue';

interface RescueHandshakeCardProps {
  otp: string;
  trackingStatus: TrackingStatus;
  mechanicName: string;
  onConfirmOtp: () => void;
}

export function RescueHandshakeCard({
  otp,
  trackingStatus,
  mechanicName,
  onConfirmOtp,
}: RescueHandshakeCardProps) {
  const digits = (otp || '8492').split('').slice(0, 4);
  const isArrived = trackingStatus === 'arrived';
  const isRepairing = trackingStatus === 'repairing';

  if (isRepairing) {
    return (
      <div
        data-testid="handshake-verified-card"
        className="mt-2 flex items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-2 text-emerald-950 shadow-xs"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                Đã đối soát an toàn
              </span>
              <span className="rounded bg-emerald-200/90 px-1.5 py-0.2 font-mono text-[10px] font-bold text-emerald-950">
                #{otp}
              </span>
            </div>
            <p className="truncate text-[10.5px] text-emerald-700">
              Thợ {mechanicName} đang kiểm tra &amp; sửa chữa xe
            </p>
          </div>
        </div>
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      data-testid="rescue-handshake-card"
      className="mt-2 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-2 shadow-xs"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: Icon + Title + 1-line subtitle */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-xs font-bold text-slate-900">
              Mã OTP nhận thợ
            </h3>
            <p className="truncate text-[10.5px] text-slate-600">
              {isArrived ? 'Đọc mã cho thợ trước khi giao xe' : 'Đọc mã cho thợ trước khi giao xe'}
            </p>
          </div>
        </div>

        {/* Right: 4 compact sharp PIN boxes */}
        <div className="flex shrink-0 items-center gap-1" aria-label={`Mã OTP: ${otp}`}>
          {digits.map((d, i) => (
            <span
              key={i}
              className="flex h-8 w-7 items-center justify-center rounded-lg border border-amber-300 bg-white font-mono text-sm font-extrabold text-slate-950 shadow-xs"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Action button displayed ONLY when arrived */}
      {isArrived && (
        <div className="mt-2 pt-2 border-t border-amber-200/80">
          <button
            type="button"
            onClick={onConfirmOtp}
            data-testid="confirm-handshake-otp-btn"
            className="flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 active:scale-[0.98] transition-all"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>Xác nhận thợ đọc đúng mã {otp} • Bắt đầu sửa</span>
          </button>
        </div>
      )}
    </div>
  );
}
