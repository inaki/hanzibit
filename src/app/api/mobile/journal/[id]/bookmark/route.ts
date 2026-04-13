import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getOwnedJournalEntry } from "@/lib/data";
import { execute } from "@/lib/db";
import { mobileError, mobileOk } from "@/lib/mobile-api";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const { id } = await params;
  const entry = await getOwnedJournalEntry(userId, id);
  if (!entry) {
    return mobileError("Not found", 404);
  }

  const newValue = entry.bookmarked ? 0 : 1;
  await execute("UPDATE journal_entries SET bookmarked = $1 WHERE id = $2", [newValue, id]);

  return mobileOk({ bookmarked: newValue === 1 });
}
