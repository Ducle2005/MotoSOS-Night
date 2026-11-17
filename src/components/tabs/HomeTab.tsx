import { useEffect, useState } from 'react';
import { Bell, Crown, ScanLine, Search, User } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import type { CampaignBannerItem, PartnerPerkItem } from '../../data/homePromotions';
import { getActiveMembershipId, getMembershipPlan } from '../../data/membershipCatalog';
import { useSmoothHorizontalWheel } from '../../hooks/useSmoothHorizontalWheel';
import { profileRepo } from '../../repositories/storageRepository';
import type {
  ActiveLocation, ActiveRescueInfo, GasStation, IssueType, PoliceStation, RepairShop, SafeStation, SafeStationCategory, UserLocation,
} from '../../types/rescue';
import { ActiveRescueHomeCard } from '../ActiveRescueHomeCard';
import { MembershipHubModal } from '../MembershipHubModal';
import { HomeActionGrid } from './HomeActionGrid';
import { HomeNearbyPlacesSections } from './HomeNearbyPlacesSections';

interface HomeTabProps {
  activeLocation: ActiveLocation; userLocation: UserLocation; stations: SafeStation[]; isLoadingStations: boolean;
  openRepairShops: RepairShop[]; isLoadingShops: boolean; activeRescue?: ActiveRescueInfo | null;
  policeStations?: PoliceStation[]; gasStations?: GasStation[];
  onOpenLocationSearch: () => void; onCallMechanicNow: () => void; onOpenTrackingMap?: () => void; onOpenMechanicChat?: () => void;
  onQuickIssueSelect: (issue: IssueType) => void; onQuickCategorySelect: (category: SafeStationCategory) => void;
  onQuickSosSelect: () => void; onSelectStationCard: (stationId: string) => void; onOpenRepairShopsMap: (shopId?: string) => void;
  onRouteToPoliceStation?: (station: PoliceStation) => void; onRouteToGasStation?: (gas: GasStation) => void; onRouteToRepairShop?: (shop: RepairShop) => void;
  onTriggerDemoMechanic: () => void; onSelectCampaignBanner: (banner: CampaignBannerItem) => void; onSelectPartnerPerk: (perk: PartnerPerkItem) => void;
  onOpenNotifications: () => void; onOpenMechanicDriver?: () => void; onOpenAiChat?: () => void; isOffline?: boolean; onToggleOffline?: () => void;
  onNavigateToProfile?: () => void; onResetGps?: () => void;
}

const DISCOUNT_CARDS = [
  { id: 'gas', title: 'Giảm 15K cứu hộ hết xăng', code: 'DEMKHUYA15' as const, badge: 'Đêm khuya' },
  { id: 'new', title: 'Ưu đãi thành viên mới', code: 'BANMOI25' as const, badge: 'Chào bạn mới' },
  { id: 'safe', title: 'Giảm 20K chờ tại Trạm 24/7', code: 'ANTOAN20' as const, badge: 'Trạm an toàn' },
];

export function HomeTab({
  activeLocation, userLocation, stations, activeRescue, policeStations, gasStations, openRepairShops,
  onOpenLocationSearch, onCallMechanicNow, onOpenTrackingMap, onOpenMechanicChat,
  onQuickIssueSelect, onQuickCategorySelect, onQuickSosSelect, onSelectStationCard,
  onRouteToPoliceStation, onRouteToGasStation, onRouteToRepairShop,
  onTriggerDemoMechanic, onOpenMechanicDriver, onSelectPartnerPerk, onOpenNotifications, onOpenAiChat,
  isOffline = false, onToggleOffline, onNavigateToProfile, onResetGps,
}: HomeTabProps) {
  const { unreadCount } = useNotifications();
  const { containerRef: discountScrollRef, ...discountWheelProps } = useSmoothHorizontalWheel(activeLocation.address);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [membershipId, setMembershipId] = useState(() => getActiveMembershipId());

  useEffect(() => {
    const onMemChanged = () => setMembershipId(getActiveMembershipId());
    window.addEventListener('motosos_membership_changed', onMemChanged);
    window.addEventListener('storage', onMemChanged);
    return () => { window.removeEventListener('motosos_membership_changed', onMemChanged); window.removeEventListener('storage', onMemChanged); };
  }, []);
  const currentPlan = getMembershipPlan(membershipId);

  useEffect(() => { if (discountScrollRef.current) discountScrollRef.current.scrollLeft = 0; }, [discountScrollRef, activeLocation.address]);

  const heroAddressLabel = activeLocation.isCurrentGPS ? (userLocation.address || 'Vị trí hiện tại của bạn') : activeLocation.address;
  const profile = profileRepo.getProfile();
  const emergencyContact = profileRepo.getEmergencyContact();
  const bikeLabel = profile.licensePlate || profile.bikeModel || 'Chưa thêm xe';

  return (
    <div className="relative flex-1 min-h-full bg-[#F5F7F6] flex flex-col pb-16 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Header Xanh Ngọc Lục Bảo (#13693E) */}
      <header className="relative bg-[#13693E] text-white pt-2.5 pb-5 px-4 shrink-0 rounded-b-[24px]">
        {/* Hàng tiện ích phụ: MotoSOS, VIP, 4G, Bell, Test thợ, App Thợ */}
        <div className="flex items-center justify-between gap-1.5 pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-[16px] font-black tracking-tight text-white flex items-center gap-1">MotoSOS</h1>
            <button
              type="button"
              onClick={() => setIsMembershipModalOpen(true)}
              aria-label="Xem thẻ hội viên"
              className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-200 shadow-xs whitespace-nowrap hover:bg-amber-400/30 active:scale-95 transition-all"
            >
              <Crown className="h-2.5 w-2.5 text-amber-300" aria-hidden="true" />
              <span>{currentPlan.name}</span>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {onToggleOffline && (
              <button
                type="button" onClick={onToggleOffline} data-testid="home-network-status-btn" aria-label={isOffline ? 'Offline' : '4G'}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all active:scale-95 ${
                  isOffline ? 'bg-amber-400/25 border border-amber-300 text-amber-200' : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isOffline ? 'bg-amber-400 animate-ping' : 'bg-emerald-300'}`} />
                <span>{isOffline ? 'Offline' : '4G'}</span>
              </button>
            )}

            <button
              type="button" onClick={onOpenNotifications} data-testid="header-bell-btn" aria-label="Mở thông báo"
              className="relative w-6.5 h-6.5 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-transform active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[8.5px] font-black text-white ring-1 ring-[#13693E]">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button" onClick={onTriggerDemoMechanic} data-testid="header-demo-mechanic-btn"
              className="rounded-full bg-white/15 hover:bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap active:scale-95 transition-all"
            >
              Test thợ
            </button>

            {onOpenMechanicDriver && (
              <button
                type="button" onClick={onOpenMechanicDriver} data-testid="header-mechanic-driver-btn"
                className="rounded-full bg-white/15 hover:bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap active:scale-95 transition-all"
              >
                App Thợ
              </button>
            )}
          </div>
        </div>

        {/* Hàng 1: [Scan] [Tìm địa điểm cứu hộ] [Avatar] */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onResetGps}
            aria-label="Quét hoặc lấy lại vị trí GPS"
            className="w-10 h-10 rounded-[14px] bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 text-white transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <ScanLine className="w-5 h-5 text-white" />
          </button>

          <div
            onClick={onOpenLocationSearch}
            className="h-10 rounded-full bg-white text-slate-800 px-3.5 flex items-center gap-2 flex-1 shadow-xs cursor-pointer hover:bg-slate-50 transition-colors active:scale-[0.99]"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[13px] font-medium text-slate-400 select-none truncate">Tìm địa điểm cứu hộ</span>
          </div>

          <button
            type="button"
            onClick={onNavigateToProfile}
            aria-label="Tài khoản cá nhân"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:bg-slate-100 transition-all active:scale-95 text-[#13693E]"
          >
            <User className="w-5 h-5 text-[#13693E]" />
          </button>
        </div>

        {/* Hàng 2: ● Điểm đón: <Địa chỉ> */}
        <div
          onClick={onOpenLocationSearch}
          className="mt-2.5 px-1 flex items-center gap-1.5 cursor-pointer active:opacity-80 transition-opacity"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <span className="text-[12px] font-medium text-white/85 shrink-0">Điểm đón:</span>
          <span className="text-[12px] font-bold text-white truncate max-w-[280px]">{heroAddressLabel}</span>
        </div>
      </header>

      {/* Live Rescue Tracker (Chỉ hiện khi có đơn cứu hộ) */}
      {activeRescue && onOpenTrackingMap && (
        <div className="shrink-0 -mt-2">
          <ActiveRescueHomeCard rescue={activeRescue} onOpenTrackingMap={onOpenTrackingMap} onOpenMechanicChat={onOpenMechanicChat} />
        </div>
      )}

      {/* Khối Trắng 8 Chức Năng Cứu Hộ & Tiện Ích */}
      <div className={`bg-white rounded-t-[22px] pt-3.5 pb-3 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] ${activeRescue ? 'mt-0' : '-mt-3.5'}`}>
        <HomeActionGrid
          onQuickIssueSelect={onQuickIssueSelect} onQuickCategorySelect={onQuickCategorySelect}
          onQuickSosSelect={onQuickSosSelect} onOpenAiChat={onOpenAiChat} onOpenOffers={() => onQuickIssueSelect('out_of_fuel')}
        />
      </div>

      {/* Thân Trang Tối Giản Thoáng Mắt */}
      <div className="px-4 pt-2.5 space-y-3">
        {/* Thanh Tóm Tắt Thông Tin Siêu Mảnh */}
        <div onClick={onNavigateToProfile} className="rounded-xl bg-[#F4F7F5] border border-slate-200/50 px-3.5 py-2.5 flex items-center justify-between text-[11px] text-slate-600 cursor-pointer hover:bg-[#EAF0EC] transition-colors shadow-2xs">
          <span className="truncate">Xe: <strong className="font-extrabold text-slate-800">{bikeLabel}</strong> • Khẩn cấp: <strong className="font-extrabold text-slate-800">{emergencyContact || 'Chưa thiết lập'}</strong></span>
          <span className="font-bold text-[#13693E] shrink-0 ml-2">Thiết lập ›</span>
        </div>

        {/* Banner Gọi Thợ Ngay — Chỉ hiện khi chưa có chuyến cứu hộ */}
        {!activeRescue && (
          <div
            onClick={onCallMechanicNow}
            className="rounded-2xl bg-gradient-to-r from-[#DDF5E7] via-[#C8EED9] to-[#B2E4C8] px-4 py-3 relative overflow-hidden flex items-center justify-between shadow-xs cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div className="z-10 max-w-[64%]">
              <div className="text-[16px] font-extrabold text-slate-950 tracking-tight inline-flex items-center gap-1.5">
                <span>Gọi thợ ngay</span>
                <span className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-black leading-none">›</span>
              </div>
              <p className="text-[11.5px] font-medium text-slate-700 leading-snug mt-0.5">Thợ sửa xe gần bạn, có mặt trong vài phút</p>
            </div>

            <div className="w-20 h-20 rounded-full bg-[#13693E]/12 absolute -right-2 -bottom-3 flex items-center justify-center pointer-events-none">
              <svg className="h-12 w-14 text-[#13693E]" viewBox="0 0 80 50" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="35" r="11" strokeWidth="4.5" /><circle cx="62" cy="35" r="11" strokeWidth="4.5" />
                <path d="M18 35 L38 35 L48 20 L28 20 Z" strokeWidth="4" /><path d="M48 20 L58 14 L50 14" strokeWidth="4" />
                <path d="M28 20 L24 14 L32 14" strokeWidth="4" /><path d="M48 20 L62 35" strokeWidth="4" />
              </svg>
            </div>
          </div>
        )}

        {/* Dải Thẻ Ưu Đãi — Nền Trắng Viền Xanh Ngọc Mảnh (Zero-Lag 120fps) */}
        <div ref={discountScrollRef} {...discountWheelProps.dragHandlers} className="-mx-4 px-4 flex items-stretch justify-start gap-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden will-change-scroll [contain:paint]">
          {DISCOUNT_CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => onSelectPartnerPerk({ id: card.id, title: card.title, voucherId: card.code, description: card.title, imageUrl: '', fallbackGradient: '' })}
              className="w-[165px] shrink-0 rounded-2xl bg-white border border-emerald-600/20 p-3 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-50/20 active:scale-[0.99] transition-colors"
            >
              <div>
                <span className="text-[9.5px] font-bold text-[#13693E] bg-emerald-50 border border-emerald-600/15 px-2 py-0.5 rounded-full w-fit inline-block">{card.badge}</span>
                <p className="text-[12px] font-bold text-slate-800 leading-snug mt-1.5 line-clamp-2">{card.title}</p>
              </div>
              <p className="text-[11px] font-extrabold text-[#13693E] tracking-wider mt-2">{card.code}</p>
            </div>
          ))}
        </div>

        {/* 1 Mục Duy Nhất Có Tab Lọc: Điểm Hỗ Trợ An Toàn Gần Bạn */}
        <HomeNearbyPlacesSections
          originCoord={{ lat: activeLocation.lat, lng: activeLocation.lng }} activeAddress={activeLocation.address}
          stations={stations} policeStations={policeStations} gasStations={gasStations} openRepairShops={openRepairShops}
          onOpenTrackingMap={onOpenTrackingMap} onSelectStationCard={onSelectStationCard} onRouteToPoliceStation={onRouteToPoliceStation}
          onRouteToGasStation={onRouteToGasStation} onRouteToRepairShop={onRouteToRepairShop}
        />
      </div>

      <MembershipHubModal isOpen={isMembershipModalOpen} onClose={() => setIsMembershipModalOpen(false)} />
    </div>
  );
}
