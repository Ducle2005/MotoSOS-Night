import type { GasStation, GeoCoord, SafeStation } from '../types/rescue';
import { getGeoapifyApiKey, type GeoapifyFeature } from './mapApi';
import {
  computeHaversineMeters,
  estimateWalkingMinutes,
  formatCompactStationAddress,
} from './rescueLogic';

export interface GooglePlaceGasResult {
  id?: string;
  displayName?: { text?: string };
  shortFormattedAddress?: string;
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  currentOpeningHours?: { openNow?: boolean };
}

interface FuelGeoapifyFeature extends GeoapifyFeature {
  properties?: GeoapifyFeature['properties'] & {
    opening_hours?: string;
  };
}

export function getGoogleMapsApiKey(): string {
  const metaEnv = (import.meta as { env?: Record<string, string | undefined> }).env;
  const fromVite =
    metaEnv?.VITE_GOOGLE_MAPS_KEY || metaEnv?.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';
  const fromDefine =
    typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || process.env.VITE_GOOGLE_MAPS_KEY || ''
      : '';
  return (fromVite || fromDefine).trim();
}

export function buildGoogleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function gasStationToSafeStation(gas: GasStation): SafeStation {
  return {
    id: gas.id,
    name: gas.name,
    category: 'gas_station',
    categoryLabel: 'Cây xăng 24/7',
    address: gas.address,
    walkingDistanceMeters: gas.walkingDistanceMeters,
    walkingMinutes: gas.walkingMinutes,
    openHours: gas.openStatusLabel,
    amenities: ['Đèn sáng ban đêm', 'Có nhân viên trực', 'Khu vực thoáng'],
    coord: gas.coord,
  };
}

function finalizeSortedGasStations(
  rawList: Array<Omit<GasStation, 'isNearest'>>,
): GasStation[] {
  return rawList
    .sort((a, b) => a.walkingDistanceMeters - b.walkingDistanceMeters)
    .slice(0, 10)
    .map((item, idx) => ({ ...item, isNearest: idx === 0 }));
}

export function mapGooglePlacesToGasStations(
  places: GooglePlaceGasResult[],
  originCoord: GeoCoord,
): GasStation[] {
  const list: Array<Omit<GasStation, 'isNearest'>> = [];

  for (let idx = 0; idx < places.length; idx += 1) {
    const place = places[idx];
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') continue;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const meters = computeHaversineMeters(originCoord, { lat, lng });
    const rawAddr =
      place.shortFormattedAddress?.trim() ||
      place.formattedAddress?.trim() ||
      'Khu vực gần bạn';

    list.push({
      id: place.id || `gmaps-gas-${idx}-${lat.toFixed(4)}`,
      name: place.displayName?.text?.trim() || `Cây xăng #${idx + 1}`,
      address: formatCompactStationAddress(rawAddr),
      walkingDistanceMeters: meters,
      walkingMinutes: estimateWalkingMinutes(meters),
      openStatusLabel:
        place.currentOpeningHours?.openNow === false
          ? 'Đóng cửa'
          : 'Mở cửa 24/7',
      coord: { lat, lng },
    });
  }

  return finalizeSortedGasStations(list);
}

export function mapGeoapifyFeaturesToGasStations(
  features: FuelGeoapifyFeature[],
  originCoord: GeoCoord,
): GasStation[] {
  const list: Array<Omit<GasStation, 'isNearest'>> = [];

  for (let idx = 0; idx < features.length; idx += 1) {
    const feature = features[idx];
    const coords = feature.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    const [lng, lat] = coords;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const props = feature.properties ?? {};
    const meters = computeHaversineMeters(originCoord, { lat, lng });
    const cleanStreet = (props.street || props.address_line1 || '')
      .replace(/\s+Street$/i, '')
      .trim();
    const areaPart = props.district || props.suburb || '';
    const rawAddr =
      (props.name?.trim() ? props.address_line2?.trim() : '') ||
      [cleanStreet, areaPart].filter(Boolean).join(', ') ||
      props.formatted?.trim() ||
      'Khu vực gần vị trí của bạn';
    const stationName =
      props.name?.trim() ||
      (cleanStreet ? `Cây xăng ${cleanStreet}` : `Cây xăng #${idx + 1}`);

    list.push({
      id: props.place_id || `geo-gas-${idx}-${lng.toFixed(4)}-${lat.toFixed(4)}`,
      name: stationName,
      address: formatCompactStationAddress(rawAddr),
      walkingDistanceMeters: meters,
      walkingMinutes: estimateWalkingMinutes(meters),
      openStatusLabel:
        props.opening_hours === '24/7' ? 'Mở cửa 24/7' : 'Trực 24/7 • Có nhân viên',
      coord: { lat, lng },
    });
  }

  return finalizeSortedGasStations(list);
}

export function buildFallbackGasStations(originCoord: GeoCoord): GasStation[] {
  const seeds = [
    {
      id: 'fallback-gas-petrolimex-hn',
      name: 'Cây xăng Petrolimex Hàm Nghi',
      address: '136 Hàm Nghi, Q.1',
      coord: { lat: 10.7718, lng: 106.6991 },
    },
    {
      id: 'fallback-gas-comeco-hbt',
      name: 'Trạm xăng COMECO Hai Bà Trưng',
      address: '178 Hai Bà Trưng, Q.1',
      coord: { lat: 10.7824, lng: 106.6968 },
    },
    {
      id: 'fallback-gas-pvoil-ntmk',
      name: 'Cây xăng PVOIL Nguyễn Thị Minh Khai',
      address: '94 Nguyễn Thị Minh Khai, Q.3',
      coord: { lat: 10.7764, lng: 106.6912 },
    },
    {
      id: 'fallback-gas-petrolimex-dbp',
      name: 'Cửa hàng xăng dầu Petrolimex Số 04',
      address: '215 Điện Biên Phủ, Q.3',
      coord: { lat: 10.7852, lng: 106.6889 },
    },
  ];

  return finalizeSortedGasStations(
    seeds.map((s) => {
      const meters = computeHaversineMeters(originCoord, s.coord);
      return {
        ...s,
        walkingDistanceMeters: meters,
        walkingMinutes: estimateWalkingMinutes(meters),
        openStatusLabel: 'Mở cửa 24/7',
      };
    }),
  );
}

export async function fetchNearbyGasStations(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<{ stations: GasStation[]; source: 'google' | 'geoapify' | 'mock' }> {
  const originCoord = { lat, lng };
  const googleKey = getGoogleMapsApiKey();

  if (googleKey) {
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googleKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.currentOpeningHours',
        },
        body: JSON.stringify({
          includedTypes: ['gas_station'],
          rankPreference: 'DISTANCE',
          maxResultCount: 10,
          locationRestriction: {
            circle: { center: { latitude: lat, longitude: lng }, radius: 3000 },
          },
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { places?: GooglePlaceGasResult[] };
        const mapped = mapGooglePlacesToGasStations(data.places ?? [], originCoord);
        if (mapped.length > 0) return { stations: mapped, source: 'google' };
      }
    } catch {
      if (signal?.aborted) return { stations: buildFallbackGasStations(originCoord), source: 'mock' };
    }
  }

  const geoapifyKey = getGeoapifyApiKey();
  if (geoapifyKey) {
    const url = `https://api.geoapify.com/v2/places?categories=service.vehicle.fuel&filter=circle:${lng},${lat},3000&bias=proximity:${lng},${lat}&limit=10&apiKey=${encodeURIComponent(geoapifyKey)}`;
    try {
      const res = await fetch(url, { signal });
      if (res.ok) {
        const data = (await res.json()) as { features?: FuelGeoapifyFeature[] };
        const mapped = mapGeoapifyFeaturesToGasStations(data.features ?? [], originCoord);
        if (mapped.length > 0) return { stations: mapped, source: 'geoapify' };
      }
    } catch {
      // Fallback below
    }
  }

  return { stations: buildFallbackGasStations(originCoord), source: 'mock' };
}
