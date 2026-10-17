import React, { useState, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  Package,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Scale,
  QrCode,
  Box,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, Recipe } from '../../types';
import { ApplianceGraphic } from '../common/ApplianceGraphic';
import { Appliance3DViewer } from '../common/Appliance3DViewer';
import { SalesBrandLogo } from '../common/SalesBrandLogo';

interface PresentationModeViewProps {
  products: Product[];
  recipes: Recipe[];
  initialProductId?: string;
  theme: 'black' | 'cream';
  onExit: () => void;
  onOpenCompare: (p1: Product, p2?: Product) => void;
  onOpenQR: (product: Product) => void;
}

export const PresentationModeView: React.FC<PresentationModeViewProps> = ({
  products,
  recipes,
  initialProductId,
  theme,
  onExit,
  onOpenCompare,
  onOpenQR,
}) => {
  const isDark = theme === 'black';

  const [viewMode, setViewMode] = useState<'graphic' | '3d'>('graphic');
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!initialProductId) return 0;
    const idx = products.findIndex((p) => p.id === initialProductId);
    return idx >= 0 ? idx : 0;
  });

  const product = products[currentIndex] || products[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  // Find compatible food gallery images for this model
  const matchingRecipes = useMemo(() => {
    if (!product) return [];
    return recipes.filter(
      (r) =>
        r.taggedModelIds?.includes(product.id) ||
        r.compatibleModelIds?.includes(product.id) ||
        r.taggedCategory === 'Both' ||
        (product.category === 'OTG' && r.taggedCategory === 'OTG') ||
        (product.category !== 'OTG' && r.taggedCategory === 'Air Fryer')
    ).slice(0, 8);
  }, [product, recipes]);

  if (!product) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto animate-fadeIn pb-16 transition-colors duration-300 ${
        isDark ? 'bg-[#030305] text-white' : 'bg-[#f6f2e9] text-stone-900'
      }`}
    >
      {/* Top Floating Keynote Navigation */}
      <header
        className={`sticky top-0 z-40 glass-header px-4 md:px-8 py-3.5 flex items-center justify-between ${
          isDark
            ? 'border-white/10'
            : 'border-stone-900/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <SalesBrandLogo size="sm" />
          <span
            className={`text-xs font-bold uppercase tracking-widest px-3 py-1 sharp-box border ${
              isDark
                ? 'text-amber-300 bg-amber-500/15 border-amber-400/30'
                : 'text-amber-900 bg-amber-500/15 border-amber-900/20'
            }`}
          >
            Customer Presentation
          </span>
          <span className={`opacity-40 hidden sm:inline ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>·</span>
          <span className={`text-xs font-medium hidden sm:inline ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
            Model {currentIndex + 1} of {products.length}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Prominent Share via QR Button */}
          <button
            onClick={() => onOpenQR(product)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 sharp-box text-xs font-bold transition shadow-sm border ${
              isDark
                ? 'bg-white text-black border-white hover:bg-zinc-200'
                : 'bg-stone-900 text-amber-50 border-stone-900 hover:bg-stone-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Customer QR Code</span>
          </button>

          <button
            onClick={() => onOpenCompare(product)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 sharp-box text-xs font-semibold border transition ${
              isDark
                ? 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border-white/10'
                : 'bg-stone-900/[0.04] hover:bg-stone-900/[0.08] text-stone-800 border-stone-900/15'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
          </button>

          <button
            onClick={onExit}
            className={`flex items-center gap-1 px-3 py-1.5 sharp-box text-xs font-semibold border transition ${
              isDark
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                : 'bg-rose-500/10 text-rose-800 border-rose-500/25 hover:bg-rose-500/20'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Main Showcase Hero Container */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-6 space-y-8">
        {/* Quick Model Carousel Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {products.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setCurrentIndex(idx)}
              className={`px-4 py-2 sharp-box text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                idx === currentIndex
                  ? isDark
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-stone-900 text-amber-50 border-stone-900 shadow-md'
                  : isDark
                  ? 'bg-white/[0.04] text-zinc-400 hover:text-white border-white/10'
                  : 'bg-white/80 text-stone-600 hover:text-stone-950 border-stone-900/10'
              }`}
            >
              {p.brand} {p.model}
            </button>
          ))}
        </div>

        {/* 2-Column Split: Visual Graphic vs Selling Highlights */}
        <div
          className={`sharp-card glass-card p-6 md:p-10 border shadow-2xl ${
            isDark
              ? 'border-white/15'
              : 'border-stone-900/15'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Extra Large Graphic or 3D Model with Non-Overlapping Switcher */}
            <div className="lg:col-span-6 space-y-3">
              {/* Top Bar: View Switcher + Model Prev/Next */}
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`flex items-center p-1 sharp-box border ${
                    isDark
                      ? 'bg-white/[0.04] border-white/15'
                      : 'bg-stone-900/[0.04] border-stone-900/15'
                  }`}
                >
                  <button
                    onClick={() => setViewMode('graphic')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold sharp-box transition ${
                      viewMode === 'graphic'
                        ? isDark
                          ? 'bg-white text-black shadow-md'
                          : 'bg-stone-900 text-amber-50 shadow-md'
                        : isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Showcase</span>
                  </button>
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold sharp-box transition ${
                      viewMode === '3d'
                        ? isDark
                          ? 'bg-amber-400 text-black shadow-md'
                          : 'bg-stone-900 text-amber-50 shadow-md'
                        : isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>3D Interactive Model</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    className={`p-2 sharp-box border transition ${
                      isDark
                        ? 'bg-white/[0.05] text-white border-white/15 hover:bg-white/15'
                        : 'bg-white text-stone-900 border-stone-900/15 hover:bg-stone-100'
                    }`}
                    aria-label="Previous Model"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className={`p-2 sharp-box border transition ${
                      isDark
                        ? 'bg-white/[0.05] text-white border-white/15 hover:bg-white/15'
                        : 'bg-white text-stone-900 border-stone-900/15 hover:bg-stone-100'
                    }`}
                    aria-label="Next Model"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {viewMode === 'graphic' ? (
                <ApplianceGraphic
                  category={product.category as any}
                  model={product.model}
                  brand={product.brand}
                  imageUrl={product.images?.[0]}
                  capacityLitres={product.capacityLitres}
                  powerWatts={product.specifications.powerWatts}
                  className="w-full h-80 sm:h-96 sharp-box shadow-xl"
                />
              ) : (
                <div className="w-full h-[480px] sharp-box overflow-hidden">
                  <Appliance3DViewer
                    product={product}
                    theme={theme}
                    className="w-full h-full"
                    showControls={true}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Hero Specs */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-widest font-mono ${
                      isDark ? 'text-amber-400' : 'text-amber-800'
                    }`}
                  >
                    {product.brand}
                  </span>
                  <span className="opacity-40">·</span>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                    {product.category}
                  </span>
                </div>

                <h2 className={`font-display text-3xl md:text-5xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {product.model}
                </h2>

                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    isDark ? 'text-zinc-300' : 'text-stone-700'
                  }`}
                >
                  {product.description ||
                    `Engineered for premium performance with ${product.capacityLitres}L capacity and rapid heat control.`}
                </p>
              </div>

              {/* Key Quick Metric Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`p-3.5 sharp-box border ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10'
                      : 'bg-white/80 border-stone-900/10'
                  }`}
                >
                  <span className={`text-[10px] block mb-0.5 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                    Capacity
                  </span>
                  <span className={`text-lg font-display font-extrabold font-mono tabular-nums ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    {product.capacityLitres} Litres
                  </span>
                </div>

                <div
                  className={`p-3.5 sharp-box border ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10'
                      : 'bg-white/80 border-stone-900/10'
                  }`}
                >
                  <span className={`text-[10px] block mb-0.5 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                    Power Rating
                  </span>
                  <span className={`text-lg font-display font-extrabold font-mono tabular-nums ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                    {product.specifications.powerWatts ? `${product.specifications.powerWatts}W` : 'Optimal'}
                  </span>
                </div>

                <div
                  className={`p-3.5 sharp-box border ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10'
                      : 'bg-white/80 border-stone-900/10'
                  }`}
                >
                  <span className={`text-[10px] block mb-0.5 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                    Counter Width
                  </span>
                  <span className={`text-lg font-display font-extrabold font-mono tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {product.dimensions.widthCm ? `${product.dimensions.widthCm} cm` : 'Compact'}
                  </span>
                </div>
              </div>

              {/* Primary Features Highlight */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2.5">
                  <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                    Key Customer Benefits:
                  </span>
                  <div className="space-y-2">
                    {product.features.slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <div
                          className={`w-4 h-4 sharp-pill flex items-center justify-center shrink-0 mt-0.5 ${
                            isDark
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-emerald-500/15 text-emerald-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className={`leading-snug ${isDark ? 'text-zinc-200' : 'text-stone-800'}`}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instant Customer QR Share CTA Bar */}
              <div
                className={`p-4 sharp-box border flex items-center justify-between gap-4 ${
                  isDark
                    ? 'bg-white/[0.03] border-white/15'
                    : 'bg-stone-900/[0.04] border-stone-900/15'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 sharp-box border flex items-center justify-center ${
                      isDark
                        ? 'bg-white text-black border-white'
                        : 'bg-stone-900 text-amber-50 border-stone-900'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-stone-900'}`}>
                      Share Specs to Customer&rsquo;s Phone
                    </strong>
                    <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                      Customer scans QR code to take specifications home
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenQR(product)}
                  className={`px-3 py-1.5 sharp-box text-xs font-bold uppercase tracking-wider transition ${
                    isDark
                      ? 'bg-white hover:bg-zinc-200 text-black'
                      : 'bg-stone-900 hover:bg-stone-800 text-amber-50'
                  }`}
                >
                  Show QR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* What Comes In The Box */}
        {product.includedAccessories && product.includedAccessories.length > 0 && (
          <section
            className={`sharp-card glass-card p-6 border ${
              isDark
                ? 'border-white/10'
                : 'border-stone-900/10'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3 ${
                isDark ? 'text-amber-400' : 'text-amber-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Included In The Box: Everything Needed To Start Cooking</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {product.includedAccessories.map((acc, idx) => (
                <div
                  key={idx}
                  className={`p-3 sharp-box border flex items-center gap-2 text-xs ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10 text-zinc-200'
                      : 'bg-white/80 border-stone-900/10 text-stone-800'
                  }`}
                >
                  <span className={`w-2 h-2 sharp-pill shrink-0 ${isDark ? 'bg-amber-400' : 'bg-amber-700'}`} />
                  <span className="font-medium">{acc}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pure Food Image Gallery Preview (No Text Details) */}
        {matchingRecipes.length > 0 && (
          <section
            className={`sharp-card glass-card p-6 border ${
              isDark
                ? 'border-white/10'
                : 'border-stone-900/10'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3 ${
                isDark ? 'text-amber-400' : 'text-amber-800'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Food Gallery · {product.model}</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {matchingRecipes.map((rec) => (
                <div
                  key={rec.id}
                  className={`aspect-square sharp-box border flex items-center justify-center overflow-hidden ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10'
                      : 'bg-white/80 border-stone-900/10'
                  }`}
                >
                  {rec.imageUrl || rec.image ? (
                    <img
                      src={rec.imageUrl || rec.image}
                      alt="Food"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl select-none">{rec.emoji || '🍟'}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
