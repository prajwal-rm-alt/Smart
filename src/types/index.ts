export type ApplianceCategory = 'OTG' | 'Digital Air Fryer' | 'Manual Air Fryer' | 'Other';

export type DataStatus = 'verified' | 'unverified' | 'needs_verification';

export type DimensionUnit = 'cm' | 'mm' | 'in' | 'ft';

export interface ProductDimensions {
  widthCm: number | null;
  heightCm: number | null;
  depthCm: number | null;
  weightKg?: number | null;
  ventilationClearanceCm?: number | null;
  recommendedAreaCm2?: number | null;
  internalCavityCm?: {
    widthCm: number;
    heightCm: number;
    depthCm: number;
  } | null;
  openDepthCm?: number | null;
}

export interface ProductSpecifications {
  powerWatts: number | null;
  temperatureRangeC: string | null;
  timerMinutes: number | null;
  controlType: 'Digital' | 'Manual' | 'Touch / Knob Hybrid' | 'Dial' | string | null;
  heatingElements?: string | null;
  warrantyYears?: number | null;
  mrpPrice?: number | null;
  sellingPrice?: number | null;
}

export interface Product {
  id: string;
  brand: string;
  model: string;
  category: ApplianceCategory;
  capacityLitres: number;
  dimensions: ProductDimensions;
  specifications: ProductSpecifications;
  features: string[];
  cookingFunctions: string[];
  includedAccessories: string[];
  optionalAccessories?: string[];
  images: string[];
  recipes?: string[];
  dataStatus: DataStatus;
  description?: string;
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FoodGalleryItem {
  id: string;
  title: string;
  name?: string;
  emoji?: string;
  imageUrl: string;
  image?: string;
  taggedModelIds: string[]; // IDs of appliances that can cook or created this food
  compatibleModelIds?: string[];
  taggedCategory: 'OTG' | 'Air Fryer' | 'Both';
  compatibleCategories?: string[];
  caption?: string;
  cookingTimeMinutes?: number;
  temperatureC?: number;
  difficulty?: string;
  ingredients?: string[];
  steps?: string[];
  recommendedAccessories?: string[];
  safetyTips?: string[];
  createdAt: number;
}

// Backward compatibility alias
export type Recipe = FoodGalleryItem;

export interface KitchenSpace {
  width: number;
  height: number;
  depth: number;
  unit: DimensionUnit;
  hasTopCabinet?: boolean;
}

export interface BulkImportReport {
  totalFound: number;
  addedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: string[];
  warnings: string[];
  validProducts: Product[];
}

export type ActiveTab = 'home' | 'catalogue' | 'space' | 'recipes' | 'settings';
