import HeroSection from "@/components/home/hero-section";
import AnnouncementTicker from "@/components/home/announcement-ticker";
import TrustIndicators from "@/components/home/trust-indicators";
import CategoriesSection from "@/components/home/categories-section";
import NewArrivalsSection from "@/components/home/new-arrivals-section";
import FeaturedProducts from "@/components/home/featured-products";
import FeaturedCollections from "@/components/home/featured-collections";
import FeaturedAccessories from "@/components/home/featured-accessories";
import ShopByCategoryCarousel from "@/components/home/shop-by-category-carousel";
import ReviewsSection from "@/components/home/reviews-section";
import GallerySection from "@/components/home/gallery-section";
import StoreLocation from "@/components/home/store-location";
import QuickCategoriesMobile from "@/components/home/quick-categories-mobile";
import CampaignPlacement from "@/components/ui/CampaignPlacement";
import HomeScrollReset from "@/components/home/HomeScrollReset";

import VisualProductShowcase from "@/components/home/visual-product-showcase";
import {
  getCategories,
  getBrands,
  getProducts,
  getReviews,
  getGalleryImages,
  getUiSettings,
  getGoogleReviewsSettings,
  getShowcaseSettings,
  getFeaturedCollections,
  getNewArrivalsSettings,
} from "@/lib/firestore-client";
import { siteSettings } from "@/lib/data";
import { GalleryImage } from "@/lib/types";

export const revalidate = 60; // Revalidate cache every 60s for high performance

export default async function HomePage() {
  const [
    categories,
    brands,
    products,
    reviews,
    galleryImages,
    uiSettings,
    googleReviewsSettings,
    showcaseSettings,
    featuredCollectionsSettings,
    newArrivalsSettings,
  ] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts(),
    getReviews(),
    getGalleryImages(),
    getUiSettings(),
    getGoogleReviewsSettings(),
    getShowcaseSettings(),
    getFeaturedCollections(),
    getNewArrivalsSettings(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    name: siteSettings.store_name,
    alternateName: "streetmobile.lk",
    image: "https://www.streetmobile.lk/logo.png",
    "@id": "https://www.streetmobile.lk",
    url: "https://www.streetmobile.lk",
    telephone: "+94774141118",
    email: siteSettings.email,
    priceRange: "LKR",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteSettings.address,
      addressLocality: "Vavuniya",
      addressRegion: "Northern Province",
      postalCode: "43000",
      addressCountry: "LK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 8.7514,
      longitude: 80.4971,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "21:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "10:00",
        closes: "18:00",
      },
    ],
  };

  return (
    <>
      <HomeScrollReset />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Premium hero banner slider */}
      <HeroSection />

      {/* Showcase position: Below Hero */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_hero" />

      {/* 2. Announcement Ticker */}
      <AnnouncementTicker />

      {/* Quick Mobile Categories & Discovery Shortcuts (Under 768px) */}
      <QuickCategoriesMobile categories={categories} />

      {/* 3. New Arrivals */}
      <NewArrivalsSection initialProducts={products} initialSettings={newArrivalsSettings} />

      {/* Showcase position: Below New Arrivals */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_new_arrivals" />

      {/* Showcase position: Above Shop by Brand */}
      <VisualProductShowcase settings={showcaseSettings} placement="above_brand" />

      {/* 4. Shop by Brand */}
      <CategoriesSection categories={categories} brands={brands} />

      {/* Showcase position: Below Shop by Brand */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_brand" />

      {/* 5. Featured Mobile Phones */}
      <FeaturedProducts
        initialProducts={products}
        initialVisible={uiSettings?.showFeaturedProducts !== false}
      />

      {/* Featured Collections (2-Column Editorial Grid) */}
      <FeaturedCollections settings={featuredCollectionsSettings} />

      {/* Showcase position: Below Featured Phones */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_featured_phones" />

      {/* 6. Mobile Accessories promotional banner */}
      <CampaignPlacement placement="homepage_after_categories" />

      {/* 7. Best Selling Products / Featured Accessories */}
      <FeaturedAccessories />

      {/* Showcase position: Below Featured Accessories */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_featured_accessories" />

      {/* 8. Shop by Category (Carousel Slider) */}
      <ShopByCategoryCarousel categories={categories} />

      {/* Showcase position: Below Shop by Category */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_category" />

      {/* 9. Store Gallery (Life at Street Mobile) */}
      <GallerySection images={galleryImages as GalleryImage[]} uiSettings={uiSettings} />

      {/* Showcase position: Below Life at Street Mobile */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_gallery" />

      {/* 10. Google customer reviews */}
      <ReviewsSection reviews={reviews} settings={googleReviewsSettings} />

      {/* Showcase position: Below Google Reviews */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_reviews" />

      {/* Showcase position: Above Why Choose Street Mobile */}
      <VisualProductShowcase settings={showcaseSettings} placement="above_why_choose" />

      {/* 11. Trust/service strip (Why Choose Street Mobile) */}
      <TrustIndicators />

      {/* Showcase position: Below Why Choose */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_why_choose" />

      {/* Showcase position: Above Store Location / Footer */}
      <VisualProductShowcase settings={showcaseSettings} placement="above_location" />

      {/* 12. Store Location & Contact */}
      <StoreLocation />
    </>
  );
}
