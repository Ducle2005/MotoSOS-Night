import { ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { CAMPAIGN_BANNERS, type CampaignBannerItem } from '../../data/homePromotions';
import { useCarouselInteraction } from '../../hooks/useCarouselInteraction';
import {
  computeLoopedActiveIndex,
  computeLoopStepTarget,
  measureCarouselGeometry,
} from '../../utils/carouselLoop';

interface CampaignBannerCarouselProps {
  onSelectBanner: (banner: CampaignBannerItem) => void;
}

const AUTO_STEP_INTERVAL_MS = 3500;

const TAG_STYLE_MAP: Record<CampaignBannerItem['tagTone'], string> = {
  gold: 'border border-amber-300/40 bg-amber-400/20 text-amber-200',
  emerald: 'border border-emerald-300/40 bg-emerald-400/20 text-emerald-200',
  amber: 'border border-orange-300/45 bg-orange-400/20 text-orange-200',
  glass: 'border border-white/25 bg-white/15 text-white backdrop-blur-md',
};

export function CampaignBannerCarousel({ onSelectBanner }: CampaignBannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isAutoSteppingRef = useRef(false);
  const settleTimerRef = useRef<number | null>(null);

  const {
    scrollerRef,
    isDragging,
    isDownRef,
    isTouchingRef,
    isAutoPausedRef,
    pauseTemporarily,
    consumeDidDrag,
    containerInteractionProps,
  } = useCarouselInteraction({
    originalCount: CAMPAIGN_BANNERS.length,
    wrapDuringDrag: true,
    onManualActivity: () => {
      isAutoSteppingRef.current = false;
    },
  });

  const loopBanners = useMemo(
    () =>
      [0, 1].flatMap((copyIndex) =>
        CAMPAIGN_BANNERS.map((banner, originalIndex) => ({
          banner,
          copyIndex,
          originalIndex,
          key: `${banner.id}-${copyIndex}`,
        })),
      ),
    [],
  );

  const normalizeClonedBoundary = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || isDownRef.current || isTouchingRef.current) return;
    const { loopWidth } = measureCarouselGeometry(el, CAMPAIGN_BANNERS.length);
    if (loopWidth > 0 && el.scrollLeft >= loopWidth - 2) {
      el.scrollTo({ left: el.scrollLeft - loopWidth, behavior: 'instant' });
    }
  }, [isDownRef, isTouchingRef, scrollerRef]);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { stepPx } = measureCarouselGeometry(el, CAMPAIGN_BANNERS.length);
    setActiveIndex(computeLoopedActiveIndex(el.scrollLeft, stepPx, CAMPAIGN_BANNERS.length));

    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
    }
    settleTimerRef.current = window.setTimeout(() => {
      isAutoSteppingRef.current = false;
      normalizeClonedBoundary();
    }, 180);
  }, [normalizeClonedBoundary, scrollerRef]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const handleScrollEnd = () => {
      isAutoSteppingRef.current = false;
      normalizeClonedBoundary();
    };
    el.addEventListener('scrollend', handleScrollEnd);

    const intervalId = window.setInterval(() => {
      if (isAutoPausedRef.current || isDownRef.current || isTouchingRef.current) return;
      const { stepPx } = measureCarouselGeometry(el, CAMPAIGN_BANNERS.length);
      if (stepPx <= 0) return;

      const plan = computeLoopStepTarget(el.scrollLeft, stepPx, CAMPAIGN_BANNERS.length);
      if (plan.normalizedStart !== null) {
        el.scrollTo({ left: plan.normalizedStart, behavior: 'instant' });
      }
      isAutoSteppingRef.current = true;
      el.scrollTo({ left: plan.nextScrollLeft, behavior: 'smooth' });
    }, AUTO_STEP_INTERVAL_MS);

    return () => {
      el.removeEventListener('scrollend', handleScrollEnd);
      window.clearInterval(intervalId);
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
    };
  }, [isAutoPausedRef, isDownRef, isTouchingRef, normalizeClonedBoundary, scrollerRef]);

  const handleBannerClick = (banner: CampaignBannerItem, event: MouseEvent) => {
    if (consumeDidDrag()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onSelectBanner(banner);
  };

  return (
    <section aria-label="Ưu đãi & Chiến dịch độc quyền MotoSOS" className="mt-5">
      <div
        ref={scrollerRef}
        data-testid="campaign-banner-carousel"
        onScroll={handleScroll}
        {...containerInteractionProps}
        className={`-mx-5 flex touch-pan-x gap-3 overflow-x-auto scroll-pl-5 px-5 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab snap-x snap-mandatory'
        }`}
      >
        {loopBanners.map(({ banner, copyIndex, key }) => (
          <button
            key={key}
            type="button"
            tabIndex={copyIndex === 1 ? -1 : undefined}
            aria-hidden={copyIndex === 1 ? true : undefined}
            data-testid={
              copyIndex === 0 ? `campaign-banner-${banner.id}` : `campaign-banner-${banner.id}-clone`
            }
            onClick={(e) => handleBannerClick(banner, e)}
            className={`group relative min-h-[154px] w-[86%] shrink-0 snap-start select-none overflow-hidden rounded-3xl bg-gradient-to-br ${banner.fallbackGradient} p-4 text-left shadow-[0_12px_28px_rgba(15,23,42,0.14)] ring-1 ring-inset ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
          >
            <img
              src={banner.imageUrl}
              alt={copyIndex === 0 ? banner.title : ''}
              loading="lazy"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20"
            />

            <div className="relative z-10 flex h-full flex-col justify-between pr-8">
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${TAG_STYLE_MAP[banner.tagTone]}`}
                >
                  {banner.tag}
                </span>
                <h2 className="mt-2 text-[15px] font-extrabold leading-snug text-white text-balance">
                  {banner.title}
                </h2>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition-colors group-hover:bg-emerald-400">
                  <span>{banner.ctaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {banner.voucherId && (
                  <span className="rounded-lg border border-white/20 bg-slate-950/55 px-2 py-1 text-[10px] font-bold tracking-wide text-emerald-300 backdrop-blur-sm">
                    {banner.voucherId}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Dynamic pagination dots */}
      <div className="mt-1.5 flex items-center justify-center gap-1.5">
        {CAMPAIGN_BANNERS.map((banner, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              key={banner.id}
              type="button"
              aria-label={`Xem banner ${idx + 1}`}
              aria-pressed={active}
              onClick={() => {
                const el = scrollerRef.current;
                if (!el) return;
                pauseTemporarily();
                normalizeClonedBoundary();
                const { stepPx } = measureCarouselGeometry(el, CAMPAIGN_BANNERS.length);
                if (stepPx > 0) {
                  el.scrollTo({ left: idx * stepPx, behavior: 'smooth' });
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                active ? 'w-6 bg-slate-900' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}
