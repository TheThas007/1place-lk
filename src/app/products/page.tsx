import { Suspense } from "react";
import { Metadata } from "next";
import { getProducts, getCategories, getBrands } from "@/lib/firestore-client";
import ProductsClient from "./products-client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Buy Mobile Phones & Accessories Online in Sri Lanka | Street Mobile",
  description: "Browse all latest Apple, Samsung, Xiaomi smartphones, premium cases, chargers, earbuds & mobile accessories with official warranty at Street Mobile Sri Lanka.",
  alternates: {
    canonical: "https://www.streetmobile.lk/products",
  },
  openGraph: {
    title: "Buy Mobile Phones & Accessories Online in Sri Lanka | Street Mobile",
    description: "Browse all latest Apple, Samsung, Xiaomi smartphones, premium cases, chargers, earbuds & mobile accessories with official warranty at Street Mobile Sri Lanka.",
    url: "https://www.streetmobile.lk/products",
    type: "website",
    siteName: "Street Mobile",
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
    "@id": "https://www.streetmobile.lk/products#collection",
    "name": "Mobile Phones & Accessories in Sri Lanka | Street Mobile",
    "description": "Browse genuine smartphones, accessories, chargers, earbuds and gadgets available at Street Mobile Sri Lanka.",
    "url": "https://www.streetmobile.lk/products",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": products.slice(0, 24).map((p, idx) => ({
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
        "item": "https://www.streetmobile.lk",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "All Products",
        "item": "https://www.streetmobile.lk/products",
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
              <p className="text-xs font-semibold text-neutral-500">Loading Street Mobile catalog...</p>
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
