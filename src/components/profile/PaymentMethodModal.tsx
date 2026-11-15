import { Banknote, Check, QrCode, Smartphone, Wallet, X } from 'lucide-react';
import { useState } from 'react';
import type { UserProfileData } from '../../types/profile';

interface PaymentMethodModalProps {
  isOpen: boolean;
  currentPayment: UserProfileData['defaultPayment'];
  onSelectPayment: (method: UserProfileData['defaultPayment']) => void;
  onClose: () => void;
}

const PAYMENT_OPTIONS = [
  {
    id: 'momo' as const,
    name: 'Ví MoMo',
    subtitle: 'Tự động trừ tiền sau khi cứu hộ hoàn tất',
    icon: Smartphone,
    iconColor: 'bg-pink-50 text-pink-600',
    badge: 'Khuyên dùng',
  },
  {
    id: 'zalopay' as const,
    name: 'Ví ZaloPay',
    subtitle: 'Thanh toán 1 chạm qua ứng dụng Zalo',
    icon: Wallet,
    iconColor: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'bank_qr' as const,
    name: 'Chuyển khoản VietQR',
    subtitle: 'Quét mã VietQR thanh toán tới tài khoản thợ',
    icon: QrCode,
    iconColor: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'cash' as const,
    name: 'Tiền mặt',
    subtitle: 'Thanh toán trực tiếp cho thợ cứu hộ tại hiện trường',
    icon: Banknote,
    iconColor: 'bg-amber-50 text-amber-600',
  },
];

export function PaymentMethodModal({
  isOpen,
  currentPayment = 'momo',
  onSelectPayment,
  onClose,
}: PaymentMethodModalProps) {
  const [selected, setSelected] = useState(currentPayment);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectPayment(selected);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chọn phương thức thanh toán"
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4"
    >
      <div className="w-full max-w-[430px] rounded-t-[28px] border-t border-slate-100 bg-white p-5 shadow-2xl sm:rounded-[28px] sm:border">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Phương thức thanh toán</h2>
            <p className="text-xs text-slate-500">Chọn hình thức chi trả mặc định khi đặt cứu hộ</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {PAYMENT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${opt.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900">{opt.name}</p>
                      {opt.badge && (
                        <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[9.5px] font-bold text-pink-700">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{opt.subtitle}</p>
                  </div>
                </div>
                {isSelected && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-700 active:scale-[0.98]"
          >
            Xác nhận phương thức
          </button>
        </div>
      </div>
    </div>
  );
}
