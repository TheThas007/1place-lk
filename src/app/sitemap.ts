import { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/firestore-client";
import { getBrandsFromDb, getDepartmentsFromDb } from "@/lib/firestore-brands";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.streetmobile.lk";

  // Static informational and landing routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/return-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const [categories, products, brands, departments] = await Promise.all([
      getCategories().catch(() => []),
      getProducts().catch(() => []),
      getBrandsFromDb().catch(() => []),
      getDepartmentsFromDb().catch(() => []),
    ]);

    // 1. Dynamic Category Routes
    const categoryRoutes: MetadataRoute.Sitemap = categories
      .filter((cat) => cat.slug && cat.slug.trim() !== "")
      .map((cat) => ({
        url: `${baseUrl}/category/${cat.slug.trim().toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.85,
      }));

    // 2. Dynamic Product Routes (Exclude draft/inactive products)
    const productRoutes: MetadataRoute.Sitemap = products
      .filter((prod) => prod.slug && prod.slug.trim() !== "" && (prod as any).status !== "draft" && (prod as any).status !== "inactive")
      .map((prod) => {
        let lastMod = new Date();
        if (prod.created_at) {
          const parsed = new Date(prod.created_at);
          if (!isNaN(parsed.getTime())) lastMod = parsed;
        }
        return {
          url: `${baseUrl}/products/${prod.slug.trim()}`,
          lastModified: lastMod,
          changeFrequency: "daily",
          priority: 0.9,
        };
      });

    // 3. Dynamic Brand & Department-Brand Landing Page Routes
    const brandRoutes: MetadataRoute.Sitemap = [];
    const activeBrands = brands.filter((b) => b.slug && b.enabled !== false && b.status !== "inactive");
    const activeDepts = departments.filter((d) => d.slug && d.enabled !== false);

    activeBrands.forEach((brand) => {
      const bSlug = brand.slug.trim().toLowerCase();
      // Primary Brand Route
      brandRoutes.push({
        url: `${baseUrl}/brand/${bSlug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });

      // Department-Brand specific routes
      const assigned = brand.assigned_departments || (activeDepts.map((d) => d.slug));
      assigned.forEach((deptSlug) => {
        brandRoutes.push({
          url: `${baseUrl}/shop-by-brand/${deptSlug.trim().toLowerCase()}/${bSlug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      });
    });

    // Deduplicate all URLs
    const urlMap = new Map<string, MetadataRoute.Sitemap[number]>();
    [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes].forEach((entry) => {
      if (!urlMap.has(entry.url)) {
        urlMap.set(entry.url, entry);
      }
    });

    return Array.from(urlMap.values());
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
