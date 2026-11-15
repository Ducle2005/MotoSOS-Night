export const CRYPTO_PREFIX = 'MS_SEC_V1::';
const SECRET_SALT = 'MotoSOS_Secure_ZeroLag_Salt_2026';

/**
 * Synchronous Zero-Lag XOR + UTF-8 Base64 Encryption.
 * Safely handles full Vietnamese Unicode characters without corruption.
 */
export function encryptPayload(rawJson: string): string {
  if (typeof rawJson !== 'string' || !rawJson) return rawJson;
  try {
    const encoded = encodeURIComponent(rawJson);
    let xorStr = '';
    const saltLen = SECRET_SALT.length;
    for (let i = 0; i < encoded.length; i += 1) {
      xorStr += String.fromCharCode(encoded.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % saltLen));
    }
    const b64 = typeof window !== 'undefined' && typeof window.btoa === 'function'
      ? window.btoa(xorStr)
      : Buffer.from(xorStr, 'binary').toString('base64');
    return `${CRYPTO_PREFIX}${b64}`;
  } catch {
    return rawJson;
  }
}

/**
 * Synchronous Zero-Lag Decryption.
 * Backward-compatible: If the stored string lacks 'MS_SEC_V1::', it returns raw JSON as-is.
 */
export function decryptPayload(storedValue: string | null | undefined): string {
  if (!storedValue || typeof storedValue !== 'string') return '';
  if (!storedValue.startsWith(CRYPTO_PREFIX)) {
    return storedValue;
  }
  try {
    const b64 = storedValue.slice(CRYPTO_PREFIX.length);
    const xorStr = typeof window !== 'undefined' && typeof window.atob === 'function'
      ? window.atob(b64)
      : Buffer.from(b64, 'base64').toString('binary');
    let decoded = '';
    const saltLen = SECRET_SALT.length;
    for (let i = 0; i < xorStr.length; i += 1) {
      decoded += String.fromCharCode(xorStr.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % saltLen));
    }
    return decodeURIComponent(decoded);
  } catch {
    return storedValue;
  }
}

/**
 * Decrypts and safely parses a JSON payload with fallback.
 */
export function safeDecryptAndParse<T>(storedValue: string | null | undefined, fallback: T): T {
  if (!storedValue) return fallback;
  try {
    const plain = decryptPayload(storedValue);
    return JSON.parse(plain) as T;
  } catch {
    return fallback;
  }
}
