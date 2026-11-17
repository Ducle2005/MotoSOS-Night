import { getMembershipPlan } from '../data/membershipCatalog';
import type {
  GeoCoord,
  IssueOption,
  IssueType,
  OrderPricing,
  PickupMode,
  ScopeApprovalItem,
  VoucherId,
  VoucherOption,
} from '../types/rescue';
import { computeHaversineMeters } from './rescueLogic';

export const NIGHT_SURCHARGE = 20000;

export function isNightTimeWindow(simulateNight?: boolean): boolean {
  if (simulateNight !== undefined) return simulateNight;
  const hour = new Date().getHours();
  return hour >= 22 || hour < 5;
}

export const MOCK_SCOPE_ITEMS: ScopeApprovalItem[] = [
  {
    id: 'spark_plug',
    title: 'Thay bugi NGK chính hãng',
    reason: 'Bugi cũ đánh lửa yếu do ngập nước, khó nổ máy',
    cost: 45000,
  },
  {
    id: 'inner_tube',
    title: 'Thay ruột xe sau Casumina',
    reason: 'Lốp rách mép van không thể vá ép nấm',
    cost: 65000,
  },
  {
    id: 'chain_link',
    title: 'Nối mắt sên & tra mỡ chịu nhiệt',
    reason: 'Sên chùn tuột mắt nguy hiểm khi di chuyển',
    cost: 35000,
  },
];

export function formatVnd(amount: number): string {
  const safe = Math.max(0, Math.round(amount));
  const formatted = safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}đ`;
}

export function isVoucherEligible(
  voucher: VoucherOption,
  pickupMode: PickupMode,
  isRemoteArea = false,
): boolean {
  if (!voucher.requiresSafeStation) return true;
  if (isRemoteArea) return true;
  return pickupMode === 'safe_station';
}

export function calculateRescuePricing(
  issueId: IssueType | null,
  options: IssueOption[],
  pickupMode: PickupMode,
  voucherId: VoucherId | null,
  vouchers: VoucherOption[],
  isNight = false,
  extraCost = 0,
  extraItemTitle?: string,
  isRemoteArea = false,
  membershipPlanId?: string | null,
): OrderPricing {
  const matchedIssue =
    options.find((opt) => opt.id === issueId) ?? options[0] ?? null;
  const basePrice = matchedIssue?.fixedPrice ?? 85000;

  const candidateVoucher = voucherId
    ? vouchers.find((v) => v.id === voucherId) ?? null
    : null;
  const appliedVoucher =
    candidateVoucher && isVoucherEligible(candidateVoucher, pickupMode, isRemoteArea)
      ? candidateVoucher
      : null;

  const voucherDiscount = appliedVoucher
    ? Math.min(basePrice, appliedVoucher.discountAmount)
    : 0;

  let memberDiscountAmount = 0;
  let memberPlanName: string | undefined;
  let isNightWaivedByMember = false;

  if (membershipPlanId) {
    const plan = getMembershipPlan(membershipPlanId);
    memberPlanName = plan.name;
    if (isNight && plan.nightFeeWaived) {
      isNightWaivedByMember = true;
    }
    const rawDisc = Math.round(basePrice * (plan.discountPercent / 100));
    memberDiscountAmount = Math.min(rawDisc, plan.maxDiscountPerOrder);
  }

  const discountAmount = Math.min(basePrice, voucherDiscount + memberDiscountAmount);
  const nightSurcharge = (isNight && !isNightWaivedByMember) ? NIGHT_SURCHARGE : 0;
  const finalPrice = Math.max(0, basePrice + nightSurcharge - discountAmount + extraCost);

  return {
    basePrice,
    discountAmount,
    finalPrice,
    appliedVoucher,
    nightSurcharge,
    extraCost,
    extraItemTitle,
    memberDiscountAmount: memberDiscountAmount > 0 ? memberDiscountAmount : undefined,
    memberPlanName,
    isNightWaivedByMember,
  };
}

export function resampleRouteWaypoints(coordinates: [number, number][], targetSteps = 16): GeoCoord[] {
  if (coordinates.length === 0) return [];
  if (coordinates.length === 1) return [{ lng: coordinates[0][0], lat: coordinates[0][1] }];

  const cumulativeDistances: number[] = [0];
  let totalMeters = 0;
  for (let i = 1; i < coordinates.length; i += 1) {
    totalMeters += computeHaversineMeters({ lng: coordinates[i - 1][0], lat: coordinates[i - 1][1] }, { lng: coordinates[i][0], lat: coordinates[i][1] });
    cumulativeDistances.push(totalMeters);
  }
  if (totalMeters <= 0) return coordinates.map(([lng, lat]) => ({ lng, lat }));

  const steps = Math.max(2, targetSteps);
  const waypoints: GeoCoord[] = [];
  let segIdx = 0;

  for (let step = 0; step <= steps; step += 1) {
    const targetDist = (totalMeters * step) / steps;
    while (segIdx < cumulativeDistances.length - 2 && cumulativeDistances[segIdx + 1] < targetDist) segIdx += 1;
    const startDist = cumulativeDistances[segIdx];
    const endDist = cumulativeDistances[segIdx + 1];
    const segLen = Math.max(0.0001, endDist - startDist);
    const ratio = Math.min(1, Math.max(0, (targetDist - startDist) / segLen));
    const [lng1, lat1] = coordinates[segIdx];
    const [lng2, lat2] = coordinates[segIdx + 1];
    waypoints.push({ lng: lng1 + (lng2 - lng1) * ratio, lat: lat1 + (lat2 - lat1) * ratio });
  }
  return waypoints;
}

export function computeStepEtaMinutes(stepIndex: number, totalSteps: number, initialEtaMinutes: number): number {
  if (totalSteps <= 1) return 1;
  if (stepIndex >= totalSteps - 1) return 0;
  return Math.max(1, Math.ceil(initialEtaMinutes * (1 - Math.min(1, Math.max(0, stepIndex / (totalSteps - 1))))));
}

export function buildMechanicAutoReply(userMessage: string, pickupTitle: string, etaMinutes: number): string {
  const lower = userMessage.toLowerCase();
  const etaText = etaMinutes <= 1 ? 'chưa tới 1 phút' : `khoảng ${etaMinutes} phút`;
  if (lower.includes('trạm an toàn') || lower.includes('sáng đèn')) return `Ok bạn nhé, mình thấy điểm hẹn ${pickupTitle} rồi. Bạn cứ đứng chỗ sáng đèn chờ ${etaText} mình tới ngay!`;
  if (lower.includes('trước cửa')) return `Rõ rồi bạn ơi, thấy xe dựng trước cửa mình tấp vào liền. Mình còn cách ${etaText} nữa nhé.`;
  if (lower.includes('gần chưa') || lower.includes('đâu rồi')) return `Mình đang chạy thẳng tới ${pickupTitle}, còn tầm ${etaText} là tới nơi nha bạn!`;
  return `Mình đã nhận tin nhắn rồi nhé. Bạn yên tâm đứng ở ${pickupTitle}, mình đang tới sau ${etaText}.`;
}

export function cleanAddressSnippet(title: string, address: string): string {
  let cleanAddr = (address || '').trim();
  cleanAddr = cleanAddr.replace(/,\s*(Vietnam|Việt Nam)$/i, '');
  cleanAddr = cleanAddr.replace(/,\s*(Saigon|Ho Chi Minh|Thành phố Hồ Chí Minh|TP\.?\s*HCM)/gi, '');
  cleanAddr = cleanAddr.replace(/\bStreet\b/gi, '').replace(/\bWard\b/gi, 'P.').replace(/\bDistrict\b/gi, 'Q.');
  cleanAddr = cleanAddr.replace(/\s+/g, ' ').replace(/,\s*,/g, ',').trim();
  cleanAddr = cleanAddr.replace(/^[,\s-]+|[,\s-]+$/g, '');

  if (cleanAddr.toLowerCase().includes('ly tu trong')) {
    cleanAddr = 'Đ. Lý Tự Trọng';
  } else if (cleanAddr.toLowerCase().includes('hai ba trung')) {
    cleanAddr = 'Đ. Hai Bà Trưng';
  } else if (cleanAddr.toLowerCase().includes('le loi')) {
    cleanAddr = 'Đ. Lê Lợi';
  } else if (cleanAddr.toLowerCase().includes('nguyen hue')) {
    cleanAddr = 'Đ. Nguyễn Huệ';
  }

  const cleanTitle = (title || '').replace(/\s*\([^)]*\)/g, '').trim();
  if (cleanTitle && cleanAddr && !cleanAddr.toLowerCase().includes(cleanTitle.toLowerCase())) {
    return `${cleanTitle}, ${cleanAddr}`;
  }
  return cleanTitle || cleanAddr || 'Điểm đón hiện tại';
}

