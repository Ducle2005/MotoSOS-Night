import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createCircularPinImageData, registerMotoSosMapIcons } from './mapPinIcons';

describe('mapPinIcons unit tests', () => {
  it('gracefully returns null in node environment without canvas document', () => {
    const res = createCircularPinImageData({ bg: '#1D63ED', paths: ['M0 0'] });
    assert.equal(res, null);
  });

  it('safely handles registerMotoSosMapIcons without errors in node environment', () => {
    let addImageCount = 0;
    const fakeMap = {
      hasImage: () => false,
      addImage: () => { addImageCount += 1; },
    };
    registerMotoSosMapIcons(fakeMap as unknown as Parameters<typeof registerMotoSosMapIcons>[0]);
    assert.equal(addImageCount, 0); // Guarded by typeof document === 'undefined'
  });
});
