import { Metadata } from "next";
import { getReviews, getGoogleReviewsSettings } from "@/lib/firestore-client";
import ReviewsClient from "./reviews-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Customer Reviews & Ratings | Street Mobile Sri Lanka",
  description: "Read genuine customer reviews, unboxing experiences, and verified ratings for smartphones and accessories purchased from Street Mobile Vavuniya.",
  alternates: {
    canonical: "https://www.streetmobile.lk/reviews",
  },
  openGraph: {
    title: "Customer Reviews & Ratings | Street Mobile",
    description: "Read genuine customer reviews and ratings for Street Mobile Vavuniya.",
    url: "https://www.streetmobile.lk/reviews",
    type: "website",
    siteName: "Street Mobile",
  },
};

export default async function ReviewsPage() {
  const [reviews, settings] = await Promise.all([
    getReviews(),
    getGoogleReviewsSettings(),
  ]);
  return <ReviewsClient initialReviews={reviews} googleSettings={settings} />;
}
