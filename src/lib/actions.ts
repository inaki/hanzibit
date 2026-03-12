"use server";

import { getDb } from "./db";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { DEV_USER_ID } from "./constants";

export async function toggleBookmarkAction(entryId: string) {
  const db = getDb();
  const entry = db
    .prepare("SELECT bookmarked FROM journal_entries WHERE id = ?")
    .get(entryId) as { bookmarked: number } | undefined;
  if (!entry) return;

  const newValue = entry.bookmarked ? 0 : 1;
  db.prepare("UPDATE journal_entries SET bookmarked = ? WHERE id = ?").run(
    newValue,
    entryId
  );
  revalidatePath("/notebook");
  return { bookmarked: newValue === 1 };
}

export async function createJournalEntry(formData: FormData) {
  const db = getDb();
  const id = randomUUID();
  const titleZh = formData.get("title_zh") as string;
  const titleEn = formData.get("title_en") as string;
  const contentZh = formData.get("content_zh") as string;
  const unit = (formData.get("unit") as string) || null;
  const hskLevel = parseInt((formData.get("hsk_level") as string) || "1", 10);

  if (!titleZh || !titleEn || !contentZh) {
    return { error: "Title and content are required." };
  }

  db.prepare(
    `INSERT INTO journal_entries (id, user_id, title_zh, title_en, unit, hsk_level, content_zh)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, DEV_USER_ID, titleZh, titleEn, unit, hskLevel, contentZh);

  revalidatePath("/notebook");
  return { id };
}

export async function updateJournalEntry(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const titleZh = formData.get("title_zh") as string;
  const titleEn = formData.get("title_en") as string;
  const contentZh = formData.get("content_zh") as string;
  const unit = (formData.get("unit") as string) || null;
  const hskLevel = parseInt((formData.get("hsk_level") as string) || "1", 10);

  if (!id || !titleZh || !titleEn || !contentZh) {
    return { error: "All fields are required." };
  }

  db.prepare(
    `UPDATE journal_entries SET title_zh = ?, title_en = ?, content_zh = ?, unit = ?, hsk_level = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(titleZh, titleEn, contentZh, unit, hskLevel, id);

  revalidatePath("/notebook");
  return { id };
}
