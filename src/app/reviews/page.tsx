import { Metadata } from "next";
import { getReviews, getGoogleReviewsSettings } from "@/lib/firestore-client";
import ReviewsClient from "./reviews-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Customer Reviews & Ratings | 1PLACE.LK Sri Lanka",
  description: "Read genuine customer reviews, unboxing experiences, and verified ratings for smartphones and electronics purchased from 1PLACE.LK Sri Lanka.",
  alternates: {
    canonical: "https://www.1place.lk/reviews",
  },
  openGraph: {
    title: "Customer Reviews & Ratings | 1PLACE.LK",
    description: "Read genuine customer reviews and ratings for 1PLACE.LK Sri Lanka.",
    url: "https://www.1place.lk/reviews",
    type: "website",
    siteName: "1PLACE.LK",
  },
};

export default async function ReviewsPage() {
  const [reviews, settings] = await Promise.all([
    getReviews().catch(() => []),
    getGoogleReviewsSettings().catch(() => null),
  ]);

  const ratingVal = settings?.overall_rating || 4.9;
  const reviewCount = settings?.total_reviews_count || (reviews.length > 0 ? reviews.length : 500);

  const reviewsJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "1PLACE.LK Store Experience & Products",
    "image": "https://www.1place.lk/logo.svg",
    "description": "Customer reviews and verified ratings for genuine smartphones and electronics at 1PLACE.LK Sri Lanka.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingVal.toString(),
      "reviewCount": reviewCount.toString(),
      "bestRating": "5",
      "worstRating": "1",
    },
    "review": reviews.slice(0, 10).map((r) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.author_name || (r as any).name || "Customer",
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": (r.rating || 5).toString(),
        "bestRating": "5",
        "worstRating": "1",
      },
      "reviewBody": r.text || (r as any).comment || "Great service and authentic devices.",
    })),
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.1place.lk",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Customer Reviews",
        "item": "https://www.1place.lk/reviews",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <ReviewsClient initialReviews={reviews} googleSettings={settings as any} />
    </>
  );
}
