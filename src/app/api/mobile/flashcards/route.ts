import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getFlashcards } from "@/lib/data";
import { execute, queryOne } from "@/lib/db";
import { mobileError, mobileOk, requireArray, requireObject, requireString } from "@/lib/mobile-api";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const cards = await getFlashcards(userId);
  return mobileOk(cards);
}

export async function POST(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const body = requireObject(await req.json());
  if ("error" in body) return mobileError(body.error, 400);
  const cards = requireArray<{ front: string; back: string; deck?: string }>(body.cards, "cards");
  if (!("error" in cards) && cards.length === 0) {
    return mobileError("cards array is required", 400);
  }
  if ("error" in cards) return mobileError(cards.error, 400);
  const source_entry_id = typeof body.source_entry_id === "string" ? body.source_entry_id : undefined;

  let saved = 0;
  let duplicates = 0;
  let invalid = 0;
  let sourceEntryId: string | null = null;

  if (source_entry_id) {
    const sourceEntry = await queryOne<{ id: string; user_id: string }>(
      "SELECT id, user_id FROM journal_entries WHERE id = $1",
      [source_entry_id]
    );

    if (!sourceEntry || sourceEntry.user_id !== userId) {
      return mobileError("source_entry_id not found", 404);
    }

    sourceEntryId = sourceEntry.id;
  }

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
      [randomUUID(), userId, front, back, card.deck ?? "journal", sourceEntryId]
    );
    saved++;
  }

  return mobileOk({ saved, duplicates, invalid }, 201);
}
