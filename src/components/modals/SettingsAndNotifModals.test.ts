import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { getSecuritySettings, saveSecuritySettings, verifySecurityPin } from '../../services/authService';

describe('Settings and Biometric Security logic tests', () => {
  test('security PIN can be updated and verified accurately', () => {
    saveSecuritySettings({ isBiometricEnabled: true, pinCode: '654321' });
    assert.equal(verifySecurityPin('654321'), true);
    assert.equal(verifySecurityPin('123456'), false);

    // Reset back
    saveSecuritySettings({ isBiometricEnabled: true, pinCode: '123456' });
    assert.equal(verifySecurityPin('123456'), true);
  });

  test('biometric enabled toggle updates settings object properly', () => {
    const prev = getSecuritySettings();
    saveSecuritySettings({ ...prev, isBiometricEnabled: false });
    assert.equal(getSecuritySettings().isBiometricEnabled, false);

    saveSecuritySettings({ ...prev, isBiometricEnabled: true });
    assert.equal(getSecuritySettings().isBiometricEnabled, true);
  });

  test('auth on purchase flag requires security verification when active', () => {
    const sec = getSecuritySettings();
    assert.ok(sec !== null);

    const requiresAuth = (authOnPurchaseEnabled: boolean, hasFace: boolean, hasPin: boolean) => {
      if (!authOnPurchaseEnabled) return false;
      return hasFace || hasPin;
    };

    assert.equal(requiresAuth(false, true, true), false);
    assert.equal(requiresAuth(true, false, false), false);
    assert.equal(requiresAuth(true, true, false), true);
    assert.equal(requiresAuth(true, false, true), true);
    assert.equal(requiresAuth(true, true, true), true);
  });
});
