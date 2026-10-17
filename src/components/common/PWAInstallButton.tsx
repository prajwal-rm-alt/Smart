import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 sharp-pill bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installed PWA</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        aria-label="Install Smart Appliance Showcase App"
        className={`relative inline-flex items-center justify-center gap-2 sharp-pill font-bold transition-all duration-200 active:scale-95 ${
          compact
            ? 'px-3 py-1.5 text-xs bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border border-amber-500/30'
            : 'px-4 py-2 text-sm bg-white text-black shadow-lg hover:bg-zinc-200'
        }`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{compact ? 'Install App' : 'Install PWA'}</span>
      </button>

      {/* iOS & Browser Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-sm sharp-card glass-card bg-black/85 border border-white/15 p-6 shadow-2xl text-white">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 sharp-pill text-zinc-400 hover:text-white bg-white/10"
              aria-label="Close installation guide"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 sharp-box bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">Install on Your Device</h3>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              Install the Smart Appliance Showcase as an offline-first app on iPhone, iPad, Android, or PC.
            </p>

            <div className="mt-4 space-y-3 bg-white/[0.04] sharp-box p-4 border border-white/10 text-xs text-zinc-300">
              <div className="flex items-start gap-3">
                <div className="p-1.5 sharp-box bg-amber-500/15 text-amber-400 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white">Step 1:</span> Tap the{' '}
                  <strong className="text-amber-300">Share</strong> icon in the Safari or browser menu bar.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 sharp-box bg-amber-500/15 text-amber-400 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white">Step 2:</span> Scroll down and tap{' '}
                  <strong className="text-amber-300">Add to Home Screen</strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 sharp-box bg-white text-black text-xs font-bold hover:bg-zinc-200 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
