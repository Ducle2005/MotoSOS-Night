import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAutocompleteUrl,
  buildReverseGeocodeUrl,
  formatSuggestionDistance,
  mapAutocompleteFeatures,
  parseReverseGeocodeAddress,
} from './geocodeApi';

test('parseReverseGeocodeAddress ignores nearby building POI name and prioritizes street + area cleanly', () => {
  const address = parseReverseGeocodeAddress(
    {
      properties: {
        name: 'Sở Nông nghiệp và Môi trường Thành phố Hồ Chí Minh',
        address_line1: 'Sở Nông nghiệp và Môi trường Thành phố Hồ Chí Minh',
        housenumber: '182',
        street: 'Điện Biên Phủ',
        district: 'Quận Bình Thạnh',
      },
    },
    { lat: 10.7769, lng: 106.7009 },
  );
  assert.equal(address, '182 Điện Biên Phủ, Quận Bình Thạnh');

  const suburbPreferred = parseReverseGeocodeAddress(
    {
      properties: {
        street: 'Lê Thánh Tôn',
        suburb: 'Phường Bến Nghé',
        district: 'Quận 1',
      },
    },
    { lat: 10.7769, lng: 106.7009 },
  );
  assert.equal(suburbPreferred, 'Lê Thánh Tôn, Phường Bến Nghé');
});

test('mapAutocompleteFeatures maps address_line1, address_line2, and distanceMeters', () => {
  const origin = { lat: 10.7769, lng: 106.7009 };
  const items = mapAutocompleteFeatures(
    [
      {
        geometry: { coordinates: [106.6952, 10.7721] },
        properties: {
          place_id: 'place-ben-thanh',
          address_line1: 'Chợ Bến Thành',
          address_line2: 'Lê Lợi, Quận 1, Ho Chi Minh City, Vietnam',
        },
      },
    ],
    origin,
  );

  assert.equal(items.length, 1);
  assert.equal(items[0].addressLine1, 'Chợ Bến Thành');
  assert.equal(items[0].addressLine2, 'Lê Lợi, Q.1');
  assert.equal(items[0].fullAddress, 'Chợ Bến Thành, Lê Lợi, Q.1');
  assert.ok(items[0].distanceMeters > 500 && items[0].distanceMeters < 1200);
});

test('buildReverseGeocodeUrl, buildAutocompleteUrl, and formatSuggestionDistance match Geoapify spec', () => {
  const reverseUrl = buildReverseGeocodeUrl(
    { lat: 10.7769, lng: 106.7009 },
    'test-key',
  );
  assert.ok(
    reverseUrl.includes(
      'https://api.geoapify.com/v1/geocode/reverse?lat=10.7769&lon=106.7009&lang=vi&apiKey=test-key',
    ),
  );

  const autoUrl = buildAutocompleteUrl(
    'Chợ Bến Thành',
    { lat: 10.7769, lng: 106.7009 },
    'test-key',
  );
  assert.ok(autoUrl.includes('lang=vi'));
  assert.ok(autoUrl.includes('filter=countrycode:vn'));
  assert.ok(autoUrl.includes('bias=proximity:106.7009,10.7769'));
  assert.ok(autoUrl.includes('limit=5'));

  assert.equal(formatSuggestionDistance(480), '480 m');
  assert.equal(formatSuggestionDistance(1620), '1.6 km');
});
