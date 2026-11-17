export function isInsideMap(target: EventTarget | null): boolean {
  if (!target || typeof (target as any).closest !== 'function') return false;
  return Boolean((target as any).closest('.maplibregl-map, .mapboxgl-map, [data-map-container]'));
}

export function initLockAppZoom(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};

  // 1. Chặn chụm 2 ngón tay (Pinch-to-zoom) ngoài bản đồ
  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 1 && !isInsideMap(e.target)) {
      e.preventDefault();
    }
  };

  // 2. Chặn cử chỉ zoom của Safari iOS
  const onGesture = (e: Event) => {
    if (!isInsideMap(e.target)) {
      e.preventDefault();
    }
  };

  // 3. Chặn chạm đúp phóng to (Double-tap zoom) ngoài bản đồ
  let lastTouchEnd = 0;
  const onTouchEnd = (e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300 && !isInsideMap(e.target)) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  };

  // 4. Chặn zoom bằng phím Ctrl/Cmd + Wheel hoặc tổ hợp phím +, -, =, 0
  const onWheel = (e: WheelEvent) => {
    if ((e.ctrlKey || e.metaKey) && !isInsideMap(e.target)) {
      e.preventDefault();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) {
      e.preventDefault();
    }
  };

  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('gesturestart', onGesture, { passive: false });
  document.addEventListener('gesturechange', onGesture, { passive: false });
  document.addEventListener('gestureend', onGesture, { passive: false });
  document.addEventListener('touchend', onTouchEnd, { passive: false });
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKeyDown);

  return () => {
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('gesturestart', onGesture);
    document.removeEventListener('gesturechange', onGesture);
    document.removeEventListener('gestureend', onGesture);
    document.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKeyDown);
  };
}
