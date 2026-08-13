"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, ChevronRight, ArrowRight, Package, Tag } from "lucide-react";
import { Product, Category, Brand } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { getProducts, getCategories, getBrands } from "@/lib/firestore-client";

const POPULAR_SEARCHES = ["iPhone 16", "Samsung", "Earbuds", "Fast Charger", "JBL Speaker", "Screen Protector"];

export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpenSearch = () => setIsOpen(true);
    window.addEventListener("open-search-overlay", handleOpenSearch);
    return () => window.removeEventListener("open-search-overlay", handleOpenSearch);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 150);
      
      if (products.length === 0) {
        Promise.all([getProducts(), getCategories(), getBrands()])
          .then(([pList, cList, bList]) => {
            setProducts(pList);
            setCategories(cList);
            setBrands(bList);
          })
          .catch((err) => console.error("Failed to fetch search datasets:", err));
      }
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
  }, [isOpen, products.length]);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      setFilteredCategories([]);
      setFilteredBrands([]);
      return;
    }
    const q = query.toLowerCase().trim();

    // 1. Filter Products
    const matchedProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.brand_name && p.brand_name.toLowerCase().includes(q)) ||
        (p.category_name && p.category_name.toLowerCase().includes(q))
    );
    setFilteredProducts(matchedProducts.slice(0, 5));

    // 2. Filter Categories
    const matchedCategories = categories.filter((c) =>
      c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
    setFilteredCategories(matchedCategories.slice(0, 3));

    // 3. Filter Brands
    const matchedBrands = brands.filter((b) =>
      b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q)
    );
    setFilteredBrands(matchedBrands.slice(0, 3));
  }, [query, products, categories, brands]);

  if (!isOpen) return null;

  const hasAnyResults = filteredProducts.length > 0 || filteredCategories.length > 0 || filteredBrands.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex flex-col text-white select-none"
      >
        {/* Top Search Input Bar */}
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 pb-4 border-b border-white/10 flex items-center gap-3">
          <div className="relative flex-1 flex items-center bg-white/10 border border-white/15 rounded-2xl px-4 py-3 focus-within:border-white/40 transition-colors">
            <Search className="w-5 h-5 text-white/50 shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by category, brand (Apple, Samsung), or product name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-white text-base sm:text-lg placeholder-white/40 focus:outline-none font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded-full hover:bg-white/20 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs sm:text-sm font-semibold transition-all shrink-0"
          >
            Cancel
          </button>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 overflow-y-auto custom-scrollbar">
          {query.trim() === "" ? (
            <div className="space-y-8">
              {/* Popular Searches */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {POPULAR_SEARCHES.map((item) => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs sm:text-sm font-medium transition-all"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" />
                  Product Categories
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Smartphones", href: "/category/smartphones" },
                    { label: "Smart Watches", href: "/category/smart-watches" },
                    { label: "Speakers", href: "/category/speakers" },
                    { label: "Earbuds & TWS", href: "/category/earbuds" },
                    { label: "Chargers & Adapters", href: "/category/chargers-adapters" },
                    { label: "All Catalog", href: "/products" },
                  ].map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs sm:text-sm font-medium transition-all group"
                    >
                      <span>{cat.label}</span>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {!hasAnyResults ? (
                <div className="py-12 text-center">
                  <p className="text-white/60 text-sm">No results found matching "{query}"</p>
                </div>
              ) : (
                <>
                  {/* Category Matches */}
                  {filteredCategories.length > 0 && (
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" /> Matching Categories
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {filteredCategories.map((c) => (
                          <Link
                            key={c.id}
                            href={`/category/${c.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between transition-all"
                          >
                            <span className="text-xs font-bold text-white">{c.name}</span>
                            <span className="text-[10px] text-emerald-300 font-mono">Category →</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Brand Matches */}
                  {filteredBrands.length > 0 && (
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> Matching Brands
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {filteredBrands.map((b) => (
                          <Link
                            key={b.id}
                            href={`/brand/${b.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 flex items-center justify-between transition-all"
                          >
                            <span className="text-xs font-bold text-white">{b.name}</span>
                            <span className="text-[10px] text-blue-300 font-mono">Brand →</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Matches */}
                  {filteredProducts.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/60">
                          Matching Products ({filteredProducts.length})
                        </h4>
                        <Link
                          href={`/products?search=${encodeURIComponent(query)}`}
                          onClick={() => setIsOpen(false)}
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                        >
                          View All <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-2.5">
                        {filteredProducts.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug || product.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0 overflow-hidden border border-white/10">
                              {product.images?.[0] && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate">{product.name}</h4>
                              <div className="flex items-center gap-2 text-[10px] text-white/50 mt-0.5 font-mono">
                                <span>{product.category_name || product.categoryName || "Category"}</span>
                                {product.brand_name && <span>• {product.brand_name}</span>}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs sm:text-sm font-black text-white">{formatPrice(product.price)}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
