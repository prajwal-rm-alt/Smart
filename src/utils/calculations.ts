export type DimensionUnit = 'cm' | 'mm' | 'in' | 'ft';

export interface ApplianceDimensions {
  widthCm: number | null;
  heightCm: number | null;
  depthCm: number | null;
  weightKg?: number | null;
  ventilationClearanceCm?: number | null;
  recommendedAreaCm2?: number | null;
}

export interface KitchenSpaceInput {
  width: number;
  height: number;
  depth: number;
  unit: DimensionUnit;
  hasTopCabinet?: boolean;
}

export interface FitEvaluationResult {
  fitsPhysically: boolean;
  fitsWithVentilation: boolean;
  widthMarginCm: number;
  heightMarginCm: number;
  depthMarginCm: number;
  applianceFootprintCm2: number;
  kitchenFootprintCm2: number;
  ventilationClearanceRequiredCm: number;
  warnings: string[];
  recommendations: string[];
}

/**
 * Converts length measurements between units (cm, mm, in, ft)
 */
export function convertUnit(value: number, fromUnit: DimensionUnit, toUnit: DimensionUnit): number {
  if (value === 0 || isNaN(value)) return 0;
  if (fromUnit === toUnit) return Math.round(value * 100) / 100;

  // Convert to cm as standard intermediate
  let inCm = 0;
  switch (fromUnit) {
    case 'cm':
      inCm = value;
      break;
    case 'mm':
      inCm = value / 10;
      break;
    case 'in':
      inCm = value * 2.54;
      break;
    case 'ft':
      inCm = value * 30.48;
      break;
  }

  // Convert cm to target unit
  let target = 0;
  switch (toUnit) {
    case 'cm':
      target = inCm;
      break;
    case 'mm':
      target = inCm * 10;
      break;
    case 'in':
      target = inCm / 2.54;
      break;
    case 'ft':
      target = inCm / 30.48;
      break;
  }

  return Math.round(target * 100) / 100;
}

/**
 * Calculates rectangular footprint in cm²: width × depth
 */
export function calculateFootprint(widthCm: number | null, depthCm: number | null): number {
  if (!widthCm || !depthCm || widthCm <= 0 || depthCm <= 0) return 0;
  return Math.round(widthCm * depthCm * 10) / 10;
}

/**
 * Evaluates whether an appliance fits inside a given kitchen counter or cabinet cavity.
 * Distinguishes physical fit from safe ventilation requirements.
 */
export function evaluateKitchenFit(
  appliance: ApplianceDimensions,
  kitchen: KitchenSpaceInput
): FitEvaluationResult {
  // Convert kitchen dimensions to cm for comparison
  const kitchenWidthCm = convertUnit(kitchen.width, kitchen.unit, 'cm');
  const kitchenHeightCm = convertUnit(kitchen.height, kitchen.unit, 'cm');
  const kitchenDepthCm = convertUnit(kitchen.depth, kitchen.unit, 'cm');

  const appWidthCm = appliance.widthCm ?? 0;
  const appHeightCm = appliance.heightCm ?? 0;
  const appDepthCm = appliance.depthCm ?? 0;
  const clearanceRequired = appliance.ventilationClearanceCm ?? 5; // default 5 cm safe clearance

  const widthMarginCm = Math.round((kitchenWidthCm - appWidthCm) * 10) / 10;
  const heightMarginCm = Math.round((kitchenHeightCm - appHeightCm) * 10) / 10;
  const depthMarginCm = Math.round((kitchenDepthCm - appDepthCm) * 10) / 10;

  const fitsPhysically = widthMarginCm >= 0 && heightMarginCm >= 0 && depthMarginCm >= 0;

  // Ventilation check: requires clearance on sides (widthMargin / 2 >= clearance),
  // top (heightMargin >= clearance * 1.5 or 10cm), and rear (depthMargin >= clearance)
  const minSideClearance = clearanceRequired * 2; // total both sides
  const minTopClearance = Math.max(clearanceRequired * 1.5, 8);
  const minDepthClearance = clearanceRequired;

  const fitsWithVentilation =
    fitsPhysically &&
    widthMarginCm >= minSideClearance &&
    heightMarginCm >= minTopClearance &&
    depthMarginCm >= minDepthClearance;

  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (!fitsPhysically) {
    if (widthMarginCm < 0) {
      warnings.push(`Appliance exceeds counter width by ${Math.abs(widthMarginCm)} cm.`);
    }
    if (heightMarginCm < 0) {
      warnings.push(`Appliance exceeds available height by ${Math.abs(heightMarginCm)} cm.`);
    }
    if (depthMarginCm < 0) {
      warnings.push(`Appliance exceeds counter depth by ${Math.abs(depthMarginCm)} cm.`);
    }
  } else if (!fitsWithVentilation) {
    warnings.push(
      `Appliance physically fits, but does NOT meet the recommended safe ventilation clearance.`
    );
    if (widthMarginCm < minSideClearance) {
      warnings.push(
        `Side clearance is only ${widthMarginCm} cm (recommended: at least ${minSideClearance} cm total).`
      );
    }
    if (heightMarginCm < minTopClearance) {
      warnings.push(
        `Top clearance is only ${heightMarginCm} cm (recommended: at least ${minTopClearance} cm for rising heat).`
      );
    }
    if (depthMarginCm < minDepthClearance) {
      warnings.push(
        `Rear clearance is only ${depthMarginCm} cm (recommended: at least ${minDepthClearance} cm from the back wall).`
      );
    }
  }

  if (fitsPhysically) {
    recommendations.push(
      `Allow at least ${clearanceRequired} cm clearance from rear and side walls during cooking.`
    );
    recommendations.push(
      `Keep kitchen counter clear of heat-sensitive materials or paper products nearby.`
    );
  }

  const applianceFootprintCm2 = calculateFootprint(appWidthCm, appDepthCm);
  const kitchenFootprintCm2 = calculateFootprint(kitchenWidthCm, kitchenDepthCm);

  return {
    fitsPhysically,
    fitsWithVentilation,
    widthMarginCm,
    heightMarginCm,
    depthMarginCm,
    applianceFootprintCm2,
    kitchenFootprintCm2,
    ventilationClearanceRequiredCm: clearanceRequired,
    warnings,
    recommendations,
  };
}

/**
 * Validates product JSON schema item
 */
export function validateProductSchemaItem(item: unknown): {
  isValid: boolean;
  errors: string[];
  sanitized?: Record<string, unknown>;
} {
  const errors: string[] = [];
  if (!item || typeof item !== 'object') {
    return { isValid: false, errors: ['Item is not an object'] };
  }

  const obj = item as Record<string, unknown>;

  if (!obj.brand || typeof obj.brand !== 'string' || obj.brand.trim() === '') {
    errors.push('Brand name is required');
  }

  if (!obj.model || typeof obj.model !== 'string' || obj.model.trim() === '') {
    errors.push('Model name/number is required');
  }

  const category = String(obj.category || 'OTG');
  const validCategories = ['OTG', 'Digital Air Fryer', 'Manual Air Fryer', 'Other'];
  const sanitizedCategory = validCategories.find(
    (c) => c.toLowerCase() === category.toLowerCase()
  ) || 'OTG';

  const capacityLitres = typeof obj.capacityLitres === 'number'
    ? obj.capacityLitres
    : parseFloat(String(obj.capacityLitres || 0)) || 0;

  if (capacityLitres <= 0) {
    errors.push('Capacity in litres must be a positive number');
  }

  // Dimensions
  const dims = (obj.dimensions && typeof obj.dimensions === 'object')
    ? (obj.dimensions as Record<string, unknown>)
    : {};

  const dimensions = {
    widthCm: typeof dims.widthCm === 'number' ? dims.widthCm : (parseFloat(String(dims.widthCm)) || null),
    heightCm: typeof dims.heightCm === 'number' ? dims.heightCm : (parseFloat(String(dims.heightCm)) || null),
    depthCm: typeof dims.depthCm === 'number' ? dims.depthCm : (parseFloat(String(dims.depthCm)) || null),
    weightKg: typeof dims.weightKg === 'number' ? dims.weightKg : (parseFloat(String(dims.weightKg)) || null),
    ventilationClearanceCm: typeof dims.ventilationClearanceCm === 'number'
      ? dims.ventilationClearanceCm
      : (parseFloat(String(dims.ventilationClearanceCm)) || 5),
  };

  // Specs
  const specs = (obj.specifications && typeof obj.specifications === 'object')
    ? (obj.specifications as Record<string, unknown>)
    : {};

  const specifications = {
    powerWatts: typeof specs.powerWatts === 'number' ? specs.powerWatts : (parseFloat(String(specs.powerWatts)) || null),
    temperatureRangeC: specs.temperatureRangeC ? String(specs.temperatureRangeC) : null,
    timerMinutes: typeof specs.timerMinutes === 'number' ? specs.timerMinutes : (parseFloat(String(specs.timerMinutes)) || null),
    controlType: specs.controlType ? String(specs.controlType) : null,
    heatingElements: specs.heatingElements ? String(specs.heatingElements) : null,
    warrantyYears: typeof specs.warrantyYears === 'number' ? specs.warrantyYears : (parseFloat(String(specs.warrantyYears)) || null),
    mrpPrice: typeof specs.mrpPrice === 'number' ? specs.mrpPrice : (parseFloat(String(specs.mrpPrice)) || null),
    sellingPrice: typeof specs.sellingPrice === 'number' ? specs.sellingPrice : (parseFloat(String(specs.sellingPrice)) || null),
  };

  const id = String(obj.id || `${String(obj.brand || 'brand')}-${String(obj.model || 'model')}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

  const sanitized = {
    id,
    brand: String(obj.brand || '').trim(),
    model: String(obj.model || '').trim(),
    category: sanitizedCategory,
    capacityLitres,
    dimensions,
    specifications,
    features: Array.isArray(obj.features) ? obj.features.map(String) : [],
    cookingFunctions: Array.isArray(obj.cookingFunctions) ? obj.cookingFunctions.map(String) : [],
    includedAccessories: Array.isArray(obj.includedAccessories) ? obj.includedAccessories.map(String) : [],
    optionalAccessories: Array.isArray(obj.optionalAccessories) ? obj.optionalAccessories.map(String) : [],
    images: Array.isArray(obj.images) ? obj.images.map(String) : [],
    recipes: Array.isArray(obj.recipes) ? obj.recipes.map(String) : [],
    dataStatus: ['verified', 'unverified', 'needs_verification'].includes(String(obj.dataStatus))
      ? String(obj.dataStatus)
      : 'needs_verification',
    description: obj.description ? String(obj.description) : '',
    createdAt: typeof obj.createdAt === 'number' ? obj.createdAt : Date.now(),
    updatedAt: Date.now(),
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Generates an AI prompt designed to be copied into ChatGPT or other LLMs
 * to research accurate appliances and output valid JSON
 */
export function generateChatGPTResearchPrompt(options: {
  brand: string;
  category: string;
  models: string[];
  includeSpecs?: boolean;
  includeDimensions?: boolean;
  includeCooking?: boolean;
  includeAccessories?: boolean;
  includeRecipes?: boolean;
}): string {
  const modelsList = options.models.filter((m) => m.trim().length > 0).join(', ');

  return `Act as an expert kitchen appliance research specialist.

Research the following kitchen appliance models:
- Brand: ${options.brand}
- Category: ${options.category}
- Models to research: ${modelsList || 'Specified models'}

Provide verified specifications for each model using official manufacturer datasheets, product manuals, or verified catalog entries.

Output ONLY a single valid JSON object following this exact schema without extra conversational markdown:

{
  "schemaVersion": 1,
  "products": [
    {
      "id": "${options.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-model-slug",
      "brand": "${options.brand}",
      "model": "Model Name",
      "category": "${options.category}",
      "capacityLitres": 29,
      "dimensions": {
        "widthCm": 45.0,
        "heightCm": 30.0,
        "depthCm": 35.0,
        "weightKg": 6.8,
        "ventilationClearanceCm": 5.0
      },
      "specifications": {
        "powerWatts": 1500,
        "temperatureRangeC": "100°C - 250°C",
        "timerMinutes": 60,
        "controlType": "Digital",
        "heatingElements": "Top & Bottom Quartz / Stainless Steel",
        "warrantyYears": 2,
        "mrpPrice": 8999,
        "sellingPrice": 6499
      },
      "features": [
        "Motorized rotisserie with forks",
        "Convection fan for even browning",
        "Illuminated interior chamber"
      ],
      "cookingFunctions": [
        "Bake",
        "Grill",
        "Toast",
        "Rotisserie",
        "Keep Warm"
      ],
      "includedAccessories": [
        "Baking pan / tray",
        "Grill rack",
        "Crumb tray",
        "Rotisserie rod & handle",
        "Tray tong"
      ],
      "optionalAccessories": [],
      "images": [],
      "recipes": ["Paneer Tikka", "Artisan Pizza", "Vanilla Cake"],
      "dataStatus": "verified",
      "description": "Premium kitchen appliance for roasting, baking, and grilling."
    }
  ]
}

Important Instructions:
1. Do NOT invent missing specifications. If a specification is unknown, set it to null.
2. Ensure dimensions are in centimetres (cm) and power in watts (W).
3. If information is an estimate, set "dataStatus": "needs_verification". If confirmed from manufacturer docs, set "dataStatus": "verified".
4. Ensure valid JSON syntax with no trailing commas.`;
}
