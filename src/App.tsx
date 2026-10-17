import React, { useState, useEffect } from 'react';
import { Product, Recipe, ActiveTab, ApplianceCategory } from './types';
import {
  initStorage,
  getAllProducts,
  getAllRecipes,
  saveProduct,
  deleteProduct,
  saveRecipe,
  deleteRecipe,
  toggleFavorite,
} from './services/storage';
import { decodeProductPayload } from './utils/share';

// Layout & Components
import { GlassHeader } from './components/layout/GlassHeader';
import { FloatingDock } from './components/layout/FloatingDock';

// Views
import { HomeView } from './components/views/HomeView';
import { CatalogueView } from './components/views/CatalogueView';
import { SpacePlannerView } from './components/views/SpacePlannerView';
import { RecipeGalleryView } from './components/views/RecipeGalleryView';
import { SettingsView } from './components/views/SettingsView';
import { PresentationModeView } from './components/views/PresentationModeView';
import { PublicProductSheetView } from './components/views/PublicProductSheetView';

// Modals
import { ProductDetailModal } from './components/modals/ProductDetailModal';
import { ProductEditModal } from './components/modals/ProductEditModal';
import { BulkImportModal } from './components/modals/BulkImportModal';
import { CompareModal } from './components/modals/CompareModal';
import { RecipeDetailModal } from './components/modals/RecipeDetailModal';
import { ProductQRModal } from './components/modals/ProductQRModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Modern luxury theme state: 'black' (obsidian glassy) or 'cream' (champagne luxury)
  const [theme, setTheme] = useState<'black' | 'cream'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smart_appliance_theme');
      if (saved === 'black' || saved === 'cream') return saved;
    }
    return 'black';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'black' ? 'cream' : 'black';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_appliance_theme', nextTheme);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'cream') {
        document.body.classList.remove('theme-black');
        document.body.classList.add('theme-cream');
      } else {
        document.body.classList.remove('theme-cream');
        document.body.classList.add('theme-black');
      }
    }
  }, [theme]);

  // Public sheet customer mode (e.g. from QR scan)
  const [publicSheetProduct, setPublicSheetProduct] = useState<Product | null>(null);

  // QR Modal State
  const [qrProduct, setQrProduct] = useState<Product | null>(null);

  // Filter state for catalogue
  const [selectedCategory, setSelectedCategory] = useState<ApplianceCategory | 'All'>('All');

  // Presentation Mode state
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationProductId, setPresentationProductId] = useState<string | undefined>();

  // Modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);

  // Space planner selected product
  const [spacePlannerAppliance, setSpacePlannerAppliance] = useState<Product | undefined>();

  // Comparison selection
  const [compareList, setCompareList] = useState<Product[]>([]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load from IndexedDB
  const refreshCatalogueData = async () => {
    try {
      const prods = await getAllProducts();
      const recs = await getAllRecipes();
      setProducts(prods);
      setRecipes(recs);
    } catch (err) {
      console.warn('Error fetching catalogue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function start() {
      await initStorage();
      await refreshCatalogueData();
    }
    start();
  }, []);

  // Inspect URL parameters for QR scan public sheet opening
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('product');
      const payload = params.get('p');
      if (payload) {
        const decoded = decodeProductPayload(payload);
        if (decoded && decoded.id) {
          const fullProduct: Product = {
            id: decoded.id,
            brand: decoded.brand || 'Appliance',
            model: decoded.model || 'Model',
            category: (decoded.category as ApplianceCategory) || 'OTG',
            capacityLitres: decoded.capacityLitres || 25,
            dimensions: {
              widthCm: decoded.dimensions?.widthCm ?? null,
              heightCm: decoded.dimensions?.heightCm ?? null,
              depthCm: decoded.dimensions?.depthCm ?? null,
              ventilationClearanceCm: decoded.dimensions?.ventilationClearanceCm ?? 5,
            },
            specifications: {
              powerWatts: decoded.specifications?.powerWatts ?? null,
              temperatureRangeC: decoded.specifications?.temperatureRangeC ?? null,
              timerMinutes: decoded.specifications?.timerMinutes ?? null,
              controlType: decoded.specifications?.controlType ?? 'Digital',
              sellingPrice: decoded.specifications?.sellingPrice ?? null,
              mrpPrice: decoded.specifications?.mrpPrice ?? null,
            },
            features: decoded.features || [],
            cookingFunctions: [],
            includedAccessories: decoded.includedAccessories || [],
            images: [],
            dataStatus: 'verified',
            description: decoded.description,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setPublicSheetProduct(fullProduct);
          return;
        }
      }
      if (prodId && products.length > 0) {
        const found = products.find((p) => p.id === prodId);
        if (found) {
          setPublicSheetProduct(found);
        }
      }
    }
  }, [products]);

  // Favorite toggle
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = await toggleFavorite(id);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: isFav } : p))
    );
    if (detailProduct?.id === id) {
      setDetailProduct((prev) => (prev ? { ...prev, isFavorite: isFav } : null));
    }
    showToast(isFav ? 'Added to favorites' : 'Removed from favorites');
  };

  // Compare toggle
  const handleToggleCompare = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        if (prev.length >= 3) {
          showToast('Comparison limited to 3 appliances');
          return prev;
        }
        showToast(`Added ${product.model} to comparison`);
        return [...prev, product];
      }
    });
  };

  // Save edited or created product
  const handleSaveProduct = async (productToSave: Product) => {
    await saveProduct(productToSave);
    await refreshCatalogueData();
    setIsEditModalOpen(false);
    showToast(`Saved ${productToSave.brand} ${productToSave.model}`);
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    await refreshCatalogueData();
    setDetailProduct(null);
    setCompareList((prev) => prev.filter((p) => p.id !== id));
    showToast('Appliance deleted from catalogue');
  };

  // Enter presentation mode for specific appliance
  const handleEnterPresentation = (product?: Product) => {
    if (product) {
      setPresentationProductId(product.id);
    } else if (products.length > 0) {
      setPresentationProductId(products[0].id);
    }
    setIsPresentationMode(true);
    setDetailProduct(null);
  };

  // Jump to Space Planner with selected appliance
  const handleTestInSpacePlanner = (product: Product) => {
    setSpacePlannerAppliance(product);
    setDetailProduct(null);
    setActiveTab('space');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 sharp-box bg-gradient-to-tr from-zinc-800 to-black border border-white/20 flex items-center justify-center shadow-2xl shadow-black animate-pulse mb-4">
          <span className="text-xl">✨</span>
        </div>
        <div className="text-sm font-bold tracking-tight font-display">Initializing Smart Appliance Showcase</div>
        <div className="text-xs text-zinc-400 mt-1 font-mono">Loading verified 3D models & permanent storage...</div>
      </div>
    );
  }

  // If customer is viewing public product sheet (via QR code scan or preview)
  if (publicSheetProduct) {
    return (
      <PublicProductSheetView
        product={publicSheetProduct}
        recipes={recipes}
        theme={theme}
        onBackToApp={() => {
          setPublicSheetProduct(null);
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('product');
            url.searchParams.delete('p');
            window.history.pushState({}, '', url.toString());
          }
        }}
        onOpenQR={() => setQrProduct(publicSheetProduct)}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col selection:bg-white selection:text-black relative overflow-x-hidden ${
        theme === 'black'
          ? 'theme-black bg-[#020203] text-white'
          : 'theme-cream bg-[#f6f2e9] text-stone-900'
      }`}
    >
      {/* Animated Ambient Light Stage in Background (Shines through translucent iOS glass cards) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {theme === 'black' ? (
          <>
            {/* Sweeping diagonal pearl & champagne light beams in the background */}
            <div
              className="absolute -top-1/4 left-1/4 w-[60rem] h-[18rem] rounded-full blur-[110px] ambient-beam"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,244,214,0.22) 50%, rgba(255,255,255,0.04) 100%)',
              }}
            />
            <div
              className="absolute top-1/2 -left-20 w-[55rem] h-[15rem] rounded-full blur-[120px] ambient-orb-3"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.16) 50%, rgba(245,208,140,0.14) 100%)',
              }}
            />
            {/* Floating luminous background orbs */}
            <div className="absolute top-[6%] left-[12%] w-[28rem] h-[28rem] rounded-full bg-white/[0.13] blur-[120px] ambient-orb-1" />
            <div className="absolute top-[38%] right-[8%] w-[34rem] h-[34rem] rounded-full bg-amber-200/[0.14] blur-[135px] ambient-orb-2" />
            <div className="absolute bottom-[8%] left-[25%] w-[32rem] h-[32rem] rounded-full bg-zinc-200/[0.12] blur-[130px] ambient-orb-3" />
          </>
        ) : (
          <>
            <div
              className="absolute -top-1/4 left-1/4 w-[60rem] h-[18rem] rounded-full blur-[100px] ambient-beam"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(245,190,105,0.38) 50%, rgba(255,255,255,0.5) 100%)',
              }}
            />
            <div className="absolute top-[8%] left-[10%] w-[30rem] h-[30rem] rounded-full bg-amber-300/35 blur-[115px] ambient-orb-1" />
            <div className="absolute top-[40%] right-[10%] w-[34rem] h-[34rem] rounded-full bg-orange-200/35 blur-[130px] ambient-orb-2" />
            <div className="absolute bottom-[10%] left-[25%] w-[30rem] h-[30rem] rounded-full bg-amber-200/40 blur-[120px] ambient-orb-3" />
          </>
        )}
      </div>

      {/* iOS Liquid Glass Top Navigation Bar */}
      <div className="relative z-30">
        <GlassHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => {
            setEditProduct(null);
            setIsEditModalOpen(true);
          }}
          onEnterPresentationMode={() => handleEnterPresentation()}
          isPresentationMode={isPresentationMode}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>

      {/* Main View Area Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pt-6 relative z-10">
        {activeTab === 'home' && (
          <HomeView
            products={products}
            recipes={recipes}
            theme={theme}
            setActiveTab={setActiveTab}
            onSelectProduct={(p) => setDetailProduct(p)}
            onToggleFavorite={handleToggleFavorite}
            onOpenAddModal={() => {
              setEditProduct(null);
              setIsEditModalOpen(true);
            }}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenCompareModal={() => setIsCompareModalOpen(true)}
            onEnterPresentationMode={() => handleEnterPresentation()}
            onFilterCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveTab('catalogue');
            }}
            onOpenQR={(p) => setQrProduct(p)}
          />
        )}

        {activeTab === 'catalogue' && (
          <CatalogueView
            products={products}
            theme={theme}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectProduct={(p) => setDetailProduct(p)}
            onToggleFavorite={handleToggleFavorite}
            onOpenAddModal={() => {
              setEditProduct(null);
              setIsEditModalOpen(true);
            }}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onOpenCompareModal={() => setIsCompareModalOpen(true)}
            onOpenQR={(p) => setQrProduct(p)}
          />
        )}

        {activeTab === 'space' && (
          <SpacePlannerView
            products={products}
            selectedProduct={spacePlannerAppliance}
            theme={theme}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipeGalleryView
            recipes={recipes}
            products={products}
            theme={theme}
            onSelectRecipe={(r) => setDetailRecipe(r)}
            onOpenAddRecipeModal={() => {
              showToast('Click "+ Add Food Image" to tag your creations!');
            }}
            onSaveFoodItem={async (item) => {
              await saveRecipe(item);
              await refreshCatalogueData();
              showToast(`Added ${item.title} to food gallery`);
            }}
            onDeleteFoodItem={async (id) => {
              await deleteRecipe(id);
              await refreshCatalogueData();
              showToast('Removed dish from gallery');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            products={products}
            recipes={recipes}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onRefreshData={refreshCatalogueData}
          />
        )}
      </main>

      {/* iOS Floating Bottom Dock */}
      <FloatingDock
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        productCount={products.length}
        theme={theme}
      />

      {/* Customer Presentation Mode (Keynote Fullscreen Overlay) */}
      {isPresentationMode && (
        <PresentationModeView
          products={products}
          recipes={recipes}
          initialProductId={presentationProductId}
          theme={theme}
          onExit={() => setIsPresentationMode(false)}
          onOpenCompare={(p1, p2) => {
            const list = [p1];
            if (p2) list.push(p2);
            setCompareList(list);
            setIsCompareModalOpen(true);
          }}
          onOpenQR={(p) => setQrProduct(p)}
        />
      )}

      {/* MODAL 1: Product Details Sheet */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          recipes={recipes}
          theme={theme}
          onClose={() => setDetailProduct(null)}
          onEdit={(p) => {
            setDetailProduct(null);
            setEditProduct(p);
            setIsEditModalOpen(true);
          }}
          onDelete={handleDeleteProduct}
          onToggleFavorite={handleToggleFavorite}
          onPresent={handleEnterPresentation}
          onTestInSpacePlanner={handleTestInSpacePlanner}
          onOpenQR={(p) => setQrProduct(p)}
        />
      )}

      {/* MODAL 2: Product Edit / Add Sheet */}
      {isEditModalOpen && (
        <ProductEditModal
          initialProduct={editProduct}
          existingProducts={products}
          theme={theme}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}

      {/* MODAL 3: Bulk JSON Importer */}
      {isImportModalOpen && (
        <BulkImportModal
          theme={theme}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={refreshCatalogueData}
        />
      )}

      {/* MODAL 4: Side-by-Side Comparison Matrix */}
      {isCompareModalOpen && (
        <CompareModal
          productsToCompare={
            compareList.length > 0 ? compareList : products.slice(0, 2)
          }
          allProducts={products}
          theme={theme}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveFromCompare={(id) => {
            setCompareList((prev) => prev.filter((p) => p.id !== id));
          }}
          onAddAnotherToCompare={(p) => {
            setCompareList((prev) => [...prev, p]);
          }}
          onSelectProduct={(p) => {
            setIsCompareModalOpen(false);
            setDetailProduct(p);
          }}
        />
      )}

      {/* MODAL 5: Food Creation Lightbox */}
      {detailRecipe && (
        <RecipeDetailModal
          recipe={detailRecipe}
          allProducts={products}
          theme={theme}
          onClose={() => setDetailRecipe(null)}
          onSelectProduct={(p) => {
            setDetailRecipe(null);
            setDetailProduct(p);
          }}
        />
      )}

      {/* MODAL 6: QR Code Customer Sharing Modal */}
      {qrProduct && (
        <ProductQRModal
          product={qrProduct}
          theme={theme}
          onClose={() => setQrProduct(null)}
          onOpenPublicSheet={(p) => {
            setQrProduct(null);
            setDetailProduct(null);
            setPublicSheetProduct(p);
          }}
        />
      )}

      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 sharp-box bg-black/95 text-white text-xs font-semibold border border-white/20 shadow-2xl backdrop-blur-xl animate-fadeIn pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
