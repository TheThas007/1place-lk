import { getProducts, getCategories, getOfferBanners } from "@/lib/firestore-client";
import ProductsClient from "./products-client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const offerBanners = await getOfferBanners("shop_top");

  return (
    <ProductsClient
      initialProducts={products}
      categories={categories}
      offerBanners={offerBanners}
    />
  );
}
