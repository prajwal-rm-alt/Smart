import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  X,
  Trash2,
  Tag,
  Upload,
  Check,
  Camera,
} from 'lucide-react';
import { FoodGalleryItem, Product } from '../../types';

interface RecipeGalleryViewProps {
  recipes: FoodGalleryItem[];
  products: Product[];
  theme: 'black' | 'cream';
  onSelectRecipe?: (item: FoodGalleryItem) => void;
  onOpenAddRecipeModal?: () => void;
  onSaveFoodItem?: (item: FoodGalleryItem) => Promise<void>;
  onDeleteFoodItem?: (id: string) => Promise<void>;
}

const FOOD_EMOJIS = [
  '🍟', '🍞', '🥜', '🥖', '🥯', '🥐', '🍕', '🍔', '🌭', '🥨',
  '🥪', '🍛', '🦪', '🍣', '🍤', '🥟', '🍥', '🍡', '🍱', '🍿',
  '🍯', '🍪', '🍩', '🍫',
];

export const RecipeGalleryView: React.FC<RecipeGalleryViewProps> = ({
  recipes,
  products,
  theme,
  onSaveFoodItem,
  onDeleteFoodItem,
}) => {
  const isDark = theme === 'black';

  // Filter by Appliance Model (Click model to show its food images only)
  const [selectedModelId, setSelectedModelId] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'OTG' | 'Air Fryer'>('All');

  // Add / Edit Image & Model Tags Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodGalleryItem | null>(null);

  // Form state (Image + Tagged Models ONLY — no text details required!)
  const [selectedEmoji, setSelectedEmoji] = useState('🍟');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTaggedModels, setSelectedTaggedModels] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickUploadInputRef = useRef<HTMLInputElement>(null);
  const [quickUploadTargetItem, setQuickUploadTargetItem] = useState<FoodGalleryItem | null>(null);

  // Open modal to add new image slot
  const handleOpenAdd = () => {
    setEditingItem(null);
    setSelectedEmoji(FOOD_EMOJIS[recipes.length % FOOD_EMOJIS.length] || '🍟');
    setImageUrl('');
    setSelectedTaggedModels(
      selectedModelId !== 'All' ? [selectedModelId] : products[0] ? [products[0].id] : []
    );
    setIsAddModalOpen(true);
  };

  // Open modal to edit image or model tags of an existing tile
  const handleOpenEditTile = (item: FoodGalleryItem) => {
    setEditingItem(item);
    setSelectedEmoji(item.emoji || '🍟');
    setImageUrl(item.imageUrl || '');
    setSelectedTaggedModels(item.taggedModelIds || []);
    setIsAddModalOpen(true);
  };

  // Handle local image file upload (converts to base64 for permanent IndexedDB storage)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle 1-click direct photo upload on any existing tile
  const handleQuickTileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quickUploadTargetItem) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string' && onSaveFoodItem) {
        await onSaveFoodItem({
          ...quickUploadTargetItem,
          imageUrl: reader.result,
        });
        setQuickUploadTargetItem(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleModelTag = (modelId: string) => {
    setSelectedTaggedModels((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    );
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const modelsToSave =
      selectedTaggedModels.length > 0
        ? selectedTaggedModels
        : products[0]
        ? [products[0].id]
        : [];

    // Automatically infer category from tagged models
    const taggedProds = products.filter((p) => modelsToSave.includes(p.id));
    const hasOTG = taggedProds.some((p) => p.category === 'OTG');
    const hasAF = taggedProds.some((p) => p.category !== 'OTG');
    const inferredCategory: 'OTG' | 'Air Fryer' | 'Both' =
      hasOTG && hasAF ? 'Both' : hasOTG ? 'OTG' : 'Air Fryer';

    const itemToSave: FoodGalleryItem = {
      id: editingItem ? editingItem.id : `food-${Date.now()}`,
      title: editingItem?.title || selectedEmoji,
      emoji: selectedEmoji,
      imageUrl: imageUrl.trim(),
      taggedModelIds: modelsToSave,
      taggedCategory: inferredCategory,
      createdAt: editingItem?.createdAt || Date.now(),
    };

    if (onSaveFoodItem) {
      await onSaveFoodItem(itemToSave);
    }
    setIsAddModalOpen(false);
    setEditingItem(null);
    setImageUrl('');
  };

  // Filtered Food Images based on selected Appliance Model & Category
  const filteredItems = useMemo(() => {
    return recipes.filter((item) => {
      if (selectedModelId !== 'All') {
        if (!item.taggedModelIds?.includes(selectedModelId)) {
          return false;
        }
      }
      if (selectedCategory !== 'All') {
        if (item.taggedCategory !== selectedCategory && item.taggedCategory !== 'Both') {
          return false;
        }
      }
      return true;
    });
  }, [recipes, selectedModelId, selectedCategory]);

  const getModelShortLabel = (id: string) => {
    const p = products.find((prod) => prod.id === id);
    return p ? p.model : id;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hidden input for 1-click photo upload on any card */}
      <input
        ref={quickUploadInputRef}
        type="file"
        accept="image/*"
        onChange={handleQuickTileUpload}
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span
            className={`text-xs font-bold uppercase tracking-widest block mb-1 font-mono ${
              isDark ? 'text-amber-200/90' : 'text-amber-900'
            }`}
          >
            Visual Food Gallery
          </span>
          <h1
            className={`font-display text-2xl md:text-4xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}
          >
            Food Image Gallery
          </h1>
          <p className={`mt-1 text-xs md:text-sm ${isDark ? 'text-zinc-300' : 'text-stone-700'}`}>
            Select an appliance model below to filter food images. Upload photos anytime or tag models directly.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className={`flex items-center gap-2 px-5 py-2.5 sharp-pill text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border self-start sm:self-center ${
            isDark
              ? 'bg-white text-black hover:bg-zinc-200 border-white font-extrabold shadow-xl'
              : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800 shadow-md'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Food Image</span>
        </button>
      </div>

      {/* MODEL SELECTOR BAR: Just select the model to show its food images! */}
      <div className="p-4 sharp-box glass-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Tag className={`w-4 h-4 ${isDark ? 'text-amber-300' : 'text-amber-800'}`} />
            <span
              className={`text-xs font-bold uppercase tracking-wider font-mono ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              Select Appliance Model to Filter Images:
            </span>
          </div>

          {/* Category Quick Filter */}
          <div
            className={`flex items-center p-1 sharp-pill border text-xs ${
              isDark ? 'bg-black/60 border-white/15' : 'bg-white/80 border-stone-300'
            }`}
          >
            {(['All', 'OTG', 'Air Fryer'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 sharp-pill text-[11px] font-bold transition uppercase tracking-wider ${
                  selectedCategory === cat
                    ? isDark
                      ? 'bg-white text-black font-extrabold'
                      : 'bg-stone-900 text-amber-50'
                    : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Selectable Appliance Model Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedModelId('All')}
            className={`px-3.5 py-2 sharp-pill text-xs font-bold whitespace-nowrap transition border ${
              selectedModelId === 'All'
                ? isDark
                  ? 'bg-white text-black font-extrabold border-white shadow-md'
                  : 'bg-stone-900 text-amber-50 border-stone-800 shadow-md'
                : isDark
                ? 'bg-white/[0.06] text-zinc-300 border-white/15 hover:text-white hover:bg-white/12'
                : 'bg-white/80 text-stone-700 border-stone-300 hover:text-stone-950'
            }`}
          >
            All Models ({recipes.length})
          </button>

          {products
            .filter((p) => {
              if (selectedCategory === 'OTG') return p.category === 'OTG';
              if (selectedCategory === 'Air Fryer') return p.category !== 'OTG';
              return true;
            })
            .map((p) => {
              const count = recipes.filter((r) => r.taggedModelIds?.includes(p.id)).length;
              const isSelected = selectedModelId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedModelId(isSelected ? 'All' : p.id)}
                  className={`px-3.5 py-2 sharp-pill text-xs font-semibold whitespace-nowrap transition border flex items-center gap-1.5 ${
                    isSelected
                      ? isDark
                        ? 'bg-white text-black font-extrabold border-white shadow-md'
                        : 'bg-stone-900 text-amber-50 border-stone-800 shadow-md'
                      : isDark
                      ? 'bg-white/[0.06] text-zinc-300 border-white/15 hover:text-white hover:bg-white/12'
                      : 'bg-white/80 text-stone-700 border-stone-300 hover:text-stone-950'
                  }`}
                >
                  <span>{p.model}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 sharp-pill font-mono ${
                      isSelected
                        ? isDark
                          ? 'bg-black/15 text-black'
                          : 'bg-white/20 text-white'
                        : isDark
                        ? 'bg-white/10 text-zinc-300'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* PURE VISUAL IMAGE-ONLY GALLERY GRID (No text details clutter) */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenEditTile(item)}
              className="group relative aspect-square cursor-pointer sharp-box overflow-hidden glass-card glass-card-hover flex items-center justify-center"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt="Food creation"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center select-none">
                  <span className="text-6xl sm:text-7xl transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                    {item.emoji || '🍟'}
                  </span>
                </div>
              )}

              {/* Subtle Top-Right Action Buttons on Hover: Upload Photo Later or Delete */}
              <div
                className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setQuickUploadTargetItem(item);
                    quickUploadInputRef.current?.click();
                  }}
                  className="p-2 sharp-pill bg-black/75 hover:bg-black text-white border border-white/25 backdrop-blur-md shadow-lg"
                  title="Upload / Replace Food Photo"
                  aria-label="Upload Food Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>

                {onDeleteFoodItem && (
                  <button
                    type="button"
                    onClick={() => onDeleteFoodItem(item.id)}
                    className="p-2 sharp-pill bg-black/75 hover:bg-rose-600 text-white border border-white/25 backdrop-blur-md shadow-lg transition"
                    title="Delete Image"
                    aria-label="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Bottom Overlay: Tagged Appliance Model Chips Only */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap items-center gap-1 pointer-events-none">
                {item.taggedModelIds?.slice(0, 2).map((mId) => (
                  <span
                    key={mId}
                    className="text-[10px] px-2 py-0.5 sharp-pill font-mono font-bold bg-black/70 text-white border border-white/20 backdrop-blur-md truncate max-w-[110px]"
                  >
                    {getModelShortLabel(mId)}
                  </span>
                ))}
                {item.taggedModelIds && item.taggedModelIds.length > 2 && (
                  <span className="text-[10px] px-1.5 py-0.5 sharp-pill font-mono font-bold bg-black/70 text-amber-200 border border-white/20 backdrop-blur-md">
                    +{item.taggedModelIds.length - 2}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center sharp-box p-8 glass-card">
          <div className="text-5xl mb-3">🍟</div>
          <h3
            className={`font-display text-base font-bold ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}
          >
            No food images tagged for this model yet
          </h3>
          <div className="mt-4 flex items-center justify-center gap-3">
            {selectedModelId !== 'All' && (
              <button
                onClick={() => setSelectedModelId('All')}
                className={`px-4 py-2 sharp-pill text-xs font-semibold border transition ${
                  isDark
                    ? 'border-white/20 text-white hover:bg-white/10'
                    : 'border-stone-300 text-stone-800 hover:bg-stone-200/60'
                }`}
              >
                Show All Images
              </button>
            )}
            <button
              onClick={handleOpenAdd}
              className={`px-4 py-2 sharp-pill text-xs font-bold border transition ${
                isDark
                  ? 'bg-white text-black border-white'
                  : 'bg-stone-900 text-amber-50 border-stone-800'
              }`}
            >
              + Add Food Image
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD / TAG FOOD IMAGE (NO TEXT DETAILS REQUIRED!) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fadeIn">
          <div
            className={`relative w-full max-w-lg max-h-[90vh] sharp-box border shadow-2xl flex flex-col overflow-hidden glass-card ${
              isDark ? 'border-white/20 text-white' : 'border-stone-300 text-stone-900'
            }`}
          >
            <div
              className={`p-4 sm:p-5 border-b flex items-center justify-between ${
                isDark ? 'bg-black/60 border-white/15' : 'bg-white/80 border-stone-200'
              }`}
            >
              <h2 className="font-display text-base font-bold tracking-tight">
                {editingItem ? 'Update Food Image & Model Tags' : 'Add Food Image & Tag Models'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className={`p-1.5 sharp-pill border transition ${
                  isDark
                    ? 'border-white/15 text-zinc-300 hover:text-white bg-white/10'
                    : 'border-stone-300 text-stone-600 hover:text-stone-900 bg-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
              {/* Step 1: Upload Photo (or pick food icon placeholder for now) */}
              <div>
                <label
                  className={`block font-bold uppercase tracking-wider text-[11px] mb-2 font-mono ${
                    isDark ? 'text-zinc-300' : 'text-stone-700'
                  }`}
                >
                  1. Food Image (Upload now or pick icon to add photo later)
                </label>

                <div className="flex items-center gap-3 mb-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-24 h-24 sharp-box border-2 border-dashed flex flex-col items-center justify-center cursor-pointer shrink-0 overflow-hidden transition ${
                      isDark
                        ? 'border-white/25 hover:border-white/50 bg-black/50'
                        : 'border-stone-300 hover:border-stone-500 bg-white/80'
                    }`}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{selectedEmoji}</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full py-2.5 px-3 sharp-pill border font-bold flex items-center justify-center gap-2 transition ${
                        isDark
                          ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                          : 'bg-white hover:bg-stone-100 text-stone-900 border-stone-300 shadow-sm'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{imageUrl ? 'Change Uploaded Photo' : 'Upload Food Photo'}</span>
                    </button>

                    <input
                      type="url"
                      value={imageUrl.startsWith('data:') ? '' : imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste image URL (optional)..."
                      className={`w-full sharp-pill border px-3 py-1.5 text-xs focus:outline-none ${
                        isDark
                          ? 'bg-black/60 border-white/15 text-white placeholder-zinc-500'
                          : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Quick Food Icon Placeholders (when adding image later) */}
                <div className="grid grid-cols-8 gap-1.5 pt-1">
                  {FOOD_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setSelectedEmoji(em);
                        setImageUrl('');
                      }}
                      className={`py-1.5 sharp-pill text-lg flex items-center justify-center border transition ${
                        selectedEmoji === em && !imageUrl
                          ? isDark
                            ? 'bg-white/20 border-white shadow-sm scale-105'
                            : 'bg-amber-100 border-amber-800 scale-105'
                          : isDark
                          ? 'bg-white/[0.04] border-white/10 hover:bg-white/10'
                          : 'bg-white/70 border-stone-200 hover:bg-white'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Appliance Models to Tag */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={`font-bold uppercase tracking-wider text-[11px] font-mono ${
                      isDark ? 'text-zinc-300' : 'text-stone-700'
                    }`}
                  >
                    2. Select Models to Tag ({selectedTaggedModels.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTaggedModels(
                        selectedTaggedModels.length === products.length
                          ? []
                          : products.map((p) => p.id)
                      )
                    }
                    className={`text-[11px] font-semibold underline ${
                      isDark ? 'text-zinc-300 hover:text-white' : 'text-stone-700 hover:text-stone-950'
                    }`}
                  >
                    {selectedTaggedModels.length === products.length ? 'Clear All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {products.map((prod) => {
                    const isChecked = selectedTaggedModels.includes(prod.id);
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleToggleModelTag(prod.id)}
                        className={`p-2.5 sharp-pill border text-left flex items-center justify-between transition ${
                          isChecked
                            ? isDark
                              ? 'bg-white text-black border-white font-bold'
                              : 'bg-stone-900 text-amber-50 border-stone-800 font-bold'
                            : isDark
                            ? 'bg-white/[0.04] border-white/12 text-zinc-300 hover:bg-white/10'
                            : 'bg-white/80 border-stone-200 text-stone-800 hover:bg-white'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="text-xs truncate">{prod.model}</div>
                          <div
                            className={`text-[10px] opacity-75 font-mono ${
                              isChecked ? '' : isDark ? 'text-zinc-400' : 'text-stone-500'
                            }`}
                          >
                            {prod.brand} · {prod.capacityLitres}L
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? isDark
                                ? 'bg-black text-white border-black'
                                : 'bg-amber-400 text-stone-950 border-amber-400'
                              : 'border-current opacity-40'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 sharp-pill text-xs font-semibold border transition ${
                    isDark
                      ? 'border-white/15 text-zinc-300 hover:text-white bg-white/5'
                      : 'border-stone-300 text-stone-700 hover:text-stone-900 bg-white'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 sharp-pill text-xs font-bold uppercase tracking-wider border transition ${
                    isDark
                      ? 'bg-white text-black hover:bg-zinc-200 border-white font-extrabold shadow-lg'
                      : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-800 shadow-md'
                  }`}
                >
                  {editingItem ? 'Save Changes' : 'Add to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
