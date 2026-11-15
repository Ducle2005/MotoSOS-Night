import { Award, CheckCircle2, Lock, ShieldCheck, Wrench, X } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsOfServiceModal({ isOpen, onClose }: TermsOfServiceModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      className="fixed inset-0 z-[125] flex items-end justify-center pointer-events-auto animate-step-enter"
    >
      {/* Dark backdrop without backdrop-blur for 60fps WebGL canvas */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 transition-opacity"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[430px] rounded-t-[28px] bg-white overflow-hidden shadow-2xl transition-all">
        {/* Obsidian Dark Header */}
        <div className="bg-[#090D16] px-5 pt-3.5 pb-4 text-white border-b border-white/10">
          <div className="flex justify-center -mt-1 pb-2.5">
            <div className="h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-400 mb-1.5">
                <ShieldCheck className="h-3 w-3" />
                <span>MotoSOS Legal • Cập nhật 2026</span>
              </div>
              <h2 id="terms-modal-title" className="text-base font-extrabold text-white tracking-tight">
                Điều khoản &amp; Chính sách bảo mật
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng điều khoản"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Terms Content */}
        <div className="max-h-[62vh] overflow-y-auto px-5 py-3.5 space-y-3 text-xs [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Điều 1 */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>1. Quy trình cứu hộ &amp; Xác thực OTP 4 số</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Khách hàng và kỹ thuật viên cứu hộ phải đối soát trực tiếp mã PIN OTP 4 số ngẫu nhiên trước khi thợ tiếp cận hoặc can thiệp vào xe. Tuyệt đối không giao chìa khóa cho người không đọc đúng mã OTP để chống thợ giả danh và bảo vệ an toàn phương tiện.
            </p>
          </div>

          {/* Điều 2 */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-700 font-bold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>2. Minh bạch giá &amp; Chính sách hủy chuyến</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Giá dịch vụ niêm yết cố định trọn gói. Phụ phí đêm khuya (+20.000đ áp dụng từ 22h – 05h). Mọi đề xuất phát sinh linh kiện phải được khách duyệt tại chỗ trước khi thực hiện. Khách được hủy miễn phí trong 3 phút đầu; sau 3 phút thợ di chuyển áp dụng phí xăng 30.000đ.
            </p>
          </div>

          {/* Điều 3 */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-700 font-bold">
              <Award className="h-4 w-4 shrink-0" />
              <span>3. Bảo hành điện tử 7 ngày &amp; Bảo hiểm 50.000.000đ</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Linh kiện và kỹ thuật cứu hộ được bảo hành điện tử 7 ngày tại 30+ Trạm An Toàn MotoSOS khắp TP.HCM. Mỗi ca cứu hộ hợp lệ được bảo trợ bởi gói Bảo hiểm Trách nhiệm Dân sự lên đến 50.000.000đ bảo vệ tối đa quyền lợi chủ xe.
            </p>
          </div>

          {/* Điều 4 */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-700 font-bold">
              <Lock className="h-4 w-4 shrink-0" />
              <span>4. Bảo mật dữ liệu cá nhân &amp; Quyền riêng tư</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Thông tin cá nhân, số điện thoại và nhật ký cứu hộ được mã hóa cục bộ an toàn (chuẩn MS_SEC_V1). Tọa độ định vị GPS chỉ được chia sẻ tức thời khi khách hàng chủ động bấm lệnh gọi thợ hoặc kích hoạt SOS khẩn cấp.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#090D16] text-emerald-400 font-bold text-sm tracking-wide shadow-lg shadow-slate-900/10 hover:bg-slate-900 active:scale-[0.98] transition-all border border-emerald-500/30 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Đã hiểu &amp; Đồng ý</span>
          </button>
        </div>
      </div>
    </div>
  );
}
