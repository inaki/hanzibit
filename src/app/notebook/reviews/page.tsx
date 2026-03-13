import { getReviewHistory } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-utils";
import { RecentReviewsList } from "@/components/notebook/recent-reviews-list";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const userId = await getAuthUserId();
  const reviews = getReviewHistory(userId);

  return (
    <div data-testid="reviews-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <RecentReviewsList items={reviews} />
    </div>
  );
}
