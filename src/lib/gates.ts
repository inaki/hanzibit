import { isProUser } from "./subscription";
import { queryOne } from "./db";

const FREE_DAILY_REVIEW_LIMIT = 5;

export async function canReviewFlashcard(userId: string): Promise<boolean> {
  if (await isProUser(userId)) return true;

  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int AS count
     FROM review_history
     WHERE user_id = $1
       AND item_type = 'flashcard'
       AND reviewed_at >= CURRENT_DATE`,
    [userId]
  );

  return (row?.count ?? 0) < FREE_DAILY_REVIEW_LIMIT;
}

export async function canAccessHskLevel(userId: string, level: number): Promise<boolean> {
  if (level <= 1) return true;
  return isProUser(userId);
}
