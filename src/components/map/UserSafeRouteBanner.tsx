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
  const timeLabel = `~${Math.max(1, durationMinutes)}p`;
  const guideText = instruction || `Đi theo lộ trình khoảng ${distLabel}`;

  return (
    <div
      role="region"
      aria-label="Chỉ dẫn lộ trình tới Điểm An Toàn"
      className="pointer-events-auto mx-3 mb-2 flex items-center justify-between gap-2 rounded-full border border-slate-200/90 bg-white px-2 py-1.5 shadow-[0_6px_20px_rgba(15,23,42,0.12)] transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      {/* Bên trái: Icon điều hướng tròn + Khối chữ 2 dòng nén gọn */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0284C7] text-white"
          aria-hidden="true"
        >
          <Navigation className="h-3.5 w-3.5 fill-white text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 leading-none">
            <span className="text-[12px] font-extrabold text-slate-950 truncate">
              {title}
            </span>
            <span className="shrink-0 text-[11px] font-bold text-[#0284C7]">
              · {distLabel} ({timeLabel})
            </span>
          </div>
          <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500 leading-tight">
            {guideText}
          </p>
        </div>
      </div>

      {/* Bên phải: Nút tròn thu phóng + Nút tròn đóng lộ trình */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onZoomFit}
          title="Thu phóng toàn tuyến"
          aria-label="Thu phóng toàn tuyến"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-sky-50 hover:text-[#0284C7] active:scale-90"
        >
          <Maximize2 className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={onClose}
          title="Tắt chỉ đường"
          aria-label="Tắt chỉ đường"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-90"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
