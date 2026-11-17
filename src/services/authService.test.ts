import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePhoneNumber,
  checkPhoneExists,
  generateMockOtp,
  verifyOtpAndLogin,
  completeRegistration,
  loginWithGoogleDemo,
  loginAsGuest,
  logoutUser,
  getCurrentUser,
  getSecuritySettings,
  saveSecuritySettings,
  verifySecurityPin,
} from './authService';

describe('authService unit tests', () => {
  test('normalizePhoneNumber formats various inputs to 10-digit format without truncating', () => {
    assert.equal(normalizePhoneNumber('+84908412739'), '0908412739');
    assert.equal(normalizePhoneNumber('84908412739'), '0908412739');
    assert.equal(normalizePhoneNumber('0908 412 739'), '0908412739');
    assert.equal(normalizePhoneNumber('908412739'), '0908412739');
    assert.equal(normalizePhoneNumber('0912345678'), '0912345678');
  });

  test('checkPhoneExists checks seed user correctly', () => {
    assert.equal(checkPhoneExists('0908412739'), true);
    assert.equal(checkPhoneExists('+84 908 412 739'), true);
    assert.equal(checkPhoneExists('0999999999'), false);
  });

  test('generateMockOtp produces 6-digit code', () => {
    const otp = generateMockOtp('0908412739');
    assert.equal(otp.length, 6);
  });

  test('verifyOtpAndLogin verifies with demo OTP 482910', () => {
    const res = verifyOtpAndLogin('0908412739', '482910');
    assert.equal(res.success, true);
    assert.equal(res.isNewUser, false);
    assert.equal(res.user?.phone, '0908412739');
  });

  test('verifyOtpAndLogin flags new phone as isNewUser: true', () => {
    const res = verifyOtpAndLogin('0977889900', '482910');
    assert.equal(res.success, true);
    assert.equal(res.isNewUser, true);
  });

  test('completeRegistration creates new user with BANMOI25 voucher', () => {
    const user = completeRegistration({
      phone: '0977889900',
      fullName: 'Trần Văn An',
      bikeModel: 'Yamaha Exciter 155',
      licensePlate: '59-S2 999.88',
    });
    assert.equal(user.phone, '0977889900');
    assert.equal(user.fullName, 'Trần Văn An');
    assert.ok(user.vouchers?.includes('BANMOI25'));
    assert.equal(checkPhoneExists('0977889900'), true);
  });

  test('loginWithGoogleDemo and loginAsGuest create valid sessions', () => {
    const google = loginWithGoogleDemo();
    assert.equal(google.phone, '0908123456');
    assert.ok(google.vouchers?.includes('BANMOI25'));

    const guest = loginAsGuest();
    assert.equal(guest.isGuest, true);
  });

  test('security settings and pin verification', () => {
    const sec = getSecuritySettings();
    assert.equal(typeof sec.isBiometricEnabled, 'boolean');
    assert.equal(verifySecurityPin('123456'), true);
  });
});
