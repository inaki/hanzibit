import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getFlashcards } from "@/lib/data";
import { execute, queryOne } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cards = await getFlashcards(userId);
  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { cards, source_entry_id } = body as {
    cards: { front: string; back: string; deck?: string }[];
    source_entry_id?: string;
  };

  if (!Array.isArray(cards) || cards.length === 0) {
    return NextResponse.json({ error: "cards array is required" }, { status: 400 });
  }

  let saved = 0;
  let duplicates = 0;

  for (const card of cards) {
    if (!card.front || !card.back) continue;

    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM flashcards WHERE user_id = $1 AND front = $2",
      [userId, card.front]
    );

    if (existing) {
      duplicates++;
      continue;
    }

    await execute(
      `INSERT INTO flashcards (id, user_id, front, back, deck, source_entry_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), userId, card.front, card.back, card.deck ?? "journal", source_entry_id ?? null]
    );
    saved++;
  }

  return NextResponse.json({ saved, duplicates }, { status: 201 });
}
