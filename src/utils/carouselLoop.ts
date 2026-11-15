export interface LoopStepPlan {
  normalizedStart: number | null;
  nextScrollLeft: number;
  targetOriginalIndex: number;
}

export function computeLoopedScrollLeft(
  scrollLeft: number,
  loopWidth: number,
): number {
  const safeScroll = Math.max(0, scrollLeft);
  if (loopWidth <= 0) return safeScroll;
  if (safeScroll >= loopWidth) {
    return safeScroll % loopWidth;
  }
  return safeScroll;
}

export function computeLoopedActiveIndex(
  scrollLeft: number,
  stepPx: number,
  itemCount: number,
): number {
  if (itemCount <= 1 || stepPx <= 0) return 0;
  const rawSlot = Math.round(Math.max(0, scrollLeft) / stepPx);
  return ((rawSlot % itemCount) + itemCount) % itemCount;
}

export function computeLoopStepTarget(
  currentScrollLeft: number,
  stepPx: number,
  itemCount: number,
): LoopStepPlan {
  if (itemCount <= 1 || stepPx <= 0) {
    return {
      normalizedStart: null,
      nextScrollLeft: 0,
      targetOriginalIndex: 0,
    };
  }

  const currentSlot = Math.round(Math.max(0, currentScrollLeft) / stepPx);
  const inClonedHalf = currentSlot >= itemCount;
  const baseSlot = ((currentSlot % itemCount) + itemCount) % itemCount;
  const normalizedStart = inClonedHalf ? baseSlot * stepPx : null;
  const nextSlot = baseSlot + 1;

  return {
    normalizedStart,
    nextScrollLeft: nextSlot * stepPx,
    targetOriginalIndex: nextSlot % itemCount,
  };
}

export function measureCarouselGeometry(
  container: HTMLElement,
  originalCount: number,
): { stepPx: number; loopWidth: number } {
  const children = container.children;
  if (originalCount <= 0 || children.length === 0) {
    return { stepPx: 0, loopWidth: 0 };
  }

  const first = children[0] as HTMLElement;
  const second = children[1] as HTMLElement | undefined;
  const cloneFirst = children[originalCount] as HTMLElement | undefined;

  const stepPx = second
    ? Math.max(1, second.offsetLeft - first.offsetLeft)
    : Math.max(1, first.offsetWidth);

  const loopWidth = cloneFirst
    ? Math.max(1, cloneFirst.offsetLeft - first.offsetLeft)
    : stepPx * originalCount;

  return { stepPx, loopWidth };
}
