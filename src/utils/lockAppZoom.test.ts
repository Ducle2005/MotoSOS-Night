import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { isInsideMap, initLockAppZoom } from './lockAppZoom';

describe('lockAppZoom unit tests', () => {
  test('isInsideMap returns false for null or non-map elements', () => {
    assert.equal(isInsideMap(null), false);
    const div = { closest: () => null } as unknown as Element;
    assert.equal(isInsideMap(div), false);
  });

  test('isInsideMap returns true for elements inside map container', () => {
    const mapChild = {
      closest: (sel: string) => sel.includes('.maplibregl-map') ? {} : null,
    } as unknown as Element;
    assert.equal(isInsideMap(mapChild), true);
  });

  test('initLockAppZoom safely runs in non-browser env', () => {
    const cleanup = initLockAppZoom();
    assert.equal(typeof cleanup, 'function');
    cleanup();
  });
});
