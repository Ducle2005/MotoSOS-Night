import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isLiveDispatchEnabled } from '../lib/supabaseClient';

describe('useLiveDispatch hook definitions', () => {
  it('correctly exports isLiveDispatchEnabled boolean', () => {
    assert.strictEqual(typeof isLiveDispatchEnabled, 'boolean');
  });
});
