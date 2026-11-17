import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  buildSosSharePayload,
  getExactUserCoordinates,
  normalizeVietnamPhone,
} from './sosLocationShare';
import { MOCK_MECHANIC } from '../data/mockRescueData';

describe('sosLocationShare utilities', () => {
  test('normalizeVietnamPhone correctly normalizes various formats to local 0-prefix', () => {
    assert.equal(normalizeVietnamPhone('+84 946 499 329'), '0946499329');
    assert.equal(normalizeVietnamPhone('84946499329'), '0946499329');
    assert.equal(normalizeVietnamPhone('0946-499-329'), '0946499329');
    assert.equal(normalizeVietnamPhone('0946.499.329'), '0946499329');
    assert.equal(normalizeVietnamPhone('0912345678'), '0912345678');
  });

  test('buildSosSharePayload formats official Google Maps URLs API without encoded comma', () => {
    const payload = buildSosSharePayload({
      location: { lat: 10.776912, lng: 106.700934, address: '63 Đường Lý Tự Trọng, Q.1' },
      vehiclePlate: '59-P2 842.19',
    });

    assert.equal(payload.latStr, '10.776912');
    assert.equal(payload.lngStr, '106.700934');
    assert.equal(payload.pinUrl, 'https://www.google.com/maps/search/?api=1&query=10.776912,106.700934');
    assert.equal(payload.directionsUrl, 'https://www.google.com/maps/dir/?api=1&destination=10.776912,106.700934');
    assert.equal(payload.mapsUrl, payload.pinUrl);

    assert.ok(payload.text.includes('🆘 [MotoSOS - VỊ TRÍ KHẨN CẤP]'));
    assert.ok(payload.text.includes('📍 Địa chỉ: 63 Đường Lý Tự Trọng, Q.1'));
    assert.ok(payload.text.includes('📌 Tọa độ: 10.776912,106.700934'));
    assert.ok(payload.text.includes(`🗺️ Xem vị trí ghim: ${payload.pinUrl}`));
    assert.ok(payload.text.includes(`🧭 Chỉ đường tới ngay: ${payload.directionsUrl}`));
    assert.ok(payload.text.includes('🏍️ Biển số xe: 59-P2 842.19'));
  });

  test('buildSosSharePayload appends mechanic info when activeRescue is ongoing', () => {
    const payload = buildSosSharePayload({
      location: { lat: 10.7769, lng: 106.7009 },
      activeRescue: {
        status: 'en_route',
        etaMinutes: 5,
        mechanic: MOCK_MECHANIC,
        otpCode: '8492',
        serviceName: 'Lủng lốp',
        finalPrice: 65000,
        pickupAddress: 'Điểm đón',
        elapsedSeconds: 30,
      },
    });

    assert.ok(payload.text.includes(MOCK_MECHANIC.name));
    assert.ok(payload.text.includes(MOCK_MECHANIC.licensePlate));
  });

  test('getExactUserCoordinates resolves fallback location with map_pin source in Node env', async () => {
    const result = await getExactUserCoordinates({ lat: 10.7769, lng: 106.7009, address: 'Bến Thành' });
    assert.equal(result.lat, 10.7769);
    assert.equal(result.lng, 106.7009);
    assert.equal(result.latStr, '10.776900');
    assert.equal(result.lngStr, '106.700900');
    assert.equal(result.source, 'map_pin');
    assert.equal(result.sourceLabel, 'Tọa độ điểm đón trên bản đồ');
  });
});
