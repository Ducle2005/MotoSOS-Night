import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAccuracyCirclePolygon,
  formatGpsAccuracyBadge,
  HIGH_ACCURACY_GPS_OPTIONS,
  pickBetterGpsSample,
} from './gpsWatcher';

test('HIGH_ACCURACY_GPS_OPTIONS enforces fresh uncached high-accuracy reading', () => {
  assert.equal(HIGH_ACCURACY_GPS_OPTIONS.enableHighAccuracy, true);
  assert.equal(HIGH_ACCURACY_GPS_OPTIONS.maximumAge, 0);
  assert.equal(HIGH_ACCURACY_GPS_OPTIONS.timeout, 10000);
});

test('pickBetterGpsSample always retains lowest accuracyMeters reading', () => {
  const coarse = { coord: { lat: 10.77, lng: 106.7 }, accuracyMeters: 68 };
  const fine = { coord: { lat: 10.771, lng: 106.701 }, accuracyMeters: 12 };
  const worse = { coord: { lat: 10.78, lng: 106.71 }, accuracyMeters: 35 };

  const first = pickBetterGpsSample(null, coarse);
  assert.equal(first.accuracyMeters, 68);

  const second = pickBetterGpsSample(first, fine);
  assert.equal(second.accuracyMeters, 12);
  assert.equal(second.coord.lat, 10.771);

  const third = pickBetterGpsSample(second, worse);
  assert.equal(third.accuracyMeters, 12);
});

test('formatGpsAccuracyBadge formats valid accuracy and hides null/zero', () => {
  assert.equal(formatGpsAccuracyBadge(12.4), 'Độ chính xác GPS: ±12m');
  assert.equal(formatGpsAccuracyBadge(null), null);
  assert.equal(formatGpsAccuracyBadge(0), null);
});

test('buildAccuracyCirclePolygon creates a closed ring matching requested meter radius', () => {
  const center = { lat: 10.7769, lng: 106.7009 };
  const collection = buildAccuracyCirclePolygon(center, 100, 24);
  assert.equal(collection.features.length, 1);

  const geom = collection.features[0].geometry;
  assert.equal(geom.type, 'Polygon');
  const ring = geom.coordinates[0];
  assert.equal(ring.length, 25);
  assert.deepEqual(ring[0], ring[ring.length - 1]);
  assert.ok(ring[0][1] > center.lat + 0.0005);
});
