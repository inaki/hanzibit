import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { updateFlashcardReview, addReviewRecord } from "@/lib/data";
import { canReviewFlashcard } from "@/lib/gates";
import { sm2 } from "@/lib/sm2";
import { queryOne } from "@/lib/db";
import { mobileError, mobileOk } from "@/lib/mobile-api";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  if (!(await canReviewFlashcard(userId))) {
    return mobileError("DAILY_LIMIT_REACHED", 403);
  }

  const { id } = await params;
  const body = await req.json();
  const quality = parseInt(body.quality ?? "3", 10);

  if (quality < 1 || quality > 5) {
    return mobileError("quality must be between 1 and 5", 400);
  }

  const card = await queryOne<{
    id: string;
    front: string;
    user_id: string;
    interval_days: number;
    ease_factor: number;
    review_count: number;
  }>("SELECT * FROM flashcards WHERE id = $1", [id]);

  if (!card || card.user_id !== userId) {
    return mobileError("Not found", 404);
  }

  const { interval, easeFactor } = sm2(
    quality,
    card.interval_days,
    card.ease_factor,
    card.review_count
  );

  await updateFlashcardReview(card.id, interval, easeFactor);
  await addReviewRecord(userId, "flashcard", card.id, card.front, quality);

  return mobileOk({ interval, ease_factor: easeFactor });
}
