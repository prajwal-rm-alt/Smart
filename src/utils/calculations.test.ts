import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertUnit,
  calculateFootprint,
  evaluateKitchenFit,
  validateProductSchemaItem,
  generateChatGPTResearchPrompt,
} from './calculations.ts';

test('unit conversion math handles length units accurately', () => {
  // 1 inch = 2.54 cm
  assert.equal(convertUnit(10, 'in', 'cm'), 25.4);
  assert.equal(convertUnit(25.4, 'cm', 'in'), 10);

  // 1 foot = 30.48 cm
  assert.equal(convertUnit(2, 'ft', 'cm'), 60.96);

  // mm to cm
  assert.equal(convertUnit(450, 'mm', 'cm'), 45);

  // identity
  assert.equal(convertUnit(30, 'cm', 'cm'), 30);
});

test('footprint calculation: 45 x 35 cm = 1575 cm²', () => {
  const area = calculateFootprint(45, 35);
  assert.equal(area, 1575);
});

test('footprint calculation handles null or negative values safely', () => {
  assert.equal(calculateFootprint(null, 35), 0);
  assert.equal(calculateFootprint(45, null), 0);
  assert.equal(calculateFootprint(-10, 35), 0);
});

test('evaluateKitchenFit distinguishes physical fit from safe ventilation clearance', () => {
  const appliance = {
    widthCm: 45,
    heightCm: 30,
    depthCm: 35,
    ventilationClearanceCm: 5,
  };

  // Case 1: Ample space (both physical and ventilation fit)
  const spaciousKitchen = {
    width: 70,
    height: 50,
    depth: 50,
    unit: 'cm' as const,
  };
  const ampleFit = evaluateKitchenFit(appliance, spaciousKitchen);
  assert.equal(ampleFit.fitsPhysically, true);
  assert.equal(ampleFit.fitsWithVentilation, true);
  assert.equal(ampleFit.warnings.length, 0);

  // Case 2: Physically fits (e.g. 47cm wide), but fails side ventilation (needs 10cm total margin)
  const tightKitchen = {
    width: 47,
    height: 45,
    depth: 45,
    unit: 'cm' as const,
  };
  const tightFit = evaluateKitchenFit(appliance, tightKitchen);
  assert.equal(tightFit.fitsPhysically, true);
  assert.equal(tightFit.fitsWithVentilation, false);
  assert.ok(tightFit.warnings.length > 0);
  assert.ok(tightFit.warnings[0].includes('ventilation'));

  // Case 3: Physically too small (e.g. 40cm wide for 45cm appliance)
  const crampedKitchen = {
    width: 40,
    height: 45,
    depth: 45,
    unit: 'cm' as const,
  };
  const tooSmallFit = evaluateKitchenFit(appliance, crampedKitchen);
  assert.equal(tooSmallFit.fitsPhysically, false);
  assert.equal(tooSmallFit.fitsWithVentilation, false);
});

test('validateProductSchemaItem rejects items missing brand or model', () => {
  const invalid = { brand: '', model: '' };
  const res = validateProductSchemaItem(invalid);
  assert.equal(res.isValid, false);
  assert.ok(res.errors.length >= 2);
});

test('validateProductSchemaItem sanitizes valid product JSON with complete fields', () => {
  const raw = {
    brand: 'Morphy Richards',
    model: '29 RCAD',
    category: 'OTG',
    capacityLitres: '29',
    dimensions: {
      widthCm: '45',
      heightCm: '30',
      depthCm: '35',
    },
    specifications: {
      powerWatts: '1500',
      temperatureRangeC: '100 - 250 C',
    },
    features: ['Motorized rotisserie'],
    dataStatus: 'verified',
  };

  const res = validateProductSchemaItem(raw);
  assert.equal(res.isValid, true);
  assert.equal(res.sanitized?.brand, 'Morphy Richards');
  assert.equal(res.sanitized?.model, '29 RCAD');
  assert.equal(res.sanitized?.capacityLitres, 29);
  assert.equal(res.sanitized?.category, 'OTG');
});

test('generateChatGPTResearchPrompt creates structured prompt containing selected models', () => {
  const prompt = generateChatGPTResearchPrompt({
    brand: 'Morphy Richards',
    category: 'OTG',
    models: ['29 RCAD', '20 RCAD', '60 RCSS'],
  });

  assert.ok(prompt.includes('Morphy Richards'));
  assert.ok(prompt.includes('29 RCAD'));
  assert.ok(prompt.includes('20 RCAD'));
  assert.ok(prompt.includes('60 RCSS'));
  assert.ok(prompt.includes('schemaVersion'));
});
