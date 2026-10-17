import React from 'react';
import { X, Tag, Sparkles, ArrowRight, Utensils, Check } from 'lucide-react';
import { Recipe, Product } from '../../types';

interface RecipeDetailModalProps {
  recipe: Recipe;
  allProducts: Product[];
  theme?: 'black' | 'cream';
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  allProducts,
  theme = 'black',
  onClose,
  onSelectProduct,
}) => {
  const isDark = theme === 'black';

  // Find compatible models in inventory based on taggedModelIds
  const compatibleProducts = allProducts.filter(
    (p) =>
      recipe.taggedModelIds?.includes(p.id) ||
      recipe.compatibleModelIds?.includes(p.id) ||
      recipe.taggedCategory === 'Both' ||
      (p.category === 'OTG' && recipe.taggedCategory === 'OTG') ||
      (p.category !== 'OTG' && recipe.taggedCategory === 'Air Fryer')
  );

  const displayTitle = recipe.title || recipe.name || 'Delicious Creation';
  const displayEmoji = recipe.emoji || '🍽️';
  const displayImage = recipe.imageUrl || recipe.image;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-xl sharp-box border p-6 shadow-2xl cursor-default transition-all duration-300 ${
          isDark
            ? 'glass-card border-white/20 bg-black text-white'
            : 'glass-card border-amber-900/20 bg-[#faf8f4] text-stone-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 sharp-box border transition ${
            isDark
              ? 'border-white/20 text-zinc-400 hover:text-white bg-zinc-900'
              : 'border-amber-900/20 text-stone-600 hover:text-stone-950 bg-white'
          }`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Large Food Image or Emoji Stage */}
        <div className="w-full h-64 bg-zinc-950 sharp-box border border-white/10 flex items-center justify-center overflow-hidden mb-5 relative group">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayTitle}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-center p-6 flex flex-col items-center justify-center">
              <span className="text-7xl mb-3 select-none filter drop-shadow-lg">
                {displayEmoji}
              </span>
              <span className="text-xs uppercase font-mono tracking-widest text-zinc-400">
                {recipe.taggedCategory || 'Gourmet'} Specialty
              </span>
            </div>
          )}

          {/* Floating Emoji Pill */}
          <div className="absolute top-3 left-3 px-2.5 py-1 sharp-box bg-black/85 backdrop-blur-md border border-white/20 text-sm shadow-xl flex items-center gap-1.5">
            <span>{displayEmoji}</span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-300">
              {recipe.taggedCategory}
            </span>
          </div>
        </div>

        {/* Dish Title & Description */}
        <div className="mb-4">
          <span
            className={`text-[10px] uppercase font-bold tracking-widest block mb-1 font-mono ${
              isDark ? 'text-zinc-400' : 'text-amber-800'
            }`}
          >
            Culinary Food Gallery Showcase
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {displayTitle}
          </h2>
          {recipe.caption && (
            <p className="mt-2 text-xs opacity-80 leading-relaxed text-zinc-300">
              {recipe.caption}
            </p>
          )}
        </div>

        {/* Tagged Appliance Models */}
        <div
          className={`p-4 sharp-box border mb-5 ${
            isDark ? 'bg-zinc-950/80 border-white/10' : 'bg-white border-amber-900/10'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-2.5">
            <Tag className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-400">
              Cooked & Compatible With These Appliances:
            </span>
          </div>

          {compatibleProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {compatibleProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onClose();
                    onSelectProduct(p);
                  }}
                  className={`p-2.5 sharp-box border cursor-pointer flex items-center justify-between transition hover-specular ${
                    isDark
                      ? 'bg-zinc-900 hover:bg-zinc-800 border-white/15 text-white'
                      : 'bg-stone-50 hover:bg-stone-100 border-amber-900/15 text-stone-900'
                  }`}
                >
                  <div className="truncate mr-2">
                    <div className="font-bold text-xs truncate">
                      {p.brand} {p.model}
                    </div>
                    <div className="text-[10px] opacity-70 font-mono">
                      {p.capacityLitres}L · {p.category}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">
              Suitable for all standard {recipe.taggedCategory} models in your kitchen.
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`w-full py-2.5 sharp-box text-xs font-bold uppercase tracking-wider transition ${
            isDark
              ? 'bg-white hover:bg-zinc-200 text-black shadow-lg'
              : 'bg-stone-900 hover:bg-stone-800 text-amber-50 shadow-md'
          }`}
        >
          Close Lightbox
        </button>
      </div>
    </div>
  );
};
