import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/firestore-client";
import ProductDetailClient from "./product-detail-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product as any} />;
}
