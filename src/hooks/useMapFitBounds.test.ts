import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getFilterTargetCoords } from './useMapFitBounds';
import type { SafeStation, RepairShop, PoliceStation, GasStation } from '../types/rescue';

describe('useMapFitBounds helper', () => {
  const dummyStation: SafeStation = {
    id: 's1',
    name: 'Circle K',
    category: 'convenience',
    categoryLabel: 'Cửa hàng 24/7',
    address: '123 Le Loi',
    walkingDistanceMeters: 200,
    walkingMinutes: 3,
    openHours: '24/7',
    amenities: ['wifi', 'atm'],
    coord: { lat: 10.771, lng: 106.691 },
  };

  const dummyShop: RepairShop = {
    id: 'sh1',
    name: 'Tiệm Sửa Xe Hoàng',
    address: '456 Tran Hung Dao',
    phone: '0908 123 456',
    distanceMeters: 500,
    rideMinutes: 2,
    openingHoursRaw: '24/7',
    isOpen: true,
    openStatusLabel: 'Đang mở',
    hasExplicitHours: true,
    coord: { lat: 10.765, lng: 106.685 },
  };

  const dummyPolice: PoliceStation = {
    id: 'p1',
    name: 'Công an Phường Bến Nghé',
    address: '1 Cong Xa Paris',
    phone: '028 3822 0123',
    distanceMeters: 800,
    durationMinutes: 10,
    isNearest: true,
    coord: { lat: 10.779, lng: 106.699 },
  };

  const dummyGas: GasStation = {
    id: 'g1',
    name: 'Petrolimex Số 1',
    address: '789 Nam Ky Khoi Nghia',
    walkingDistanceMeters: 600,
    walkingMinutes: 8,
    openStatusLabel: 'Mở 24/7',
    isNearest: true,
    coord: { lat: 10.782, lng: 106.695 },
  };

  it('returns safe station coordinates when mapFilter is safe_stations', () => {
    const coords = getFilterTargetCoords('safe_stations', [dummyStation], [dummyShop], [dummyPolice], [dummyGas]);
    assert.equal(coords.length, 1);
    assert.deepEqual(coords[0], dummyStation.coord);
  });

  it('returns repair shop coordinates when mapFilter is repair_shops', () => {
    const coords = getFilterTargetCoords('repair_shops', [dummyStation], [dummyShop], [dummyPolice], [dummyGas]);
    assert.equal(coords.length, 1);
    assert.deepEqual(coords[0], dummyShop.coord);
  });

  it('returns police station coordinates when mapFilter is police_stations', () => {
    const coords = getFilterTargetCoords('police_stations', [dummyStation], [dummyShop], [dummyPolice], [dummyGas]);
    assert.equal(coords.length, 1);
    assert.deepEqual(coords[0], dummyPolice.coord);
  });

  it('returns gas station coordinates when mapFilter is gas_stations', () => {
    const coords = getFilterTargetCoords('gas_stations', [dummyStation], [dummyShop], [dummyPolice], [dummyGas]);
    assert.equal(coords.length, 1);
    assert.deepEqual(coords[0], dummyGas.coord);
  });

  it('returns combined coords when filter is all', () => {
    const coords = getFilterTargetCoords('all', [dummyStation], [dummyShop], [dummyPolice], [dummyGas]);
    assert.equal(coords.length, 4);
  });
});
