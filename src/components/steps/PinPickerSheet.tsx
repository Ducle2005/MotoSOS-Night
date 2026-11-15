import { Check, Loader2, MapPin, X } from 'lucide-react';
import type { GeoCoord } from '../../types/rescue';

interface PinPickerSheetProps {
  coord: GeoCoord;
  address: string;
  isResolving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PinPickerSheet({
  coord,
  address,
  isResolving,
  onConfirm,
  onCancel,
}: PinPickerSheetProps) {
  return (
    <div
      data-testid="pin-picker-sheet"
      className="flex min-h-0 flex-1 flex-col justify-between gap-3 px-5 pb-4"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Chọn trực tiếp trên bản đồ
              </h2>
              <p className="text-[11px] text-slate-500">
                Kéo bản đồ để đưa ghim tới đúng vị trí xe hỏng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Hủy ghim bản đồ"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            {isResolving ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-500" aria-hidden="true" />
            ) : (
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
            )}
            <p className="truncate text-sm font-bold text-slate-900">
              {isResolving ? 'Đang cập nhật tên đường...' : address}
            </p>
          </div>
          <p className="mt-1 pl-4 font-sans text-[11px] font-medium tabular-nums text-slate-500">
            Tọa độ tâm: {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="button"
          data-testid="confirm-pin-location-btn"
          onClick={onConfirm}
          disabled={isResolving}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 text-sm font-bold text-white shadow-md shadow-emerald-500/25 transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-65"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          <span>Xác nhận vị trí này</span>
        </button>
      </div>
    </div>
  );
}
