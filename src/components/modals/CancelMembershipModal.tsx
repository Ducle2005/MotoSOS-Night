import { AlertCircle, Calendar, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '../../context/NotificationContext';
import { getMembershipPlan, type MembershipCardPlan, type PurchasedMembership } from '../../data/membershipCatalog';
import { cancelSubscriptionAutoRenew, formatDateVi, getDaysRemaining, type MembershipSubscription } from '../../utils/membershipLifecycle';

const CANCEL_REASONS = [
  'Ít di chuyển ban đêm',
  'Chuyển sang phương tiện khác / xe điện',
  'Tạm dừng sử dụng một thời gian',
  'Chi phí chưa phù hợp với nhu cầu',
  'Lý do khác',
];

interface Props {
  isOpen: boolean;
  plan: MembershipCardPlan;
  record: PurchasedMembership;
  sub: MembershipSubscription;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelMembershipModal({ isOpen, plan, record, sub, onClose, onSuccess }: Props) {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { triggerNotification } = useNotifications();

  if (!isOpen || typeof document === 'undefined') return null;

  const daysLeft = getDaysRemaining(sub.expiresAt);
  const expiryDateFormatted = formatDateVi(sub.expiresAt);

  const handleConfirmCancel = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      cancelSubscriptionAutoRenew(selectedReason);
      try {
        triggerNotification({
          title: 'Đã hủy gia hạn tự động',
          message: `Gói ${plan.name} vẫn giữ 100% quyền lợi đến hết ${expiryDateFormatted} (${daysLeft} ngày).`,
          type: 'safety',
          targetTab: 'profile',
        });
      } catch {}
      setIsSubmitting(false);
      onSuccess();
      onClose();
    }, 350);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hủy gia hạn gói hội viên"
      className="fixed inset-0 z-[1000] bg-slate-950/60 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-white rounded-t-[26px] sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        {/* Header Chuẩn Grab */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-950 tracking-tight">Hủy gia hạn gói</h3>
            <p className="text-[11px] text-slate-500 font-medium">Quyền lợi vẫn được bảo lưu 100%</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 overflow-y-auto max-h-[75vh]">
          {/* Card Cam Kết Giữ Quyền Lợi */}
          <div className="p-3.5 rounded-2xl bg-[#F4F8F6] border border-emerald-600/20 flex items-start gap-3">
            <span className="p-2 rounded-xl bg-emerald-100 text-[#13693E] shrink-0 mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="text-[13px] font-extrabold text-slate-950">Quyền lợi được bảo lưu đến hết 30 ngày</h4>
              <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed">
                Bạn vẫn được hưởng trọn vẹn đặc quyền gói <strong className="text-[#13693E] font-bold">{plan.name}</strong> đến ngày{' '}
                <strong className="text-slate-900 font-bold">{expiryDateFormatted}</strong> (còn {daysLeft} ngày).
              </p>
            </div>
          </div>

          {/* Danh Sách Quyền Lợi Vẫn Dùng Được */}
          <div className="p-3 rounded-xl border border-slate-200/80 bg-white space-y-2">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">ĐẶC QUYỀN VẪN ĐƯỢC DUY TRÌ:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#13693E] shrink-0" />
                <span className="text-[11px] font-bold text-slate-800 truncate">Giảm {plan.discountPercent}% cứu hộ</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#13693E] shrink-0" />
                <span className="text-[11px] font-bold text-slate-800 truncate">Còn {record.remainingQuota} lượt ưu tiên</span>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-500 italic pt-1">
              * MotoSOS cam kết tuyệt đối không tự động trừ tiền sau ngày {expiryDateFormatted}.
            </p>
          </div>

          {/* Khảo sát lý do hủy ngắn gọn */}
          <div>
            <p className="text-[11px] font-bold text-slate-600 mb-2">Xin cho biết lý do bạn dừng gia hạn:</p>
            <div className="space-y-1.5">
              {CANCEL_REASONS.map((r) => {
                const isSelected = selectedReason === r;
                return (
                  <div
                    key={r}
                    onClick={() => setSelectedReason(r)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                      isSelected ? 'border-[#13693E] bg-[#F4FBF7] text-[#13693E]' : 'border-slate-200/80 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{r}</span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#13693E]' : 'border-slate-300'}`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#13693E]" />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2 Nút Hành Động Ở Chân Trang */}
        <div className="p-4 border-t border-slate-100 bg-white flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#13693E] hover:bg-[#0F5C36] text-white font-extrabold text-xs shadow-xs active:scale-[0.99] transition-all"
          >
            Giữ gói hội viên
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmCancel}
            className="w-full py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs transition-colors active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? 'Đang cập nhật...' : 'Xác nhận hủy gia hạn'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
export default CancelMembershipModal;
