import { useEffect, useMemo, useState } from 'react';
import { AiMechanicChatModal } from './components/AiMechanicChatModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { SplashScreen } from './components/SplashScreen';
import { BottomNavBar } from './components/BottomNavBar';
import { MechanicDriverModal } from './components/MechanicDriverModal';
import { LocationSearchModal } from './components/modals/LocationSearchModal';
import { FloatingPushBanner } from './components/notifications/FloatingPushBanner';
import { NotificationCenterModal } from './components/notifications/NotificationCenterModal';
import { ActivityTab } from './components/tabs/ActivityTab';
import { HomeTab } from './components/tabs/HomeTab';
import { MapTabView } from './components/tabs/MapTabView';
import { AccountTab } from './components/tabs/AccountTab';
import { SafetyTab } from './components/tabs/SafetyTab';
import { useNotifications } from './context/NotificationContext';
import { MOCK_MECHANIC } from './data/mockRescueData';
import { useLiveDispatch } from './hooks/useLiveDispatch';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useRescueOrderState } from './hooks/useRescueOrderState';
import { getCurrentUser, type AuthUser } from './services/authService';
import { type DiagnosticServiceId, mapDiagnosticToIssueType } from './services/geminiMechanicService';
import type { AppNotification } from './types/notification';
import type { ActiveRescueInfo } from './types/rescue';

export default function App() {
  const s = useRescueOrderState();
  const notif = useNotifications();
  const net = useNetworkStatus({ activeLocation: s.geo.userLocation, stations: s.effectiveStations });
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);

  useEffect(() => {
    const onAuth = () => setCurrentUser(getCurrentUser());
    window.addEventListener('motosos_auth_changed', onAuth);
    window.addEventListener('storage', onAuth);
    return () => {
      window.removeEventListener('motosos_auth_changed', onAuth);
      window.removeEventListener('storage', onAuth);
    };
  }, []);

  const live = useLiveDispatch({
    onStatusChange: (st) => s.setTrackingStatus(st),
    onRehydrate: (d) => { s.setStep('tracking'); s.setTrackingStatus(d.trackingStatus); if (d.otpCode) s.setRescueOtp(d.otpCode); },
  });

  const activeRescue: ActiveRescueInfo | null = useMemo(() => {
    if (s.step !== 'tracking' || (s.trackingStatus !== 'accepted' && s.trackingStatus !== 'arrived' && s.trackingStatus !== 'repairing')) return null;
    const mechanic = live.isLiveMode && live.liveMechanic ? live.liveMechanic : MOCK_MECHANIC;
    const etaMinutes = live.isLiveMode && live.liveEta ? live.liveEta : Math.max(1, s.mechanicSim.liveEtaMinutes);
    const otpCode = live.isLiveMode && live.liveOtp ? live.liveOtp : s.rescueOtp;
    return {
      status: s.trackingStatus === 'accepted' ? 'en_route' : 'arrived',
      etaMinutes, mechanic, otpCode, serviceName: s.issueSummary,
      finalPrice: s.pricing.finalPrice, pickupAddress: s.pickupTarget.address, elapsedSeconds: s.elapsedSeconds,
    };
  }, [s.step, s.trackingStatus, s.mechanicSim.liveEtaMinutes, s.rescueOtp, s.issueSummary, s.pricing.finalPrice, s.pickupTarget.address, s.elapsedSeconds, live.isLiveMode, live.liveMechanic, live.liveEta, live.liveOtp]);

  useEffect(() => {
    if (live.isLiveMode || s.step !== 'tracking' || s.trackingStatus !== 'accepted') return;
    const startMs = s.mechanicSim.routeStartTimeMs ?? performance.now();
    const interval = window.setInterval(() => {
      const elapsed = Math.max(0, performance.now() - startMs);
      const progress = Math.min(1, elapsed / 50_000);
      s.mechanicSim.setLiveEtaMinutes(Math.max(1, Math.ceil(s.mechanicSim.initialEtaMinutes * (1 - progress))));
      if (progress >= 1) s.handleMechanicArrived();
    }, 1000);
    return () => window.clearInterval(interval);
  }, [live.isLiveMode, s.step, s.trackingStatus, s.mechanicSim.routeStartTimeMs, s.mechanicSim.initialEtaMinutes, s.handleMechanicArrived]);

  const handleAiOrderService = (serviceId: DiagnosticServiceId) => {
    s.setSelectedIssue(mapDiagnosticToIssueType(serviceId));
    s.repairShops.selectShop(null); s.setEnteredFromQuickStations(false);
    s.setStep('pickup'); s.setActiveTab('map'); setIsAiChatOpen(false);
  };
  const handleOpenNotificationItem = (item: AppNotification) => {
    notif.markAsRead(item.id); notif.dismissBanner();
    setIsNotificationCenterOpen(false); s.setActiveTab(item.targetTab);
  };
  const handleOrderRescue = () => {
    if (live.isLiveDispatchEnabled) {
      live.startLiveRescue({
        serviceType: s.selectedIssue || 'other', serviceName: s.issueSummary, basePrice: s.pricing.basePrice,
        finalPrice: s.pricing.finalPrice, pickupAddress: s.pickupTarget.address, pickupLat: s.pickupTarget.coord.lat, pickupLng: s.pickupTarget.coord.lng,
      }).catch(() => {});
    }
    s.handleConfirmRescue();
  };
  const handleTriggerDemo = () => { live.setIsLiveMode(false); s.handleDemoAdvance(); };
  const blockCancelIfArrived = () => {
    if (activeRescue?.status === 'arrived' || s.trackingStatus === 'arrived') {
      notif.triggerNotification({ title: 'Không thể hủy đơn', message: 'Không thể hủy vì kỹ thuật viên đã tới điểm hẹn', type: 'rescue', targetTab: 'map' });
      return true;
    }
    return false;
  };

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-slate-900">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden border-x border-slate-200 bg-[#F8FAFC] shadow-2xl">
        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : !currentUser ? (
          <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />
        ) : (
          <>
            <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              {s.activeTab === 'home' && (
                <HomeTab
                  activeLocation={s.geo.activeLocation} userLocation={s.geo.userLocation} stations={s.geo.stations}
                  isLoadingStations={s.geo.isLoadingStations} openRepairShops={s.repairShops.openRepairShops} isLoadingShops={s.repairShops.isLoadingShops}
                  policeStations={s.policeStations.policeStations} gasStations={s.gasStations.gasStations}
                  activeRescue={activeRescue} onOpenTrackingMap={() => s.setActiveTab('map')} onOpenMechanicChat={() => s.setActiveTab('map')}
                  onOpenLocationSearch={() => s.setIsLocationSearchOpen(true)}
                  onCallMechanicNow={() => { s.repairShops.selectShop(null); s.setEnteredFromQuickStations(false); s.setStep('issue'); s.setActiveTab('map'); }}
                  onQuickIssueSelect={s.handleQuickIssue} onQuickCategorySelect={s.handleQuickCategory} onQuickSosSelect={s.handleQuickSos}
                  onSelectStationCard={s.handleOpenMapWithStation} onOpenRepairShopsMap={s.handleOpenMapWithRepairShop} onTriggerDemoMechanic={handleTriggerDemo}
                  onRouteToPoliceStation={(pol) => { s.activeInspect.inspectAndRoutePlace({ kind: 'police_station', policeStation: pol }); s.setActiveTab('map'); }}
                  onRouteToGasStation={(gas) => { s.activeInspect.inspectAndRoutePlace({ kind: 'gas_station', gasStation: gas }); s.setActiveTab('map'); }}
                  onRouteToRepairShop={(shop) => { s.activeInspect.inspectAndRoutePlace({ kind: 'repair_shop', shop }); s.setActiveTab('map'); }}
                  onOpenMechanicDriver={() => setIsDriverModalOpen(true)}
                  onSelectCampaignBanner={s.handleSelectCampaignBanner} onSelectPartnerPerk={s.handleSelectPartnerPerk}
                  onNavigateToProfile={() => s.setActiveTab('profile')} onResetGps={s.handleResetToGpsLocation}
                  onOpenNotifications={() => setIsNotificationCenterOpen(true)} onOpenAiChat={() => setIsAiChatOpen(true)}
                  isOffline={net.isOffline} onToggleOffline={net.toggleSimulatedOffline}
                />
              )}

              <div className={`flex min-h-0 flex-1 flex-col ${s.step === 'idle' && !s.activeInspect.inspectedPlace && s.repairShops.mapFilter === 'all' ? 'pb-16' : ''} ${s.activeTab === 'map' ? 'relative z-10 opacity-100 pointer-events-auto visible' : 'absolute inset-0 z-0 opacity-0 pointer-events-none invisible'}`}>
                <MapTabView
                  isMapTabActive={s.activeTab === 'map'} onOpenLocationSearch={() => s.setIsLocationSearchOpen(true)} userLocation={s.geo.userLocation} stations={s.effectiveStations}
                  openRepairShops={s.repairShops.openRepairShops} gasStations={s.gasStations.gasStations} policeStations={s.policeStations.policeStations}
                  selectedDestination={s.activeInspect.selectedDestination} activeRouteGeoJson={s.activeInspect.activeRouteGeoJson} onClearActiveRoute={s.activeInspect.clearActiveRoute}
                  mapFilter={s.repairShops.mapFilter} selectedStationId={s.selectedStationId} selectedPoliceStationId={s.policeStations.selectedPoliceStationId}
                  inspectedPlace={s.activeInspect.inspectedPlace} inspectRoute={s.activeInspect.inspectRoute} inspectRouteSummary={s.activeInspect.inspectRouteSummary}
                  isLoadingInspectRoute={s.activeInspect.isLoadingInspectRoute} selectedGasStationId={s.gasStations.selectedGasStationId}
                  gasRoute={s.gasStations.gasRoute} policeRoute={s.policeStations.policeRoute} isLoadingGasStations={s.gasStations.isLoadingGasStations}
                  isLoadingGasRoute={s.gasStations.isLoadingGasRoute} isLoadingPoliceStations={s.policeStations.isLoadingPoliceStations} isLoadingPoliceRoute={s.policeStations.isLoadingPoliceRoute}
                  pickupMode={s.pickupMode} pickupCoord={s.pickupTarget.coord} pickupTitle={s.pickupTarget.title} pickupAddress={s.pickupTarget.address}
                  walkingRoute={s.geo.walkingRoute} routeSummary={s.geo.routeSummary} isLoadingRoute={s.geo.isLoadingRoute} isSubmitting={s.isSubmitting}
                  step={s.step} trackingStatus={s.trackingStatus} selectedIssue={s.selectedIssue} customNote={s.customNote}
                  issueSummary={s.issueSummary} pricing={s.pricing} selectedVoucherId={s.selectedVoucherId}
                  mechanicRoute={s.mechanicSim.mechanicRoute} routeStartTimeMs={s.mechanicSim.routeStartTimeMs}
                  initialEtaMinutes={s.mechanicSim.initialEtaMinutes} liveEtaMinutes={s.mechanicSim.liveEtaMinutes}
                  chatMessages={s.mechanicSim.chatMessages} isMechanicTyping={s.mechanicSim.isMechanicTyping}
                  recenterSignal={s.recenterSignal} enteredFromQuickStations={s.enteredFromQuickStations}
                  simulateNight={s.simulateNight} onToggleNight={s.handleToggleNight}
                  isScopeDrawerOpen={s.isScopeDrawerOpen} pendingScopeItem={s.pendingScopeItem}
                  onOpenScopeApproval={s.handleOpenScopeDrawer} onCloseScopeDrawer={s.handleCloseScopeDrawer}
                  onApproveScope={s.handleApproveScope} onRejectScope={s.handleRejectScope}
                  onSelectStation={s.setSelectedStationId} onInspectPlace={s.activeInspect.inspectAndRoutePlace}
                  onClearInspection={s.activeInspect.clearInspection} onChangeMapFilter={s.handleChangeMapFilter}
                  onSelectGasStation={s.gasStations.setSelectedGasStationId} onDrawGasRoute={(gas) => s.activeInspect.inspectAndRoutePlace({ kind: 'gas_station', gasStation: gas })}
                  onPickGasStationForRescue={s.handleSelectGasStationForRescue} onSelectPoliceStation={s.policeStations.setSelectedPoliceStationId}
                  onDrawPoliceRoute={(pol) => s.activeInspect.inspectAndRoutePlace({ kind: 'police_station', policeStation: pol })} onPickSafeStationForRescue={s.handlePickSafeStationForRescue}
                  onSelectVoucher={s.handleSelectVoucher} onEtaMinuteChange={s.mechanicSim.setLiveEtaMinutes}
                  onMechanicApproaching={s.handleMechanicApproaching} onMechanicArrived={s.handleMechanicArrived}
                  onSendChatMessage={(msg) => { if (live.isLiveMode) live.sendChatMessage(msg); s.mechanicSim.sendChatMessage(msg); }}
                  onBackToHome={() => s.setActiveTab('home')} onDemoAdvance={handleTriggerDemo} onRecenter={s.triggerRecenter}
                  onStartOrder={() => { s.activeInspect.clearInspection(); s.setEnteredFromQuickStations(false); s.setStep('issue'); }}
                  onOpenSafeStations={() => s.handleOpenMapWithStation(s.selectedStationId ?? '')}
                  onSelectIssue={s.setSelectedIssue} onChangeNote={s.setCustomNote} onChangeMode={s.handleChangePickupMode}
                  onSetStep={s.setStep} onConfirmRescue={handleOrderRescue} onCancelOrder={() => { if (blockCancelIfArrived()) return; if (live.isLiveMode) live.cancelLiveRescue(); s.handleResetFlow(false); }}
                  onCompleteOrder={() => { if (live.isLiveMode) live.completeLiveRescue(); s.handleCompleteAndLog(); }}
                  rescueOtp={live.isLiveMode && live.liveOtp ? live.liveOtp : s.rescueOtp} elapsedSeconds={s.elapsedSeconds}
                  onConfirmOtp={() => { if (live.isLiveMode) live.completeLiveRescue(); s.handleConfirmOtp(); }}
                  onConfirmCancelDetailed={(r, f) => { if (blockCancelIfArrived()) return; if (live.isLiveMode) live.cancelLiveRescue(r, f); s.handleConfirmCancelDetailed(r, f); }}
                  onOpenAiChat={() => setIsAiChatOpen(true)} isOffline={net.isOffline} onToggleOffline={net.toggleSimulatedOffline}
                  onPickCurrentWithDiscount={s.handlePickCurrentWithDiscount}
                  pinPicker={{
                    isActive: s.pinPicker.isPinPickerMode, isDragging: s.pinPicker.isPinDragging,
                    coord: s.pinPicker.pinnedCoord, address: s.pinPicker.pinnedAddress, isResolving: s.pinPicker.isResolvingPin,
                    onMoveStart: s.pinPicker.handlePinMoveStart, onMoveEnd: s.pinPicker.handlePinMoveEnd,
                    onConfirm: s.handleConfirmMapPinPicker, onCancel: s.pinPicker.cancelPinPicker,
                  }}
                />
              </div>

              {s.activeTab === 'activity' && (
                <ActivityTab
                  step={s.step} trackingStatus={s.trackingStatus} activeIssueLabel={s.issueSummary} activePickupAddress={s.pickupTarget.address}
                  mechanic={{ ...(live.isLiveMode && live.liveMechanic ? live.liveMechanic : MOCK_MECHANIC), etaMinutes: Math.max(1, live.isLiveMode && live.liveEta ? live.liveEta : s.mechanicSim.liveEtaMinutes) }}
                  history={s.activityHistory} onOpenMapTracking={() => s.setActiveTab('map')} onTriggerDemoAdvance={handleTriggerDemo}
                  onStartNewRescue={(issueType) => { if (issueType) s.setSelectedIssue(issueType); s.setStep('issue'); s.setActiveTab('map'); }}
                />
              )}

              {s.activeTab === 'safety' && (
                <SafetyTab
                  activeLocation={s.geo.activeLocation} stations={s.effectiveStations} gasStations={s.gasStations.gasStations} policeStations={s.policeStations.policeStations}
                  onRouteToStation={s.handleOpenMapWithStation} onRouteToGasStation={(g) => { s.activeInspect.inspectAndRoutePlace({ kind: 'gas_station', gasStation: g }); s.setActiveTab('map'); }}
                  onRouteToPoliceStation={(p) => { s.activeInspect.inspectAndRoutePlace({ kind: 'police_station', policeStation: p }); s.setActiveTab('map'); }}
                  onPickStationForRescue={s.handlePickSafeStationForRescue} onPickGasForRescue={s.handleSelectGasStationForRescue} onTriggerSos={s.handleQuickSos}
                />
              )}

              {s.activeTab === 'profile' && (
                <AccountTab
                  onNavigateToActivity={() => s.setActiveTab('activity')} onOpenNotifications={() => setIsNotificationCenterOpen(true)}
                  activeLocation={s.geo.activeLocation} activeRescue={activeRescue} onOpenAuth={() => setCurrentUser(null)}
                  onSelectSavedAddressToMap={(addr) => {
                    s.handleSelectSearchLocation({ id: addr.id, addressLine1: addr.label, addressLine2: addr.address, fullAddress: addr.address, lat: addr.lat, lng: addr.lng, distanceMeters: 0 });
                    s.setActiveTab('map');
                  }}
                  onTriggerSos={s.handleQuickSos}
                />
              )}
            </main>

            {(s.activeTab !== 'map' || (s.step === 'idle' && !s.activeInspect.inspectedPlace && s.repairShops.mapFilter === 'all')) && (
              <BottomNavBar activeTab={s.activeTab} hasActiveOrder={s.step !== 'idle'} onSelectTab={s.setActiveTab} />
            )}

            <LocationSearchModal isOpen={s.isLocationSearchOpen} activeLocation={s.geo.activeLocation} isLocatingGps={s.geo.isLocatingGps} onSelectSuggestion={s.handleSelectSearchLocation} onUseCurrentGps={s.handleResetToGpsLocation} onStartMapPinPicker={s.handleStartMapPinPicker} onClose={() => s.setIsLocationSearchOpen(false)} />
            <FloatingPushBanner banner={notif.activeBanner} isMapTab={s.activeTab === 'map'} isTrackingMechanic={s.step === 'tracking' && s.trackingStatus === 'accepted' && s.activeTab !== 'home'} mechanicEta={Math.max(1, live.isLiveMode && live.liveEta ? live.liveEta : s.mechanicSim.liveEtaMinutes)} onDismiss={notif.dismissBanner} onSelect={handleOpenNotificationItem} onOpenTracking={() => s.setActiveTab('map')} />
            <NotificationCenterModal isOpen={isNotificationCenterOpen} notifications={notif.notifications} unreadCount={notif.unreadCount} permission={notif.permission} isDevicePushEnabled={notif.isDevicePushEnabled} onToggleDevicePush={() => void notif.toggleDevicePush()} onMarkAllRead={notif.markAllAsRead} onSelectNotification={handleOpenNotificationItem} onClose={() => setIsNotificationCenterOpen(false)} />
            <AiMechanicChatModal isOpen={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} onSelectServiceAndOrder={handleAiOrderService} />
            <MechanicDriverModal isOpen={isDriverModalOpen} onClose={() => setIsDriverModalOpen(false)} />
          </>
        )}
      </div>
    </div>
  );
}
