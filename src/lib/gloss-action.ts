"use server";

import { createHash } from "crypto";
import { getDb } from "./db";
import { glossContent, type GlossParagraph } from "./gloss";

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export async function glossEntryAction(
  entryId: string,
  contentZh: string
): Promise<GlossParagraph[]> {
  const db = getDb();
  const hash = hashContent(contentZh);

  // Check cache
  const cached = db
    .prepare(
      "SELECT gloss_json FROM gloss_cache WHERE entry_id = ? AND content_hash = ?"
    )
    .get(entryId, hash) as { gloss_json: string } | undefined;

  if (cached) {
    return JSON.parse(cached.gloss_json);
  }

  // Compute gloss
  const result = glossContent(contentZh);

  // Store in cache (upsert)
  db.prepare(
    `INSERT INTO gloss_cache (entry_id, content_hash, gloss_json, created_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(entry_id) DO UPDATE SET content_hash = ?, gloss_json = ?, created_at = datetime('now')`
  ).run(entryId, hash, JSON.stringify(result), hash, JSON.stringify(result));

  return result;
}
