import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import {
  getDepartmentsFromDb,
  getBrandsFromDb,
  getDepartmentBrandPageConfig,
} from "@/lib/firestore-brands";
import { getProducts, getCategories } from "@/lib/firestore-client";
import DepartmentBrandPage from "@/components/brand/DepartmentBrandPage";

export const dynamic = "force-dynamic";

interface DepartmentBrandRouteProps {
  params: Promise<{
    departmentSlug: string;
    brandSlug: string;
  }>;
}

// ── Dynamic SEO Metadata Generation ──
export async function generateMetadata({
  params,
}: DepartmentBrandRouteProps): Promise<Metadata> {
  const { departmentSlug, brandSlug } = await params;
  const [departments, brands, config] = await Promise.all([
    getDepartmentsFromDb(),
    getBrandsFromDb(),
    getDepartmentBrandPageConfig(departmentSlug, brandSlug),
  ]);

  const department = departments.find(
    (d) => d.slug.toLowerCase() === departmentSlug.toLowerCase()
  );
  const brand = brands.find(
    (b) => b.slug.toLowerCase() === brandSlug.toLowerCase()
  );

  const brandName = brand?.name || brandSlug.toUpperCase();
  const deptName = department?.name || departmentSlug.toUpperCase();

  const title =
    config?.seoTitle ||
    `${brandName} ${deptName} in Sri Lanka | Official Store | Street Mobile`;
  const description =
    config?.seoDescription ||
    config?.productSectionDescription ||
    config?.description ||
    `Shop 100% genuine ${brandName} ${deptName} with official company warranty, best prices, and islandwide fast delivery at Street Mobile Vavuniya.`;

  const canonicalUrl = `https://www.streetmobile.lk/shop-by-brand/${departmentSlug.toLowerCase()}/${brandSlug.toLowerCase()}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Street Mobile",
      locale: "en_LK",
      images: config?.desktopBannerUrl
        ? [{ url: config.desktopBannerUrl, alt: `${brandName} ${deptName}` }]
        : [{ url: "https://www.streetmobile.lk/logo.png", alt: `${brandName} - Street Mobile` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: config?.desktopBannerUrl ? [config.desktopBannerUrl] : ["https://www.streetmobile.lk/logo.png"],
    },
  };
}

export default async function DepartmentBrandRoute({
  params,
}: DepartmentBrandRouteProps) {
  const { departmentSlug, brandSlug } = await params;

  const [departments, brands, products, categories, config] = await Promise.all([
    getDepartmentsFromDb(),
    getBrandsFromDb(),
    getProducts(),
    getCategories(),
    getDepartmentBrandPageConfig(departmentSlug, brandSlug),
  ]);

  const department = departments.find(
    (d) => d.slug.toLowerCase() === departmentSlug.toLowerCase()
  );
  const brand = brands.find(
    (b) => b.slug.toLowerCase() === brandSlug.toLowerCase()
  );

  // 404 on invalid department or brand
  if (!department || !brand) {
    notFound();
  }

  const brandName = brand.name || brandSlug.toUpperCase();
  const deptName = department.name || departmentSlug.toUpperCase();

  // Check if brand is enabled
  if (brand.enabled === false && brand.status === "inactive") {
    notFound();
  }

  // Fallback config if not found
  if (!config || config.enabled === false) {
    notFound();
  }

  // Filter products for this specific department AND brand
  const allBrandProducts = products.filter((p) => {
    const bSlug = (
      p.brand_slug ||
      p.brandSlug ||
      p.brand ||
      ""
    ).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const bName = (p.brand_name || p.brandName || p.brand || "").toLowerCase();
    const targetBrandSlug = brand.slug.toLowerCase();
    const targetBrandName = brand.name.toLowerCase();

    return (
      bSlug === targetBrandSlug ||
      bName === targetBrandName ||
      (p.name || "").toLowerCase().includes(targetBrandName)
    );
  });

  const departmentBrandProducts = allBrandProducts.filter((p) => {
    const pGroup = (p.productType || "").toLowerCase();
    const cSlug = (
      p.category_slug ||
      p.categorySlug ||
      p.category_id ||
      p.category_name ||
      ""
    ).toLowerCase();

    if (departmentSlug === "phones") {
      const isPhone =
        pGroup === "phone" ||
        cSlug.includes("smartphone") ||
        cSlug.includes("phone") ||
        cSlug.includes("iphone") ||
        cSlug.includes("galaxy") ||
        cSlug.includes("redmi") ||
        cSlug.includes("pixel");
      return isPhone;
    }

    if (departmentSlug === "laptops-tablets") {
      const isLaptopOrTab =
        cSlug.includes("laptop") ||
        cSlug.includes("macbook") ||
        cSlug.includes("tablet") ||
        cSlug.includes("ipad") ||
        cSlug.includes("tab");
      return isLaptopOrTab;
    }

    if (departmentSlug === "accessories") {
      const isAccessory =
        pGroup === "accessory" ||
        (!cSlug.includes("smartphone") &&
          !cSlug.includes("phone") &&
          !cSlug.includes("laptop") &&
          !cSlug.includes("macbook") &&
          !cSlug.includes("ipad"));
      return isAccessory;
    }

    return true;
  });

  // If department subset is empty but brand has products, fallback to all brand products
  const finalProducts =
    departmentBrandProducts.length > 0 ? departmentBrandProducts : allBrandProducts;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `https://www.streetmobile.lk/shop-by-brand/${departmentSlug}/${brandSlug}#collection`,
    "name": `${brandName} ${deptName} in Sri Lanka`,
    "description": `Shop genuine ${brandName} ${deptName} with warranty and fast delivery in Sri Lanka at Street Mobile.`,
    "url": `https://www.streetmobile.lk/shop-by-brand/${departmentSlug}/${brandSlug}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": finalProducts.slice(0, 24).map((p, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://www.streetmobile.lk/products/${p.slug}`,
        "name": p.name,
      })),
    },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.streetmobile.lk"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": deptName,
        "item": `https://www.streetmobile.lk/products?department=${departmentSlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${brandName} ${deptName}`,
        "item": `https://www.streetmobile.lk/shop-by-brand/${departmentSlug}/${brandSlug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen bg-white pt-28 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
          </div>
        }
      >
        <DepartmentBrandPage
          config={config}
          brand={brand}
          department={department}
          products={finalProducts}
          categories={categories}
          allBrands={brands}
        />
      </Suspense>
    </>
  );
}
