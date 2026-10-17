import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  RotateCcw,
  ChevronDown,
  Scale,
} from 'lucide-react';
import { Product, ApplianceCategory } from '../../types';
import { VisualApplianceCard } from '../common/VisualApplianceCard';

interface CatalogueViewProps {
  products: Product[];
  theme: 'black' | 'cream';
  selectedCategory: ApplianceCategory | 'All';
  setSelectedCategory: (cat: ApplianceCategory | 'All') => void;
  onSelectProduct: (product: Product) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenAddModal: () => void;
  compareList: Product[];
  onToggleCompare: (product: Product, e: React.MouseEvent) => void;
  onOpenCompareModal: () => void;
  onOpenQR: (product: Product) => void;
}

export const CatalogueView: React.FC<CatalogueViewProps> = ({
  products,
  theme,
  selectedCategory,
  setSelectedCategory,
  onSelectProduct,
  onToggleFavorite,
  onOpenAddModal,
  compareList,
  onToggleCompare,
  onOpenCompareModal,
  onOpenQR,
}) => {
  const isDark = theme === 'black';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [capacityFilter, setCapacityFilter] = useState<'All' | 'compact' | 'medium' | 'large'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'capacity_asc' | 'capacity_desc' | 'power_desc'>('capacity_desc');

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const matchModel = p.model.toLowerCase().includes(query);
          const matchBrand = p.brand.toLowerCase().includes(query);
          const matchCategory = p.category.toLowerCase().includes(query);
          const matchFeatures = p.features.some((f) => f.toLowerCase().includes(query));
          const matchFunctions = p.cookingFunctions.some((cf) => cf.toLowerCase().includes(query));
          if (!matchModel && !matchBrand && !matchCategory && !matchFeatures && !matchFunctions) {
            return false;
          }
        }

        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        if (selectedBrand !== 'All' && p.brand !== selectedBrand) {
          return false;
        }

        if (capacityFilter === 'compact' && p.capacityLitres >= 10) return false;
        if (capacityFilter === 'medium' && (p.capacityLitres < 10 || p.capacityLitres > 30)) return false;
        if (capacityFilter === 'large' && p.capacityLitres <= 30) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.model.localeCompare(b.model);
        if (sortBy === 'capacity_asc') return a.capacityLitres - b.capacityLitres;
        if (sortBy === 'capacity_desc') return b.capacityLitres - a.capacityLitres;
        if (sortBy === 'power_desc') {
          const pA = a.specifications.powerWatts || 0;
          const pB = b.specifications.powerWatts || 0;
          return pB - pA;
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedBrand, capacityFilter, sortBy]);

  const categories: (ApplianceCategory | 'All')[] = [
    'All',
    'OTG',
    'Digital Air Fryer',
    'Manual Air Fryer',
  ];

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setCapacityFilter('All');
    setSortBy('capacity_desc');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Search Bar */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1
              className={`font-display text-2xl md:text-3xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              Appliance Catalogue
            </h1>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              Showing {filteredProducts.length} of {products.length} verified appliances
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className={`flex items-center gap-1.5 px-4 py-2 sharp-pill text-xs font-bold uppercase tracking-wider transition border ${
                isDark
                  ? 'bg-white text-black hover:bg-zinc-200 border-white font-extrabold shadow-lg'
                  : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800 shadow-md'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Model</span>
            </button>
          </div>
        </div>

        {/* Translucent iOS Glass Search Bar */}
        <div className="relative">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-zinc-400' : 'text-stone-500'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search model (e.g. "29 RCAD"), brand, or feature...'
            className={`w-full pl-11 pr-4 py-3 sharp-box text-sm font-medium focus:outline-none transition glass-card ${
              isDark
                ? 'text-white placeholder-zinc-400 focus:border-white/40'
                : 'text-stone-900 placeholder-stone-500 focus:border-amber-800'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold ${
                isDark ? 'text-zinc-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Segmented Category Buttons (iOS Control Bar Style) */}
      <div className="flex items-center gap-1.5 p-1.5 sharp-box overflow-x-auto no-scrollbar glass-card">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold sharp-pill whitespace-nowrap transition-all duration-200 uppercase tracking-wider border ${
                isSelected
                  ? isDark
                    ? 'bg-white text-black font-extrabold border-white shadow-lg'
                    : 'bg-stone-900 text-amber-50 border-stone-800 shadow-md'
                  : isDark
                  ? 'border-transparent text-zinc-300 hover:text-white hover:bg-white/10'
                  : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              {cat === 'All' ? 'All Appliances' : cat}
            </button>
          );
        })}
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <div className="relative inline-block">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className={`appearance-none sharp-pill border px-3.5 py-2 pr-8 focus:outline-none text-xs font-semibold backdrop-blur-xl ${
              isDark
                ? 'bg-black/60 border-white/15 text-zinc-100'
                : 'bg-white/85 border-stone-300 text-stone-800'
            }`}
          >
            <option value="All">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-zinc-400' : 'text-stone-500'
            }`}
          />
        </div>

        <div className="relative inline-block">
          <select
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value as any)}
            className={`appearance-none sharp-pill border px-3.5 py-2 pr-8 focus:outline-none text-xs font-semibold backdrop-blur-xl ${
              isDark
                ? 'bg-black/60 border-white/15 text-zinc-100'
                : 'bg-white/85 border-stone-300 text-stone-800'
            }`}
          >
            <option value="All">All Capacities</option>
            <option value="compact">Compact (&lt; 10L)</option>
            <option value="medium">Family (10L - 30L)</option>
            <option value="large">Large (&gt; 30L)</option>
          </select>
          <ChevronDown
            className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-zinc-400' : 'text-stone-500'
            }`}
          />
        </div>

        <div className="relative inline-block">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`appearance-none sharp-pill border px-3.5 py-2 pr-8 focus:outline-none text-xs font-semibold backdrop-blur-xl ${
              isDark
                ? 'bg-black/60 border-white/15 text-zinc-100'
                : 'bg-white/85 border-stone-300 text-stone-800'
            }`}
          >
            <option value="capacity_desc">Capacity: High to Low</option>
            <option value="capacity_asc">Capacity: Low to High</option>
            <option value="power_desc">Power: Highest (Watts)</option>
            <option value="name">Model Name</option>
          </select>
          <ChevronDown
            className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-zinc-400' : 'text-stone-500'
            }`}
          />
        </div>

        {(searchQuery || selectedCategory !== 'All' || selectedBrand !== 'All' || capacityFilter !== 'All') && (
          <button
            onClick={resetFilters}
            className={`flex items-center gap-1 px-3 py-2 sharp-pill border transition text-xs font-semibold ${
              isDark
                ? 'bg-white/10 border-white/15 text-zinc-200 hover:text-white'
                : 'bg-amber-100 border-amber-900/15 text-stone-800 hover:text-stone-950'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Floating Comparison Tray */}
      {compareList.length > 0 && (
        <div
          className={`sticky top-20 z-30 p-3.5 sharp-box border shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-4 animate-fadeIn ${
            isDark
              ? 'bg-black/80 border-white/25 text-white'
              : 'bg-stone-900 text-amber-50 border-stone-800'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <Scale className="w-4 h-4 shrink-0" />
            <span>
              <strong>{compareList.length}</strong>{' '}
              {compareList.length === 1 ? 'appliance' : 'appliances'} selected for comparison
            </span>
          </div>

          <button
            onClick={onOpenCompareModal}
            className={`px-4 py-1.5 sharp-pill text-xs font-bold uppercase tracking-wider transition border ${
              isDark
                ? 'bg-white hover:bg-zinc-200 text-black border-white shadow-md'
                : 'bg-amber-400 hover:bg-amber-300 text-stone-900 border-amber-300'
            }`}
          >
            Compare Now
          </button>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const isCompareSelected = compareList.some((p) => p.id === product.id);
            return (
              <VisualApplianceCard
                key={product.id}
                product={product}
                theme={theme}
                onSelect={onSelectProduct}
                onToggleFavorite={onToggleFavorite}
                isCompareSelected={isCompareSelected}
                onToggleCompare={onToggleCompare}
                onOpenQR={(p, e) => {
                  e.stopPropagation();
                  onOpenQR(p);
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center sharp-box p-8 glass-card">
          <h3
            className={`font-display text-base font-bold ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}
          >
            No matching appliances found
          </h3>
          <p
            className={`mt-1 text-xs max-w-sm mx-auto ${
              isDark ? 'text-zinc-400' : 'text-stone-600'
            }`}
          >
            Try adjusting your search query, clearing filters, or adding a new appliance model to your catalogue.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={resetFilters}
              className={`px-4 py-2 sharp-pill text-xs font-semibold transition border ${
                isDark
                  ? 'border-white/20 text-white hover:bg-white/10'
                  : 'border-stone-300 text-stone-800 hover:bg-stone-200/60'
              }`}
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenAddModal}
              className={`px-4 py-2 sharp-pill text-xs font-bold transition border ${
                isDark
                  ? 'bg-white text-black border-white'
                  : 'bg-stone-900 text-amber-50 border-stone-800'
              }`}
            >
              Add New Model
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
