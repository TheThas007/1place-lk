import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/firestore-client";
import ProductDetailClient from "./product-detail-client";
import { Metadata } from "next";

export const revalidate = 60;

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
    alternates: {
      canonical: `https://www.streetmobile.lk/products/${slug}`,
    },
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
  const allProducts = await getProducts();

  if (!product) {
    notFound();
  }

  const validSku = product.code && !/^[0-9]{6,}$/.test(product.code) ? product.code : product.slug;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description || `Buy ${product.name} at STREET MOBILE.`,
    "sku": validSku,
    "brand": {
      "@type": "Brand",
      "name": product.category_name || "STREET MOBILE"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.streetmobile.lk/products/${slug}`,
      "priceCurrency": "LKR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock_status === "out_of_stock" 
        ? "https://schema.org/OutOfStock" 
        : "https://schema.org/InStock",
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
      <ProductDetailClient product={product as any} allProducts={allProducts as any} />
    </>
  );
}
