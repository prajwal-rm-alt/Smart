import React from 'react';
import { Home, Grid, Ruler, UtensilsCrossed, Settings } from 'lucide-react';
import { ActiveTab } from '../../types';

interface FloatingDockProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  productCount: number;
  theme?: 'black' | 'cream';
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  activeTab,
  setActiveTab,
  productCount,
  theme = 'black',
}) => {
  const isDark = theme === 'black';

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // Ignored
      }
    }
  };

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { id: 'catalogue' as ActiveTab, label: 'Catalogue', icon: Grid, badge: productCount },
    { id: 'space' as ActiveTab, label: '3D Space', icon: Ruler },
    { id: 'recipes' as ActiveTab, label: 'Food Gallery', icon: UtensilsCrossed },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none pb-safe">
      <nav
        aria-label="Bottom Navigation Dock"
        className={`pointer-events-auto flex items-center justify-between gap-1.5 p-1.5 sharp-box glass-nav max-w-md w-full transition-all duration-300 ${
          isDark
            ? 'bg-black/90 border-white/20 text-zinc-300 shadow-2xl shadow-black/95'
            : 'bg-[#faf7f0]/95 border-amber-900/15 text-stone-700'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                triggerHaptic();
                setActiveTab(item.id);
              }}
              aria-label={item.label}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 sharp-box transition-all duration-200 min-h-[44px] min-w-[44px] active:scale-95 ${
                isActive
                  ? isDark
                    ? 'bg-white/15 text-white font-bold border border-white/20 shadow-md'
                    : 'bg-amber-900/10 text-stone-900 font-bold'
                  : isDark
                  ? 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && item.id === 'catalogue' && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 px-1.5 py-0.2 sharp-box text-[9px] font-bold font-mono tabular-nums ${
                      isDark ? 'bg-white text-black font-extrabold' : 'bg-stone-900 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-1 tracking-wider font-semibold uppercase">
                {item.label}
              </span>

              {isActive && (
                <span
                  className={`absolute bottom-0.5 w-2 h-0.5 sharp-pill ${
                    isDark ? 'bg-white' : 'bg-amber-700'
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
