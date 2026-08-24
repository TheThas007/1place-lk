import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/firestore-client";
import { products as fallbackProducts } from "@/lib/data";
import ProductCard from "@/components/products/ProductCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { formatPrice } from "@/lib/utils";

const ACCESSORY_CATEGORY_IDS = new Set([
  "8", "9", "10", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"
]);
const ACCESSORY_FALLBACK_IDS = ["12", "13", "14", "8"];

export default async function FeaturedAccessories() {
  let allProducts: typeof fallbackProducts = [];
  try {
    allProducts = await getProducts();
  } catch (err) {
    console.error("Failed to fetch products from Firestore:", err);
  }

  if (!allProducts || allProducts.length === 0) {
    return null;
  }

  // Filter for accessories or non-phone products
  let accessoryProducts = allProducts.filter(
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
    <>
      {/* ── Mobile Layout (< 768px): Exact Reference Swipeable Product Rail ── */}
      <div className="md:hidden w-full bg-white px-3 sm:px-4 py-3 select-none">
        {/* Mobile Header: Title & View All */}
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[19px] font-black text-neutral-900 tracking-tight">
            Accessories
          </h2>
          <Link
            href="/products?category=accessories"
            className="text-xs font-bold text-[#ED0712] hover:underline"
          >
            View all
          </Link>
        </div>

        {/* Horizontal Snap Rail */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none snap-x pb-1 -mx-3 px-3 sm:-mx-4 sm:px-4">
          {featuredAccessories.map((product) => {
            const hasDiscount =
              product.old_price &&
              typeof product.old_price === "number" &&
              product.old_price > product.price;

            const discountPercent = hasDiscount
              ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
              : 0;

            const mainImage = product.images?.[0] || "/placeholder-phone.webp";
            const brandName = product.brand_name || product.brand || "";

            return (
              <div
                key={`mob-acc-${product.id}`}
                className="w-[142px] sm:w-[152px] shrink-0 bg-white border border-[#E8E8E8] rounded-xl overflow-hidden p-2 flex flex-col justify-between shadow-2xs snap-start hover:border-neutral-400 transition-colors"
              >
                <Link href={`/products/${product.slug}`} className="block flex-1">
                  {/* Brand Label */}
                  {brandName && (
                    <span className="text-[9px] font-black tracking-wider uppercase text-blue-600 truncate block mb-1">
                      {brandName}
                    </span>
                  )}

                  {/* 1:1 Image Container with Bottom-Left Offer Badge */}
                  <div className="relative aspect-square bg-[#F7F7F7] rounded-lg flex items-center justify-center overflow-hidden mb-1.5 p-1">
                    <img
                      src={mainImage}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />

                    {/* Offer Badge (Bottom-Left) */}
                    {hasDiscount && (
                      <span className="product-offer-badge absolute left-1 bottom-1 z-2 bg-[#ED0712] text-white text-[8px] font-black px-1.5 py-0.5 rounded leading-none">
                        -{discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Product Title (Max 2 lines) */}
                  <h3 className="font-bold text-[11px] text-neutral-900 line-clamp-2 leading-tight mb-1 h-7">
                    {product.name}
                  </h3>

                  {/* Prices */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-xs text-[#ED0712]">
                      {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] text-neutral-400 line-through">
                        {formatPrice(product.old_price!)}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Desktop Layout ── */}
      <div className="hidden md:block">
        <ScrollReveal
          as="section"
          id="featured-accessories"
          stagger={0.06}
          yOffset={20}
          className="py-16 lg:py-24 bg-background relative overflow-hidden border-t border-white/5 font-sans"
        >
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-purple-500/5 to-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
            <div data-reveal-item className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                  Accessories
                </h2>
              </div>
              <Link
                href="/products?category=accessories"
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-foreground hover:text-emerald-400 transition-all duration-300 group"
              >
                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredAccessories.slice(0, 4).map((product) => (
                <div key={product.id} data-reveal-item className="h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </>
  );
}
