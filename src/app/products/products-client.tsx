"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Product, Category } from "@/lib/types";

export default function ProductsClient({ initialProducts, categories }: { initialProducts: Product[], categories: Category[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category_id);
      
      // Price filter
      const min = minPrice ? parseInt(minPrice) : 0;
      const max = maxPrice ? parseInt(maxPrice) : Infinity;
      const matchesPrice = product.price >= min && product.price <= max;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategories, minPrice, maxPrice]);

  return (
    <div className="bg-background min-h-screen">
      {/* Page Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">All Products</h1>
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-foreground/10 outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-6 py-3 bg-background border border-border rounded-xl text-sm font-medium hover:bg-foreground/5 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop & Mobile Toggle */}
          <aside className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0 space-y-8`}>
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${isSelected ? 'bg-foreground border-foreground' : 'border-border bg-card group-hover:border-foreground/50'}`}>
                        {isSelected && <Check className="w-3 h-3 text-background" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isSelected}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      <span className={`text-sm transition-colors ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>
                        {cat.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Price Range (Rs)</h3>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min" 
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-foreground/20" 
                />
                <span className="text-muted-foreground">-</span>
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max" 
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-foreground/20" 
                />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredProducts.length} products
            </div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-3xl border border-border/50">
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedCategories([]); setMinPrice(""); setMaxPrice(""); }}
                  className="mt-6 px-6 py-2 bg-foreground text-background rounded-xl font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <Link 
                    href={`/products/${product.slug}`} 
                    key={product.id}
                    className="group block bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl hover:border-border transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-square bg-white p-4 flex items-center justify-center">
                      {product.old_price && (
                        <div className="absolute top-3 left-3 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider z-10">
                          Sale
                        </div>
                      )}
                      <div className="relative w-full h-full overflow-hidden rounded-xl bg-foreground/5">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{product.category_name}</div>
                        <h3 className="font-semibold text-sm lg:text-base line-clamp-2 mb-2 group-hover:text-muted-foreground transition-colors h-10 lg:h-12">
                          {product.name}
                        </h3>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mt-auto">
                        <span className="font-bold text-sm lg:text-base">{formatPrice(product.price)}</span>
                        {product.old_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.old_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
