import type {
  GeoCoord,
  IssueOption,
  IssueType,
  PickupMode,
  SafeStation,
  TrackingStatus,
  UserLocation,
} from '../types/rescue';

export function resolvePickupTarget(
  mode: PickupMode,
  userLocation: UserLocation,
  stations: SafeStation[],
  selectedStationId: string | null,
): {
  title: string;
  address: string;
  coord: GeoCoord;
  station: SafeStation | null;
} {
  if (mode === 'safe_station') {
    const matched =
      stations.find((station) => station.id === selectedStationId) ??
      getNearestSafeStation(stations);

    if (matched) {
      return {
        title: matched.name,
        address: matched.address,
        coord: matched.coord,
        station: matched,
      };
    }
  }

  return {
    title: 'Vị trí hiện tại của bạn',
    address: userLocation.address,
    coord: userLocation.coord,
    station: null,
  };
}

export function getNearestSafeStation(stations: SafeStation[]): SafeStation | null {
  if (stations.length === 0) return null;
  return [...stations].sort(
    (a, b) => a.walkingDistanceMeters - b.walkingDistanceMeters,
  )[0];
}

export function findStationByCategory(
  stations: SafeStation[],
  category: SafeStation['category'],
): SafeStation | null {
  const matching = stations.filter((station) => station.category === category);
  if (matching.length > 0) {
    return getNearestSafeStation(matching);
  }
  return getNearestSafeStation(stations);
}

export function computeHaversineMeters(a: GeoCoord, b: GeoCoord): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(earthRadiusMeters * c);
}

export function estimateWalkingMinutes(meters: number): number {
  return Math.max(1, Math.round(Math.max(0, meters) / 75));
}

export function formatWalkingDistance(meters: number, minutes: number): string {
  const safeMeters = Math.max(0, Math.round(meters));
  const safeMinutes = Math.max(1, Math.round(minutes));
  return `${safeMeters}m · ${safeMinutes} phút đi bộ`;
}

export function getNextDemoTrackingStatus(current: TrackingStatus): TrackingStatus {
  if (current === 'searching') return 'accepted';
  if (current === 'accepted' || current === 'arrived') return 'completed';
  return 'completed';
}

export function getIssueLabel(
  issueId: IssueType | null,
  options: IssueOption[],
  customNote?: string,
): string {
  const found = options.find((opt) => opt.id === issueId);
  if (!found) return 'Cứu hộ xe máy khẩn cấp';
  if (issueId === 'other' && customNote && customNote.trim().length > 0) {
    return `${found.label} (${customNote.trim()})`;
  }
  return found.label;
}

export function computeBoundsBox(
  coords: [number, number][],
): [[number, number], [number, number]] | null {
  if (coords.length === 0) return null;
  let minLng = coords[0][0];
  let minLat = coords[0][1];
  let maxLng = coords[0][0];
  let maxLat = coords[0][1];

  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export function buildMechanicApproachCoord(pickupCoord: GeoCoord): GeoCoord {
  return {
    lat: pickupCoord.lat + 0.0046,
    lng: pickupCoord.lng - 0.0056,
  };
}

export function getStationSafetyBadgeText(
  category: SafeStation['category'],
): string {
  if (category === 'convenience') return 'Mở 24/7 • Đèn sáng & Camera';
  if (category === 'gas_station') return 'Trực 24/7 • Có nhân viên';
  return 'Trực ban 24/7 • An ninh cao';
}

export function formatCompactStationAddress(rawAddress: string): string {
  const cleaned = rawAddress.trim();
  if (!cleaned) return 'Gần vị trí hiện tại';

  const redundantTail =
    /^(vietnam|việt nam|ho chi minh city|thành phố hồ chí minh|tp\.?\s*hồ chí minh|tp\.?\s*hcm|\d{5,6})$/i;

  const parts = cleaned
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !redundantTail.test(part));

  if (parts.length === 0) return 'Trung tâm TP.HCM';

  const normalizeStreet = (street: string): string => {
    if (/\s+street$/i.test(street) && !/^(đ\.|đường)/i.test(street)) {
      return `Đ. ${street.replace(/\s+street$/i, '').trim()}`;
    }
    return street.replace(/^Đường\s+/i, 'Đ. ');
  };

  const normalizeDistrict = (segment: string): string => {
    if (/^(saigon|sài gòn|bến nghé|bến thành|p\.\s*bến nghé|p\.\s*bến thành)$/i.test(segment)) {
      return 'Q.1';
    }
    return segment
      .replace(/^District\s+(\d+)/i, 'Q.$1')
      .replace(/^Quận\s+(\d+)/i, 'Q.$1')
      .replace(/^Phường\s+/i, 'P. ');
  };

  const first = normalizeStreet(parts[0]);
  if (parts.length === 1) return first;

  const last = normalizeDistrict(parts[parts.length - 1]);
  if (last.toLowerCase() === first.toLowerCase()) return first;
  return `${first}, ${last}`;
}

export function computeActiveCarouselIndex(
  scrollLeft: number,
  maxScrollLeft: number,
  itemCount: number,
  cardStepPx = 274,
): number {
  if (itemCount <= 1) return 0;
  if (maxScrollLeft > 0 && scrollLeft >= maxScrollLeft - 4) {
    return itemCount - 1;
  }
  const index = Math.round(Math.max(0, scrollLeft) / cardStepPx);
  return Math.min(itemCount - 1, Math.max(0, index));
}

export const GRACE_PERIOD_SECONDS = 180;
export const NIGHT_FUEL_COMPENSATION_FEE = 30000;

export function calculateCancelFee(elapsedSeconds: number, forceFee = false): {
  feeAmount: number;
  isGracePeriod: boolean;
  remainingGraceSeconds: number;
} {
  const isGrace = !forceFee && elapsedSeconds <= GRACE_PERIOD_SECONDS;
  const remainingGraceSeconds = Math.max(0, GRACE_PERIOD_SECONDS - elapsedSeconds);
  return {
    feeAmount: isGrace ? 0 : NIGHT_FUEL_COMPENSATION_FEE,
    isGracePeriod: isGrace,
    remainingGraceSeconds,
  };
}


