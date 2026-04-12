export const FREE_DAILY_REVIEW_LIMIT = 5;

export function canReviewFlashcardFromCount(
  reviewCountToday: number,
  isPro: boolean
): boolean {
  if (isPro) return true;
  return reviewCountToday < FREE_DAILY_REVIEW_LIMIT;
}
