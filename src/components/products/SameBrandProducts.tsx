"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { Product } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";

interface SameBrandProductsProps {
  currentProduct: Product;
  allProducts: Product[];
}

export default function SameBrandProducts({
  currentProduct,
  allProducts,
}: SameBrandProductsProps) {
  const brandName = useMemo(() => {
    const raw = (
      currentProduct.brand_name ||
      currentProduct.brandName ||
      currentProduct.brand ||
      ""
    ).trim();
    if (!raw || raw === "Other" || raw === "Standard") return "";
    return raw;
  }, [currentProduct]);

  const brandProducts = useMemo(() => {
    if (!brandName || !allProducts || allProducts.length === 0) return [];

    const brandLower = brandName.toLowerCase();

    return allProducts
      .filter((p) => {
        if (p.id === currentProduct.id) return false;
        const pBrand = (
          p.brand_name ||
          p.brandName ||
          p.brand ||
          ""
        ).trim().toLowerCase();
        const pName = p.name.toLowerCase();

        return (
          pBrand === brandLower ||
          (brandLower.length > 2 && pName.includes(brandLower))
        );
      })
      .slice(0, 4);
  }, [brandName, currentProduct, allProducts]);

  if (!brandName || brandProducts.length === 0) return null;

  return (
    <section className="mt-16 sm:mt-24 pt-12 border-t border-[#EAEAEA]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600" /> More from {brandName}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
            More Products from {brandName}
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Explore authentic {brandName} smartphones, devices and official Sri Lankan warranty accessories.
          </p>
        </div>

        <Link
          href={`/products?brand=${encodeURIComponent(brandName.toLowerCase())}`}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-extrabold text-black hover:text-blue-600 transition-colors group"
        >
          <span>View All {brandName}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {brandProducts.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
