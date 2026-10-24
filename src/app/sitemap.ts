import { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/firestore-client";
import { getBrandsFromDb, getDepartmentsFromDb } from "@/lib/firestore-brands";
import { BLOG_POSTS } from "@/lib/blog-data";

import { BUSINESS_INFO } from "@/lib/business-info";

export const dynamic = "force-dynamic";

/**
 * Sanitizes any raw string/slug into a safe URL slug.
 * Replaces '&' with 'and', removes special characters, and trims hyphens.
 * This guarantees 100% valid XML with no unescaped ampersands or spaces.
 */
function cleanSlug(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&+/g, "and") // Replace '&' with 'and' to prevent XML parse entity errors
    .replace(/[^\w\s-]/g, "") // Strip characters that are invalid in slugs/XML
    .replace(/[\s_-]+/g, "-") // Collapse whitespace, underscores and multiple dashes to a single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || BUSINESS_INFO.domain;

  // Static informational and landing routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/orders`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
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
    const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((cat) => {
      const slug = cleanSlug(cat.slug || cat.id || cat.name);
      if (!slug) return [];
      return [
        {
          url: `${baseUrl}/category/${slug}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.85,
        },
      ];
    });

    // 2. Dynamic Product Routes (Exclude draft/inactive products)
    const productRoutes: MetadataRoute.Sitemap = products
      .filter((prod) => prod.slug && (prod as any).status !== "draft" && (prod as any).status !== "inactive")
      .flatMap((prod) => {
        const slug = cleanSlug(prod.slug);
        if (!slug) return [];
        let lastMod = new Date();
        if (prod.created_at) {
          const parsed = new Date(prod.created_at);
          if (!isNaN(parsed.getTime())) lastMod = parsed;
        }
        return [
          {
            url: `${baseUrl}/products/${slug}`,
            lastModified: lastMod,
            changeFrequency: "daily",
            priority: 0.9,
          },
        ];
      });

    // 3. Dynamic Brand & Department-Brand Landing Page Routes
    const brandRoutes: MetadataRoute.Sitemap = [];
    const activeBrands = brands.filter((b) => b.slug && b.enabled !== false && b.status !== "inactive");
    const activeDepts = departments.filter((d) => d.slug && d.enabled !== false);

    activeBrands.forEach((brand) => {
      const bSlug = cleanSlug(brand.slug);
      if (!bSlug) return;

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
        const dSlug = cleanSlug(deptSlug);
        if (!dSlug) return;
        brandRoutes.push({
          url: `${baseUrl}/shop-by-brand/${dSlug}/${bSlug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      });
    });

    // 4. Dynamic Blog Routes
    const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    // Deduplicate all URLs
    const urlMap = new Map<string, MetadataRoute.Sitemap[number]>();
    [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes, ...blogRoutes].forEach((entry) => {
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
