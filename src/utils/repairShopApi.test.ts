import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGoogleMapsSearchUrl,
  formatShortCallLabel,
  formatShopCompactMeta,
  formatShopDistanceLabel,
  getOpenRepairShops,
  mapGeoapifyFeaturesToRepairShops,
  normalizeRepairShopAddress,
  normalizeRepairShopName,
  resolveRepairShopPhone,
} from './repairShopApi';

test('mapGeoapifyFeaturesToRepairShops evaluates opening_hours and sorts nearest first', () => {
  const userCoord = { lat: 10.7769, lng: 106.7009 };
  // 23:00 local time on Wednesday
  const lateNight = new Date(2026, 4, 13, 23, 0, 0);

  const shops = mapGeoapifyFeaturesToRepairShops(
    [
      {
        geometry: { type: 'Point', coordinates: [106.702, 10.778] },
        properties: {
          place_id: 'shop-closed',
          name: 'Tiệm Đã Đóng',
          address_line2: '10 Lê Thánh Tôn, Quận 1, Ho Chi Minh City',
          distance: 150,
          opening_hours: 'Mo-Su 07:00-21:00',
        },
      },
      {
        geometry: { type: 'Point', coordinates: [106.703, 10.779] },
        properties: {
          place_id: 'shop-247',
          name: 'Sửa Xe 24/7',
          address_line2: '42 Lý Tự Trọng, Quận 1, Vietnam',
          distance: 320,
          opening_hours: '24/7',
        },
      },
      {
        geometry: { type: 'Point', coordinates: [106.698, 10.777] },
        properties: {
          place_id: 'shop-unknown',
          name: 'Sửa Xe Hồng Phúc',
          address_line2: '65 Nguyễn Du, Quận 1',
          distance: 280,
        },
      },
    ],
    userCoord,
    lateNight,
  );

  assert.equal(shops.length, 3);
  assert.equal(shops[0].id, 'shop-closed');
  assert.equal(shops[0].isOpen, false);

  const openOnly = getOpenRepairShops(shops);
  assert.equal(openOnly.length, 2);
  assert.equal(openOnly[0].id, 'shop-unknown');
  assert.equal(openOnly[0].openStatusLabel, 'Mở cửa • Gọi xác nhận trước');
  assert.equal(openOnly[1].id, 'shop-247');
  assert.equal(openOnly[1].openStatusLabel, 'Đang mở cửa');
  assert.equal(openOnly[1].address, '42 Lý Tự Trọng, Q.1');
});

test('normalizeRepairShopName and normalizeRepairShopAddress clean generic English names and Saigon', () => {
  assert.equal(normalizeRepairShopName('Motorbike repair'), 'Tiệm Sửa Xe Lưu Động');
  assert.equal(normalizeRepairShopName('Repair Shop'), 'Tiệm Sửa Xe Lưu Động');
  assert.equal(normalizeRepairShopName('Sửa xe Saigon'), 'Sửa xe TP.HCM');
  assert.equal(normalizeRepairShopAddress('Saigon'), 'TP.HCM');
  assert.equal(formatShopCompactMeta(1120, 'Đ. Nguyễn Thị Minh Khai'), '1.1 km • Đ. Nguyễn Thị Minh Khai');
  assert.equal(formatShopCompactMeta(450, '42 Lý Tự Trọng'), '450m • 42 Lý Tự Trọng');
});

test('formatShopDistanceLabel and buildGoogleMapsSearchUrl format cleanly', () => {
  assert.equal(formatShopDistanceLabel(450, 2), '450m · 2 phút chạy xe');
  assert.equal(formatShopDistanceLabel(1460, 4), '1.5 km · 4 phút chạy xe');

  const url = buildGoogleMapsSearchUrl({
    name: 'Sửa Xe 24/7',
    address: '42 Lý Tự Trọng, Q.1',
  });
  assert.ok(url.startsWith('https://www.google.com/maps/search/?api=1&query='));
  assert.ok(url.includes(encodeURIComponent('Sửa Xe 24/7 42 Lý Tự Trọng, Q.1')));
});

test('resolveRepairShopPhone prioritizes explicit phone and assigns deterministic VN mobile fallback per ID', () => {
  assert.equal(resolveRepairShopPhone('shop-1', '+84908111222'), '0908111222');

  const p1a = resolveRepairShopPhone('geoapify-place-abc');
  const p1b = resolveRepairShopPhone('geoapify-place-abc');
  assert.equal(p1a, p1b);
  assert.match(p1a, /^09\d{2}\s\d{3}\s\d{3}$/);
  assert.equal(formatShortCallLabel('0908 412 739'), 'Gọi 0908...');
});

test('mapGeoapifyFeaturesToRepairShops filters out car dealerships and deduplicates shops', () => {
  const userCoord = { lat: 10.7769, lng: 106.7009 };
  const shops = mapGeoapifyFeaturesToRepairShops(
    [
      {
        geometry: { type: 'Point', coordinates: [106.702, 10.778] },
        properties: { name: 'Toyota Ben Thanh', address_line2: '26 Vo Van Kiet' },
      },
      {
        geometry: { type: 'Point', coordinates: [106.703, 10.779] },
        properties: { name: 'Honda Head Phat Tien', address_line2: '136 Hai Ba Trung' },
      },
      {
        geometry: { type: 'Point', coordinates: [106.70305, 10.77902] },
        properties: { name: 'Honda Head Phat Tien', address_line2: '136 Hai Ba Trung' },
      },
      {
        geometry: { type: 'Point', coordinates: [106.705, 10.781] },
        properties: { name: 'Hyundai Truong Chinh', address_line2: '78 Truong Chinh' },
      },
    ],
    userCoord,
  );

  assert.equal(shops.length, 1);
  assert.equal(shops[0].name, 'Honda Head Phat Tien');
});
