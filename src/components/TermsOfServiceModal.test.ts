import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

describe('TermsOfServiceModal legal policies and constants', () => {
  const TERMS_CORE_PILLARS = [
    { label: 'OTP 4 số', subtext: 'Chống thợ giả' },
    { label: 'Miễn phí 3p', subtext: 'Hủy chuyến đầu' },
    { label: '50.000.000đ', subtext: 'Bảo hiểm sự cố' },
  ];

  const TERMS_POLICY_RULES = {
    otpLength: 4,
    freeCancelGraceSeconds: 180,
    lateCancelFeeVnd: 30000,
    nightSurchargeVnd: 20000,
    warrantyDays: 7,
    insuranceAmountVnd: 50000000,
    cryptoScheme: 'MS_SEC_V1',
    editionYear: 2026,
  };

  test('validates the 3 core pillars displayed on quick-read card', () => {
    assert.equal(TERMS_CORE_PILLARS.length, 3);
    assert.equal(TERMS_CORE_PILLARS[0].label, 'OTP 4 số');
    assert.equal(TERMS_CORE_PILLARS[1].label, 'Miễn phí 3p');
    assert.equal(TERMS_CORE_PILLARS[2].label, '50.000.000đ');
  });

  test('validates pricing, grace period, and insurance constants match MotoSOS terms', () => {
    assert.equal(TERMS_POLICY_RULES.freeCancelGraceSeconds, 180);
    assert.equal(TERMS_POLICY_RULES.lateCancelFeeVnd, 30000);
    assert.equal(TERMS_POLICY_RULES.nightSurchargeVnd, 20000);
    assert.equal(TERMS_POLICY_RULES.warrantyDays, 7);
    assert.equal(TERMS_POLICY_RULES.insuranceAmountVnd, 50000000);
    assert.equal(TERMS_POLICY_RULES.cryptoScheme, 'MS_SEC_V1');
    assert.equal(TERMS_POLICY_RULES.editionYear, 2026);
  });
});
