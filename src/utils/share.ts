export interface ShareableProduct {
  id: string;
  brand: string;
  model: string;
  category: string;
  capacityLitres: number;
  dimensions: {
    widthCm: number | null;
    heightCm: number | null;
    depthCm: number | null;
    ventilationClearanceCm?: number | null;
  };
  specifications: {
    powerWatts: number | null;
    temperatureRangeC: string | null;
    timerMinutes: number | null;
    controlType: string | null;
    sellingPrice?: number | null;
    mrpPrice?: number | null;
  };
  features: string[];
  includedAccessories: string[];
  description?: string;
}

/**
 * Generates the public share URL for an appliance product sheet
 */
export function getProductShareUrl(productId: string, customBaseUrl?: string, payload?: string): string {
  let base = '';
  if (customBaseUrl) {
    base = customBaseUrl;
  } else if (typeof window !== 'undefined' && window.location) {
    base = `${window.location.origin}${window.location.pathname}`;
  } else {
    base = 'http://localhost:3000/';
  }

  const cleanBase = base.split('?')[0].split('#')[0];
  const url = new URL(cleanBase);
  url.searchParams.set('product', productId);
  if (payload) {
    url.searchParams.set('p', payload);
  }
  return url.toString();
}

/**
 * Compresses essential product specs into a lightweight URL parameter
 * so that any customer scanning on a new phone can view the specs even without IndexedDB sync
 */
export function encodeProductPayload(product: ShareableProduct): string {
  const minimal = {
    id: product.id,
    b: product.brand,
    m: product.model,
    c: product.category,
    l: product.capacityLitres,
    w: product.dimensions.widthCm,
    h: product.dimensions.heightCm,
    d: product.dimensions.depthCm,
    p: product.specifications.powerWatts,
    t: product.specifications.temperatureRangeC,
    tm: product.specifications.timerMinutes,
    ctrl: product.specifications.controlType,
    sp: product.specifications.sellingPrice,
    mrp: product.specifications.mrpPrice,
    f: product.features.slice(0, 4),
    a: product.includedAccessories.slice(0, 4),
    desc: product.description,
  };

  try {
    const json = JSON.stringify(minimal);
    if (typeof btoa !== 'undefined') {
      return btoa(encodeURIComponent(json));
    }
    return Buffer.from(encodeURIComponent(json)).toString('base64');
  } catch {
    return '';
  }
}

/**
 * Decodes the minimal product payload back into a displayable Product object
 */
export function decodeProductPayload(encoded: string): Partial<ShareableProduct> | null {
  try {
    let json = '';
    if (typeof atob !== 'undefined') {
      json = decodeURIComponent(atob(encoded));
    } else {
      json = decodeURIComponent(Buffer.from(encoded, 'base64').toString());
    }
    const data = JSON.parse(json);
    return {
      id: data.id,
      brand: data.b,
      model: data.m,
      category: data.c,
      capacityLitres: data.l,
      dimensions: {
        widthCm: data.w,
        heightCm: data.h,
        depthCm: data.d,
        ventilationClearanceCm: 5,
      },
      specifications: {
        powerWatts: data.p,
        temperatureRangeC: data.t,
        timerMinutes: data.tm,
        controlType: data.ctrl,
        sellingPrice: data.sp,
        mrpPrice: data.mrp,
      },
      features: data.f || [],
      includedAccessories: data.a || [],
      description: data.desc || '',
    };
  } catch {
    return null;
  }
}
