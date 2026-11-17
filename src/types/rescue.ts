export type AppTab = 'home' | 'map' | 'activity' | 'safety' | 'profile';

export type IssueType =
  | 'flat_tire'
  | 'engine_dead'
  | 'out_of_fuel'
  | 'battery_jump'
  | 'other';

export type SafeStationCategory = 'convenience' | 'gas_station' | 'police' | 'hospital';

export type PickupMode = 'current_location' | 'safe_station';

export type RescueStep = 'idle' | 'issue' | 'pickup' | 'tracking';

export type TrackingStatus = 'searching' | 'accepted' | 'arrived' | 'repairing' | 'completed';

export type VoucherId = 'ANTOAN20' | 'DEMKHUYA15' | 'BANMOI25';

export type MapLayerFilter =
  | 'all'
  | 'repair_shops'
  | 'gas_stations'
  | 'police_stations'
  | 'safe_stations';

export interface GeoCoord {
  lat: number;
  lng: number;
}

export interface SafeStation {
  id: string;
  name: string;
  category: SafeStationCategory;
  categoryLabel: string;
  address: string;
  walkingDistanceMeters: number;
  walkingMinutes: number;
  openHours: string;
  amenities: string[];
  coord: GeoCoord;
}

export interface RepairShop {
  id: string;
  name: string;
  address: string;
  phone: string;
  distanceMeters: number;
  rideMinutes: number;
  openingHoursRaw: string | null;
  isOpen: boolean;
  openStatusLabel: string;
  hasExplicitHours: boolean;
  coord: GeoCoord;
}

export interface GasStation {
  id: string;
  name: string;
  address: string;
  walkingDistanceMeters: number;
  walkingMinutes: number;
  openStatusLabel: string;
  isNearest: boolean;
  coord: GeoCoord;
}

export interface PoliceStation {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  distanceMeters: number;
  durationMinutes: number;
  isNearest: boolean;
  coord: GeoCoord;
}

export interface IssueOption {
  id: IssueType;
  label: string;
  subtitle: string;
  fixedPrice: number;
}

export interface VoucherOption {
  id: VoucherId;
  code: VoucherId;
  title: string;
  description: string;
  discountAmount: number;
  requiresSafeStation: boolean;
}

export interface ScopeApprovalItem {
  id: string;
  title: string;
  reason: string;
  cost: number;
}

export interface OrderPricing {
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  appliedVoucher: VoucherOption | null;
  nightSurcharge?: number;
  extraCost?: number;
  extraItemTitle?: string;
  memberDiscountAmount?: number;
  memberPlanName?: string;
  isNightWaivedByMember?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mechanic';
  text: string;
  timestampLabel: string;
}

export interface MechanicInfo {
  id: string;
  name: string;
  phone: string;
  licensePlate: string;
  vehicleModel: string;
  rating: number;
  completedRescues: number;
  etaMinutes: number;
  distanceKm: number;
  coord: GeoCoord;
}

export interface ActiveLocation {
  lat: number;
  lng: number;
  address: string;
  isCurrentGPS: boolean;
  accuracyMeters?: number | null;
}

export interface LocationSuggestion {
  id: string;
  addressLine1: string;
  addressLine2: string;
  fullAddress: string;
  lat: number;
  lng: number;
  distanceMeters: number;
}

export interface UserLocation {
  address: string;
  district: string;
  coord: GeoCoord;
  source: 'gps' | 'fallback';
  accuracyMeters?: number | null;
}

export interface GeoJsonLineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface RescueActivityItem {
  id: string;
  issueLabel: string;
  pickupAddress: string;
  mechanicName: string;
  licensePlate: string;
  timestampLabel: string;
  priceLabel?: string;
  status: 'completed' | 'cancelled';
}

export interface RescueReceipt {
  id: string;
  rescueOtp?: string;
  serviceName: string;
  issueType?: IssueType;
  replacedParts: string;
  locationAddress: string;
  lat: number;
  lng: number;
  mechanicName: string;
  mechanicPlate: string;
  mechanicPhone: string;
  mechanicRating: string;
  originalPrice: number;
  discountAmount: number;
  promoCode: string | null;
  nightSurcharge?: number;
  extraCost?: number;
  extraItemTitle?: string;
  finalPrice: number;
  paymentMethod: string;
  completedAt: string;
}

export type InspectedPlace =
  | { kind: 'safe_station'; station: SafeStation }
  | { kind: 'repair_shop'; shop: RepairShop }
  | { kind: 'gas_station'; gasStation: GasStation }
  | { kind: 'police_station'; policeStation: PoliceStation };

export type DestinationKind =
  | 'safe_station'
  | 'repair_shop'
  | 'gas_station'
  | 'police_station'
  | 'custom';

export interface SelectedDestination {
  id: string;
  kind: DestinationKind;
  title: string;
  address?: string;
  coord: GeoCoord;
  isNearest?: boolean;
}

export interface ActiveRescueInfo {
  status: 'en_route' | 'arrived';
  etaMinutes: number;
  mechanic: MechanicInfo;
  otpCode: string;
  serviceName: string;
  finalPrice: number;
  pickupAddress: string;
  elapsedSeconds: number;
}

