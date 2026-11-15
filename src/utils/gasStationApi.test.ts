import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGoogleMapsDirectionsUrl,
  gasStationToSafeStation,
  mapGeoapifyFeaturesToGasStations,
  mapGooglePlacesToGasStations,
} from './gasStationApi';

test('mapGooglePlacesToGasStations sorts ascending by Haversine distance and marks nearest', () => {
  const origin = { lat: 10.7769, lng: 106.7009 };
  const list = mapGooglePlacesToGasStations(
    [
      {
        id: 'far',
        displayName: { text: 'PVOIL Xa' },
        shortFormattedAddress: '200 Điện Biên Phủ, Quận 3',
        location: { latitude: 10.7852, longitude: 106.6889 },
        currentOpeningHours: { openNow: true },
      },
      {
        id: 'near',
        displayName: { text: 'Petrolimex Gần' },
        shortFormattedAddress: '136 Hàm Nghi, Quận 1',
        location: { latitude: 10.7718, longitude: 106.6991 },
        currentOpeningHours: { openNow: true },
      },
    ],
    origin,
  );

  assert.equal(list.length, 2);
  assert.equal(list[0].id, 'near');
  assert.equal(list[0].isNearest, true);
  assert.equal(list[1].isNearest, false);
  assert.ok(list[0].walkingDistanceMeters < list[1].walkingDistanceMeters);
});

test('mapGeoapifyFeaturesToGasStations maps compact addresses, sorts by distance, and converts to SafeStation', () => {
  const origin = { lat: 10.7769, lng: 106.7009 };
  const list = mapGeoapifyFeaturesToGasStations(
    [
      {
        geometry: { coordinates: [106.6968, 10.7824] },
        properties: {
          place_id: 'g2',
          name: 'COMECO Hai Bà Trưng',
          address_line2: '178 Hai Bà Trưng, Quận 1, Ho Chi Minh City, Vietnam',
        },
      },
      {
        geometry: { coordinates: [106.6991, 10.7718] },
        properties: {
          place_id: 'g1',
          name: 'Petrolimex Hàm Nghi',
          address_line2: '136 Hàm Nghi, Quận 1, Vietnam',
          opening_hours: '24/7',
        },
      },
    ],
    origin,
  );

  assert.equal(list[0].id, 'g1');
  assert.equal(list[0].isNearest, true);
  assert.equal(list[0].openStatusLabel, 'Mở cửa 24/7');
  assert.equal(list[0].address, '136 Hàm Nghi, Q.1');

  const safe = gasStationToSafeStation(list[0]);
  assert.equal(safe.category, 'gas_station');
  assert.equal(safe.name, 'Petrolimex Hàm Nghi');
  assert.equal(
    buildGoogleMapsDirectionsUrl(safe.coord.lat, safe.coord.lng),
    'https://www.google.com/maps/dir/?api=1&destination=10.7718,106.6991',
  );
});
