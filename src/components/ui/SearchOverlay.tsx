"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, ChevronRight, ArrowRight, Package } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { getProducts } from "@/lib/firestore-client";

const POPULAR_SEARCHES = ["iPhone 16", "Samsung Galaxy", "Redmi", "Fast Charger", "Airpods", "Tempered Glass"];

export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
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
        getProducts()
          .then((res) => setProducts(res))
          .catch((err) => console.error("Failed to fetch products for search overlay:", err));
      }
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
  }, [isOpen, products.length]);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category_name && p.category_name.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q))
    );
    setFilteredProducts(matches.slice(0, 6));
  }, [query, products]);

  if (!isOpen) return null;

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
              placeholder="Search products, brands, accessories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-white text-base sm:text-lg placeholder-white/40 focus:outline-none"
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
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs sm:text-sm font-semibold transition-all"
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

              {/* Category Quick Links */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" />
                  Categories
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "iPhones", href: "/categories/iphone" },
                    { label: "Samsung", href: "/categories/samsung" },
                    { label: "Xiaomi", href: "/categories/xiaomi" },
                    { label: "Accessories", href: "/categories/accessories" },
                    { label: "All Products", href: "/products" },
                    { label: "Repairs", href: "/contact" },
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
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Search Results ({filteredProducts.length})
                </h3>
                {filteredProducts.length > 0 && (
                  <Link
                    href={`/products?search=${encodeURIComponent(query)}`}
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-white/60 text-sm">No products found matching "{query}"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug || product.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-xl bg-white/10 shrink-0 overflow-hidden">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{product.name}</h4>
                        <p className="text-xs text-white/50 mt-0.5">{product.category_name || "Smartphones"}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-white">{formatPrice(product.price)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
