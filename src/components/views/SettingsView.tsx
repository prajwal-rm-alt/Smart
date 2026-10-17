import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Upload,
  Download,
  Database,
  Cpu,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';
import { Product, Recipe } from '../../types';
import { generateChatGPTResearchPrompt } from '../../utils/calculations';
import {
  exportCatalogueJSON,
  requestStoragePersistence,
  isStoragePersisted,
  resetDatabaseToDefaults,
} from '../../services/storage';

interface SettingsViewProps {
  products: Product[];
  recipes: Recipe[];
  theme: 'black' | 'cream';
  onToggleTheme: () => void;
  onOpenImportModal: () => void;
  onRefreshData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onToggleTheme,
  onOpenImportModal,
  onRefreshData,
}) => {
  const isDark = theme === 'black';

  const [selectedBrand, setSelectedBrand] = useState('Morphy Richards');
  const [selectedCategory, setSelectedCategory] = useState('OTG');
  const [modelsInput, setModelsInput] = useState('29 RCAD, 20 RCAD, 60 RCSS');

  const [includeSpecs, setIncludeSpecs] = useState(true);
  const [includeDimensions, setIncludeDimensions] = useState(true);
  const [includeCooking, setIncludeCooking] = useState(true);
  const [includeAccessories, setIncludeAccessories] = useState(true);
  const [includeRecipes, setIncludeRecipes] = useState(true);

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [persistenceLoading, setPersistenceLoading] = useState(false);
  const [resetConfirming, setResetConfirming] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    isStoragePersisted().then((val) => setPersisted(val));
    handleGeneratePrompt();
  }, [selectedBrand, selectedCategory, modelsInput]);

  const handleGeneratePrompt = () => {
    const models = modelsInput.split(',').map((m) => m.trim()).filter(Boolean);
    const prompt = generateChatGPTResearchPrompt({
      brand: selectedBrand,
      category: selectedCategory,
      models,
      includeSpecs,
      includeDimensions,
      includeCooking,
      includeAccessories,
      includeRecipes,
    });
    setGeneratedPrompt(prompt);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Failed to copy prompt:', err);
    }
  };

  const handleRequestPersistence = async () => {
    setPersistenceLoading(true);
    const res = await requestStoragePersistence();
    setPersisted(res);
    setPersistenceLoading(false);
  };

  const handleExportJSON = async () => {
    try {
      const json = await exportCatalogueJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smart_appliances_catalogue_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Export error:', err);
    }
  };

  const handleResetDefaults = async () => {
    await resetDatabaseToDefaults();
    await onRefreshData();
    setResetConfirming(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-28">
      {/* View Header */}
      <div>
        <div
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 font-mono ${
            isDark ? 'text-amber-200/90' : 'text-amber-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Management & Tools</span>
        </div>
        <h1
          className={`font-display text-2xl md:text-4xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-stone-900'
          }`}
        >
          Settings & Catalogue Data
        </h1>
        <p className={`mt-1 text-xs md:text-sm ${isDark ? 'text-zinc-300' : 'text-stone-700'}`}>
          Customize your visual theme, generate structured research prompts, and manage permanent
          IndexedDB storage.
        </p>
      </div>

      {/* SECTION 0: THEME CUSTOMIZATION */}
      <section className="sharp-box p-6 glass-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 sharp-pill border flex items-center justify-center ${
                isDark
                  ? 'bg-white/10 border-white/20 text-amber-300'
                  : 'bg-amber-100 border-amber-900/15 text-amber-900'
              }`}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`font-display text-base font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-stone-900'
                }`}
              >
                Visual Theme Aesthetic
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-300' : 'text-stone-700'}`}>
                Switch between iOS Translucent Obsidian Black and Warm White & Cream
              </p>
            </div>
          </div>

          <div
            className={`flex items-center p-1 sharp-pill border ${
              isDark ? 'bg-black/60 border-white/15' : 'bg-white border-stone-300'
            }`}
          >
            <button
              onClick={() => {
                if (!isDark) onToggleTheme();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 sharp-pill text-xs font-bold transition uppercase tracking-wider ${
                isDark
                  ? 'bg-white text-black font-extrabold shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Obsidian Black</span>
            </button>

            <button
              onClick={() => {
                if (isDark) onToggleTheme();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 sharp-pill text-xs font-bold transition uppercase tracking-wider ${
                !isDark
                  ? 'bg-stone-900 text-amber-50 font-extrabold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>White & Cream</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 1: PRODUCT RESEARCH PROMPT GENERATOR */}
      <section className="sharp-box p-6 glass-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 sharp-pill border flex items-center justify-center ${
                isDark
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-stone-200 border-stone-300 text-stone-900'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`font-display text-base font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-stone-900'
                }`}
              >
                Spec Research Prompt Builder
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-300' : 'text-stone-700'}`}>
                Generate structured JSON prompts to bulk-import real appliance models
              </p>
            </div>
          </div>

          <button
            onClick={onOpenImportModal}
            className={`flex items-center gap-1.5 px-4 py-2 sharp-pill text-xs font-bold uppercase tracking-wider transition border self-start sm:self-center ${
              isDark
                ? 'bg-white text-black hover:bg-zinc-200 border-white font-extrabold shadow-md'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800 shadow-md'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON Output</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider font-mono ${
                isDark ? 'text-zinc-300' : 'text-stone-700'
              }`}
            >
              Brand
            </label>
            <input
              type="text"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              placeholder="e.g. Morphy Richards, Philips"
              className={`w-full sharp-pill border px-3 py-2 text-xs focus:outline-none font-medium ${
                isDark
                  ? 'bg-black/60 border-white/15 text-white'
                  : 'bg-white border-stone-300 text-stone-900'
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider font-mono ${
                isDark ? 'text-zinc-300' : 'text-stone-700'
              }`}
            >
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full sharp-pill border px-3 py-2 text-xs focus:outline-none font-medium ${
                isDark
                  ? 'bg-black/60 border-white/15 text-white'
                  : 'bg-white border-stone-300 text-stone-900'
              }`}
            >
              <option value="OTG">OTG (Oven Toaster Grill)</option>
              <option value="Digital Air Fryer">Digital Air Fryer</option>
              <option value="Manual Air Fryer">Manual Air Fryer</option>
            </select>
          </div>

          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider font-mono ${
                isDark ? 'text-zinc-300' : 'text-stone-700'
              }`}
            >
              Models (comma-separated)
            </label>
            <input
              type="text"
              value={modelsInput}
              onChange={(e) => setModelsInput(e.target.value)}
              placeholder="e.g. 29 RCAD, 20 RCAD, 60 RCSS"
              className={`w-full sharp-pill border px-3 py-2 text-xs focus:outline-none font-medium ${
                isDark
                  ? 'bg-black/60 border-white/15 text-white'
                  : 'bg-white border-stone-300 text-stone-900'
              }`}
            />
          </div>
        </div>

        {/* Information To Include Checkboxes */}
        <div
          className={`mt-4 pt-3 border-t ${
            isDark ? 'border-white/10' : 'border-stone-200'
          }`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-wider block mb-2 font-mono ${
              isDark ? 'text-zinc-400' : 'text-stone-600'
            }`}
          >
            Information to include in research:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSpecs}
                onChange={(e) => setIncludeSpecs(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Power & Specs</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeDimensions}
                onChange={(e) => setIncludeDimensions(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Dimensions & Space</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCooking}
                onChange={(e) => setIncludeCooking(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Cooking Functions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeAccessories}
                onChange={(e) => setIncludeAccessories(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Accessories</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeRecipes}
                onChange={(e) => setIncludeRecipes(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Food Matches</span>
            </label>
          </div>
        </div>

        {/* Generated Prompt Output Box */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-bold flex items-center gap-1.5 ${
                isDark ? 'text-zinc-200' : 'text-stone-800'
              }`}
            >
              <span>Ready-to-Copy JSON Schema Prompt:</span>
            </span>
            <button
              onClick={handleCopyPrompt}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 sharp-pill text-xs font-bold transition border ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : isDark
                  ? 'bg-white text-black hover:bg-zinc-200 border-white font-extrabold'
                  : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Prompt!' : 'Copy Prompt'}</span>
            </button>
          </div>

          <textarea
            readOnly
            rows={7}
            value={generatedPrompt}
            className={`w-full sharp-box border font-mono text-[11px] p-4 focus:outline-none select-all ${
              isDark
                ? 'bg-black/60 border-white/15 text-zinc-200'
                : 'bg-white border-stone-300 text-stone-800'
            }`}
          />
        </div>
      </section>

      {/* SECTION 2: PERMANENT DATA STORAGE & BACKUPS */}
      <section className="sharp-box p-6 glass-card">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 sharp-pill border flex items-center justify-center ${
              isDark
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-emerald-100 border-emerald-300 text-emerald-900'
            }`}
          >
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2
              className={`font-display text-base font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              Permanent Storage & Backups
            </h2>
            <p className={`text-xs ${isDark ? 'text-zinc-300' : 'text-stone-700'}`}>
              Offline-first IndexedDB database with schema versioning and instant JSON export/import
            </p>
          </div>
        </div>

        {/* Persistence Status Box */}
        <div
          className={`sharp-pill border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark
              ? 'bg-black/50 border-white/12'
              : 'bg-white/85 border-stone-200/90'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                persisted ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <div>
              <div className="text-xs font-bold">
                Browser Storage Mode:{' '}
                <span className={persisted ? 'text-emerald-500' : 'text-amber-500'}>
                  {persisted ? 'Persistent (Eviction Protected)' : 'Standard Storage'}
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                {persisted
                  ? 'Your product records are securely marked for persistent preservation by your browser.'
                  : 'Grant persistence so your catalogue will not be evicted during disk cleanups.'}
              </p>
            </div>
          </div>

          {!persisted && (
            <button
              onClick={handleRequestPersistence}
              disabled={persistenceLoading}
              className={`px-3 py-1.5 sharp-pill text-xs font-semibold border transition shrink-0 self-start sm:self-auto ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  : 'bg-amber-100 hover:bg-amber-200 text-stone-900 border-amber-900/15'
              }`}
            >
              {persistenceLoading ? 'Requesting...' : 'Request Persistent Mode'}
            </button>
          )}
        </div>

        {/* Backup & Restore Controls */}
        <div
          className={`mt-5 pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'border-white/10' : 'border-stone-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportJSON}
              className={`flex items-center gap-2 px-4 py-2 sharp-pill text-xs font-bold uppercase tracking-wider border transition ${
                isDark
                  ? 'bg-white text-black hover:bg-zinc-200 border-white font-extrabold'
                  : 'bg-stone-900 text-amber-50 hover:bg-stone-800 border-stone-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full Catalogue (JSON)</span>
            </button>

            <button
              onClick={onOpenImportModal}
              className={`flex items-center gap-2 px-4 py-2 sharp-pill text-xs font-bold uppercase tracking-wider border transition ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON / Restore</span>
            </button>
          </div>

          <div>
            {!resetConfirming ? (
              <button
                onClick={() => setResetConfirming(true)}
                className="text-xs text-rose-500 hover:underline transition font-semibold"
              >
                Reset to default appliances
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-fadeIn">
                <span className="text-xs text-rose-400 font-bold">Reset catalogue?</span>
                <button
                  onClick={handleResetDefaults}
                  className="px-2.5 py-1 sharp-pill bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setResetConfirming(false)}
                  className="px-2 py-1 text-xs opacity-70 hover:opacity-100"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {resetSuccess && (
          <div className="mt-3 p-3 sharp-pill bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            Database restored to standard demo appliances successfully!
          </div>
        )}
      </section>
    </div>
  );
};
