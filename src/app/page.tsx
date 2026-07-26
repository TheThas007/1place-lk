import HeroSection from "@/components/home/hero-section";
import TrustIndicators from "@/components/home/trust-indicators";
import FeaturedProducts from "@/components/home/featured-products";
import CategoriesSection from "@/components/home/categories-section";
import ReviewsSection from "@/components/home/reviews-section";
import GallerySection from "@/components/home/gallery-section";
import StoreLocation from "@/components/home/store-location";
import CampaignPlacement from "@/components/ui/CampaignPlacement";

import { getCategories, getReviews, getGalleryImages, getUiSettings } from "@/lib/firestore-client";
import { GalleryImage } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const [categories, reviews, galleryImages, uiSettings] = await Promise.all([
    getCategories(),
    getReviews(),
    getGalleryImages(),
    getUiSettings(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "name": "STREET MOBILE",
    "alternateName": "streetmobile.lk",
    "image": "https://www.streetmobile.lk/logo.png",
    "@id": "https://www.streetmobile.lk",
    "url": "https://www.streetmobile.lk",
    "telephone": "+94774141118",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Vavuniya",
      "addressLocality": "Vavuniya",
      "addressRegion": "NP",
      "postalCode": "43000",
      "addressCountry": "LK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 8.7514,
      "longitude": 80.4971
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "09:00",
      "closes": "21:00"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <TrustIndicators />
      <FeaturedProducts />
      <CategoriesSection categories={categories} />
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <CampaignPlacement placement="homepage_after_categories" />
      </div>
      <GallerySection images={galleryImages as GalleryImage[]} uiSettings={uiSettings} />
      <ReviewsSection reviews={reviews} />
      <StoreLocation />
    </>
  );
}
