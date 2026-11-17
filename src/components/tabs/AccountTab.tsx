import { ChevronRight, LogOut, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { getActiveMembershipId, getMembershipPlan } from '../../data/membershipCatalog';
import { type AuthUser, getCurrentUser, getSecuritySettings, logoutUser } from '../../services/authService';
import { DEFAULT_SAVED_ADDRESSES, DEFAULT_USER_PROFILE, loadSavedAddresses, loadUserProfile, type SavedAddressItem, saveSavedAddresses, saveUserProfile, type UserProfileData } from '../../types/profile';
import type { ActiveLocation, ActiveRescueInfo } from '../../types/rescue';
import { calculateHistoryStats, loadRescueHistory } from '../../utils/rescueHistoryLogic';
import { MembershipHubModal } from '../MembershipHubModal';
import { BiometricPinModal, type BiometricPinMode } from '../modals/BiometricPinModal';
import { SettingsModal } from '../modals/SettingsModal';
import { NotificationsModal } from '../notifications/NotificationsModal';
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

export interface AccountTabProps {
  onNavigateToActivity: () => void;
  onOpenNotifications?: () => void;
  onSelectSavedAddressToMap?: (addr: SavedAddressItem) => void;
  onTriggerSos?: (phone: string) => void;
  onOpenAuth?: () => void;
  activeLocation?: ActiveLocation | null;
  activeRescue?: ActiveRescueInfo | null;
}

export function AccountTab({
  onNavigateToActivity,
  onSelectSavedAddressToMap,
  onTriggerSos,
  onOpenAuth,
  activeLocation,
  activeRescue,
}: AccountTabProps) {
  const notif = useNotifications();
  const [profile, setProfile] = useState<UserProfileData>(loadUserProfile);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>(loadSavedAddresses);
  const [totalSaved, setTotalSaved] = useState<number>(65000);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [benefitModal, setBenefitModal] = useState<'membership' | 'tier' | null>(null);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isMembershipHubOpen, setIsMembershipHubOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [biometricModal, setBiometricModal] = useState<{ isOpen: boolean; mode: BiometricPinMode }>({ isOpen: false, mode: 'face' });

  const [secSettings, setSecSettings] = useState(getSecuritySettings);
  const [activePlanId, setActivePlanId] = useState(getActiveMembershipId);

  useEffect(() => {
    const onAuth = () => { setCurrentUser(getCurrentUser()); setProfile(loadUserProfile()); setSecSettings(getSecuritySettings()); };
    const onMem = () => setActivePlanId(getActiveMembershipId());
    window.addEventListener('motosos_auth_changed', onAuth);
    window.addEventListener('motosos_membership_changed', onMem);
    window.addEventListener('storage', onAuth);
    return () => {
      window.removeEventListener('motosos_auth_changed', onAuth);
      window.removeEventListener('motosos_membership_changed', onMem);
      window.removeEventListener('storage', onAuth);
    };
  }, []);

  useEffect(() => {
    const stats = calculateHistoryStats(loadRescueHistory());
    setTotalSaved(Math.max(65000, stats.totalSavedAmount));
  }, []);

  const handleUpdateProfile = (updated: UserProfileData) => {
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handleLogout = () => {
    logoutUser();
    onOpenAuth?.();
  };

  const faceEnrolled = typeof window !== 'undefined' && localStorage.getItem('motosos_face_enrolled') === 'true';
  const isProtected = Boolean(secSettings.pinCode || (secSettings.isBiometricEnabled && faceEnrolled));

  return (
    <div aria-label="Trang quản lý tài khoản người dùng" className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#F4F6F9] pb-24 [&::-webkit-scrollbar]:hidden">
      {/* 1. Header Khối Thông Tin Cá Nhân */}
      <section className="bg-white px-5 pt-7 pb-4 border-b border-slate-100 shadow-2xs">
        <button type="button" onClick={() => setIsEditProfileOpen(true)} className="flex w-full items-center justify-between text-left active:opacity-75 transition-opacity">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{profile.fullName}</h1>
              {currentUser?.isGuest && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Khách</span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{profile.phone} • {profile.bikeModel}</p>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <ChevronRight className="h-5 w-5" />
          </span>
        </button>
      </section>

      <div className="px-4 mt-3.5 space-y-3.5">
        <ProfileSavingsBanner totalSaved={totalSaved} />

        <ProfileShortcutGrid
          profile={profile}
          onOpenPayment={() => setIsPaymentOpen(true)}
          onOpenVehicle={() => setIsVehicleOpen(true)}
          onOpenSos={() => setIsSosOpen(true)}
        />

        <ProfileGroupSections
          onOpenMembership={() => setIsMembershipHubOpen(true)}
          onOpenTier={() => setBenefitModal('tier')}
          onNavigateToActivity={onNavigateToActivity}
          onOpenAddresses={() => setIsAddressesOpen(true)}
          onOpenNotifications={() => setIsNotifModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTerms={() => setIsTermsOpen(true)}
          activePlanName={getMembershipPlan(activePlanId).name}
          unreadCount={notif.unreadCount}
          isProtected={isProtected}
        />

        {/* Nút Đăng xuất / Đăng ký tài khoản */}
        <div className="pt-1">
          {currentUser?.isGuest ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3.5 rounded-2xl bg-[#13693E] hover:bg-[#0F5C36] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
            >
              <UserCheck className="h-4 w-4" />
              <span>Đăng nhập / Đăng ký ngay (Nhận BANMOI25)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất tài khoản</span>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <NotificationsModal isOpen={isNotifModalOpen} onClose={() => setIsNotifModalOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => { setIsSettingsOpen(false); setSecSettings(getSecuritySettings()); }} onOpenBiometric={(mode) => setBiometricModal({ isOpen: true, mode })} />
      <BiometricPinModal isOpen={biometricModal.isOpen} mode={biometricModal.mode} onClose={() => setBiometricModal({ isOpen: false, mode: 'face' })} onSuccess={() => { setBiometricModal({ isOpen: false, mode: 'face' }); setSecSettings(getSecuritySettings()); }} />
      <MembershipHubModal isOpen={isMembershipHubOpen} initialTab="my_plan" onClose={() => setIsMembershipHubOpen(false)} />
      <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <ProfileEditModal isOpen={isEditProfileOpen} profile={profile} onSave={handleUpdateProfile} onClose={() => setIsEditProfileOpen(false)} />
      <PaymentMethodModal isOpen={isPaymentOpen} currentPayment={profile.defaultPayment} onSelectPayment={(m) => handleUpdateProfile({ ...profile, defaultPayment: m })} onClose={() => setIsPaymentOpen(false)} />
      <MyVehicleModal isOpen={isVehicleOpen} profile={profile} onSaveVehicle={(v) => handleUpdateProfile({ ...profile, ...v })} onClose={() => setIsVehicleOpen(false)} />
      <EmergencyContactModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} onTriggerSos={onTriggerSos} activeLocation={activeLocation} activeRescue={activeRescue} />
      <MemberBenefitModal isOpen={benefitModal !== null} type={benefitModal ?? 'membership'} onClose={() => setBenefitModal(null)} />
      <SavedAddressesModal isOpen={isAddressesOpen} addresses={savedAddresses} onSelectAddress={(addr) => { onSelectSavedAddressToMap?.(addr); setIsAddressesOpen(false); }} onSaveAddresses={(l) => { setSavedAddresses(l); saveSavedAddresses(l); }} onClose={() => setIsAddressesOpen(false)} />
    </div>
  );
}

export const ProfileTab = AccountTab;
export default AccountTab;
