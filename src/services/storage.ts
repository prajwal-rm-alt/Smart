import { Product, Recipe, BulkImportReport } from '../types';
import { INITIAL_PRODUCTS, INITIAL_RECIPES } from './seedData';
import { validateProductSchemaItem } from '../utils/calculations';

const DB_NAME = 'SmartApplianceDB';
const DB_VERSION = 1;

const STORE_PRODUCTS = 'products';
const STORE_RECIPES = 'recipes';
const STORE_SETTINGS = 'settings';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        const prodStore = db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
        prodStore.createIndex('category', 'category', { unique: false });
        prodStore.createIndex('brand', 'brand', { unique: false });
        prodStore.createIndex('isFavorite', 'isFavorite', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_RECIPES)) {
        const recStore = db.createObjectStore(STORE_RECIPES, { keyPath: 'id' });
        recStore.createIndex('category', 'category', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Initializes database and seeds data if empty
 */
export async function initStorage(): Promise<void> {
  try {
    const db = await openDatabase();
    const productCount = await getStoreCount(db, STORE_PRODUCTS);
    const hasMigrated = typeof window !== 'undefined' && localStorage.getItem('smart_appliance_v2_gallery_and_dims');

    if (productCount === 0 || !hasMigrated) {
      // Seed or refresh verified dimensions and food gallery items
      await seedInitialData(db);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_appliance_v2_gallery_and_dims', 'true');
      }
    }
  } catch (err) {
    console.warn('IndexedDB initialization notice (falling back if needed):', err);
    // LocalStorage fallback check
    if (!localStorage.getItem('smart_appliance_seeded') || !localStorage.getItem('smart_appliance_v2_gallery_and_dims')) {
      localStorage.setItem('smart_appliance_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('smart_appliance_recipes', JSON.stringify(INITIAL_RECIPES));
      localStorage.setItem('smart_appliance_seeded', 'true');
      localStorage.setItem('smart_appliance_v2_gallery_and_dims', 'true');
    }
  }
}

function getStoreCount(db: IDBDatabase, storeName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const countRequest = store.count();

    countRequest.onsuccess = () => resolve(countRequest.result);
    countRequest.onerror = () => reject(countRequest.error);
  });
}

async function seedInitialData(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PRODUCTS, STORE_RECIPES], 'readwrite');
    const prodStore = transaction.objectStore(STORE_PRODUCTS);
    const recStore = transaction.objectStore(STORE_RECIPES);

    for (const prod of INITIAL_PRODUCTS) {
      prodStore.put(prod);
    }

    for (const rec of INITIAL_RECIPES) {
      recStore.put(rec);
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// ---------------- PRODUCTS CRUD ----------------

export async function getAllProducts(): Promise<Product[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PRODUCTS, 'readonly');
      const store = transaction.objectStore(STORE_PRODUCTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as Product[];
        if (results && results.length > 0) {
          resolve(results);
        } else {
          // If empty, return initial products
          resolve(INITIAL_PRODUCTS);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback to localStorage
    const saved = localStorage.getItem('smart_appliance_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  }
}

export async function saveProduct(product: Product): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = transaction.objectStore(STORE_PRODUCTS);
      const request = store.put({ ...product, updatedAt: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const list = await getAllProducts();
    const idx = list.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      list[idx] = { ...product, updatedAt: Date.now() };
    } else {
      list.unshift({ ...product, updatedAt: Date.now() });
    }
    localStorage.setItem('smart_appliance_products', JSON.stringify(list));
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = transaction.objectStore(STORE_PRODUCTS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const list = await getAllProducts();
    const filtered = list.filter((p) => p.id !== id);
    localStorage.setItem('smart_appliance_products', JSON.stringify(filtered));
  }
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const products = await getAllProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return false;
  const updatedStatus = !product.isFavorite;
  await saveProduct({ ...product, isFavorite: updatedStatus });
  return updatedStatus;
}

// ---------------- RECIPES CRUD ----------------

export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_RECIPES, 'readonly');
      const store = transaction.objectStore(STORE_RECIPES);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as Recipe[];
        resolve(results && results.length > 0 ? results : INITIAL_RECIPES);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    const saved = localStorage.getItem('smart_appliance_recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  }
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_RECIPES, 'readwrite');
      const store = transaction.objectStore(STORE_RECIPES);
      const request = store.put(recipe);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const list = await getAllRecipes();
    const idx = list.findIndex((r) => r.id === recipe.id);
    if (idx >= 0) {
      list[idx] = recipe;
    } else {
      list.unshift(recipe);
    }
    localStorage.setItem('smart_appliance_recipes', JSON.stringify(list));
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_RECIPES, 'readwrite');
      const store = transaction.objectStore(STORE_RECIPES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const list = await getAllRecipes();
    const filtered = list.filter((r) => r.id !== id);
    localStorage.setItem('smart_appliance_recipes', JSON.stringify(filtered));
  }
}

// ---------------- BULK IMPORT & VALIDATION ----------------

export async function validateAndParseProductJSON(rawJson: string): Promise<BulkImportReport> {
  const report: BulkImportReport = {
    totalFound: 0,
    addedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    errors: [],
    warnings: [],
    validProducts: [],
  };

  if (!rawJson || rawJson.trim() === '') {
    report.errors.push('Input JSON is empty');
    return report;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    report.errors.push(`Invalid JSON syntax: ${(err as Error).message}`);
    return report;
  }

  // Handle single product or products array or envelope object
  let rawList: unknown[] = [];
  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.products)) {
      rawList = obj.products;
    } else if (Array.isArray(obj.appliances)) {
      rawList = obj.appliances;
    } else {
      // Single product object
      rawList = [obj];
    }
  }

  report.totalFound = rawList.length;

  if (rawList.length === 0) {
    report.errors.push('No product records detected in the provided JSON');
    return report;
  }

  const existingProducts = await getAllProducts();
  const existingMap = new Map(existingProducts.map((p) => [p.id.toLowerCase(), p]));

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    const validation = validateProductSchemaItem(item);

    if (!validation.isValid) {
      report.errors.push(`Item #${i + 1}: ${validation.errors.join(', ')}`);
      report.skippedCount++;
      continue;
    }

    const prod = validation.sanitized as unknown as Product;

    // Duplicate check
    const existing = existingMap.get(prod.id.toLowerCase());
    if (existing) {
      report.warnings.push(`Model "${prod.brand} ${prod.model}" exists in catalogue and will be updated.`);
      report.updatedCount++;
    } else {
      report.addedCount++;
    }

    report.validProducts.push(prod);
  }

  return report;
}

export async function applyBulkImport(products: Product[]): Promise<number> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_PRODUCTS, 'readwrite');
    const store = transaction.objectStore(STORE_PRODUCTS);

    for (const prod of products) {
      store.put({ ...prod, updatedAt: Date.now() });
    }

    transaction.oncomplete = () => resolve(products.length);
    transaction.onerror = () => reject(transaction.error);
  });
}

// ---------------- EXPORT & RESET ----------------

export async function exportCatalogueJSON(): Promise<string> {
  const products = await getAllProducts();
  const recipes = await getAllRecipes();

  const payload = {
    schemaVersion: 1,
    appName: 'Smart Appliance Showcase',
    exportedAt: new Date().toISOString(),
    totalProducts: products.length,
    totalRecipes: recipes.length,
    products,
    recipes,
  };

  return JSON.stringify(payload, null, 2);
}

export async function resetDatabaseToDefaults(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PRODUCTS, STORE_RECIPES], 'readwrite');
      const prodStore = transaction.objectStore(STORE_PRODUCTS);
      const recStore = transaction.objectStore(STORE_RECIPES);

      prodStore.clear();
      recStore.clear();

      for (const prod of INITIAL_PRODUCTS) {
        prodStore.put(prod);
      }
      for (const rec of INITIAL_RECIPES) {
        recStore.put(rec);
      }

      transaction.oncomplete = () => {
        localStorage.removeItem('smart_appliance_products');
        localStorage.removeItem('smart_appliance_recipes');
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    localStorage.setItem('smart_appliance_products', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('smart_appliance_recipes', JSON.stringify(INITIAL_RECIPES));
  }
}

// ---------------- PERSISTENT STORAGE PERMISSION ----------------

export async function requestStoragePersistence(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    } catch (err) {
      console.warn('Persistent storage request error:', err);
      return false;
    }
  }
  return false;
}

export async function isStoragePersisted(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
    try {
      return await navigator.storage.persisted();
    } catch {
      return false;
    }
  }
  return false;
}
