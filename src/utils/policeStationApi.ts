import type { GeoCoord, PoliceStation } from '../types/rescue';
import { getGoogleMapsApiKey } from './gasStationApi';
import { getGeoapifyApiKey, type GeoapifyFeature } from './mapApi';
import {
  computeHaversineMeters,
  estimateWalkingMinutes,
  formatCompactStationAddress,
} from './rescueLogic';

export interface GooglePlacePoliceResult {
  id?: string;
  displayName?: { text?: string };
  shortFormattedAddress?: string;
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  nationalPhoneNumber?: string;
}

interface PoliceGeoapifyFeature extends GeoapifyFeature {
  properties?: GeoapifyFeature['properties'] & {
    contact?: { phone?: string };
    datasource?: { raw?: { phone?: string; 'contact:phone'?: string } };
  };
}

export function buildPoliceGoogleMapsUrl(
  station: Pick<PoliceStation, 'name' | 'address'>,
): string {
  const query = `${station.name} ${station.address}`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function formatPoliceDistanceLabel(meters: number, minutes: number): string {
  const safeMeters = Math.max(0, Math.round(meters));
  const safeMin = Math.max(1, Math.round(minutes));
  const distText = safeMeters < 1000 ? `${safeMeters}m` : `${(safeMeters / 1000).toFixed(1)} km`;
  return `${distText} · ${safeMin} phút`;
}

export function normalizePoliceStationName(rawName: string | undefined, streetHint?: string, areaHint?: string): string {
  const cleaned = (rawName ?? '').trim();
  const isGeneric = !cleaned || /^(police|police\s*station|police\s*post|local\s*police|public\s*safety)$/i.test(cleaned);
  if (isGeneric) {
    const cleanArea = (areaHint ?? '').replace(/^Ward\s+/i, 'P. ').trim();
    const cleanStreet = (streetHint ?? '').replace(/\s+Street$/i, '').replace(/^Đường\s+/i, 'Đ. ').trim();
    const suffix = cleanArea || cleanStreet;
    return suffix ? `Trụ sở Công an Khu vực ${suffix}` : 'Trụ sở Công an Khu vực';
  }
  return cleaned
    .replace(/\bWard\s+Police\b/gi, 'Công an Phường')
    .replace(/\bPolice\s+Station\b/gi, 'Đồn Công an')
    .trim();
}

export function extractRealPolicePhone(props?: PoliceGeoapifyFeature['properties']): string | null {
  const raw = props?.contact?.phone || props?.datasource?.raw?.phone || props?.datasource?.raw?.['contact:phone'] || '';
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function finalizePoliceStations(rawList: Array<Omit<PoliceStation, 'isNearest'>>): PoliceStation[] {
  return rawList
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 8)
    .map((item, idx) => ({ ...item, isNearest: idx === 0 }));
}

export function mapGooglePlacesToPoliceStations(places: GooglePlacePoliceResult[], originCoord: GeoCoord): PoliceStation[] {
  const list: Array<Omit<PoliceStation, 'isNearest'>> = [];
  for (let idx = 0; idx < places.length; idx += 1) {
    const place = places[idx];
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const rawAddr = place.shortFormattedAddress?.trim() || place.formattedAddress?.trim() || 'Khu vực gần bạn';
    const meters = computeHaversineMeters(originCoord, { lat, lng });
    list.push({
      id: place.id || `gmaps-police-${idx}-${lat.toFixed(4)}`,
      name: normalizePoliceStationName(place.displayName?.text, rawAddr),
      address: formatCompactStationAddress(rawAddr),
      phone: place.nationalPhoneNumber?.trim() || null,
      distanceMeters: meters,
      durationMinutes: estimateWalkingMinutes(meters),
      coord: { lat, lng },
    });
  }
  return finalizePoliceStations(list);
}

export function mapGeoapifyFeaturesToPoliceStations(features: PoliceGeoapifyFeature[], originCoord: GeoCoord): PoliceStation[] {
  const list: Array<Omit<PoliceStation, 'isNearest'>> = [];
  for (let idx = 0; idx < features.length; idx += 1) {
    const feature = features[idx];
    const coords = feature.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    const [lng, lat] = coords;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const props = feature.properties ?? {};
    const meters = computeHaversineMeters(originCoord, { lat, lng });
    const cleanStreet = (props.street || props.address_line1 || '').replace(/\s+Street$/i, '').trim();
    const areaPart = props.suburb || props.district || '';
    const rawAddr =
      (props.name?.trim() ? props.address_line2?.trim() : '') ||
      [cleanStreet, areaPart].filter(Boolean).join(', ') ||
      props.formatted?.trim() ||
      'Khu vực gần vị trí của bạn';
    list.push({
      id: props.place_id || `geo-police-${idx}-${lng.toFixed(4)}-${lat.toFixed(4)}`,
      name: normalizePoliceStationName(props.name, cleanStreet, areaPart),
      address: formatCompactStationAddress(rawAddr),
      phone: extractRealPolicePhone(props),
      distanceMeters: meters,
      durationMinutes: estimateWalkingMinutes(meters),
      coord: { lat, lng },
    });
  }
  return finalizePoliceStations(list);
}

export function buildFallbackPoliceStations(originCoord: GeoCoord): PoliceStation[] {
  const seeds = [
    { id: 'fallback-police-ben-nghe', name: 'Công an Phường Bến Nghé', address: '27 Nguyễn Trung Trực, Q.1', phone: '028 3829 1018', coord: { lat: 10.7745, lng: 106.6997 } },
    { id: 'fallback-police-dakao', name: 'Công an Phường Đa Kao', address: '89 Đinh Tiên Hoàng, Q.1', phone: '028 3822 4113', coord: { lat: 10.7878, lng: 106.6976 } },
    { id: 'fallback-police-nguyen-thai-binh', name: 'Công an Phường Nguyễn Thái Bình', address: '104 Yersin, Q.1', phone: null, coord: { lat: 10.7688, lng: 106.6974 } },
    { id: 'fallback-police-q1', name: 'Trụ sở Công an Quận 1', address: '73 Yersin, Q.1', phone: '028 3829 7373', coord: { lat: 10.7676, lng: 106.6959 } },
  ];
  return finalizePoliceStations(
    seeds.map((s) => {
      const meters = computeHaversineMeters(originCoord, s.coord);
      return { ...s, distanceMeters: meters, durationMinutes: estimateWalkingMinutes(meters) };
    }),
  );
}

export async function fetchNearbyPoliceStations(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<{ stations: PoliceStation[]; source: 'google' | 'geoapify' | 'mock' }> {
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
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.nationalPhoneNumber',
        },
        body: JSON.stringify({
          includedTypes: ['police'],
          rankPreference: 'DISTANCE',
          languageCode: 'vi',
          maxResultCount: 8,
          locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: 3000 } },
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { places?: GooglePlacePoliceResult[] };
        const mapped = mapGooglePlacesToPoliceStations(data.places ?? [], originCoord);
        if (mapped.length > 0) return { stations: mapped, source: 'google' };
      }
    } catch {
      if (signal?.aborted) return { stations: buildFallbackPoliceStations(originCoord), source: 'mock' };
    }
  }

  const geoapifyKey = getGeoapifyApiKey();
  if (geoapifyKey) {
    const url = `https://api.geoapify.com/v2/places?categories=service.police&filter=circle:${lng},${lat},3000&bias=proximity:${lng},${lat}&limit=8&apiKey=${encodeURIComponent(geoapifyKey)}`;
    try {
      const res = await fetch(url, { signal });
      if (res.ok) {
        const data = (await res.json()) as { features?: PoliceGeoapifyFeature[] };
        const mapped = mapGeoapifyFeaturesToPoliceStations(data.features ?? [], originCoord);
        if (mapped.length > 0) return { stations: mapped, source: 'geoapify' };
      }
    } catch {
      // Fallback below
    }
  }

  return { stations: buildFallbackPoliceStations(originCoord), source: 'mock' };
}
