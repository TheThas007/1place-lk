"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Product, Category, Review, GalleryImage, HeroSlide } from "@/lib/types";
import { Activity, TrendingUp, TrendingDown, Eye, Plus, Search, Edit, Trash2, Package, FolderOpen, Image as ImageIcon, Star } from "lucide-react";

/* ─── Products Tab ─── */
function ProductsTab({ 
  products, 
  onDelete, 
  onEdit, 
  onAdd 
}: { 
  products: Product[], 
  onDelete: (id: string) => void,
  onEdit: (product: Product) => void,
  onAdd: () => void
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  const availableCategories = Array.from(new Set(products.map(p => p.category_name || "Uncategorized"))).sort();

  const filteredProducts = products.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = (
      p.name.toLowerCase().includes(query) ||
      (p.code && p.code.toLowerCase().includes(query)) ||
      (p.category_name && p.category_name.toLowerCase().includes(query))
    );
    const matchesCategory = selectedCategoryFilter === "all" || (p.category_name || "Uncategorized") === selectedCategoryFilter;
    return matchesQuery && matchesCategory;
  });

  // Group filtered products by category_name
  const grouped = filteredProducts.reduce<Record<string, Product[]>>((acc, product) => {
    const cat = product.category_name || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  const sortedCategories = Object.keys(grouped).sort();

  // Track which sections are open (all open by default)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(sortedCategories.map(c => [c, true]))
  );

  const toggleSection = (cat: string) =>
    setOpenSections(prev => ({ ...prev, [cat]: !prev[cat] }));

  const categoryColors: Record<string, string> = {
    iPhone: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    Samsung: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    Xiaomi: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    Redmi: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    Oppo: "bg-green-500/15 text-green-400 border-green-500/20",
    Vivo: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    Realme: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    Google: "bg-red-500/15 text-red-400 border-red-500/20",
    Honor: "bg-pink-500/15 text-pink-400 border-pink-500/20",
    OnePlus: "bg-red-500/15 text-red-400 border-red-500/20",
    Tablets: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
    Accessories: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    Anker: "bg-teal-500/15 text-teal-400 border-teal-500/20",
    JBL: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    DJI: "bg-slate-500/15 text-slate-300 border-slate-500/20",
    CMF: "bg-white/10 text-white/60 border-white/10",
  };

  const getColor = (cat: string) =>
    categoryColors[cat] || "bg-purple-500/15 text-purple-400 border-purple-500/20";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">All Products</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {filteredProducts.length} products · {sortedCategories.length} categories shown
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by name, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setSelectedCategoryFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            selectedCategoryFilter === "all"
              ? "bg-white text-black shadow-md"
              : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          All Categories ({products.length})
        </button>
        {availableCategories.map((cat) => {
          const count = products.filter(p => (p.category_name || "Uncategorized") === cat).length;
          const isSelected = selectedCategoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isSelected
                  ? "bg-white text-black shadow-md"
                  : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Grouped sections */}
      {sortedCategories.map((cat) => {
        const catProducts = grouped[cat];
        const isOpen = openSections[cat] ?? true;
        const colorClass = getColor(cat);

        return (
          <div
            key={cat}
            className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden"
          >
            {/* Section header */}
            <button
              onClick={() => toggleSection(cat)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${colorClass}`}>
                  {cat}
                </span>
                <span className="text-xs text-white/30 font-medium">
                  {catProducts.length} product{catProducts.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-white/30 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
              />
            </button>

            {/* Collapsible product table */}
            {isOpen && (
              <div className="border-t border-white/5">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.015]">
                      <th className="text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest px-5 py-3">Product</th>
                      <th className="text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest px-5 py-3">Price</th>
                      <th className="text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest px-5 py-3">Status</th>
                      <th className="text-right text-[10px] font-semibold text-white/30 uppercase tracking-widest px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {catProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-white/[0.025] transition-colors group"
                      >
                        {/* Product name + image */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/5 overflow-hidden shrink-0 border border-white/5">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm font-medium text-white/85 truncate max-w-[220px] group-hover:text-white transition-colors">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        {/* Price */}
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-white">{formatPrice(product.price)}</span>
                            {product.old_price && (
                              <span className="text-[10px] text-white/30 line-through">{formatPrice(product.old_price)}</span>
                            )}
                          </div>
                        </td>
                        {/* Stock status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              product.stock_status === "in_stock"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : product.stock_status === "low_stock"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {product.stock_status.replace("_", " ")}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onEdit(product)}
                              className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(product.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {products.length === 0 && (
        <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center text-white/20 text-sm">
          No products found. Click &ldquo;Add Product&rdquo; to get started.
        </div>
      )}
    </div>
  );
}


