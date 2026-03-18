"use server";

import { createHash } from "crypto";
import { execute, queryOne } from "./db";
import { glossContent, type GlossParagraph } from "./gloss";

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export async function glossEntryAction(
  entryId: string,
  contentZh: string
): Promise<GlossParagraph[]> {
  const hash = hashContent(contentZh);

  // Check cache
  const cached = await queryOne<{ gloss_json: string }>(
    "SELECT gloss_json FROM gloss_cache WHERE entry_id = $1 AND content_hash = $2",
    [entryId, hash]
  );

  if (cached) {
    return JSON.parse(cached.gloss_json);
  }

  // Compute gloss
  const result = glossContent(contentZh);

  // Store in cache (upsert)
  await execute(
    `INSERT INTO gloss_cache (entry_id, content_hash, gloss_json, created_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT(entry_id) DO UPDATE SET
       content_hash = EXCLUDED.content_hash,
       gloss_json = EXCLUDED.gloss_json,
       created_at = NOW()`,
    [entryId, hash, JSON.stringify(result)]
  );

  return result;
}
