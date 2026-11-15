import { MessageSquare, Phone, WifiOff } from 'lucide-react';
import type { GeoCoord } from '../../types/rescue';

interface OfflineRescueBannerProps {
  isOnline: boolean;
  coord?: GeoCoord;
  address?: string;
}

export function OfflineRescueBanner({
  isOnline,
  coord,
  address,
}: OfflineRescueBannerProps) {
  if (isOnline) return null;

  const lat = coord?.lat?.toFixed(5) ?? '10.7769';
  const lng = coord?.lng?.toFixed(5) ?? '106.7009';
  const locText = address || 'TP.HCM';
  const smsBody = encodeURIComponent(
    `SOS MotoSOS: Xe toi can cuu ho gap! Toa do GPS: ${lat}, ${lng} (gan ${locText}). Vui long lien he lai gap!`,
  );

  return (
    <div
      role="alert"
      data-testid="offline-rescue-banner"
      className="pointer-events-auto fixed top-2 inset-x-2 z-[130] mx-auto max-w-[414px] rounded-2xl border border-amber-300 bg-amber-500/95 p-3 text-white shadow-xl backdrop-blur-md transition-all animate-step-enter"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <WifiOff className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black tracking-tight text-white uppercase">
            Chế độ cứu hộ ngoại tuyến (Offline)
          </p>
          <p className="truncate text-[11px] text-amber-100 font-medium">
            Đang mất sóng 4G • Dùng trực tiếp sóng thoại GSM &amp; SMS
          </p>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <a
          href="tel:19006868"
          data-testid="offline-call-hotline"
          className="flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3 text-xs font-bold text-white shadow-sm hover:bg-slate-900 active:scale-95 transition-all"
        >
          <Phone className="h-3.5 w-3.5 text-emerald-400" />
          <span>Gọi Hotline 1900</span>
        </a>

        <a
          href={`sms:0909888999?body=${smsBody}`}
          data-testid="offline-send-sms"
          className="flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-white/20 px-3 text-xs font-bold text-white shadow-sm hover:bg-white/30 active:scale-95 transition-all"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Soạn SMS tọa độ</span>
        </a>
      </div>
    </div>
  );
}
