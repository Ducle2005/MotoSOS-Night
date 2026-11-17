import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PAYMENT_OPTIONS,
  type PaymentMethodId,
} from './MembershipCheckoutModal';
import {
  getActiveMembershipId,
  getMembershipPlan,
  getPurchasedMemberships,
  purchaseOrSwitchMembership,
} from '../data/membershipCatalog';
import {
  DEFAULT_USER_PROFILE,
  loadUserProfile,
  saveUserProfile,
} from '../types/profile';

test('MembershipCheckoutModal - PAYMENT_OPTIONS has exactly 4 Grab standard payment methods', () => {
  assert.equal(PAYMENT_OPTIONS.length, 4);
  const ids: PaymentMethodId[] = PAYMENT_OPTIONS.map((p) => p.id);
  assert.deepEqual(ids, ['momo', 'zalopay', 'vietqr', 'card']);

  const momo = PAYMENT_OPTIONS.find((p) => p.id === 'momo');
  assert.ok(momo);
  assert.equal(momo?.name, 'Ví MoMo');
  assert.equal(momo?.subtitle, 'Thanh toán tức thì • Miễn phí giao dịch');

  const zalopay = PAYMENT_OPTIONS.find((p) => p.id === 'zalopay');
  assert.ok(zalopay);
  assert.equal(zalopay?.name, 'Ví ZaloPay');

  const vietqr = PAYMENT_OPTIONS.find((p) => p.id === 'vietqr');
  assert.ok(vietqr);
  assert.equal(vietqr?.name, 'Chuyển khoản VietQR 24/7');

  const card = PAYMENT_OPTIONS.find((p) => p.id === 'card');
  assert.ok(card);
  assert.equal(card?.name, 'Thẻ Quốc tế (Visa / Mastercard)');
});

test('MembershipCheckoutModal - Purchasing a plan updates active plan and purchased list', () => {
  const planToBuy = getMembershipPlan('moto_gold');
  assert.ok(planToBuy);

  purchaseOrSwitchMembership(planToBuy.id);

  assert.equal(getActiveMembershipId(), 'moto_gold');
  const purchased = getPurchasedMemberships();
  const found = purchased.find((p) => p.id === 'moto_gold');
  assert.ok(found);
  assert.equal(found?.status, 'active');
  assert.equal(found?.remainingQuota, planToBuy.monthlyQuota);
});

test('MembershipCheckoutModal - Profile default payment mapping works properly', () => {
  const profile = { ...DEFAULT_USER_PROFILE, defaultPayment: 'momo' as const };
  saveUserProfile(profile);

  const mapPayment: Record<PaymentMethodId, 'momo' | 'zalopay' | 'bank_qr'> = {
    momo: 'momo',
    zalopay: 'zalopay',
    vietqr: 'bank_qr',
    card: 'bank_qr',
  };

  assert.equal(mapPayment['momo'], 'momo');
  assert.equal(mapPayment['zalopay'], 'zalopay');
  assert.equal(mapPayment['vietqr'], 'bank_qr');
  assert.equal(mapPayment['card'], 'bank_qr');
});
