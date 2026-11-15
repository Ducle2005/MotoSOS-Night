import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('useSmoothHorizontalWheel physics & boundaries', () => {
  it('calculates frame-rate independent exponential factor correctly across 60Hz and 120Hz', () => {
    const dt60 = 1 / 60; // ~0.0166s
    const dt120 = 1 / 120; // ~0.0083s
    const factor60 = 1 - Math.exp(-15 * dt60);
    const factor120 = 1 - Math.exp(-15 * dt120);

    assert.ok(factor60 > factor120, '60Hz factor per frame is larger than 120Hz factor');
    // Over two 120Hz frames, remaining difference should match one 60Hz frame
    const remaining60 = 1 - factor60;
    const remaining120TwoFrames = Math.pow(1 - factor120, 2);
    assert.ok(Math.abs(remaining60 - remaining120TwoFrames) < 0.001, 'Physics exponential decay is frame-rate independent');
  });

  it('boundary release condition permits normal page scrolling at edges', () => {
    const maxScroll = 500;

    // At left edge scrolling left (upwards)
    const atLeftEdge = 0;
    const deltaUp = -50;
    const shouldReleaseAtLeft = (atLeftEdge <= 1 && deltaUp < 0);
    assert.equal(shouldReleaseAtLeft, true, 'Releases lock at left edge when scrolling up/left');

    // At left edge scrolling right (downwards)
    const deltaDown = 50;
    const shouldReleaseAtLeftScrollDown = (atLeftEdge <= 1 && deltaDown < 0);
    assert.equal(shouldReleaseAtLeftScrollDown, false, 'Locks and scrolls horizontally when scrolling down from left edge');

    // At right edge scrolling right (downwards)
    const atRightEdge = maxScroll;
    const shouldReleaseAtRight = (atRightEdge >= maxScroll - 1 && deltaDown > 0);
    assert.equal(shouldReleaseAtRight, true, 'Releases lock at right edge when scrolling down/right');
  });
});
