import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/firestore-client";
import ProductsClient from "./products-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <Suspense fallback={<div className="bg-white min-h-screen pt-32 text-center text-gray-400">Loading shop...</div>}>
      <ProductsClient
        initialProducts={products}
        categories={categories}
      />
    </Suspense>
  );
}
