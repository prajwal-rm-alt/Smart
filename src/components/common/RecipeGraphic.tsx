import React, { useState } from 'react';

interface RecipeGraphicProps {
  name: string;
  category: 'Air Fryer' | 'OTG' | 'Both';
  imageUrl?: string;
  className?: string;
}

export const RecipeGraphic: React.FC<RecipeGraphicProps> = ({
  name,
  category,
  imageUrl,
  className = 'w-full h-44',
}) => {
  const [imageError, setImageError] = useState(false);

  if (imageUrl && !imageError) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-slate-900 ${className}`}>
        <img
          src={imageUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
      </div>
    );
  }

  // Domain culinary styled backdrop
  const getFoodAccent = () => {
    const lower = name.toLowerCase();
    if (lower.includes('tikka') || lower.includes('tandoori')) {
      return {
        gradient: 'from-amber-900 via-orange-950 to-slate-950',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        icon: '🍢',
      };
    }
    if (lower.includes('pizza')) {
      return {
        gradient: 'from-red-950 via-rose-950 to-slate-950',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        icon: '🍕',
      };
    }
    if (lower.includes('fries') || lower.includes('potato')) {
      return {
        gradient: 'from-yellow-950 via-amber-950 to-slate-950',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        icon: '🍟',
      };
    }
    if (lower.includes('cake') || lower.includes('cookie')) {
      return {
        gradient: 'from-purple-950 via-pink-950 to-slate-950',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        icon: '🍰',
      };
    }
    return {
      gradient: 'from-emerald-950 via-teal-950 to-slate-950',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: '🥗',
    };
  };

  const accent = getFoodAccent();

  return (
    <div
      className={`relative overflow-hidden rounded-2xl flex flex-col items-center justify-center p-6 bg-gradient-to-br ${accent.gradient} border border-white/10 ${className}`}
    >
      <div className="text-5xl mb-2 drop-shadow-md select-none transform transition-transform duration-300 hover:scale-110">
        {accent.icon}
      </div>
      <span className="text-xs font-semibold text-slate-200 tracking-wide text-center px-2 line-clamp-1">
        {name}
      </span>
      <span
        className={`mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border backdrop-blur-sm ${accent.badge}`}
      >
        {category}
      </span>
    </div>
  );
};
