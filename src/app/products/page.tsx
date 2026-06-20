import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { products, categories } from "@/lib/data";

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-foreground/10 outline-none transition-all"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-background border border-border rounded-xl text-sm font-medium hover:bg-foreground/5 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-border flex items-center justify-center group-hover:border-foreground transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Price Range</h3>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm" />
                <span className="text-muted-foreground">-</span>
                <input type="number" placeholder="Max" className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm" />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product) => (
                <Link 
                  href={`/products/${product.slug}`} 
                  key={product.id}
                  className="group block bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl hover:border-border transition-all duration-300"
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
                        className="absolute inset-0 w-full h-full object-cover img-zoom group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">{product.category_name}</div>
                    <h3 className="font-semibold text-sm lg:text-base line-clamp-2 mb-2 group-hover:text-muted-foreground transition-colors h-10 lg:h-12">
                      {product.name}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}
