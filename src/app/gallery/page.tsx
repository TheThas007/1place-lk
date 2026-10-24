import { Metadata } from "next";
import { getGalleryImages } from "@/lib/firestore-client";
import { GalleryImage } from "@/lib/types";
import GalleryClient from "./gallery-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Flagship Gallery & Customer Deliveries | 1PLACE.LK",
  description: "Browse photo gallery of 1PLACE.LK Colombo flagship store, latest premium stock unboxings, gadget collections, and customer handovers.",
  alternates: {
    canonical: "https://www.1place.lk/gallery",
  },
  openGraph: {
    title: "Flagship Gallery & Customer Deliveries | 1PLACE.LK",
    description: "Browse photos of 1PLACE.LK flagship store and latest gadget arrivals.",
    url: "https://www.1place.lk/gallery",
    type: "website",
    siteName: "1PLACE.LK",
  },
};

export default async function GalleryPage() {
  const galleryImages = (await getGalleryImages().catch(() => [])) as GalleryImage[];

  const galleryJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": "1PLACE.LK Customer Experience & Store Gallery",
    "description": "Photo gallery of genuine mobile phone unboxings, flagship store moments, and customer deliveries in Sri Lanka.",
    "url": "https://www.1place.lk/gallery",
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
        "item": "https://www.1place.lk",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Gallery",
        "item": "https://www.1place.lk/gallery",
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
