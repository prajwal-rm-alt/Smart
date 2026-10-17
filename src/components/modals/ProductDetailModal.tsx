import React, { useState } from 'react';
import {
  X,
  Star,
  Edit3,
  Trash2,
  Presentation,
  Ruler,
  CheckCircle,
  AlertCircle,
  Package,
  QrCode,
  Box,
} from 'lucide-react';
import { Product, Recipe, DimensionUnit } from '../../types';
import { ApplianceGraphic } from '../common/ApplianceGraphic';
import { Appliance3DViewer } from '../common/Appliance3DViewer';
import { convertUnit, calculateFootprint } from '../../utils/calculations';

interface ProductDetailModalProps {
  product: Product;
  recipes: Recipe[];
  theme: 'black' | 'cream';
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onPresent: (product: Product) => void;
  onTestInSpacePlanner: (product: Product) => void;
  onOpenQR: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  recipes,
  theme,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onPresent,
  onTestInSpacePlanner,
  onOpenQR,
}) => {
  const isDark = theme === 'black';
  const [activeTab, setActiveTab] = useState<
    'overview' | 'specs' | 'space' | '3d' | 'accessories' | 'recipes'
  >('overview');
  const [displayUnit, setDisplayUnit] = useState<DimensionUnit>('cm');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const compatibleRecipes = recipes.filter(
    (r) =>
      r.taggedModelIds?.includes(product.id) ||
      r.compatibleModelIds?.includes(product.id) ||
      r.taggedCategory === 'Both' ||
      (product.category === 'OTG' && r.taggedCategory === 'OTG') ||
      (product.category !== 'OTG' && r.taggedCategory === 'Air Fryer')
  );

  const footprint = calculateFootprint(product.dimensions.widthCm, product.dimensions.depthCm);
  const widthInUnit = convertUnit(product.dimensions.widthCm || 0, 'cm', displayUnit);
  const heightInUnit = convertUnit(product.dimensions.heightCm || 0, 'cm', displayUnit);
  const depthInUnit = convertUnit(product.dimensions.depthCm || 0, 'cm', displayUnit);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xl animate-fadeIn">
      <div
        className={`relative w-full max-w-3xl max-h-[92vh] sharp-box border shadow-2xl flex flex-col overflow-hidden glass-card ${
          isDark
            ? 'border-white/20 text-white'
            : 'border-stone-300/80 text-stone-900'
        }`}
      >
        {/* Modal Header (iOS Navigation Bar Style) */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-4 shrink-0 backdrop-blur-2xl ${
            isDark
              ? 'bg-black/60 border-white/15 text-white'
              : 'bg-white/75 border-stone-200/80 text-stone-900'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-xs font-bold uppercase tracking-widest font-mono truncate ${
                isDark ? 'text-amber-200' : 'text-amber-900'
              }`}
            >
              {product.brand}
            </span>
            <span className={isDark ? 'text-zinc-600' : 'text-stone-400'}>·</span>
            <span
              className={`text-xs uppercase tracking-wider truncate ${
                isDark ? 'text-zinc-300' : 'text-stone-600'
              }`}
            >
              {product.category}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenQR(product)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sharp-pill text-xs font-bold border transition ${
                isDark
                  ? 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  : 'bg-amber-100/90 text-stone-900 border-amber-900/20 hover:bg-amber-200/80'
              }`}
              title="Generate QR code for customer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

            <button
              onClick={(e) => onToggleFavorite(product.id, e)}
              className={`p-2 sharp-pill border transition ${
                product.isFavorite
                  ? 'text-amber-400 bg-amber-400/15 border-amber-400/30'
                  : isDark
                  ? 'border-white/15 text-zinc-300 hover:text-white bg-white/5 hover:bg-white/15'
                  : 'border-stone-300 text-stone-600 hover:text-stone-900 bg-white/80'
              }`}
              title="Toggle Favorite"
            >
              <Star className={`w-4 h-4 ${product.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => onPresent(product)}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 sharp-pill text-xs font-bold transition border ${
                isDark
                  ? 'bg-white text-black hover:bg-zinc-200 border-white shadow-md'
                  : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800 shadow-md'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Present</span>
            </button>

            <button
              onClick={onClose}
              className={`p-2 sharp-pill border transition ${
                isDark
                  ? 'border-white/15 text-zinc-300 hover:text-white bg-white/5 hover:bg-white/15'
                  : 'border-stone-300 text-stone-600 hover:text-stone-900 bg-white/80'
              }`}
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Visual Showcase (Hidden when 3D Model tab is active so 3D viewport + controller fit in view) */}
          {activeTab !== '3d' && (
            <div className="flex flex-col sm:flex-row gap-5 items-center">
              <div className="w-full sm:w-1/2">
                <ApplianceGraphic
                  category={product.category}
                  model={product.model}
                  brand={product.brand}
                  imageUrl={product.images?.[0]}
                  capacityLitres={product.capacityLitres}
                  powerWatts={product.specifications.powerWatts}
                  className="w-full h-52 sm:h-56 sharp-box"
                />
              </div>

              <div className="w-full sm:w-1/2 space-y-3">
                <div>
                  <h2
                    className={`font-display text-2xl md:text-3xl font-extrabold tracking-tight ${
                      isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {product.model}
                  </h2>
                  <div className="mt-1.5 flex items-center gap-2 text-xs">
                    <span
                      className={`px-2.5 py-0.5 sharp-pill font-bold font-mono border ${
                        isDark
                          ? 'bg-white/10 text-amber-200 border-white/20'
                          : 'bg-amber-100 text-amber-950 border-amber-900/20'
                      }`}
                    >
                      {product.capacityLitres} Litres
                    </span>
                    {product.dataStatus === 'verified' ? (
                      <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Verified specs</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Needs review</span>
                      </span>
                    )}
                  </div>
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    isDark ? 'text-zinc-300' : 'text-stone-700'
                  }`}
                >
                  {product.description ||
                    `Engineered by ${product.brand} for consistent cooking with high-efficiency heating elements.`}
                </p>

                {(product.specifications.sellingPrice || product.specifications.mrpPrice) && (
                  <div className="pt-2 flex items-baseline gap-2.5 text-xs">
                    {product.specifications.sellingPrice && (
                      <span
                        className={`text-xl font-bold font-mono tabular-nums ${
                          isDark ? 'text-white' : 'text-stone-900'
                        }`}
                      >
                        <span className="font-sans">₹</span>
                        {product.specifications.sellingPrice.toLocaleString()}
                      </span>
                    )}
                    {product.specifications.mrpPrice && (
                      <span
                        className={`line-through font-mono tabular-nums ${
                          isDark ? 'text-zinc-500' : 'text-stone-400'
                        }`}
                      >
                        <span className="font-sans">₹</span>
                        {product.specifications.mrpPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Segmented Detail Tabs (iPhone Control Center Style) */}
          <div
            className={`flex items-center gap-1 p-1.5 sharp-box border overflow-x-auto no-scrollbar text-xs ${
              isDark
                ? 'bg-black/60 border-white/15 backdrop-blur-xl'
                : 'bg-stone-200/60 border-stone-300/80 backdrop-blur-xl'
            }`}
          >
            {(
              [
                { id: 'overview', label: 'Overview' },
                { id: 'specs', label: 'Technical Specs' },
                { id: 'space', label: 'Dimensions' },
                { id: '3d', label: '3D Model & Calipers' },
                {
                  id: 'accessories',
                  label: `Accessories (${product.includedAccessories?.length || 0})`,
                },
                {
                  id: 'recipes',
                  label: `Dishes & Food (${compatibleRecipes.length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 sharp-pill font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-white text-black font-extrabold shadow-md'
                      : 'bg-stone-900 text-amber-50 shadow-md'
                    : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4
                  className={`font-bold uppercase tracking-wider text-[11px] mb-2.5 font-mono ${
                    isDark ? 'text-zinc-400' : 'text-stone-600'
                  }`}
                >
                  Key Capabilities & Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.features?.map((f, i) => (
                    <div
                      key={i}
                      className={`p-3.5 sharp-pill border flex items-start gap-2.5 ${
                        isDark
                          ? 'bg-white/[0.04] border-white/12 text-zinc-200'
                          : 'bg-white/80 border-stone-200/90 text-stone-800'
                      }`}
                    >
                      <span
                        className={
                          isDark ? 'text-amber-300 font-bold' : 'text-amber-800 font-bold'
                        }
                      >
                        •
                      </span>
                      <span className="leading-snug">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {product.cookingFunctions && product.cookingFunctions.length > 0 && (
                <div>
                  <h4
                    className={`font-bold uppercase tracking-wider text-[11px] mb-2.5 font-mono ${
                      isDark ? 'text-zinc-400' : 'text-stone-600'
                    }`}
                  >
                    Supported Cooking Functions
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {product.cookingFunctions.map((fn, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1.5 sharp-pill font-semibold border ${
                          isDark
                            ? 'bg-white/[0.07] text-white border-white/15'
                            : 'bg-white text-stone-800 border-stone-300'
                        }`}
                      >
                        {fn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SPECS */}
          {activeTab === 'specs' && (
            <div
              className={`sharp-box border overflow-hidden text-xs ${
                isDark
                  ? 'bg-white/[0.03] border-white/15'
                  : 'bg-white/85 border-stone-200/90'
              }`}
            >
              <table className="w-full text-left">
                <tbody
                  className={`divide-y ${
                    isDark ? 'divide-white/10' : 'divide-stone-200'
                  }`}
                >
                  <tr>
                    <td
                      className={`py-3 px-4 font-medium ${
                        isDark ? 'text-zinc-400' : 'text-stone-600'
                      }`}
                    >
                      Capacity
                    </td>
                    <td
                      className={`py-3 px-4 font-bold font-mono tabular-nums ${
                        isDark ? 'text-white' : 'text-stone-900'
                      }`}
                    >
                      {product.capacityLitres} Litres
                    </td>
                  </tr>
                  <tr>
                    <td
                      className={`py-3 px-4 font-medium ${
                        isDark ? 'text-zinc-400' : 'text-stone-600'
                      }`}
                    >
                      Rated Power
                    </td>
                    <td
                      className={`py-3 px-4 font-bold font-mono tabular-nums ${
                        isDark ? 'text-amber-200' : 'text-amber-900'
                      }`}
                    >
                      {product.specifications.powerWatts
                        ? `${product.specifications.powerWatts} Watts`
                        : 'Not provided'}
                    </td>
                  </tr>
                  <tr>
                    <td
                      className={`py-3 px-4 font-medium ${
                        isDark ? 'text-zinc-400' : 'text-stone-600'
                      }`}
                    >
                      Temperature Range
                    </td>
                    <td
                      className={`py-3 px-4 font-mono tabular-nums ${
                        isDark ? 'text-zinc-200' : 'text-stone-800'
                      }`}
                    >
                      {product.specifications.temperatureRangeC || 'Not provided'}
                    </td>
                  </tr>
                  <tr>
                    <td
                      className={`py-3 px-4 font-medium ${
                        isDark ? 'text-zinc-400' : 'text-stone-600'
                      }`}
                    >
                      Timer Range
                    </td>
                    <td
                      className={`py-3 px-4 font-mono tabular-nums ${
                        isDark ? 'text-zinc-200' : 'text-stone-800'
                      }`}
                    >
                      {product.specifications.timerMinutes
                        ? `${product.specifications.timerMinutes} Minutes`
                        : 'Not provided'}
                    </td>
                  </tr>
                  <tr>
                    <td
                      className={`py-3 px-4 font-medium ${
                        isDark ? 'text-zinc-400' : 'text-stone-600'
                      }`}
                    >
                      Control Interface
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        isDark ? 'text-zinc-200' : 'text-stone-800'
                      }`}
                    >
                      {product.specifications.controlType || 'Not provided'}
                    </td>
                  </tr>
                  <tr>
                    <td
                      className={`py-3 px-4 font-medium ${
                        isDark ? 'text-zinc-400' : 'text-stone-600'
                      }`}
                    >
                      Heating Elements
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        isDark ? 'text-zinc-200' : 'text-stone-800'
                      }`}
                    >
                      {product.specifications.heatingElements || 'Standard element'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: SPACE */}
          {activeTab === 'space' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h4
                  className={`font-bold uppercase tracking-wider text-[11px] font-mono ${
                    isDark ? 'text-zinc-400' : 'text-stone-600'
                  }`}
                >
                  Physical Dimensions & Clearance
                </h4>

                <div
                  className={`flex items-center p-1 sharp-pill border text-xs ${
                    isDark
                      ? 'bg-black/60 border-white/15'
                      : 'bg-white border-stone-300'
                  }`}
                >
                  {(['cm', 'mm', 'in', 'ft'] as DimensionUnit[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setDisplayUnit(u)}
                      className={`px-2.5 py-0.5 sharp-pill font-bold transition ${
                        displayUnit === u
                          ? isDark
                            ? 'bg-white text-black'
                            : 'bg-stone-900 text-white'
                          : isDark
                          ? 'text-zinc-400 hover:text-white'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div
                  className={`p-3.5 sharp-pill border text-center ${
                    isDark
                      ? 'bg-white/[0.04] border-white/12'
                      : 'bg-white/85 border-stone-200/90'
                  }`}
                >
                  <span
                    className={`text-[10px] block mb-0.5 uppercase font-mono ${
                      isDark ? 'text-zinc-400' : 'text-stone-500'
                    }`}
                  >
                    Width
                  </span>
                  <span
                    className={`text-base font-bold font-mono tabular-nums ${
                      isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {widthInUnit} {displayUnit}
                  </span>
                </div>
                <div
                  className={`p-3.5 sharp-pill border text-center ${
                    isDark
                      ? 'bg-white/[0.04] border-white/12'
                      : 'bg-white/85 border-stone-200/90'
                  }`}
                >
                  <span
                    className={`text-[10px] block mb-0.5 uppercase font-mono ${
                      isDark ? 'text-zinc-400' : 'text-stone-500'
                    }`}
                  >
                    Height
                  </span>
                  <span
                    className={`text-base font-bold font-mono tabular-nums ${
                      isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {heightInUnit} {displayUnit}
                  </span>
                </div>
                <div
                  className={`p-3.5 sharp-pill border text-center ${
                    isDark
                      ? 'bg-white/[0.04] border-white/12'
                      : 'bg-white/85 border-stone-200/90'
                  }`}
                >
                  <span
                    className={`text-[10px] block mb-0.5 uppercase font-mono ${
                      isDark ? 'text-zinc-400' : 'text-stone-500'
                    }`}
                  >
                    Depth
                  </span>
                  <span
                    className={`text-base font-bold font-mono tabular-nums ${
                      isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {depthInUnit} {displayUnit}
                  </span>
                </div>
                <div
                  className={`p-3.5 sharp-pill border text-center ${
                    isDark
                      ? 'bg-white/[0.04] border-white/12'
                      : 'bg-white/85 border-stone-200/90'
                  }`}
                >
                  <span
                    className={`text-[10px] block mb-0.5 uppercase font-mono ${
                      isDark ? 'text-zinc-400' : 'text-stone-500'
                    }`}
                  >
                    Footprint Area
                  </span>
                  <span
                    className={`text-base font-bold font-mono tabular-nums ${
                      isDark ? 'text-amber-200' : 'text-amber-900'
                    }`}
                  >
                    {footprint} cm²
                  </span>
                </div>
              </div>

              <button
                onClick={() => onTestInSpacePlanner(product)}
                className={`w-full py-3 sharp-pill font-bold transition flex items-center justify-center gap-2 border ${
                  isDark
                    ? 'bg-white text-black hover:bg-zinc-200 border-white font-extrabold shadow-lg'
                    : 'bg-stone-900 hover:bg-stone-800 text-white border-stone-800 shadow-md'
                }`}
              >
                <Ruler className="w-4 h-4" />
                <span>Test in Kitchen Space & 3D Simulator</span>
              </button>
            </div>
          )}

          {/* TAB 3B: INTERACTIVE 3D MODEL WITH VERIFIED MEASUREMENTS */}
          {activeTab === '3d' && (
            <div className="space-y-4">
              <div className="w-full min-h-[480px] sharp-box border overflow-hidden border-white/15">
                <Appliance3DViewer
                  product={product}
                  theme={theme}
                  className="w-full h-[480px]"
                  showControls={true}
                />
              </div>
            </div>
          )}

          {/* TAB 4: ACCESSORIES */}
          {activeTab === 'accessories' && (
            <div className="space-y-4 text-xs">
              <h4
                className={`font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 font-mono ${
                  isDark ? 'text-zinc-400' : 'text-stone-600'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Standard Included Accessories</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.includedAccessories?.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 sharp-pill border flex items-center gap-2.5 ${
                      isDark
                        ? 'bg-white/[0.04] border-white/12 text-zinc-200'
                        : 'bg-white/85 border-stone-200/90 text-stone-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DISHES & FOOD CREATIONS */}
          {activeTab === 'recipes' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4
                    className={`font-bold uppercase tracking-wider text-[11px] font-mono ${
                      isDark ? 'text-zinc-400' : 'text-stone-600'
                    }`}
                  >
                    Dishes Cooked With {product.model}
                  </h4>
                  <span
                    className={`text-[11px] ${
                      isDark ? 'text-zinc-400' : 'text-stone-600'
                    }`}
                  >
                    Food items tagged as compatible with this appliance
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 sharp-pill font-mono text-[10px] border ${
                    isDark
                      ? 'bg-white/10 border-white/15 text-white'
                      : 'bg-stone-200/80 border-stone-300 text-stone-800'
                  }`}
                >
                  {compatibleRecipes.length} dishes
                </span>
              </div>

              {compatibleRecipes.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {compatibleRecipes.map((r) => (
                    <div
                      key={r.id}
                      className={`aspect-square sharp-box border flex items-center justify-center overflow-hidden ${
                        isDark
                          ? 'bg-white/[0.04] border-white/15'
                          : 'bg-white/85 border-stone-200/90'
                      }`}
                    >
                      {r.imageUrl || r.image ? (
                        <img
                          src={r.imageUrl || r.image}
                          alt="Food creation"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl select-none">{r.emoji || '🍟'}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`p-6 sharp-box border border-dashed text-center ${
                    isDark
                      ? 'border-white/15 text-zinc-400'
                      : 'border-stone-300 text-stone-600'
                  }`}
                >
                  <span className="text-2xl block mb-1">🍽️</span>
                  <span>
                    No dishes tagged for this specific model yet. Visit the Food Image Gallery to
                    tag dishes.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 shrink-0 backdrop-blur-2xl ${
            isDark
              ? 'bg-black/65 border-white/15'
              : 'bg-white/80 border-stone-200/80'
          }`}
        >
          <div>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-400 font-semibold">Confirm?</span>
                <button
                  onClick={() => onDelete(product.id)}
                  className="px-2.5 py-1 sharp-pill bg-rose-600 text-white text-xs font-bold"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-2 py-1 text-xs opacity-70 hover:opacity-100"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(product)}
              className={`flex items-center gap-1.5 px-3.5 py-2 sharp-pill text-xs font-semibold border transition ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onPresent(product)}
              className={`flex items-center gap-1.5 px-4 py-2 sharp-pill text-xs font-bold transition border ${
                isDark
                  ? 'bg-white text-black hover:bg-zinc-200 border-white font-extrabold shadow-lg'
                  : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800 shadow-md'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Present to Customer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
