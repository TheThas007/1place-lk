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

  // ── Search Aliases: map common shorthand to full terms ──
  const SEARCH_ALIASES: Record<string, string[]> = {
    "ip": ["iphone"],
    "iph": ["iphone"],
    "iphne": ["iphone"],
    "ipone": ["iphone"],
    "sam": ["samsung"],
    "samsg": ["samsung"],
    "samsng": ["samsung"],
    "samsun": ["samsung"],
    "earbud": ["earbuds", "tws"],
    "ear bud": ["earbuds", "tws"],
    "airpod": ["airpods"],
    "macbk": ["macbook"],
    "lap": ["laptop"],
    "charg": ["charger", "chargers"],
    "spkr": ["speaker"],
    "headph": ["headphone", "headphones"],
  };

  // Simple fuzzy: checks if all chars of the query appear in-order within the target
  function fuzzyMatch(target: string, query: string): boolean {
    if (target.includes(query)) return true;
    let qi = 0;
    for (let i = 0; i < target.length && qi < query.length; i++) {
      if (target[i] === query[qi]) qi++;
    }
    // Only count as fuzzy match if ≥70% of query chars matched (prevents too-loose matches)
    return qi >= Math.ceil(query.length * 0.7) && query.length >= 3;
  }

  function matchesSearch(text: string, q: string, aliases: string[]): boolean {
    const t = text.toLowerCase();
    if (t.includes(q)) return true;
    for (const alias of aliases) {
      if (t.includes(alias)) return true;
    }
    return fuzzyMatch(t, q);
  }

  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      setFilteredCategories([]);
      setFilteredBrands([]);
      return;
    }
    const q = query.toLowerCase().trim();
    const aliases = SEARCH_ALIASES[q] || [];

    // 1. Filter Products – typo-tolerant
    const matchedProducts = products.filter(
      (p) =>
        matchesSearch(p.name, q, aliases) ||
        (p.code && matchesSearch(p.code, q, aliases)) ||
        (p.brand_name && matchesSearch(p.brand_name, q, aliases)) ||
        (p.category_name && matchesSearch(p.category_name, q, aliases)) ||
        (p.tags && p.tags.some((tag) => matchesSearch(tag, q, aliases)))
    );
    setFilteredProducts(matchedProducts.slice(0, 5));

    // 2. Filter Categories – typo-tolerant
    const matchedCategories = categories.filter((c) =>
      matchesSearch(c.name, q, aliases) || matchesSearch(c.slug, q, aliases)
    );
    setFilteredCategories(matchedCategories.slice(0, 3));

    // 3. Filter Brands – typo-tolerant
    const matchedBrands = brands.filter((b) =>
      matchesSearch(b.name, q, aliases) || matchesSearch(b.slug, q, aliases)
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
        className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex flex-col text-white select-none w-full h-full overflow-hidden"
      >
        {/* Top Search Input Bar */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-3 border-b border-white/10 flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 flex items-center bg-white/10 border border-white/15 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus-within:border-white/40 transition-colors min-w-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 shrink-0 mr-2.5 sm:mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search smartphones, accessories, brands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-white text-sm sm:text-base placeholder-white/40 focus:outline-none font-medium truncate"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded-full hover:bg-white/20 text-white/60 hover:text-white transition-colors shrink-0 ml-1"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 flex-1 overflow-y-auto custom-scrollbar">
          {query.trim() === "" ? (
            <div className="space-y-6 py-2">
              {/* Quick Category Navigation */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-3 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-blue-400" />
                  Browse Categories
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {[
                    { label: "Smartphones", href: "/products?category=smartphones" },
                    { label: "Smart Watches", href: "/products?category=smart-watches" },
                    { label: "Laptops & MacBooks", href: "/products?category=laptops" },
                    { label: "Earbuds & Audio", href: "/products?category=earbuds" },
                    { label: "Fast Chargers", href: "/products?category=chargers-adapters" },
                    { label: "All Products", href: "/products" },
                  ].map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs sm:text-sm font-medium transition-all group min-w-0"
                    >
                      <span className="truncate">{cat.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 transition-transform shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProducts.length === 0 && filteredCategories.length === 0 && filteredBrands.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-white/20 mx-auto" />
                  <p className="text-white/60 text-sm">No results found for &ldquo;{query}&rdquo;</p>
                  <Link
                    href="/products"
                    onClick={() => setIsOpen(false)}
                    className="inline-block px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
                  >
                    Browse All Store Products →
                  </Link>
                </div>
              ) : (
                <>
                  {/* Products */}
                  {filteredProducts.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/60">
                          Products ({filteredProducts.length})
                        </h4>
                        <Link
                          href={`/products?search=${encodeURIComponent(query)}`}
                          onClick={() => setIsOpen(false)}
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          View All <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="space-y-2.5">
                        {filteredProducts.map((product) => {
                          const cleanCatName = (product.category_name || product.categoryName || "").replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "").trim();
                          const cleanBrand = (product.brand_name || product.brandName || product.brand || "").trim();

                          return (
                            <Link
                              key={product.id}
                              href={`/products/${product.slug || product.id}`}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-4 p-3 sm:p-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all group"
                            >
                              <div className="w-14 h-14 rounded-xl bg-white shrink-0 overflow-hidden border border-white/10 p-1 flex items-center justify-center">
                                {product.images?.[0] ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <Package className="w-6 h-6 text-gray-400" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                                  {product.name}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-white/50 mt-1 font-medium">
                                  {cleanCatName && <span>{cleanCatName}</span>}
                                  {cleanBrand && cleanBrand !== "Other" && <span>• {cleanBrand}</span>}
                                  {product.code && <span className="font-mono text-white/40">• {product.code}</span>}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs sm:text-sm font-black text-white">{formatPrice(product.price)}</span>
                                {product.stock_status === "out_of_stock" && (
                                  <span className="block text-[10px] text-amber-400 font-bold">Pre-Order</span>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Categories & Brands when no product match or as supplement */}
                  {(filteredCategories.length > 0 || filteredBrands.length > 0) && (
                    <div className="space-y-3">
                      {filteredCategories.length > 0 && (
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-blue-400" />
                            Categories
                          </h4>
                          <div className="space-y-2">
                            {filteredCategories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/products?category=${cat.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium transition-all group"
                              >
                                <span>{cat.name}</span>
                                <ChevronRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {filteredBrands.length > 0 && (
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-emerald-400" />
                            Brands
                          </h4>
                          <div className="space-y-2">
                            {filteredBrands.map((brand) => (
                              <Link
                                key={brand.id}
                                href={`/products?brand=${brand.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium transition-all group"
                              >
                                <span>{brand.name}</span>
                                <ChevronRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Always show View All link */}
                  <Link
                    href={`/products?search=${encodeURIComponent(query)}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all"
                  >
                    View all results for &ldquo;{query}&rdquo;
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
