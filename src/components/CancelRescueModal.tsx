import { AlertTriangle, Clock, Fuel, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { formatVnd } from '../utils/pricingAndSimLogic';
import { calculateCancelFee } from '../utils/rescueLogic';

interface CancelRescueModalProps {
  isOpen: boolean;
  elapsedSeconds: number;
  mechanicName: string;
  isMechanicArrived?: boolean;
  onConfirmCancel: (reason: string, feeAmount: number) => void;
  onClose: () => void;
}

const REASONS = [
  'Xe đã tự nổ máy',
  'Có người thân tới giúp',
  'Chờ lâu hơn dự kiến',
  'Đặt nhầm vị trí/dịch vụ',
];

export function CancelRescueModal({
  isOpen,
  elapsedSeconds,
  mechanicName,
  isMechanicArrived = false,
  onConfirmCancel,
  onClose,
}: CancelRescueModalProps) {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [isTestFastForward, setIsTestFastForward] = useState(false);

  if (!isOpen || typeof document === 'undefined') return null;

  const effectiveSeconds = isTestFastForward ? 210 : elapsedSeconds;
  const { feeAmount, isGracePeriod: isGrace, remainingGraceSeconds: remainingSec } =
    calculateCancelFee(effectiveSeconds);
  const remainingMinText = `${Math.floor(remainingSec / 60)}:${(remainingSec % 60)
    .toString()
    .padStart(2, '0')}`;

  const handleConfirm = () => {
    onConfirmCancel(selectedReason, feeAmount);
    onClose();
  };

  const confirmText =
    feeAmount > 0
      ? `Xác nhận hủy (${formatVnd(feeAmount)})`
      : 'Xác nhận hủy (0đ)';

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xác nhận hủy yêu cầu cứu hộ"
      className="fixed inset-0 z-[999] flex items-end justify-center bg-slate-950/70 p-3 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] max-h-[84dvh] bg-white rounded-[28px] shadow-[0_24px_60px_rgba(9,13,22,0.35)] flex flex-col overflow-hidden"
      >
        {/* Tầng 1 — Header ghim cố định */}
        <div className="shrink-0 px-5 pt-4 pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-extrabold text-slate-950">
              Hủy yêu cầu cứu hộ?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chính sách hỗ trợ thợ cứu hộ đêm khuya
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tầng 2 — Thân nội dung vuốt cuộn dọc siêu mượt */}
        <div
          onTouchStart={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-5 py-3.5 space-y-3.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Cảnh báo khóa hủy khi thợ đã tới nơi */}
          {isMechanicArrived && (
            <div data-testid="cancel-modal-arrived-warning" className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-amber-900">Thao tác hủy bị khóa</p>
                <p className="mt-0.5 text-[11px] text-amber-800 leading-snug">Kỹ thuật viên vừa tới điểm hẹn nên hệ thống đã khóa thao tác hủy đơn.</p>
              </div>
            </div>
          )}

          {/* Thanh công tắc kiểm thử gọn gàng */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">
              Chế độ kiểm thử (Tua qua 3 phút)
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isTestFastForward}
              aria-label="Chế độ kiểm thử tua qua 3 phút"
              onClick={() => setIsTestFastForward((prev) => !prev)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isTestFastForward ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isTestFastForward ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Khối thẻ trạng thái ân hạn hoặc cảnh báo phí */}
          {isGrace ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-950">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Thời gian ân hạn • Miễn phí hủy 0đ</span>
                </span>
                <span className="flex items-center gap-1 font-sans tabular-nums text-emerald-800 font-extrabold">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{remainingMinText}</span>
                </span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-700">
                Bạn có thể hủy miễn phí trong 3 phút đầu sau khi thợ nhận ca.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-amber-900">
                    Thợ {mechanicName} đã xuất phát đêm khuya
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-800">
                    Cuộc gọi đã qua 3 phút. Nhằm bảo đảm công bằng cho thợ, hệ thống áp dụng:
                  </p>
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-white/90 p-2 border border-amber-200">
                    <span className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Fuel className="h-4 w-4 text-amber-600" aria-hidden="true" />
                      <span>Phí hỗ trợ xăng xe thợ:</span>
                    </span>
                    <span className="font-sans font-black tabular-nums text-rose-600 text-sm">
                      {formatVnd(feeAmount)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-500 italic">
                    *Phí sẽ được ghi nhận vào dư nợ thanh toán ở lần gọi xe tiếp theo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lưới 2x2 lý do bạn muốn hủy */}
          <div>
            <p className="text-xs font-bold text-slate-800 mb-2">
              Lý do bạn muốn hủy:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map((r) => {
                const active = selectedReason === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedReason(r)}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-semibold transition-all ${
                      active
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        active ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    />
                    <span className="truncate">{r}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tầng 3 — Footer 2 nút bấm ghim cố định ở đáy */}
        <div className="shrink-0 px-5 py-3.5 border-t border-slate-100 bg-white flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-[13px] shadow-sm active:scale-[0.98] transition-transform text-center"
          >
            {isMechanicArrived ? 'Đã hiểu • Gặp thợ ngay' : 'Tiếp tục chờ thợ'}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isMechanicArrived}
            className={`flex-1 py-3 rounded-xl border font-bold text-[13px] transition-all text-center ${
              isMechanicArrived
                ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed pointer-events-none'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 active:scale-[0.98]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
