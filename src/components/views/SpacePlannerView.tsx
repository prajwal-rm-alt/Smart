import React, { useState, useMemo } from 'react';
import {
  Ruler,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  Box,
} from 'lucide-react';
import { Product, DimensionUnit } from '../../types';
import {
  convertUnit,
  calculateFootprint,
  evaluateKitchenFit,
} from '../../utils/calculations';
import { Appliance3DViewer } from '../common/Appliance3DViewer';

interface SpacePlannerViewProps {
  products: Product[];
  selectedProduct?: Product;
  theme: 'black' | 'cream';
}

export const SpacePlannerView: React.FC<SpacePlannerViewProps> = ({
  products,
  selectedProduct: initialSelected,
  theme,
}) => {
  const isDark = theme === 'black';

  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialSelected?.id || products[0]?.id || ''
  );

  const [simulationMode, setSimulationMode] = useState<'3d' | '2d'>('3d');
  const [unit, setUnit] = useState<DimensionUnit>('cm');
  const [kitchenWidth, setKitchenWidth] = useState<number>(65);
  const [kitchenHeight, setKitchenHeight] = useState<number>(45);
  const [kitchenDepth, setKitchenDepth] = useState<number>(50);
  const [hasTopCabinet] = useState<boolean>(true);

  const currentAppliance = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const handleUnitChange = (newUnit: DimensionUnit) => {
    if (newUnit === unit) return;
    setKitchenWidth(convertUnit(kitchenWidth, unit, newUnit));
    setKitchenHeight(convertUnit(kitchenHeight, unit, newUnit));
    setKitchenDepth(convertUnit(kitchenDepth, unit, newUnit));
    setUnit(newUnit);
  };

  const evaluation = useMemo(() => {
    if (!currentAppliance) return null;
    return evaluateKitchenFit(currentAppliance.dimensions, {
      width: kitchenWidth,
      height: kitchenHeight,
      depth: kitchenDepth,
      unit,
      hasTopCabinet,
    });
  }, [currentAppliance, kitchenWidth, kitchenHeight, kitchenDepth, unit, hasTopCabinet]);

  const appDimsInUnit = useMemo(() => {
    if (!currentAppliance) return { w: 0, h: 0, d: 0 };
    return {
      w: convertUnit(currentAppliance.dimensions.widthCm || 0, 'cm', unit),
      h: convertUnit(currentAppliance.dimensions.heightCm || 0, 'cm', unit),
      d: convertUnit(currentAppliance.dimensions.depthCm || 0, 'cm', unit),
    };
  }, [currentAppliance, unit]);

  const svgMetrics = useMemo(() => {
    const kWidthCm = convertUnit(kitchenWidth, unit, 'cm');
    const kHeightCm = convertUnit(kitchenHeight, unit, 'cm');
    const kDepthCm = convertUnit(kitchenDepth, unit, 'cm');
    const aWidthCm = currentAppliance?.dimensions.widthCm || 40;
    const aHeightCm = currentAppliance?.dimensions.heightCm || 30;
    const aDepthCm = currentAppliance?.dimensions.depthCm || 35;

    const maxDimension = Math.max(kWidthCm, kHeightCm, aWidthCm, 60);
    const scale = 220 / maxDimension;

    return {
      kitchenWidthPx: Math.max(kWidthCm * scale, 40),
      kitchenHeightPx: Math.max(kHeightCm * scale, 40),
      kitchenDepthPx: Math.max(kDepthCm * scale, 40),
      appWidthPx: aWidthCm * scale,
      appHeightPx: aHeightCm * scale,
      appDepthPx: aDepthCm * scale,
      kWidthCm,
      kHeightCm,
      kDepthCm,
      aWidthCm,
      aHeightCm,
      aDepthCm,
    };
  }, [kitchenWidth, kitchenHeight, kitchenDepth, unit, currentAppliance]);

  return (
    <div className="space-y-8 pb-24">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 font-mono ${
              isDark ? 'text-amber-200/90' : 'text-amber-900'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Kitchen Space & 3D Calipers</span>
          </div>
          <h1
            className={`font-display text-2xl md:text-4xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}
          >
            Space Planner & 3D Measurements
          </h1>
          <p
            className={`mt-1 text-xs md:text-sm max-w-2xl leading-relaxed ${
              isDark ? 'text-zinc-300' : 'text-stone-700'
            }`}
          >
            Verify counter space with 1:1 true-to-scale 3D models and verified manufacturer dimensions.
            Check door opening arcs, internal rack capacity, and safety ventilation clearance.
          </p>
        </div>

        {/* View Mode Switcher: 3D vs 2D */}
        <div className="flex items-center p-1.5 sharp-box self-start sm:self-center shrink-0 glass-card">
          <button
            onClick={() => setSimulationMode('3d')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 sharp-pill text-xs font-bold uppercase tracking-wider transition ${
              simulationMode === '3d'
                ? isDark
                  ? 'bg-white text-black font-extrabold shadow-md'
                  : 'bg-stone-900 text-amber-50 shadow-md'
                : isDark
                ? 'text-zinc-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Model & Calipers</span>
          </button>
          <button
            onClick={() => setSimulationMode('2d')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 sharp-pill text-xs font-bold uppercase tracking-wider transition ${
              simulationMode === '2d'
                ? isDark
                  ? 'bg-white text-black font-extrabold shadow-md'
                  : 'bg-stone-900 text-amber-50 shadow-md'
                : isDark
                ? 'text-zinc-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D Blueprint</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Appliance & Space Inputs */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Appliance Picker */}
          <div className="sharp-box p-5 glass-card">
            <label
              className={`text-xs font-bold uppercase tracking-wider block mb-2 font-mono ${
                isDark ? 'text-zinc-300' : 'text-stone-700'
              }`}
            >
              1. Select Appliance to Test
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className={`w-full appearance-none sharp-pill border px-4 py-3 text-xs font-semibold focus:outline-none ${
                isDark
                  ? 'bg-black/60 border-white/15 text-white'
                  : 'bg-white border-stone-300 text-stone-900'
              }`}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.model} ({p.capacityLitres}L · {p.category})
                </option>
              ))}
            </select>

            {currentAppliance && (
              <div
                className={`mt-3 p-3.5 sharp-pill border flex items-center justify-between text-xs ${
                  isDark
                    ? 'bg-white/[0.04] border-white/12 text-white'
                    : 'bg-white/85 border-stone-200 text-stone-900'
                }`}
              >
                <div>
                  <span
                    className={`block text-[10px] uppercase tracking-wider font-mono ${
                      isDark ? 'text-zinc-400' : 'text-stone-500'
                    }`}
                  >
                    Verified Dimensions
                  </span>
                  <span className="font-bold font-mono tabular-nums">
                    {appDimsInUnit.w}W × {appDimsInUnit.h}H × {appDimsInUnit.d}D {unit}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`block text-[10px] uppercase tracking-wider font-mono ${
                      isDark ? 'text-zinc-400' : 'text-stone-500'
                    }`}
                  >
                    Counter Area
                  </span>
                  <span
                    className={`font-bold font-mono tabular-nums ${
                      isDark ? 'text-amber-200' : 'text-amber-900'
                    }`}
                  >
                    {calculateFootprint(
                      currentAppliance.dimensions.widthCm,
                      currentAppliance.dimensions.depthCm
                    )}{' '}
                    cm²
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Kitchen Counter Dimensions Form */}
          <div className="sharp-box p-5 glass-card">
            <div className="flex items-center justify-between mb-4">
              <label
                className={`text-xs font-bold uppercase tracking-wider font-mono ${
                  isDark ? 'text-zinc-300' : 'text-stone-700'
                }`}
              >
                2. Enter Kitchen Space
              </label>

              {/* Unit Switcher */}
              <div
                className={`flex items-center p-1 sharp-pill border text-xs ${
                  isDark
                    ? 'bg-black/60 border-white/15'
                    : 'bg-white border-stone-300'
                }`}
              >
                {(['cm', 'mm', 'in', 'ft'] as DimensionUnit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`px-2 py-0.5 sharp-pill font-bold transition ${
                      unit === u
                        ? isDark
                          ? 'bg-white text-black font-extrabold'
                          : 'bg-stone-900 text-white'
                        : isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label
                  className={`block text-[10px] mb-1 font-semibold uppercase font-mono ${
                    isDark ? 'text-zinc-400' : 'text-stone-600'
                  }`}
                >
                  Width ({unit})
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={kitchenWidth}
                  onChange={(e) => setKitchenWidth(parseFloat(e.target.value) || 0)}
                  className={`w-full sharp-pill border px-3 py-2 text-xs font-mono tabular-nums focus:outline-none ${
                    isDark
                      ? 'bg-black/60 border-white/15 text-white'
                      : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-[10px] mb-1 font-semibold uppercase font-mono ${
                    isDark ? 'text-zinc-400' : 'text-stone-600'
                  }`}
                >
                  Height ({unit})
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={kitchenHeight}
                  onChange={(e) => setKitchenHeight(parseFloat(e.target.value) || 0)}
                  className={`w-full sharp-pill border px-3 py-2 text-xs font-mono tabular-nums focus:outline-none ${
                    isDark
                      ? 'bg-black/60 border-white/15 text-white'
                      : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-[10px] mb-1 font-semibold uppercase font-mono ${
                    isDark ? 'text-zinc-400' : 'text-stone-600'
                  }`}
                >
                  Depth ({unit})
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={kitchenDepth}
                  onChange={(e) => setKitchenDepth(parseFloat(e.target.value) || 0)}
                  className={`w-full sharp-pill border px-3 py-2 text-xs font-mono tabular-nums focus:outline-none ${
                    isDark
                      ? 'bg-black/60 border-white/15 text-white'
                      : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div
              className={`mt-4 pt-3 border-t ${
                isDark ? 'border-white/10' : 'border-stone-200'
              }`}
            >
              <span
                className={`text-[10px] uppercase tracking-wider block mb-2 font-semibold font-mono ${
                  isDark ? 'text-zinc-400' : 'text-stone-600'
                }`}
              >
                Counter Presets ({unit}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    setKitchenWidth(convertUnit(60, 'cm', unit));
                    setKitchenHeight(convertUnit(45, 'cm', unit));
                    setKitchenDepth(convertUnit(55, 'cm', unit));
                  }}
                  className={`px-2.5 py-1 sharp-pill border text-[11px] font-medium transition ${
                    isDark
                      ? 'bg-white/5 border-white/15 text-zinc-300 hover:text-white hover:bg-white/10'
                      : 'bg-white border-stone-300 text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Standard (60×45×55cm)
                </button>
                <button
                  onClick={() => {
                    setKitchenWidth(convertUnit(48, 'cm', unit));
                    setKitchenHeight(convertUnit(38, 'cm', unit));
                    setKitchenDepth(convertUnit(40, 'cm', unit));
                  }}
                  className={`px-2.5 py-1 sharp-pill border text-[11px] font-medium transition ${
                    isDark
                      ? 'bg-white/5 border-white/15 text-zinc-300 hover:text-white hover:bg-white/10'
                      : 'bg-white border-stone-300 text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Compact Nook (48×38×40cm)
                </button>
                <button
                  onClick={() => {
                    setKitchenWidth(convertUnit(80, 'cm', unit));
                    setKitchenHeight(convertUnit(60, 'cm', unit));
                    setKitchenDepth(convertUnit(60, 'cm', unit));
                  }}
                  className={`px-2.5 py-1 sharp-pill border text-[11px] font-medium transition ${
                    isDark
                      ? 'bg-white/5 border-white/15 text-zinc-300 hover:text-white hover:bg-white/10'
                      : 'bg-white border-stone-300 text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Spacious Island (80×60×60cm)
                </button>
              </div>
            </div>
          </div>

          {/* Fit Evaluation Summary */}
          {evaluation && (
            <div
              className={`sharp-box border p-5 transition-all duration-300 shadow-2xl ${
                !evaluation.fitsPhysically
                  ? isDark
                    ? 'bg-rose-950/50 border-rose-500/40 text-rose-100'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                  : !evaluation.fitsWithVentilation
                  ? isDark
                    ? 'bg-amber-950/50 border-amber-500/40 text-amber-100'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                  : isDark
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-100'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {!evaluation.fitsPhysically ? (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  ) : !evaluation.fitsWithVentilation ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                </div>

                <div className="flex-1 text-xs">
                  <strong className="block font-bold">
                    {!evaluation.fitsPhysically
                      ? 'Counter cavity is too small'
                      : !evaluation.fitsWithVentilation
                      ? 'Fits physically, but lacks safe breathing clearance'
                      : 'Excellent fit! Appliance accommodates safe cooking airflow'}
                  </strong>
                  <p className="mt-1 opacity-85 leading-relaxed text-[11px]">
                    {!evaluation.fitsPhysically
                      ? 'The model exceeds available boundaries. Please select a larger counter surface.'
                      : !evaluation.fitsWithVentilation
                      ? 'Heat builds up during baking, requiring at least 10 cm clearance around heat vents.'
                      : `Leaves ${evaluation.widthMarginCm} cm width margin and ${evaluation.heightMarginCm} cm overhead clearance for steam and heat ventilation.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 3D Model Simulator OR 2D Blueprint */}
        <div className="lg:col-span-7 space-y-5">
          {simulationMode === '3d' ? (
            <div className="sharp-box overflow-hidden glass-card">
              {/* Three.js Interactive 3D Viewer (with Non-Overlapping Docked Controller) */}
              <Appliance3DViewer
                product={currentAppliance}
                theme={theme}
                className="h-[560px]"
                showControls={true}
              />
            </div>
          ) : (
            /* 2D Scaled Blueprint Simulator */
            <div className="sharp-box p-5 glass-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider font-mono ${
                      isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    Visual 2D Scale Blueprint (Top-Down Counter Plan)
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono ${
                    isDark ? 'text-zinc-300' : 'text-stone-600'
                  }`}
                >
                  Counter: {kitchenWidth}×{kitchenDepth} {unit}
                </span>
              </div>

              <div
                className={`relative w-full h-80 sharp-pill border flex items-center justify-center p-6 overflow-hidden ${
                  isDark
                    ? 'bg-black/75 border-white/15'
                    : 'bg-stone-100 border-stone-300'
                }`}
              >
                <div
                  style={{
                    width: `${Math.min(svgMetrics.kitchenWidthPx, 320)}px`,
                    height: `${Math.min(svgMetrics.kitchenDepthPx, 240)}px`,
                  }}
                  className={`relative sharp-pill border-2 border-dashed flex items-center justify-center transition-all duration-300 ${
                    isDark
                      ? 'border-zinc-500 bg-zinc-900/60'
                      : 'border-stone-400 bg-white/80'
                  }`}
                >
                  <div
                    className={`absolute -top-5 left-2 text-[10px] font-mono ${
                      isDark ? 'text-zinc-400' : 'text-stone-600'
                    }`}
                  >
                    Counter ({svgMetrics.kWidthCm}×{svgMetrics.kDepthCm}cm)
                  </div>

                  <div
                    style={{
                      width: `${Math.min(svgMetrics.appWidthPx + 30, 330)}px`,
                      height: `${Math.min(svgMetrics.appDepthPx + 20, 250)}px`,
                    }}
                    className="absolute sharp-pill bg-emerald-500/15 border border-emerald-500/30 pointer-events-none"
                  />

                  <div
                    style={{
                      width: `${svgMetrics.appWidthPx}px`,
                      height: `${svgMetrics.appDepthPx}px`,
                    }}
                    className={`relative sharp-pill shadow-xl flex flex-col items-center justify-center transition-all duration-300 text-center p-2 border-2 ${
                      !evaluation?.fitsPhysically
                        ? 'bg-rose-950/90 border-rose-500 text-white'
                        : !evaluation?.fitsWithVentilation
                        ? 'bg-amber-950/90 border-amber-500 text-white'
                        : isDark
                        ? 'bg-zinc-900 border-white/40 text-white'
                        : 'bg-stone-900 border-stone-700 text-white'
                    }`}
                  >
                    <span className="font-display text-xs font-bold tracking-tight truncate max-w-full text-white">
                      {currentAppliance?.model}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-300">
                      {svgMetrics.aWidthCm}×{svgMetrics.aDepthCm}cm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
