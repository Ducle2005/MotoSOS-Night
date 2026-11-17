import { Check, Crown, Lock, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface MemberBenefitModalProps {
  isOpen: boolean;
  type?: 'membership' | 'tier';
  onClose: () => void;
}

type TierId = 'silver' | 'gold' | 'platinum' | 'diamond';

interface TierDetail {
  id: TierId; name: string; shortName: string; pointsRange: string;
  discountLabel: string; perks: string; statusText: string;
  isCurrent?: boolean; isUnlocked?: boolean;
}

const TIERS_DATA: Record<TierId, TierDetail> = {
  silver: {
    id: 'silver', name: 'Hạng Bạc', shortName: 'Bạc', pointsRange: '0 – 99 điểm',
    discountLabel: 'Giảm 10.000đ/chuyến',
    perks: 'Hỗ trợ kết nối đội ngũ kỹ thuật viên cứu hộ 24/7 trên toàn TP.HCM.',
    statusText: 'Đã hoàn thành', isUnlocked: true,
  },
  gold: {
    id: 'gold', name: 'Hạng Vàng', shortName: 'Vàng', pointsRange: '100 – 249 điểm',
    discountLabel: 'Giảm 15.000đ/chuyến',
    perks: 'Ưu tiên điều phối thợ ban ngày & Kiểm tra xe tổng quát miễn phí tại hiện trường.',
    statusText: 'Đã hoàn thành', isUnlocked: true,
  },
  platinum: {
    id: 'platinum', name: 'Hạng Bạch Kim', shortName: 'Bạch Kim', pointsRange: '250 – 499 điểm',
    discountLabel: 'Giảm 25.000đ/chuyến',
    perks: 'Ưu tiên điều phối thợ nhanh & Miễn phí hủy trong 5 phút đầu.',
    statusText: 'Hạng hiện tại • 320 điểm', isCurrent: true, isUnlocked: true,
  },
  diamond: {
    id: 'diamond', name: 'Hạng Kim Cương', shortName: 'Kim Cương', pointsRange: '500+ điểm',
    discountLabel: 'Giảm 35.000đ/chuyến',
    perks: 'Cứu hộ khẩn cấp hỏa tốc < 12 phút & Đường dây nóng Tổng đài VIP riêng biệt.',
    statusText: 'Cần thêm 180 điểm', isUnlocked: false,
  },
};

export function MemberBenefitModal({ isOpen, type = 'tier', onClose }: MemberBenefitModalProps) {
  const [selectedTierId, setSelectedTierId] = useState<TierId>('platinum');

  if (!isOpen || typeof document === 'undefined') return null;

  const activeTier = TIERS_DATA[selectedTierId];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hạng thành viên"
      className="fixed inset-0 z-[999] flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] max-h-[88vh] bg-white rounded-t-[24px] sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Thanh nắm kéo mảnh căn giữa ở đỉnh */}
        <div className="w-9 h-1 rounded-full bg-slate-200 mx-auto mt-2.5 mb-1 shrink-0" />

        {/* 1. Hàng tiêu đề */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-[18px] font-extrabold text-slate-950 tracking-tight">Hạng thành viên</h2>
            <p className="text-[11.5px] text-slate-500">Tích lũy 320 điểm sau các lần cứu hộ</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Thân Modal cuộn 60fps */}
        <div className="flex-1 overflow-y-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* 2. Thẻ Thành Viên Digital Bạch Kim Sang Trọng */}
          <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-br from-[#16222A] via-[#1E293B] to-[#0F3D28] text-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.18)] border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="bg-white/12 border border-white/15 px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-200 flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                <span>Hạng Bạch Kim</span>
              </span>
              <span className="text-[10.5px] font-semibold tracking-wider uppercase text-white/60">
                MotoSOS Rewards
              </span>
            </div>

            <div className="mt-3.5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-[26px] font-extrabold tracking-tight text-white">320</span>
                <span className="text-[12.5px] font-medium text-white/70">/ 500 điểm</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-300">
                Còn 180 điểm lên Kim Cương
              </span>
            </div>

            {/* Thanh tiến trình mảnh mượt */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-400 transition-all duration-500"
                style={{ width: '64%' }}
              />
            </div>

            {/* Dòng quyền lợi tóm tắt dưới đáy thẻ */}
            <div className="mt-3 pt-2.5 border-t border-white/10 text-[11.5px] text-white/85 flex items-center justify-between">
              <span>Ưu đãi hiện tại: Giảm 25.000đ/chuyến</span>
              <span className="font-bold text-amber-200">Kim Cương: Giảm 35.000đ</span>
            </div>
          </div>

          {/* 3. Thanh Lộ Trình 4 Hạng Tương Tác Chuẩn Grab */}
          <div className="mx-4 mt-3.5 grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100/90">
            {(['silver', 'gold', 'platinum', 'diamond'] as const).map((tierKey) => {
              const tier = TIERS_DATA[tierKey];
              const isSelected = selectedTierId === tierKey;
              return (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => setSelectedTierId(tierKey)}
                  className={`py-2 rounded-xl text-[11.5px] transition-all flex items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-white text-slate-950 font-extrabold shadow-xs'
                      : 'text-slate-600 font-semibold hover:bg-slate-200/60'
                  }`}
                >
                  {tierKey === 'silver' || tierKey === 'gold' ? (
                    <Check className="h-3.5 w-3.5 text-[#13693E]" />
                  ) : tierKey === 'platinum' ? (
                    <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  ) : (
                    <Lock className="h-3 w-3 text-slate-400" />
                  )}
                  <span>{tier.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Bảng Chi Tiết Hạng Đang Chọn trên nền trắng phẳng */}
          <div className="mx-4 mt-3 rounded-2xl border border-slate-100 bg-[#F9FBFA] p-3.5 divide-y divide-slate-200/60 text-xs">
            {/* 1. Mốc điểm yêu cầu */}
            <div className="pb-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Điểm yêu cầu:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900">{activeTier.pointsRange}</span>
                {activeTier.isCurrent ? (
                  <span className="bg-[#E6F4EC] text-[#13693E] font-bold text-[10.5px] px-2 py-0.5 rounded-full border border-[#13693E]/20">
                    {activeTier.statusText}
                  </span>
                ) : activeTier.isUnlocked ? (
                  <span className="bg-slate-200/70 text-slate-700 font-semibold text-[10px] px-2 py-0.5 rounded-full">
                    Đã đạt
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-200/80">
                    {activeTier.statusText}
                  </span>
                )}
              </div>
            </div>

            {/* 2. Ưu đãi cứu hộ */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Ưu đãi cứu hộ:</span>
              <span className="font-extrabold text-[#13693E] text-[12.5px]">{activeTier.discountLabel}</span>
            </div>

            {/* 3. Đặc quyền đi kèm */}
            <div className="pt-2.5">
              <span className="text-slate-500 font-medium block mb-1">Đặc quyền đi kèm:</span>
              <p className="text-slate-700 font-semibold leading-relaxed">{activeTier.perks}</p>
            </div>
          </div>
        </div>

        {/* 4. Chân Trang Trắng & Nút Hành Động Xanh Ngọc */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#13693E] hover:bg-[#0F5C36] text-white font-extrabold text-[13.5px] transition-colors active:scale-[0.99]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
