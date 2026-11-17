import type { ActiveLocation, ActiveRescueInfo, GeoCoord } from '../types/rescue';

export interface ExactLocationResult {
  lat: number;
  lng: number;
  latStr: string;
  lngStr: string;
  address: string;
  accuracyMeters?: number;
  source: 'gps' | 'map_pin';
  sourceLabel: string;
}

export interface SosSharePayload {
  text: string;
  pinUrl: string;
  directionsUrl: string;
  mapsUrl: string;
  lat: number;
  lng: number;
  latStr: string;
  lngStr: string;
  address: string;
}

export interface SosShareOptions {
  location?: Partial<ActiveLocation> | GeoCoord | null;
  address?: string;
  vehiclePlate?: string;
  activeRescue?: ActiveRescueInfo | null;
}

export async function getExactUserCoordinates(
  fallbackLocation?: Partial<ActiveLocation> | GeoCoord | null,
  fallbackAddress?: string,
): Promise<ExactLocationResult> {
  const defaultLat = fallbackLocation && 'lat' in fallbackLocation && typeof fallbackLocation.lat === 'number'
    ? fallbackLocation.lat : 10.7769;
  const defaultLng = fallbackLocation && 'lng' in fallbackLocation && typeof fallbackLocation.lng === 'number'
    ? fallbackLocation.lng : 106.7009;
  const address = (fallbackLocation && 'address' in fallbackLocation && fallbackLocation.address)
    ? fallbackLocation.address : fallbackAddress || 'Vị trí hiện tại của tôi';

  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return {
      lat: defaultLat, lng: defaultLng, latStr: defaultLat.toFixed(6), lngStr: defaultLng.toFixed(6),
      address, source: 'map_pin', sourceLabel: 'Tọa độ điểm đón trên bản đồ',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const acc = Math.round(pos.coords.accuracy);
        resolve({
          lat: pos.coords.latitude, lng: pos.coords.longitude,
          latStr: pos.coords.latitude.toFixed(6), lngStr: pos.coords.longitude.toFixed(6),
          address, accuracyMeters: acc, source: 'gps', sourceLabel: `GPS thực tế (±${acc}m)`,
        });
      },
      () => {
        resolve({
          lat: defaultLat, lng: defaultLng, latStr: defaultLat.toFixed(6), lngStr: defaultLng.toFixed(6),
          address, source: 'map_pin', sourceLabel: 'Tọa độ điểm đón trên bản đồ',
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  });
}

export function buildSosSharePayload(options: SosShareOptions): SosSharePayload {
  const lat = options.location && 'lat' in options.location && typeof options.location.lat === 'number'
    ? options.location.lat : 10.7769;
  const lng = options.location && 'lng' in options.location && typeof options.location.lng === 'number'
    ? options.location.lng : 106.7009;
  const latStr = lat.toFixed(6);
  const lngStr = lng.toFixed(6);
  const address = options.address || (options.location && 'address' in options.location && options.location.address ? options.location.address : 'Vị trí sự cố');
  const vehicle = options.vehiclePlate || '59-P2 842.19';

  const pinUrl = `https://www.google.com/maps/search/?api=1&query=${latStr},${lngStr}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latStr},${lngStr}`;

  let text = `🆘 [MotoSOS - VỊ TRÍ KHẨN CẤP]\n📍 Địa chỉ: ${address}\n📌 Tọa độ: ${latStr},${lngStr}\n🗺️ Xem vị trí ghim: ${pinUrl}\n🧭 Chỉ đường tới ngay: ${directionsUrl}\n🏍️ Biển số xe: ${vehicle}`;
  if (options.activeRescue) {
    text += `\n🔧 Thợ đang hỗ trợ: ${options.activeRescue.mechanic.name} (${options.activeRescue.mechanic.licensePlate})`;
  }

  return { text, pinUrl, directionsUrl, mapsUrl: pinUrl, lat, lng, latStr, lngStr, address };
}

export async function copyTextSafely(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* Fallback */ }
  }
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch { return false; }
  }
  return false;
}

export function normalizeVietnamPhone(phone: string): string {
  let clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('+84')) clean = '0' + clean.slice(3);
  else if (clean.startsWith('84') && clean.length >= 11) clean = '0' + clean.slice(2);
  return clean;
}

export async function shareViaZalo(phone: string, payload: SosSharePayload): Promise<{ success: boolean; message: string }> {
  const cleanPhone = normalizeVietnamPhone(phone);
  await copyTextSafely(payload.text);
  const zaloUrl = cleanPhone ? `https://zalo.me/${cleanPhone}` : 'https://zalo.me/';
  if (typeof window !== 'undefined') window.open(zaloUrl, '_blank', 'noopener,noreferrer');
  return { success: true, message: 'Đã chép tọa độ GPS! Nhấn Dán vào khung chat Zalo vừa mở để gửi ngay.' };
}

export async function shareViaMessenger(payload: SosSharePayload): Promise<{ success: boolean; message: string }> {
  await copyTextSafely(payload.text);
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'Vị trí khẩn cấp MotoSOS', text: payload.text, url: payload.pinUrl });
      return { success: true, message: 'Đã mở bảng chia sẻ để gửi qua Messenger!' };
    } catch { /* User dismissed */ }
  }
  if (typeof window !== 'undefined') window.open('https://www.messenger.com/', '_blank', 'noopener,noreferrer');
  return { success: true, message: 'Đã chép tọa độ GPS! Nhấn Ctrl+V (Dán) gửi cho bạn bè trên Messenger.' };
}
