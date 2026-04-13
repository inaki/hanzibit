import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getOwnedJournalEntry } from "@/lib/data";
import { execute } from "@/lib/db";
import { validateInlineMarkup } from "@/lib/parse-tokens";
import {
  mobileError,
  mobileOk,
  parseLevel,
  requireObject,
  requireString,
} from "@/lib/mobile-api";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const { id } = await params;
  const entry = await getOwnedJournalEntry(userId, id);
  if (!entry) {
    return mobileError("Not found", 404);
  }

  return mobileOk(entry);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const { id } = await params;
  const existing = await getOwnedJournalEntry(userId, id);
  if (!existing) {
    return mobileError("Not found", 404);
  }

  const body = requireObject(await req.json());
  if ("error" in body) return mobileError(body.error, 400);
  const titleZh = requireString(body.title_zh, "title_zh");
  const titleEn = requireString(body.title_en, "title_en");
  const contentZh = requireString(body.content_zh, "content_zh");
  const level = parseLevel(body.hsk_level);
  if (typeof titleZh !== "string") return mobileError(titleZh.error, 400);
  if (typeof titleEn !== "string") return mobileError(titleEn.error, 400);
  if (typeof contentZh !== "string") return mobileError(contentZh.error, 400);
  if (typeof level !== "number") return mobileError(level.error, 400);
  const markupIssues = validateInlineMarkup(contentZh);
  if (markupIssues.length > 0) return mobileError(markupIssues[0].message, 400);

  await execute(
    `UPDATE journal_entries
     SET title_zh = $1, title_en = $2, content_zh = $3, unit = $4, hsk_level = $5, updated_at = NOW()
     WHERE id = $6`,
    [titleZh, titleEn, contentZh, body.unit ?? null, level, id]
  );

  return mobileOk({ id });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const { id } = await params;
  const existing = await getOwnedJournalEntry(userId, id);
  if (!existing) {
    return mobileError("Not found", 404);
  }

  await execute("DELETE FROM journal_entries WHERE id = $1", [id]);
  return mobileOk({ deleted: true });
}
