import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getProducts } from "@/lib/firestore-client";

export default async function FeaturedProducts() {
  const allProducts = await getProducts();
  const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">Featured Products</h2>
            <p className="text-muted-foreground">Our handpicked premium selection.</p>
          </div>
          <Link 
            href="/products?featured=true" 
            className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-muted-foreground transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {featuredProducts.map((product) => (
            <Link 
              href={`/products/${product.slug}`} 
              key={product.id}
              className="group block bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl hover:border-border transition-all duration-300"
            >
              <div className="relative aspect-square bg-white p-6 flex items-center justify-center">
                {product.old_price && (
                  <div className="absolute top-4 left-4 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider z-10">
                    Sale
                  </div>
                )}
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover img-zoom group-hover:scale-105 transition-transform duration-500 rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-foreground/5 rounded-xl flex items-center justify-center img-zoom group-hover:scale-105 transition-transform duration-500">
                    <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <div className="text-xs text-muted-foreground mb-1">{product.category_name}</div>
                <h3 className="font-semibold text-sm lg:text-base line-clamp-1 mb-2 group-hover:text-muted-foreground transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold">{formatPrice(product.price)}</span>
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
        
        <div className="mt-8 sm:hidden">
          <Link 
            href="/products?featured=true" 
            className="flex items-center justify-center gap-2 text-sm font-medium w-full py-4 border border-border rounded-xl"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
