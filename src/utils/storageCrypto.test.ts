import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CRYPTO_PREFIX,
  decryptPayload,
  encryptPayload,
  safeDecryptAndParse,
} from './storageCrypto';

test('storageCrypto encryptPayload prepends MS_SEC_V1:: prefix and produces reversible ciphertext', () => {
  const original = JSON.stringify({ name: 'Nguyễn Minh Tuấn', plate: '59-P2 842.19', price: 140000 });
  const cipher = encryptPayload(original);

  assert.ok(cipher.startsWith(CRYPTO_PREFIX));
  assert.notEqual(cipher, original);

  const decrypted = decryptPayload(cipher);
  assert.equal(decrypted, original);
  const parsed = JSON.parse(decrypted);
  assert.equal(parsed.name, 'Nguyễn Minh Tuấn');
  assert.equal(parsed.price, 140000);
});

test('storageCrypto decryptPayload maintains backward compatibility with legacy unencrypted JSON', () => {
  const legacy = '{"fullName":"Nguyễn Hoàng Nam","phone":"+84 908 412 739"}';
  const result = decryptPayload(legacy);
  assert.equal(result, legacy);
});

test('storageCrypto safeDecryptAndParse handles encrypted, plain, and corrupted inputs gracefully', () => {
  const sample = { id: 'MS-8492', service: 'Lủng lốp' };
  const fallback = { id: 'fallback', service: 'none' };

  // 1. Encrypted payload
  const cipher = encryptPayload(JSON.stringify(sample));
  const parsed1 = safeDecryptAndParse(cipher, fallback);
  assert.deepEqual(parsed1, sample);

  // 2. Legacy plain unencrypted payload
  const plain = JSON.stringify(sample);
  const parsed2 = safeDecryptAndParse(plain, fallback);
  assert.deepEqual(parsed2, sample);

  // 3. Null/undefined/corrupted payload returns fallback
  assert.deepEqual(safeDecryptAndParse(null, fallback), fallback);
  assert.deepEqual(safeDecryptAndParse(undefined, fallback), fallback);
  assert.deepEqual(safeDecryptAndParse('MS_SEC_V1::not-valid-base64!', fallback), fallback);
});
