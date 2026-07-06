import HeroSection from "@/components/home/hero-section";
import TrustIndicators from "@/components/home/trust-indicators";
import FeaturedProducts from "@/components/home/featured-products";
import CategoriesSection from "@/components/home/categories-section";
import ReviewsSection from "@/components/home/reviews-section";
import StoreLocation from "@/components/home/store-location";

import { getCategories, getReviews } from "@/lib/firestore-client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const categories = await getCategories();
  const reviews = await getReviews();

  return (
    <>
      <HeroSection />
      <TrustIndicators />
      <FeaturedProducts />
      <CategoriesSection categories={categories} />
      <ReviewsSection reviews={reviews} />
      <StoreLocation />
    </>
  );
}

