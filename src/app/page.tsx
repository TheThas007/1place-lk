import HeroSection from "@/components/home/hero-section";
import TrustIndicators from "@/components/home/trust-indicators";
import FeaturedProducts from "@/components/home/featured-products";
import CategoriesSection from "@/components/home/categories-section";
import ReviewsSection from "@/components/home/reviews-section";
import GallerySection from "@/components/home/gallery-section";
import StoreLocation from "@/components/home/store-location";

import { getCategories, getReviews, getGalleryImages } from "@/lib/firestore-client";
import { GalleryImage } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const [categories, reviews, galleryImages] = await Promise.all([
    getCategories(),
    getReviews(),
    getGalleryImages(),
  ]);

  return (
    <>
      <HeroSection />
      <TrustIndicators />
      <FeaturedProducts />
      <CategoriesSection categories={categories} />
      <GallerySection images={galleryImages as GalleryImage[]} />
      <ReviewsSection reviews={reviews} />
      <StoreLocation />
    </>
  );
}
