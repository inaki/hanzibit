import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getJournalEntries } from "@/lib/data";
import { execute } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await getJournalEntries(userId);
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title_zh, title_en, content_zh, unit, hsk_level } = body;

  if (!title_zh || !title_en || !content_zh) {
    return NextResponse.json({ error: "title_zh, title_en, and content_zh are required" }, { status: 400 });
  }

  const id = randomUUID();
  const level = parseInt(hsk_level ?? "1", 10);

  await execute(
    `INSERT INTO journal_entries (id, user_id, title_zh, title_en, unit, hsk_level, content_zh)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, userId, title_zh, title_en, unit ?? null, level, content_zh]
  );

  return NextResponse.json({ id }, { status: 201 });
}
