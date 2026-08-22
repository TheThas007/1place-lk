import { redirect } from "next/navigation";
import { getBrandsFromDb, getDefaultBrandDepartments } from "@/lib/firestore-brands";

export const dynamic = "force-dynamic";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const brands = await getBrandsFromDb();
  const brand = brands.find((b) => b.slug.toLowerCase() === slug.toLowerCase());
  const depts = brand?.assigned_departments || getDefaultBrandDepartments(slug);
  const primaryDept = depts[0] || "phones";

  const query = search.category ? `?category=${search.category}` : "";
  redirect(`/shop-by-brand/${primaryDept}/${slug}${query}`);
}
