import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getProducts } from "@/lib/firestore-client";
import * as motion from "framer-motion/client";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default async function FeaturedProducts() {
  const allProducts = await getProducts();
  const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-500/5 to-purple-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">Featured Products</h2>
            <p className="text-muted-foreground">Our handpicked premium selection.</p>
          </div>
          <Link 
            href="/products?featured=true" 
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-all duration-300 group"
          >
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {featuredProducts.map((product) => (
            <motion.div key={product.id} variants={cardVariants} className="h-full">
              <Link 
                href={`/products/${product.slug}`} 
                className="group block h-full bg-card rounded-2xl overflow-hidden glass border-white/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 relative"
              >
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-700 ease-in-out -translate-x-full z-20 pointer-events-none" />

                <div className="relative aspect-square bg-gray-50/50 p-6 flex items-center justify-center">
                  {product.old_price && (
                    <div className="absolute top-4 left-4 bg-foreground text-background text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10 shadow-sm">
                      Sale
                    </div>
                  )}
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover img-zoom group-hover:scale-110 transition-transform duration-700 rounded-t-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-foreground/5 rounded-t-xl flex items-center justify-center img-zoom group-hover:scale-110 transition-transform duration-700">
                      <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                
                <div className="p-5 bg-white">
                  <div className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">{product.category_name}</div>
                  <h3 className="font-semibold text-sm lg:text-base line-clamp-1 mb-2 group-hover:text-black transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-base lg:text-lg">{formatPrice(product.price)}</span>
                    {product.old_price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.old_price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-8 sm:hidden">
          <Link 
            href="/products?featured=true" 
            className="flex items-center justify-center gap-2 text-sm font-medium w-full py-4 border border-border rounded-xl hover:bg-gray-50 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
