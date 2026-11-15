import { AlertTriangle, MapPin, Share2 } from 'lucide-react';

interface RemoteAreaNoticeCardProps {
  onPickCurrentWithDiscount: () => void;
  onOpenSosModal: () => void;
}

export function RemoteAreaNoticeCard({
  onPickCurrentWithDiscount,
  onOpenSosModal,
}: RemoteAreaNoticeCardProps) {
  return (
    <div
      data-testid="remote-area-notice-card"
      className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 space-y-2.5 text-slate-900 shadow-2xs"
    >
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 mt-0.5">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-bold text-amber-950">
            Chưa có Trạm An Toàn trong bán kính 3km
          </h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800">
            Khu vực này ít điểm mở xuyên đêm. Hệ thống đề xuất đón tại chỗ và vẫn giữ ưu đãi -20.000đ cho bạn.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={onPickCurrentWithDiscount}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#090D16] px-3 py-2 text-xs font-bold text-emerald-400 shadow-sm transition-all hover:bg-slate-900 active:scale-[0.98]"
        >
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Đón tại chỗ (Giữ ưu đãi -20k)</span>
        </button>

        <button
          type="button"
          onClick={onOpenSosModal}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-2xs transition-all hover:bg-amber-50 active:scale-[0.98]"
        >
          <Share2 className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
          <span>Gửi vị trí SOS Zalo</span>
        </button>
      </div>
    </div>
  );
}
