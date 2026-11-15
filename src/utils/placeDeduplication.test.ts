import assert from 'node:assert/strict';
import test from 'node:test';
import type { GasStation, SafeStation } from '../types/rescue';
import {
  buildDeterministicPlaceId,
  cleanSafetyAddress,
  deduplicateShelterItems,
  deduplicateStep2Places,
  isSameOrNearbyPlace,
  normalizePlaceName,
  type Step2RowItem,
} from './placeDeduplication';

test('normalizePlaceName cleans accents, prefixes, and punctuation cleanly', () => {
  const raw = 'Cửa hàng Xăng dầu Petrolimex Số 01';
  const cleaned = normalizePlaceName(raw);
  assert.equal(cleaned, 'so 01');

  const stationRaw = 'Trạm Cửa hàng tiện lợi Circle K Bến Thành!';
  const stationCleaned = normalizePlaceName(stationRaw);
  assert.equal(stationCleaned, 'circle k ben thanh');
});

test('isSameOrNearbyPlace detects points within 35m regardless of name differences', () => {
  const coordA = { lat: 10.7718, lng: 106.6991 };
  const coordB = { lat: 10.7719, lng: 106.6992 }; // ~15 meters away
  assert.equal(
    isSameOrNearbyPlace(coordA, 'Cây xăng Petrolimex', coordB, 'Trạm 24/7 Hàm Nghi', 35),
    true,
  );
});

test('isSameOrNearbyPlace differentiates places far apart (> 35m) with different names', () => {
  const coordA = { lat: 10.7718, lng: 106.6991 };
  const coordB = { lat: 10.785, lng: 106.71 }; // ~1.5km away
  assert.equal(
    isSameOrNearbyPlace(coordA, 'Petrolimex Hàm Nghi', coordB, 'Circle K Hai Bà Trưng', 35),
    false,
  );
});

test('buildDeterministicPlaceId formats rawId_index_lat_lng with 5 decimal precision', () => {
  const id = buildDeterministicPlaceId('place-abc', 2, 10.771829, 106.699144);
  assert.equal(id, 'place-abc_2_10.77183_106.69914');
});

test('deduplicateStep2Places drops duplicate gas station when SafeStation exists at same location (< 35m)', () => {
  const sampleCoord = { lat: 10.7718, lng: 106.6991 };

  const safeStation: SafeStation = {
    id: 'ss-petro-1',
    name: 'Cửa hàng Xăng dầu Petrolimex Số 1',
    category: 'gas_station',
    categoryLabel: 'Cây xăng 24/7',
    address: '136 Hàm Nghi, Q.1',
    walkingDistanceMeters: 706,
    walkingMinutes: 9,
    openHours: 'Mở cửa 24/7',
    amenities: ['Đèn sáng ban đêm', 'Camera an ninh'],
    coord: sampleCoord,
  };

  const duplicateGasStation: GasStation = {
    id: 'gs-petro-1',
    name: 'Cửa hàng Xăng dầu Petrolimex Số 1',
    address: '136 Hàm Nghi, Q.1',
    walkingDistanceMeters: 706,
    walkingMinutes: 9,
    openStatusLabel: 'Mở cửa 24/7',
    isNearest: false,
    coord: sampleCoord,
  };

  const distinctStation: SafeStation = {
    id: 'ss-circlek-2',
    name: 'Circle K Lê Thánh Tôn',
    category: 'convenience',
    categoryLabel: 'Cửa hàng tiện lợi 24/7',
    address: '45 Lê Thánh Tôn, Q.1',
    walkingDistanceMeters: 250,
    walkingMinutes: 3,
    openHours: 'Mở cửa 24/7',
    amenities: ['Đèn sáng'],
    coord: { lat: 10.778, lng: 106.702 },
  };

  const rows: Step2RowItem[] = [
    { kind: 'safe_station', distance: 250, station: distinctStation },
    { kind: 'safe_station', distance: 706, station: safeStation },
    { kind: 'gas_station', distance: 706, gasStation: duplicateGasStation },
  ];

  const result = deduplicateStep2Places(rows);

  // Must only retain 2 distinct places, keeping safe_station over gas_station
  assert.equal(result.length, 2);
  assert.equal(result[0].kind, 'safe_station');
  assert.equal(result[1].kind, 'safe_station');

  // Verify unique deterministic ID assigned
  assert.ok(result[0].station.id.includes('10.77800'));
  assert.ok(result[1].station.id.includes('10.77180'));
});

test('cleanSafetyAddress removes English street/city words cleanly', () => {
  assert.equal(
    cleanSafetyAddress('Cong Hoa St, P. Tan Binh, Saigon, Vietnam'),
    'Cong Hoa, Q.1',
  );
  assert.equal(
    cleanSafetyAddress('89A, P. Tân Sơn Nhì, Ho Chi Minh City'),
    '89A, P. Tân Sơn Nhì',
  );
});

test('deduplicateShelterItems keeps highest priority (police > safe_station > gas_station)', () => {
  const coord = { lat: 10.7718, lng: 106.6991 };
  const items = [
    {
      kind: 'gas_station' as const,
      distance: 500,
      gas: {
        id: 'g1',
        name: 'Petrolimex Cong Hoa',
        address: 'Cong Hoa St, Tan Binh',
        walkingDistanceMeters: 500,
        walkingMinutes: 6,
        openStatusLabel: '24/7',
        isNearest: false,
        coord,
      },
    },
    {
      kind: 'safe_station' as const,
      distance: 500,
      station: {
        id: 's1',
        name: 'Petrolimex Cong Hoa',
        category: 'gas_station' as const,
        categoryLabel: 'Cây xăng',
        address: 'Cong Hoa St, Tan Binh',
        walkingDistanceMeters: 500,
        walkingMinutes: 6,
        openHours: '24/7',
        amenities: [],
        coord,
      },
    },
  ];

  const result = deduplicateShelterItems(items);

  assert.equal(result.length, 1);
  assert.equal(result[0].kind, 'safe_station');
});
