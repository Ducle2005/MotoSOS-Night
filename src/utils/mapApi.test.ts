import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectStationCategory,
  mapGeoapifyFeaturesToStations,
} from './mapApi';

test('detectStationCategory maps police, fuel, and convenience categories accurately', () => {
  assert.equal(detectStationCategory(['service.police']).category, 'police');
  assert.equal(detectStationCategory(['service.vehicle.fuel']).category, 'gas_station');
  assert.equal(detectStationCategory(['commercial.convenience']).category, 'convenience');
});

test('mapGeoapifyFeaturesToStations maps Geoapify GeoJSON features and sorts by walking distance', () => {
  const userCoord = { lat: 10.7769, lng: 106.7009 };
  const stations = mapGeoapifyFeaturesToStations(
    [
      {
        geometry: { type: 'Point', coordinates: [106.6968, 10.7751] },
        properties: {
          place_id: 'p2',
          name: 'Công an Phường Bến Nghé',
          address_line2: '27 Nguyễn Trung Trực, Quận 1',
          categories: ['service.police'],
          distance: 480,
        },
      },
      {
        geometry: { type: 'Point', coordinates: [106.7021, 10.7782] },
        properties: {
          place_id: 'p1',
          name: 'Circle K Lê Thánh Tôn',
          address_line2: '84 Lê Thánh Tôn, Quận 1',
          categories: ['commercial.convenience'],
          distance: 190,
        },
      },
    ],
    userCoord,
  );

  assert.equal(stations.length, 2);
  assert.equal(stations[0].id, 'p1');
  assert.equal(stations[0].walkingDistanceMeters, 190);
  assert.equal(stations[0].walkingMinutes, 3);
  assert.equal(stations[0].coord.lat, 10.7782);
  assert.equal(stations[0].coord.lng, 106.7021);
  assert.equal(stations[1].category, 'police');
});
