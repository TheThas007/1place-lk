import { getGalleryImages } from "@/lib/firestore-client";
import { GalleryImage } from "@/lib/types";
import GalleryClient from "./gallery-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function GalleryPage() {
  const galleryImages = await getGalleryImages() as GalleryImage[];
  return <GalleryClient images={galleryImages} />;
}
