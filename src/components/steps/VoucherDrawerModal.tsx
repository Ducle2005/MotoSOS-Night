import { ShieldAlert, Ticket, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { PickupMode, VoucherId, VoucherOption } from '../../types/rescue';
import { formatVnd, isVoucherEligible } from '../../utils/pricingAndSimLogic';

interface VoucherDrawerModalProps {
  isOpen: boolean;
  vouchers: VoucherOption[];
  selectedVoucherId: VoucherId | null;
  pickupMode: PickupMode;
  onApplyVoucher: (voucherId: VoucherId | null) => void;
  onClose: () => void;
}

export function VoucherDrawerModal({
  isOpen,
  vouchers,
  selectedVoucherId,
  pickupMode,
  onApplyVoucher,
  onClose,
}: VoucherDrawerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Chọn mã ưu đãi MotoSOS"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 flex max-h-[82%] flex-col rounded-t-3xl bg-[#F8FAFC] shadow-2xl"
          >
            <div className="flex shrink-0 justify-center pt-2.5 pb-1" aria-hidden="true">
              <div className="h-1 w-10 rounded-full bg-slate-300" />
            </div>

            <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-5 py-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Ưu đãi cứu hộ đêm
                </h2>
                <p className="text-xs text-slate-500">
                  Chọn 1 mã khuyến mãi để trừ trực tiếp vào hóa đơn
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng danh sách ưu đãi"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto px-5 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {vouchers.map((voucher) => {
                const eligible = isVoucherEligible(voucher, pickupMode);
                const isApplied = selectedVoucherId === voucher.id && eligible;

                return (
                  <div
                    key={voucher.id}
                    className={`rounded-2xl border p-3.5 transition-all ${
                      isApplied
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                        : eligible
                          ? 'border-slate-200 bg-white shadow-xs'
                          : 'border-slate-200/80 bg-slate-100/70 opacity-85'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isApplied
                              ? 'bg-emerald-500 text-white'
                              : eligible
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <Ticket className="h-4 w-4" aria-hidden="true" />
                        </span>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-sans text-xs font-extrabold tracking-wide text-emerald-700">
                              {voucher.code}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">
                              ·
                            </span>
                            <span className="font-sans text-xs font-bold tabular-nums text-slate-900">
                              {voucher.title}
                            </span>
                          </div>

                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {voucher.description}
                          </p>

                          {!eligible && (
                            <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                              <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span>Chọn Trạm An Toàn để dùng mã này</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!eligible}
                        onClick={() => {
                          onApplyVoucher(isApplied ? null : voucher.id);
                          onClose();
                        }}
                        className={`min-h-[38px] shrink-0 rounded-xl px-3.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap ${
                          isApplied
                            ? 'border border-emerald-500 bg-white text-emerald-700 hover:bg-emerald-50'
                            : eligible
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95'
                              : 'cursor-not-allowed bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isApplied ? 'Bỏ chọn' : 'Áp dụng'}
                      </button>
                    </div>
                  </div>
                );
              })}

              <p className="pt-1 text-center text-[11px] text-slate-400">
                Mức giảm tối đa theo giá trị gói dịch vụ đã chọn ({formatVnd(25000)})
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
