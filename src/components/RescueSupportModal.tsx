import { AlertCircle, CheckCircle2, Phone, Share2, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { ActiveRescueInfo, GeoCoord, MechanicInfo } from '../types/rescue';
import { computeHaversineMeters } from '../utils/rescueLogic';
import { buildSosSharePayload, getExactUserCoordinates, shareViaZalo } from '../utils/sosLocationShare';

export type SupportIssueType = 'not_arrived' | 'wrong_vehicle' | 'overcharge' | 'force_cancel';

export interface RescueSupportTicket {
  issueType: SupportIssueType;
  note: string;
  gpsGapMeters: number;
}

export interface RescueSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRescue?: ActiveRescueInfo | null;
  mechanic?: MechanicInfo;
  userCoord?: GeoCoord;
  mechanicCoord?: GeoCoord;
  pickupCoord?: GeoCoord;
  gpsGapMeters?: number;
  onUnlockCancel?: () => void;
  onForceCancel?: (feeAmount: number) => void;
  onSubmitTicket?: (ticket: RescueSupportTicket) => void;
  onShareZalo?: () => void;
}

const ISSUE_OPTIONS: { id: SupportIssueType; title: string; desc: string }[] = [
  { id: 'not_arrived', title: 'Thợ báo tới nhưng không thấy đâu', desc: 'Đối chiếu vị trí GPS & mở khóa hủy miễn phí nếu thợ ở xa' },
  { id: 'wrong_vehicle', title: 'Sai biển số xe hoặc không đúng người', desc: 'Tuyệt đối không đọc mã OTP 4 số • Bảo vệ an toàn' },
  { id: 'overcharge', title: 'Báo giá sai niêm yết / Đòi phụ thu vô lý', desc: 'Gửi khiếu nại & giữ nguyên mức giá chốt ban đầu' },
  { id: 'force_cancel', title: 'Cần hủy chuyến bất khả kháng', desc: 'Chấp nhận phí hỗ trợ công thợ di chuyển 30.000đ' },
];

export function RescueSupportModal({
  isOpen, onClose, activeRescue, mechanic, userCoord, mechanicCoord, pickupCoord,
  gpsGapMeters, onUnlockCancel, onForceCancel, onSubmitTicket, onShareZalo,
}: RescueSupportModalProps) {
  const [selectedIssue, setSelectedIssue] = useState<SupportIssueType>('not_arrived');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || typeof document === 'undefined') return null;

  const effectiveGap = typeof gpsGapMeters === 'number'
    ? gpsGapMeters
    : mechanicCoord && (pickupCoord || userCoord)
      ? computeHaversineMeters(mechanicCoord, (pickupCoord || userCoord)!)
      : (activeRescue?.status === 'arrived' ? 18 : 240);

  const orderCode = activeRescue?.otpCode ? `#MS-${activeRescue.otpCode}` : '#MS-8421';
  const mechName = activeRescue?.mechanic?.name || mechanic?.name || 'Nguyễn Minh Tuấn';
  const mechPlate = activeRescue?.mechanic?.licensePlate || mechanic?.licensePlate || '59-P2 842.19';

  const handleSubmit = () => {
    onSubmitTicket?.({ issueType: selectedIssue, note, gpsGapMeters: effectiveGap });
    if (selectedIssue === 'not_arrived' && effectiveGap > 150) {
      onUnlockCancel?.(); onClose(); return;
    }
    if (selectedIssue === 'force_cancel') {
      onForceCancel ? onForceCancel(30000) : onUnlockCancel?.();
      onClose(); return;
    }
    setIsSubmitted(true);
  };

  const handleZalo = async () => {
    if (onShareZalo) return onShareZalo();
    const loc = await getExactUserCoordinates(pickupCoord || userCoord);
    const payload = buildSosSharePayload({
      location: loc, address: loc.address, activeRescue,
    });
    await shareViaZalo('', payload);
  };

  const modalBody = (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="rescue-support-modal"
      className="fixed inset-0 z-[999] bg-slate-950/45 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] max-h-[88vh] bg-white rounded-t-[24px] sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header Modal */}
        <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-[17px] font-extrabold text-slate-950">Trung tâm hỗ trợ chuyến đi</h2>
            <p className="text-[11px] font-semibold text-[#13693E]">Bảo hiểm cứu hộ 50.000.000đ</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#13693E] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-950">Đã tiếp nhận yêu cầu hỗ trợ</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Tổng đài CSKH MotoSOS đang trực tiếp can thiệp và bảo vệ quyền lợi của bạn. Nhân viên điều phối sẽ gọi lại trong vòng 30 giây.
            </p>
            <div className="mt-3.5 py-1.5 px-3.5 rounded-xl bg-[#F4F8F6] border border-emerald-600/15 text-[11px] font-semibold text-[#13693E]">
              Mã yêu cầu: #{Math.random().toString(36).substring(2, 7).toUpperCase()} • Đang xử lý
            </div>
            <button type="button" onClick={() => { setIsSubmitted(false); onClose(); }} className="w-full mt-5 py-3 rounded-xl bg-[#13693E] hover:bg-[#0F5C36] text-white font-extrabold text-xs">
              Đã hiểu & Quay lại
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-1 pb-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Thẻ Hồ Sơ Chuyến Đi Tự Động Đính Kèm */}
              <div className="mt-2.5 p-3 rounded-2xl bg-[#F4F8F6] border border-emerald-600/15 flex items-center justify-between gap-2 shadow-xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <span className="font-mono font-bold text-slate-700">{orderCode}</span>
                    <span>•</span>
                    <span className="truncate">{mechName}</span>
                  </div>
                  <p className="text-[11.5px] font-bold text-slate-900 mt-0.5 truncate">{mechPlate}</p>
                </div>
                <div className={`text-right shrink-0 text-xs font-bold ${effectiveGap > 150 ? 'text-rose-600' : 'text-[#13693E]'}`}>
                  {effectiveGap > 150 ? 'Cách điểm đón: > 150m' : `Cách điểm đón: ~${effectiveGap}m`}
                </div>
              </div>

              {/* 4 Tùy Chọn Sự Cố Chạm 1 Lần */}
              <div className="mt-3 space-y-2">
                {ISSUE_OPTIONS.map((opt) => {
                  const isSelected = selectedIssue === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedIssue(opt.id)}
                      data-testid={`support-issue-${opt.id}`}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-[#13693E] bg-[#F4FBF7] shadow-xs ring-1 ring-[#13693E]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <p className={`text-xs font-bold ${isSelected ? 'text-[#13693E]' : 'text-slate-900'}`}>{opt.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Cảnh báo đỏ nhạt khi chọn wrong_vehicle */}
              {selectedIssue === 'wrong_vehicle' && (
                <div className="mt-2.5 rounded-xl bg-rose-50 border border-rose-200/80 p-2.5 text-xs text-rose-700 flex items-start gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="min-w-0 flex-1 text-[11px] leading-tight">
                    <strong className="font-bold">Cảnh báo an toàn:</strong> Vui lòng giữ khoảng cách và <u>tuyệt đối không đọc mã OTP 4 số</u>. MotoSOS đang xác minh nhân sự ngay.
                  </div>
                </div>
              )}

              {/* Ô Ghi Chú Ngắn & Nút Gửi Yêu Cầu */}
              <div className="mt-3 space-y-2.5">
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập thêm chi tiết nếu cần (không bắt buộc)..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#13693E] focus:ring-1 focus:ring-[#13693E] outline-none"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  data-testid="submit-support-ticket-btn"
                  className="w-full py-3 rounded-xl bg-[#13693E] hover:bg-[#0F5C36] text-white font-extrabold text-[13px] transition-colors active:scale-[0.99] shadow-sm"
                >
                  Gửi yêu cầu xử lý ngay
                </button>
              </div>
            </div>

            {/* Thanh Liên Hệ Khẩn Cấp Ở Đáy */}
            <div className="px-4 py-3 border-t border-slate-100 grid grid-cols-2 gap-2 shrink-0 bg-white">
              <a
                href="tel:1900636812"
                data-testid="support-call-hotline"
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-700" />
                <span>Gọi tổng đài 24/7</span>
              </a>
              <button
                type="button"
                onClick={handleZalo}
                data-testid="support-share-zalo"
                className="bg-[#0068FF] hover:bg-[#0055d4] text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Gửi vị trí Zalo</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalBody, document.body);
}
