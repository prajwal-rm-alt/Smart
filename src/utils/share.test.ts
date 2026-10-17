import test from 'node:test';
import assert from 'node:assert/strict';
import { getProductShareUrl, encodeProductPayload, decodeProductPayload } from './share.ts';

test('getProductShareUrl generates valid URL with product parameter', () => {
  const url = getProductShareUrl('morphy-richards-29-rcad', 'https://appliance-showcase.web.app/');
  assert.equal(url, 'https://appliance-showcase.web.app/?product=morphy-richards-29-rcad');
});

test('encodeProductPayload and decodeProductPayload preserves essential product data', () => {
  const sampleProduct: any = {
    id: 'test-air-fryer',
    brand: 'Philips',
    model: 'HD9252',
    category: 'Digital Air Fryer',
    capacityLitres: 4.1,
    dimensions: { widthCm: 26.4, heightCm: 29.5, depthCm: 36.0 },
    specifications: { powerWatts: 1400, temperatureRangeC: '60C-200C', timerMinutes: 60, sellingPrice: 7999 },
    features: ['Rapid Air Starfish', 'Dishwasher safe'],
    includedAccessories: ['Frying basket'],
    description: 'Crispy snacks with minimal oil',
  };

  const encoded = encodeProductPayload(sampleProduct);
  assert.ok(encoded.length > 10);

  const decoded = decodeProductPayload(encoded);
  assert.equal(decoded?.id, 'test-air-fryer');
  assert.equal(decoded?.brand, 'Philips');
  assert.equal(decoded?.model, 'HD9252');
  assert.equal(decoded?.capacityLitres, 4.1);
  assert.equal(decoded?.specifications?.powerWatts, 1400);
});
