import { ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import type { AppNotification } from '../../types/notification';
import { MotoRescueBadgeIcon, resolveBadgeVariant } from '../MotoRescueBadgeIcon';

interface FloatingPushBannerProps {
  banner: AppNotification | null;
  isMapTab?: boolean;
  isTrackingMechanic?: boolean;
  mechanicEta?: number;
  onDismiss: () => void;
  onSelect: (item: AppNotification) => void;
  onOpenTracking?: () => void;
}

const AUTO_DISMISS_MS = 2800;

function getNotificationVisuals(banner: AppNotification) {
  const variant = resolveBadgeVariant(banner.type, banner.title);
  let squircleStyle =
    'bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-[0_4px_12px_rgba(20,184,166,0.3)]';

  if (variant === 'promo') {
    squircleStyle =
      'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]';
  } else if (variant === 'sos') {
    squircleStyle =
      'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]';
  }

  return { squircleStyle, variant };
}

export function FloatingPushBanner({
  banner,
  isMapTab = false,
  isTrackingMechanic = false,
  mechanicEta = 2,
  onDismiss,
  onSelect,
  onOpenTracking,
}: FloatingPushBannerProps) {
  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => {
      onDismiss();
    }, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [banner?.id, onDismiss]);

  const handleManualClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss();
  };

  return (
    <div
      className={`fixed ${
        isMapTab ? 'top-[106px]' : 'top-[62px]'
      } inset-x-0 z-[110] flex justify-center px-3 pointer-events-none transition-[top] duration-300 ease-out`}
    >
      <AnimatePresence mode="wait">
        {banner ? (
          <motion.div
            key={banner.id}
            data-testid="floating-push-banner"
            role="status"
            aria-live="polite"
            onClick={() => onSelect(banner)}
            initial={{ opacity: 0, y: -14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto w-full max-w-[392px] rounded-2xl bg-white/95 border border-emerald-500/30 ring-1 ring-cyan-400/15 shadow-[0_10px_26px_-4px_rgba(16,185,129,0.22),0_4px_10px_rgba(15,23,42,0.08)] overflow-hidden relative transform-gpu transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer"
          >
            {/* Top Micro-HUD Light Gradient Rim */}
            <div className="h-[1.5px] w-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400" />

            <div className="px-3 py-2 flex items-center gap-2.5">
              {/* 3D Squircle Icon (w-8 h-8) + Live Signal Dot */}
              {(() => {
                const { squircleStyle, variant } = getNotificationVisuals(banner);
                return (
                  <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center relative ${squircleStyle}`}>
                    <MotoRescueBadgeIcon
                      variant={variant}
                      className="w-4 h-4 text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.35)]"
                    />
                    <span
                      aria-hidden="true"
                      className="w-2 h-2 rounded-full bg-cyan-400 ring-1.5 ring-white absolute -top-0.5 -right-0.5 animate-pulse"
                    />
                  </div>
                );
              })()}

              {/* Middle Content: Inline Title + LIVE pill, and detailed description below */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[12.5px] font-bold text-slate-900 leading-tight truncate">
                    {banner.title}
                  </p>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 shrink-0">
                    • LIVE
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-600 leading-[1.35] line-clamp-2">
                  {banner.message}
                </p>
              </div>

              {/* Right Cyber Action Button & Compact Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelect(banner)}
                  className="bg-[#090D16] hover:bg-slate-800 text-emerald-400 text-[10.5px] font-bold px-2.5 py-1 rounded-full shrink-0 shadow-xs active:scale-95 transition-transform flex items-center gap-0.5"
                >
                  <span>Xem</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  aria-label="Đóng thông báo"
                  onClick={handleManualClose}
                  className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Bottom Laser Countdown Bar */}
            <div className="w-full bg-slate-100/60 overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
                className="h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
              />
            </div>
          </motion.div>
        ) : isTrackingMechanic ? (
          <motion.button
            key="live-activity-pill"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            type="button"
            data-testid="live-activity-pill"
            onClick={onOpenTracking}
            className="pointer-events-auto flex h-7 items-center gap-2 rounded-full border border-emerald-500/30 bg-[#090D16] px-3 text-white shadow-[0_10px_26px_rgba(9,13,22,0.28)] ring-1 ring-cyan-400/20 transition-all hover:bg-slate-900 active:scale-[0.98]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10.5px] font-semibold tracking-wide flex items-center gap-1.5">
              <MotoRescueBadgeIcon variant="en_route" className="w-3 h-3 text-emerald-400" />
              <span>Thợ Tuấn đang tới • {mechanicEta} phút</span>
            </span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
