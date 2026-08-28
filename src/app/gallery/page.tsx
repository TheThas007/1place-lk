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
  const galleryImages = await getGalleryImages() as GalleryImage[];
  return <GalleryClient images={galleryImages} />;
}
