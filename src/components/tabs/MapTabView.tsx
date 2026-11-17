import { useEffect, useState } from 'react';
import { MOCK_MECHANIC, QUICK_CHAT_SUGGESTIONS, VOUCHER_OPTIONS } from '../../data/mockRescueData';
import type { RouteSummaryInfo } from '../../hooks/useActivePlaceInspect';
import type { ChatMessage, GasStation, GeoCoord, GeoJsonLineString, InspectedPlace, IssueType, MapLayerFilter, OrderPricing, PickupMode, PoliceStation, RepairShop, RescueStep, SafeStation, ScopeApprovalItem, SelectedDestination, TrackingStatus, UserLocation, VoucherId } from '../../types/rescue';
import { MOCK_SCOPE_ITEMS } from '../../utils/pricingAndSimLogic';
import { BottomSheetShell } from '../BottomSheetShell';
import { OfflineCompassCard } from '../OfflineCompassCard';
import { OfflineRescueBanner } from '../OfflineRescueBanner';
import { RescueMap } from '../RescueMap';
import { ScopeApprovalDrawer } from '../ScopeApprovalDrawer';
import { TopOverlayBar } from '../TopOverlayBar';
import { MapFilterChips } from '../map/MapFilterChips';
import { UserSafeRouteBanner } from '../map/UserSafeRouteBanner';
import { SOSModal } from '../modals/SOSModal';
import { MechanicChatDrawer } from '../steps/MechanicChatDrawer';
import { VoucherDrawerModal } from '../steps/VoucherDrawerModal';
import { MapBottomSheetContent } from './MapBottomSheetContent';

interface MapTabViewProps {
  userLocation: UserLocation; stations: SafeStation[]; openRepairShops: RepairShop[]; gasStations: GasStation[]; policeStations: PoliceStation[]; mapFilter: MapLayerFilter;
  selectedDestination?: SelectedDestination | null; activeRouteGeoJson?: GeoJsonLineString | null; onClearActiveRoute?: () => void;
  selectedStationId: string | null; selectedPoliceStationId: string | null; inspectedPlace: InspectedPlace | null; inspectRoute: GeoJsonLineString | null;
  inspectRouteSummary: RouteSummaryInfo | null; isLoadingInspectRoute: boolean; selectedGasStationId: string | null; gasRoute: GeoJsonLineString | null; policeRoute: GeoJsonLineString | null;
  isLoadingGasStations: boolean; isLoadingGasRoute: boolean; isLoadingPoliceStations: boolean; isLoadingPoliceRoute: boolean;
  pickupMode: PickupMode; pickupCoord: GeoCoord; pickupTitle: string; pickupAddress: string;
  walkingRoute: GeoJsonLineString | null; routeSummary: { distanceMeters: number; durationMinutes: number } | null; isLoadingRoute: boolean; isSubmitting: boolean;
  step: RescueStep; trackingStatus: TrackingStatus; selectedIssue: IssueType | null; customNote: string; issueSummary: string; pricing: OrderPricing; selectedVoucherId: VoucherId | null;
  mechanicRoute: GeoJsonLineString | null; routeStartTimeMs: number | null; initialEtaMinutes: number; liveEtaMinutes: number; chatMessages: ChatMessage[]; isMechanicTyping: boolean; recenterSignal: number; enteredFromQuickStations: boolean;
  isOffline?: boolean; onToggleOffline?: () => void;
  simulateNight?: boolean; onToggleNight?: () => void;
  isScopeDrawerOpen?: boolean; pendingScopeItem?: ScopeApprovalItem | null;
  onOpenScopeApproval?: () => void; onCloseScopeDrawer?: () => void;
  onApproveScope?: (item: ScopeApprovalItem) => void; onRejectScope?: () => void;
  onSelectStation: (id: string) => void; onInspectPlace: (place: InspectedPlace) => void; onClearInspection: () => void; onChangeMapFilter: (filter: MapLayerFilter) => void;
  onSelectGasStation: (stationId: string | null) => void; onDrawGasRoute: (station: GasStation) => void; onPickGasStationForRescue: (station: GasStation) => void;
  onSelectPoliceStation: (stationId: string | null) => void; onDrawPoliceRoute: (station: PoliceStation) => void; onPickSafeStationForRescue: (station: SafeStation) => void;
  onSelectVoucher: (id: VoucherId | null) => void; onEtaMinuteChange: (etaMinutes: number) => void; onMechanicApproaching?: () => void; onMechanicArrived: () => void;
  onSendChatMessage: (text: string) => void; onBackToHome: () => void; onDemoAdvance: () => void; onRecenter: () => void; onStartOrder: () => void; onOpenSafeStations: () => void;
  onSelectIssue: (issue: IssueType) => void; onChangeNote: (note: string) => void; onChangeMode: (mode: PickupMode) => void; onSetStep: (step: RescueStep) => void;
  onConfirmRescue: () => void; onCancelOrder: () => void; onCompleteOrder: () => void; onOpenLocationSearch?: () => void; onOpenAiChat?: () => void;
  rescueOtp: string; elapsedSeconds: number; onConfirmOtp: () => void; onConfirmCancelDetailed?: (reason: string, feeAmount: number) => void;
  onPickCurrentWithDiscount?: () => void;
  isMapTabActive?: boolean;
  pinPicker: {
    isActive: boolean; isDragging: boolean; coord: GeoCoord; address: string; isResolving: boolean;
    onMoveStart: () => void; onMoveEnd: (coord: GeoCoord) => void; onConfirm: () => void; onCancel: () => void;
  };
}

export function MapTabView(props: MapTabViewProps) {
  const [isVoucherDrawerOpen, setIsVoucherDrawerOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [zoomSafeRouteSignal, setZoomSafeRouteSignal] = useState(0);
  const { step, trackingStatus, isOffline } = props;

  useEffect(() => {
    if (step !== 'pickup') setIsVoucherDrawerOpen(false);
    if (step !== 'tracking' || (trackingStatus !== 'accepted' && trackingStatus !== 'arrived' && trackingStatus !== 'repairing')) {
      setIsChatDrawerOpen(false);
    }
  }, [step, trackingStatus]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <RescueMap
        userLocation={props.userLocation} stations={props.stations} openRepairShops={props.openRepairShops}
        gasStations={props.gasStations} policeStations={props.policeStations}
        selectedDestination={props.selectedDestination}
        selectedStationId={props.selectedStationId}
        selectedPoliceStationId={props.selectedPoliceStationId}
        inspectedPlace={props.inspectedPlace}
        activeRouteGeoJson={props.activeRouteGeoJson ?? props.inspectRoute}
        inspectRoute={props.inspectRoute}
        mapFilter={props.mapFilter} pickupMode={props.pickupMode} pickupCoord={props.pickupCoord}
        walkingRoute={props.walkingRoute} gasRoute={props.gasRoute} policeRoute={props.policeRoute} mechanicRoute={props.mechanicRoute}
        routeStartTimeMs={props.routeStartTimeMs} initialEtaMinutes={props.initialEtaMinutes} step={step} trackingStatus={trackingStatus}
        mechanic={MOCK_MECHANIC} recenterSignal={props.recenterSignal} zoomSafeRouteSignal={zoomSafeRouteSignal}
        isPinPickerMode={props.pinPicker.isActive} isPinDragging={props.pinPicker.isDragging}
        isMapTabActive={props.isMapTabActive}
        onSelectStation={(id) => { props.onSelectStation(id); if (step === 'pickup') props.onChangeMode('safe_station'); }}
        onInspectPlace={props.onInspectPlace} onSelectGasStation={props.onSelectGasStation} onSelectPoliceStation={props.onSelectPoliceStation}
        onPinMoveStart={props.pinPicker.onMoveStart} onPinMoveEnd={props.pinPicker.onMoveEnd} onEtaMinuteChange={props.onEtaMinuteChange}
        onMechanicApproaching={props.onMechanicApproaching} onMechanicArrived={props.onMechanicArrived}
      />

      <TopOverlayBar
        step={step} trackingStatus={trackingStatus} isOffline={isOffline}
        onToggleOffline={props.onToggleOffline} onBackToHome={props.onBackToHome} onDemoAdvance={props.onDemoAdvance}
        onOpenScopeApproval={props.onOpenScopeApproval}
      />

      {isOffline && (
        <div className="pointer-events-none absolute inset-x-0 top-[52px] z-30">
          <OfflineRescueBanner
            isOffline={isOffline}
            cachedLocation={{ lat: props.userLocation.coord.lat, lng: props.userLocation.coord.lng, address: props.userLocation.address }}
            selectedService={props.issueSummary}
            onRetryConnection={props.onToggleOffline || (() => {})}
          />
        </div>
      )}

      {isOffline && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center pt-14 pb-44">
          <OfflineCompassCard
            lat={props.userLocation.coord.lat}
            lng={props.userLocation.coord.lng}
            address={props.userLocation.address}
          />
        </div>
      )}

      {!props.pinPicker.isActive && step !== 'tracking' && !isOffline && (
        <MapFilterChips
          activeFilter={props.mapFilter} openShopCount={props.openRepairShops.length} gasStationCount={props.gasStations.length}
          policeStationCount={props.policeStations.length} stationCount={props.stations.length} onSelectFilter={props.onChangeMapFilter}
        />
      )}

      <BottomSheetShell
        step={step}
        floatingTopSlot={
          props.activeRouteGeoJson && props.selectedDestination && props.inspectRouteSummary ? (
            <UserSafeRouteBanner
              title={props.selectedDestination.title}
              distanceMeters={props.inspectRouteSummary.distanceMeters}
              durationMinutes={props.inspectRouteSummary.durationMinutes}
              instruction={props.inspectRouteSummary.instruction}
              onZoomFit={() => setZoomSafeRouteSignal((s) => s + 1)}
              onClose={props.onClearActiveRoute || props.onClearInspection}
            />
          ) : null
        }
        isConvenienceOpen={step === 'idle' && (props.mapFilter === 'safe_stations' || props.inspectedPlace?.kind === 'safe_station') && !props.pinPicker.isActive}
        isGasListOpen={step === 'idle' && props.mapFilter === 'gas_stations' && !props.pinPicker.isActive}
        isPoliceListOpen={step === 'idle' && props.mapFilter === 'police_stations' && !props.pinPicker.isActive}
        isShopDetailOpen={step === 'idle' && props.inspectedPlace?.kind === 'repair_shop' && !props.pinPicker.isActive}
        onRecenter={props.onRecenter}
        onBack={step !== 'idle' ? () => props.onSetStep(step === 'pickup' ? 'issue' : 'idle') : undefined}
      >
        <MapBottomSheetContent
          step={step} trackingStatus={trackingStatus} mapFilter={props.mapFilter} userLocation={props.userLocation}
          stations={props.stations} openRepairShops={props.openRepairShops} selectedStationId={props.selectedStationId}
          inspectedPlace={props.inspectedPlace} pickupMode={props.pickupMode} pickupTitle={props.pickupTitle}
          pickupAddress={props.pickupAddress} routeSummary={props.routeSummary} isLoadingRoute={props.isLoadingRoute}
          isSubmitting={props.isSubmitting} selectedIssue={props.selectedIssue} customNote={props.customNote}
          issueSummary={props.issueSummary} pricing={props.pricing} liveEtaMinutes={props.liveEtaMinutes}
          enteredFromQuickStations={props.enteredFromQuickStations} gasStations={props.gasStations}
          selectedGasStationId={props.selectedDestination?.kind === 'gas_station' ? props.selectedDestination.id : props.selectedGasStationId}
          hasGasRoute={!!(props.activeRouteGeoJson && props.selectedDestination?.kind === 'gas_station')}
          isLoadingGasStations={props.isLoadingGasStations}
          isLoadingGasRoute={props.isLoadingInspectRoute || props.isLoadingGasRoute}
          onDrawGasRoute={props.onDrawGasRoute} onPickGasStationForRescue={props.onPickGasStationForRescue}
          policeStations={props.policeStations}
          selectedPoliceStationId={props.selectedDestination?.kind === 'police_station' ? props.selectedDestination.id : props.selectedPoliceStationId}
          hasPoliceRoute={!!(props.activeRouteGeoJson && props.selectedDestination?.kind === 'police_station')}
          isLoadingPoliceStations={props.isLoadingPoliceStations}
          isLoadingPoliceRoute={props.isLoadingInspectRoute || props.isLoadingPoliceRoute}
          onDrawPoliceRoute={props.onDrawPoliceRoute} onPickSafeStationForRescue={props.onPickSafeStationForRescue}
          onInspectPlace={props.onInspectPlace} onSelectStation={props.onSelectStation} onClearInspection={props.onClearInspection}
          onStartOrder={props.onStartOrder} onOpenSafeStations={props.onOpenSafeStations} onSelectIssue={props.onSelectIssue}
          onChangeNote={props.onChangeNote} onChangeMode={props.onChangeMode} onOpenVouchers={() => setIsVoucherDrawerOpen(true)}
          onSetStep={props.onSetStep} onConfirmRescue={props.onConfirmRescue} onOpenChat={() => setIsChatDrawerOpen(true)}
          onDemoAdvance={props.onDemoAdvance} onCancelOrder={props.onCancelOrder} onCompleteOrder={props.onCompleteOrder}
          onOpenLocationSearch={props.onOpenLocationSearch} onOpenAiChat={props.onOpenAiChat} rescueOtp={props.rescueOtp} elapsedSeconds={props.elapsedSeconds}
          onConfirmOtp={props.onConfirmOtp} onConfirmCancelDetailed={props.onConfirmCancelDetailed}
          simulateNight={props.simulateNight} onToggleNight={props.onToggleNight}
          onPickCurrentWithDiscount={props.onPickCurrentWithDiscount}
          onOpenSosModal={() => setIsSosOpen(true)}
          pinPicker={props.pinPicker}
        />
      </BottomSheetShell>

      <VoucherDrawerModal
        isOpen={isVoucherDrawerOpen} vouchers={VOUCHER_OPTIONS} selectedVoucherId={props.selectedVoucherId}
        pickupMode={props.pickupMode} onApplyVoucher={props.onSelectVoucher} onClose={() => setIsVoucherDrawerOpen(false)}
      />

      <MechanicChatDrawer
        isOpen={isChatDrawerOpen} mechanic={MOCK_MECHANIC} messages={props.chatMessages}
        quickSuggestions={QUICK_CHAT_SUGGESTIONS} isMechanicTyping={props.isMechanicTyping}
        onSendMessage={props.onSendChatMessage} onClose={() => setIsChatDrawerOpen(false)}
      />

      <ScopeApprovalDrawer
        isOpen={!!props.isScopeDrawerOpen}
        item={props.pendingScopeItem ?? MOCK_SCOPE_ITEMS[0]}
        currentTotal={props.pricing.finalPrice}
        onApprove={props.onApproveScope ?? (() => {})}
        onReject={props.onRejectScope ?? (() => {})}
        onClose={props.onCloseScopeDrawer ?? (() => {})}
      />

      <SOSModal
        isOpen={isSosOpen}
        activeLocation={{
          lat: props.userLocation.coord.lat,
          lng: props.userLocation.coord.lng,
          address: props.userLocation.address,
          isCurrentGPS: true,
          accuracyMeters: props.userLocation.accuracyMeters,
        }}
        onTriggerSos={() => {
          setIsSosOpen(false);
          props.onStartOrder?.();
        }}
        onClose={() => setIsSosOpen(false)}
      />
    </div>
  );
}
