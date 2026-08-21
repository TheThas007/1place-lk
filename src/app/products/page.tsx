import { Suspense } from "react";
import { getProducts, getCategories, getBrands } from "@/lib/firestore-client";
import ProductsClient from "./products-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
