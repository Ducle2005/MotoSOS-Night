import { Sparkles } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { PARTNER_PERKS, type PartnerPerkItem } from '../../data/homePromotions';
import { useCarouselInteraction } from '../../hooks/useCarouselInteraction';
import { computeLoopedScrollLeft, measureCarouselGeometry } from '../../utils/carouselLoop';

interface PartnerPerksCarouselProps {
  onSelectPerk: (perk: PartnerPerkItem) => void;
}

const GLIDE_PX_PER_60HZ_FRAME = 0.5;

export function PartnerPerksCarousel({ onSelectPerk }: PartnerPerksCarouselProps) {
  const {
    scrollerRef,
    isDragging,
    isDownRef,
    isTouchingRef,
    isAutoPausedRef,
    consumeDidDrag,
    containerInteractionProps,
  } = useCarouselInteraction({
    originalCount: PARTNER_PERKS.length,
    wrapDuringDrag: true,
  });

  const loopPerks = useMemo(
    () =>
      [0, 1].flatMap((copyIndex) =>
        PARTNER_PERKS.map((perk) => ({
          perk,
          copyIndex,
          key: `${perk.id}-${copyIndex}`,
        })),
      ),
    [],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let rafId = 0;
    let virtualLeft = el.scrollLeft;
    let lastTimestamp = 0;

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const dt = Math.min(48, Math.max(8, timestamp - lastTimestamp));
      lastTimestamp = timestamp;

      if (isAutoPausedRef.current || isDownRef.current || isTouchingRef.current) {
        virtualLeft = el.scrollLeft;
      } else {
        const { loopWidth } = measureCarouselGeometry(el, PARTNER_PERKS.length);
        if (loopWidth > 0) {
          const stepPx = GLIDE_PX_PER_60HZ_FRAME * (dt / 16.6667);
          virtualLeft = computeLoopedScrollLeft(virtualLeft + stepPx, loopWidth);
          el.scrollLeft = virtualLeft;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isAutoPausedRef, isDownRef, isTouchingRef, scrollerRef]);

  return (
    <section aria-label="Đặc quyền Đối tác 24/7" className="mt-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-500" aria-hidden="true" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900">
            Đặc Quyền Đối Tác 24/7
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Ưu đãi thành viên</span>
      </div>

      <div
        ref={scrollerRef}
        data-testid="partner-perks-carousel"
        {...containerInteractionProps}
        className={`-mx-5 mt-3 flex touch-pan-x gap-3 overflow-x-auto px-5 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {loopPerks.map(({ perk, copyIndex, key }) => (
          <button
            key={key}
            type="button"
            tabIndex={copyIndex === 1 ? -1 : undefined}
            aria-hidden={copyIndex === 1 ? true : undefined}
            data-testid={copyIndex === 0 ? `partner-perk-${perk.id}` : `partner-perk-${perk.id}-clone`}
            onClick={(e) => {
              if (consumeDidDrag()) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              onSelectPerk(perk);
            }}
            className="group w-[195px] shrink-0 select-none overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition-all hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className={`relative h-24 w-full overflow-hidden bg-gradient-to-br ${perk.fallbackGradient}`}>
              <img
                src={perk.imageUrl}
                alt={copyIndex === 0 ? perk.title : ''}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {perk.voucherId && (
                <span className="absolute right-2 bottom-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-200 backdrop-blur-sm">
                  {perk.voucherId}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-extrabold text-slate-900">
                {perk.title}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                {perk.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
