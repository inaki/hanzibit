import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getJournalEntries } from "@/lib/data";
import { execute } from "@/lib/db";
import { validateInlineMarkup } from "@/lib/parse-tokens";
import {
  mobileError,
  mobileOk,
  parseLevel,
  requireObject,
  requireString,
} from "@/lib/mobile-api";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const entries = await getJournalEntries(userId);
  return mobileOk(entries);
}

export async function POST(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  if (!checkRateLimit(`journal:${userId}`, 30, 60_000)) {
    return mobileError("Rate limit exceeded", 429);
  }

  const body = requireObject(await req.json());
  if ("error" in body) return mobileError(body.error, 400);
  const titleZh = requireString(body.title_zh, "title_zh");
  const titleEn = requireString(body.title_en, "title_en");
  const contentZh = requireString(body.content_zh, "content_zh");
  const level = parseLevel(body.hsk_level);
  const sourceType = typeof body.source_type === "string" ? body.source_type.trim() || null : null;
  const sourceRef = typeof body.source_ref === "string" ? body.source_ref.trim() || null : null;
  const sourcePrompt = typeof body.source_prompt === "string" ? body.source_prompt.trim() || null : null;
  if (typeof titleZh !== "string") return mobileError(titleZh.error, 400);
  if (typeof titleEn !== "string") return mobileError(titleEn.error, 400);
  if (typeof contentZh !== "string") return mobileError(contentZh.error, 400);
  if (typeof level !== "number") return mobileError(level.error, 400);
  const markupIssues = validateInlineMarkup(contentZh);
  if (markupIssues.length > 0) return mobileError(markupIssues[0].message, 400);

  const id = randomUUID();

  await execute(
    `INSERT INTO journal_entries (
       id,
       user_id,
       title_zh,
       title_en,
       unit,
       hsk_level,
       content_zh,
       source_type,
       source_ref,
       source_prompt
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, userId, titleZh, titleEn, body.unit ?? null, level, contentZh, sourceType, sourceRef, sourcePrompt]
  );

  return mobileOk({ id }, 201);
}
