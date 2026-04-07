import { NextRequest, NextResponse } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getJournalEntry } from "@/lib/data";
import { execute } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const entry = await getJournalEntry(id);
  if (!entry || entry.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newValue = entry.bookmarked ? 0 : 1;
  await execute("UPDATE journal_entries SET bookmarked = $1 WHERE id = $2", [newValue, id]);

  return NextResponse.json({ bookmarked: newValue === 1 });
}
