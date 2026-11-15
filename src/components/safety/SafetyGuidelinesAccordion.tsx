import { ChevronDown, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export function SafetyGuidelinesAccordion() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mx-4 mt-5 mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50/50"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="text-xs font-bold text-slate-900">
            Quy tắc xác minh thợ &amp; An toàn ban đêm
          </h3>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="space-y-3 border-t border-slate-100 p-4 pt-3 text-xs">
          {/* Card 1: 3-step mechanic verification */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
            <p className="font-bold text-emerald-800">
              1. Xác minh 3 bước trước khi giao xe:
            </p>
            <ul className="mt-1.5 space-y-1 text-slate-600 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Kiểm tra ảnh đại diện và tên thợ trùng khớp trên ứng dụng.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Đối chiếu đúng biển số xe cứu hộ hiển thị trên đơn đặt.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Xác nhận đúng mức giá niêm yết cố định hiển thị trên hóa đơn app.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Night safety rules */}
          <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3">
            <p className="font-bold text-amber-800">
              2. Nguyên tắc dắt xe an toàn ban đêm:
            </p>
            <ul className="mt-1.5 space-y-1 text-slate-600 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>Luôn bật đèn xi-nhan cảnh báo, dắt xe sát lề phải.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>Ưu tiên di chuyển vào vùng có camera, bảo vệ và đèn sáng (Trạm An Toàn 24/7).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>Tuyệt đối không trả thêm phụ phí phát sinh ngoài hóa đơn hiển thị.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
