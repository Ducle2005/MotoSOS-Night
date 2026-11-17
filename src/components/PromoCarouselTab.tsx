import { Info, Sparkles, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { PROMO_PROGRAMS, type PromoProgram } from '../data/membershipCatalog';
import { useSmoothHorizontalWheel } from '../hooks/useSmoothHorizontalWheel';
import { formatVnd } from '../utils/pricingAndSimLogic';

interface PromoCarouselTabProps {
  onUsePromo?: (promoCode: string) => void;
  onClose: () => void;
}

type PromoFilter = 'all' | 'members' | 'vip';

const PROMO_CHIPS: Array<{ id: PromoFilter; label: string }> = [
  { id: 'all', label: 'Tất cả (6)' },
  { id: 'members', label: 'Mọi thành viên (4)' },
  { id: 'vip', label: 'Đặc quyền VIP (2)' },
];

export function PromoCarouselTab({ onUsePromo, onClose }: PromoCarouselTabProps) {
  const [filter, setFilter] = useState<PromoFilter>('all');
  const [currentIndex, setCurrentIndex] = useState(1);
  const [inspectingPromo, setInspectingPromo] = useState<PromoProgram | null>(null);

  const { containerRef, dragHandlers, isDragging, resetScroll } = useSmoothHorizontalWheel();

  const filteredPromos = PROMO_PROGRAMS.filter((p) => {
    if (filter === 'members') return p.eligibleTiers.includes('Tất cả');
    if (filter === 'vip') return !p.eligibleTiers.includes('Tất cả');
    return true;
  });

  const handleSelectFilter = (f: PromoFilter) => {
    setFilter(f);
    resetScroll();
    setCurrentIndex(1);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    dragHandlers.onScroll();
    const idx = Math.min(filteredPromos.length, Math.max(1, Math.round(e.currentTarget.scrollLeft / 284) + 1));
    setCurrentIndex(idx);
  };

  const handleApply = (code: string) => {
    if (onUsePromo) onUsePromo(code);
    onClose();
  };

  return (
    <div className="space-y-3">
      {/* 1. Dải chip lọc nhóm ưu đãi */}
      <div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phân loại ưu đãi:</p>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PROMO_CHIPS.map((chip) => (
            <button
              key={chip.id} type="button" onClick={() => handleSelectFilter(chip.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === chip.id ? 'bg-slate-950 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Dòng chỉ dẫn & bộ đếm động */}
      <div className="-mx-4">
        <div className="flex items-center justify-between text-[11.5px] font-medium mb-1.5 px-4">
          <span className="text-slate-500">Lăn chuột hoặc kéo ngang để xem</span>
          <span className="font-extrabold text-[#13693E]">{currentIndex} / {filteredPromos.length}</span>
        </div>

        {/* 3. Dải thẻ ưu đãi lướt ngang 120fps */}
        <div
          ref={containerRef} {...dragHandlers} onScroll={handleScroll}
          className={`flex items-stretch gap-3 overflow-x-auto scrollbar-none touch-pan-x select-none px-4 pb-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {filteredPromos.map((promo) => {
            const scopeDetail = promo.code === 'DEMKHUYA15' ? 'Khung giờ đêm 22:00 – 06:00 sáng'
              : promo.code === 'FREEDEM' ? 'Khung giờ đêm 22:00 – 05:00 sáng'
              : promo.code === 'ANTOAN20' ? 'Điểm đón tại Trạm 24/7 / Cây xăng'
              : 'Mọi dịch vụ cứu hộ xe máy 24/7';

            return (
              <div
                key={promo.code}
                className="w-[272px] shrink-0 rounded-2xl bg-white border border-slate-200/90 p-4 flex flex-col justify-between shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:border-emerald-600/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-[#E6F4EC] text-[#13693E] font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      {promo.code}
                    </span>
                    <span className="text-[15px] font-extrabold text-[#13693E]">
                      Giảm {formatVnd(promo.discountAmount)}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-[15px] font-extrabold text-slate-950 leading-snug">{promo.title}</h4>
                    <p className="text-[12px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{promo.condition}</p>
                  </div>

                  <ul className="my-3 py-3 border-y border-slate-100 space-y-2 text-[12px] text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#13693E] shrink-0 mt-1.5" />
                      <span className="leading-tight">Áp dụng: <strong>{promo.eligibleTiers}</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#13693E] shrink-0 mt-1.5" />
                      <span className="leading-tight">{scopeDetail}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#13693E] shrink-0 mt-1.5" />
                      <span className="leading-tight">Trừ trực tiếp vào hóa đơn khi đặt thợ</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button" onClick={() => setInspectingPromo(promo)}
                    className="text-[12px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <Info className="h-3.5 w-3.5" /><span>Điều kiện</span>
                  </button>
                  <button
                    type="button" onClick={() => handleApply(promo.code)}
                    className="px-4 py-2 rounded-full bg-[#13693E] hover:bg-[#0F5C36] text-white text-[12px] font-extrabold transition-colors active:scale-95 shadow-xs"
                  >
                    Dùng ngay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popover / Modal Con Xem Chi Tiết Điều Kiện Mã Ưu Đãi */}
      {inspectingPromo && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/65 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-4 shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#13693E]" />
                <h4 className="font-extrabold text-slate-900 text-sm">Điều kiện: {inspectingPromo.code}</h4>
              </div>
              <button type="button" onClick={() => setInspectingPromo(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <p>• <strong>Chương trình:</strong> {inspectingPromo.title}</p>
              <p>• <strong>Mức giảm:</strong> Giảm {formatVnd(inspectingPromo.discountAmount)} khấu trừ trực tiếp vào hóa đơn chuyến cứu hộ.</p>
              <p>• <strong>Đối tượng:</strong> {inspectingPromo.eligibleTiers}.</p>
              <p>• <strong>Quy định:</strong> {inspectingPromo.condition}.</p>
              <p className="text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/80">
                ★ <strong>Lưu ý:</strong> Mỗi ca cứu hộ áp dụng tối đa 01 mã ưu đãi. Tự động kiểm tra và giảm trừ trực tiếp ở Bước 1/3 và 3/3 trên Bản đồ.
              </p>
            </div>
            <button
              type="button" onClick={() => { handleApply(inspectingPromo.code); setInspectingPromo(null); }}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#13693E] hover:bg-[#0F5C36] text-white text-xs font-extrabold shadow-xs active:scale-95 transition-all"
            >
              Dùng mã này ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
