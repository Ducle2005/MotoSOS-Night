import { Compass, MapPin, Navigation, Radio, Shield } from 'lucide-react';
import type { CachedOfflineData } from '../utils/offlineRescueLogic';

interface OfflineCompassCardProps {
  cachedData?: CachedOfflineData | null;
  lat?: number;
  lng?: number;
  address?: string;
}

export function OfflineCompassCard({
  cachedData,
  lat,
  lng,
  address,
}: OfflineCompassCardProps) {
  const finalLat = (lat ?? cachedData?.lat ?? 10.7769).toFixed(5);
  const finalLng = (lng ?? cachedData?.lng ?? 106.7009).toFixed(5);
  const finalAddress = address || cachedData?.address || 'Trung tâm Quận 1, TP.HCM';
  const nearestStation = cachedData?.nearestStationName || 'Circle K 24/7 (233m)';

  return (
    <div
      role="region"
      aria-label="Định vị GPS Vệ tinh Offline"
      className="pointer-events-auto mx-4 my-auto max-w-[380px] rounded-3xl border border-amber-400/30 bg-[#090D16] p-5 text-white shadow-2xl transition-all animate-step-enter"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
          </span>
          <p className="text-xs font-bold tracking-wider text-amber-300 uppercase">
            GPS Vệ tinh Ngoại tuyến
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
          <Radio className="h-3 w-3 text-emerald-400" />
          <span>Sóng GSM sẵn sàng</span>
        </span>
      </div>

      {/* Minimalist SVG Radar Compass */}
      <div className="my-4 flex items-center justify-center">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <svg
            className="absolute inset-0 h-full w-full text-emerald-500/20"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="50" y1="4" x2="50" y2="96" stroke="currentColor" strokeWidth="0.8" />
            <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" strokeWidth="0.8" />
          </svg>
          <div className="absolute top-1 text-[9px] font-black text-amber-400">N</div>
          <div className="absolute bottom-1 text-[9px] font-bold text-slate-500">S</div>
          <div className="absolute left-1 text-[9px] font-bold text-slate-500">W</div>
          <div className="absolute right-1 text-[9px] font-bold text-slate-500">E</div>

          {/* Center compass needle */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 shadow-inner">
            <Compass className="h-8 w-8 text-amber-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Coordinates & Location info */}
      <div className="space-y-2 rounded-2xl bg-white/[0.04] border border-white/5 p-3 text-left">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Tọa độ GPS:</span>
          <span className="font-bold text-emerald-400 tracking-wide">
            {finalLat}° N, {finalLng}° E
          </span>
        </div>

        <div className="flex items-start gap-1.5 text-xs">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
          <span className="text-slate-200 line-clamp-2 leading-relaxed font-medium">
            {finalAddress}
          </span>
        </div>

        <div className="flex items-center gap-1.5 border-t border-white/5 pt-2 text-[11px] text-slate-400">
          <Shield className="h-3 w-3 shrink-0 text-emerald-400" />
          <span className="truncate">Điểm an toàn gần nhất: <strong className="text-white font-medium">{nearestStation}</strong></span>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-400">
        Mất sóng 4G nhưng chip GPS vẫn hoạt động độc lập qua vệ tinh.
      </p>
    </div>
  );
}
