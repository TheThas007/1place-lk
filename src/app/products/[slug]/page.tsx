import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/firestore-client";
import ProductDetailClient from "./product-detail-client";
import { Metadata } from "next";

export const revalidate = 60;

function resolveProductBrand(product: any): string {
  if (product.brand_name && product.brand_name.trim() !== "") return product.brand_name.trim();
  if (product.brand && product.brand.trim() !== "") return product.brand.trim();
  if (product.brandName && product.brandName.trim() !== "") return product.brandName.trim();
  
  const name = (product.name || "").toLowerCase();
  if (name.includes("iphone") || name.includes("apple") || name.includes("macbook") || name.includes("airpods") || name.includes("ipad") || name.includes("magsafe")) return "Apple";
  if (name.includes("samsung") || name.includes("galaxy")) return "Samsung";
  if (name.includes("xiaomi") || name.includes("redmi") || name.includes("poco")) return "Xiaomi";
  if (name.includes("google") || name.includes("pixel")) return "Google";
  if (name.includes("oneplus")) return "OnePlus";
  if (name.includes("honor")) return "Honor";
  if (name.includes("oppo")) return "Oppo";
  if (name.includes("vivo")) return "Vivo";
  if (name.includes("realme")) return "Realme";
  if (name.includes("anker") || name.includes("soundcore")) return "Anker";
  if (name.includes("baseus")) return "Baseus";
  if (name.includes("jbl")) return "JBL";
  if (name.includes("sony")) return "Sony";
  if (name.includes("ugreen")) return "Ugreen";
  if (name.includes("hoco")) return "Hoco";
  if (name.includes("joyroom")) return "Joyroom";
  if (name.includes("remax")) return "REMAX";
  if (name.includes("ldnio")) return "LDNIO";
  if (name.includes("lenyes")) return "Lenyes";
  if (name.includes("oraimo")) return "Oraimo";

  return product.category_name || "Street Mobile";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const brand = resolveProductBrand(product);
  const title = `${product.name} Price in Sri Lanka | Street Mobile`;
  const priceStr = product.price ? `Rs. ${Number(product.price).toLocaleString("en-LK")}` : "";
  const warranty = product.warranty || product.brand_warranty || "Official Warranty";
  const stockText = product.stock_status === "out_of_stock" ? "Available for Pre-Order" : "In Stock";

  const description =
    product.description && product.description.length > 40
      ? `${product.name} price in Sri Lanka is ${priceStr}. ${stockText} with ${warranty}. Buy genuine ${brand} products at Street Mobile Vavuniya with islandwide delivery.`
      : `Buy original ${product.name} (${brand}) in Sri Lanka at Street Mobile. Best price ${priceStr}, ${warranty}, and express islandwide delivery.`;

  const canonicalUrl = `https://www.streetmobile.lk/products/${product.slug || slug}`;
  const images = product.images && product.images.length > 0
    ? product.images.map((img) => ({ url: img, alt: `${product.name} - Street Mobile Sri Lanka` }))
    : [{ url: "https://www.streetmobile.lk/logo.png", alt: product.name }];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      images,
      url: canonicalUrl,
      type: "website",
      siteName: "Street Mobile",
      locale: "en_LK",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images?.[0] ? [product.images[0]] : ["https://www.streetmobile.lk/logo.png"],
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

  const brand = resolveProductBrand(product);
  const validSku = product.code && !/^[0-9]{6,}$/.test(product.code) ? product.code : product.slug;
  const categoryName = product.category_name || "Smartphones";
  const categorySlug = (product.category_slug || product.categorySlug || categoryName).toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://www.streetmobile.lk/products/${product.slug || slug}#product`,
    "name": product.name,
    "image": product.images && product.images.length > 0 ? product.images : ["https://www.streetmobile.lk/logo.png"],
    "description": product.description || `Buy ${product.name} at Street Mobile in Sri Lanka with warranty and islandwide delivery.`,
    "sku": validSku,
    "mpn": validSku,
    "brand": {
      "@type": "Brand",
      "name": brand,
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.streetmobile.lk/products/${product.slug || slug}`,
      "priceCurrency": "LKR",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock_status === "out_of_stock" 
        ? "https://schema.org/OutOfStock" 
        : "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "@id": "https://www.streetmobile.lk/#organization",
        "name": "Street Mobile",
        "url": "https://www.streetmobile.lk"
      }
    }
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
        "name": categoryName,
        "item": `https://www.streetmobile.lk/category/${categorySlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": brand,
        "item": `https://www.streetmobile.lk/products?brand=${encodeURIComponent(brand)}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": product.name,
        "item": `https://www.streetmobile.lk/products/${product.slug || slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <ProductDetailClient product={product as any} allProducts={allProducts as any} />
    </>
  );
}
