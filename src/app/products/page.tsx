import { getProducts, getCategories } from "@/lib/firestore-client";
import ProductsClient from "./products-client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return <ProductsClient initialProducts={products} categories={categories} />;
}
