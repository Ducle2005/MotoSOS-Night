import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  buildSosSharePayload,
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

  test('buildSosSharePayload formats exact 6-decimal coordinates and google maps link', () => {
    const payload = buildSosSharePayload({
      location: { lat: 10.776912, lng: 106.700934, address: '63 Đường Lý Tự Trọng, Q.1' },
      vehiclePlate: '59-P2 842.19',
    });

    assert.equal(payload.lat, 10.776912);
    assert.equal(payload.lng, 106.700934);
    assert.equal(payload.mapsUrl, 'https://maps.google.com/?q=10.776912,106.700934');
    assert.ok(payload.text.includes('🆘 [MotoSOS - VỊ TRÍ KHẨN CẤP]'));
    assert.ok(payload.text.includes('63 Đường Lý Tự Trọng, Q.1'));
    assert.ok(payload.text.includes('59-P2 842.19'));
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
});
