import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalStorageAdapter } from './storageRepository';
import { CRYPTO_PREFIX } from '../utils/storageCrypto';

// In-memory mock localStorage for test environment
function createMockStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, val: string) => map.set(key, val),
    removeItem: (key: string) => map.delete(key),
    clear: () => map.clear(),
    _rawMap: map,
  };
}

test('storageRepository profileRepo encrypts data in storage and returns clean object', () => {
  const mock = createMockStorage();
  (globalThis as unknown as { window: { localStorage: typeof mock } }).window = { localStorage: mock };

  const adapter = new LocalStorageAdapter();
  const profile = adapter.getProfile();
  assert.equal(profile.fullName, 'Nguyễn Hoàng Nam');

  adapter.saveProfile({ ...profile, fullName: 'Phan Uyên Nhi' });

  // Verify stored payload is encrypted with MS_SEC_V1::
  const rawStored = mock.getItem('motosos_user_profile');
  assert.ok(rawStored && rawStored.startsWith(CRYPTO_PREFIX));

  // Verify retrieval decrypts properly
  const reloaded = adapter.getProfile();
  assert.equal(reloaded.fullName, 'Phan Uyên Nhi');
});

test('storageRepository historyRepo encrypts history and correctly tracks pending cancel fee', () => {
  const mock = createMockStorage();
  (globalThis as unknown as { window: { localStorage: typeof mock } }).window = { localStorage: mock };

  const adapter = new LocalStorageAdapter();
  assert.equal(adapter.getPendingCancelFee(), 0);

  adapter.savePendingCancelFee(30000);
  const rawFee = mock.getItem('motosos_pending_cancel_fee');
  assert.ok(rawFee && rawFee.startsWith(CRYPTO_PREFIX));
  assert.equal(adapter.getPendingCancelFee(), 30000);
});

test('storageRepository addressRepo manages encrypted saved addresses', () => {
  const mock = createMockStorage();
  (globalThis as unknown as { window: { localStorage: typeof mock } }).window = { localStorage: mock };

  const adapter = new LocalStorageAdapter();
  const addresses = adapter.getSavedAddresses();
  assert.ok(addresses.length >= 3);

  adapter.saveAddresses([...addresses, {
    id: 'addr-new',
    tag: 'other',
    label: 'Nhà bạn',
    address: '12 Lê Duẩn, Q.1',
    lat: 10.78,
    lng: 106.70,
  }]);

  const raw = mock.getItem('motosos_saved_addresses');
  assert.ok(raw && raw.startsWith(CRYPTO_PREFIX));

  const updated = adapter.getSavedAddresses();
  assert.equal(updated.length, addresses.length + 1);
  assert.equal(updated[updated.length - 1].label, 'Nhà bạn');
});
