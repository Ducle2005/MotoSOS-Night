import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CampaignBannerItem, PartnerPerkItem } from '../data/homePromotions';
import { FALLBACK_USER_LOCATION, ISSUE_OPTIONS, MOCK_MECHANIC, MOCK_SAFE_STATIONS, VOUCHER_OPTIONS } from '../data/mockRescueData';
import type { AppTab, GasStation, IssueType, LocationSuggestion, MapLayerFilter, PickupMode, RescueReceipt, RescueStep, SafeStation, SafeStationCategory, ScopeApprovalItem, TrackingStatus, VoucherId } from '../types/rescue';
import { gasStationToSafeStation } from '../utils/gasStationApi';
import { calculateRescuePricing, isNightTimeWindow, MOCK_SCOPE_ITEMS } from '../utils/pricingAndSimLogic';
import { createRescueReceiptFromOrder, loadRescueHistory, saveRescueHistory } from '../utils/rescueHistoryLogic';
import { buildMechanicApproachCoord, getIssueLabel, getNearestSafeStation, getNextDemoTrackingStatus, resolvePickupTarget } from '../utils/rescueLogic';
import { useActivePlaceInspect } from './useActivePlaceInspect';
import { useGasStationState } from './useGasStationState';
import { useMapPinPicker } from './useMapPinPicker';
import { useMechanicSimulation } from './useMechanicSimulation';
import { usePoliceStationState } from './usePoliceStationState';
import { useRepairShopState } from './useRepairShopState';
import { useRescueGeo } from './useRescueGeo';
import { useRescueOrderNotifications } from './useRescueOrderNotifications';

export function useRescueOrderState() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [step, setStep] = useState<RescueStep>('idle');
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [pickupMode, setPickupMode] = useState<PickupMode>('current_location');
  const [selectedVoucherId, setSelectedVoucherId] = useState<VoucherId | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(MOCK_SAFE_STATIONS[0]?.id ?? null);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('searching');
  const [rescueOtp, setRescueOtp] = useState<string>('8492');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enteredFromQuickStations, setEnteredFromQuickStations] = useState(false);
  const [recenterSignal, setRecenterSignal] = useState(0);
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);
  const [activityHistory, setActivityHistory] = useState<RescueReceipt[]>(loadRescueHistory);
  const [activeStationForRoute, setActiveStationForRoute] = useState<SafeStation | null>(null);
  const [chosenGasSafeStation, setChosenGasSafeStation] = useState<SafeStation | null>(null);
  const [simulateNight, setSimulateNight] = useState(false);
  const [approvedExtra, setApprovedExtra] = useState<ScopeApprovalItem | null>(null);
  const [isScopeDrawerOpen, setIsScopeDrawerOpen] = useState(false);
  const [pendingScopeItem, setPendingScopeItem] = useState<ScopeApprovalItem>(MOCK_SCOPE_ITEMS[0]);
  const submitTimerRef = useRef<number | null>(null);

  useEffect(() => () => { if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current); }, []);
  useEffect(() => {
    if (step !== 'tracking' || trackingStatus === 'searching') { setElapsedSeconds(0); return; }
    const interval = window.setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(interval);
  }, [step, trackingStatus]);

  const handleStationsReady = useCallback((nextStations: SafeStation[]) => {
    const nearest = getNearestSafeStation(nextStations);
    setSelectedStationId((prev) => (nextStations.some((s) => s.id === prev) ? prev : (nearest?.id ?? null)));
  }, []);

  const geo = useRescueGeo(step, pickupMode, activeStationForRoute, handleStationsReady);
  const repairShops = useRepairShopState(geo.userLocation.coord);
  const gasStations = useGasStationState(geo.userLocation.coord);
  const policeStations = usePoliceStationState(geo.userLocation.coord);
  const activeInspect = useActivePlaceInspect(geo.userLocation.coord);
  const pinPicker = useMapPinPicker();

  const effectiveStations = useMemo(
    () => (chosenGasSafeStation && !geo.stations.some((s) => s.id === chosenGasSafeStation.id) ? [chosenGasSafeStation, ...geo.stations] : geo.stations),
    [geo.stations, chosenGasSafeStation],
  );
  const pickupTarget = useMemo(
    () => resolvePickupTarget(pickupMode, geo.userLocation || FALLBACK_USER_LOCATION, effectiveStations, selectedStationId),
    [pickupMode, geo.userLocation, effectiveStations, selectedStationId],
  );

  useEffect(() => { setActiveStationForRoute(pickupTarget.station); }, [pickupTarget.station]);

  const handleChangePickupMode = useCallback((mode: PickupMode) => {
    setPickupMode(mode);
    if (mode === 'safe_station') setSelectedVoucherId('ANTOAN20');
    else setSelectedVoucherId((prev) => (prev === 'ANTOAN20' ? null : prev));
  }, []);

  const issueSummary = useMemo(() => getIssueLabel(selectedIssue, ISSUE_OPTIONS, customNote), [selectedIssue, customNote]);
  const isNight = useMemo(() => isNightTimeWindow(simulateNight), [simulateNight]);
  const isRemoteArea = geo.stations.length === 0;
  const pricing = useMemo(
    () => calculateRescuePricing(selectedIssue, ISSUE_OPTIONS, pickupMode, selectedVoucherId, VOUCHER_OPTIONS, isNight, approvedExtra?.cost ?? 0, approvedExtra?.title, isRemoteArea),
    [selectedIssue, pickupMode, selectedVoucherId, isNight, approvedExtra, isRemoteArea],
  );
  const mechanicStartCoord = useMemo(() => buildMechanicApproachCoord(pickupTarget.coord), [pickupTarget.coord.lat, pickupTarget.coord.lng]);

  const notifs = useRescueOrderNotifications({ step, trackingStatus, pickupTitle: pickupTarget.title });
  const mechanicSim = useMechanicSimulation({
    step, trackingStatus, mechanicStartCoord, pickupCoord: pickupTarget.coord,
    pickupTitle: pickupTarget.title, mechanicName: MOCK_MECHANIC.name, onMechanicReply: notifs.notifyMechanicReply,
  });

  const clearOverlays = (clearGas = false) => {
    activeInspect.clearActiveRoute(); if (clearGas) setChosenGasSafeStation(null);
    repairShops.selectShop(null); gasStations.clearGasRoute(); policeStations.clearPoliceRoute();
  };

  const handleResetFlow = (returnToHome = false) => {
    if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current);
    setIsSubmitting(false); setStep('idle'); setSelectedIssue(null); setCustomNote('');
    setPickupMode('current_location'); setSelectedVoucherId(null); setTrackingStatus('searching');
    setApprovedExtra(null); setIsScopeDrawerOpen(false);
    setEnteredFromQuickStations(false); pinPicker.cancelPinPicker(); clearOverlays(true); geo.clearRoute();
    if (returnToHome) setActiveTab('home');
  };

  const handleCompleteAndLog = () => {
    const item = createRescueReceiptFromOrder({
      serviceName: issueSummary, issueType: selectedIssue, customNote,
      pickupAddress: pickupTarget.address, coord: pickupTarget.coord,
      mechanic: MOCK_MECHANIC, pricing, rescueOtp,
    });
    setActivityHistory((prev) => { const next = [item, ...prev]; saveRescueHistory(next); return next; });
    handleResetFlow(true);
  };

  const handleSelectVoucher = useCallback((vId: VoucherId | null) => {
    setSelectedVoucherId(vId); notifs.notifyVoucherApplied(vId);
  }, [notifs.notifyVoucherApplied]);

  const handleConfirmRescue = () => {
    notifs.requestPushOnceOnFirstOrder();
    setRescueOtp(Math.floor(1000 + Math.random() * 9000).toString());
    setIsSubmitting(true);
    submitTimerRef.current = window.setTimeout(() => {
      activeInspect.clearInspection(); setIsSubmitting(false); setTrackingStatus('searching'); setStep('tracking');
      notifs.notifyOrderSubmitted(issueSummary);
    }, 400);
  };

  const handleConfirmOtp = useCallback(() => {
    setTrackingStatus('repairing'); notifs.notifyOtpConfirmed(rescueOtp);
  }, [rescueOtp, notifs]);

  const handleConfirmCancelDetailed = (reason: string, feeAmount: number) => {
    if (feeAmount > 0) {
      const cancelReceipt = createRescueReceiptFromOrder({
        serviceName: `Hủy: ${issueSummary}`, issueType: selectedIssue,
        customNote: `Lý do: ${reason} (Phí xăng đêm thợ di chuyển)`,
        pickupAddress: pickupTarget.address, coord: pickupTarget.coord,
        mechanic: MOCK_MECHANIC, pricing: { ...pricing, finalPrice: feeAmount, discountAmount: 0 },
        rescueOtp,
      });
      setActivityHistory((prev) => { const next = [cancelReceipt, ...prev]; saveRescueHistory(next); return next; });
    }
    notifs.notifyOrderCancelled(feeAmount);
    handleResetFlow(true);
  };

  const handleDemoAdvance = () => {
    activeInspect.clearInspection();
    setActiveTab('map');
    if (step !== 'tracking') {
      if (!selectedIssue) setSelectedIssue('flat_tire');
      setTrackingStatus('accepted'); setStep('tracking');
      notifs.notifyMechanicAccepted();
      return;
    }
    if (trackingStatus === 'completed') return handleCompleteAndLog();
    setTrackingStatus((prev) => getNextDemoTrackingStatus(prev));
  };

  const handleOpenMapWithStation = (stationId: string) => {
    clearOverlays(false);
    const station = effectiveStations.find((s) => s.id === stationId);
    if (station) { setSelectedStationId(station.id); activeInspect.inspectAndRoutePlace({ kind: 'safe_station', station }); }
    else if (stationId) setSelectedStationId(stationId);
    setEnteredFromQuickStations(true); setPickupMode('safe_station'); setStep('pickup'); setActiveTab('map');
  };

  const handleOpenMapWithRepairShop = (shopId?: string) => {
    clearOverlays(false); setStep('idle'); repairShops.setMapFilter('repair_shops');
    const shop = shopId ? repairShops.openRepairShops.find((s) => s.id === shopId) : null;
    if (shop) activeInspect.inspectAndRoutePlace({ kind: 'repair_shop', shop });
    setActiveTab('map');
  };

  const handleChangeMapFilter = (nextFilter: MapLayerFilter) => {
    clearOverlays(false); repairShops.setMapFilter(nextFilter);
  };

  const handleOpenMapWithConvenienceStations = () => {
    clearOverlays(false); repairShops.setMapFilter('safe_stations'); setStep('idle'); setActiveTab('map');
    const target = geo.stations.find((s) => s.category === 'convenience' || !s.category) || geo.stations[0];
    if (target) { setSelectedStationId(target.id); activeInspect.inspectAndRoutePlace({ kind: 'safe_station', station: target }); }
  };

  const handlePickCurrentWithDiscount = useCallback(() => { setPickupMode('current_location'); setSelectedVoucherId('ANTOAN20'); }, []);

  const handlePickSafeStationForRescue = (station: SafeStation) => {
    setSelectedStationId(station.id); setPickupMode('safe_station'); handleSelectVoucher('ANTOAN20'); setEnteredFromQuickStations(true); setStep('pickup');
  };
  const handleSelectGasStationForRescue = (station: GasStation) => {
    const safe = gasStationToSafeStation(station);
    setChosenGasSafeStation(safe); setSelectedStationId(safe.id); setPickupMode('safe_station'); handleSelectVoucher('ANTOAN20'); setEnteredFromQuickStations(true); setStep('pickup');
  };
  const handleQuickCategory = (category: SafeStationCategory) => {
    clearOverlays(false);
    if (category === 'gas_station') repairShops.setMapFilter('gas_stations');
    else if (category === 'police') repairShops.setMapFilter('police_stations');
    else repairShops.setMapFilter('safe_stations');
    setStep('idle'); setActiveTab('map');
  };
  const handleQuickIssue = (issue: IssueType) => {
    clearOverlays(false); setSelectedIssue(issue); setEnteredFromQuickStations(false); setStep('issue'); setActiveTab('map');
  };
  const handleQuickSos = () => {
    clearOverlays(false); setSelectedIssue('other'); setCustomNote('SOS khẩn cấp ban đêm');
    handleChangePickupMode('current_location'); setEnteredFromQuickStations(false);
    setStep('pickup'); setActiveTab('map'); notifs.notifySosActivated(geo.userLocation.address);
  };
  const handleMechanicArrived = useCallback(() => setTrackingStatus((prev) => (prev === 'accepted' ? 'arrived' : prev)), []);
  const handleOpenScopeDrawer = useCallback(() => {
    setPendingScopeItem(MOCK_SCOPE_ITEMS[Math.floor(Math.random() * MOCK_SCOPE_ITEMS.length)]);
    setIsScopeDrawerOpen(true);
  }, []);
  const handleApproveScope = useCallback((item: ScopeApprovalItem) => {
    setApprovedExtra(item); setIsScopeDrawerOpen(false); notifs.notifyScopeApproved(item);
  }, [notifs]);
  const handleRejectScope = useCallback(() => setIsScopeDrawerOpen(false), []);
  const handleStartMapPinPicker = () => { clearOverlays(true); setStep('idle'); pinPicker.startPinPicker(geo.userLocation.coord, geo.userLocation.address); setIsLocationSearchOpen(false); setActiveTab('map'); };
  const handleConfirmMapPinPicker = () => { const { coord, address } = pinPicker.finishPinPicker(); clearOverlays(true); geo.confirmPinnedLocation(coord, address); };
  const handleSelectSearchLocation = (item: LocationSuggestion) => { pinPicker.cancelPinPicker(); clearOverlays(true); geo.selectSearchedLocation(item); };
  const handleResetToGpsLocation = async () => { pinPicker.cancelPinPicker(); clearOverlays(true); await geo.useCurrentGpsLocation(); };
  const applyPromotion = (voucherId: VoucherId | null, targetMode?: PickupMode, targetIssue?: IssueType, targetStep: RescueStep = 'issue') => {
    clearOverlays(false); setSelectedIssue(targetIssue ?? null); setPickupMode(targetMode ?? 'current_location'); setSelectedVoucherId(voucherId);
    setEnteredFromQuickStations(false); setStep(targetStep); setActiveTab('map'); notifs.notifyVoucherApplied(voucherId);
  };

  return {
    activeTab, setActiveTab, step, setStep, selectedIssue, setSelectedIssue, customNote, setCustomNote,
    pickupMode, handleChangePickupMode, selectedVoucherId, handleSelectVoucher, selectedStationId, setSelectedStationId,
    trackingStatus, setTrackingStatus, rescueOtp, setRescueOtp, elapsedSeconds, isSubmitting, enteredFromQuickStations, setEnteredFromQuickStations,
    isLocationSearchOpen, setIsLocationSearchOpen, recenterSignal, triggerRecenter: () => setRecenterSignal((c) => c + 1),
    activityHistory, geo, repairShops, gasStations, policeStations, activeInspect, pinPicker, effectiveStations, pickupTarget, issueSummary, pricing, mechanicSim,
    simulateNight, handleToggleNight: () => setSimulateNight((p) => !p), approvedExtra, isScopeDrawerOpen, pendingScopeItem,
    handleOpenScopeDrawer, handleCloseScopeDrawer: () => setIsScopeDrawerOpen(false), handleApproveScope, handleRejectScope,
    handleResetFlow, handleCompleteAndLog, handleConfirmRescue, handleConfirmOtp, handleConfirmCancelDetailed, handleDemoAdvance,
    handleMechanicApproaching: notifs.notifyMechanicApproaching, handleMechanicArrived, handleOpenMapWithStation, handleOpenMapWithRepairShop,
    handleChangeMapFilter, handleSelectGasStationForRescue, handlePickSafeStationForRescue, handlePickCurrentWithDiscount, isRemoteArea, handleQuickCategory, handleQuickIssue, handleQuickSos,
    handleStartMapPinPicker, handleConfirmMapPinPicker, handleSelectSearchLocation, handleResetToGpsLocation,
    handleSelectCampaignBanner: (b: CampaignBannerItem) => applyPromotion(b.voucherId, b.targetPickupMode, b.targetIssue, b.targetStep),
    handleSelectPartnerPerk: (p: PartnerPerkItem) => applyPromotion(p.voucherId, p.targetPickupMode, undefined, 'issue'),
  };
}
