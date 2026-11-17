import { ISSUE_OPTIONS, MOCK_MECHANIC, VOUCHER_OPTIONS } from '../../data/mockRescueData';
import type { GasStation, GeoCoord, InspectedPlace, IssueType, MapLayerFilter, OrderPricing, PickupMode, PoliceStation, RepairShop, RescueStep, SafeStation, TrackingStatus, UserLocation } from '../../types/rescue';
import { ConvenienceStoreSheet } from '../steps/ConvenienceStoreSheet';
import { GasStationListSheet } from '../steps/GasStationListSheet';
import { IdleHomeStep } from '../steps/IdleHomeStep';
import { IssueSelectionStep } from '../steps/IssueSelectionStep';
import { PickupSelectionStep } from '../steps/PickupSelectionStep';
import { PinPickerSheet } from '../steps/PinPickerSheet';
import { PoliceStationListSheet } from '../steps/PoliceStationListSheet';
import { RepairShopDetailSheet } from '../steps/RepairShopDetailSheet';
import { TrackingStep } from '../steps/TrackingStep';

interface MapBottomSheetContentProps {
  step: RescueStep;
  trackingStatus: TrackingStatus;
  mapFilter: MapLayerFilter;
  userLocation: UserLocation;
  stations: SafeStation[];
  openRepairShops: RepairShop[];
  selectedStationId: string | null;
  inspectedPlace: InspectedPlace | null;
  pickupMode: PickupMode;
  pickupTitle: string;
  pickupAddress: string;
  routeSummary: { distanceMeters: number; durationMinutes: number } | null;
  isLoadingRoute: boolean;
  isSubmitting: boolean;
  selectedIssue: IssueType | null;
  customNote: string;
  issueSummary: string;
  pricing: OrderPricing;
  liveEtaMinutes: number;
  enteredFromQuickStations: boolean;
  gasStations: GasStation[];
  selectedGasStationId: string | null;
  hasGasRoute: boolean;
  isLoadingGasStations: boolean;
  isLoadingGasRoute: boolean;
  onDrawGasRoute: (station: GasStation) => void;
  onPickGasStationForRescue: (station: GasStation) => void;
  policeStations: PoliceStation[];
  selectedPoliceStationId: string | null;
  hasPoliceRoute: boolean;
  isLoadingPoliceStations: boolean;
  isLoadingPoliceRoute: boolean;
  onDrawPoliceRoute: (station: PoliceStation) => void;
  onPickSafeStationForRescue: (station: SafeStation) => void;
  onInspectPlace: (place: InspectedPlace) => void;
  onSelectStation?: (id: string) => void;
  onClearInspection?: () => void;
  onStartOrder: () => void; onOpenSafeStations: () => void; onSelectIssue: (issue: IssueType) => void;
  onChangeNote: (note: string) => void; onChangeMode: (mode: PickupMode) => void;
  onOpenVouchers: () => void; onSetStep: (step: RescueStep) => void; onConfirmRescue: () => void;
  onOpenChat: () => void; onDemoAdvance: () => void; onCancelOrder: () => void; onCompleteOrder: () => void;
  onOpenLocationSearch?: () => void; onOpenAiChat?: () => void;
  rescueOtp: string; elapsedSeconds: number;
  onConfirmOtp: () => void; onConfirmCancelDetailed?: (reason: string, feeAmount: number) => void;
  simulateNight?: boolean; onToggleNight?: () => void;
  onPickCurrentWithDiscount?: () => void;
  onOpenSosModal?: () => void;
  pinPicker?: {
    isActive: boolean;
    coord: GeoCoord;
    address: string;
    isResolving: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  };
}

export function MapBottomSheetContent(props: MapBottomSheetContentProps) {
  const { step, trackingStatus, mapFilter, pinPicker } = props;

  if (pinPicker?.isActive) {
    return (
      <PinPickerSheet
        coord={pinPicker.coord}
        address={pinPicker.address}
        isResolving={pinPicker.isResolving}
        onConfirm={pinPicker.onConfirm}
        onCancel={pinPicker.onCancel}
      />
    );
  }

  if (step === 'idle' && mapFilter === 'gas_stations') {
    return (
      <GasStationListSheet
        gasStations={props.gasStations}
        selectedGasStationId={props.selectedGasStationId}
        hasActiveGasRoute={props.hasGasRoute}
        isLoadingStations={props.isLoadingGasStations}
        isLoadingRoute={props.isLoadingGasRoute}
        onDrawRoute={(station) => {
          props.onDrawGasRoute(station);
          props.onInspectPlace({ kind: 'gas_station', gasStation: station });
        }}
        onPickForRescue={props.onPickGasStationForRescue}
      />
    );
  }

  if (step === 'idle' && mapFilter === 'police_stations') {
    return (
      <PoliceStationListSheet
        policeStations={props.policeStations}
        selectedPoliceStationId={props.selectedPoliceStationId}
        hasActivePoliceRoute={props.hasPoliceRoute}
        isLoadingStations={props.isLoadingPoliceStations}
        isLoadingRoute={props.isLoadingPoliceRoute}
        onDrawRoute={props.onDrawPoliceRoute}
      />
    );
  }

  if (step === 'idle' && (mapFilter === 'safe_stations' || props.inspectedPlace?.kind === 'safe_station')) {
    const stationList = props.stations;
    const current =
      (props.inspectedPlace?.kind === 'safe_station' ? props.inspectedPlace.station : null) ||
      stationList.find((s) => s.id === props.selectedStationId) ||
      stationList[0] ||
      null;
    return (
      <ConvenienceStoreSheet
        selectedStation={current}
        stations={stationList}
        routeSummary={props.routeSummary}
        isLoadingRoute={props.isLoadingRoute}
        onSelectStation={(st) => {
          props.onSelectStation?.(st.id);
          props.onInspectPlace({ kind: 'safe_station', station: st });
        }}
        onPickForRescue={(st) => {
          props.onPickSafeStationForRescue(st);
          props.onSetStep('pickup');
        }}
        onPickCurrentWithDiscount={props.onPickCurrentWithDiscount}
        onOpenSosModal={props.onOpenSosModal}
      />
    );
  }

  if (step === 'idle' && props.inspectedPlace?.kind === 'repair_shop') {
    return (
      <RepairShopDetailSheet
        shop={props.inspectedPlace.shop}
        routeSummary={props.routeSummary}
        isLoadingRoute={props.isLoadingRoute}
        onClose={() => props.onClearInspection?.()}
      />
    );
  }

  return (
    <div
      key={`${step}-${trackingStatus === 'searching' ? 'searching' : trackingStatus === 'completed' ? 'completed' : 'active'}`}
      className="animate-step-enter flex min-h-0 flex-1 flex-col"
    >
      {step === 'idle' && (
        <IdleHomeStep
          userLocation={props.userLocation}
          onStartOrder={props.onStartOrder}
          onOpenSafeStations={props.onOpenSafeStations}
        />
      )}
      {step === 'issue' && (
        <IssueSelectionStep
          options={ISSUE_OPTIONS}
          selectedIssue={props.selectedIssue}
          customNote={props.customNote}
          onSelectIssue={props.onSelectIssue}
          onChangeNote={props.onChangeNote}
          onBack={() => props.onSetStep('idle')}
          onContinue={() => props.onSetStep('pickup')}
          onOpenAiChat={props.onOpenAiChat}
        />
      )}
      {step === 'pickup' && (
        <PickupSelectionStep
          issueLabel={props.issueSummary}
          pickupMode={props.pickupMode}
          mapFilter={mapFilter}
          userLocation={props.userLocation}
          stations={props.stations}
          openRepairShops={props.openRepairShops}
          gasStations={props.gasStations}
          policeStations={props.policeStations}
          selectedStationId={props.selectedStationId}
          inspectedPlace={props.inspectedPlace}
          resolvedAddress={props.pickupAddress}
          routeSummary={props.routeSummary}
          isLoadingRoute={props.isLoadingRoute}
          isSubmitting={props.isSubmitting}
          pricing={props.pricing}
          availableVoucherCount={VOUCHER_OPTIONS.length}
          simulateNight={props.simulateNight}
          onToggleNight={props.onToggleNight}
          onChangeMode={props.onChangeMode}
          onOpenLocationSearch={props.onOpenLocationSearch}
          onSelectSafeStation={(st) => { props.onSelectStation?.(st.id); props.onPickSafeStationForRescue(st); props.onInspectPlace({ kind: 'safe_station', station: st }); }}
          onSelectGasStation={(gas) => { props.onSelectStation?.(gas.id); props.onPickGasStationForRescue(gas); props.onInspectPlace({ kind: 'gas_station', gasStation: gas }); }}
          onRouteShop={(shop) => { props.onSelectStation?.(shop.id); props.onInspectPlace({ kind: 'repair_shop', shop }); }}
          onRoutePolice={(pol) => { props.onSelectStation?.(pol.id); props.onInspectPlace({ kind: 'police_station', policeStation: pol }); }}
          onOpenVouchers={() => props.onOpenVouchers()}
          onBack={() => props.onSetStep(props.enteredFromQuickStations && !props.selectedIssue ? 'idle' : 'issue')}
          onConfirm={props.onConfirmRescue}
          onPickCurrentWithDiscount={props.onPickCurrentWithDiscount}
          onOpenSosModal={props.onOpenSosModal}
        />
      )}
      {step === 'tracking' && (
        <TrackingStep
          status={trackingStatus}
          issueSummary={props.issueSummary}
          pickupTitle={props.pickupTitle}
          pickupAddress={props.pickupAddress}
          mechanic={MOCK_MECHANIC}
          liveEtaMinutes={props.liveEtaMinutes}
          hasArrived={trackingStatus === 'arrived'}
          pricing={props.pricing}
          rescueOtp={props.rescueOtp}
          elapsedSeconds={props.elapsedSeconds}
          userCoord={props.userLocation.coord}
          onOpenChat={props.onOpenChat}
          onDemoAdvance={props.onDemoAdvance}
          onConfirmOtp={props.onConfirmOtp}
          onCancelOrder={props.onCancelOrder}
          onConfirmCancelDetailed={props.onConfirmCancelDetailed}
          onCompleteReset={props.onCompleteOrder}
        />
      )}
    </div>
  );
}
