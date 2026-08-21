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

      {/* Wrapping in flex-col for mobile reordering */}
      <div className="flex flex-col">
        {/* 1. Premium hero banner slider */}
        <div className="order-1 md:order-none"><HeroSection /></div>

        {/* Showcase position: Below Hero */}
        <div className="order-2 md:order-none"><VisualProductShowcase settings={showcaseSettings} placement="below_hero" /></div>

        {/* Quick Mobile Categories & Discovery Shortcuts (Under 768px) */}
        <div className="order-3 md:order-none"><QuickCategoriesMobile categories={categories} /></div>

        {/* 2. Announcement Ticker */}
        <div className="order-4 md:order-none"><AnnouncementTicker /></div>

        {/* 3. New Arrivals */}
        <div className="order-5 md:order-none"><NewArrivalsSection initialProducts={products} initialSettings={newArrivalsSettings} /></div>

        {/* Showcase position: Below New Arrivals */}
        <div className="order-6 md:order-none"><VisualProductShowcase settings={showcaseSettings} placement="below_new_arrivals" /></div>

        {/* Showcase position: Above Shop by Brand */}
        <div className="order-7 md:order-none"><VisualProductShowcase settings={showcaseSettings} placement="above_brand" /></div>

        {/* 4. Shop by Brand */}
        <div className="order-8 md:order-none"><CategoriesSection categories={categories} brands={brands} /></div>

        {/* Showcase position: Below Shop by Brand */}
        <div className="order-9 md:order-none"><VisualProductShowcase settings={showcaseSettings} placement="below_brand" /></div>

        {/* 5. Featured Mobile Phones */}
        <div className="order-10 md:order-none">
          <FeaturedProducts
            initialProducts={products}
            initialVisible={uiSettings?.showFeaturedProducts !== false}
          />
        </div>

        {/* Featured Collections (2-Column Editorial Grid) */}
        <div className="order-11 md:order-none"><FeaturedCollections settings={featuredCollectionsSettings} /></div>

        {/* Showcase position: Below Featured Phones */}
        <div className="order-12 md:order-none"><VisualProductShowcase settings={showcaseSettings} placement="below_featured_phones" /></div>

        {/* 6. Mobile Accessories promotional banner */}
        <div className="order-13 md:order-none"><CampaignPlacement placement="homepage_after_categories" /></div>

        {/* 7. Best Selling Products / Featured Accessories */}
        <div className="order-14 md:order-none"><FeaturedAccessories /></div>

        {/* Showcase position: Below Featured Accessories */}
        <div className="order-15 md:order-none"><VisualProductShowcase settings={showcaseSettings} placement="below_featured_accessories" /></div>

        {/* 8. Shop by Category (Carousel Slider) */}
        <div className="order-16 md:order-none"><ShopByCategoryCarousel categories={categories} /></div>

        {/* Showcase position: Below Shop by Category */}
        <div className="order-17 md:order-none"><VisualProductShowcase settings={showcaseSettings} placement="below_category" /></div>

        {/* 9. Store Gallery (Life at Street Mobile) */}
        <div className="order-18 md:order-none"><GallerySection images={galleryImages as GalleryImage[]} uiSettings={uiSettings} /></div>

        {/* Showcase position: Below Life at Street Mobile */}
        <div className="order-19 md:order-none"><VisualProductShowcase settings={showcaseSettings} placement="below_gallery" /></div>

        {/* 10. Google customer reviews */}
        <div className="order-20 md:order-none"><ReviewsSection reviews={reviews} settings={googleReviewsSettings} /></div>

        {/* Showcase position: Below Google Reviews */}
        <div className="order-21 md:order-none"><VisualProductShowcase settings={showcaseSettings} placement="below_reviews" /></div>

        {/* Showcase position: Above Why Choose Street Mobile */}
        <div className="order-22 md:order-none"><VisualProductShowcase settings={showcaseSettings} placement="above_why_choose" /></div>

        {/* 11. Trust/service strip (Why Choose Street Mobile) */}
        <div className="order-23 md:order-none"><TrustIndicators /></div>

        {/* Showcase position: Below Why Choose */}
        <div className="order-24 md:order-none"><VisualProductShowcase settings={showcaseSettings} placement="below_why_choose" /></div>

        {/* 12. Store Location & Contact */}
        <div className="order-25 md:order-none"><StoreLocation /></div>
      </div>
    </>
  );
}
