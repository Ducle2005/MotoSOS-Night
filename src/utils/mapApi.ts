import { MOCK_SAFE_STATIONS } from '../data/mockRescueData';
import type { GeoCoord, SafeStation, SafeStationCategory } from '../types/rescue';
import {
  computeHaversineMeters,
  estimateWalkingMinutes,
} from './rescueLogic';

export interface GeoapifyFeature {
  properties?: {
    place_id?: string;
    name?: string;
    categories?: string[];
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    street?: string;
    suburb?: string;
    district?: string;
    distance?: number;
  };
  geometry?: {
    type?: string;
    coordinates?: [number, number];
  };
}

export function getGeoapifyApiKey(): string {
  const metaEnv = (import.meta as { env?: Record<string, string | undefined> }).env;
  const fromVite =
    metaEnv?.VITE_GEOAPIFY_KEY ||
    metaEnv?.VITE_GEOAPIFY_API_KEY ||
    metaEnv?.NEXT_PUBLIC_GEOAPIFY_KEY ||
    '';
  const fromDefine =
    typeof process !== 'undefined' && process.env
      ? process.env.VITE_GEOAPIFY_KEY ||
        process.env.VITE_GEOAPIFY_API_KEY ||
        process.env.NEXT_PUBLIC_GEOAPIFY_KEY ||
        ''
      : '';
  return (fromVite || fromDefine).trim();
}

export function detectStationCategory(
  categories: string[] = [],
  name: string = '',
): {
  category: SafeStationCategory;
  categoryLabel: string;
  amenities: string[];
} {
  const normName = name.toLowerCase();
  if (
    categories.some((c) => c.includes('hospital') || c.includes('clinic') || c.includes('healthcare')) ||
    normName.includes('bệnh viện') ||
    normName.includes('benh vien') ||
    normName.includes('trung tâm y tế') ||
    normName.includes('trạm y tế')
  ) {
    return {
      category: 'hospital',
      categoryLabel: 'Cơ sở y tế',
      amenities: ['Cấp cứu 24/7', 'Bảo vệ trực đêm', 'Khu vực sáng đèn'],
    };
  }
  if (
    categories.some((c) => c.includes('police')) ||
    normName.includes('công an') ||
    normName.includes('cong an') ||
    normName.includes('đồn công an')
  ) {
    return {
      category: 'police',
      categoryLabel: 'Công an khu vực',
      amenities: ['Trực ban 24/7', 'An ninh tối đa', 'Hỗ trợ khẩn cấp'],
    };
  }
  if (
    categories.some((c) => c.includes('fuel')) ||
    normName.includes('petrolimex') ||
    normName.includes('comeco') ||
    normName.includes('pvoil') ||
    normName.includes('saigon petrol') ||
    normName.includes('xăng dầu')
  ) {
    return {
      category: 'gas_station',
      categoryLabel: 'Cây xăng sáng đèn',
      amenities: ['Đèn sáng xuyên đêm', 'Có nhân viên trực', 'Khu vực thoáng'],
    };
  }
  return {
    category: 'convenience',
    categoryLabel: 'Cửa hàng 24/7',
    amenities: ['Đèn sáng', 'Camera an ninh', 'Ghế ngồi chờ'],
  };
}

export function mapGeoapifyFeaturesToStations(
  features: GeoapifyFeature[],
  userCoord: GeoCoord,
): SafeStation[] {
  const mapped: SafeStation[] = [];

  for (let idx = 0; idx < features.length; idx += 1) {
    const feature = features[idx];
    const coords = feature.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;

    const [lng, lat] = coords;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;

    const props = feature.properties ?? {};
    const rawName = props.name?.trim() || props.address_line1?.trim() || '';
    const { category, categoryLabel, amenities } = detectStationCategory(
      props.categories,
      rawName,
    );

    const meters =
      typeof props.distance === 'number' && props.distance > 0
        ? Math.round(props.distance)
        : computeHaversineMeters(userCoord, { lat, lng });

    const name = rawName || `${categoryLabel} #${idx + 1}`;
    const address =
      props.address_line2?.trim() ||
      props.formatted?.trim() ||
      [props.street, props.suburb, props.district].filter(Boolean).join(', ') ||
      'Khu vực gần vị trí của bạn';

    mapped.push({
      id: props.place_id || `geoapify-${idx}-${lng.toFixed(4)}-${lat.toFixed(4)}`,
      name,
      category,
      categoryLabel,
      address,
      walkingDistanceMeters: meters,
      walkingMinutes: estimateWalkingMinutes(meters),
      openHours: category === 'police' ? 'Trực ban 24/7' : category === 'hospital' ? 'Cấp cứu 24/7' : 'Mở cửa 24/7',
      amenities,
      coord: { lat, lng },
    });
  }

  return mapped.sort(
    (a, b) => a.walkingDistanceMeters - b.walkingDistanceMeters,
  );
}

const stationsMemoryCache = new Map<string, { stations: SafeStation[]; source: 'geoapify' | 'mock' }>();

export async function fetchNearbySafeStations(
  userCoord: GeoCoord,
  signal?: AbortSignal,
): Promise<{ stations: SafeStation[]; source: 'geoapify' | 'mock' }> {
  const apiKey = getGeoapifyApiKey();
  if (!apiKey) {
    return { stations: MOCK_SAFE_STATIONS, source: 'mock' };
  }

  const { lat, lng } = userCoord;
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const inMem = stationsMemoryCache.get(cacheKey);
  if (inMem) return inMem;

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(`ms_st_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored) as { stations: SafeStation[]; source: 'geoapify' | 'mock' };
        stationsMemoryCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {}

  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), 3500);
  const effectiveSignal = signal ? AbortSignal.any([signal, ctrl.signal]) : ctrl.signal;

  const queryGeoapify = async (categories: string, radiusMeters: number, limit: number) => {
    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lng},${lat},${radiusMeters}&bias=proximity:${lng},${lat}&limit=${limit}&apiKey=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, { signal: effectiveSignal });
    if (!response.ok) return [];
    const payload = (await response.json()) as { features?: GeoapifyFeature[] };
    return mapGeoapifyFeaturesToStations(payload.features ?? [], userCoord);
  };

  try {
    let stations = await queryGeoapify('commercial.convenience', 1000, 6);

    if (stations.length < 2) {
      const expanded = await queryGeoapify(
        'commercial.convenience,service.vehicle.fuel,service.police,healthcare.hospital',
        2500,
        6,
      );
      if (expanded.length > 0) stations = expanded;
    }

    if (stations.length === 0) {
      stations = await queryGeoapify(
        'commercial.convenience,service.vehicle.fuel,service.police,healthcare.hospital',
        3500,
        6,
      );
    }
    clearTimeout(timeoutId);

    const result = { stations: stations.slice(0, 6), source: 'geoapify' as const };
    stationsMemoryCache.set(cacheKey, result);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(`ms_st_${cacheKey}`, JSON.stringify(result));
      }
    } catch {}
    return result;
  } catch {
    clearTimeout(timeoutId);
    return { stations: MOCK_SAFE_STATIONS, source: 'mock' };
  }
}

export {
  fetchMechanicDrivingRoute,
  fetchWalkingRoute,
  type RouteFetchResult,
} from './osrmApi';
