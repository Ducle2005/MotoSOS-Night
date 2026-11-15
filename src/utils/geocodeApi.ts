import type { GeoCoord, LocationSuggestion } from '../types/rescue';
import { getGeoapifyApiKey } from './mapApi';
import {
  computeHaversineMeters,
  formatCompactStationAddress,
} from './rescueLogic';

export interface GeoapifyGeocodeFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    place_id?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    quarter?: string;
    suburb?: string;
    district?: string;
    city?: string;
    address_line1?: string;
    address_line2?: string;
    formatted?: string;
    distance?: number;
  };
}

export function formatSuggestionDistance(distanceMeters: number): string {
  const safeMeters = Math.max(0, Math.round(distanceMeters));
  if (safeMeters < 1000) {
    return `${safeMeters} m`;
  }
  return `${(safeMeters / 1000).toFixed(1)} km`;
}

export function parseReverseGeocodeAddress(
  feature: GeoapifyGeocodeFeature | undefined,
  fallbackCoord: GeoCoord,
): string {
  const props = feature?.properties;
  if (!props) {
    return `Vị trí hiện tại (${fallbackCoord.lat.toFixed(4)}, ${fallbackCoord.lng.toFixed(4)})`;
  }

  const streetPart = [props.housenumber, props.street]
    .filter((part): part is string => Boolean(part && part.trim()))
    .map((part) => part.trim())
    .join(' ');

  const areaPart = (
    props.suburb ||
    props.quarter ||
    props.district ||
    props.city ||
    ''
  ).trim();

  if (streetPart && areaPart) {
    return streetPart.toLowerCase().includes(areaPart.toLowerCase())
      ? streetPart
      : `${streetPart}, ${areaPart}`;
  }
  if (streetPart) return streetPart;
  if (areaPart) return areaPart;

  return `Vị trí hiện tại (${fallbackCoord.lat.toFixed(4)}, ${fallbackCoord.lng.toFixed(4)})`;
}

export function mapAutocompleteFeatures(
  features: GeoapifyGeocodeFeature[],
  originCoord: GeoCoord,
): LocationSuggestion[] {
  const results: LocationSuggestion[] = [];

  for (let idx = 0; idx < features.length; idx += 1) {
    const feature = features[idx];
    const coords = feature.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    const [lng, lat] = coords;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const props = feature.properties ?? {};
    const addressLine1 =
      props.address_line1?.trim() ||
      props.name?.trim() ||
      props.street?.trim() ||
      'Địa điểm đã chọn';

    const rawLine2 =
      props.address_line2?.trim() ||
      [props.suburb, props.district, props.city].filter(Boolean).join(', ') ||
      props.formatted?.trim() ||
      'Việt Nam';

    const addressLine2 = formatCompactStationAddress(rawLine2);
    const distanceMeters = computeHaversineMeters(originCoord, { lat, lng });

    results.push({
      id: props.place_id || `loc-${idx}-${lat.toFixed(5)}-${lng.toFixed(5)}`,
      addressLine1,
      addressLine2,
      fullAddress: addressLine2 && addressLine2 !== addressLine1
        ? `${addressLine1}, ${addressLine2}`
        : addressLine1,
      lat,
      lng,
      distanceMeters,
    });
  }

  return results;
}

export function buildReverseGeocodeUrl(
  coord: GeoCoord,
  apiKey: string,
): string {
  return `https://api.geoapify.com/v1/geocode/reverse?lat=${coord.lat}&lon=${coord.lng}&lang=vi&apiKey=${encodeURIComponent(apiKey)}`;
}

export function buildAutocompleteUrl(
  query: string,
  biasCoord: GeoCoord,
  apiKey: string,
): string {
  return `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&lang=vi&filter=countrycode:vn&bias=proximity:${biasCoord.lng},${biasCoord.lat}&limit=5&apiKey=${encodeURIComponent(apiKey)}`;
}

export async function reverseGeocodeCoord(
  coord: GeoCoord,
  signal?: AbortSignal,
): Promise<string> {
  const apiKey = getGeoapifyApiKey();
  if (!apiKey) {
    return `Vị trí GPS (${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)})`;
  }

  try {
    const response = await fetch(buildReverseGeocodeUrl(coord, apiKey), {
      signal,
    });
    if (!response.ok) {
      return `Vị trí GPS (${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)})`;
    }
    const payload = (await response.json()) as {
      features?: GeoapifyGeocodeFeature[];
    };
    return parseReverseGeocodeAddress(payload.features?.[0], coord);
  } catch {
    return `Vị trí GPS (${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)})`;
  }
}

export async function fetchAddressAutocomplete(
  query: string,
  biasCoord: GeoCoord,
  signal?: AbortSignal,
): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const apiKey = getGeoapifyApiKey();
  if (!apiKey) return [];

  try {
    const response = await fetch(
      buildAutocompleteUrl(trimmed, biasCoord, apiKey),
      { signal },
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as {
      features?: GeoapifyGeocodeFeature[];
    };
    return mapAutocompleteFeatures(payload.features ?? [], biasCoord);
  } catch {
    return [];
  }
}
