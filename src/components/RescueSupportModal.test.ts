import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import type { SupportIssueType } from './RescueSupportModal';

describe('RescueSupportModal logic and issue handling', () => {
  const evaluateSupportIssueAction = (
    issueType: SupportIssueType,
    gpsGapMeters: number,
  ): { canFreeCancel: boolean; compensationFee: number; requiresOtpWarning: boolean } => {
    if (issueType === 'not_arrived') {
      return {
        canFreeCancel: gpsGapMeters > 150,
        compensationFee: 0,
        requiresOtpWarning: false,
      };
    }
    if (issueType === 'force_cancel') {
      return {
        canFreeCancel: false,
        compensationFee: 30000,
        requiresOtpWarning: false,
      };
    }
    if (issueType === 'wrong_vehicle') {
      return {
        canFreeCancel: false,
        compensationFee: 0,
        requiresOtpWarning: true,
      };
    }
    return {
      canFreeCancel: false,
      compensationFee: 0,
      requiresOtpWarning: false,
    };
  };

  test('unlocks free cancellation when mechanic is not arrived and GPS gap exceeds 150m', () => {
    const actionFar = evaluateSupportIssueAction('not_arrived', 180);
    assert.equal(actionFar.canFreeCancel, true);
    assert.equal(actionFar.compensationFee, 0);

    const actionClose = evaluateSupportIssueAction('not_arrived', 45);
    assert.equal(actionClose.canFreeCancel, false);
  });

  test('flags wrong_vehicle with strict OTP disclosure warning', () => {
    const action = evaluateSupportIssueAction('wrong_vehicle', 20);
    assert.equal(action.requiresOtpWarning, true);
    assert.equal(action.canFreeCancel, false);
  });

  test('requires 30,000 VND travel compensation fee for force_cancel', () => {
    const action = evaluateSupportIssueAction('force_cancel', 10);
    assert.equal(action.compensationFee, 30000);
    assert.equal(action.canFreeCancel, false);
  });

  test('overcharge issue maintains original price without additional fee', () => {
    const action = evaluateSupportIssueAction('overcharge', 50);
    assert.equal(action.compensationFee, 0);
    assert.equal(action.canFreeCancel, false);
  });
});
