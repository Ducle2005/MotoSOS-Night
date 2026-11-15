export const OFFLINE_CACHE_KEY = 'motosos_offline_cache';

export interface CachedOfflineData {
  lat: number;
  lng: number;
  address: string;
  nearestStationName?: string;
  nearestStationDistMeters?: number;
  timestamp: number;
}

export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s,.-]/g, '')
    .trim();
}

export function getSmsDelimiter(userAgent?: string): string {
  const ua = userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  return /iphone|ipad|ipod/i.test(ua) ? '&body=' : '?body=';
}

export function buildOfflineSmsMessage(
  lat?: number,
  lng?: number,
  address?: string,
  serviceName?: string,
): string {
  const latStr = (lat ?? 10.7769).toFixed(5);
  const lngStr = (lng ?? 106.7009).toFixed(5);
  const cleanAddr = removeVietnameseAccents(address || 'TP.HCM') || 'Trung tam TP.HCM';
  const cleanService = removeVietnameseAccents(serviceName || 'su co') || 'su co';
  return `SOS MotoSOS: Toa do ${latStr},${lngStr} gan ${cleanAddr}. Xe bi ${cleanService} can cuu ho gap!`;
}

export function buildOfflineSmsHref(
  phone: string,
  location?: { lat: number; lng: number; address?: string } | null,
  serviceName?: string,
  userAgent?: string,
): string {
  const cleanPhone = phone.replace(/\s+/g, '');
  const delimiter = getSmsDelimiter(userAgent);
  const msg = buildOfflineSmsMessage(location?.lat, location?.lng, location?.address, serviceName);
  return `sms:${cleanPhone}${delimiter}${encodeURIComponent(msg)}`;
}

export function saveOfflineCache(data: CachedOfflineData): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(data));
    }
  } catch {
    // Ignore storage quota or security errors
  }
}

export function loadOfflineCache(): CachedOfflineData | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(OFFLINE_CACHE_KEY);
      if (raw) return JSON.parse(raw) as CachedOfflineData;
    }
  } catch {
    // Ignore parsing error
  }
  return null;
}
