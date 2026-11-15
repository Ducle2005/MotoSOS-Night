import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeLoopedActiveIndex,
  computeLoopedScrollLeft,
  computeLoopStepTarget,
} from './carouselLoop';

test('computeLoopedScrollLeft wraps seamlessly once crossing loopWidth', () => {
  assert.equal(computeLoopedScrollLeft(-10, 800), 0);
  assert.equal(computeLoopedScrollLeft(350, 800), 350);
  assert.equal(computeLoopedScrollLeft(800, 800), 0);
  assert.equal(computeLoopedScrollLeft(802.5, 800), 2.5);
});

test('computeLoopedActiveIndex maps duplicated slots back to original index', () => {
  assert.equal(computeLoopedActiveIndex(0, 300, 4), 0);
  assert.equal(computeLoopedActiveIndex(300, 300, 4), 1);
  assert.equal(computeLoopedActiveIndex(900, 300, 4), 3);
  assert.equal(computeLoopedActiveIndex(1200, 300, 4), 0);
  assert.equal(computeLoopedActiveIndex(1500, 300, 4), 1);
});

test('computeLoopStepTarget advances strictly one-way from last original card onto clone 0', () => {
  const step0 = computeLoopStepTarget(0, 300, 4);
  assert.deepEqual(step0, {
    normalizedStart: null,
    nextScrollLeft: 300,
    targetOriginalIndex: 1,
  });

  const stepFromLastOriginal = computeLoopStepTarget(900, 300, 4);
  assert.deepEqual(stepFromLastOriginal, {
    normalizedStart: null,
    nextScrollLeft: 1200,
    targetOriginalIndex: 0,
  });

  const stepFromClone = computeLoopStepTarget(1200, 300, 4);
  assert.deepEqual(stepFromClone, {
    normalizedStart: 0,
    nextScrollLeft: 300,
    targetOriginalIndex: 1,
  });
});
