import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getJournalEntries } from "@/lib/data";
import { execute } from "@/lib/db";
import {
  mobileError,
  mobileOk,
  parseLevel,
  requireString,
} from "@/lib/mobile-api";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const entries = await getJournalEntries(userId);
  return mobileOk(entries);
}

export async function POST(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const body = await req.json();
  const titleZh = requireString(body.title_zh, "title_zh");
  const titleEn = requireString(body.title_en, "title_en");
  const contentZh = requireString(body.content_zh, "content_zh");
  const level = parseLevel(body.hsk_level);
  if (typeof titleZh !== "string") return mobileError(titleZh.error, 400);
  if (typeof titleEn !== "string") return mobileError(titleEn.error, 400);
  if (typeof contentZh !== "string") return mobileError(contentZh.error, 400);
  if (typeof level !== "number") return mobileError(level.error, 400);

  const id = randomUUID();

  await execute(
    `INSERT INTO journal_entries (id, user_id, title_zh, title_en, unit, hsk_level, content_zh)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, userId, titleZh, titleEn, body.unit ?? null, level, contentZh]
  );

  return mobileOk({ id }, 201);
}
