"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/lib/types";

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4 py-20 text-black">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-black mb-2">No Categories Found</h1>
          <p className="text-gray-500 text-sm mb-6">Please check back later or explore our full catalog.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-all"
          >
            Explore Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-black">
      {/* ── Page Header ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 sm:pb-12">
        <div className="max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black tracking-tight mb-3">
            Shop by Category
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-normal leading-relaxed">
            Explore products from leading technology brands.
          </p>
        </div>
      </section>

      {/* ── Category Grid ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category) => {
            const displayImage =
              category.image_url ||
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop";

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-[16px]"
              >
                <div className="bg-white border border-[#EAEAEA] hover:border-black rounded-[16px] overflow-hidden h-full flex flex-col justify-between transition-all duration-250 ease-out hover:-translate-y-1">
                  
                  {/* Image Container (Clean Neutral Background) */}
                  <div className="h-[200px] sm:h-[220px] bg-[#FAFAFA] flex items-center justify-center p-6 overflow-hidden">
                    <img
                      src={displayImage}
                      alt={category.name}
                      className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src =
                          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop";
                      }}
                    />
                  </div>

                  {/* Card Details Footer */}
                  <div className="p-5 sm:p-6 flex items-center justify-between border-t border-[#EAEAEA] bg-white">
                    <h2 className="font-bold text-base text-black tracking-tight group-hover:text-black">
                      {category.name}
                    </h2>

                    <span className="text-xs font-semibold text-black flex items-center gap-1.5 transition-transform duration-200 group-hover:translate-x-1">
                      Shop Now
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
