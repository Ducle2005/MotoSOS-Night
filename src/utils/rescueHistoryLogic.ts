import type {
  GeoCoord,
  IssueType,
  MechanicInfo,
  OrderPricing,
  RescueReceipt,
} from '../types/rescue';
import { formatVnd } from './pricingAndSimLogic';
import { encryptPayload, safeDecryptAndParse } from './storageCrypto';

export const RESCUE_HISTORY_STORAGE_KEY = 'motosos_rescue_history';

export const DEFAULT_RESCUE_HISTORY: RescueReceipt[] = [
  {
    id: 'MS-8492',
    serviceName: 'Lủng lốp',
    issueType: 'flat_tire',
    replacedParts: 'Vá ép nấm tiêu chuẩn + kiểm tra áp suất 2 lốp',
    locationAddress: 'Đ. Mạc Thị Bưởi, P. Bến Nghé, Q.1',
    lat: 10.7745,
    lng: 106.7042,
    mechanicName: 'Nguyễn Minh Tuấn',
    mechanicPlate: '59-P2 842.19',
    mechanicPhone: '0909 888 999',
    mechanicRating: '4.9 ★',
    originalPrice: 85000,
    discountAmount: 20000,
    promoCode: 'ANTOAN20',
    finalPrice: 65000,
    paymentMethod: 'Tiền mặt / Chuyển khoản QR',
    completedAt: '23:42 • 14/11/2026',
  },
  {
    id: 'MS-8317',
    serviceName: 'Kích bình',
    issueType: 'battery_jump',
    replacedParts: 'Kích sạc ắc quy lưu động + đo điện áp dòng sạc',
    locationAddress: '136 Hàm Nghi, P. Bến Thành, Q.1',
    lat: 10.7718,
    lng: 106.6991,
    mechanicName: 'Trần Văn Hùng',
    mechanicPlate: '59-H1 612.88',
    mechanicPhone: '0903 112 233',
    mechanicRating: '4.8 ★',
    originalPrice: 90000,
    discountAmount: 15000,
    promoCode: 'DEMKHUYA15',
    finalPrice: 75000,
    paymentMethod: 'Chuyển khoản QR Napas',
    completedAt: '21:15 • 12/11/2026',
  },
  {
    id: 'MS-8104',
    serviceName: 'Hết xăng',
    issueType: 'out_of_fuel',
    replacedParts: 'Tiếp tế khẩn cấp 2 Lít xăng RON 95 tận nơi',
    locationAddress: '84 Lê Thánh Tôn, P. Bến Nghé, Q.1',
    lat: 10.7782,
    lng: 106.7021,
    mechanicName: 'Lê Hoàng Nam',
    mechanicPlate: '59-F1 391.02',
    mechanicPhone: '0912 334 455',
    mechanicRating: '5.0 ★',
    originalPrice: 80000,
    discountAmount: 25000,
    promoCode: 'BANMOI25',
    finalPrice: 55000,
    paymentMethod: 'Tiền mặt',
    completedAt: '01:05 • 08/11/2026',
  },
];

export function loadRescueHistory(): RescueReceipt[] {
  if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_RESCUE_HISTORY;
  try {
    const raw = window.localStorage.getItem(RESCUE_HISTORY_STORAGE_KEY);
    if (!raw) {
      saveRescueHistory(DEFAULT_RESCUE_HISTORY);
      return DEFAULT_RESCUE_HISTORY;
    }
    const parsed = safeDecryptAndParse<RescueReceipt[]>(raw, DEFAULT_RESCUE_HISTORY);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as RescueReceipt[]) : DEFAULT_RESCUE_HISTORY;
  } catch {
    return DEFAULT_RESCUE_HISTORY;
  }
}

export function saveRescueHistory(items: RescueReceipt[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const encrypted = encryptPayload(JSON.stringify(items));
    window.localStorage.setItem(RESCUE_HISTORY_STORAGE_KEY, encrypted);
  } catch {}
}

export function resolveReplacedParts(issue: IssueType | null | string, customNote?: string): string {
  switch (issue) {
    case 'flat_tire':
      return 'Vá ép nấm tiêu chuẩn + kiểm tra áp suất 2 lốp';
    case 'engine_dead':
      return 'Kiểm tra bugi & vệ sinh hệ thống đánh lửa';
    case 'out_of_fuel':
      return 'Tiếp tế khẩn cấp 2 Lít xăng RON 95 tận nơi';
    case 'battery_jump':
      return 'Kích sạc ắc quy lưu động + đo điện áp dòng sạc';
    default:
      return customNote?.trim()
        ? `Cứu hộ khẩn cấp: ${customNote.trim()}`
        : 'Cứu hộ kỹ thuật & xử lý sự cố tại chỗ';
  }
}

export function generateRescueReceiptId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `MS-${num}`;
}

export function formatCompletedAtDate(date: Date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes} • ${day}/${month}/${year}`;
}

export function calculateHistoryStats(history: RescueReceipt[]) {
  const totalTrips = history.length;
  const totalSavedAmount = history.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
  const totalSpent = history.reduce((sum, item) => sum + (item.finalPrice || 0), 0);
  return { totalTrips, totalSavedAmount, totalSpent };
}

export function buildReceiptPlainText(r: RescueReceipt): string {
  const lines = [
    '=== BIÊN LAI ĐIỆN TỬ MOTOSOS ===',
    `Mã đơn: #${r.id}${r.rescueOtp ? ` • OTP xác thực: #${r.rescueOtp}` : ''}`,
    `Thời gian: ${r.completedAt}`,
    `Dịch vụ: ${r.serviceName}`,
    `Hạng mục: ${r.replacedParts}`,
    `Địa điểm: ${r.locationAddress}`,
    `Thợ phụ trách: ${r.mechanicName} (${r.mechanicPlate}) - SĐT: ${r.mechanicPhone}`,
    '--- CHI PHÍ ---',
    `Giá gốc: ${formatVnd(r.originalPrice)}`,
  ];

  if (r.nightSurcharge && r.nightSurcharge > 0) {
    lines.push(`Phụ phí đêm khuya (22h - 5h): +${formatVnd(r.nightSurcharge)}`);
  }
  if (r.extraCost && r.extraCost > 0) {
    lines.push(`Phát sinh đã duyệt: +${formatVnd(r.extraCost)} (${r.extraItemTitle || 'Linh kiện thay thế'})`);
  }
  lines.push(`Khuyến mãi: ${r.discountAmount > 0 ? `-${formatVnd(r.discountAmount)} (${r.promoCode || 'Ưu đãi'})` : '0đ'}`);
  lines.push(`Tổng thanh toán: ${formatVnd(r.finalPrice)} (${r.paymentMethod})`);
  lines.push('--- BẢO HÀNH & BẢO HIỂM ---');
  lines.push('✓ Bảo hành kỹ thuật điện tử 7 ngày tại 30+ Trạm An Toàn MotoSOS');
  lines.push('✓ Bảo hiểm trách nhiệm dân sự cứu nạn 50.000.000đ');
  lines.push('Cảm ơn bạn đã tin dùng MotoSOS 24/7!');
  return lines.join('\n');
}

export function createRescueReceiptFromOrder(params: {
  serviceName: string;
  issueType: IssueType | null;
  customNote?: string;
  pickupAddress: string;
  coord: GeoCoord;
  mechanic: MechanicInfo;
  pricing: OrderPricing;
  rescueOtp?: string;
}): RescueReceipt {
  const baseReplaced = resolveReplacedParts(params.issueType, params.customNote);
  const replacedParts = params.pricing.extraItemTitle
    ? `${baseReplaced} + ${params.pricing.extraItemTitle}`
    : baseReplaced;

  return {
    id: generateRescueReceiptId(),
    rescueOtp: params.rescueOtp,
    serviceName: params.serviceName,
    issueType: params.issueType ?? 'flat_tire',
    replacedParts,
    locationAddress: params.pickupAddress,
    lat: params.coord.lat,
    lng: params.coord.lng,
    mechanicName: params.mechanic.name,
    mechanicPlate: params.mechanic.licensePlate,
    mechanicPhone: params.mechanic.phone,
    mechanicRating: `${params.mechanic.rating} ★`,
    originalPrice: params.pricing.basePrice,
    discountAmount: params.pricing.discountAmount,
    promoCode: params.pricing.appliedVoucher?.code ?? null,
    nightSurcharge: params.pricing.nightSurcharge,
    extraCost: params.pricing.extraCost,
    extraItemTitle: params.pricing.extraItemTitle,
    finalPrice: params.pricing.finalPrice,
    paymentMethod: 'Tiền mặt / Chuyển khoản QR',
    completedAt: formatCompletedAtDate(),
  };
}

