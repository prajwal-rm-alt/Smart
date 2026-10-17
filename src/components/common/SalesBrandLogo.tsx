import React from 'react';

interface SalesBrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SalesBrandLogo: React.FC<SalesBrandLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const dimensions =
    size === 'sm'
      ? 'w-8 h-8 rounded-[10px]'
      : size === 'lg'
      ? 'w-12 h-12 rounded-[15px]'
      : 'w-10 h-10 rounded-[12px]';

  return (
    <div
      className={`relative overflow-hidden shrink-0 select-none bg-[#050507] border border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.42)] transition-transform duration-300 group-hover:scale-105 ${dimensions} ${className}`}
    >
      {/* Top-right ambient glassy white glow */}
      <div className="pointer-events-none absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-white/25 blur-md" />

      {/* Top specular glass reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-white/[0.18] to-transparent" />

      {/* Inner Frosted Glassmorphic Frame */}
      <div className="pointer-events-none absolute inset-[3px] rounded-[9px] border border-white/15 bg-white/[0.04] backdrop-blur-md" />

      {/* Glassy White Sales Bar Chart + Ascending Trend Arrow SVG */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full p-1.5"
      >
        <defs>
          <linearGradient id="logoBar1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.52" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id="logoBar2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.74" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.20" />
          </linearGradient>
          <linearGradient id="logoBar3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.30" />
          </linearGradient>
          <filter id="trendGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Subtle Glass Baseline */}
        <line
          x1="11"
          y1="51"
          x2="53"
          y2="51"
          stroke="#ffffff"
          strokeOpacity="0.28"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Bar 1 - Frosted Glass */}
        <rect
          x="13"
          y="36"
          width="8.5"
          height="15"
          rx="2.8"
          fill="url(#logoBar1)"
          stroke="#ffffff"
          strokeOpacity="0.45"
          strokeWidth="1"
        />

        {/* Bar 2 - Translucent Glass */}
        <rect
          x="27.5"
          y="27"
          width="8.5"
          height="24"
          rx="2.8"
          fill="url(#logoBar2)"
          stroke="#ffffff"
          strokeOpacity="0.65"
          strokeWidth="1"
        />

        {/* Bar 3 - Luminous White Glass */}
        <rect
          x="42"
          y="17"
          width="8.5"
          height="34"
          rx="2.8"
          fill="url(#logoBar3)"
          stroke="#ffffff"
          strokeOpacity="0.88"
          strokeWidth="1.2"
        />

        {/* Ascending Sales Trend Line & Arrow */}
        <g filter="url(#trendGlow)">
          <path
            d="M 14 31 L 25.5 21.5 L 33.5 25.5 L 48.5 11.5"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 40.5 11.5 L 49 11 L 48.5 19.5"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Specular Nodes */}
        <circle cx="14" cy="31" r="1.9" fill="#050507" stroke="#ffffff" strokeWidth="1.4" />
        <circle cx="25.5" cy="21.5" r="1.9" fill="#050507" stroke="#ffffff" strokeWidth="1.4" />
        <circle cx="33.5" cy="25.5" r="1.9" fill="#050507" stroke="#ffffff" strokeWidth="1.4" />
      </svg>
    </div>
  );
};
