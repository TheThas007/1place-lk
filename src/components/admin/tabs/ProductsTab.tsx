"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/lib/types";
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronRight, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Tag,
  DollarSign
} from "lucide-react";

export default function ProductsTab({ 
  products, 
  onDelete, 
  onEdit, 
  onAdd 
}: { 
  products: Product[]; 
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  onAdd: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  const availableCategories = Array.from(
    new Set(products.map((p) => p.category_name || "Uncategorized"))
  ).sort();

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      p.name.toLowerCase().includes(query) ||
      (p.code && p.code.toLowerCase().includes(query)) ||
      (p.category_name && p.category_name.toLowerCase().includes(query));
    const matchesCategory =
      selectedCategoryFilter === "all" || (p.category_name || "Uncategorized") === selectedCategoryFilter;
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

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sortedCategories.map((c) => [c, true]))
  );

  const toggleSection = (cat: string) =>
    setOpenSections((prev) => ({ ...prev, [cat]: !prev[cat] }));

  // Stats
  const inStockCount = products.filter((p) => p.stock_status === "in_stock").length;
  const lowStockCount = products.filter((p) => p.stock_status === "low_stock").length;
  const outOfStockCount = products.filter((p) => p.stock_status === "out_of_stock").length;

  const categoryColors: Record<string, string> = {
    iPhone: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Samsung: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    Xiaomi: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    Redmi: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    Oppo: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Vivo: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    Realme: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    Google: "bg-red-500/15 text-red-400 border-red-500/30",
    Honor: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    OnePlus: "bg-red-500/15 text-red-400 border-red-500/30",
    Accessories: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };

  const getColor = (cat: string) =>
    categoryColors[cat] || "bg-purple-500/15 text-purple-400 border-purple-500/30";

  return (
    <div className="space-y-6">
      {/* Premium Top Bar & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/40">Total Inventory</p>
            <h4 className="text-xl font-extrabold text-white mt-0.5">{products.length} Products</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/40">In Stock Items</p>
            <h4 className="text-xl font-extrabold text-emerald-400 mt-0.5">{inStockCount}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/40">Low Stock Alert</p>
            <h4 className="text-xl font-extrabold text-amber-400 mt-0.5">{lowStockCount}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/40">Out of Stock</p>
            <h4 className="text-xl font-extrabold text-red-400 mt-0.5">{outOfStockCount}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-md shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Product Catalog Management
          </h3>
          <p className="text-xs text-white/40 mt-0.5">
            Showing {filteredProducts.length} of {products.length} products across {sortedCategories.length} categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by name, model, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setSelectedCategoryFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            selectedCategoryFilter === "all"
              ? "bg-white text-slate-950 font-bold shadow-lg"
              : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          All Categories ({products.length})
        </button>
        {availableCategories.map((cat) => {
          const count = products.filter((p) => (p.category_name || "Uncategorized") === cat).length;
          const isSelected = selectedCategoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isSelected
                  ? "bg-white text-slate-950 font-bold shadow-lg"
                  : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Grouped Category Sections */}
      {sortedCategories.map((cat) => {
        const catProducts = grouped[cat];
        const isOpen = openSections[cat] ?? true;
        const colorClass = getColor(cat);

        return (
          <div
            key={cat}
            className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(cat)}
              className="w-full flex items-center justify-between px-6 py-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors border-b border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${colorClass}`}>
                  {cat}
                </span>
                <span className="text-xs text-white/40 font-medium">
                  {catProducts.length} product{catProducts.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-white/40 transition-transform duration-300 ${
                  isOpen ? "rotate-90 text-white" : ""
                }`}
              />
            </button>

            {/* Collapsible Product Table */}
            {isOpen && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      <th className="px-6 py-3.5">Product Name & Code</th>
                      <th className="px-6 py-3.5">Selling Price</th>
                      <th className="px-6 py-3.5">Stock Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {catProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Image & Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/10 overflow-hidden shrink-0 shadow-md">
                              <img
                                src={product.images[0] || "/placeholder.png"}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format&fit=crop";
                                }}
                              />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                                {product.name}
                              </span>
                              {product.code && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-white/40 mt-0.5">
                                  <Tag className="w-3 h-3 text-white/30" />
                                  {product.code}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-extrabold text-white">
                              {formatPrice(product.price)}
                            </span>
                            {product.old_price && product.old_price > product.price && (
                              <span className="text-[10px] text-white/30 line-through font-mono">
                                {formatPrice(product.old_price)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock Status Badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                              product.stock_status === "in_stock"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : product.stock_status === "low_stock"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.stock_status === "in_stock"
                                  ? "bg-emerald-400"
                                  : product.stock_status === "low_stock"
                                  ? "bg-amber-400"
                                  : "bg-red-400"
                              }`}
                            />
                            {product.stock_status.replace("_", " ")}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onEdit(product)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-all shadow-sm"
                              title="Edit Product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(product.id)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all shadow-sm"
                              title="Delete Product"
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
        <div className="bg-slate-900/50 border border-dashed border-white/10 rounded-2xl p-16 text-center space-y-3">
          <Package className="w-10 h-10 text-white/20 mx-auto" />
          <p className="text-white/60 text-sm font-medium">No products currently listed in database.</p>
          <button
            onClick={onAdd}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 transition-all"
          >
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );
}
