import HeroSection from "@/components/home/hero-section";
import TrustIndicators from "@/components/home/trust-indicators";
import CategoriesSection from "@/components/home/categories-section";
import NewArrivalsSection from "@/components/home/new-arrivals-section";
import FeaturedProducts from "@/components/home/featured-products";
import FeaturedAccessories from "@/components/home/featured-accessories";
import ShopByCategoryCarousel from "@/components/home/shop-by-category-carousel";
import ReviewsSection from "@/components/home/reviews-section";
import GallerySection from "@/components/home/gallery-section";
import StoreLocation from "@/components/home/store-location";
import CampaignPlacement from "@/components/ui/CampaignPlacement";

import { getCategories, getProducts, getReviews, getGalleryImages, getUiSettings } from "@/lib/firestore-client";
import { siteSettings } from "@/lib/data";
import { GalleryImage } from "@/lib/types";

export const revalidate = 60; // Revalidate cache every 60s for high performance

export default async function HomePage() {
  const [categories, products, reviews, galleryImages, uiSettings] = await Promise.all([
    getCategories(),
    getProducts(),
    getReviews(),
    getGalleryImages(),
    getUiSettings(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "name": siteSettings.store_name,
    "alternateName": "streetmobile.lk",
    "image": "https://www.streetmobile.lk/logo.png",
    "@id": "https://www.streetmobile.lk",
    "url": "https://www.streetmobile.lk",
    "telephone": "+94774141118",
    "email": siteSettings.email,
    "priceRange": "LKR",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": siteSettings.address,
      "addressLocality": "Vavuniya",
      "addressRegion": "Northern Province",
      "postalCode": "43000",
      "addressCountry": "LK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 8.7514,
      "longitude": 80.4971
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Sunday"],
        "opens": "10:00",
        "closes": "18:00"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 3. Premium hero banner slider */}
      <HeroSection />

      {/* 5. Shop by Category */}
      <CategoriesSection categories={categories} />

      {/* 6. New Arrivals */}
      <NewArrivalsSection initialProducts={products} />

      {/* 7. Featured Mobile Phones */}
      <FeaturedProducts />

      {/* 8. Mobile Accessories promotional banner */}
      <CampaignPlacement placement="homepage_after_categories" />

      {/* 9. Best Selling Products / Featured Accessories */}
      <FeaturedAccessories />

      {/* Trust/service strip */}
      <TrustIndicators />

      {/* 9B. Shop by Category (Carousel Slider) */}
      <ShopByCategoryCarousel />

      {/* 10. Brand/service benefits & Store Gallery */}
      <GallerySection images={galleryImages as GalleryImage[]} uiSettings={uiSettings} />

      {/* 11. Google customer reviews */}
      <ReviewsSection reviews={reviews} />

      {/* 12. Newsletter & Store Location */}
      <StoreLocation />
    </>
  );
}
