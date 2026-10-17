import React, { useState } from 'react';
import { ApplianceCategory } from '../../types';

interface ApplianceGraphicProps {
  category: ApplianceCategory;
  model: string;
  brand: string;
  imageUrl?: string;
  className?: string;
  powerWatts?: number | null;
  capacityLitres?: number;
}

export const ApplianceGraphic: React.FC<ApplianceGraphicProps> = ({
  category,
  model,
  brand,
  imageUrl,
  className = 'w-full h-48',
  powerWatts,
  capacityLitres,
}) => {
  const [imageError, setImageError] = useState(false);

  // If user provided a custom image and it hasn't errored
  if (imageUrl && !imageError) {
    return (
      <div className={`relative overflow-hidden sharp-pill bg-black/60 border border-white/15 ${className}`}>
        <img
          src={imageUrl}
          alt={`${brand} ${model}`}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  const isAirFryer = category.includes('Air Fryer');

  return (
    <div
      className={`relative overflow-hidden sharp-pill flex items-center justify-center select-none bg-gradient-to-br from-black/75 via-zinc-900/50 to-black/80 border border-white/15 shadow-inner ${className}`}
    >
      {/* Subtle warm champagne/amber studio glow behind appliance */}
      <div
        className={`absolute -inset-1 opacity-25 blur-2xl pointer-events-none ${
          isAirFryer ? 'bg-amber-200/40' : 'bg-amber-500/40'
        }`}
      />

      {isAirFryer ? (
        // High-fidelity Obsidian & Chrome Air Fryer Vector Graphic
        <svg
          className="w-3/4 h-3/4 max-h-40 drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3f3f46" />
              <stop offset="50%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="basketGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
          </defs>

          {/* Air Fryer Main Housing */}
          <rect x="45" y="25" width="150" height="190" rx="36" fill="url(#bodyGrad)" stroke="#52525b" strokeWidth="2.5" />

          {/* Top Air Exhaust & Crown */}
          <path d="M 65 25 Q 120 18 175 25" stroke="#71717a" strokeWidth="3" strokeLinecap="round" />

          {/* Digital Touchscreen Top Console */}
          <rect x="65" y="42" width="110" height="52" rx="16" fill="#050507" stroke="#fbbf24" strokeWidth="1.2" strokeOpacity="0.45" />

          {/* LED Temperature / Timer Display in Warm White & Gold */}
          <text x="96" y="74" fill="#fef3c7" fontSize="16" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
            200°
          </text>
          <text x="136" y="74" fill="#d4d4d8" fontSize="11" fontFamily="JetBrains Mono, monospace">
            18m
          </text>

          {/* Rapid Vortex Swirl Icon on Screen */}
          <circle cx="82" cy="68" r="8" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 4" />

          {/* Pull-out Basket Section */}
          <rect x="55" y="106" width="130" height="96" rx="22" fill="url(#basketGrad)" stroke="#3f3f46" strokeWidth="2" />

          {/* Viewing Window with Warm Glow */}
          <rect x="70" y="118" width="100" height="54" rx="12" fill="#451a03" fillOpacity="0.75" stroke="#d97706" strokeWidth="1.5" />

          {/* Internal golden food silhouette */}
          <circle cx="100" cy="148" r="8" fill="#f59e0b" fillOpacity="0.85" />
          <circle cx="120" cy="144" r="10" fill="#f97316" fillOpacity="0.85" />
          <circle cx="140" cy="149" r="7" fill="#fbbf24" fillOpacity="0.85" />

          {/* Brushed Chrome Handle */}
          <rect x="105" y="180" width="30" height="14" rx="6" fill="#71717a" stroke="#d4d4d8" strokeWidth="1" />

          {/* Bottom Rubber Feet */}
          <rect x="65" y="215" width="22" height="6" rx="3" fill="#000000" />
          <rect x="153" y="215" width="22" height="6" rx="3" fill="#000000" />
        </svg>
      ) : (
        // High-fidelity Obsidian & Chrome Oven Toaster Grill (OTG) Vector Graphic
        <svg
          className="w-4/5 h-3/4 max-h-40 drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
          viewBox="0 0 260 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="otgBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#52525b" />
              <stop offset="40%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="heatGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="glassReflect" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Main Metallic Chassis */}
          <rect x="18" y="22" width="224" height="152" rx="18" fill="url(#otgBody)" stroke="#71717a" strokeWidth="2.5" />

          {/* Double Tempered Glass Chamber Door */}
          <rect x="30" y="34" width="144" height="126" rx="12" fill="#09090b" stroke="#a1a1aa" strokeWidth="2" />

          {/* Amber Interior Illumination */}
          <rect x="36" y="40" width="132" height="114" rx="8" fill="#451a03" fillOpacity="0.68" />

          {/* Top Glowing Quartz Heating Rod */}
          <line x1="46" y1="56" x2="158" y2="56" stroke="url(#heatGlow)" strokeWidth="4.5" strokeLinecap="round" />

          {/* Wire Grill Rack inside */}
          <line x1="44" y1="96" x2="160" y2="96" stroke="#d4d4d8" strokeWidth="2" strokeDasharray="8 6" />

          {/* Bottom Glowing Heating Rod */}
          <line x1="46" y1="138" x2="158" y2="138" stroke="url(#heatGlow)" strokeWidth="4.5" strokeLinecap="round" />

          {/* Glass Specular Reflection Highlight */}
          <path d="M 36 40 L 120 40 L 48 154 L 36 154 Z" fill="url(#glassReflect)" />

          {/* Insulated Chrome Door Handle */}
          <rect x="36" y="38" width="132" height="8" rx="4" fill="#e4e4e7" stroke="#71717a" strokeWidth="1" />

          {/* Right Control Column */}
          <rect x="184" y="34" width="46" height="126" rx="10" fill="#050507" stroke="#3f3f46" strokeWidth="1.5" />

          {/* Dial 1: Temperature */}
          <circle cx="207" cy="56" r="10" fill="#18181b" stroke="#d4d4d8" strokeWidth="2" />
          <line x1="207" y1="56" x2="212" y2="51" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

          {/* Dial 2: Function / Rotisserie */}
          <circle cx="207" cy="92" r="10" fill="#18181b" stroke="#d4d4d8" strokeWidth="2" />
          <line x1="207" y1="92" x2="207" y2="85" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" />

          {/* Dial 3: Timer with Bell */}
          <circle cx="207" cy="128" r="10" fill="#18181b" stroke="#d4d4d8" strokeWidth="2" />
          <line x1="207" y1="128" x2="213" y2="131" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />

          {/* Bottom Stand Feet */}
          <rect x="32" y="174" width="24" height="6" rx="3" fill="#000000" />
          <rect x="204" y="174" width="24" height="6" rx="3" fill="#000000" />
        </svg>
      )}

      {/* Floating Specs Badge in Black Translucent iOS Glass */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-200 pointer-events-none">
        <span className="font-semibold text-white truncate max-w-[140px] drop-shadow">
          {brand} {model}
        </span>
        <span className="tabular-nums font-mono text-amber-100 bg-black/75 px-2.5 py-0.5 sharp-pill border border-white/20 backdrop-blur-md">
          {capacityLitres ? `${capacityLitres}L` : ''} {powerWatts ? `· ${powerWatts}W` : ''}
        </span>
      </div>
    </div>
  );
};
