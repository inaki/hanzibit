import { isProUser } from "./subscription";
import { queryOne } from "./db";
import { canReviewFlashcardFromCount } from "./review-policy";
import { canAccessHskLevelFromPlan } from "./access-policy";

export async function canReviewFlashcard(userId: string): Promise<boolean> {
  const pro = await isProUser(userId);
  if (pro) return true;

  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int AS count
     FROM review_history
     WHERE user_id = $1
       AND item_type = 'flashcard'
       AND reviewed_at >= CURRENT_DATE`,
    [userId]
  );

  return canReviewFlashcardFromCount(row?.count ?? 0, pro);
}

export async function canAccessHskLevel(userId: string, level: number): Promise<boolean> {
  return canAccessHskLevelFromPlan(level, await isProUser(userId));
}
