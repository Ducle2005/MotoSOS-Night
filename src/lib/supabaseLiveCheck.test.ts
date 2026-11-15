import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createClient } from '@supabase/supabase-js';

describe('Supabase Live Cloud Verification', () => {
  const url = 'https://zprisosxqookzmhkmdjq.supabase.co';
  const key = 'sb_publishable_OGFYOR70J7okT4a2Iz-rXA_KCjljQOA';
  const client = createClient(url, key);

  it('connects to Supabase and queries seeded mechanics', async () => {
    const { data, error } = await client.from('mechanics').select('*');
    assert.strictEqual(error, null);
    assert.ok(Array.isArray(data));
    assert.strictEqual(data.length, 4);
  });

  it('executes find_nearby_mechanics RPC successfully', async () => {
    const { data, error } = await client.rpc('find_nearby_mechanics', {
      p_lat: 10.7769,
      p_lng: 106.7009,
      p_radius_meters: 5000,
    });
    assert.strictEqual(error, null);
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
  });
});
