import React from 'react';
import { X, Scale, Check, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { ApplianceGraphic } from '../common/ApplianceGraphic';
import { calculateFootprint } from '../../utils/calculations';

interface CompareModalProps {
  productsToCompare: Product[];
  allProducts: Product[];
  theme?: 'black' | 'cream';
  onClose: () => void;
  onRemoveFromCompare: (id: string) => void;
  onAddAnotherToCompare: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  productsToCompare,
  allProducts,
  theme = 'black',
  onClose,
  onRemoveFromCompare,
  onAddAnotherToCompare,
}) => {
  const isDark = theme === 'black';

  const availableToAdd = allProducts.filter(
    (p) => !productsToCompare.some((c) => c.id === p.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-fadeIn">
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] sharp-box border shadow-2xl flex flex-col overflow-hidden glass-card ${
          isDark
            ? 'border-white/20 text-white'
            : 'border-stone-300 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 backdrop-blur-2xl ${
            isDark
              ? 'bg-black/60 border-white/15'
              : 'bg-white/80 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 sharp-pill flex items-center justify-center border ${
                isDark
                  ? 'bg-white/10 border-white/20 text-amber-200'
                  : 'bg-amber-100 border-amber-900/20 text-amber-900'
              }`}
            >
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest block font-mono ${
                  isDark ? 'text-amber-200' : 'text-amber-900'
                }`}
              >
                Appliance Matrix
              </span>
              <h2 className="font-display text-lg font-bold tracking-tight">
                Side-by-Side Model Comparison
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 sharp-pill border transition ${
              isDark
                ? 'border-white/15 text-zinc-300 hover:text-white bg-white/10'
                : 'border-stone-300 text-stone-600 hover:text-stone-900 bg-white'
            }`}
            aria-label="Close comparison"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Matrix */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          {productsToCompare.length === 0 ? (
            <div className="py-12 text-center opacity-70">
              <p className="font-display text-base">No appliances selected for comparison.</p>
              <p className="text-xs mt-1">
                Select 2 or 3 models from the catalogue or presentation mode to compare.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th
                      className={`p-3 text-left font-semibold w-36 sm:w-44 sticky left-0 z-10 border-b ${
                        isDark
                          ? 'bg-[#08080a] text-zinc-400 border-white/15'
                          : 'bg-[#f6f2e9] text-stone-600 border-stone-300'
                      }`}
                    >
                      Specification
                    </th>
                    {productsToCompare.map((prod) => (
                      <th
                        key={prod.id}
                        className={`p-3 text-left border-b min-w-[200px] ${
                          isDark ? 'border-white/15' : 'border-stone-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider font-mono ${
                              isDark ? 'text-amber-200' : 'text-amber-900'
                            }`}
                          >
                            {prod.brand}
                          </span>
                          <button
                            onClick={() => onRemoveFromCompare(prod.id)}
                            className="p-1 sharp-pill opacity-60 hover:opacity-100 hover:text-rose-400 transition"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-display text-sm font-bold line-clamp-1">
                          {prod.model}
                        </h4>
                        <div className="mt-2">
                          <ApplianceGraphic
                            category={prod.category}
                            model={prod.model}
                            brand={prod.brand}
                            imageUrl={prod.images?.[0]}
                            capacityLitres={prod.capacityLitres}
                            powerWatts={prod.specifications.powerWatts}
                            className="w-full h-32"
                          />
                        </div>
                      </th>
                    ))}
                    {productsToCompare.length < 3 && availableToAdd.length > 0 && (
                      <th
                        className={`p-3 text-left border-b min-w-[180px] align-middle text-center ${
                          isDark ? 'border-white/15' : 'border-stone-300'
                        }`}
                      >
                        <span className="text-xs opacity-70 block mb-2 font-medium">
                          Add 3rd Appliance:
                        </span>
                        <select
                          onChange={(e) => {
                            const found = allProducts.find((p) => p.id === e.target.value);
                            if (found) onAddAnotherToCompare(found);
                          }}
                          defaultValue=""
                          className={`w-full sharp-pill border text-xs px-3 py-2 focus:outline-none ${
                            isDark
                              ? 'bg-black/70 border-white/15 text-white'
                              : 'bg-white border-stone-300 text-stone-900'
                          }`}
                        >
                          <option value="" disabled>
                            Select Model...
                          </option>
                          {availableToAdd.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.brand} {p.model} ({p.capacityLitres}L)
                            </option>
                          ))}
                        </select>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark ? 'divide-white/10' : 'divide-stone-200'
                  }`}
                >
                  <tr>
                    <td
                      className={`p-3 font-medium sticky left-0 z-10 ${
                        isDark ? 'bg-[#08080a] text-zinc-400' : 'bg-[#f6f2e9] text-stone-600'
                      }`}
                    >
                      Category
                    </td>
                    {productsToCompare.map((p) => (
                      <td key={p.id} className="p-3 font-medium">
                        {p.category}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td
                      className={`p-3 font-medium sticky left-0 z-10 ${
                        isDark ? 'bg-[#08080a] text-zinc-400' : 'bg-[#f6f2e9] text-stone-600'
                      }`}
                    >
                      Capacity
                    </td>
                    {productsToCompare.map((p) => (
                      <td
                        key={p.id}
                        className={`p-3 font-bold font-mono tabular-nums text-sm ${
                          isDark ? 'text-amber-200' : 'text-amber-900'
                        }`}
                      >
                        {p.capacityLitres} Litres
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td
                      className={`p-3 font-medium sticky left-0 z-10 ${
                        isDark ? 'bg-[#08080a] text-zinc-400' : 'bg-[#f6f2e9] text-stone-600'
                      }`}
                    >
                      Power Rating
                    </td>
                    {productsToCompare.map((p) => (
                      <td key={p.id} className="p-3 font-mono tabular-nums">
                        {p.specifications.powerWatts ? `${p.specifications.powerWatts}W` : 'Optimal'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td
                      className={`p-3 font-medium sticky left-0 z-10 ${
                        isDark ? 'bg-[#08080a] text-zinc-400' : 'bg-[#f6f2e9] text-stone-600'
                      }`}
                    >
                      Dimensions (W×H×D)
                    </td>
                    {productsToCompare.map((p) => (
                      <td key={p.id} className="p-3 font-mono tabular-nums">
                        {p.dimensions.widthCm && p.dimensions.heightCm && p.dimensions.depthCm
                          ? `${p.dimensions.widthCm}×${p.dimensions.heightCm}×${p.dimensions.depthCm} cm`
                          : 'Standard'}
                        <div className="text-[11px] opacity-60 mt-0.5">
                          Footprint: {calculateFootprint(p.dimensions.widthCm, p.dimensions.depthCm)} cm²
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td
                      className={`p-3 font-medium sticky left-0 z-10 ${
                        isDark ? 'bg-[#08080a] text-zinc-400' : 'bg-[#f6f2e9] text-stone-600'
                      }`}
                    >
                      Temperature Range
                    </td>
                    {productsToCompare.map((p) => (
                      <td key={p.id} className="p-3 font-mono">
                        {p.specifications.temperatureRangeC || 'Variable'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td
                      className={`p-3 font-medium sticky left-0 z-10 ${
                        isDark ? 'bg-[#08080a] text-zinc-400' : 'bg-[#f6f2e9] text-stone-600'
                      }`}
                    >
                      Timer Range
                    </td>
                    {productsToCompare.map((p) => (
                      <td key={p.id} className="p-3 font-mono">
                        {p.specifications.timerMinutes ? `${p.specifications.timerMinutes} mins` : 'Standard'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td
                      className={`p-3 font-medium sticky left-0 z-10 ${
                        isDark ? 'bg-[#08080a] text-zinc-400' : 'bg-[#f6f2e9] text-stone-600'
                      }`}
                    >
                      Controls
                    </td>
                    {productsToCompare.map((p) => (
                      <td key={p.id} className="p-3">
                        {p.specifications.controlType || 'Digital / Dial'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td
                      className={`p-3 font-medium sticky left-0 z-10 ${
                        isDark ? 'bg-[#08080a] text-zinc-400' : 'bg-[#f6f2e9] text-stone-600'
                      }`}
                    >
                      Included Accessories
                    </td>
                    {productsToCompare.map((p) => (
                      <td key={p.id} className="p-3">
                        <ul className="space-y-1">
                          {p.includedAccessories?.slice(0, 4).map((acc, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-[11px]">
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{acc}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td
                      className={`p-3 font-medium sticky left-0 z-10 ${
                        isDark ? 'bg-[#08080a] text-zinc-400' : 'bg-[#f6f2e9] text-stone-600'
                      }`}
                    >
                      Selling Price
                    </td>
                    {productsToCompare.map((p) => (
                      <td key={p.id} className="p-3 font-bold font-mono tabular-nums text-sm">
                        {p.specifications.sellingPrice ? (
                          <span className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>
                            ₹{p.specifications.sellingPrice.toLocaleString()}
                          </span>
                        ) : (
                          'Inquire'
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 sm:p-5 border-t flex items-center justify-end shrink-0 backdrop-blur-2xl ${
            isDark
              ? 'bg-black/60 border-white/15'
              : 'bg-white/80 border-stone-200'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-5 py-2.5 sharp-pill text-xs font-bold transition border ${
              isDark
                ? 'bg-white text-black hover:bg-zinc-200 border-white font-extrabold'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800 shadow-md'
            }`}
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
