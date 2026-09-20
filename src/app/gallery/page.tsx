import { Metadata } from "next";
import { getGalleryImages } from "@/lib/firestore-client";
import { GalleryImage } from "@/lib/types";
import GalleryClient from "./gallery-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Store Gallery & Customer Deliveries | Street Mobile Vavuniya",
  description: "Browse photo gallery of Street Mobile store in Vavuniya, latest stock unboxings, gadget collections, and happy customer handovers.",
  alternates: {
    canonical: "https://www.streetmobile.lk/gallery",
  },
  openGraph: {
    title: "Store Gallery & Customer Deliveries | Street Mobile",
    description: "Browse photos of Street Mobile store in Vavuniya and latest gadget arrivals.",
    url: "https://www.streetmobile.lk/gallery",
    type: "website",
    siteName: "Street Mobile",
  },
};

export default async function GalleryPage() {
  const galleryImages = (await getGalleryImages().catch(() => [])) as GalleryImage[];

  const galleryJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": "Street Mobile Life & Customer Moments",
    "description": "Photo gallery of genuine mobile phone unboxings, shop life, and customer handovers in Vavuniya, Sri Lanka.",
    "url": "https://www.streetmobile.lk/gallery",
    "image": galleryImages.slice(0, 20).map((img) => img.image_url || (img as any).url),
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
        "name": "Gallery",
        "item": "https://www.streetmobile.lk/gallery",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <GalleryClient images={galleryImages} />
    </>
  );
}
