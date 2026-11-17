import { CreditCard, Loader2, QrCode, Smartphone, Wallet, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '../context/NotificationContext';
import { purchaseOrSwitchMembership, type MembershipCardPlan } from '../data/membershipCatalog';
import { loadUserProfile, saveUserProfile } from '../types/profile';
import { formatVnd } from '../utils/pricingAndSimLogic';

export type PaymentMethodId = 'momo' | 'zalopay' | 'vietqr' | 'card';

export interface PaymentOption {
  id: PaymentMethodId;
  name: string;
  subtitle: string;
  badgeBg: string;
  badgeTextColor: string;
  icon: typeof Wallet;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'momo', name: 'Ví MoMo', subtitle: 'Thanh toán tức thì • Miễn phí giao dịch', badgeBg: 'bg-[#A50064]/10', badgeTextColor: 'text-[#A50064]', icon: Smartphone },
  { id: 'zalopay', name: 'Ví ZaloPay', subtitle: 'Liên kết ví • Xác nhận 1 chạm', badgeBg: 'bg-[#0068FF]/10', badgeTextColor: 'text-[#0068FF]', icon: Wallet },
  { id: 'vietqr', name: 'Chuyển khoản VietQR 24/7', subtitle: 'MB Bank, Vietcombank, VIB • Tự động duyệt', badgeBg: 'bg-[#13693E]/10', badgeTextColor: 'text-[#13693E]', icon: QrCode },
  { id: 'card', name: 'Thẻ Quốc tế (Visa / Mastercard)', subtitle: 'Thanh toán bảo mật chuẩn PCI-DSS', badgeBg: 'bg-slate-800/10', badgeTextColor: 'text-slate-800', icon: CreditCard },
];

interface MembershipCheckoutModalProps {
  isOpen: boolean;
  card: MembershipCardPlan | null;
  onClose: () => void;
  onSuccess: (planId: string) => void;
}

export function MembershipCheckoutModal({ isOpen, card, onClose, onSuccess }: MembershipCheckoutModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const { triggerNotification } = useNotifications();

  if (!isOpen || !card || typeof document === 'undefined') return null;

  const handleConfirmPayment = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    setTimeout(() => {
      purchaseOrSwitchMembership(card.id);

      try {
        const profile = loadUserProfile();
        const map: Record<PaymentMethodId, 'momo' | 'zalopay' | 'bank_qr'> = {
          momo: 'momo', zalopay: 'zalopay', vietqr: 'bank_qr', card: 'bank_qr',
        };
        saveUserProfile({ ...profile, defaultPayment: map[selectedMethod] || 'momo' });
      } catch {}

      try {
        triggerNotification({
          title: 'Mua gói hội viên thành công!',
          message: `Đã kích hoạt ${card.name}. Bạn nhận ngay ưu đãi giảm ${card.discountPercent}% và ${card.monthlyQuota} lượt cứu hộ!`,
          type: 'promo',
          targetTab: 'profile',
        });
      } catch {}

      setIsProcessing(false);
      onSuccess(card.id);
      onClose();
    }, 600);
  };

  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label="Thanh toán gói hội viên"
      className="fixed inset-0 z-[1000] bg-slate-950/50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={isProcessing ? undefined : onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-white rounded-t-[24px] sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-200"
      >
        {/* Header Thanh Thoát */}
        <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-extrabold text-slate-950 tracking-tight">Thanh toán gói hội viên</h3>
            <p className="text-[11px] text-slate-500 font-medium">Kích hoạt tự động ngay sau khi xác nhận</p>
          </div>
          <button
            type="button" onClick={onClose} disabled={isProcessing} aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Thẻ Tóm Tắt Gói Đang Mua */}
        <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-[#F4F8F6] border border-emerald-600/15 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100/70 text-[#13693E] inline-block mb-1">
              {card.badgeText}
            </span>
            <h4 className="text-[15px] font-extrabold text-slate-950 truncate">{card.name}</h4>
            <p className="text-[11.5px] text-slate-600 truncate mt-0.5">
              Giảm {card.discountPercent}% • {card.monthlyQuota} lượt cứu hộ
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[16px] font-extrabold text-[#13693E]">{formatVnd(card.price)}</p>
            <p className="text-[11px] text-slate-500 font-medium">{card.billingCycle}</p>
          </div>
        </div>

        {/* Danh Sách Phương Thức Thanh Toán */}
        <div className="px-4 mt-3.5">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">PHƯƠNG THỨC THANH TOÁN</p>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((opt) => {
              const isSelected = selectedMethod === opt.id;
              const IconComp = opt.icon;
              return (
                <div
                  key={opt.id} onClick={() => !isProcessing && setSelectedMethod(opt.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected ? 'border-[#13693E] bg-[#F4FBF7] shadow-xs' : 'border-slate-200/90 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-8 h-8 rounded-lg ${opt.badgeBg} ${opt.badgeTextColor} flex items-center justify-center shrink-0`}>
                      <IconComp className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 leading-tight">{opt.name}</p>
                      <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">{opt.subtitle}</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'border-[#13693E] bg-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#13693E]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chân Trang & Nút Thanh Toán Xanh Ngọc */}
        <div className="p-4 mt-3 bg-white border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5 text-xs">
            <span className="text-slate-500 font-medium">Tổng thanh toán</span>
            <span className="text-[15px] font-extrabold text-slate-950">{formatVnd(card.price)}</span>
          </div>
          <button
            type="button" disabled={isProcessing} onClick={handleConfirmPayment}
            className="w-full py-3.5 rounded-xl bg-[#13693E] hover:bg-[#0F5C36] text-white font-extrabold text-[13.5px] flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-75 shadow-md shadow-emerald-900/10"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang xác nhận giao dịch...</span>
              </>
            ) : (
              <span>Thanh toán &amp; Kích hoạt ngay</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
