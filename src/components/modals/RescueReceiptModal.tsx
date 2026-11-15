import { Award, Check, CheckCircle2, Copy, ExternalLink, MapPin, Moon, Phone, RotateCcw, ShieldCheck, Star, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { RescueReceipt } from '../../types/rescue';
import { formatVnd } from '../../utils/pricingAndSimLogic';
import { buildReceiptPlainText } from '../../utils/rescueHistoryLogic';
import { MotoRescueBadgeIcon } from '../MotoRescueBadgeIcon';
import { TermsOfServiceModal } from '../TermsOfServiceModal';

interface RescueReceiptModalProps {
  receipt: RescueReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  onReorder: (receipt: RescueReceipt) => void;
  onViewOnMap: (receipt: RescueReceipt) => void;
}

export function RescueReceiptModal({ receipt, isOpen, onClose, onReorder, onViewOnMap }: RescueReceiptModalProps) {
  const [copied, setCopied] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  if (!isOpen || !receipt || typeof document === 'undefined') return null;

  const handleCopyReceipt = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(buildReceiptPlainText(receipt));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* Ignore clipboard error */ }
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="receipt-modal-title" className="fixed inset-0 z-[999] flex items-end justify-center pointer-events-auto">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/65 transition-opacity duration-300" aria-hidden="true" />
      <div className="relative w-full max-w-[430px] rounded-t-[32px] bg-white shadow-2xl transition-transform max-h-[90dvh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1"><div className="h-1 w-10 rounded-full bg-slate-300" aria-hidden="true" /></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              <span>ĐÃ HOÀN THÀNH</span>
            </span>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <span>Đơn hàng #{receipt.id}</span>
              {receipt.rescueOtp && <span className="rounded bg-emerald-50 px-1.5 py-0.2 font-sans text-[10.5px] font-bold text-emerald-700 border border-emerald-200">OTP #{receipt.rescueOtp}</span>}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng biên lai" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div>
            <h2 id="receipt-modal-title" className="text-xl font-extrabold text-slate-900">{receipt.serviceName}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{receipt.completedAt}</p>
          </div>

          {/* Mechanic info */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Thợ phụ trách cứu hộ</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{receipt.mechanicName}</p>
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /><span>{receipt.mechanicRating}</span>
                  </span>
                </div>
              </div>
              <a href={`tel:${receipt.mechanicPhone}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100">
                <Phone className="h-3.5 w-3.5 text-emerald-600" /><span>Gọi lại</span>
              </a>
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2">
              <span className="text-xs text-slate-500">Biển số phương tiện</span>
              <span className="rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-white tracking-wider">{receipt.mechanicPlate}</span>
            </div>
          </div>

          {/* Technical & Location details */}
          <div className="rounded-2xl border border-slate-100 bg-white p-3.5 space-y-2.5 shadow-2xs">
            <div>
              <p className="text-xs text-slate-400">Hạng mục đã xử lý</p>
              <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-slate-800">
                <MotoRescueBadgeIcon variant="dispatch" className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" /><span>{receipt.replacedParts}</span>
              </p>
            </div>
            <div className="border-t border-slate-100 pt-2">
              <p className="text-xs text-slate-400">Địa chỉ cứu hộ thực tế</p>
              <div className="mt-1 flex items-start justify-between gap-2">
                <p className="flex items-start gap-1.5 text-xs text-slate-700 min-w-0">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" /><span>{receipt.locationAddress}</span>
                </p>
                <button type="button" onClick={() => onViewOnMap(receipt)} className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700">
                  <span>Bản đồ</span><ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Transparent Cost Breakdown */}
          <div className="rounded-2xl border border-slate-100 bg-white p-3.5 space-y-2 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Bảng kê chi phí minh bạch</h4>
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between text-slate-600"><span>Giá dịch vụ trọn gói</span><span className="font-semibold text-slate-900">{formatVnd(receipt.originalPrice)}</span></div>
              {receipt.nightSurcharge && receipt.nightSurcharge > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span className="flex items-center gap-1"><Moon className="h-3 w-3 text-amber-600" /><span>Phụ phí đêm khuya (22h - 5h)</span></span>
                  <span className="font-semibold">+{formatVnd(receipt.nightSurcharge)}</span>
                </div>
              )}
              {receipt.extraCost && receipt.extraCost > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span className="flex items-center gap-1"><MotoRescueBadgeIcon variant="dispatch" className="h-3 w-3 text-amber-600" /><span>Phát sinh: {receipt.extraItemTitle || 'Linh kiện'}</span></span>
                  <span className="font-semibold">+{formatVnd(receipt.extraCost)}</span>
                </div>
              )}
              {receipt.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Ưu đãi áp dụng {receipt.promoCode ? `(${receipt.promoCode})` : ''}</span>
                  <span>-{formatVnd(receipt.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100"><span>Phương thức thanh toán</span><span className="font-medium text-slate-700">{receipt.paymentMethod}</span></div>
              <div className="flex items-baseline justify-between pt-2 border-t border-slate-200">
                <span className="text-sm font-bold text-slate-900">Tổng thanh toán</span>
                <span className="text-lg font-extrabold text-emerald-600">{formatVnd(receipt.finalPrice)}</span>
              </div>
            </div>
          </div>

          {/* 1. Con dấu Bảo hành điện tử 7 ngày */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-emerald-900">Bảo hành kỹ thuật điện tử 7 ngày</p>
              <p className="mt-0.5 text-[11px] text-emerald-800 leading-relaxed">
                Áp dụng miễn phí kiểm tra &amp; khắc phục lại tại 30+ Trạm An Toàn MotoSOS trên toàn TP.HCM (Hiệu lực 7 ngày kể từ lúc hoàn tất).
              </p>
            </div>
          </div>

          {/* 2. Huy hiệu Bảo hiểm cứu nạn 50 triệu */}
          <div className="rounded-2xl border border-amber-400/30 bg-[#090D16] p-3.5 text-white flex items-center gap-3 shadow-lg">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
              <Award className="h-5 w-5 text-amber-400" />
            </div>
            <p className="text-xs font-medium text-slate-200 leading-snug">
              Cuốc cứu hộ được bảo trợ bởi <strong className="font-bold text-amber-300">Gói Bảo Hiểm Trách Nhiệm Dân Sự 50.000.000đ</strong>
            </p>
          </div>

          {/* Dòng liên kết Điều khoản & Chính sách */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="text-[11px] font-semibold text-slate-400 hover:text-emerald-600 transition-colors inline-flex items-center gap-1 active:scale-95"
            >
              <span>Xem Điều khoản sử dụng &amp; Chính sách bảo hành</span>
              <span>&gt;</span>
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/80 rounded-b-[32px] flex items-center gap-2.5">
          <button type="button" onClick={handleCopyReceipt} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-98 transition-all">
            {copied ? (<><Check className="h-4 w-4 text-emerald-600" /><span className="text-emerald-700">Đã sao chép!</span></>) : (<><Copy className="h-4 w-4" /><span>Sao chép biên lai</span></>)}
          </button>
          <button type="button" onClick={() => onReorder(receipt)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 active:scale-98 transition-all">
            <RotateCcw className="h-4 w-4" /><span>Đặt lại dịch vụ này</span>
          </button>
        </div>

        <TermsOfServiceModal
          isOpen={isTermsOpen}
          onClose={() => setIsTermsOpen(false)}
        />
      </div>
    </div>,
    document.body
  );
}
