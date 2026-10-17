import React from 'react';
import { Star, Scale, ArrowRight, QrCode } from 'lucide-react';
import { Product } from '../../types';
import { ApplianceGraphic } from './ApplianceGraphic';
import { calculateFootprint } from '../../utils/calculations';

interface VisualApplianceCardProps {
  product: Product;
  theme?: 'black' | 'cream';
  onSelect: (product: Product) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  isCompareSelected?: boolean;
  onToggleCompare?: (product: Product, e: React.MouseEvent) => void;
  onOpenQR?: (product: Product, e: React.MouseEvent) => void;
}

export const VisualApplianceCard: React.FC<VisualApplianceCardProps> = ({
  product,
  theme = 'black',
  onSelect,
  onToggleFavorite,
  isCompareSelected = false,
  onToggleCompare,
  onOpenQR,
}) => {
  const footprint = calculateFootprint(product.dimensions.widthCm, product.dimensions.depthCm);
  const isDark = theme === 'black';

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative cursor-pointer sharp-box p-4.5 transition-all duration-300 glass-card glass-card-hover flex flex-col justify-between"
    >
      <div>
        {/* Top Header Row: Brand & Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-[10px] font-bold tracking-widest uppercase font-mono truncate ${
                isDark ? 'text-amber-200/90' : 'text-amber-900'
              }`}
            >
              {product.brand}
            </span>
            <span className={isDark ? 'text-zinc-600' : 'text-stone-400'}>·</span>
            <span
              className={`text-[10px] font-semibold tracking-tight uppercase truncate ${
                isDark ? 'text-zinc-300' : 'text-stone-600'
              }`}
            >
              {product.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {onOpenQR && (
              <button
                onClick={(e) => onOpenQR(product, e)}
                aria-label="Generate QR Code"
                className={`p-1.5 sharp-pill border transition text-xs ${
                  isDark
                    ? 'border-white/15 text-zinc-200 hover:text-white bg-white/10 hover:bg-white/20'
                    : 'border-stone-300/90 text-stone-700 hover:text-stone-950 bg-white/80 hover:bg-white'
                }`}
                title="Customer QR Share"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            )}

            {onToggleCompare && (
              <button
                onClick={(e) => onToggleCompare(product, e)}
                aria-label={isCompareSelected ? 'Remove from comparison' : 'Add to comparison'}
                className={`p-1.5 sharp-pill border transition text-xs ${
                  isCompareSelected
                    ? isDark
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-stone-900 text-amber-50 border-stone-800'
                    : isDark
                    ? 'border-white/15 text-zinc-200 hover:text-white bg-white/10 hover:bg-white/20'
                    : 'border-stone-300/90 text-stone-700 hover:text-stone-950 bg-white/80 hover:bg-white'
                }`}
                title="Compare appliance"
              >
                <Scale className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={(e) => onToggleFavorite(product.id, e)}
              aria-label={product.isFavorite ? 'Remove favorite' : 'Mark as favorite'}
              className={`p-1.5 sharp-pill border transition ${
                product.isFavorite
                  ? 'text-amber-400 bg-amber-400/15 border-amber-400/35'
                  : isDark
                  ? 'border-white/15 text-zinc-300 hover:text-amber-300 bg-white/10 hover:bg-white/20'
                  : 'border-stone-300/90 text-stone-600 hover:text-amber-600 bg-white/80 hover:bg-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${product.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Visual Graphic Showcase with iOS Rounded Edges */}
        <ApplianceGraphic
          category={product.category}
          model={product.model}
          brand={product.brand}
          imageUrl={product.images?.[0]}
          capacityLitres={product.capacityLitres}
          powerWatts={product.specifications.powerWatts}
          className="w-full h-44 mb-3.5"
        />

        {/* Product Model & Capacity in Playfair Display Serif */}
        <div className="mb-2">
          <h3
            className={`font-display text-lg font-bold tracking-tight transition-colors ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}
          >
            {product.model}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 text-xs">
            <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-stone-800'}`}>
              {product.capacityLitres} Litres
            </span>
            {product.specifications.controlType && (
              <>
                <span className={isDark ? 'text-zinc-600' : 'text-stone-400'}>·</span>
                <span className={isDark ? 'text-zinc-300' : 'text-stone-600'}>
                  {product.specifications.controlType}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Key Features Bullet Snippet */}
        {product.features && product.features.length > 0 && (
          <div className="mt-2 space-y-1">
            {product.features.slice(0, 2).map((feat, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-1.5 text-xs line-clamp-1 ${
                  isDark ? 'text-zinc-300' : 'text-stone-700'
                }`}
              >
                <span className={isDark ? 'text-amber-300 font-bold' : 'text-amber-800 font-bold'}>
                  •
                </span>
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Dimensions Footprint & Details Button */}
      <div
        className={`mt-4 pt-3 border-t flex items-center justify-between ${
          isDark ? 'border-white/12' : 'border-stone-300/70'
        }`}
      >
        <div className="text-[11px]">
          {product.dimensions.widthCm && product.dimensions.depthCm ? (
            <span
              className={`tabular-nums font-mono ${
                isDark ? 'text-zinc-300' : 'text-stone-700 font-semibold'
              }`}
            >
              {product.dimensions.widthCm}×{product.dimensions.depthCm} cm
              <span className={`ml-1 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                ({footprint} cm²)
              </span>
            </span>
          ) : (
            <span className={isDark ? 'text-zinc-500' : 'text-stone-500'}>Dimensions on file</span>
          )}
        </div>

        <button
          onClick={() => onSelect(product)}
          className={`flex items-center gap-1 text-xs font-bold transition-all group-hover:translate-x-0.5 ${
            isDark ? 'text-white hover:text-amber-200' : 'text-stone-900 hover:text-amber-900'
          }`}
        >
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
