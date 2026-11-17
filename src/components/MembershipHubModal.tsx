import { Check, Crown, Info, ShieldCheck, Sparkles, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  MEMBERSHIP_GROUPS, MEMBERSHIP_PLANS, PROMO_PROGRAMS,
  getActiveMembershipId, getMembershipPlan, setActiveMembershipId,
  type MembershipCardPlan, type MembershipGroup,
} from '../data/membershipCatalog';
import { useSmoothHorizontalWheel } from '../hooks/useSmoothHorizontalWheel';
import { formatVnd } from '../utils/pricingAndSimLogic';

interface MembershipHubModalProps {
  isOpen: boolean; onClose: () => void; onUsePromo?: (promoCode: string) => void;
}

export function MembershipHubModal({ isOpen, onClose, onUsePromo }: MembershipHubModalProps) {
  const [activeTab, setActiveTab] = useState<'cards' | 'promos'>('cards');
  const [selectedGroup, setSelectedGroup] = useState<MembershipGroup>('vip');
  const [currentId, setCurrentId] = useState<string>(() => getActiveMembershipId());
  const [inspectingPlan, setInspectingPlan] = useState<MembershipCardPlan | null>(null);

  const { containerRef: groupScrollRef, dragHandlers: groupDragHandlers } = useSmoothHorizontalWheel();
  const { containerRef: cardScrollRef, dragHandlers: cardDragHandlers, isDragging } = useSmoothHorizontalWheel(selectedGroup);

  if (!isOpen || typeof document === 'undefined') return null;

  const currentPlan = getMembershipPlan(currentId);
  const visiblePlans = MEMBERSHIP_PLANS.filter((p) => p.group === selectedGroup);

  const handleActivate = (planId: string) => {
    setActiveMembershipId(planId);
    setCurrentId(planId);
  };

  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label="Hạng thành viên & Ưu đãi"
      className="fixed inset-0 z-[999] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] max-h-[92vh] rounded-t-[28px] border-t border-slate-100 bg-white shadow-2xl sm:rounded-[28px] sm:border flex flex-col overflow-hidden"
      >
        {/* Header Trắng Tinh Gọn */}
        <div className="shrink-0 px-4 pt-3.5 pb-2.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[#13693E]">
              <Crown className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-950 tracking-tight">Hạng thành viên &amp; Ưu đãi</h2>
              <p className="text-[11px] font-semibold text-[#13693E]">Hệ thống 15 thẻ hội viên chuẩn Grab</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2 Tab chuyển đổi phong cách Grab */}
        <div className="shrink-0 px-4 pt-2.5 pb-1 bg-slate-50/60 border-b border-slate-100 flex gap-2">
          <button
            type="button" onClick={() => setActiveTab('cards')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'cards' ? 'bg-[#13693E] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Sparkles className="h-3.5 w-3.5" /><span>15 Thẻ hội viên</span>
          </button>
          <button
            type="button" onClick={() => setActiveTab('promos')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'promos' ? 'bg-[#13693E] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Tag className="h-3.5 w-3.5" /><span>Ưu đãi minh bạch (6)</span>
          </button>
        </div>

        {/* Body Cuộn 60fps */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {activeTab === 'cards' ? (
            <>
              {/* Thẻ Digital Đang Kích Hoạt ở Đỉnh */}
              <div className={`rounded-2xl p-4 text-white shadow-lg bg-gradient-to-br ${currentPlan.cardGradient} relative overflow-hidden`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 border border-white/30">{currentPlan.badgeText}</span>
                    <h3 className="mt-1.5 text-base font-black tracking-tight">{currentPlan.name}</h3>
                    <p className="text-[11px] text-white/80">{currentPlan.tagline}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/90 text-[10.5px] font-bold text-white shadow-xs">
                    <Check className="h-3 w-3" /> Đang dùng
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/15 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-white/70 block">Mức khấu trừ:</span>
                    <strong className="text-white font-extrabold">Giảm {currentPlan.discountPercent}% • Tối đa {formatVnd(currentPlan.maxDiscountPerOrder)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-white/70 block">Lượt ưu đãi:</span>
                    <strong className="text-amber-300 font-extrabold">Còn {currentPlan.monthlyQuota}/{currentPlan.monthlyQuota} lượt</strong>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10.5px] text-white/90">
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-400" />Bảo hiểm {formatVnd(currentPlan.insuranceLimit)}</span>
                  {currentPlan.nightFeeWaived && <span className="text-amber-300 font-bold">★ Miễn phí đêm</span>}
                </div>
              </div>

              {/* 3 Chip Lọc Nhóm Thẻ - Lướt ngang mượt mà */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Chọn nhóm gói cứu hộ:</p>
                <div ref={groupScrollRef} {...groupDragHandlers} className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x cursor-grab">
                  {MEMBERSHIP_GROUPS.map((grp) => (
                    <button
                      key={grp.id} type="button" onClick={() => setSelectedGroup(grp.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedGroup === grp.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {grp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dải 5 thẻ trong nhóm lướt ngang tự do */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1 px-0.5">
                  <span>5 thẻ gói • Kéo chuột hoặc lăn chuột để xem</span>
                  <span className="text-slate-500 font-semibold">{visiblePlans.length} thẻ</span>
                </div>
                <div
                  ref={cardScrollRef} {...cardDragHandlers}
                  className={`flex items-stretch gap-3 overflow-x-auto scrollbar-none touch-pan-x py-1 px-0.5 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                >
                  {visiblePlans.map((plan) => {
                    const isCurrent = plan.id === currentId;
                    return (
                      <div
                        key={plan.id}
                        className={`w-[272px] shrink-0 p-3.5 rounded-2xl border transition-all bg-white flex flex-col justify-between ${isCurrent ? 'border-[#13693E] ring-1 ring-[#13693E]/30 shadow-md' : 'border-slate-200/90 shadow-xs hover:border-slate-300'}`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[120px]">{plan.badgeText}</span>
                            <div className="text-right shrink-0">
                              <span className="text-[13px] font-black text-[#13693E]">{formatVnd(plan.price)}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{plan.billingCycle}</span>
                            </div>
                          </div>
                          <h4 className="text-[14px] font-extrabold text-slate-950 mt-1.5">{plan.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{plan.tagline}</p>
                          <ul className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-700">
                            {plan.highlights.map((hl, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#13693E] shrink-0 mt-1" />
                                <span className="leading-tight text-slate-700">{hl}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button type="button" onClick={() => setInspectingPlan(plan)} className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-500 hover:text-slate-800">
                            <Info className="h-3 w-3" /><span>Chi tiết</span>
                          </button>
                          {isCurrent ? (
                            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-[#13693E] border border-emerald-200 font-bold text-[11.5px] inline-flex items-center gap-1">
                              <Check className="h-3 w-3" /> Đang dùng
                            </span>
                          ) : (
                            <button type="button" onClick={() => handleActivate(plan.id)} className="px-3 py-1 rounded-xl bg-[#13693E] hover:bg-[#0F5C36] text-white font-bold text-[11.5px] shadow-xs active:scale-95 transition-all">
                              Kích hoạt
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: 6 Ưu Đãi Minh Bạch */
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
              {PROMO_PROGRAMS.map((promo) => (
                <div key={promo.code} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-[#13693E] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">{promo.code}</span>
                      <span className="text-[11px] font-extrabold text-amber-600">Giảm {formatVnd(promo.discountAmount)}</span>
                    </div>
                    <h4 className="text-[13px] font-bold text-slate-900 mt-1">{promo.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{promo.condition}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-1">Áp dụng: {promo.eligibleTiers}</p>
                  </div>
                  <button
                    type="button" onClick={() => { if (onUsePromo) onUsePromo(promo.code); onClose(); }}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#13693E] text-white text-xs font-bold shadow-xs active:scale-95 transition-colors"
                  >
                    Dùng ngay
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Con Xem Chi Tiết Điều Kiện Thẻ */}
        {inspectingPlan && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/65 p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-[360px] rounded-2xl bg-white p-4 shadow-2xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-extrabold text-slate-900 text-sm">Điều kiện: {inspectingPlan.name}</h4>
                <button type="button" onClick={() => setInspectingPlan(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-slate-600 space-y-1.5">
                <p>• <strong>Khấu trừ:</strong> Giảm {inspectingPlan.discountPercent}%, tối đa {formatVnd(inspectingPlan.maxDiscountPerOrder)}/ca.</p>
                <p>• <strong>Hạn mức lượt dùng:</strong> {inspectingPlan.monthlyQuota} lượt cứu hộ tiêu chuẩn trong chu kỳ {inspectingPlan.billingCycle}.</p>
                <p>• <strong>Phụ phí đêm khuya (22h - 5h):</strong> {inspectingPlan.nightFeeWaived ? 'Miễn phí hoàn toàn 100%.' : 'Áp dụng biểu phí tiêu chuẩn.'}</p>
                <p>• <strong>Bảo hiểm cứu hộ:</strong> Lên tới {formatVnd(inspectingPlan.insuranceLimit)} bảo vệ xe và khách hàng.</p>
              </div>
              <button
                type="button" onClick={() => { handleActivate(inspectingPlan.id); setInspectingPlan(null); }}
                className="w-full mt-2 py-2 rounded-xl bg-[#13693E] text-white text-xs font-bold shadow-xs active:scale-95"
              >
                Kích hoạt thẻ này
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
