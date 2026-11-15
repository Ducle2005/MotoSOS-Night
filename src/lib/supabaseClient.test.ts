import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { supabase, isLiveDispatchEnabled, getOrCreateCustomerId } from './supabaseClient';

describe('supabaseClient initialization & fallback safety', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('motosos_customer_id');
    }
  });

  it('safely evaluates supabase client to null when env vars are absent', () => {
    // In test environment, VITE_SUPABASE_URL is absent
    assert.strictEqual(typeof supabase, 'object');
    // If not configured, it must be null
    if (!process.env.VITE_SUPABASE_URL) {
      assert.strictEqual(supabase, null);
      assert.strictEqual(isLiveDispatchEnabled, false);
    }
  });

  it('getOrCreateCustomerId generates a persistent non-empty customer identifier', async () => {
    const customerId = await getOrCreateCustomerId();
    assert.ok(customerId);
    assert.strictEqual(typeof customerId, 'string');
    assert.ok(customerId.length >= 8);

    // Subsequent call must return identical cached id
    const cachedId = await getOrCreateCustomerId();
    assert.strictEqual(cachedId, customerId);
  });
});
