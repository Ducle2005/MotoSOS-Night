import { AlertTriangle, Sparkles } from 'lucide-react';
import type { DiagnosticServiceId, MechanicDiagnosis } from '../services/geminiMechanicService';

interface AiDiagnosisCardProps {
  diagnosis: MechanicDiagnosis;
  onSelectServiceAndOrder: (serviceId: DiagnosticServiceId) => void;
  onClose: () => void;
}

export function AiDiagnosisCard({
  diagnosis,
  onSelectServiceAndOrder,
  onClose,
}: AiDiagnosisCardProps) {
  const actionButtonText = diagnosis.recommendedServiceName.startsWith('Thợ')
    ? `Gọi ngay: ${diagnosis.recommendedServiceName}`
    : `Đặt thợ ${diagnosis.recommendedServiceName}`;

  return (
    <div className="max-w-[95%] bg-white rounded-2xl rounded-tl-sm p-3.5 border border-slate-200/75 shadow-[0_4px_18px_rgba(15,23,42,0.04)] space-y-3">
      {/* Lời giải thích tổng quan của AI */}
      <div className="flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-[13px] text-slate-800 leading-relaxed font-medium">
          {diagnosis.summary}
        </p>
      </div>

      {/* Khối Nguyên nhân kèm Thanh Tiến Trình % */}
      <div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Nguyên nhân dự đoán:
        </p>
        <div className="mt-1.5 space-y-2">
          {diagnosis.probableCauses.map((c) => {
            const pct = c.probability.includes('%') ? c.probability : `${c.probability}%`;
            return (
              <div key={c.name} className="space-y-1">
                <div className="flex items-start justify-between gap-2 text-xs">
                  <span className="font-medium text-slate-800 text-[12px] leading-snug flex-1">
                    {c.name}
                  </span>
                  <span className="font-bold text-emerald-600 text-[11.5px] tabular-nums shrink-0">
                    {pct}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: pct }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Khối Tự kiểm tra tại chỗ */}
      <div className="bg-slate-50/90 rounded-xl p-2.5 space-y-1.5 border border-slate-100">
        <p className="text-[11px] font-bold text-slate-600">Các bước tự kiểm tra tại chỗ:</p>
        <ul className="space-y-1.5">
          {diagnosis.quickChecks.map((chk, i) => (
            <li key={i} className="flex items-start gap-2 text-[11.5px] text-slate-700 leading-snug">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{chk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Khung Cảnh báo an toàn màu hổ phách */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 text-[11.5px] text-amber-900 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <p className="leading-snug">{diagnosis.safetyWarning}</p>
      </div>

      {/* Nút Đặt thợ 1-chạm ở đáy thẻ */}
      <button
        type="button"
        onClick={() => {
          onSelectServiceAndOrder(diagnosis.recommendedServiceId);
          onClose();
        }}
        className="w-full bg-[#090D16] hover:bg-slate-900 text-white font-bold text-[12.5px] py-3 px-3.5 rounded-xl flex items-center justify-between shadow-md active:scale-[0.98] transition-transform"
      >
        <span className="truncate">{actionButtonText}</span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <span className="text-emerald-400 font-extrabold tabular-nums">{diagnosis.estimatedPrice}</span>
          <span className="text-slate-400 text-sm font-bold">›</span>
        </div>
      </button>
    </div>
  );
}
