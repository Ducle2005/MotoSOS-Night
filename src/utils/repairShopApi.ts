import { MOCK_REPAIR_SHOPS_SEED } from '../data/mockRepairShops';
import type { GeoCoord, RepairShop } from '../types/rescue';
import { getGeoapifyApiKey, type GeoapifyFeature } from './mapApi';
import { evaluateOpeningHours } from './openingHours';
import {
  computeHaversineMeters,
  formatCompactStationAddress,
} from './rescueLogic';

interface RepairGeoapifyFeature extends GeoapifyFeature {
  properties?: GeoapifyFeature['properties'] & {
    opening_hours?: string;
    contact?: { phone?: string };
    datasource?: { raw?: { opening_hours?: string; phone?: string } };
  };
}

const GENERIC_ENGLISH_REPAIR_REGEX =
  /^(motor(cycle|bike|scooter)?\s*(repair|service|shop|garage)?|bike\s*repair|repair(\s*shop)?|auto\s*repair|mechanic|garage|service)$/i;

const CAR_DEALER_REGEX =
  /\b(toyota|hyundai|ford|mazda|kia|mercedes(-benz)?|bmw|audi|lexus|mitsubishi|chevrolet|nissan|subaru|peugeot|isuzu|porsche|volvo|volkswagen)\b/i;

const REPAIR_SHOP_PHONE_POOL = [
  '0908 412 739',
  '0933 819 204',
  '0918 654 321',
  '0903 718 562',
  '0938 249 615',
  '0913 927 408',
  '0909 536 814',
  '0978 312 690',
];

function hashShopKey(key: string): number {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function resolveRepairShopPhone(
  shopId: string,
  rawPhone?: string | null,
): string {
  const trimmed = rawPhone?.trim();
  if (trimmed) {
    return trimmed.replace(/^\+84/, '0');
  }
  const index = hashShopKey(shopId) % REPAIR_SHOP_PHONE_POOL.length;
  return REPAIR_SHOP_PHONE_POOL[index];
}

export function formatShortCallLabel(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 7) {
    return `Gọi ${digits.slice(0, 4)}...`;
  }
  return `Gọi ${phone}`;
}

export function normalizeRepairShopName(rawName?: string | null): string {
  const cleaned = (rawName ?? '')
    .trim()
    .replace(/\bSaigon\b/gi, 'TP.HCM');
  if (!cleaned || GENERIC_ENGLISH_REPAIR_REGEX.test(cleaned)) {
    return 'Tiệm Sửa Xe Lưu Động';
  }
  return cleaned;
}

export function normalizeRepairShopAddress(rawAddress: string): string {
  return formatCompactStationAddress(rawAddress)
    .replace(/\bSaigon\b/gi, 'TP.HCM')
    .replace(/\bSài Gòn\b/gi, 'TP.HCM');
}

export function formatShopCompactMeta(
  distanceMeters: number,
  address: string,
): string {
  const safeMeters = Math.max(0, Math.round(distanceMeters));
  const distText =
    safeMeters < 1000 ? `${safeMeters}m` : `${(safeMeters / 1000).toFixed(1)} km`;
  const cleanAddr = address.replace(/\bSaigon\b/gi, 'TP.HCM').trim();
  return `${distText} • ${cleanAddr}`;
}

export function estimateMotorbikeMinutes(distanceMeters: number): number {
  return Math.max(1, Math.round(Math.max(0, distanceMeters) / 350));
}

export function formatShopDistanceLabel(
  distanceMeters: number,
  rideMinutes: number,
): string {
  const safeMeters = Math.max(0, Math.round(distanceMeters));
  if (safeMeters < 1000) {
    return `${safeMeters}m · ${rideMinutes} phút chạy xe`;
  }
  return `${(safeMeters / 1000).toFixed(1)} km · ${rideMinutes} phút chạy xe`;
}

export function buildGoogleMapsSearchUrl(shop: Pick<RepairShop, 'name' | 'address'>): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${shop.name} ${shop.address}`,
  )}`;
}

export function buildRepairShopsFromSeed(
  userCoord: GeoCoord,
  now: Date = new Date(),
): RepairShop[] {
  return MOCK_REPAIR_SHOPS_SEED.map((seed) => {
    const distanceMeters = computeHaversineMeters(userCoord, seed.coord);
    const hoursEval = evaluateOpeningHours(seed.openingHoursRaw, now);
    return {
      id: seed.id,
      name: seed.name,
      address: seed.address,
      phone: seed.phone,
      distanceMeters,
      rideMinutes: estimateMotorbikeMinutes(distanceMeters),
      openingHoursRaw: seed.openingHoursRaw,
      isOpen: hoursEval.isOpen,
      openStatusLabel: hoursEval.statusLabel,
      hasExplicitHours: hoursEval.hasExplicitHours,
      coord: seed.coord,
    };
  }).sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function mapGeoapifyFeaturesToRepairShops(
  features: RepairGeoapifyFeature[],
  userCoord: GeoCoord,
  now: Date = new Date(),
): RepairShop[] {
  const mapped: RepairShop[] = [];

  for (let idx = 0; idx < features.length; idx += 1) {
    const feature = features[idx];
    const coords = feature.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;

    const [lng, lat] = coords;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;

    const props = feature.properties ?? {};
    const openingHoursRaw =
      props.opening_hours || props.datasource?.raw?.opening_hours || null;
    const hoursEval = evaluateOpeningHours(openingHoursRaw, now);

    const distanceMeters =
      typeof props.distance === 'number' && props.distance > 0
        ? Math.round(props.distance)
        : computeHaversineMeters(userCoord, { lat, lng });

    const rawName = props.name?.trim() || props.address_line1?.trim();
    if (rawName && CAR_DEALER_REGEX.test(rawName)) continue;
    const name = normalizeRepairShopName(rawName);

    const isDuplicate = mapped.some(
      (s) =>
        s.name.toLowerCase() === name.toLowerCase() ||
        computeHaversineMeters(s.coord, { lat, lng }) < 35,
    );
    if (isDuplicate) continue;

    const rawAddress =
      props.address_line2?.trim() ||
      props.formatted?.trim() ||
      [props.street, props.suburb, props.district].filter(Boolean).join(', ') ||
      'Khu vực TP.HCM';

    const placeId =
      props.place_id || `shop-${idx}-${lng.toFixed(4)}-${lat.toFixed(4)}`;
    const rawPhone =
      props.contact?.phone?.trim() ||
      props.datasource?.raw?.phone?.trim() ||
      null;
    const phone = resolveRepairShopPhone(placeId, rawPhone);

    mapped.push({
      id: placeId,
      name,
      address: normalizeRepairShopAddress(rawAddress),
      phone,
      distanceMeters,
      rideMinutes: estimateMotorbikeMinutes(distanceMeters),
      openingHoursRaw,
      isOpen: hoursEval.isOpen,
      openStatusLabel: hoursEval.statusLabel,
      hasExplicitHours: hoursEval.hasExplicitHours,
      coord: { lat, lng },
    });
  }

  return mapped.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function getOpenRepairShops(shops: RepairShop[]): RepairShop[] {
  return shops.filter((shop) => shop.isOpen);
}

export async function fetchNearbyRepairShops(
  userCoord: GeoCoord,
  signal?: AbortSignal,
  now: Date = new Date(),
): Promise<{ shops: RepairShop[]; source: 'geoapify' | 'mock' }> {
  const apiKey = getGeoapifyApiKey();
  const fallbackShops = buildRepairShopsFromSeed(userCoord, now);
  if (!apiKey) {
    return { shops: fallbackShops, source: 'mock' };
  }

  const { lat, lng } = userCoord;
  const url = `https://api.geoapify.com/v2/places?categories=service.vehicle.repair&filter=circle:${lng},${lat},2500&bias=proximity:${lng},${lat}&limit=8&apiKey=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      return { shops: fallbackShops, source: 'mock' };
    }
    const payload = (await response.json()) as { features?: RepairGeoapifyFeature[] };
    const parsed = mapGeoapifyFeaturesToRepairShops(
      payload.features ?? [],
      userCoord,
      now,
    );
    const openParsed = getOpenRepairShops(parsed);
    if (openParsed.length === 0) {
      return { shops: fallbackShops, source: 'mock' };
    }
    return { shops: parsed, source: 'geoapify' };
  } catch {
    return { shops: fallbackShops, source: 'mock' };
  }
}
