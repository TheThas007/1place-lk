import { Suspense } from "react";
import { Metadata } from "next";
import { getProducts, getCategories, getBrands } from "@/lib/firestore-client";
import ProductsClient from "./products-client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Buy Electronics, Smartphones & Accessories Online in Sri Lanka | 1PLACE.LK",
  description: "Browse all latest Apple, Samsung, Xiaomi smartphones, premium cases, chargers, audio & lifestyle electronics with official warranty at 1PLACE.LK Sri Lanka.",
  alternates: {
    canonical: "https://www.1place.lk/products",
  },
  openGraph: {
    title: "Buy Electronics, Smartphones & Accessories Online in Sri Lanka | 1PLACE.LK",
    description: "Browse all latest Apple, Samsung, Xiaomi smartphones, premium cases, chargers, audio & lifestyle electronics with official warranty at 1PLACE.LK Sri Lanka.",
    url: "https://www.1place.lk/products",
    type: "website",
    siteName: "1PLACE.LK",
  },
};

export default async function ProductsPage() {
  const [products, categories, brands] = await Promise.all([
    getProducts().catch(() => []),
    getCategories().catch(() => []),
    getBrands().catch(() => []),
  ]);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://www.1place.lk/products#collection",
    "name": "Electronics, Smartphones & Accessories in Sri Lanka | 1PLACE.LK",
    "description": "Browse genuine smartphones, accessories, chargers, earbuds and gadgets available at 1PLACE.LK Sri Lanka.",
    "url": "https://www.1place.lk/products",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": products.slice(0, 24).map((p, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://www.1place.lk/products/${p.slug}`,
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
        "item": "https://www.1place.lk",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "All Products",
        "item": "https://www.1place.lk/products",
      },
    ],
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
          <div className="bg-white min-h-screen pt-28 pb-16 px-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[300px] flex-col gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-neutral-500">Loading 1PLACE.LK catalog...</p>
            </div>
          </div>
        }
      >
        <ProductsClient
          initialProducts={products}
          categories={categories}
          brands={brands}
        />
      </Suspense>
    </>
  );
}
