import { NextRequest, NextResponse } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { updateFlashcardReview, addReviewRecord } from "@/lib/data";
import { canReviewFlashcard } from "@/lib/gates";
import { sm2 } from "@/lib/sm2";
import { queryOne } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await canReviewFlashcard(userId))) {
    return NextResponse.json({ error: "DAILY_LIMIT_REACHED" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const quality = parseInt(body.quality ?? "3", 10);

  if (quality < 1 || quality > 5) {
    return NextResponse.json({ error: "quality must be between 1 and 5" }, { status: 400 });
  }

  const card = await queryOne<{
    id: string;
    front: string;
    user_id: string;
    interval_days: number;
    ease_factor: number;
    review_count: number;
  }>("SELECT * FROM flashcards WHERE id = $1", [id]);

  console.log("[review] card.user_id:", card?.user_id);
  console.log("[review] session userId:", userId);

  if (!card || card.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { interval, easeFactor } = sm2(
    quality,
    card.interval_days,
    card.ease_factor,
    card.review_count
  );

  await updateFlashcardReview(card.id, interval, easeFactor);
  await addReviewRecord(userId, "flashcard", card.id, card.front, quality);

  return NextResponse.json({ interval, ease_factor: easeFactor });
}
