import type { IssueType, PickupMode, VoucherId } from '../types/rescue';

export interface CampaignBannerItem {
  id: string;
  tag: string;
  tagTone: 'gold' | 'emerald' | 'amber' | 'glass';
  title: string;
  ctaLabel: string;
  imageUrl: string;
  fallbackGradient: string;
  voucherId: VoucherId | null;
  targetIssue?: IssueType;
  targetPickupMode?: PickupMode;
  targetStep: 'issue' | 'pickup';
}

export interface PartnerPerkItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  fallbackGradient: string;
  voucherId: VoucherId | null;
  targetPickupMode?: PickupMode;
}

export const CAMPAIGN_BANNERS: CampaignBannerItem[] = [
  {
    id: 'night-safe-station',
    tag: 'ĐỘC QUYỀN BAN ĐÊM',
    tagTone: 'gold',
    title: 'Giảm 20.000đ khi chờ thợ tại Trạm An Toàn',
    ctaLabel: 'Áp dụng ngay',
    imageUrl: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-slate-900 via-slate-800 to-amber-950',
    voucherId: 'ANTOAN20',
    targetPickupMode: 'safe_station',
    targetStep: 'issue',
  },
  {
    id: 'new-member-25k',
    tag: 'THÀNH VIÊN MỚI',
    tagTone: 'emerald',
    title: 'Tặng 25.000đ cho lần cứu hộ đầu tiên',
    ctaLabel: 'Nhận ưu đãi',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-slate-950 via-emerald-950 to-slate-900',
    voucherId: 'BANMOI25',
    targetStep: 'issue',
  },
  {
    id: 'fuel-rescue-night',
    tag: 'CỨU HỘ HẾT XĂNG',
    tagTone: 'amber',
    title: 'Giao 2L xăng RON 95 tận nơi chỉ từ 65.000đ',
    ctaLabel: 'Gọi ngay',
    imageUrl: 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-slate-950 via-orange-950 to-slate-900',
    voucherId: 'DEMKHUYA15',
    targetIssue: 'out_of_fuel',
    targetPickupMode: 'current_location',
    targetStep: 'pickup',
  },
  {
    id: 'verified-fixed-price',
    tag: 'AN TÂM TUYỆT ĐỐI',
    tagTone: 'glass',
    title: '100% Thợ xác minh danh tính & Báo giá cố định',
    ctaLabel: 'Xem bảng giá',
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-slate-900 via-slate-800 to-slate-950',
    voucherId: null,
    targetStep: 'issue',
  },
];

export const PARTNER_PERKS: PartnerPerkItem[] = [
  {
    id: 'perk-circle-k',
    title: 'Circle K x MotoSOS',
    description: 'Chờ thợ tại cửa hàng tiện lợi, nhận ngay ưu đãi giảm 20k.',
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=600&q=80',
    fallbackGradient: 'from-emerald-900 to-slate-900',
    voucherId: 'ANTOAN20',
    targetPickupMode: 'safe_station',
  },
  {
    id: 'perk-night-check',
    title: 'Đặc quyền Cứu Hộ Đêm',
    description: 'Miễn phí kiểm tra áp suất lốp & bình ắc quy tận nơi.',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
    fallbackGradient: 'from-slate-800 to-slate-950',
    voucherId: 'BANMOI25',
  },
  {
    id: 'perk-long-road',
    title: 'Gói An Tâm Đường Dài',
    description: 'Giảm 15k mọi khung giờ từ 22h00 – 05h00.',
    imageUrl: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=600&q=80',
    fallbackGradient: 'from-amber-900 to-slate-950',
    voucherId: 'DEMKHUYA15',
  },
];
