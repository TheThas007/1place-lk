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
import QuickCategoriesMobile from "@/components/home/quick-categories-mobile";
import CampaignPlacement from "@/components/ui/CampaignPlacement";
import HomeScrollReset from "@/components/home/HomeScrollReset";
import TodayDealSection from "@/components/home/today-deal-section";
import WeAreNearYouMarquee from "@/components/home/we-are-near-you-marquee";
import StoreLocation from "@/components/home/store-location";
import FinishingZoomWrapper from "@/components/home/FinishingZoomWrapper";
import ScrollReveal from "@/components/ui/ScrollReveal";

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
  getTodayDealSettings,
  getGalleryAnimationSettings,
} from "@/lib/firestore-client";
import { siteSettings } from "@/lib/data";
import { GalleryImage } from "@/lib/types";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate cache every 60s for high performance

export const metadata: Metadata = {
  title: "Mobile Phones & Accessories in Sri Lanka | Street Mobile",
  description: "Your Trusted Mobile Store in Vavuniya, Sri Lanka. Buy 100% genuine Apple, Samsung, Xiaomi smartphones, chargers, power banks, earbuds, and premium accessories with official warranty and fast islandwide delivery.",
  alternates: {
    canonical: "https://www.streetmobile.lk",
  },
  openGraph: {
    title: "Mobile Phones & Accessories in Sri Lanka | Street Mobile",
    description: "Your Trusted Mobile Store in Vavuniya, Sri Lanka. 100% Genuine Smartphones, Apple, Samsung, Xiaomi & Premium Accessories.",
    url: "https://www.streetmobile.lk",
    siteName: "Street Mobile",
    locale: "en_LK",
    type: "website",
  },
};

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
    todayDealSettings,
    galleryAnimationSettings,
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
    getTodayDealSettings(),
    getGalleryAnimationSettings(),
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

      {/* Quick Mobile Search & Discovery Shortcuts (Under 768px - Placed right below Top Navbar) */}
      <QuickCategoriesMobile categories={categories} />

      {/* 1. Premium hero banner slider */}
      <HeroSection />

      {/* 2. Announcement Ticker (Running text bar right below hero) */}
      <AnnouncementTicker />

      {/* Showcase position: Below Hero */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_hero" />

      {/* 3. New Arrivals */}
      {newArrivalsSettings?.enabled !== false && (
        <ScrollReveal enable3d={true}>
          <NewArrivalsSection initialProducts={products} initialSettings={newArrivalsSettings} />
        </ScrollReveal>
      )}

      {/* Today's Deal Promotional Banner (Below New Arrivals) */}
      <TodayDealSection settings={todayDealSettings} />

      {/* Showcase position: Below New Arrivals */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_new_arrivals" />

      {/* Showcase position: Above Shop by Brand */}
      <VisualProductShowcase settings={showcaseSettings} placement="above_brand" />

      {/* 4. Shop by Brand */}
      <ScrollReveal enable3d={true}>
        <CategoriesSection categories={categories} brands={brands} />
      </ScrollReveal>

      {/* Showcase position: Below Shop by Brand */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_brand" />

      {/* 5. Featured Mobile Phones */}
      <ScrollReveal enable3d={true}>
        <FeaturedProducts
          initialProducts={products}
          initialVisible={uiSettings?.showFeaturedProducts !== false}
        />
      </ScrollReveal>

      {/* Featured Collections (2-Column Editorial Grid) */}
      <ScrollReveal enable3d={true}>
        <FeaturedCollections settings={featuredCollectionsSettings} />
      </ScrollReveal>

      {/* Showcase position: Below Featured Phones */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_featured_phones" />

      {/* 6. Mobile Accessories promotional banner */}
      <CampaignPlacement placement="homepage_after_categories" />

      {/* 7. Best Selling Products / Featured Accessories */}
      <ScrollReveal enable3d={true}>
        <FeaturedAccessories />
      </ScrollReveal>

      {/* Showcase position: Below Featured Accessories */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_featured_accessories" />

      {/* 8. Shop by Category (Hidden as requested) */}
      {/* <div className="hidden md:block">
        <ScrollReveal enable3d={true}>
          <ShopByCategoryCarousel categories={categories} />
        </ScrollReveal>
      </div> */}

      {/* Showcase position: Below Shop by Category */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_category" />

      {/* 9. Store Gallery (Life at Street Mobile) */}
      {(galleryAnimationSettings?.enabled ?? true) && (
        <>
          <ScrollReveal enable3d={true}>
            <GallerySection
              images={galleryImages as GalleryImage[]}
              animationSettings={galleryAnimationSettings}
              uiSettings={uiSettings}
            />
          </ScrollReveal>

          {/* Showcase position: Below Life at Street Mobile */}
          <VisualProductShowcase settings={showcaseSettings} placement="below_gallery" />
        </>
      )}

      {/* 10. Google customer reviews (Continuously moves in opposite direction of gallery) */}
      {(googleReviewsSettings?.enabled ?? true) && (
        <>
          <ScrollReveal enable3d={true}>
            <ReviewsSection
              reviews={reviews}
              settings={googleReviewsSettings}
              galleryDirection={galleryAnimationSettings?.direction || "left"}
            />
          </ScrollReveal>

          {/* Showcase position: Below Google Reviews */}
          <VisualProductShowcase settings={showcaseSettings} placement="below_reviews" />
        </>
      )}

      {/* Showcase position: Above Why Choose Street Mobile */}
      <VisualProductShowcase settings={showcaseSettings} placement="above_why_choose" />

      {/* 11. Trust/service strip (Why Choose Street Mobile - Desktop Full Grid) */}
      <ScrollReveal enable3d={true}>
        <TrustIndicators mode="full_only" />
      </ScrollReveal>

      {/* 11B. Continuous Stylish Marquee: WE ARE NEAR YOU (No background, transparent text) */}
      <WeAreNearYouMarquee />

      {/* Showcase position: Below Why Choose */}
      <VisualProductShowcase settings={showcaseSettings} placement="below_why_choose" />

      {/* Showcase position: Above Store Location / Footer */}
      <VisualProductShowcase settings={showcaseSettings} placement="above_location" />

      {/* 12. Store Location & Contact with Grand Finale Page Zoom Effect */}
      <FinishingZoomWrapper>
        <StoreLocation />
      </FinishingZoomWrapper>
    </>
  );
}
