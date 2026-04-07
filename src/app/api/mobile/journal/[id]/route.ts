import { NextRequest, NextResponse } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getJournalEntry } from "@/lib/data";
import { execute } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const entry = await getJournalEntry(id);
  if (!entry || entry.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(entry);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getJournalEntry(id);
  if (!existing || existing.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title_zh, title_en, content_zh, unit, hsk_level } = body;

  if (!title_zh || !title_en || !content_zh) {
    return NextResponse.json({ error: "title_zh, title_en, and content_zh are required" }, { status: 400 });
  }

  await execute(
    `UPDATE journal_entries
     SET title_zh = $1, title_en = $2, content_zh = $3, unit = $4, hsk_level = $5, updated_at = NOW()
     WHERE id = $6`,
    [title_zh, title_en, content_zh, unit ?? null, parseInt(hsk_level ?? "1", 10), id]
  );

  return NextResponse.json({ id });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getJournalEntry(id);
  if (!existing || existing.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await execute("DELETE FROM journal_entries WHERE id = $1", [id]);
  return NextResponse.json({ deleted: true });
}
