import { useCallback, useRef, useState } from 'react';

export type HorizontalWheelCallbackRef = ((node: HTMLDivElement | null) => void) & { current: HTMLDivElement | null };

export function useSmoothHorizontalWheel(_resetKey?: unknown) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const targetScrollRef = useRef(0), currentScrollRef = useRef(0);
  const rafIdRef = useRef<number | null>(null), isPointerDownRef = useRef(false);
  const startXRef = useRef(0), startScrollLeftRef = useRef(0), didDragRef = useRef(false);
  const cleanupListenerRef = useRef<(() => void) | null>(null);

  const stopAnimation = useCallback(() => {
    if (rafIdRef.current !== null) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null; }
  }, []);

  const resetScroll = useCallback(() => {
    stopAnimation(); targetScrollRef.current = 0; currentScrollRef.current = 0;
    if (elRef.current) elRef.current.scrollLeft = 0;
  }, [stopAnimation]);

  const startAnimation = useCallback(() => {
    if (rafIdRef.current !== null) return;
    const animate = () => {
      const el = elRef.current;
      if (!el) { stopAnimation(); return; }
      currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * 0.22;
      if (Math.abs(targetScrollRef.current - currentScrollRef.current) < 0.5) {
        currentScrollRef.current = targetScrollRef.current; el.scrollLeft = currentScrollRef.current; stopAnimation(); return;
      }
      el.scrollLeft = currentScrollRef.current; rafIdRef.current = requestAnimationFrame(animate);
    };
    rafIdRef.current = requestAnimationFrame(animate);
  }, [stopAnimation]);

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (cleanupListenerRef.current) { cleanupListenerRef.current(); cleanupListenerRef.current = null; }
    elRef.current = node;
    (setContainerRef as unknown as { current: HTMLDivElement | null }).current = node;
    if (!node) return;
    node.style.scrollBehavior = 'auto'; node.style.scrollSnapType = 'none';

    const onWheel = (e: WheelEvent) => {
      const el = elRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 1) return;
      const rawDelta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (rawDelta === 0) return;
      e.preventDefault(); e.stopPropagation();
      const normalized = e.deltaMode === 1 ? rawDelta * 32 : rawDelta;
      if (rafIdRef.current === null) { currentScrollRef.current = el.scrollLeft; targetScrollRef.current = el.scrollLeft; }
      targetScrollRef.current = Math.max(0, Math.min(maxScroll, targetScrollRef.current + normalized * 1.6));
      startAnimation();
    };

    const onEnter = () => setIsHovered(true), onLeave = () => setIsHovered(false);
    node.addEventListener('wheel', onWheel, { passive: false });
    node.addEventListener('mouseenter', onEnter); node.addEventListener('mouseleave', onLeave);
    cleanupListenerRef.current = () => {
      node.removeEventListener('wheel', onWheel); node.removeEventListener('mouseenter', onEnter);
      node.removeEventListener('mouseleave', onLeave); stopAnimation();
    };
  }, [startAnimation, stopAnimation]);

  (setContainerRef as unknown as { current: HTMLDivElement | null }).current = elRef.current;

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = elRef.current;
    if (!el || e.button !== 0) return;
    stopAnimation(); isPointerDownRef.current = true; startXRef.current = e.pageX;
    startScrollLeftRef.current = el.scrollLeft; currentScrollRef.current = targetScrollRef.current = el.scrollLeft; didDragRef.current = false;

    const onWindowMouseMove = (moveEv: MouseEvent) => {
      if (!isPointerDownRef.current || !elRef.current) return;
      const dx = moveEv.pageX - startXRef.current;
      if (!didDragRef.current && Math.abs(dx) > 5) { didDragRef.current = true; setIsDragging(true); }
      if (didDragRef.current && elRef.current) {
        stopAnimation(); elRef.current.scrollLeft = startScrollLeftRef.current - dx;
        currentScrollRef.current = targetScrollRef.current = elRef.current.scrollLeft;
      }
    };

    const onWindowMouseUp = () => {
      window.removeEventListener('mousemove', onWindowMouseMove); window.removeEventListener('mouseup', onWindowMouseUp);
      isPointerDownRef.current = false; setIsDragging(false); setTimeout(() => { didDragRef.current = false; }, 80);
    };

    window.addEventListener('mousemove', onWindowMouseMove); window.addEventListener('mouseup', onWindowMouseUp);
  };

  return {
    containerRef: setContainerRef as unknown as HorizontalWheelCallbackRef, isHovered, isDragging, resetScroll,
    dragHandlers: {
      onMouseDown,
      onClickCapture: (e: React.MouseEvent) => {
        if (didDragRef.current) { e.preventDefault(); e.stopPropagation(); didDragRef.current = false; }
      },
      onTouchStart: () => {
        stopAnimation(); if (elRef.current) currentScrollRef.current = targetScrollRef.current = elRef.current.scrollLeft;
      },
      onScroll: () => {
        if (rafIdRef.current === null && !isPointerDownRef.current && elRef.current) {
          currentScrollRef.current = targetScrollRef.current = elRef.current.scrollLeft;
        }
      },
    },
    consumeDidDrag: () => { const was = didDragRef.current; didDragRef.current = false; return was; },
  };
}
