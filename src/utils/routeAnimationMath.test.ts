import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRouteCumulativeProfile,
  computeRemainingEtaMinutes,
  MECHANIC_ANIMATION_DURATION_MS,
  sampleRouteAtProgress,
} from './routeAnimationMath';

const SAMPLE_COORDS: [number, number][] = [
  [106.695, 10.781],
  [106.698, 10.781],
  [106.701, 10.777],
];

test('route profile computes exact cumulative Haversine distances', () => {
  const profile = buildRouteCumulativeProfile(SAMPLE_COORDS);
  assert.equal(profile.cumulativeMeters.length, 3);
  assert.equal(profile.cumulativeMeters[0], 0);
  assert.ok(profile.cumulativeMeters[1] > 250);
  assert.ok(profile.totalMeters > 700 && profile.totalMeters < 1000);
  assert.equal(MECHANIC_ANIMATION_DURATION_MS, 50_000);
});

test('sampleRouteAtProgress locks start exactly to coordinates[0] and trims passed segments dynamically', () => {
  const profile = buildRouteCumulativeProfile(SAMPLE_COORDS);

  const atStart = sampleRouteAtProgress(SAMPLE_COORDS, profile, 0);
  assert.deepEqual(atStart.currentPos, SAMPLE_COORDS[0]);
  assert.equal(atStart.remainingCoordinates.length, 3);
  assert.deepEqual(atStart.remainingCoordinates[0], SAMPLE_COORDS[0]);

  const atMid = sampleRouteAtProgress(SAMPLE_COORDS, profile, 0.55);
  assert.equal(atMid.segmentIndex, 1);
  assert.deepEqual(atMid.remainingCoordinates[0], atMid.currentPos);
  assert.deepEqual(atMid.remainingCoordinates[1], SAMPLE_COORDS[2]);
  assert.equal(atMid.remainingCoordinates.length, 2);

  const atEnd = sampleRouteAtProgress(SAMPLE_COORDS, profile, 1);
  assert.deepEqual(atEnd.currentPos, SAMPLE_COORDS[2]);
  assert.deepEqual(atEnd.remainingCoordinates, []);
  assert.equal(atEnd.remainingFraction, 0);
});

test('computeRemainingEtaMinutes counts down proportionally with remaining route fraction', () => {
  assert.equal(computeRemainingEtaMinutes(5, 1), 5);
  assert.equal(computeRemainingEtaMinutes(5, 0.6), 3);
  assert.equal(computeRemainingEtaMinutes(5, 0.25), 2);
  assert.equal(computeRemainingEtaMinutes(5, 0.05), 1);
  assert.equal(computeRemainingEtaMinutes(5, 0), 0);
});
