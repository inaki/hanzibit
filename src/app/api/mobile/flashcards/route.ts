import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getFlashcards } from "@/lib/data";
import { execute, queryOne } from "@/lib/db";
import { mobileError, mobileOk, requireString } from "@/lib/mobile-api";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const cards = await getFlashcards(userId);
  return mobileOk(cards);
}

export async function POST(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const body = await req.json();
  const { cards, source_entry_id } = body as {
    cards: { front: string; back: string; deck?: string }[];
    source_entry_id?: string;
  };

  if (!Array.isArray(cards) || cards.length === 0) {
    return mobileError("cards array is required", 400);
  }

  let saved = 0;
  let duplicates = 0;
  let invalid = 0;

  for (const card of cards) {
    const front = requireString(card.front, "front");
    const back = requireString(card.back, "back");
    if (typeof front !== "string" || typeof back !== "string") {
      invalid++;
      continue;
    }

    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM flashcards WHERE user_id = $1 AND front = $2",
      [userId, front]
    );

    if (existing) {
      duplicates++;
      continue;
    }

    await execute(
      `INSERT INTO flashcards (id, user_id, front, back, deck, source_entry_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), userId, front, back, card.deck ?? "journal", source_entry_id ?? null]
    );
    saved++;
  }

  return mobileOk({ saved, duplicates, invalid }, 201);
}
