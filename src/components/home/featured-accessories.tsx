import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/firestore-client";
import { products as fallbackProducts } from "@/lib/data";
import ProductCard from "@/components/products/ProductCard";
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
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

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
    allProducts = fallbackProducts;
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
    accessoryProducts = allProducts;
  }

  const featuredAccessories = accessoryProducts.slice(0, 4);

  return (
    <section className="py-16 lg:py-24 bg-background relative overflow-hidden border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-purple-500/5 to-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
        <div className="flex items-end justify-between mb-12">
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {featuredAccessories.map((product) => (
            <motion.div key={product.id} variants={cardVariants} className="h-full">
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 sm:hidden">
          <Link
            href="/products?category=accessories"
            className="flex items-center justify-center gap-2 text-sm font-semibold w-full py-4 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors text-white"
          >
            View All Accessories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
