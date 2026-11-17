import { useCallback, useEffect, useRef, useState } from 'react';

export function useSmoothHorizontalWheel(resetKey?: unknown) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const targetScrollRef = useRef(0), currentScrollRef = useRef(0), lastTimeRef = useRef(0);
  const maxScrollRef = useRef(0), rafIdRef = useRef<number | null>(null), isPointerDownRef = useRef(false);
  const startXRef = useRef(0), startScrollLeftRef = useRef(0), didDragRef = useRef(false);

  const stopAnimation = useCallback(() => {
    if (rafIdRef.current !== null) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null; }
  }, []);

  const startAnimation = useCallback(() => {
    if (rafIdRef.current !== null) return;
    lastTimeRef.current = performance.now();
    const animate = (now: number) => {
      const el = containerRef.current;
      if (!el) { stopAnimation(); return; }
      const dt = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.033);
      lastTimeRef.current = now;
      currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * (1 - Math.exp(-28 * dt));

      if (Math.abs(targetScrollRef.current - currentScrollRef.current) < 0.25) {
        currentScrollRef.current = targetScrollRef.current;
        el.scrollLeft = currentScrollRef.current;
        stopAnimation();
        return;
      }
      el.scrollLeft = currentScrollRef.current;
      rafIdRef.current = requestAnimationFrame(animate);
    };
    rafIdRef.current = requestAnimationFrame(animate);
  }, [stopAnimation]);

  const updateMaxScroll = useCallback(() => {
    const el = containerRef.current;
    if (el) maxScrollRef.current = Math.max(0, el.scrollWidth - el.clientWidth);
  }, []);

  const resetScroll = useCallback(() => {
    stopAnimation();
    targetScrollRef.current = 0; currentScrollRef.current = 0;
    if (containerRef.current) { containerRef.current.scrollLeft = 0; updateMaxScroll(); }
  }, [stopAnimation, updateMaxScroll]);

  useEffect(() => { resetScroll(); }, [resetKey, resetScroll]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.scrollBehavior = 'auto';
    el.style.scrollSnapType = 'none';
    updateMaxScroll();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => updateMaxScroll());
      ro.observe(el);
      if (el.firstElementChild) ro.observe(el.firstElementChild);
    }

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || maxScrollRef.current <= 0.5) return;
      let rawDelta = e.deltaY;
      if (e.deltaMode === 1) rawDelta *= 32;
      else if (e.deltaMode === 2) rawDelta *= 300;
      const stepDelta = rawDelta * 2.1;

      if (stepDelta < 0 && targetScrollRef.current <= 0.5) return;
      if (stepDelta > 0 && targetScrollRef.current >= maxScrollRef.current - 0.5) return;

      e.preventDefault(); e.stopPropagation();
      if (rafIdRef.current === null) {
        currentScrollRef.current = el.scrollLeft; targetScrollRef.current = el.scrollLeft;
      }
      targetScrollRef.current = Math.max(0, Math.min(maxScrollRef.current, targetScrollRef.current + stepDelta));
      startAnimation();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mouseenter', () => setIsHovered(true));
    el.addEventListener('mouseleave', () => setIsHovered(false));
    return () => { el.removeEventListener('wheel', onWheel); if (ro) ro.disconnect(); stopAnimation(); };
  }, [startAnimation, stopAnimation, updateMaxScroll]);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el || e.button !== 0) return;
    stopAnimation();
    isPointerDownRef.current = true;
    startXRef.current = e.pageX;
    startScrollLeftRef.current = el.scrollLeft;
    currentScrollRef.current = el.scrollLeft;
    targetScrollRef.current = el.scrollLeft;
    didDragRef.current = false;

    const onWindowMouseMove = (moveEv: MouseEvent) => {
      if (!isPointerDownRef.current || !containerRef.current) return;
      const dx = moveEv.pageX - startXRef.current;
      if (!didDragRef.current && Math.abs(dx) > 6) {
        didDragRef.current = true;
        setIsDragging(true);
      }
      if (didDragRef.current && containerRef.current) {
        stopAnimation();
        containerRef.current.scrollLeft = startScrollLeftRef.current - dx;
        currentScrollRef.current = containerRef.current.scrollLeft;
        targetScrollRef.current = containerRef.current.scrollLeft;
      }
    };

    const onWindowMouseUp = () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
      isPointerDownRef.current = false;
      setIsDragging(false);
      setTimeout(() => { didDragRef.current = false; }, 80);
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
  };

  return {
    containerRef, isHovered, isDragging, resetScroll,
    dragHandlers: {
      onMouseDown,
      onClickCapture: (e: React.MouseEvent) => {
        if (didDragRef.current) {
          e.preventDefault();
          e.stopPropagation();
          didDragRef.current = false;
        }
      },
      onTouchStart: () => {
        stopAnimation();
        if (containerRef.current) {
          currentScrollRef.current = containerRef.current.scrollLeft;
          targetScrollRef.current = containerRef.current.scrollLeft;
        }
      },
    },
    consumeDidDrag: () => { const was = didDragRef.current; didDragRef.current = false; return was; },
  };
}
