"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2, Plus, Trash2, Tag, HardDrive, Palette, ShieldCheck, Cpu } from "lucide-react";
import { Product, Category } from "@/lib/types";
import { db, storage } from "@/lib/firebase";
import { addDoc, updateDoc, doc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { PRESET_COLORS, getColorCSS, normalizeColor } from "@/lib/color-utils";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  categories: Category[];
  initialData?: Product | null;
}

const DEFAULT_SPEC_KEYS = [
  "Display", "Processor", "RAM", "Battery", "Camera", "OS", "Network",
];

const PRESET_STORAGE = ["64GB", "128GB", "256GB", "512GB", "1TB"];

export default function ProductModal({ isOpen, onClose, onSave, categories, initialData }: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    slug: "",
    category_id: "",
    category_name: "",
    price: 0,
    old_price: 0,
    description: "",
    stock_status: "in_stock",
    featured: false,
    images: [],
    specifications: {},
    colors: [],
    storage_options: [],
    storage_prices: {},
    warranty: "",
    code: "",
  });

  // Specifications as editable rows
  const [specRows, setSpecRows] = useState<{ key: string; value: string }[]>([]);

  // Image handling
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageLinksInput, setImageLinksInput] = useState<string>("");

  // Colors & Storage as chips
  const [colorsInput, setColorsInput] = useState("");
  const [storageInput, setStorageInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreviews(initialData.images?.slice(0, 4) || []);
      setImageLinksInput(initialData.images?.join(",\n") || "");

      // Populate spec rows from existing object
      const rows = Object.entries(initialData.specifications || {}).map(([key, value]) => ({ key, value }));
      setSpecRows(rows.length > 0 ? rows : [{ key: "", value: "" }]);

    } else {
      setFormData({
        name: "",
        slug: "",
        category_id: categories.length > 0 ? categories[0].id : "",
        category_name: categories.length > 0 ? categories[0].name : "",
        price: 0,
        old_price: 0,
        description: "",
        stock_status: "in_stock",
        featured: false,
        images: [],
        specifications: {},
        colors: [],
        storage_options: [],
        storage_prices: {},
        warranty: "",
        code: "",
      });
      setImagePreviews([]);
      setImageLinksInput("");
      setSpecRows([{ key: "", value: "" }]);
    }
    setImageFiles([]);
    setSaveSuccess(false);
  }, [initialData, isOpen, categories]);

  if (!isOpen) return null;

  // ── Specification helpers ──
  const addSpecRow = () => setSpecRows([...specRows, { key: "", value: "" }]);
  const removeSpecRow = (idx: number) => setSpecRows(specRows.filter((_, i) => i !== idx));
  const updateSpecRow = (idx: number, field: "key" | "value", val: string) => {
    const rows = [...specRows];
    rows[idx][field] = val;
    setSpecRows(rows);
  };

  // ── Chips helpers ──
  const addColor = (color: string) => {
    const trimmed = color.trim();
    if (!trimmed) return;
    const resolvedColor = normalizeColor(trimmed);
    const current = formData.colors || [];
    if (!current.includes(resolvedColor)) {
      setFormData({ ...formData, colors: [...current, resolvedColor] });
    }
    setColorsInput("");
  };
  const removeColor = (color: string) =>
    setFormData({ ...formData, colors: (formData.colors || []).filter((c) => c !== color) });

  const addStorage = (opt: string) => {
    const trimmed = opt.trim();
    if (!trimmed) return;
    const current = formData.storage_options || [];
    if (!current.includes(trimmed)) {
      const newPrices = { ...(formData.storage_prices || {}), [trimmed]: 0 };
      setFormData({ ...formData, storage_options: [...current, trimmed], storage_prices: newPrices });
    }
    setStorageInput("");
  };
  const removeStorage = (opt: string) => {
    const newPrices = { ...(formData.storage_prices || {}) };
    delete newPrices[opt];
    setFormData({
      ...formData,
      storage_options: (formData.storage_options || []).filter((s) => s !== opt),
      storage_prices: newPrices,
    });
  };
  const updateStoragePrice = (opt: string, val: number) => {
    setFormData({ ...formData, storage_prices: { ...(formData.storage_prices || {}), [opt]: val } });
  };

  // ── Image helpers ──
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, 4);
      setImageFiles(files);
      setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  // ── Save ──
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveSuccess(false);

    try {
      // Build specifications object from rows
      const specificationsObj: Record<string, string> = {};
      specRows.forEach(({ key, value }) => {
        if (key.trim()) specificationsObj[key.trim()] = value.trim();
      });

      // Images
      let parsedLinks = imageLinksInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      let imageUrls = parsedLinks;

      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
          const uploadResult = await uploadBytes(storageRef, file);
          return await getDownloadURL(uploadResult.ref);
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        imageUrls = [...uploadedUrls, ...parsedLinks].slice(0, 4);
      } else {
        imageUrls = imageUrls.slice(0, 4);
      }

      const productData = {
        ...formData,
        images: imageUrls,
        specifications: specificationsObj,
        colors: formData.colors || [],
        storage_options: formData.storage_options || [],
        storage_prices: formData.storage_prices || {},
        warranty: formData.warranty || "",
        updated_at: new Date().toISOString(),
      };

      if (initialData && initialData.id) {
        await updateDoc(doc(db, "products", initialData.id), productData);
      } else {
        (productData as any).created_at = new Date().toISOString();
        await addDoc(collection(db, "products"), productData);
      }

      setSaveSuccess(true);
      onSave();
      setTimeout(() => {
        onClose();
        setSaveSuccess(false);
      }, 600);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Check console and Firebase Storage rules.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-white">
              {initialData ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-white/40 mt-0.5">Changes save to Firebase Firestore</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-7">

          {/* ── Image Upload ── */}
          <Section icon={<Upload className="w-4 h-4" />} title="Product Images">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
                {imagePreviews.length > 0 ? (
                  imagePreviews.map((preview, idx) => (
                    <div key={idx} className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                      <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center shrink-0">
                    <Upload className="w-6 h-6 text-white/20" />
                  </div>
                )}
              </div>
              <input type="file" id="imageUpload" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              <label htmlFor="imageUpload" className="inline-flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/15 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors border border-white/10 w-fit">
                <Upload className="w-4 h-4" />
                Upload Images (max 4)
              </label>
              <textarea
                rows={2}
                placeholder="Or paste image URLs, comma-separated..."
                value={imageLinksInput}
                onChange={(e) => {
                  setImageLinksInput(e.target.value);
                  if (imageFiles.length === 0) {
                    const links = e.target.value.split(",").map((s) => s.trim()).filter((s) => s.startsWith("http")).slice(0, 4);
                    setImagePreviews(links);
                  }
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/20 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
              />
            </div>
          </Section>

          {/* ── Basic Info ── */}
          <Section icon={<Tag className="w-4 h-4" />} title="Basic Info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Product Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
                  }}
                  className="field-input"
                  placeholder="e.g. Samsung Galaxy S24"
                />
              </div>
              <div>
                <label className="field-label">Slug</label>
                <input
                  required
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="field-input text-white/50"
                />
              </div>
              <div>
                <label className="field-label">Product Code *</label>
                <input
                  required
                  type="text"
                  value={formData.code || ""}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="field-input font-mono"
                  placeholder="e.g. SM-S24-BLK"
                />
              </div>

              {/* Price */}
              <div>
                <label className="field-label">Price (LKR) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">Rs.</span>
                  <input
                    required
                    type="number"
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="field-input pl-10"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="field-label">Old Price (LKR) <span className="text-white/30">— for discount badge</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">Rs.</span>
                  <input
                    type="number"
                    min={0}
                    value={formData.old_price || ""}
                    onChange={(e) => setFormData({ ...formData, old_price: Number(e.target.value) })}
                    className="field-input pl-10"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Category & Stock */}
              <div>
                <label className="field-label">Category *</label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => {
                    const cat = categories.find((c) => c.id === e.target.value);
                    setFormData({ ...formData, category_id: e.target.value, category_name: cat?.name || "" });
                  }}
                  className="field-select"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Stock Status *</label>
                <select
                  required
                  value={formData.stock_status}
                  onChange={(e) => setFormData({ ...formData, stock_status: e.target.value as Product["stock_status"] })}
                  className="field-select"
                >
                  <option value="in_stock">✅ In Stock</option>
                  <option value="low_stock">⚠️ Low Stock</option>
                  <option value="out_of_stock">❌ Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="field-label">Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="field-input resize-none"
                placeholder="Enter product description..."
              />
            </div>

            {/* Featured */}
            <label className="flex items-center gap-3 mt-3 cursor-pointer group w-fit">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-blue-600 transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm text-white/60 group-hover:text-white/90 transition-colors select-none">Featured Product</span>
            </label>

            {/* Allowed Payment Methods */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <label className="field-label mb-2 block font-semibold">Allowed Payment Methods *</label>
              <p className="text-xs text-white/40 mb-3">Enable or disable payment options for this specific product at checkout:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={formData.allow_cod !== false}
                    onChange={(e) => setFormData({ ...formData, allow_cod: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 text-blue-600 focus:ring-blue-500 bg-white/10 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Cash on Delivery</span>
                    <span className="text-[10px] text-white/40">Pay upon delivery</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={formData.allow_card !== false}
                    onChange={(e) => setFormData({ ...formData, allow_card: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 text-purple-600 focus:ring-purple-500 bg-white/10 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Card Payment</span>
                    <span className="text-[10px] text-white/40">Visa / Mastercard</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={formData.allow_whatsapp !== false}
                    onChange={(e) => setFormData({ ...formData, allow_whatsapp: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 text-emerald-600 focus:ring-emerald-500 bg-white/10 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">WhatsApp Order</span>
                    <span className="text-[10px] text-white/40">Direct chat order</span>
                  </div>
                </label>
              </div>
            </div>
          </Section>

          {/* ── Storage Options ── */}
          <Section icon={<HardDrive className="w-4 h-4" />} title="Storage Options">
            {/* Preset chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_STORAGE.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => addStorage(opt)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    (formData.storage_options || []).includes(opt)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white/5 border-white/15 text-white/50 hover:border-blue-500/50 hover:text-white/80"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {/* Selected chips with price input */}
            <div className="space-y-2 mb-3">
              {(formData.storage_options || []).map((opt) => (
                <div key={opt} className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-300 shrink-0">
                    {opt}
                  </span>
                  <span className="text-white/20 text-sm shrink-0">→</span>
                  <span className="text-white/30 text-xs shrink-0">Rs.</span>
                  <input
                    type="number"
                    min={0}
                    value={(formData.storage_prices || {})[opt] || ""}
                    onChange={(e) => updateStoragePrice(opt, Number(e.target.value))}
                    placeholder="Price for this option"
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/20"
                  />
                  <button type="button" onClick={() => removeStorage(opt)} className="text-white/20 hover:text-red-400 transition-colors shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {/* Custom input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={storageInput}
                onChange={(e) => setStorageInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStorage(storageInput); } }}
                placeholder="Custom option (e.g. 8GB RAM)…"
                className="field-input flex-1 text-sm"
              />
              <button
                type="button"
                onClick={() => addStorage(storageInput)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </Section>

          {/* ── Colors ── */}
          <Section icon={<Palette className="w-4 h-4" />} title="Available Colors">
            {/* Preset colors */}
            <div className="flex flex-wrap gap-2 mb-3 max-h-48 overflow-y-auto p-1.5 border border-white/5 rounded-xl bg-black/10">
              {PRESET_COLORS.map((color) => {
                const hex = getColorCSS(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => addColor(color)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      (formData.colors || []).includes(color)
                        ? "bg-violet-600 border-violet-600 text-white"
                        : "bg-white/5 border-white/15 text-white/60 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full border border-white/20 shrink-0" 
                      style={{ backgroundColor: hex }}
                    />
                    {color}
                  </button>
                );
              })}
            </div>
            {/* Selected chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {(formData.colors || []).map((color) => {
                const hex = getColorCSS(color);
                return (
                  <span 
                    key={color} 
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-600/20 border border-violet-500/30 rounded-full text-xs font-medium text-violet-300"
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-white/10 shrink-0" 
                      style={{ backgroundColor: hex }}
                    />
                    {color}
                    <button type="button" onClick={() => removeColor(color)} className="hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
            {/* Custom input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={colorsInput}
                onChange={(e) => setColorsInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(colorsInput); } }}
                placeholder="Custom color (e.g. Midnight Blue)…"
                className="field-input flex-1 text-sm"
              />
              <button
                type="button"
                onClick={() => addColor(colorsInput)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </Section>

          {/* ── Specifications ── */}
          <Section icon={<Cpu className="w-4 h-4" />} title="Specifications">

            {/* Preset key shortcuts */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {DEFAULT_SPEC_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (!specRows.find((r) => r.key === key)) {
                      setSpecRows([...specRows, { key, value: "" }]);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 border border-white/10 text-white/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300 transition-all"
                >
                  + {key}
                </button>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {specRows.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-center group">
                  <input
                    type="text"
                    placeholder="Key (e.g. Display)"
                    value={row.key}
                    onChange={(e) => updateSpecRow(idx, "key", e.target.value)}
                    className="field-input w-36 shrink-0 text-sm font-medium text-white/80"
                  />
                  <span className="text-white/20 text-sm shrink-0">→</span>
                  <input
                    type="text"
                    placeholder="Value (e.g. 6.7 inch AMOLED)"
                    value={row.value}
                    onChange={(e) => updateSpecRow(idx, "value", e.target.value)}
                    className="field-input flex-1 text-sm text-white/70"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/15 text-white/30 hover:text-red-400 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSpecRow}
              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-emerald-400/80 hover:text-emerald-400 hover:bg-emerald-500/10 border border-dashed border-emerald-500/20 hover:border-emerald-500/40 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Specification Row
            </button>
          </Section>

          {/* ── Warranty ── */}
          <Section icon={<ShieldCheck className="w-4 h-4" />} title="Warranty">
            <input
              type="text"
              value={formData.warranty || ""}
              onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
              placeholder="e.g. 1 Year Manufacturer Warranty"
              className="field-input"
            />
          </Section>

          {/* ── Footer ── */}
          <div className="sticky bottom-0 bg-slate-900 pt-4 pb-1 border-t border-white/10 flex items-center justify-between gap-4 mt-4">
            <span className={`text-xs transition-all duration-300 ${saveSuccess ? "text-emerald-400" : "text-white/0"}`}>
              ✓ Saved to Firebase!
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving to Firebase…
                  </>
                ) : (
                  <>
                    {initialData ? "Update Product" : "Add Product"}
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Global field styles injected via style tag */}
      <style jsx global>{`
        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          margin-bottom: 0.375rem;
        }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          padding: 0.6rem 1rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input:focus {
          border-color: rgba(59,130,246,0.6);
          box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
        }
        .field-input::placeholder {
          color: rgba(255,255,255,0.2);
        }
        .field-select {
          width: 100%;
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          padding: 0.6rem 1rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          appearance: none;
          transition: border-color 0.15s;
        }
        .field-select:focus {
          border-color: rgba(59,130,246,0.6);
          box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
        }
      `}</style>
    </div>
  );
}

/* ── Section wrapper component ── */
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
        <span className="text-blue-400/80">{icon}</span>
        <h3 className="text-sm font-semibold text-white/80 tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}
