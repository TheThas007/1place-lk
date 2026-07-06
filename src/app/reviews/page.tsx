import { getReviews } from "@/lib/firestore-client";
import ReviewsClient from "./reviews-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ReviewsPage() {
  const reviews = await getReviews();
  return <ReviewsClient initialReviews={reviews} />;
}
