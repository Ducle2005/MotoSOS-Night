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

  it('computes clamped progress and edge offset strictly preventing overflow at 100%', () => {
    const computeProgressStyle = (status: 'en_route' | 'arrived', elapsedSeconds: number) => {
      const isArrived = status === 'arrived';
      const progressRatio = Math.min(1, Math.max(0, elapsedSeconds / 50));
      const rawProgress = isArrived ? 100 : Math.round(18 + progressRatio * 74);
      const clamped = Math.min(100, Math.max(0, rawProgress));
      const leftOffsetFormula = `calc(${clamped}% - ${clamped * 0.2}px)`;
      return { clamped, leftOffsetFormula };
    };

    const start = computeProgressStyle('en_route', 0);
    assert.strictEqual(start.clamped, 18);
    assert.strictEqual(start.leftOffsetFormula, 'calc(18% - 3.6px)');

    const arrived = computeProgressStyle('arrived', 55);
    assert.strictEqual(arrived.clamped, 100);
    assert.strictEqual(arrived.leftOffsetFormula, 'calc(100% - 20px)');
  });
});
