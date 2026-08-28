import { Suspense } from "react";
import { Metadata } from "next";
import { getProducts, getCategories, getBrands } from "@/lib/firestore-client";
import ProductsClient from "./products-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Buy Mobile Phones & Accessories Online in Sri Lanka | Street Mobile",
  description: "Browse all latest Apple, Samsung, Xiaomi smartphones, premium cases, chargers, earbuds & mobile accessories with official warranty at Street Mobile Sri Lanka.",
  alternates: {
    canonical: "https://www.streetmobile.lk/products",
  },
  openGraph: {
    title: "Buy Mobile Phones & Accessories Online in Sri Lanka | Street Mobile",
    description: "Browse all latest Apple, Samsung, Xiaomi smartphones, premium cases, chargers, earbuds & mobile accessories with official warranty at Street Mobile Sri Lanka.",
    url: "https://www.streetmobile.lk/products",
    type: "website",
    siteName: "Street Mobile",
  },
};

export default async function ProductsPage() {
  const [products, categories, brands] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
  ]);

  return (
    <Suspense fallback={<div className="bg-white min-h-screen pt-32 text-center text-gray-400">Loading shop...</div>}>
      <ProductsClient
        initialProducts={products}
        categories={categories}
        brands={brands}
      />
    </Suspense>
  );
}
