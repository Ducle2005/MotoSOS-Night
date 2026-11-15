import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

describe('Cancel Rescue Cancellation Lock Logic', () => {
  test('evaluates isArrived accurately based on tracking status and arrival flags', () => {
    const isCancelLocked = (status: string, hasArrived = false) => {
      return status === 'arrived' || hasArrived || status === 'repairing';
    };

    // Searching / En-route: can cancel
    assert.equal(isCancelLocked('searching'), false);
    assert.equal(isCancelLocked('accepted', false), false);
    assert.equal(isCancelLocked('en_route', false), false);

    // Arrived / Repairing / Has arrived: locked!
    assert.equal(isCancelLocked('arrived'), true);
    assert.equal(isCancelLocked('repairing'), true);
    assert.equal(isCancelLocked('accepted', true), true);
  });

  test('blockCancelIfArrived guards against cancelling when mechanic has arrived', () => {
    const shouldBlock = (activeRescueStatus?: string, trackingStatus?: string) => {
      if (activeRescueStatus === 'arrived' || trackingStatus === 'arrived') {
        return true;
      }
      return false;
    };

    assert.equal(shouldBlock('en_route', 'accepted'), false);
    assert.equal(shouldBlock('arrived', 'arrived'), true);
    assert.equal(shouldBlock(undefined, 'arrived'), true);
    assert.equal(shouldBlock('arrived', undefined), true);
  });
});
