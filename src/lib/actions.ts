"use server";

import { getDb } from "./db";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { DEV_USER_ID } from "./constants";
import {
  getCharacterOfTheDay,
  getDueFlashcardCount,
  getUserProgress,
  getStudyGuideData,
  updateFlashcardReview,
  addReviewRecord,
  type HskWord,
  type StudyGuideData,
} from "./data";
import { sm2 } from "./sm2";

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

// --- Character of the Day ---

export async function getCharacterOfTheDayAction(
  level: number
): Promise<HskWord | null> {
  return getCharacterOfTheDay(level);
}

// --- Save Flashcards from Entry ---

export async function saveFlashcardsFromEntry(
  entryId: string,
  cards: { front: string; back: string }[]
): Promise<{ saved: number; duplicates: number }> {
  const db = getDb();
  let saved = 0;
  let duplicates = 0;

  for (const card of cards) {
    const existing = db
      .prepare("SELECT id FROM flashcards WHERE user_id = ? AND front = ?")
      .get(DEV_USER_ID, card.front);

    if (existing) {
      duplicates++;
      continue;
    }

    const id = randomUUID();
    db.prepare(
      `INSERT INTO flashcards (id, user_id, front, back, deck, source_entry_id)
       VALUES (?, ?, ?, ?, 'journal', ?)`
    ).run(id, DEV_USER_ID, card.front, card.back, entryId);
    saved++;
  }

  revalidatePath("/notebook/flashcards");
  return { saved, duplicates };
}

// --- Review Flashcard with SM-2 ---

export async function reviewFlashcard(
  cardId: string,
  quality: number
): Promise<{ interval: number; easeFactor: number }> {
  const db = getDb();
  const card = db
    .prepare("SELECT * FROM flashcards WHERE id = ?")
    .get(cardId) as {
    id: string;
    front: string;
    interval_days: number;
    ease_factor: number;
    review_count: number;
  } | undefined;

  if (!card) throw new Error("Card not found");

  const { interval, easeFactor } = sm2(
    quality,
    card.interval_days,
    card.ease_factor,
    card.review_count
  );

  updateFlashcardReview(card.id, interval, easeFactor);
  addReviewRecord(DEV_USER_ID, "flashcard", card.id, card.front, quality);

  revalidatePath("/notebook/flashcards");
  return { interval, easeFactor };
}

// --- Due Count ---

export async function getDueCountAction(): Promise<number> {
  return getDueFlashcardCount(DEV_USER_ID);
}

// --- Progress ---

export async function getProgressAction(
  level: number
): Promise<{ encountered: number; total: number; percent: number }> {
  return getUserProgress(DEV_USER_ID, level);
}

// --- Study Guide ---

export async function getStudyGuideDataAction(
  level: number
): Promise<StudyGuideData> {
  return getStudyGuideData(DEV_USER_ID, level);
}

// --- Create Flashcard for Word ---

export async function createFlashcardForWord(
  simplified: string,
  pinyin: string,
  english: string
): Promise<{ id: string } | { duplicate: true }> {
  const db = getDb();

  const existing = db
    .prepare("SELECT id FROM flashcards WHERE user_id = ? AND front = ?")
    .get(DEV_USER_ID, simplified);

  if (existing) return { duplicate: true };

  const id = randomUUID();
  db.prepare(
    `INSERT INTO flashcards (id, user_id, front, back, deck)
     VALUES (?, ?, ?, ?, 'study-guide')`
  ).run(id, DEV_USER_ID, simplified, `${pinyin} — ${english}`);

  revalidatePath("/notebook/flashcards");
  return { id };
}
