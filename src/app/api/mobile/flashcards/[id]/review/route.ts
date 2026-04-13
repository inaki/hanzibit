import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { updateFlashcardReview, addReviewRecord, getOwnedFlashcard } from "@/lib/data";
import { canReviewFlashcard } from "@/lib/gates";
import { sm2 } from "@/lib/sm2";
import { mobileError, mobileOk, parseQuality, requireObject } from "@/lib/mobile-api";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  if (!(await canReviewFlashcard(userId))) {
    return mobileError("DAILY_LIMIT_REACHED", 403);
  }

  const { id } = await params;
  const body = requireObject(await req.json());
  if ("error" in body) return mobileError(body.error, 400);
  const quality = parseQuality(body.quality);
  if (typeof quality !== "number") return mobileError(quality.error, 400);

  const card = await getOwnedFlashcard(userId, id);
  if (!card) {
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
