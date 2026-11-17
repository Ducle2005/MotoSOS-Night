import { Maximize2, Navigation, X } from 'lucide-react';

interface UserSafeRouteBannerProps {
  title: string;
  distanceMeters: number;
  durationMinutes: number;
  instruction?: string;
  onZoomFit: () => void;
  onClose: () => void;
}

export function UserSafeRouteBanner({
  title,
  distanceMeters,
  durationMinutes,
  instruction,
  onZoomFit,
  onClose,
}: UserSafeRouteBannerProps) {
  const distLabel = distanceMeters < 1000 ? `${distanceMeters}m` : `${(distanceMeters / 1000).toFixed(1)}km`;
  const timeLabel = `~${Math.max(1, durationMinutes)}p đi xe`;
  const guideText = instruction || `Đi theo lộ trình khoảng ${distLabel}`;

  return (
    <div
      role="region"
      aria-label="Chỉ dẫn lộ trình tới Điểm An Toàn"
      className="pointer-events-auto mx-3 mb-2 flex items-center justify-between gap-2.5 rounded-2xl border border-sky-500/35 bg-white px-3.5 py-2.5 shadow-[0_8px_24px_rgba(2,132,199,0.16)] transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      {/* Khối bên trái: Icon điều hướng + 2 dòng thông tin */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#0284C7]"
          aria-hidden="true"
        >
          <Navigation className="h-5 w-5 fill-[#0284C7]/20 text-[#0284C7]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[12.5px] font-extrabold text-slate-950 truncate">
              Lộ trình tới <span className="text-[#0284C7]">{title}</span>
            </span>
            <span className="shrink-0 text-[11px] font-bold text-[#0284C7]">
              {distLabel} • {timeLabel}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] font-medium text-slate-600">
            {guideText}
          </p>
        </div>
      </div>

      {/* Khối bên phải: Nút Thu phóng + Nút Đóng */}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onZoomFit}
          title="Thu phóng trọn tuyến đường"
          aria-label="Thu phóng trọn tuyến đường"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-[#0284C7] transition-all hover:bg-sky-100 active:scale-90"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onClose}
          title="Đóng dẫn đường"
          aria-label="Đóng dẫn đường"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-700 active:scale-90"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
