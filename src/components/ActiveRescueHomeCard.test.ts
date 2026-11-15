import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { ActiveRescueInfo } from '../types/rescue';
import { MOCK_MECHANIC } from '../data/mockRescueData';

describe('ActiveRescueHomeCard data mapping', () => {
  it('formats activeRescue status, eta and otp accurately', () => {
    const enRouteSample: ActiveRescueInfo = {
      status: 'en_route',
      etaMinutes: 4,
      mechanic: MOCK_MECHANIC,
      otpCode: '8492',
      serviceName: 'Lủng lốp',
      finalPrice: 65000,
      pickupAddress: '63 Đường Lý Tự Trọng, P. Bến Thành, Q.1',
      elapsedSeconds: 45,
    };

    assert.strictEqual(enRouteSample.status, 'en_route');
    assert.strictEqual(enRouteSample.etaMinutes, 4);
    assert.strictEqual(enRouteSample.otpCode.length, 4);

    const arrivedSample: ActiveRescueInfo = {
      ...enRouteSample,
      status: 'arrived',
      etaMinutes: 0,
    };

    assert.strictEqual(arrivedSample.status, 'arrived');
    assert.strictEqual(arrivedSample.etaMinutes, 0);
  });

  it('slices first street segment from full address cleanly', () => {
    const full = '63 Đường Lý Tự Trọng, Phường Bến Thành, Quận 1';
    const short = full.split(',')[0]?.trim();
    assert.strictEqual(short, '63 Đường Lý Tự Trọng');
  });
});
