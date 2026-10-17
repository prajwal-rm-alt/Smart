import React, { useState } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCode,
} from 'lucide-react';
import { BulkImportReport } from '../../types';
import { validateAndParseProductJSON, applyBulkImport } from '../../services/storage';

interface BulkImportModalProps {
  theme?: 'black' | 'cream';
  onClose: () => void;
  onImportComplete: () => Promise<void>;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  theme = 'black',
  onClose,
  onImportComplete,
}) => {
  const isDark = theme === 'black';
  const [jsonInput, setJsonInput] = useState('');
  const [report, setReport] = useState<BulkImportReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const sampleOTGJSON = `{
  "schemaVersion": 1,
  "products": [
    {
      "id": "morphy-richards-60-rcss",
      "brand": "Morphy Richards",
      "model": "60 RCSS",
      "category": "OTG",
      "capacityLitres": 60,
      "dimensions": {
        "widthCm": 62.0,
        "heightCm": 41.5,
        "depthCm": 47.0,
        "weightKg": 13.5,
        "ventilationClearanceCm": 10.0
      },
      "specifications": {
        "powerWatts": 2000,
        "temperatureRangeC": "100°C - 250°C",
        "timerMinutes": 120,
        "controlType": "Stainless Steel Dials",
        "heatingElements": "Stainless Steel 4-element system with convection fan",
        "warrantyYears": 2,
        "mrpPrice": 18995,
        "sellingPrice": 13999
      },
      "features": [
        "Jumbo 60-litre capacity ideal for banquet roasts and party pizzas",
        "Dual convection airflow for even roasting across multiple baking tiers",
        "Keep Warm mode preserves food up to 120 minutes without overcooking"
      ],
      "cookingFunctions": ["Bake", "Grill", "Toast", "Rotisserie", "Convection"],
      "includedAccessories": [
        "Heavy-duty enamel baking pan",
        "2x Wire grill racks",
        "Crumb tray",
        "Rotisserie rod set with forks",
        "Tong handles"
      ],
      "dataStatus": "verified",
      "description": "Morphy Richards flagship 60L giant OTG engineered for catering, home bakeries, and large feast roasts."
    }
  ]
}`;

  const sampleAirFryerJSON = `{
  "schemaVersion": 1,
  "products": [
    {
      "id": "philips-hd9650-96-xxl",
      "brand": "Philips",
      "model": "HD9650/96 Airfryer XXL",
      "category": "Digital Air Fryer",
      "capacityLitres": 7.3,
      "dimensions": {
        "widthCm": 32.2,
        "heightCm": 31.6,
        "depthCm": 43.3,
        "weightKg": 7.9,
        "ventilationClearanceCm": 10.0
      },
      "specifications": {
        "powerWatts": 2225,
        "temperatureRangeC": "40°C - 200°C",
        "timerMinutes": 60,
        "controlType": "Digital QuickControl Dial",
        "heatingElements": "Twin TurboStar Fat Removal Technology",
        "warrantyYears": 2,
        "mrpPrice": 24995,
        "sellingPrice": 18499
      },
      "features": [
        "Twin TurboStar technology extracts and captures excess fat",
        "Family size XXL capacity fits a whole chicken or 1.4kg of fries",
        "5 preset cooking programs with instant Keep Warm feature"
      ],
      "cookingFunctions": ["Air Fry", "Bake", "Grill", "Roast", "Reheat", "Dehydrate"],
      "includedAccessories": [
        "QuickClean non-stick basket",
        "Removable mesh insert",
        "Fat reducer collector plate"
      ],
      "dataStatus": "verified",
      "description": "Philips premier XXL digital airfryer engineered to fry with little to no added oil."
    }
  ]
}`;

  const handleValidate = async () => {
    setIsValidating(true);
    setSuccessCount(null);
    try {
      const rep = await validateAndParseProductJSON(jsonInput);
      setReport(rep);
    } catch (err) {
      console.warn('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!report || report.validProducts.length === 0) return;
    setIsApplying(true);
    try {
      const count = await applyBulkImport(report.validProducts);
      setSuccessCount(count);
      await onImportComplete();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.warn('Import error:', err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-fadeIn">
      <div
        className={`relative w-full max-w-3xl max-h-[92vh] sharp-box border shadow-2xl flex flex-col overflow-hidden glass-card ${
          isDark
            ? 'border-white/20 text-white'
            : 'border-stone-300 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 backdrop-blur-2xl ${
            isDark ? 'border-white/15 bg-black/60' : 'border-stone-200 bg-white/80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 sharp-pill border flex items-center justify-center ${
                isDark
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-stone-900 text-amber-50 border-stone-800'
              }`}
            >
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold tracking-tight">
                Import Products Using JSON
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                Paste JSON generated by AI or backups to import multiple models at once
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 sharp-pill border transition ${
              isDark
                ? 'border-white/15 text-zinc-300 hover:text-white bg-white/10'
                : 'border-stone-300 text-stone-600 hover:text-stone-950 bg-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Quick Load Sample Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider font-mono ${
                isDark ? 'text-zinc-400' : 'text-stone-600'
              }`}
            >
              Paste or Load Template:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setJsonInput(sampleOTGJSON);
                  setReport(null);
                }}
                className={`px-3 py-1 sharp-pill border text-[11px] font-semibold transition ${
                  isDark
                    ? 'bg-white/10 border-white/15 text-amber-200 hover:bg-white/20'
                    : 'bg-amber-100 border-amber-900/15 text-stone-900 hover:bg-amber-200'
                }`}
              >
                + Load Sample OTG JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  setJsonInput(sampleAirFryerJSON);
                  setReport(null);
                }}
                className={`px-3 py-1 sharp-pill border text-[11px] font-semibold transition ${
                  isDark
                    ? 'bg-white/10 border-white/15 text-zinc-200 hover:bg-white/20'
                    : 'bg-stone-200 border-stone-300 text-stone-900 hover:bg-stone-300'
                }`}
              >
                + Load Sample Air Fryer JSON
              </button>
            </div>
          </div>

          {/* JSON Textarea */}
          <textarea
            rows={8}
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setReport(null);
            }}
            placeholder='Paste JSON here (e.g. {"schemaVersion": 1, "products": [...]})'
            className={`w-full border font-mono text-xs sharp-box p-4 focus:outline-none leading-relaxed ${
              isDark
                ? 'bg-black/60 border-white/15 text-zinc-200 focus:border-white/40'
                : 'bg-white border-stone-300 text-stone-800 focus:border-stone-600'
            }`}
          />

          {/* Validate Action */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleValidate}
              disabled={isValidating || !jsonInput.trim()}
              className={`flex items-center gap-1.5 px-4 py-2 sharp-pill text-xs font-bold border disabled:opacity-50 transition ${
                isDark
                  ? 'bg-white text-black hover:bg-zinc-200 border-white font-extrabold'
                  : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{isValidating ? 'Validating...' : 'Validate JSON & Preview'}</span>
            </button>

            {report && (
              <span className={`text-xs ${isDark ? 'text-zinc-300' : 'text-stone-700'}`}>
                Found <strong>{report.totalFound}</strong> records ·{' '}
                <strong>{report.validProducts.length}</strong> valid
              </span>
            )}
          </div>

          {/* Validation & Preview Report */}
          {report && (
            <div className="space-y-3 pt-2">
              {report.errors.length > 0 && (
                <div className="p-3.5 sharp-pill bg-rose-500/20 border border-rose-500/30 text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Schema Validation Errors ({report.errors.length}):</span>
                  </div>
                  {report.errors.map((err, i) => (
                    <div key={i} className="pl-5 text-[11px]">
                      • {err}
                    </div>
                  ))}
                </div>
              )}

              {report.warnings.length > 0 && (
                <div className="p-3.5 sharp-pill bg-amber-500/20 border border-amber-500/30 text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Existing Catalogue Updates ({report.warnings.length}):</span>
                  </div>
                  {report.warnings.map((w, i) => (
                    <div key={i} className="pl-5 text-[11px]">
                      • {w}
                    </div>
                  ))}
                </div>
              )}

              {report.validProducts.length > 0 && (
                <div
                  className={`sharp-box border p-4 space-y-2 ${
                    isDark
                      ? 'bg-black/60 border-white/15'
                      : 'bg-white/90 border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ready to Import ({report.validProducts.length} Models):</span>
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                      {report.addedCount} new · {report.updatedCount} updates
                    </span>
                  </div>

                  <div
                    className={`divide-y max-h-48 overflow-y-auto pr-1 ${
                      isDark ? 'divide-white/10' : 'divide-stone-200'
                    }`}
                  >
                    {report.validProducts.map((p, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <strong>
                            {p.brand} {p.model}
                          </strong>
                          <span className={`ml-2 ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                            ({p.capacityLitres}L · {p.category})
                          </span>
                        </div>
                        <span
                          className={`font-mono text-[11px] ${
                            isDark ? 'text-amber-200' : 'text-amber-900'
                          }`}
                        >
                          {p.specifications.powerWatts ? `${p.specifications.powerWatts}W` : 'Specs ok'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {successCount !== null && (
            <div className="p-4 sharp-pill bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>
                Successfully saved {successCount} appliance records permanently to IndexedDB!
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 sm:p-5 border-t flex items-center justify-end gap-3 shrink-0 backdrop-blur-2xl ${
            isDark ? 'border-white/15 bg-black/60' : 'border-stone-200 bg-white/80'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 sharp-pill text-xs font-semibold border transition ${
              isDark
                ? 'border-white/15 text-zinc-300 hover:text-white bg-white/5'
                : 'border-stone-300 text-stone-700 hover:text-stone-900 bg-white'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!report || report.validProducts.length === 0 || isApplying}
            className={`flex items-center gap-1.5 px-5 py-2.5 sharp-pill text-xs font-bold border disabled:opacity-40 shadow-md transition ${
              isDark
                ? 'bg-white hover:bg-zinc-200 text-black border-white font-extrabold'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {isApplying
                ? 'Saving to IndexedDB...'
                : `Confirm & Import ${report?.validProducts.length || ''} Models`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
