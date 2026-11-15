import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
  type TouchEvent,
  type WheelEvent,
} from 'react';

const DRAG_THRESHOLD_PX = 5;

export function useHorizontalDragScroll() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const didDragRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || e.button !== 0) return;
    e.stopPropagation();
    isPointerDownRef.current = true;
    startXRef.current = e.pageX;
    startScrollLeftRef.current = el.scrollLeft;
    didDragRef.current = false;
  }, []);

  const onMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!isPointerDownRef.current || !el) return;
    const dx = e.pageX - startXRef.current;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX) {
      didDragRef.current = true;
      setIsDragging(true);
      el.scrollLeft = startScrollLeftRef.current - dx;
    }
  }, []);

  const endDrag = useCallback(() => {
    if (!isPointerDownRef.current && !isDragging) return;
    isPointerDownRef.current = false;
    setIsDragging(false);
    window.setTimeout(() => {
      didDragRef.current = false;
    }, 0);
  }, [isDragging]);

  const onWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
    }
  }, []);

  const onTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  const onPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  const onDragStart = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const onClickCapture = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (didDragRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const scrollByAmount = useCallback((offset: number) => {
    scrollRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  }, []);

  return {
    scrollRef,
    isDragging,
    scrollByAmount,
    dragHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp: endDrag,
      onMouseLeave: endDrag,
      onWheel,
      onTouchStart,
      onPointerDown,
      onDragStart,
      onClickCapture,
    },
  };
}
