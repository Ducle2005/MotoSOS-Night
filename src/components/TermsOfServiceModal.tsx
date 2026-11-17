import { Award, CheckCircle2, Lock, ShieldCheck, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsOfServiceModal({ isOpen, onClose }: TermsOfServiceModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      data-testid="terms-of-service-modal"
      className="fixed inset-0 z-[999] bg-slate-950/45 flex items-end sm:items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] max-h-[86vh] bg-white rounded-t-[24px] sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* 1. Header Trắng Tinh Gọn */}
        <div className="w-9 h-1 rounded-full bg-slate-200 mx-auto mt-2.5 mb-1 shrink-0" aria-hidden="true" />

        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 id="terms-modal-title" className="text-[18px] font-extrabold text-slate-950 tracking-tight truncate">
              Điều khoản &amp; Bảo mật
            </h2>
            <span className="bg-[#E6F4EC] text-[#13693E] text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0">
              Cập nhật 2026
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng điều khoản"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Dải 3 Điểm Cốt Lõi Đọc Nhanh */}
        <div className="mx-4 mt-3 p-2.5 rounded-2xl bg-[#F4F8F6] border border-emerald-600/10 grid grid-cols-3 gap-1.5 text-center shrink-0">
          <div className="px-1">
            <p className="text-[12px] font-extrabold text-[#13693E]">OTP 4 số</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Chống thợ giả</p>
          </div>
          <div className="border-x border-emerald-600/10 px-1">
            <p className="text-[12px] font-extrabold text-[#13693E]">Miễn phí 3p</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Hủy chuyến đầu</p>
          </div>
          <div className="px-1">
            <p className="text-[12px] font-extrabold text-[#13693E]">50.000.000đ</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Bảo hiểm sự cố</p>
          </div>
        </div>

        {/* 3. Danh Sách 4 Điều Khoản Dạng Phẳng Chuẩn Grab */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 divide-y divide-slate-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Mục 1 */}
          <div className="py-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E6F4EC] text-[#13693E] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13.5px] font-bold text-slate-950 leading-snug">
                1. Quy trình cứu hộ &amp; Xác thực OTP 4 số
              </h3>
              <p className="text-[12.5px] text-slate-600 leading-[1.55] mt-1">
                Đối soát trực tiếp <strong className="font-semibold text-slate-900">mã PIN OTP 4 số</strong> trước khi giao xe. Tuyệt đối không giao chìa khóa nếu thợ không đọc đúng mã để chống giả danh.
              </p>
            </div>
          </div>

          {/* Mục 2 */}
          <div className="py-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E6F4EC] text-[#13693E] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13.5px] font-bold text-slate-950 leading-snug">
                2. Minh bạch giá &amp; Chính sách hủy chuyến
              </h3>
              <p className="text-[12.5px] text-slate-600 leading-[1.55] mt-1">
                Giá niêm yết trọn gói; phụ phí đêm khuya <strong className="font-semibold text-slate-900">+20.000đ</strong> (22h – 05h). <strong className="font-semibold text-slate-900">Hủy miễn phí trong 3 phút đầu</strong>; sau 3 phút khi thợ đã di chuyển áp dụng phí xăng <strong className="font-semibold text-slate-900">30.000đ</strong>.
              </p>
            </div>
          </div>

          {/* Mục 3 */}
          <div className="py-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E6F4EC] text-[#13693E] flex items-center justify-center shrink-0 mt-0.5">
              <Award className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13.5px] font-bold text-slate-950 leading-snug">
                3. Bảo hành điện tử 7 ngày &amp; Bảo hiểm 50.000.000đ
              </h3>
              <p className="text-[12.5px] text-slate-600 leading-[1.55] mt-1">
                Linh kiện và kỹ thuật được <strong className="font-semibold text-slate-900">bảo hành 7 ngày</strong> tại 30+ Trạm An Toàn TP.HCM, kèm gói <strong className="font-semibold text-slate-900">Bảo hiểm Trách nhiệm Dân sự 50.000.000đ</strong> cho mỗi ca hợp lệ.
              </p>
            </div>
          </div>

          {/* Mục 4 */}
          <div className="py-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E6F4EC] text-[#13693E] flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13.5px] font-bold text-slate-950 leading-snug">
                4. Bảo mật dữ liệu cá nhân &amp; Quyền riêng tư
              </h3>
              <p className="text-[12.5px] text-slate-600 leading-[1.55] mt-1">
                Thông tin cá nhân và nhật ký cứu hộ được <strong className="font-semibold text-slate-900">mã hóa cục bộ (MS_SEC_V1)</strong>. Tọa độ GPS chỉ chia sẻ tức thời khi bạn chủ động gọi thợ hoặc bật SOS.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Chân Trang Trắng & Nút Xác Nhận Xanh Ngọc Chuẩn Grab */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            data-testid="terms-agree-btn"
            className="w-full py-3 rounded-xl bg-[#13693E] hover:bg-[#0F5C36] text-white font-extrabold text-[13.5px] flex items-center justify-center gap-2 transition-colors active:scale-[0.99] shadow-sm"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Đã hiểu &amp; Đồng ý</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
