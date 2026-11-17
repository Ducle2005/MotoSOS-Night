import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DEFAULT_SAVED_ADDRESSES, DEFAULT_USER_PROFILE,
  loadSavedAddresses, loadUserProfile, saveSavedAddresses, saveUserProfile,
  type SavedAddressItem, type UserProfileData,
} from '../../types/profile';
import { calculateHistoryStats, loadRescueHistory } from '../../utils/rescueHistoryLogic';
import type { ActiveLocation, ActiveRescueInfo } from '../../types/rescue';
import { EmergencyContactModal } from '../profile/EmergencyContactModal';
import { MemberBenefitModal } from '../profile/MemberBenefitModal';
import { MyVehicleModal } from '../profile/MyVehicleModal';
import { PaymentMethodModal } from '../profile/PaymentMethodModal';
import { ProfileEditModal } from '../profile/ProfileEditModal';
import { ProfileGroupSections } from '../profile/ProfileGroupSections';
import { ProfileSavingsBanner } from '../profile/ProfileSavingsBanner';
import { ProfileShortcutGrid } from '../profile/ProfileShortcutGrid';
import { SavedAddressesModal } from '../profile/SavedAddressesModal';
import { TermsOfServiceModal } from '../TermsOfServiceModal';

interface ProfileTabProps {
  onNavigateToActivity: () => void;
  onOpenNotifications: () => void;
  onSelectSavedAddressToMap?: (addr: SavedAddressItem) => void;
  onTriggerSos?: (phone: string) => void;
  activeLocation?: ActiveLocation | null;
  activeRescue?: ActiveRescueInfo | null;
}

export function ProfileTab({
  onNavigateToActivity,
  onOpenNotifications,
  onSelectSavedAddressToMap,
  onTriggerSos,
  activeLocation,
  activeRescue,
}: ProfileTabProps) {
  const [profile, setProfile] = useState<UserProfileData>(DEFAULT_USER_PROFILE);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>(DEFAULT_SAVED_ADDRESSES);
  const [totalSaved, setTotalSaved] = useState<number>(65000);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [benefitModal, setBenefitModal] = useState<'membership' | 'tier' | null>(null);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  useEffect(() => {
    setProfile(loadUserProfile());
    setSavedAddresses(loadSavedAddresses());
    const hist = loadRescueHistory();
    const stats = calculateHistoryStats(hist);
    setTotalSaved(Math.max(65000, stats.totalSavedAmount));
  }, []);

  const handleUpdateProfile = (updated: UserProfileData) => {
    setProfile(updated);
    saveUserProfile(updated);
  };

  return (
    <div
      aria-label="Trang quản lý tài khoản người dùng"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#F4F6F9] pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {/* 1. Header Khối Thông Tin Cá Nhân */}
      <section className="bg-white px-5 pt-7 pb-4 border-b border-slate-100 shadow-2xs">
        <button
          type="button"
          onClick={() => setIsEditProfileOpen(true)}
          className="flex w-full items-center justify-between text-left active:opacity-75 transition-opacity"
        >
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{profile.fullName}</h1>
            <p className="mt-0.5 text-xs text-slate-500">{profile.phone}</p>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <ChevronRight className="h-5 w-5" />
          </span>
        </button>
      </section>

      <div className="px-4 mt-3.5 space-y-3.5">
        {/* 2. Banner Minh Họa Tiết Kiệm & Bảo Vệ */}
        <ProfileSavingsBanner totalSaved={totalSaved} />

        {/* 3. Hàng 3 Thẻ Phím Tắt Vuông */}
        <ProfileShortcutGrid
          profile={profile}
          onOpenPayment={() => setIsPaymentOpen(true)}
          onOpenVehicle={() => setIsVehicleOpen(true)}
          onOpenSos={() => setIsSosOpen(true)}
        />

        {/* 4. Thẻ Nhóm 1 & 2 */}
        <ProfileGroupSections
          onOpenMembership={() => setBenefitModal('membership')}
          onOpenTier={() => setBenefitModal('tier')}
          onNavigateToActivity={onNavigateToActivity}
          onOpenAddresses={() => setIsAddressesOpen(true)}
          onOpenNotifications={onOpenNotifications}
          onOpenTerms={() => setIsTermsOpen(true)}
        />
      </div>

      {/* Modals & Drawers */}
      <TermsOfServiceModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
      <ProfileEditModal
        isOpen={isEditProfileOpen}
        profile={profile}
        onSave={handleUpdateProfile}
        onClose={() => setIsEditProfileOpen(false)}
      />

      <PaymentMethodModal
        isOpen={isPaymentOpen}
        currentPayment={profile.defaultPayment}
        onSelectPayment={(method) => handleUpdateProfile({ ...profile, defaultPayment: method })}
        onClose={() => setIsPaymentOpen(false)}
      />

      <MyVehicleModal
        isOpen={isVehicleOpen}
        profile={profile}
        onSaveVehicle={(v) => handleUpdateProfile({ ...profile, ...v })}
        onClose={() => setIsVehicleOpen(false)}
      />

      <EmergencyContactModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onTriggerSos={onTriggerSos}
        activeLocation={activeLocation}
        activeRescue={activeRescue}
      />

      <MemberBenefitModal
        isOpen={benefitModal !== null}
        type={benefitModal ?? 'membership'}
        onClose={() => setBenefitModal(null)}
      />

      <SavedAddressesModal
        isOpen={isAddressesOpen}
        addresses={savedAddresses}
        onSelectAddress={(addr) => {
          onSelectSavedAddressToMap?.(addr);
          setIsAddressesOpen(false);
        }}
        onSaveAddresses={(list) => {
          setSavedAddresses(list);
          saveSavedAddresses(list);
        }}
        onClose={() => setIsAddressesOpen(false)}
      />
    </div>
  );
}
