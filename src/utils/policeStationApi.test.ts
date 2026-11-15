import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPoliceGoogleMapsUrl,
  extractRealPolicePhone,
  mapGeoapifyFeaturesToPoliceStations,
  mapGooglePlacesToPoliceStations,
  normalizePoliceStationName,
} from './policeStationApi';

const ORIGIN = { lat: 10.7769, lng: 106.7009 };

test('normalizePoliceStationName replaces generic English names with Vietnamese Khu vuc title', () => {
  assert.equal(
    normalizePoliceStationName('Police Station', 'Lý Tự Trọng Street', 'Bến Nghé'),
    'Trụ sở Công an Khu vực Bến Nghé',
  );
  assert.equal(
    normalizePoliceStationName('Police', 'Hàm Nghi Street'),
    'Trụ sở Công an Khu vực Hàm Nghi',
  );
  assert.equal(
    normalizePoliceStationName('Công an Phường Đa Kao'),
    'Công an Phường Đa Kao',
  );
});

test('mapGooglePlacesToPoliceStations sorts ascending by distance and preserves nationalPhoneNumber', () => {
  const mapped = mapGooglePlacesToPoliceStations(
    [
      {
        id: 'p-far',
        displayName: { text: 'Công an Quận 3' },
        formattedAddress: '243 Cách Mạng Tháng Tám, Quận 3',
        nationalPhoneNumber: '028 3832 2325',
        location: { latitude: 10.7795, longitude: 106.6825 },
      },
      {
        id: 'p-near',
        displayName: { text: 'Công an Phường Bến Nghé' },
        shortFormattedAddress: '27 Nguyễn Trung Trực, Quận 1',
        nationalPhoneNumber: '028 3829 1018',
        location: { latitude: 10.7745, longitude: 106.6997 },
      },
    ],
    ORIGIN,
  );

  assert.equal(mapped.length, 2);
  assert.equal(mapped[0].id, 'p-near');
  assert.equal(mapped[0].isNearest, true);
  assert.equal(mapped[0].phone, '028 3829 1018');
  assert.equal(mapped[1].isNearest, false);
});

test('mapGeoapifyFeaturesToPoliceStations extracts real phone when present, nulls missing phones, and sorts', () => {
  assert.equal(
    extractRealPolicePhone({ datasource: { raw: { phone: '028 3829 1018' } } }),
    '028 3829 1018',
  );
  assert.equal(extractRealPolicePhone({}), null);

  const mapped = mapGeoapifyFeaturesToPoliceStations(
    [
      {
        geometry: { coordinates: [106.6976, 10.7878] },
        properties: {
          place_id: 'geo-far',
          name: 'Police Station',
          street: 'Đinh Tiên Hoàng',
          suburb: 'Đa Kao',
          formatted: '89 Đinh Tiên Hoàng, Đa Kao, TP.HCM',
        },
      },
      {
        geometry: { coordinates: [106.6997, 10.7745] },
        properties: {
          place_id: 'geo-near',
          name: 'Công an Phường Bến Nghé',
          street: 'Nguyễn Trung Trực',
          contact: { phone: '028 3829 1018' },
          formatted: '27 Nguyễn Trung Trực, Bến Nghé, TP.HCM',
        },
      },
    ],
    ORIGIN,
  );

  assert.equal(mapped[0].id, 'geo-near');
  assert.equal(mapped[0].isNearest, true);
  assert.equal(mapped[0].phone, '028 3829 1018');
  assert.equal(mapped[1].id, 'geo-far');
  assert.equal(mapped[1].name, 'Trụ sở Công an Khu vực Đa Kao');
  assert.equal(mapped[1].phone, null);
});

test('buildPoliceGoogleMapsUrl encodes station name and address', () => {
  const url = buildPoliceGoogleMapsUrl({
    name: 'Công an Phường Bến Nghé',
    address: '27 Nguyễn Trung Trực, Q.1',
  });
  assert.ok(url.startsWith('https://www.google.com/maps/search/?api=1&query='));
  assert.ok(url.includes(encodeURIComponent('Công an Phường Bến Nghé')));
});
