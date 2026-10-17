import React from 'react';
import { Presentation, WifiOff, Sun, Moon } from 'lucide-react';
import { ActiveTab } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { SalesBrandLogo } from '../common/SalesBrandLogo';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface GlassHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onEnterPresentationMode: () => void;
  isPresentationMode: boolean;
  theme?: 'black' | 'cream';
  onToggleTheme?: () => void;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({
  activeTab,
  setActiveTab,
  onEnterPresentationMode,
  theme = 'black',
  onToggleTheme,
}) => {
  const isOnline = useOnlineStatus();
  const isDark = theme === 'black';

  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'catalogue', label: 'Products' },
    { id: 'space', label: '3D Space Planner' },
    { id: 'recipes', label: 'Food Gallery' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-2xl border-b px-4 md:px-8 py-3.5 transition-colors duration-300 ${
        isDark
          ? 'bg-black/55 border-white/15 text-white shadow-2xl shadow-black/80'
          : 'bg-white/70 border-stone-300/80 text-stone-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 md:gap-8">
        {/* Zone 1: Brand Wordmark with Glassmorphic Sales Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer shrink-0 group select-none"
        >
          <SalesBrandLogo size="md" />
          <div className="flex flex-col">
            <span
              className={`font-display text-base md:text-lg font-bold tracking-tight whitespace-nowrap ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              Smart Appliance Showcase
            </span>
            <span
              className={`text-[9px] uppercase tracking-widest font-mono -mt-0.5 hidden sm:inline ${
                isDark ? 'text-zinc-400' : 'text-stone-500'
              }`}
            >
              OTG & Air Fryer Catalogue
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wider uppercase">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`transition-all whitespace-nowrap shrink-0 relative py-1 ${
                  isActive
                    ? isDark
                      ? 'text-white font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white'
                      : 'text-stone-900 font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                    : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Theme Toggle + Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 sharp-pill border transition flex items-center justify-center ${
                isDark
                  ? 'border-white/20 text-zinc-200 hover:text-white bg-white/10 hover:bg-white/20'
                  : 'border-stone-300 text-stone-800 hover:bg-stone-200/70 bg-white/80'
              }`}
              title={isDark ? 'Switch to White & Cream Theme' : 'Switch to Obsidian Black Theme'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {!isOnline && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 sharp-pill border text-xs font-medium ${
                isDark
                  ? 'bg-white/10 border-white/20 text-zinc-200'
                  : 'bg-stone-200 border-stone-300 text-stone-800'
              }`}
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          <div className="hidden sm:block">
            <PWAInstallButton compact />
          </div>

          <button
            onClick={onEnterPresentationMode}
            className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 sharp-pill text-xs font-bold transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 border ${
              isDark
                ? 'bg-white text-black hover:bg-zinc-200 border-white font-extrabold shadow-lg shadow-black/60'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800 shadow-md'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span className="hidden sm:inline">Customer Keynote</span>
            <span className="sm:hidden">Present</span>
          </button>
        </div>
      </div>
    </header>
  );
};
