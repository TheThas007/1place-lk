import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/firestore-client";
import CategoryDetailClient from "./category-detail-client";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  const title = `Buy ${category.name} in Vavuniya | STREET MOBILE`;
  const description = `Shop the best ${category.name} at STREET MOBILE in Vavuniya. Check out our latest collection with premium quality and best prices.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: category.image_url ? [{ url: category.image_url }] : [],
      url: `https://www.streetmobile.lk/categories/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: category.image_url ? [category.image_url] : [],
    },
  };
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
