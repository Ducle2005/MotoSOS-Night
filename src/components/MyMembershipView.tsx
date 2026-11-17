import { ArrowRight, CheckCircle2, Crown, RefreshCw, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
import {
  getActivePurchasedMembership, getMembershipPlan, getPurchasedMemberships,
  purchaseOrSwitchMembership, type PurchasedMembership,
} from '../data/membershipCatalog';
import { formatVnd } from '../utils/pricingAndSimLogic';

interface MyMembershipViewProps {
  onExplorePlans: () => void;
  onBookNow: () => void;
}

function formatExpiryDate(isoStr: string) {
  try {
    const d = new Date(isoStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return '17/12/2026';
  }
}

export function MyMembershipView({ onExplorePlans, onBookNow }: MyMembershipViewProps) {
  const [data, setData] = useState(() => getActivePurchasedMembership());
  const [allPurchased, setAllPurchased] = useState<PurchasedMembership[]>(() => getPurchasedMemberships());

  const { record, plan } = data;
  const otherPurchased = allPurchased.filter((p) => p.id !== record.id);
  const quotaPercent = Math.max(0, Math.min(100, Math.round((record.remainingQuota / record.totalQuota) * 100)));

  const handleSwitch = (planId: string) => {
    purchaseOrSwitchMembership(planId);
    setData(getActivePurchasedMembership());
    setAllPurchased(getPurchasedMemberships());
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Thẻ Thành Viên Đang Hiệu Lực (Active Pass Card) */}
      <div className={`rounded-2xl p-4 text-white shadow-lg bg-gradient-to-br ${plan.cardGradient} border border-white/15 relative overflow-hidden transition-all`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-white/20 border border-white/30 text-white shadow-2xs">
              <Crown className="h-3 w-3 text-amber-300" /> Đang hiệu lực
            </span>
            <h3 className="mt-2 text-xl font-black tracking-tight">{plan.name}</h3>
            <p className="text-[11px] font-mono text-white/80 mt-0.5">Mã thẻ: {record.cardNumber}</p>
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-white/90">
            {plan.badgeText}
          </span>
        </div>

        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-white/90">
          <span>Hiệu lực đến {formatExpiryDate(record.expiresAt)}</span>
          <span className="font-extrabold text-amber-300">Chu kỳ {plan.billingCycle}</span>
        </div>
      </div>

      {/* 2. Khung Thống Kê Quyền Lợi & Lượt Dùng */}
      <div className="p-3.5 rounded-2xl bg-[#F4F8F6] border border-emerald-600/15 grid grid-cols-2 gap-3 items-center">
        <div>
          <span className="text-[11px] font-bold text-slate-500 block">Lượt ưu đãi còn lại:</span>
          <strong className="text-base font-extrabold text-slate-900 mt-0.5 block">{record.remainingQuota} / {record.totalQuota} lượt</strong>
          <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden mt-1.5">
            <div className="h-full rounded-full bg-[#13693E] transition-all duration-300" style={{ width: `${quotaPercent}%` }} />
          </div>
        </div>
        <div className="text-right border-l border-emerald-600/10 pl-3">
          <span className="text-[11px] font-bold text-slate-500 block">Đã tiết kiệm kỳ này:</span>
          <strong className="text-[17px] font-black text-[#13693E] mt-0.5 block">{formatVnd(record.savedAmount)}</strong>
          <span className="text-[10px] font-semibold text-emerald-700">Tối ưu chi phí thực tế</span>
        </div>
      </div>

      {/* 3. Danh Sách Quyền Lợi Đang Hưởng Dạng Phẳng Chuẩn Grab */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 divide-y divide-slate-100 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2">Đặc quyền gói của bạn:</h4>

        <div className="py-2.5 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-[#13693E] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-extrabold text-slate-900">Giảm {plan.discountPercent}% • Tối đa {formatVnd(plan.maxDiscountPerOrder)}/chuyến</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Tự động áp dụng khi xác nhận điều thợ trên toàn hệ thống</p>
          </div>
        </div>

        <div className="py-2.5 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-[#13693E] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-extrabold text-slate-900">Ưu tiên điều thợ nhanh &lt; 5 phút</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Đưa yêu cầu cứu hộ lên đầu danh sách điều phối mạng lưới</p>
          </div>
        </div>

        <div className="py-2.5 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-[#13693E] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-extrabold text-slate-900">
              {plan.nightFeeWaived ? 'Miễn phí 100% phụ phí đêm (+20.000đ)' : 'Phụ phí đêm theo biểu phí tiêu chuẩn'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {plan.nightFeeWaived ? 'Khung giờ đêm từ 22:00 đến 05:00 sáng hôm sau' : 'Áp dụng biểu phí chuẩn cho khung giờ 22h-5h'}
            </p>
          </div>
        </div>

        <div className="pt-2.5 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-[#13693E] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-extrabold text-slate-900">Bảo hiểm cứu hộ tới {formatVnd(plan.insuranceLimit)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Bảo vệ toàn diện phương tiện và an toàn chuyến đi</p>
          </div>
        </div>
      </div>

      {/* 4. Lịch Sử Các Gói Đã Mua (Nếu có nhiều gói) */}
      {otherPurchased.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Các gói đã lưu:</p>
          {otherPurchased.map((old) => {
            const oldPlan = getMembershipPlan(old.id);
            return (
              <div key={old.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-800">{oldPlan.name}</span>
                  <span className="text-[10px] text-slate-500 block">Còn {old.remainingQuota} lượt • {formatExpiryDate(old.expiresAt)}</span>
                </div>
                <button
                  type="button" onClick={() => handleSwitch(old.id)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-100 active:scale-95"
                >
                  Dùng gói này
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. 2 Nút Hành Động Ở Đáy */}
      <div className="pt-1 flex flex-col gap-2">
        <button
          type="button" onClick={onBookNow}
          className="w-full py-3 rounded-xl bg-[#13693E] hover:bg-[#0F5C36] text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Đặt cứu hộ với ưu đãi ngay</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button" onClick={onExplorePlans}
          className="w-full py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
        >
          Đổi / Nâng cấp gói khác
        </button>
      </div>
    </div>
  );
}
