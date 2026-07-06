import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/firestore-client";
import ProductDetailClient from "./product-detail-client";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = `${product.name} | STREET MOBILE`;
  const description = product.description || `Buy ${product.name} at STREET MOBILE in Vavuniya. Best price and premium quality guaranteed.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      url: `https://www.streetmobile.lk/products/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

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

  // Generate Product JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description || `Buy ${product.name} at STREET MOBILE.`,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://www.streetmobile.lk/products/${slug}`,
      "priceCurrency": "LKR",
      "price": product.price,
      "availability": product.stock_status === "in_stock" || product.stock_status === "low_stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "STREET MOBILE"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product as any} />
    </>
  );
}
