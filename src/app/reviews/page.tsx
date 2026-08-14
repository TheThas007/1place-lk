import { getReviews, getGoogleReviewsSettings } from "@/lib/firestore-client";
import ReviewsClient from "./reviews-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ReviewsPage() {
  const [reviews, settings] = await Promise.all([
    getReviews(),
    getGoogleReviewsSettings(),
  ]);
  return <ReviewsClient initialReviews={reviews} googleSettings={settings} />;
}
