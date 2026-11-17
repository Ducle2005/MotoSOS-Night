import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export function SplashScreen({ onFinish, durationMs = 1950 }: SplashScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFadingOut(true), Math.max(0, durationMs - 250));
    const finishTimer = setTimeout(() => onFinish?.(), durationMs);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      role="dialog"
      aria-label="Màn hình khởi động MotoSOS"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-white px-6 py-10 transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="h-6" />

      {/* Vòng quay định vị cứu hộ */}
      <div className="flex flex-col items-center">
        <div className="relative flex h-48 w-48 items-center justify-center">
          {/* Sóng định vị lan tỏa */}
          <div className="absolute inset-0 rounded-full border border-emerald-400/40 bg-emerald-500/10 animate-motosos-pulse" />

          {/* Vòng quỹ đạo chậm */}
          <div className="absolute inset-3 rounded-full border border-dashed border-[#13693E]/25 animate-motosos-orbit-slow">
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-[#13693E] shadow-sm shadow-emerald-700/50" />
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-emerald-400" />
          </div>

          {/* Vòng quét radar nhanh */}
          <div className="absolute inset-7 rounded-full border-2 border-transparent border-t-[#13693E] border-r-[#13693E]/30 animate-motosos-orbit-fast" />

          {/* Khiên cứu hộ trung tâm */}
          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#13693E] text-white shadow-xl shadow-emerald-950/20 animate-motosos-pop">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Tiêu đề & Trạng thái định vị */}
        <div className="mt-7 text-center">
          <h1 className="text-2xl font-black tracking-tight text-slate-950">MotoSOS</h1>
          <p className="mt-1 text-xs font-extrabold uppercase tracking-widest text-[#13693E]">Cứu hộ xe máy 24/7</p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Đang định vị trạm cứu hộ gần bạn...</span>
          </div>
        </div>
      </div>

      {/* Thanh tiến trình đáy */}
      <div className="flex flex-col items-center w-full max-w-xs">
        <div className="h-1.5 w-44 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-[#13693E] animate-motosos-progress" />
        </div>
        <p className="mt-3 text-[11px] font-semibold text-slate-400">Có mặt sau 15 phút • Minh bạch giá chuẩn Grab</p>
      </div>
    </div>
  );
}

export default SplashScreen;
