import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/firestore-client";
import { Product } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { uniqueById } from "@/lib/utils";

export default async function FeaturedAccessories({
  initialProducts,
}: {
  initialProducts?: Product[];
}) {
  let allProducts = initialProducts;
  if (!allProducts || allProducts.length === 0) {
    try {
      allProducts = await getProducts();
    } catch (err) {
      console.error("Failed to fetch products for accessories:", err);
    }
  }

  const unique = uniqueById(allProducts || []);
  const accessoryProducts = unique.filter(
    (p) =>
      p.category_id !== "cat-smartphones" &&
      p.category_id !== "cat-feature-phones" &&
      p.category_name?.toLowerCase() !== "iphone" &&
      p.category_name?.toLowerCase() !== "smartphones"
  );

  if (accessoryProducts.length === 0) {
    return null;
  }

  const featuredAccessories = accessoryProducts.slice(0, 8);

  return (
    <ScrollReveal
      as="section"
      id="featured-accessories"
      aria-label="Accessories"
      stagger={0.06}
      yOffset={16}
      className="py-8 sm:py-12 md:py-20 lg:py-24 bg-background relative overflow-hidden border-t border-neutral-100 dark:border-white/5 font-sans select-none"
    >
      {/* Background Glow (desktop) */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-purple-500/5 to-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
        {/* Unified Section Header */}
        <div data-reveal-item className="flex items-center md:items-end justify-between mb-4 md:mb-12">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 md:text-foreground">
              Accessories
            </h2>
            <p className="hidden md:block text-muted-foreground text-sm mt-1">
              Top chargers, cables, protective gear and audio accessories.
            </p>
          </div>
          <Link
            href="/products?category=accessories"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-900 md:text-foreground hover:text-emerald-500 transition-colors shrink-0 group"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Responsive Accessories Layout: Horizontal scroll on mobile, responsive grid on desktop */}
        <div
          data-reveal-item
          className="flex md:grid overflow-x-auto md:overflow-visible scrollbar-none snap-x snap-mandatory md:snap-none md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0"
        >
          {featuredAccessories.map((product) => (
            <div
              key={`acc-${product.id}`}
              className="w-[46vw] min-w-[155px] max-w-[200px] md:w-auto md:min-w-0 md:max-w-none shrink-0 md:shrink snap-start md:snap-align-none h-full"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
