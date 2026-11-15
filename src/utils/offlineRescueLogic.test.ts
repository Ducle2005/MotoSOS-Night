import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildOfflineSmsHref,
  buildOfflineSmsMessage,
  getSmsDelimiter,
  removeVietnameseAccents,
} from './offlineRescueLogic';

test('removeVietnameseAccents strips all diacritics and replaces d/D', () => {
  const result = removeVietnameseAccents('Đường Lý Tự Trọng, Phường Bến Nghé, Quận 1');
  assert.equal(result, 'Duong Ly Tu Trong, Phuong Ben Nghe, Quan 1');
  assert.equal(removeVietnameseAccents('Cứu hộ chết máy'), 'Cuu ho chet may');
});

test('getSmsDelimiter returns &body= for iOS and ?body= for Android/desktop', () => {
  const iosUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15';
  const androidUa = 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36';
  assert.equal(getSmsDelimiter(iosUa), '&body=');
  assert.equal(getSmsDelimiter(androidUa), '?body=');
  assert.equal(getSmsDelimiter(''), '?body=');
});

test('buildOfflineSmsMessage formats clean non-accented GSM safe SOS message', () => {
  const msg = buildOfflineSmsMessage(10.7769, 106.7009, '63 Đường Lý Tự Trọng, Q.1', 'Lủng lốp');
  assert.match(msg, /^SOS MotoSOS: Toa do 10\.77690,106\.70090 gan 63 Duong Ly Tu Trong, Q\.1\. Xe bi Lung lop can cuu ho gap!$/);
});

test('buildOfflineSmsHref formats valid sms: link with proper delimiter and encoded body', () => {
  const hrefIos = buildOfflineSmsHref(
    '0909 888 999',
    { lat: 10.7769, lng: 106.7009, address: '63 Lý Tự Trọng' },
    'Chết máy',
    'iPhone',
  );
  assert.ok(hrefIos.startsWith('sms:0909888999&body='));
  assert.ok(hrefIos.includes(encodeURIComponent('SOS MotoSOS:')));

  const hrefAndroid = buildOfflineSmsHref(
    '0909 888 999',
    { lat: 10.7769, lng: 106.7009, address: '63 Lý Tự Trọng' },
    'Chết máy',
    'Android',
  );
  assert.ok(hrefAndroid.startsWith('sms:0909888999?body='));
});
