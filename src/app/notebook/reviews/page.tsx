import { getReviewHistory } from "@/lib/data";
import { DEV_USER_ID } from "@/lib/constants";
import { RecentReviewsList } from "@/components/notebook/recent-reviews-list";

export const dynamic = "force-dynamic";

export default function ReviewsPage() {
  const reviews = getReviewHistory(DEV_USER_ID);

  return (
    <div data-testid="reviews-page" className="h-full overflow-auto p-6 md:p-10">
      <RecentReviewsList items={reviews} />
    </div>
  );
}
