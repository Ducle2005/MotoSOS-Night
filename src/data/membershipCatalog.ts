export type MembershipGroup = 'daily' | 'pro' | 'vip';
export type BillingCycle = '/tuần' | '/tháng' | '/3 tháng' | '/năm' | '/15 ngày';

export interface MembershipCardPlan {
  id: string; group: MembershipGroup; name: string; badgeText: string;
  price: number; billingCycle: BillingCycle; discountPercent: number;
  maxDiscountPerOrder: number; monthlyQuota: number; nightFeeWaived: boolean;
  insuranceLimit: number; cardGradient: string; tagline: string;
  highlights: [string, string, string];
}

export interface PromoProgram {
  code: string; title: string; discountAmount: number; condition: string;
  eligibleTiers: string; voucherId?: string;
}

export interface PurchasedMembership {
  id: string; cardNumber: string; purchasedAt: string; expiresAt: string;
  remainingQuota: number; totalQuota: number; savedAmount: number; status: 'active' | 'expired';
}

export const MEMBERSHIP_GROUPS: Array<{ id: MembershipGroup; label: string; count: number }> = [
  { id: 'daily', label: 'Phổ thông (5)', count: 5 },
  { id: 'pro', label: 'Chuyên biệt (5)', count: 5 },
  { id: 'vip', label: 'VIP & Gia đình (5)', count: 5 },
];

export const MEMBERSHIP_PLANS: MembershipCardPlan[] = [
  // 1. Phổ thông (daily) - 5 thẻ
  {
    id: 'moto_lite_7d', group: 'daily', name: 'MotoLite 7 Ngày', badgeText: 'Tiện lợi',
    price: 19000, billingCycle: '/tuần', discountPercent: 15, maxDiscountPerOrder: 20000, monthlyQuota: 1,
    nightFeeWaived: false, insuranceLimit: 20000000, cardGradient: 'from-slate-700 via-slate-800 to-slate-900',
    tagline: 'Cứu cánh 7 ngày đi làm & đi học', highlights: ['Giảm 15% (tối đa 20.000đ/ca)', '1 lượt cứu hộ ưu tiên trong tuần', 'Bảo hiểm cứu hộ 20.000.000đ'],
  },
  {
    id: 'sinh_vien_td', group: 'daily', name: 'Sinh Viên Thủ Đức', badgeText: 'Trợ giá SV',
    price: 29000, billingCycle: '/tháng', discountPercent: 20, maxDiscountPerOrder: 25000, monthlyQuota: 2,
    nightFeeWaived: false, insuranceLimit: 30000000, cardGradient: 'from-teal-800 via-emerald-800 to-slate-900',
    tagline: 'Đặc quyền Làng Đại học & sinh viên', highlights: ['Giảm 20% (tối đa 25.000đ/ca)', '2 lượt cứu hộ/tháng', 'Bảo hiểm cứu hộ 30.000.000đ'],
  },
  {
    id: 'moto_start_m', group: 'daily', name: 'MotoStart Tháng', badgeText: 'Phổ thông',
    price: 49000, billingCycle: '/tháng', discountPercent: 20, maxDiscountPerOrder: 30000, monthlyQuota: 2,
    nightFeeWaived: false, insuranceLimit: 30000000, cardGradient: 'from-sky-800 via-blue-900 to-slate-950',
    tagline: 'An tâm di chuyển mỗi ngày', highlights: ['Giảm 20% (tối đa 30.000đ/ca)', '2 lượt cứu hộ/tháng', 'Bảo hiểm cứu hộ 30.000.000đ'],
  },
  {
    id: 'van_phong_8h', group: 'daily', name: 'Văn Phòng 8H', badgeText: 'Công sở',
    price: 69000, billingCycle: '/tháng', discountPercent: 25, maxDiscountPerOrder: 35000, monthlyQuota: 3,
    nightFeeWaived: false, insuranceLimit: 40000000, cardGradient: 'from-indigo-800 via-slate-900 to-black',
    tagline: 'Không lo trễ giờ làm vì xe hỏng', highlights: ['Giảm 25% (tối đa 35.000đ/ca)', '3 lượt cứu hộ/tháng', 'Bảo hiểm cứu hộ 40.000.000đ'],
  },
  {
    id: 'moto_plus_save', group: 'daily', name: 'MotoPlus Tiết Kiệm', badgeText: 'Tiết kiệm',
    price: 99000, billingCycle: '/tháng', discountPercent: 25, maxDiscountPerOrder: 40000, monthlyQuota: 3,
    nightFeeWaived: false, insuranceLimit: 50000000, cardGradient: 'from-emerald-700 via-teal-900 to-slate-950',
    tagline: 'Gói cứu hộ cân bằng & tiết kiệm', highlights: ['Giảm 25% (tối đa 40.000đ/ca)', '3 lượt cứu hộ/tháng', 'Bảo hiểm cứu hộ 50.000.000đ'],
  },

  // 2. Xe chuyên biệt (pro) - 5 thẻ
  {
    id: 'ev_hybrid', group: 'pro', name: 'Xe Điện & Hybrid', badgeText: 'Green EV',
    price: 79000, billingCycle: '/tháng', discountPercent: 25, maxDiscountPerOrder: 35000, monthlyQuota: 3,
    nightFeeWaived: false, insuranceLimit: 50000000, cardGradient: 'from-emerald-800 via-teal-950 to-slate-950',
    tagline: 'Chuyên gia pin & hệ thống điện xe thông minh', highlights: ['Kỹ thuật viên chứng chỉ xe điện', 'Giảm 25% kích bình & sạc khẩn cấp', 'Bảo hiểm pin xe 50.000.000đ'],
  },
  {
    id: 'scooter_urban', group: 'pro', name: 'Tay Ga Đô Thị', badgeText: 'Scooter Care',
    price: 89000, billingCycle: '/tháng', discountPercent: 25, maxDiscountPerOrder: 35000, monthlyQuota: 3,
    nightFeeWaived: false, insuranceLimit: 50000000, cardGradient: 'from-rose-900 via-slate-900 to-black',
    tagline: 'Chuyên dòng xe tay ga SH, Vespa, Grande, Lead', highlights: ['Chuyên trị đứt curoa & ngập nước', 'Giảm 25% (tối đa 35.000đ/ca)', 'Bảo hiểm xe 50.000.000đ'],
  },
  {
    id: 'clutch_sport', group: 'pro', name: 'Côn Tay & Sport', badgeText: 'Côn tay Sport',
    price: 129000, billingCycle: '/tháng', discountPercent: 30, maxDiscountPerOrder: 45000, monthlyQuota: 4,
    nightFeeWaived: false, insuranceLimit: 60000000, cardGradient: 'from-blue-900 via-slate-900 to-black',
    tagline: 'Đặc trị đứt cáp côn & nhông sên dĩa đứt xích', highlights: ['Dự phòng cáp côn & xích tải', 'Giảm 30% (tối đa 45.000đ/ca)', 'Bảo hiểm xe 60.000.000đ'],
  },
  {
    id: 'touring_15d', group: 'pro', name: 'Phượt Thủ 15 Ngày', badgeText: '15 Ngày Tour',
    price: 179000, billingCycle: '/15 ngày', discountPercent: 35, maxDiscountPerOrder: 50000, monthlyQuota: 4,
    nightFeeWaived: true, insuranceLimit: 80000000, cardGradient: 'from-amber-800 via-orange-950 to-black',
    tagline: 'Đồng hành xuyên đèo dốc & ngoại ô 30km', highlights: ['Cứu hộ xa lộ & ngoại ô 30km', 'Miễn 100% phụ phí đêm', 'Giảm 35% toàn bộ sự cố'],
  },
  {
    id: 'superbike_pkl', group: 'pro', name: 'Phân Khối Lớn PKL', badgeText: 'PKL Heavy',
    price: 249000, billingCycle: '/tháng', discountPercent: 35, maxDiscountPerOrder: 60000, monthlyQuota: 4,
    nightFeeWaived: true, insuranceLimit: 100000000, cardGradient: 'from-zinc-900 via-neutral-950 to-black',
    tagline: 'Thiết bị cẩu kéo & kỹ thuật viên PKL chuyên sâu', highlights: ['Xe bán tải chở xe chuyên dụng', 'Giảm 35% (tối đa 60.000đ/ca)', 'Bảo hiểm xe 100.000.000đ'],
  },

  // 3. VIP & Gia đình (vip) - 5 thẻ
  {
    id: 'priority_247', group: 'vip', name: 'Priority 24/7', badgeText: 'Mặc định VIP',
    price: 149000, billingCycle: '/tháng', discountPercent: 30, maxDiscountPerOrder: 40000, monthlyQuota: 4,
    nightFeeWaived: true, insuranceLimit: 50000000, cardGradient: 'from-[#0B1528] via-[#132644] to-[#1E3A5F]',
    tagline: 'Đặc quyền cứu hộ ưu tiên số 1 TP.HCM', highlights: ['Thợ đến trong 15 phút', 'Miễn phụ phí đêm 20.000đ', 'Giảm 30% tối đa 40.000đ/ca'],
  },
  {
    id: 'moto_gold', group: 'vip', name: 'MotoGold Toàn Diện', badgeText: 'Gold Member',
    price: 229000, billingCycle: '/tháng', discountPercent: 35, maxDiscountPerOrder: 50000, monthlyQuota: 5,
    nightFeeWaived: true, insuranceLimit: 80000000, cardGradient: 'from-amber-600 via-yellow-700 to-amber-950',
    tagline: 'Quyền lợi vàng, thợ tay nghề cao 10 năm', highlights: ['Giảm 35% (tối đa 50.000đ/ca)', 'Miễn 100% phụ phí đêm', 'Bảo hiểm toàn diện 80.000.000đ'],
  },
  {
    id: 'family_2bikes', group: 'vip', name: 'Gia Đình 2 Xe', badgeText: 'Family Pack',
    price: 269000, billingCycle: '/tháng', discountPercent: 35, maxDiscountPerOrder: 50000, monthlyQuota: 6,
    nightFeeWaived: true, insuranceLimit: 100000000, cardGradient: 'from-emerald-900 via-teal-950 to-slate-950',
    tagline: 'Bảo vệ cả 2 vợ chồng & con cái', highlights: ['Áp dụng đồng thời 2 biển số', '6 lượt cứu hộ/tháng', 'Miễn phụ phí đêm cho cả 2 xe'],
  },
  {
    id: 'moto_platinum_yr', group: 'vip', name: 'MotoPlatinum 1 Năm', badgeText: '1 Năm',
    price: 1490000, billingCycle: '/năm', discountPercent: 40, maxDiscountPerOrder: 60000, monthlyQuota: 30,
    nightFeeWaived: true, insuranceLimit: 100000000, cardGradient: 'from-slate-800 via-zinc-900 to-black',
    tagline: 'Thảnh thơi suốt 365 ngày trọn vẹn', highlights: ['Giảm 40% (tối đa 60.000đ/ca)', '30 lượt cứu hộ/năm', 'Miễn 100% phụ phí đêm'],
  },
  {
    id: 'moto_black_sig', group: 'vip', name: 'MotoBlack Signature', badgeText: 'Signature',
    price: 2490000, billingCycle: '/năm', discountPercent: 50, maxDiscountPerOrder: 80000, monthlyQuota: 50,
    nightFeeWaived: true, insuranceLimit: 150000000, cardGradient: 'from-black via-zinc-950 to-amber-950',
    tagline: 'Đẳng cấp thượng lưu — Trợ lý cứu hộ 24/7', highlights: ['Giảm 50% (tối đa 80.000đ/ca)', 'Chuyên viên cứu hộ riêng VIP', 'Bảo hiểm cao cấp 150.000.000đ'],
  },
];

export const PROMO_PROGRAMS: PromoProgram[] = [
  { code: 'BANMOI25', title: 'Chào bạn mới MotoSOS', discountAmount: 25000, condition: 'Áp dụng cho đơn cứu hộ đầu tiên trên toàn hệ thống', eligibleTiers: 'Tất cả thành viên', voucherId: 'BANMOI25' },
  { code: 'ANTOAN20', title: 'Điểm hẹn Trạm An Toàn 24/7', discountAmount: 20000, condition: 'Chọn điểm đón tại Cửa hàng tiện lợi / Cây xăng / Đồn Công an', eligibleTiers: 'Tất cả thành viên', voucherId: 'ANTOAN20' },
  { code: 'DEMKHUYA15', title: 'Trợ giá Đêm khuya', discountAmount: 15000, condition: 'Khung giờ đêm từ 22:00 đến 06:00 sáng hôm sau', eligibleTiers: 'Tất cả thành viên', voucherId: 'DEMKHUYA15' },
  { code: 'VIP50K', title: 'Đặc quyền Hội viên VIP & Chuyên biệt', discountAmount: 50000, condition: 'Áp dụng cho các ca cứu hộ chết máy, bình điện hoặc kéo xe', eligibleTiers: 'Hạng Chuyên biệt, VIP & Gia đình' },
  { code: 'FREEDEM', title: 'Miễn 100% Phụ phí Đêm Khuya', discountAmount: 20000, condition: 'Tự động miễn 20.000đ phụ phí đêm cho các chuyến từ 22h-5h', eligibleTiers: 'Hạng Chuyên biệt & VIP' },
  { code: 'MUAANHTHAN', title: 'Vượt Mưa Ngập An Toàn', discountAmount: 20000, condition: 'Áp dụng khi xe bị ngập nước hoặc chết máy trong mùa mưa', eligibleTiers: 'Tất cả thành viên' },
];

const STORAGE_KEY = 'motosos_active_membership';
const PURCHASED_KEY = 'motosos_purchased_memberships';

const DEFAULT_PURCHASED: PurchasedMembership[] = [
  {
    id: 'priority_247', cardNumber: 'MS-VIP-8429',
    purchasedAt: '2026-11-17T00:00:00.000Z', expiresAt: '2026-12-17T23:59:59.000Z',
    remainingQuota: 4, totalQuota: 4, savedAmount: 65000, status: 'active',
  },
];

let memoryActiveId = 'priority_247';
let memoryPurchasedList = DEFAULT_PURCHASED;

export function getActiveMembershipId(): string {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return memoryActiveId;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored || !MEMBERSHIP_PLANS.some((p) => p.id === stored)) return 'priority_247';
    return stored;
  } catch {
    return memoryActiveId;
  }
}

export function setActiveMembershipId(id: string): void {
  const targetId = MEMBERSHIP_PLANS.some((p) => p.id === id) ? id : 'priority_247';
  memoryActiveId = targetId;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, targetId);
      window.dispatchEvent(new CustomEvent('motosos_membership_changed', { detail: { id: targetId } }));
    } catch {}
  }
}

export function getMembershipPlan(id?: string | null): MembershipCardPlan {
  const targetId = id || getActiveMembershipId();
  return MEMBERSHIP_PLANS.find((p) => p.id === targetId) || MEMBERSHIP_PLANS.find((p) => p.id === 'priority_247') || MEMBERSHIP_PLANS[0];
}

export function getPurchasedMemberships(): PurchasedMembership[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return memoryPurchasedList;
  try {
    const raw = localStorage.getItem(PURCHASED_KEY);
    if (!raw) {
      localStorage.setItem(PURCHASED_KEY, JSON.stringify(DEFAULT_PURCHASED));
      return DEFAULT_PURCHASED;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PURCHASED;
  } catch {
    return memoryPurchasedList;
  }
}

export function getActivePurchasedMembership(): { record: PurchasedMembership; plan: MembershipCardPlan } {
  const activePlan = getMembershipPlan();
  const list = getPurchasedMemberships();
  let found = list.find((item) => item.id === activePlan.id && item.status === 'active') || list.find((item) => item.id === activePlan.id);
  if (!found) {
    found = {
      id: activePlan.id, cardNumber: `MS-${activePlan.group.toUpperCase()}-8429`,
      purchasedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      remainingQuota: activePlan.monthlyQuota, totalQuota: activePlan.monthlyQuota,
      savedAmount: 0, status: 'active',
    };
  }
  return { record: found, plan: activePlan };
}

export function purchaseOrSwitchMembership(planId: string): void {
  const plan = getMembershipPlan(planId);
  const list: PurchasedMembership[] = getPurchasedMemberships().map((item) => ({ ...item, status: 'expired' }));
  const existingIdx = list.findIndex((item) => item.id === plan.id);
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], status: 'active' };
  } else {
    list.unshift({
      id: plan.id, cardNumber: `MS-${plan.group.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      purchasedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      remainingQuota: plan.monthlyQuota, totalQuota: plan.monthlyQuota, savedAmount: 0, status: 'active',
    });
  }
  memoryPurchasedList = list;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try { localStorage.setItem(PURCHASED_KEY, JSON.stringify(list)); } catch {}
  }
  setActiveMembershipId(plan.id);
}
