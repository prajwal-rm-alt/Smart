import React, { useState } from 'react';
import {
  CheckCircle2,
  Package,
  UtensilsCrossed,
  ArrowLeft,
  QrCode,
  Box,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, Recipe } from '../../types';
import { ApplianceGraphic } from '../common/ApplianceGraphic';
import { Appliance3DViewer } from '../common/Appliance3DViewer';
import { SalesBrandLogo } from '../common/SalesBrandLogo';
import { calculateFootprint } from '../../utils/calculations';

interface PublicProductSheetViewProps {
  product: Product;
  recipes: Recipe[];
  theme: 'black' | 'cream';
  onBackToApp: () => void;
  onOpenQR: () => void;
}

export const PublicProductSheetView: React.FC<PublicProductSheetViewProps> = ({
  product,
  recipes,
  theme,
  onBackToApp,
  onOpenQR,
}) => {
  const isDark = theme === 'black';
  const [viewMode, setViewMode] = useState<'graphic' | '3d'>('graphic');
  const footprint = calculateFootprint(product.dimensions.widthCm, product.dimensions.depthCm);

  // Matching food images
  const matchingRecipes = recipes.filter(
    (r) =>
      r.taggedModelIds?.includes(product.id) ||
      r.compatibleModelIds?.includes(product.id) ||
      r.taggedCategory === 'Both' ||
      (product.category === 'OTG' && r.taggedCategory === 'OTG') ||
      (product.category !== 'OTG' && r.taggedCategory === 'Air Fryer')
  ).slice(0, 6);

  return (
    <div
      className={`min-h-screen pb-20 ${
        isDark ? 'bg-[#030305] text-white' : 'bg-[#f6f2e9] text-stone-900'
      }`}
    >
      {/* Top Customer Header Bar */}
      <header
        className={`sticky top-0 z-40 glass-header px-4 md:px-8 py-3.5 flex items-center justify-between ${
          isDark
            ? 'border-white/10'
            : 'border-stone-900/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <SalesBrandLogo size="sm" />
          <button
            onClick={onBackToApp}
            className={`flex items-center gap-1.5 px-3 py-1.5 sharp-box text-xs font-semibold border transition ${
              isDark
                ? 'border-white/10 text-zinc-300 hover:text-white bg-white/[0.05]'
                : 'border-stone-900/15 text-stone-700 hover:text-stone-950 bg-stone-900/[0.04]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Full Catalogue</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQR}
            className={`flex items-center gap-1.5 px-3 py-1.5 sharp-box text-xs font-bold border transition ${
              isDark
                ? 'bg-white text-black border-white hover:bg-zinc-200'
                : 'bg-stone-900 text-amber-50 border-stone-900 hover:bg-stone-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Show QR</span>
          </button>
        </div>
      </header>

      {/* Main Public Product Sheet Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-6 space-y-8">
        {/* Brand Kicker & Luxury Headline */}
        <div className="text-center md:text-left space-y-1">
          <div className={`flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
            <span>{product.brand}</span>
            <span>·</span>
            <span className={isDark ? 'text-zinc-400' : 'text-stone-600'}>
              {product.category}
            </span>
          </div>

          <h1 className={`font-display text-3xl md:text-5xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
            {product.model}
          </h1>

          <p
            className={`text-sm max-w-2xl leading-relaxed ${
              isDark ? 'text-zinc-300' : 'text-stone-700'
            }`}
          >
            {product.description ||
              `Official product specification sheet for ${product.brand} ${product.model}. Verified cooking capacities, dimensions, and technical features.`}
          </p>
        </div>

        {/* Visual Showcase Card */}
        <div
          className={`sharp-card glass-card p-6 md:p-8 border shadow-xl ${
            isDark
              ? 'border-white/10'
              : 'border-stone-900/10'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Appliance Graphic or 3D Model with Docked Switcher */}
            <div className="md:col-span-6 space-y-3">
              <div
                className={`inline-flex items-center p-1 sharp-box border ${
                  isDark
                    ? 'bg-white/[0.04] border-white/15'
                    : 'bg-stone-900/[0.04] border-stone-900/15'
                }`}
              >
                <button
                  onClick={() => setViewMode('graphic')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold sharp-box transition ${
                    viewMode === 'graphic'
                      ? isDark
                        ? 'bg-white text-black shadow-md'
                        : 'bg-stone-900 text-amber-50 shadow-md'
                      : isDark
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Showcase</span>
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold sharp-box transition ${
                    viewMode === '3d'
                      ? isDark
                        ? 'bg-amber-400 text-black shadow-md'
                        : 'bg-stone-900 text-amber-50 shadow-md'
                      : isDark
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  <Box className="w-3 h-3" />
                  <span>3D Interactive Model</span>
                </button>
              </div>

              {viewMode === 'graphic' ? (
                <ApplianceGraphic
                  category={product.category as any}
                  model={product.model}
                  brand={product.brand}
                  imageUrl={product.images?.[0]}
                  capacityLitres={product.capacityLitres}
                  powerWatts={product.specifications.powerWatts}
                  className="w-full h-72 md:h-80 sharp-box"
                />
              ) : (
                <div className="w-full h-[460px] sharp-box overflow-hidden">
                  <Appliance3DViewer
                    product={product}
                    theme={theme}
                    className="w-full h-full"
                    showControls={true}
                  />
                </div>
              )}
            </div>

            {/* Right Quick Spec Matrix */}
            <div className="md:col-span-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div
                  className={`p-3.5 sharp-box border ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10'
                      : 'bg-white/80 border-stone-900/10'
                  }`}
                >
                  <span className={`text-[10px] block mb-0.5 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                    Chamber Capacity
                  </span>
                  <span className={`text-xl font-display font-bold font-mono ${isDark ? 'text-white' : 'text-stone-900'}`}>
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
                    Rated Power
                  </span>
                  <span className={`text-xl font-display font-bold font-mono ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                    {product.specifications.powerWatts
                      ? `${product.specifications.powerWatts}W`
                      : 'Optimal'}
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
                    Counter Footprint
                  </span>
                  <span className={`text-base font-bold font-mono ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    {footprint} cm²
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
                    Selling Price
                  </span>
                  <span className={`text-base font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {product.specifications.sellingPrice
                      ? `₹${product.specifications.sellingPrice.toLocaleString()}`
                      : 'Inquire'}
                  </span>
                </div>
              </div>

              {/* Verified Specs Pill */}
              <div
                className={`p-3 sharp-box border text-xs flex items-center gap-2 ${
                  isDark
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-emerald-500/10 border-emerald-600/20 text-emerald-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Manufacturer Certified Specifications · Verified for Home Countertops
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications Table */}
        <div
          className={`sharp-card glass-card p-6 border ${
            isDark
              ? 'border-white/10'
              : 'border-stone-900/10'
          }`}
        >
          <h2 className={`font-display text-lg font-bold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
            Detailed Technical Specifications
          </h2>

          <table className="w-full text-xs text-left">
            <tbody
              className={`divide-y ${
                isDark ? 'divide-white/10' : 'divide-stone-900/10'
              }`}
            >
              <tr>
                <td className={`py-2.5 font-medium ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>Brand & Model</td>
                <td className={`py-2.5 font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {product.brand} {product.model}
                </td>
              </tr>
              <tr>
                <td className={`py-2.5 font-medium ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>Appliance Category</td>
                <td className={`py-2.5 ${isDark ? 'text-zinc-200' : 'text-stone-800'}`}>{product.category}</td>
              </tr>
              <tr>
                <td className={`py-2.5 font-medium ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>Dimensions (W × H × D)</td>
                <td className={`py-2.5 font-mono ${isDark ? 'text-zinc-200' : 'text-stone-800'}`}>
                  {product.dimensions.widthCm && product.dimensions.heightCm && product.dimensions.depthCm
                    ? `${product.dimensions.widthCm} × ${product.dimensions.heightCm} × ${product.dimensions.depthCm} cm`
                    : 'Standard dimensions'}
                </td>
              </tr>
              <tr>
                <td className={`py-2.5 font-medium ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>Temperature Control</td>
                <td className={`py-2.5 font-mono ${isDark ? 'text-zinc-200' : 'text-stone-800'}`}>
                  {product.specifications.temperatureRangeC || 'Variable heat range'}
                </td>
              </tr>
              <tr>
                <td className={`py-2.5 font-medium ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>Timer Range</td>
                <td className={`py-2.5 font-mono ${isDark ? 'text-zinc-200' : 'text-stone-800'}`}>
                  {product.specifications.timerMinutes
                    ? `${product.specifications.timerMinutes} Minutes with auto shut-off`
                    : 'Standard timer'}
                </td>
              </tr>
              <tr>
                <td className={`py-2.5 font-medium ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>Control Interface</td>
                <td className={`py-2.5 ${isDark ? 'text-zinc-200' : 'text-stone-800'}`}>
                  {product.specifications.controlType || 'Digital / Manual'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Included Accessories */}
        {product.includedAccessories && product.includedAccessories.length > 0 && (
          <div
            className={`sharp-card glass-card p-6 border ${
              isDark
                ? 'border-white/10'
                : 'border-stone-900/10'
            }`}
          >
            <h2 className={`font-display text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-stone-900'}`}>
              <Package className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-800'}`} />
              <span>Standard Included Accessories</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {product.includedAccessories.map((acc, i) => (
                <div
                  key={i}
                  className={`p-3 sharp-box border flex items-center gap-2 ${
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
          </div>
        )}

        {/* Food Image Gallery Showcase (Pure Images Only) */}
        {matchingRecipes.length > 0 && (
          <div
            className={`sharp-card glass-card p-6 border ${
              isDark ? 'border-white/10' : 'border-stone-900/10'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-display text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-stone-900'}`}>
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                <span>Food Gallery · {product.model}</span>
              </h2>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {matchingRecipes.map((item) => (
                <div
                  key={item.id}
                  className={`aspect-square sharp-box border flex items-center justify-center overflow-hidden ${
                    isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white/80 border-stone-900/10'
                  }`}
                >
                  {item.imageUrl || item.image ? (
                    <img src={item.imageUrl || item.image} alt="Food" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl select-none">{item.emoji || '🍟'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Space & Kitchen Safe Clearance Note */}
        <div
          className={`sharp-box p-5 border text-xs leading-relaxed ${
            isDark
              ? 'bg-amber-500/10 border-amber-500/20 text-zinc-300'
              : 'bg-amber-500/10 border-amber-900/20 text-stone-800'
          }`}
        >
          <strong className={`font-bold block mb-1 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
            Kitchen Counter Space Guidelines:
          </strong>
          This model measures {product.dimensions.widthCm || 45} cm wide and {product.dimensions.depthCm || 35} cm deep. We recommend leaving at least {product.dimensions.ventilationClearanceCm || 5} cm clearance on the rear and sides for unimpeded heat ventilation.
        </div>

        {/* CTA Footer */}
        <div className="pt-4 text-center">
          <button
            onClick={onBackToApp}
            className={`px-6 py-3 sharp-box font-bold text-xs uppercase tracking-wider transition ${
              isDark
                ? 'bg-white hover:bg-zinc-200 text-black shadow-lg'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-50 shadow-md'
            }`}
          >
            Browse Full Smart Appliance Showcase →
          </button>
        </div>
      </main>
    </div>
  );
};
