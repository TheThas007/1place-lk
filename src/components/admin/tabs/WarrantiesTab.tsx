"use client";

import React, { useState, useEffect } from "react";
import { WarrantyOption } from "@/lib/types";
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  Sparkles,
  Save,
  Check,
  RotateCcw,
  Tag,
  Calendar,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";

import { DEFAULT_WARRANTY_PRESETS } from "@/lib/warranties-data";

export default function WarrantiesTab() {
  const [warranties, setWarranties] = useState<WarrantyOption[]>(DEFAULT_WARRANTY_PRESETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<WarrantyOption | null>(null);

  // Modal Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState<WarrantyOption["type"]>("Shop Warranty");
  const [durationValue, setDurationValue] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<"months" | "years" | "lifetime">("months");
  const [additionalPrice, setAdditionalPrice] = useState<number>(0);
  const [isDefault, setIsDefault] = useState(false);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingDefaults, setIsSyncingDefaults] = useState(false);

  // Load from Firestore with onSnapshot
  useEffect(() => {
    async function fetchWarranties() {
      try {
        const snap = await getDocs(collection(db, "warranties"));
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as WarrantyOption));
          // Merge defaults with custom added warranties from firestore
          const mergedMap = new Map<string, WarrantyOption>();
          DEFAULT_WARRANTY_PRESETS.forEach((w) => mergedMap.set(w.title.toLowerCase(), w));
          list.forEach((w) => mergedMap.set(w.title.toLowerCase(), w));
          setWarranties(Array.from(mergedMap.values()).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
        } else {
          setWarranties(DEFAULT_WARRANTY_PRESETS);
        }
      } catch (e) {
        console.warn("Using default warranties fallback:", e);
        setWarranties(DEFAULT_WARRANTY_PRESETS);
      }
    }
    fetchWarranties();
  }, []);

  const openAddModal = () => {
    setEditingWarranty(null);
    setTitle("");
    setType("Shop Warranty");
    setDurationValue(1);
    setDurationUnit("months");
    setAdditionalPrice(0);
    setIsDefault(false);
    setStatus("active");
    setIsModalOpen(true);
  };

  const openEditModal = (w: WarrantyOption) => {
    setEditingWarranty(w);
    setTitle(w.title);
    setType(w.type);
    setDurationValue(Number(w.duration_value) || 1);
    setDurationUnit((w.duration_unit as any) || "months");
    setAdditionalPrice(w.additional_price || 0);
    setIsDefault(!!w.is_default);
    setStatus(w.status || "active");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a warranty title.");
      return;
    }

    setIsSaving(true);
    try {
      const id = editingWarranty?.id || `w-${Date.now()}`;
      const payload: WarrantyOption = {
        id,
        title: title.trim(),
        type,
        duration_value: Number(durationValue) || 1,
        duration_unit: durationUnit,
        additional_price: Number(additionalPrice) || 0,
        coverage_details: "",
        is_default: isDefault,
        status,
        sort_order: editingWarranty?.sort_order || warranties.length + 1,
      };

      await setDoc(doc(db, "warranties", id), payload, { merge: true });

      setWarranties((prev) => {
        const filtered = prev.filter((item) => item.id !== id);
        return [...filtered, payload].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      });

      setIsModalOpen(false);
    } catch (err) {
      console.error("Save warranty error:", err);
      alert("Failed to save warranty.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this warranty preset?")) return;
    try {
      await deleteDoc(doc(db, "warranties", id));
      setWarranties((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error("Delete warranty error:", e);
      alert("Failed to delete warranty.");
    }
  };

  const handleSyncDefaults = async () => {
    setIsSyncingDefaults(true);
    try {
      for (const w of DEFAULT_WARRANTY_PRESETS) {
        await setDoc(doc(db, "warranties", w.id), w, { merge: true });
      }
      setWarranties(DEFAULT_WARRANTY_PRESETS);
      alert("All 28 official Sri Lankan warranties synchronized to database!");
    } catch (e) {
      console.error("Sync error:", e);
      alert("Failed to sync presets to database.");
    } finally {
      setIsSyncingDefaults(false);
    }
  };

  const filteredWarranties = warranties.filter((w) =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-white animate-fadeIn">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GLOBAL WARRANTY PRESETS</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Warranty Plans & Duration Manager
          </h3>
          <p className="text-xs text-white/50 font-medium mt-0.5">
            Configure default and custom warranty plans with month/year durations. These appear automatically in the Product Editor.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncDefaults}
            disabled={isSyncingDefaults}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            {isSyncingDefaults ? "Syncing..." : "Sync 28 Official Presets"}
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/25 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Warranty Plan
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-[#0F172A] border border-white/10 rounded-2xl p-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search warranty plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="text-xs text-white/40 font-bold hidden sm:inline">
          {filteredWarranties.length} Presets Available
        </span>
      </div>

      {/* Warranties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWarranties.map((w, idx) => (
          <div
            key={w.id || idx}
            className="bg-[#0F172A] border border-white/10 hover:border-white/20 rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  {w.type}
                </span>

                {w.is_default && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    Default Selection
                  </span>
                )}
              </div>

              <h4 className="text-base font-black text-white mt-3 leading-snug">{w.title}</h4>

              <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <strong>{w.duration_value}</strong> {w.duration_unit}
                </span>

                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  {w.additional_price > 0 ? `+Rs. ${w.additional_price.toLocaleString()}` : "Free"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => openEditModal(w)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
              >
                <Edit className="w-3.5 h-3.5 text-blue-400" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(w.id)}
                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                title="Delete preset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-lg font-black text-white">
                {editingWarranty ? "Edit Warranty Preset" : "Add New Warranty Preset"}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/50 hover:text-white rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-white/80">Warranty Plan Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 Year Official Apple Care"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-white/80">Warranty Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Shop Warranty" className="bg-slate-900">Shop Warranty</option>
                    <option value="Manufacturer Warranty" className="bg-slate-900">Manufacturer Warranty</option>
                    <option value="Extended Warranty" className="bg-slate-900">Extended Warranty</option>
                    <option value="No Warranty" className="bg-slate-900">No Warranty</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white/80">Additional Price (LKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={additionalPrice}
                    onChange={(e) => setAdditionalPrice(Number(e.target.value))}
                    placeholder="0 (Free)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 font-mono"
                  />
                </div>
              </div>

              {/* Duration Value & Unit */}
              <div className="grid grid-cols-2 gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                <div className="space-y-1.5">
                  <label className="font-bold text-white/80 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Duration Value
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={durationValue}
                    onChange={(e) => setDurationValue(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white/80">Duration Unit</label>
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="months" className="bg-slate-900">Months</option>
                    <option value="years" className="bg-slate-900">Years</option>
                    <option value="lifetime" className="bg-slate-900">Lifetime</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0 bg-white/10 border-white/20"
                  />
                  <span className="font-bold text-white">Default Selection</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={status === "active"}
                    onChange={(e) => setStatus(e.target.checked ? "active" : "inactive")}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0 bg-white/10 border-white/20"
                  />
                  <span className="font-bold text-white">Active Status</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-white/60 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Warranty"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
