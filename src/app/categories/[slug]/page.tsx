import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/firestore-client";
import CategoryDetailClient from "./category-detail-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const allProducts = await getProducts();
  const categoryProducts = allProducts.filter((p) => p.category_id === category.id);

  return <CategoryDetailClient category={category} products={categoryProducts} />;
}
