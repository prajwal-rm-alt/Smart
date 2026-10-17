import React from 'react';
import {
  Sparkles,
  Plus,
  Upload,
  Ruler,
  Scale,
  Flame,
  Wind,
  Layers,
  ArrowRight,
  Presentation,
} from 'lucide-react';
import { Product, Recipe, ActiveTab, ApplianceCategory } from '../../types';
import { VisualApplianceCard } from '../common/VisualApplianceCard';

interface HomeViewProps {
  products: Product[];
  recipes: Recipe[];
  theme: 'black' | 'cream';
  setActiveTab: (tab: ActiveTab) => void;
  onSelectProduct: (product: Product) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenCompareModal: () => void;
  onEnterPresentationMode: () => void;
  onFilterCategory: (category: ApplianceCategory | 'All') => void;
  onOpenQR: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  theme,
  setActiveTab,
  onSelectProduct,
  onToggleFavorite,
  onOpenAddModal,
  onOpenImportModal,
  onOpenCompareModal,
  onEnterPresentationMode,
  onFilterCategory,
  onOpenQR,
}) => {
  const isDark = theme === 'black';

  const otgCount = products.filter((p) => p.category === 'OTG').length;
  const digitalAirFryerCount = products.filter((p) => p.category === 'Digital Air Fryer').length;
  const manualAirFryerCount = products.filter((p) => p.category === 'Manual Air Fryer').length;

  const featuredProducts = products.filter((p) => p.isFavorite).slice(0, 4);
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Luxury Editorial Hero Banner in iOS Translucent Liquid Glass */}
      <section className="relative overflow-hidden sharp-box p-6 md:p-10 transition-all duration-300 glass-card">
        <div className="relative z-10 max-w-2xl">
          <div
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-2 font-mono ${
              isDark ? 'text-amber-200/90' : 'text-amber-900'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300' : 'text-amber-800'}`} />
            <span>{getGreeting()}, Prajwal</span>
          </div>

          <h1
            className={`font-display text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}
          >
            Smart Appliance Showcase
          </h1>

          <p
            className={`mt-3 text-xs md:text-sm leading-relaxed max-w-xl ${
              isDark ? 'text-zinc-300' : 'text-stone-700'
            }`}
          >
            Curated presentation suite for Oven Toaster Grills and Air Fryers. Verified manufacturer
            measurements, interactive 3D scale simulator, and instant customer QR specifications.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onEnterPresentationMode}
              className={`flex items-center gap-2 px-5 py-3 sharp-pill text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border ${
                isDark
                  ? 'bg-white text-black hover:bg-zinc-200 border-white font-extrabold shadow-xl'
                  : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800 shadow-lg'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Present to Customer</span>
            </button>

            <button
              onClick={() => {
                onFilterCategory('All');
                setActiveTab('catalogue');
              }}
              className={`flex items-center gap-1.5 px-4 py-3 sharp-pill text-xs font-bold uppercase tracking-wider border transition ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md'
                  : 'bg-white/85 hover:bg-white text-stone-900 border-stone-300 shadow-sm'
              }`}
            >
              <span>Explore Catalogue ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Categories Grid with iPhone Translucent Glass Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`font-display text-lg font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}
          >
            Appliance Categories
          </h2>
          <button
            onClick={() => {
              onFilterCategory('All');
              setActiveTab('catalogue');
            }}
            className={`text-xs font-bold uppercase tracking-wider transition ${
              isDark ? 'text-zinc-300 hover:text-white' : 'text-amber-900 hover:text-stone-950'
            }`}
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* OTG Category Card */}
          <div
            onClick={() => {
              onFilterCategory('OTG');
              setActiveTab('catalogue');
            }}
            className="group cursor-pointer sharp-box p-5 transition-all duration-300 active:scale-[0.99] glass-card glass-card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 sharp-pill border flex items-center justify-center ${
                  isDark
                    ? 'bg-white/10 border-white/20 text-amber-300'
                    : 'bg-amber-100 border-amber-900/15 text-amber-900'
                }`}
              >
                <Flame className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-bold font-mono tabular-nums uppercase ${
                  isDark ? 'text-zinc-300' : 'text-stone-600'
                }`}
              >
                {otgCount} models
              </span>
            </div>
            <h3
              className={`font-display text-base font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              Oven Toaster Grills (OTGs)
            </h3>
            <p
              className={`mt-1 text-xs leading-relaxed ${
                isDark ? 'text-zinc-300' : 'text-stone-700'
              }`}
            >
              Bake pizzas, cakes, artisan breads, and 360° motorized rotisserie roasts.
            </p>
          </div>

          {/* Digital Air Fryer Category Card */}
          <div
            onClick={() => {
              onFilterCategory('Digital Air Fryer');
              setActiveTab('catalogue');
            }}
            className="group cursor-pointer sharp-box p-5 transition-all duration-300 active:scale-[0.99] glass-card glass-card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 sharp-pill border flex items-center justify-center ${
                  isDark
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-stone-200/80 border-stone-300 text-stone-900'
                }`}
              >
                <Wind className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-bold font-mono tabular-nums uppercase ${
                  isDark ? 'text-zinc-300' : 'text-stone-600'
                }`}
              >
                {digitalAirFryerCount} models
              </span>
            </div>
            <h3
              className={`font-display text-base font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              Digital Air Fryers
            </h3>
            <p
              className={`mt-1 text-xs leading-relaxed ${
                isDark ? 'text-zinc-300' : 'text-stone-700'
              }`}
            >
              Touchscreen rapid vortex airflow cooking with 90% less oil and multi-presets.
            </p>
          </div>

          {/* Manual Air Fryer Category Card */}
          <div
            onClick={() => {
              onFilterCategory('Manual Air Fryer');
              setActiveTab('catalogue');
            }}
            className="group cursor-pointer sharp-box p-5 transition-all duration-300 active:scale-[0.99] glass-card glass-card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 sharp-pill border flex items-center justify-center ${
                  isDark
                    ? 'bg-white/10 border-white/20 text-zinc-200'
                    : 'bg-stone-200/80 border-stone-300 text-stone-900'
                }`}
              >
                <Layers className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-bold font-mono tabular-nums uppercase ${
                  isDark ? 'text-zinc-300' : 'text-stone-600'
                }`}
              >
                {manualAirFryerCount} models
              </span>
            </div>
            <h3
              className={`font-display text-base font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              Manual Air Fryers
            </h3>
            <p
              className={`mt-1 text-xs leading-relaxed ${
                isDark ? 'text-zinc-300' : 'text-stone-700'
              }`}
            >
              Tactile rotary analog dials with zero electronic failure rate for durable frying.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions Strip */}
      <section className="sharp-box p-4.5 glass-card">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider block mb-3 font-mono ${
            isDark ? 'text-zinc-400' : 'text-stone-600'
          }`}
        >
          Instant Operations
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={onOpenAddModal}
            className={`flex items-center gap-2.5 p-3 sharp-pill border text-left transition active:scale-95 ${
              isDark
                ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/15'
                : 'bg-white/80 hover:bg-white border-stone-300/80 shadow-sm'
            }`}
          >
            <div
              className={`w-8 h-8 sharp-pill border flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-stone-100 border-stone-300 text-stone-900'
              }`}
            >
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                Add Model
              </div>
              <div className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                Manual entry
              </div>
            </div>
          </button>

          <button
            onClick={onOpenImportModal}
            className={`flex items-center gap-2.5 p-3 sharp-pill border text-left transition active:scale-95 ${
              isDark
                ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/15'
                : 'bg-white/80 hover:bg-white border-stone-300/80 shadow-sm'
            }`}
          >
            <div
              className={`w-8 h-8 sharp-pill border flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-stone-100 border-stone-300 text-stone-900'
              }`}
            >
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                Import JSON
              </div>
              <div className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                Bulk AI parser
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('space')}
            className={`flex items-center gap-2.5 p-3 sharp-pill border text-left transition active:scale-95 ${
              isDark
                ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/15'
                : 'bg-white/80 hover:bg-white border-stone-300/80 shadow-sm'
            }`}
          >
            <div
              className={`w-8 h-8 sharp-pill border flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-white/10 border-white/20 text-amber-300'
                  : 'bg-amber-100 border-amber-900/15 text-amber-900'
              }`}
            >
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                3D Space Planner
              </div>
              <div className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                1:1 Measurements
              </div>
            </div>
          </button>

          <button
            onClick={onOpenCompareModal}
            className={`flex items-center gap-2.5 p-3 sharp-pill border text-left transition active:scale-95 ${
              isDark
                ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/15'
                : 'bg-white/80 hover:bg-white border-stone-300/80 shadow-sm'
            }`}
          >
            <div
              className={`w-8 h-8 sharp-pill border flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-stone-100 border-stone-300 text-stone-900'
              }`}
            >
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                Compare Matrix
              </div>
              <div className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                Side-by-side
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Featured Showcase Models Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className={`font-display text-lg font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              Featured Showcase Models
            </h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              High-demand OTGs and Air Fryers recommended for customer demonstrations
            </p>
          </div>
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`text-xs font-bold uppercase tracking-wider transition ${
              isDark ? 'text-zinc-300 hover:text-white' : 'text-amber-900 hover:text-stone-950'
            }`}
          >
            See All ({products.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayFeatured.map((product) => (
            <VisualApplianceCard
              key={product.id}
              product={product}
              theme={theme}
              onSelect={onSelectProduct}
              onToggleFavorite={onToggleFavorite}
              onOpenQR={(p, e) => {
                e.stopPropagation();
                onOpenQR(p);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
