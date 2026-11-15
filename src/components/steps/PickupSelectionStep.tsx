import { Loader2, Navigation, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import type {
  GasStation,
  InspectedPlace,
  MapLayerFilter,
  OrderPricing,
  PickupMode,
  PoliceStation,
  RepairShop,
  SafeStation,
  UserLocation,
} from '../../types/rescue';
import { formatVnd } from '../../utils/pricingAndSimLogic';
import { CurrentLocationPickupView, buildNearbySafePills } from './CurrentLocationPickupView';
import { OrderInvoiceBar } from './OrderInvoiceBar';
import { Step2PlaceListPicker } from './Step2PlaceListPicker';

interface PickupSelectionStepProps {
  issueLabel: string;
  pickupMode: PickupMode;
  mapFilter: MapLayerFilter;
  userLocation: UserLocation;
  stations: SafeStation[];
  openRepairShops: RepairShop[];
  gasStations: GasStation[];
  policeStations: PoliceStation[];
  selectedStationId: string | null;
  inspectedPlace: InspectedPlace | null;
  resolvedAddress: string;
  routeSummary: { distanceMeters: number; durationMinutes: number } | null;
  isLoadingRoute: boolean;
  isSubmitting: boolean;
  pricing: OrderPricing;
  availableVoucherCount: number;
  simulateNight?: boolean;
  onToggleNight?: () => void;
  onChangeMode: (mode: PickupMode) => void;
  onOpenLocationSearch?: () => void;
  onSelectSafeStation: (station: SafeStation) => void;
  onSelectGasStation: (station: GasStation) => void;
  onRouteShop: (shop: RepairShop) => void;
  onRoutePolice: (station: PoliceStation) => void;
  onOpenVouchers: () => void;
  onBack: () => void;
  onConfirm: () => void;
  onPickCurrentWithDiscount?: () => void;
  onOpenSosModal?: () => void;
}

export function PickupSelectionStep({
  issueLabel,
  pickupMode,
  mapFilter,
  userLocation,
  stations,
  openRepairShops,
  gasStations,
  policeStations,
  selectedStationId,
  inspectedPlace,
  resolvedAddress,
  routeSummary,
  isLoadingRoute,
  isSubmitting,
  pricing,
  availableVoucherCount,
  simulateNight,
  onToggleNight,
  onChangeMode,
  onOpenLocationSearch,
  onSelectSafeStation,
  onSelectGasStation,
  onRouteShop,
  onRoutePolice,
  onOpenVouchers,
  onBack,
  onConfirm,
  onPickCurrentWithDiscount,
  onOpenSosModal,
}: PickupSelectionStepProps) {
  const hasDiscount = pricing.appliedVoucher !== null && pricing.discountAmount > 0;

  const nearbySafePills = useMemo(
    () => buildNearbySafePills(stations, policeStations, gasStations, onSelectSafeStation, onRoutePolice, onSelectGasStation),
    [stations, policeStations, gasStations, onSelectSafeStation, onRoutePolice, onSelectGasStation],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center justify-between gap-2">
          <h1 className="shrink-0 text-sm font-extrabold tracking-tight text-slate-900">
            Bạn muốn chờ thợ ở đâu?
          </h1>
          <span className="max-w-[130px] truncate text-right text-xs font-semibold text-emerald-600">
            {issueLabel}
          </span>
        </div>

        {/* Compact 2-column pickup mode toggle */}
        <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Chọn điểm chờ thợ">
          <button
            type="button"
            role="radio"
            aria-checked={pickupMode === 'current_location'}
            onClick={() => onChangeMode('current_location')}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              pickupMode === 'current_location' ? 'border-emerald-500 bg-emerald-50/80' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${pickupMode === 'current_location' ? 'bg-emerald-500 text-white' : 'bg-sky-50 text-sky-600'}`}>
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900">Tại chỗ</p>
              <p className="truncate text-[10px] text-slate-500">{userLocation.address}</p>
            </div>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={pickupMode === 'safe_station'}
            onClick={() => onChangeMode('safe_station')}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              pickupMode === 'safe_station' ? 'border-emerald-500 bg-emerald-50/80' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${pickupMode === 'safe_station' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900">Trạm An Toàn</p>
              <p className="truncate text-[10px] text-emerald-700">Mã ANTOAN20</p>
            </div>
          </button>
        </div>

        {/* Content based on selected mode */}
        {pickupMode === 'current_location' ? (
          <CurrentLocationPickupView
            userLocation={userLocation}
            pills={nearbySafePills}
            onOpenLocationSearch={onOpenLocationSearch}
          />
        ) : (
          <Step2PlaceListPicker
            mapFilter={mapFilter}
            stations={stations}
            openRepairShops={openRepairShops}
            gasStations={gasStations}
            policeStations={policeStations}
            selectedStationId={selectedStationId}
            inspectedPlace={inspectedPlace}
            isLoadingRoute={isLoadingRoute}
            onSelectSafeStation={onSelectSafeStation}
            onSelectGasStation={onSelectGasStation}
            onRouteShop={onRouteShop}
            onRoutePolice={onRoutePolice}
            onPickCurrentWithDiscount={onPickCurrentWithDiscount}
            onOpenSosModal={onOpenSosModal}
          />
        )}

        <span data-testid="pickup-address" className="sr-only">
          {resolvedAddress}
        </span>
      </div>

      {/* Pinned 1-line Summary Invoice & Single Main Confirm Button */}
      <div className="shrink-0 border-t border-slate-100 bg-white px-5 pt-2 pb-3">
        <OrderInvoiceBar
          pricing={pricing}
          availableVoucherCount={availableVoucherCount}
          onOpenVouchers={onOpenVouchers}
          simulateNight={simulateNight}
          onToggleNight={onToggleNight}
        />

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onConfirm}
          data-testid="confirm-order-btn"
          className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-extrabold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-wait disabled:opacity-80 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Đang gửi yêu cầu...</span>
            </>
          ) : (
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span>Xác nhận gọi thợ •</span>
              {hasDiscount && (
                <span className="font-sans text-xs font-medium line-through tabular-nums text-emerald-100">
                  {formatVnd(pricing.basePrice)}
                </span>
              )}
              <span className="font-sans tabular-nums">
                {formatVnd(pricing.finalPrice)}
              </span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
