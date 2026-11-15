import { Check, Copy, MessageSquare, Phone, RefreshCw, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { buildOfflineSmsHref } from '../utils/offlineRescueLogic';

interface OfflineRescueBannerProps {
  isOffline: boolean;
  cachedLocation?: { lat: number; lng: number; address: string } | null;
  selectedService?: string;
  onRetryConnection: () => void;
}

export function OfflineRescueBanner({
  isOffline,
  cachedLocation,
  selectedService,
  onRetryConnection,
}: OfflineRescueBannerProps) {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOffline) return null;

  const lat = (cachedLocation?.lat ?? 10.7769).toFixed(5);
  const lng = (cachedLocation?.lng ?? 106.7009).toFixed(5);
  const address = cachedLocation?.address || 'Trung tâm Quận 1, TP.HCM';
  const smsHref = buildOfflineSmsHref('0909888999', cachedLocation, selectedService);

  const handleCopyCoord = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${lat}, ${lng} (${address})`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch {
      // Fallback or ignore
    }
  };

  return (
    <div
      role="alert"
      data-testid="offline-rescue-banner"
      className="pointer-events-auto relative mx-3.5 mt-2 rounded-2xl border border-amber-400/40 bg-[#090D16] p-3.5 text-white shadow-xl z-[95] animate-step-enter"
    >
      {/* Top row: Status & Retry button */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
          </span>
          <p className="truncate text-xs font-bold text-amber-200">
            Đang mất kết nối mạng • Chế độ Cứu hộ Offline
          </p>
        </div>

        <button
          type="button"
          onClick={onRetryConnection}
          data-testid="offline-retry-btn"
          className="flex shrink-0 items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-[11px] font-medium text-slate-200 transition-colors hover:bg-white/20 active:scale-95"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Thử kết nối lại</span>
        </button>
      </div>

      {/* Middle row: 2 1-tap mobile GSM action buttons */}
      <div className="mt-3 flex items-center gap-2">
        <a
          href="tel:1900636812"
          data-testid="offline-call-hotline"
          className="flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 text-xs font-bold text-slate-950 shadow-md transition-transform hover:bg-emerald-400 active:scale-98"
        >
          <Phone className="h-4 w-4 shrink-0 text-slate-950" />
          <span>Gọi Hotline 24/7</span>
        </a>

        <a
          href={smsHref}
          data-testid="offline-send-sms"
          className="flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-3 text-xs font-bold text-slate-950 shadow-md transition-transform hover:bg-amber-300 active:scale-98"
        >
          <MessageSquare className="h-4 w-4 shrink-0 text-slate-950" />
          <span>Gửi SMS tọa độ</span>
        </a>
      </div>

      {/* Bottom row: Cached GPS & Copy button */}
      <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] px-2.5 py-1.5 text-[11px]">
        <div className="min-w-0 flex-1 truncate text-slate-300">
          <span className="font-mono font-semibold text-emerald-400">{lat}, {lng}</span>
          <span className="mx-1 text-slate-500">•</span>
          <span className="text-slate-400 truncate">{address}</span>
        </div>

        <button
          type="button"
          onClick={handleCopyCoord}
          data-testid="copy-coord-btn"
          className="flex shrink-0 items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[10.5px] font-medium text-slate-200 transition-colors hover:bg-white/20"
        >
          {isCopied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-slate-400" />
              <span>Chép tọa độ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
