import HeroSection from "@/components/home/hero-section";
import TrustIndicators from "@/components/home/trust-indicators";
import FeaturedProducts from "@/components/home/featured-products";
import CategoriesSection from "@/components/home/categories-section";
import ReviewsSection from "@/components/home/reviews-section";
import StoreLocation from "@/components/home/store-location";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustIndicators />
      <FeaturedProducts />
      <CategoriesSection />
      <ReviewsSection />
      <StoreLocation />
    </>
  );
}

