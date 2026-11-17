import { Check, Crown, Lock, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface MemberBenefitModalProps {
  isOpen: boolean; type?: 'membership' | 'tier'; onClose: () => void;
}

export type TierId = 'silver' | 'gold' | 'platinum' | 'diamond';

export interface VipTierConfig {
  id: TierId; name: string; shortName: string; pointsRange: string;
  discountLabel: string; perks: string; cardStyle: string; badgeStyle: string;
  progressTrack: string; progressBar: string; progressHeight: string;
  subtextColor: string; pointsDisplay: string; targetText: string;
  bottomText: string; progressPercent: number;
}

export const VIP_TIER_STYLES: Record<TierId, VipTierConfig> = {
  silver: {
    id: 'silver', name: 'Hạng Bạc', shortName: 'Bạc', pointsRange: '0 – 99 điểm',
    discountLabel: 'Giảm 10.000đ/chuyến', perks: 'Hỗ trợ kết nối đội ngũ kỹ thuật viên cứu hộ 24/7 trên toàn TP.HCM.',
    cardStyle: 'bg-gradient-to-br from-slate-100 via-white to-slate-200/90 text-slate-900 border border-slate-300/80 shadow-xs',
    badgeStyle: 'bg-slate-200/80 text-slate-800 border border-slate-300/60',
    progressTrack: 'bg-slate-300', progressBar: 'bg-[#13693E]', progressHeight: 'h-1.5',
    subtextColor: 'text-slate-500', pointsDisplay: '320 / 99 điểm', targetText: 'Đã hoàn thành hạng Bạc',
    bottomText: 'Ưu đãi: Giảm 10.000đ/chuyến • Hỗ trợ 24/7', progressPercent: 100,
  },
  gold: {
    id: 'gold', name: 'Hạng Vàng', shortName: 'Vàng', pointsRange: '100 – 249 điểm',
    discountLabel: 'Giảm 15.000đ/chuyến', perks: 'Ưu tiên điều phối thợ ban ngày & Kiểm tra xe tổng quát miễn phí tại hiện trường.',
    cardStyle: 'bg-gradient-to-br from-[#FDF8EC] via-[#FAF0D7] to-[#F2DFB3] text-amber-950 border border-amber-300/80 shadow-sm',
    badgeStyle: 'bg-amber-200/70 text-amber-950 border border-amber-300/60',
    progressTrack: 'bg-amber-950/15', progressBar: 'bg-amber-600', progressHeight: 'h-1.5',
    subtextColor: 'text-amber-900/75', pointsDisplay: '320 / 249 điểm', targetText: 'Đã hoàn thành hạng Vàng',
    bottomText: 'Ưu đãi: Giảm 15.000đ/chuyến • Khám xe miễn phí', progressPercent: 100,
  },
  platinum: {
    id: 'platinum', name: 'Hạng Bạch Kim', shortName: 'Bạch Kim', pointsRange: '250 – 499 điểm',
    discountLabel: 'Giảm 25.000đ/chuyến', perks: 'Ưu tiên điều phối thợ nhanh & Miễn phí hủy trong 5 phút đầu.',
    cardStyle: 'bg-gradient-to-br from-[#18222F] via-[#1E293B] to-[#0F2E22] text-white border border-white/15 shadow-[0_12px_28px_rgba(15,23,42,0.18)]',
    badgeStyle: 'bg-white/10 text-amber-200 border border-white/15',
    progressTrack: 'bg-white/15', progressBar: 'bg-gradient-to-r from-amber-200 to-emerald-400', progressHeight: 'h-1.5',
    subtextColor: 'text-white/70', pointsDisplay: '320 / 500 điểm', targetText: 'Còn 180 điểm lên Kim Cương',
    bottomText: 'Ưu đãi hiện tại: Giảm 25.000đ/chuyến • Miễn phí hủy 5p', progressPercent: 64,
  },
  diamond: {
    id: 'diamond', name: 'Hạng Kim Cương', shortName: 'Kim Cương', pointsRange: '500+ điểm',
    discountLabel: 'Giảm 35.000đ/chuyến', perks: 'Cứu hộ khẩn cấp hỏa tốc < 12 phút & Đường dây nóng Tổng đài VIP riêng biệt.',
    cardStyle: 'bg-gradient-to-br from-[#07090C] via-[#11141B] to-[#090B10] text-white border border-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.28)]',
    badgeStyle: 'bg-white/10 text-sky-200 border border-sky-200/25',
    progressTrack: 'bg-white/15', progressBar: 'bg-gradient-to-r from-sky-200 via-white to-sky-300', progressHeight: 'h-1',
    subtextColor: 'text-white/70', pointsDisplay: '320 / 500 điểm', targetText: 'Cần thêm 180 điểm',
    bottomText: 'Giảm 35.000đ mọi chuyến • Ưu tiên điều thợ số 1', progressPercent: 64,
  },
};

export function MemberBenefitModal({ isOpen, onClose }: MemberBenefitModalProps) {
  const [selectedTierId, setSelectedTierId] = useState<TierId>('platinum');

  if (!isOpen || typeof document === 'undefined') return null;

  const activeTier = VIP_TIER_STYLES[selectedTierId];
  const isCurrentTier = selectedTierId === 'platinum';

  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label="Hạng thành viên"
      className="fixed inset-0 z-[999] flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] max-h-[90vh] bg-white rounded-t-[28px] sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="w-9 h-1 rounded-full bg-slate-200 mx-auto mt-2.5 mb-1 shrink-0" />

        {/* 1. Tiêu đề Trắng Tinh Gọn */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-[18px] font-extrabold text-slate-950 tracking-tight">Hạng thành viên</h2>
            <p className="text-[11.5px] text-slate-500">Tích lũy 320 điểm sau các lần cứu hộ</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Thân Modal cuộn 60fps - Cân chỉnh không bị cắt chữ */}
        <div className="flex-1 overflow-y-auto px-0 pt-1 pb-4 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* 2. Banner Biến Đổi Tự Động Theo Hạng VIP */}
          <div className={`mx-4 mt-2.5 rounded-2xl p-4 relative overflow-hidden transition-all duration-300 ${activeTier.cardStyle}`}>
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${activeTier.badgeStyle}`}>
                {selectedTierId === 'silver' ? <ShieldCheck className="h-3.5 w-3.5" /> : selectedTierId === 'gold' ? <Sparkles className="h-3.5 w-3.5 text-amber-600" /> : selectedTierId === 'platinum' ? <Crown className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> : <Sparkles className="h-3.5 w-3.5 text-sky-200" />}
                <span>{activeTier.name}</span>
              </span>

              {/* Pill trạng thái Hạng hiện tại / Xem trước đặc quyền */}
              {selectedTierId === 'diamond' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-sky-200 border border-white/10">
                  Xem trước đặc quyền
                </span>
              ) : (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isCurrentTier ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : selectedTierId === 'silver' ? 'bg-slate-200/90 text-slate-700' : 'bg-amber-950/15 text-amber-900 border border-amber-900/20'}`}>
                  {isCurrentTier ? 'Hạng hiện tại' : 'Xem trước đặc quyền'}
                </span>
              )}
            </div>

            <div className="mt-3.5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-[26px] font-bold tracking-tight text-current">{activeTier.pointsDisplay.split(' ')[0]}</span>
                <span className={`text-[12px] font-medium ${activeTier.subtextColor}`}>{activeTier.pointsDisplay.substring(activeTier.pointsDisplay.indexOf(' '))}</span>
              </div>
              <span className={`text-[11px] font-semibold ${selectedTierId === 'platinum' ? 'text-emerald-300' : activeTier.subtextColor}`}>
                {activeTier.targetText}
              </span>
            </div>

            {/* Thanh tiến trình */}
            <div className={`mt-2 w-full rounded-full overflow-hidden ${activeTier.progressHeight} ${activeTier.progressTrack}`}>
              <div className={`h-full rounded-full transition-all duration-500 ${activeTier.progressBar}`} style={{ width: `${activeTier.progressPercent}%` }} />
            </div>

            {/* Dòng quyền lợi đáy banner */}
            <div className={`mt-3 pt-2.5 border-t text-[11.5px] ${selectedTierId === 'diamond' ? 'border-white/10 text-sky-100 flex items-center justify-center font-medium' : selectedTierId === 'silver' ? 'border-slate-200 text-slate-700 flex items-center justify-between' : selectedTierId === 'gold' ? 'border-amber-900/10 text-amber-950 flex items-center justify-between' : 'border-white/10 text-white/85 flex items-center justify-between'}`}>
              <span>{activeTier.bottomText}</span>
              {selectedTierId === 'platinum' && <span className="font-bold text-amber-200">Kim Cương: Giảm 35.000đ</span>}
            </div>
          </div>

          {/* 3. Thanh Lộ Trình 4 Hạng Tương Tác Chuẩn Grab */}
          <div className="mx-4 grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100/90">
            {(['silver', 'gold', 'platinum', 'diamond'] as const).map((tierKey) => {
              const tier = VIP_TIER_STYLES[tierKey];
              const isSelected = selectedTierId === tierKey;
              return (
                <button
                  key={tierKey} type="button" onClick={() => setSelectedTierId(tierKey)}
                  className={`py-2 rounded-xl text-[11.5px] transition-all flex items-center justify-center gap-1 ${isSelected ? 'bg-white text-slate-950 font-extrabold shadow-xs ring-1 ring-slate-950/5' : 'text-slate-600 font-semibold hover:bg-slate-200/60'}`}
                >
                  {tierKey === 'silver' || tierKey === 'gold' ? <Check className="h-3.5 w-3.5 text-[#13693E]" /> : tierKey === 'platinum' ? <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> : <Lock className="h-3 w-3 text-slate-400" />}
                  <span>{tier.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* 4. Bảng Chi Tiết Hạng Đang Chọn - Thoáng mắt không bị cắt */}
          <div className="mx-4 rounded-2xl border border-slate-100 bg-[#F9FBFA] p-3.5 divide-y divide-slate-200/60 text-xs">
            <div className="pb-2.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 font-medium shrink-0">Điểm yêu cầu:</span>
              <div className="flex items-center gap-1.5 text-right">
                <span className="font-extrabold text-slate-900">{activeTier.pointsRange}</span>
                {selectedTierId === 'platinum' ? (
                  <span className="bg-[#E6F4EC] text-[#13693E] font-bold text-[10.5px] px-2 py-0.5 rounded-full border border-[#13693E]/20 shrink-0">Hạng hiện tại • 320 điểm</span>
                ) : activeTier.progressPercent === 100 ? (
                  <span className="bg-slate-200/70 text-slate-700 font-semibold text-[10px] px-2 py-0.5 rounded-full shrink-0">Đã đạt</span>
                ) : (
                  <span className="bg-amber-50 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-200/80 shrink-0">Cần thêm 180 điểm</span>
                )}
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 font-medium">Ưu đãi cứu hộ:</span>
              <span className="font-extrabold text-[#13693E] text-[12.5px]">{activeTier.discountLabel}</span>
            </div>

            <div className="pt-2.5">
              <span className="text-slate-500 font-medium block mb-1">Đặc quyền đi kèm:</span>
              <p className="text-slate-700 font-semibold leading-relaxed">{activeTier.perks}</p>
            </div>
          </div>
        </div>

        {/* 5. Chân Trang Trắng & Nút Hành Động Xanh Ngọc */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <button type="button" onClick={onClose} className="w-full py-3 rounded-xl bg-[#13693E] hover:bg-[#0F5C36] text-white font-extrabold text-[13.5px] transition-colors active:scale-[0.99]">
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
