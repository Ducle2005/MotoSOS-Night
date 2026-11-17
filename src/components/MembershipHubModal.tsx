import { Check, Crown, Info, Sparkles, Tag, UserCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  MEMBERSHIP_GROUPS, MEMBERSHIP_PLANS,
  getActiveMembershipId, getPurchasedMemberships, purchaseOrSwitchMembership,
  type MembershipCardPlan, type MembershipGroup,
} from '../data/membershipCatalog';
import { useSmoothHorizontalWheel } from '../hooks/useSmoothHorizontalWheel';
import { formatVnd } from '../utils/pricingAndSimLogic';
import { MembershipCheckoutModal } from './MembershipCheckoutModal';
import { MyMembershipView } from './MyMembershipView';
import { PromoCarouselTab } from './PromoCarouselTab';

interface MembershipHubModalProps {
  isOpen: boolean; onClose: () => void; onUsePromo?: (promoCode: string) => void;
  initialTab?: 'my_plan' | 'cards' | 'promos'; onBookNow?: () => void;
}

export function MembershipHubModal({ isOpen, onClose, onUsePromo, initialTab = 'my_plan', onBookNow }: MembershipHubModalProps) {
  const [activeTab, setActiveTab] = useState<'my_plan' | 'cards' | 'promos'>(initialTab);
  const [selectedGroup, setSelectedGroup] = useState<MembershipGroup>('vip');
  const [currentId, setCurrentId] = useState<string>(() => getActiveMembershipId());
  const [purchasedList, setPurchasedList] = useState(() => getPurchasedMemberships());
  const [currentCardIndex, setCurrentCardIndex] = useState(1);
  const [inspectingPlan, setInspectingPlan] = useState<MembershipCardPlan | null>(null);
  const [checkoutCard, setCheckoutCard] = useState<MembershipCardPlan | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCurrentId(getActiveMembershipId());
      setPurchasedList(getPurchasedMemberships());
    }
  }, [isOpen, initialTab]);

  const { containerRef: groupScrollRef, dragHandlers: groupDragHandlers } = useSmoothHorizontalWheel();
  const { containerRef: cardScrollRef, dragHandlers: cardDragHandlers, isDragging, resetScroll } = useSmoothHorizontalWheel();

  if (!isOpen || typeof document === 'undefined') return null;

  const visiblePlans = MEMBERSHIP_PLANS.filter((p) => p.group === selectedGroup);

  const handleActivate = (planId: string) => {
    purchaseOrSwitchMembership(planId);
    setCurrentId(planId);
    setPurchasedList(getPurchasedMemberships());
  };

  const handleCheckoutSuccess = (planId: string) => {
    setCheckoutCard(null);
    setCurrentId(planId);
    setPurchasedList(getPurchasedMemberships());
    setActiveTab('my_plan');
  };

  const handleSelectGroup = (groupId: MembershipGroup) => {
    setSelectedGroup(groupId);
    resetScroll();
    setCurrentCardIndex(1);
  };

  const handleCardScroll = (e: React.UIEvent<HTMLDivElement>) => {
    cardDragHandlers.onScroll();
    const idx = Math.min(visiblePlans.length, Math.max(1, Math.round(e.currentTarget.scrollLeft / 284) + 1));
    setCurrentCardIndex(idx);
  };

  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label="Hạng thành viên & Ưu đãi"
      className="fixed inset-0 z-[999] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[430px] max-h-[92vh] rounded-t-[28px] border-t border-slate-100 bg-white shadow-2xl sm:rounded-[28px] sm:border flex flex-col overflow-hidden">
        {/* Header Trắng Tinh Gọn */}
        <div className="shrink-0 px-4 pt-3.5 pb-2.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[#13693E]"><Crown className="h-4 w-4" /></span>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-950 tracking-tight">Hạng thành viên &amp; Ưu đãi</h2>
              <p className="text-[11px] font-semibold text-[#13693E]">Hệ thống 15 thẻ hội viên chuẩn Grab</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 3 Tab chuyển đổi phong cách Grab */}
        <div className="shrink-0 px-3 pt-2.5 pb-1 bg-slate-50/60 border-b border-slate-100 flex gap-1.5">
          <button type="button" onClick={() => setActiveTab('my_plan')} className={`flex-1 py-1.5 rounded-xl text-[11.5px] font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'my_plan' ? 'bg-[#13693E] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <UserCheck className="h-3.5 w-3.5" /><span>Gói của tôi</span>
          </button>
          <button type="button" onClick={() => setActiveTab('cards')} className={`flex-1 py-1.5 rounded-xl text-[11.5px] font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'cards' ? 'bg-[#13693E] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Sparkles className="h-3.5 w-3.5" /><span>15 Thẻ hội viên</span>
          </button>
          <button type="button" onClick={() => setActiveTab('promos')} className={`flex-1 py-1.5 rounded-xl text-[11.5px] font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'promos' ? 'bg-[#13693E] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Tag className="h-3.5 w-3.5" /><span>Ưu đãi (6)</span>
          </button>
        </div>

        {/* Body Cuộn 60fps */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {activeTab === 'my_plan' ? (
            <MyMembershipView onExplorePlans={() => setActiveTab('cards')} onBookNow={() => { onClose(); onBookNow?.(); }} />
          ) : activeTab === 'cards' ? (
            <>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Chọn nhóm gói cứu hộ:</p>
                <div ref={groupScrollRef} {...groupDragHandlers} className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x cursor-grab">
                  {MEMBERSHIP_GROUPS.map((grp) => (
                    <button key={grp.id} type="button" onClick={() => handleSelectGroup(grp.id)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedGroup === grp.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      {grp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dải 5 thẻ trong nhóm lướt ngang tự do */}
              <div className="-mx-4">
                <div className="flex items-center justify-between text-[11px] font-medium mb-1.5 px-4">
                  <span className="text-slate-500">Lăn chuột hoặc kéo ngang để xem</span>
                  <span className="text-[11px] font-bold text-[#13693E]">{currentCardIndex} / {visiblePlans.length}</span>
                </div>
                <div ref={cardScrollRef} {...cardDragHandlers} onScroll={handleCardScroll} className={`flex items-stretch gap-3 overflow-x-auto scrollbar-none touch-pan-x select-none px-4 pb-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
                  {visiblePlans.map((plan) => {
                    const isCurrent = plan.id === currentId;
                    const isOwned = purchasedList.some((p) => p.id === plan.id && (p.status === 'active' || p.remainingQuota > 0));
                    return (
                      <div key={plan.id} className={`w-[272px] shrink-0 p-3.5 rounded-2xl border transition-all bg-white flex flex-col justify-between ${isCurrent ? 'border-[#13693E] ring-1 ring-[#13693E]/30 shadow-md' : 'border-slate-200/90 shadow-xs hover:border-slate-300'}`}>
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
                            <span className="px-3.5 py-1.5 rounded-full bg-[#E6F4EC] text-[#13693E] text-[12px] font-bold inline-flex items-center gap-1">
                              <Check className="h-3 w-3" /> Đang dùng
                            </span>
                          ) : isOwned ? (
                            <button type="button" onClick={() => handleActivate(plan.id)} className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-bold shadow-xs active:scale-95 transition-all">
                              Dùng gói
                            </button>
                          ) : (
                            <button type="button" onClick={() => setCheckoutCard(plan)} className="px-4 py-1.5 rounded-full bg-[#13693E] hover:bg-[#0F5C36] text-white text-[12px] font-extrabold transition-colors active:scale-95 shadow-xs">
                              Mua
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
            <PromoCarouselTab onUsePromo={onUsePromo} onClose={onClose} />
          )}
        </div>

        {/* Modal Con Xem Chi Tiết Điều Kiện Thẻ */}
        {inspectingPlan && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/65 p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-[360px] rounded-2xl bg-white p-4 shadow-2xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-extrabold text-slate-900 text-sm">Điều kiện: {inspectingPlan.name}</h4>
                <button type="button" onClick={() => setInspectingPlan(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="text-xs text-slate-600 space-y-1.5">
                <p>• <strong>Khấu trừ:</strong> Giảm {inspectingPlan.discountPercent}%, tối đa {formatVnd(inspectingPlan.maxDiscountPerOrder)}/ca.</p>
                <p>• <strong>Hạn mức:</strong> {inspectingPlan.monthlyQuota} lượt cứu hộ tiêu chuẩn trong {inspectingPlan.billingCycle}.</p>
                <p>• <strong>Phụ phí đêm (22h - 5h):</strong> {inspectingPlan.nightFeeWaived ? 'Miễn phí 100%.' : 'Áp dụng biểu phí thường.'}</p>
                <p>• <strong>Bảo hiểm cứu hộ:</strong> Lên tới {formatVnd(inspectingPlan.insuranceLimit)} bảo vệ xe.</p>
              </div>
              {inspectingPlan.id === currentId ? (
                <div className="w-full mt-2 py-2 text-center rounded-xl bg-[#E6F4EC] text-[#13693E] text-xs font-bold">Đang dùng gói này</div>
              ) : purchasedList.some((p) => p.id === inspectingPlan.id && (p.status === 'active' || p.remainingQuota > 0)) ? (
                <button type="button" onClick={() => { handleActivate(inspectingPlan.id); setInspectingPlan(null); }} className="w-full mt-2 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs active:scale-95">
                  Dùng gói này
                </button>
              ) : (
                <button type="button" onClick={() => { const p = inspectingPlan; setInspectingPlan(null); setCheckoutCard(p); }} className="w-full mt-2 py-2 rounded-xl bg-[#13693E] text-white text-xs font-bold shadow-xs active:scale-95">
                  Mua gói này ({formatVnd(inspectingPlan.price)})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Thanh Toán Gói Hội Viên */}
        <MembershipCheckoutModal isOpen={!!checkoutCard} card={checkoutCard} onClose={() => setCheckoutCard(null)} onSuccess={handleCheckoutSuccess} />
      </div>
    </div>,
    document.body
  );
}
