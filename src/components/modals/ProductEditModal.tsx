import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Product, ApplianceCategory, DataStatus } from '../../types';

interface ProductEditModalProps {
  initialProduct?: Product | null;
  existingProducts: Product[];
  theme?: 'black' | 'cream';
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  initialProduct,
  existingProducts,
  theme = 'black',
  onClose,
  onSave,
}) => {
  const isDark = theme === 'black';
  const isEditing = !!initialProduct;

  const [brand, setBrand] = useState(initialProduct?.brand || '');
  const [model, setModel] = useState(initialProduct?.model || '');
  const [category, setCategory] = useState<ApplianceCategory>(
    initialProduct?.category || 'OTG'
  );
  const [capacityLitres, setCapacityLitres] = useState<number | string>(
    initialProduct?.capacityLitres || 29
  );

  const [widthCm, setWidthCm] = useState<number | string>(
    initialProduct?.dimensions.widthCm || ''
  );
  const [heightCm, setHeightCm] = useState<number | string>(
    initialProduct?.dimensions.heightCm || ''
  );
  const [depthCm, setDepthCm] = useState<number | string>(
    initialProduct?.dimensions.depthCm || ''
  );
  const [weightKg] = useState<number | string>(
    initialProduct?.dimensions.weightKg || ''
  );
  const [ventilationClearanceCm] = useState<number | string>(
    initialProduct?.dimensions.ventilationClearanceCm || 5
  );

  const [powerWatts, setPowerWatts] = useState<number | string>(
    initialProduct?.specifications.powerWatts || ''
  );
  const [temperatureRangeC, setTemperatureRangeC] = useState(
    initialProduct?.specifications.temperatureRangeC || ''
  );
  const [timerMinutes, setTimerMinutes] = useState<number | string>(
    initialProduct?.specifications.timerMinutes || ''
  );
  const [controlType, setControlType] = useState(
    initialProduct?.specifications.controlType || 'Digital'
  );
  const [heatingElements] = useState(
    initialProduct?.specifications.heatingElements || ''
  );
  const [warrantyYears] = useState<number | string>(
    initialProduct?.specifications.warrantyYears || 2
  );
  const [sellingPrice, setSellingPrice] = useState<number | string>(
    initialProduct?.specifications.sellingPrice || ''
  );
  const [mrpPrice] = useState<number | string>(
    initialProduct?.specifications.mrpPrice || ''
  );

  const [featuresText, setFeaturesText] = useState(
    initialProduct?.features.join('\n') || ''
  );
  const [accessoriesText, setAccessoriesText] = useState(
    initialProduct?.includedAccessories.join('\n') || ''
  );
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [dataStatus, setDataStatus] = useState<DataStatus>(
    initialProduct?.dataStatus || 'verified'
  );

  const [imageUrl, setImageUrl] = useState(initialProduct?.images?.[0] || '');
  const [errors, setErrors] = useState<string[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const handleModelChange = (val: string) => {
    setModel(val);
    if (!isEditing && val.trim()) {
      const match = existingProducts.find(
        (p) => p.model.toLowerCase() === val.trim().toLowerCase()
      );
      if (match) {
        setDuplicateWarning(
          `Notice: Model "${val.trim()}" already exists in ${match.brand} catalogue. Saving will update it.`
        );
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!brand.trim()) newErrors.push('Brand name is required');
    if (!model.trim()) newErrors.push('Model name/number is required');
    const cap = parseFloat(String(capacityLitres));
    if (isNaN(cap) || cap <= 0) newErrors.push('Valid capacity in litres is required');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const id =
      initialProduct?.id ||
      `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const productToSave: Product = {
      id,
      brand: brand.trim(),
      model: model.trim(),
      category,
      capacityLitres: cap,
      dimensions: {
        widthCm: widthCm !== '' ? parseFloat(String(widthCm)) : null,
        heightCm: heightCm !== '' ? parseFloat(String(heightCm)) : null,
        depthCm: depthCm !== '' ? parseFloat(String(depthCm)) : null,
        weightKg: weightKg !== '' ? parseFloat(String(weightKg)) : null,
        ventilationClearanceCm:
          ventilationClearanceCm !== ''
            ? parseFloat(String(ventilationClearanceCm))
            : 5,
      },
      specifications: {
        powerWatts: powerWatts !== '' ? parseFloat(String(powerWatts)) : null,
        temperatureRangeC: temperatureRangeC.trim() || null,
        timerMinutes: timerMinutes !== '' ? parseFloat(String(timerMinutes)) : null,
        controlType: controlType.trim() || null,
        heatingElements: heatingElements.trim() || null,
        warrantyYears: warrantyYears !== '' ? parseFloat(String(warrantyYears)) : null,
        mrpPrice: mrpPrice !== '' ? parseFloat(String(mrpPrice)) : null,
        sellingPrice: sellingPrice !== '' ? parseFloat(String(sellingPrice)) : null,
      },
      features: featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      cookingFunctions: initialProduct?.cookingFunctions || [
        'Bake',
        'Grill',
        'Toast',
      ],
      includedAccessories: accessoriesText
        .split('\n')
        .map((a) => a.trim())
        .filter(Boolean),
      optionalAccessories: initialProduct?.optionalAccessories || [],
      images: imageUrl.trim() ? [imageUrl.trim()] : [],
      recipes: initialProduct?.recipes || [],
      dataStatus,
      description: description.trim(),
      isFavorite: initialProduct?.isFavorite ?? false,
      createdAt: initialProduct?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    await onSave(productToSave);
    onClose();
  };

  const inputClass = `w-full sharp-pill border text-xs px-3 py-2 transition focus:outline-none ${
    isDark
      ? 'bg-black/60 border-white/15 text-white focus:border-white/40'
      : 'bg-white border-stone-300 text-stone-900 focus:border-stone-600'
  }`;

  const labelClass = `block font-semibold mb-1 ${
    isDark ? 'text-zinc-300' : 'text-stone-700'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] sharp-box border shadow-2xl flex flex-col overflow-hidden glass-card ${
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
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest block font-mono ${
                isDark ? 'text-amber-200' : 'text-amber-900'
              }`}
            >
              Inventory Management
            </span>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight">
              {isEditing ? `Edit Appliance: ${initialProduct?.model}` : 'Add New Appliance to Catalogue'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 sharp-pill border transition ${
              isDark
                ? 'border-white/15 text-zinc-300 hover:text-white bg-white/10'
                : 'border-stone-300 text-stone-600 hover:text-stone-900 bg-white'
            }`}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {duplicateWarning && (
            <div className="p-3 sharp-pill bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {errors.length > 0 && (
            <div className="p-3 sharp-pill bg-rose-500/15 border border-rose-500/30 text-rose-300 space-y-1">
              {errors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}

          {/* Basic Info */}
          <div>
            <h3
              className={`text-xs font-bold uppercase tracking-wider mb-2 font-mono ${
                isDark ? 'text-amber-200' : 'text-amber-900'
              }`}
            >
              Basic Appliance Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Brand Name *</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Morphy Richards, Philips"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Model Name / Number *</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  placeholder="e.g. 29 RCAD"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ApplianceCategory)}
                  className={inputClass}
                >
                  <option value="OTG">OTG (Oven Toaster Grill)</option>
                  <option value="Digital Air Fryer">Digital Air Fryer</option>
                  <option value="Manual Air Fryer">Manual Air Fryer</option>
                  <option value="Other">Other Cooking Appliance</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Capacity (Litres) *</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="0.5"
                  value={capacityLitres}
                  onChange={(e) => setCapacityLitres(e.target.value)}
                  placeholder="e.g. 29"
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className={`pt-3 border-t ${isDark ? 'border-white/10' : 'border-stone-200'}`}>
            <h3
              className={`text-xs font-bold uppercase tracking-wider mb-2 font-mono ${
                isDark ? 'text-amber-200' : 'text-amber-900'
              }`}
            >
              Technical Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Power (Watts)</label>
                <input
                  type="number"
                  value={powerWatts}
                  onChange={(e) => setPowerWatts(e.target.value)}
                  placeholder="e.g. 1600"
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Temperature Range</label>
                <input
                  type="text"
                  value={temperatureRangeC}
                  onChange={(e) => setTemperatureRangeC(e.target.value)}
                  placeholder="e.g. 100°C - 250°C"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Timer (Minutes)</label>
                <input
                  type="number"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(e.target.value)}
                  placeholder="e.g. 60"
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Control Type</label>
                <input
                  type="text"
                  value={controlType}
                  onChange={(e) => setControlType(e.target.value)}
                  placeholder="e.g. Digital Touch, Dials"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Selling Price (₹)</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="e.g. 8499"
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Data Status</label>
                <select
                  value={dataStatus}
                  onChange={(e) => setDataStatus(e.target.value as DataStatus)}
                  className={inputClass}
                >
                  <option value="verified">Verified Specs</option>
                  <option value="needs_verification">Needs Verification</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dimensions & Space Consumption */}
          <div className={`pt-3 border-t ${isDark ? 'border-white/10' : 'border-stone-200'}`}>
            <h3
              className={`text-xs font-bold uppercase tracking-wider mb-2 font-mono ${
                isDark ? 'text-amber-200' : 'text-amber-900'
              }`}
            >
              Physical Dimensions (cm)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Width (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={widthCm}
                  onChange={(e) => setWidthCm(e.target.value)}
                  placeholder="e.g. 51.5"
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 32.5"
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Depth (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={depthCm}
                  onChange={(e) => setDepthCm(e.target.value)}
                  placeholder="e.g. 38.0"
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
          </div>

          {/* Features & Accessories */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t ${
              isDark ? 'border-white/10' : 'border-stone-200'
            }`}
          >
            <div>
              <label className={labelClass}>Key Features (one per line)</label>
              <textarea
                rows={3}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder="Motorized rotisserie&#10;Turbo convection fan&#10;Illuminated chamber"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Included Accessories (one per line)</label>
              <textarea
                rows={3}
                value={accessoriesText}
                onChange={(e) => setAccessoriesText(e.target.value)}
                placeholder="Baking pan&#10;Grill rack&#10;Crumb tray&#10;Rotisserie rod & forks"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Customer Presentation Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A versatile digital OTG for 4-6 members with motorized rotisserie and convection baking."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Product Image URL (Optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... (or leave empty to use our vector appliance graphic)"
              className={inputClass}
            />
          </div>

          {/* Form Actions */}
          <div
            className={`pt-4 border-t flex items-center justify-end gap-3 ${
              isDark ? 'border-white/10' : 'border-stone-200'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 sharp-pill text-xs font-semibold transition border ${
                isDark
                  ? 'border-white/15 text-zinc-300 hover:text-white bg-white/5'
                  : 'border-stone-300 text-stone-700 hover:text-stone-900 bg-white'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-5 py-2.5 sharp-pill text-xs font-bold transition shadow-md active:scale-95 border ${
                isDark
                  ? 'bg-white hover:bg-zinc-200 text-black border-white font-extrabold'
                  : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Save Changes' : 'Save to Catalogue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
