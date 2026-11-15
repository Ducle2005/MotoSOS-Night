import { useCallback, useEffect, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import { measureCarouselGeometry } from '../utils/carouselLoop';

const DRAG_THRESHOLD_PX = 6;
const RESUME_DELAY_MS = 1500;

interface UseCarouselInteractionOptions {
  originalCount: number;
  wrapDuringDrag?: boolean;
  onManualActivity?: () => void;
}

export function useCarouselInteraction({
  originalCount,
  wrapDuringDrag = false,
  onManualActivity,
}: UseCarouselInteractionOptions) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const isDownRef = useRef(false);
  const isTouchingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const lastTouchTsRef = useRef(0);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);
  const didDragRef = useRef(false);
  const isAutoPausedRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const pauseNow = useCallback(() => {
    clearResumeTimer();
    isAutoPausedRef.current = true;
  }, [clearResumeTimer]);

  const scheduleResume = useCallback(() => {
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      resumeTimerRef.current = null;
      if (!isTouchingRef.current && !isHoveredRef.current && !isDownRef.current) {
        isAutoPausedRef.current = false;
      }
    }, RESUME_DELAY_MS);
  }, [clearResumeTimer]);

  const pauseTemporarily = useCallback(() => {
    pauseNow();
    scheduleResume();
  }, [pauseNow, scheduleResume]);

  useEffect(() => {
    return () => clearResumeTimer();
  }, [clearResumeTimer]);

  const handleTouchStart = useCallback(() => {
    lastTouchTsRef.current = Date.now();
    isTouchingRef.current = true;
    pauseNow();
    onManualActivity?.();
  }, [onManualActivity, pauseNow]);

  const handleTouchEnd = useCallback(() => {
    isTouchingRef.current = false;
    scheduleResume();
  }, [scheduleResume]);

  const handleMouseEnter = useCallback(() => {
    if (Date.now() - lastTouchTsRef.current < 800) return;
    isHoveredRef.current = true;
    pauseNow();
  }, [pauseNow]);

  const handleMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const el = scrollerRef.current;
      if (!el) return;
      isDownRef.current = true;
      startXRef.current = event.pageX;
      startScrollRef.current = el.scrollLeft;
      didDragRef.current = false;
      pauseNow();
      onManualActivity?.();
    },
    [onManualActivity, pauseNow],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const el = scrollerRef.current;
      if (!isDownRef.current || !el) return;
      const dx = event.pageX - startXRef.current;
      if (Math.abs(dx) > DRAG_THRESHOLD_PX) {
        didDragRef.current = true;
        if (!isDragging) setIsDragging(true);
        let nextScroll = startScrollRef.current - dx;
        if (wrapDuringDrag) {
          const { loopWidth } = measureCarouselGeometry(el, originalCount);
          if (loopWidth > 0) {
            if (nextScroll >= loopWidth) {
              nextScroll -= loopWidth;
              startScrollRef.current -= loopWidth;
            } else if (nextScroll < 0) {
              nextScroll += loopWidth;
              startScrollRef.current += loopWidth;
            }
          }
        }
        el.scrollLeft = nextScroll;
      }
    },
    [isDragging, originalCount, wrapDuringDrag],
  );

  const finishDrag = useCallback(() => {
    if (isDownRef.current || isDragging) {
      isDownRef.current = false;
      setIsDragging(false);
      window.setTimeout(() => {
        didDragRef.current = false;
      }, 0);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    finishDrag();
    if (!isHoveredRef.current && !isTouchingRef.current) {
      scheduleResume();
    }
  }, [finishDrag, scheduleResume]);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    finishDrag();
    scheduleResume();
  }, [finishDrag, scheduleResume]);

  const consumeDidDrag = useCallback(() => {
    if (!didDragRef.current) return false;
    didDragRef.current = false;
    return true;
  }, []);

  return {
    scrollerRef,
    isDragging,
    isDownRef,
    isTouchingRef,
    isAutoPausedRef,
    pauseTemporarily,
    consumeDidDrag,
    containerInteractionProps: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onDragStart: (e: DragEvent<HTMLDivElement>) => e.preventDefault(),
    },
  };
}
