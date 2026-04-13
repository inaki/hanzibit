"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { execute, queryOne } from "./db";
import { getAuthUserId } from "./auth-utils";
import {
  getCharacterOfTheDay,
  getOwnedFlashcard,
  getOwnedJournalEntry,
  getUserProgress,
  getStudyGuideData,
  getUserStreak,
  getUserStats,
  getWeakFlashcards,
  updateFlashcardReview,
  addReviewRecord,
  searchHskWords,
  type Flashcard,
  type HskWord,
  type StudyGuideData,
} from "./data";
import { canReviewFlashcard, canAccessHskLevel } from "./gates";
import { sm2 } from "./sm2";
import { validateInlineMarkup } from "./parse-tokens";
import type { DailyPracticePlan } from "./daily-practice";
import { getDailyPracticePlanForUser } from "./daily-practice-service";

export async function toggleBookmarkAction(entryId: string) {
  const userId = await getAuthUserId();
  const entry = await getOwnedJournalEntry(userId, entryId);
  if (!entry) return;

  const newValue = entry.bookmarked ? 0 : 1;
  await execute(
    "UPDATE journal_entries SET bookmarked = $1 WHERE id = $2",
    [newValue, entryId]
  );

  revalidatePath("/notebook");
  return { bookmarked: newValue === 1 };
}

export async function createJournalEntry(formData: FormData) {
  const userId = await getAuthUserId();
  const id = randomUUID();
  const titleZh = formData.get("title_zh") as string;
  const titleEn = formData.get("title_en") as string;
  const contentZh = formData.get("content_zh") as string;
  const unit = (formData.get("unit") as string) || null;
  const hskLevel = parseInt((formData.get("hsk_level") as string) || "1", 10);
  const sourceType = (formData.get("source_type") as string) || null;
  const sourceRef = (formData.get("source_ref") as string) || null;
  const sourcePrompt = (formData.get("source_prompt") as string) || null;

  if (!titleZh || !titleEn || !contentZh) {
    return { error: "Title and content are required." };
  }

  const markupIssues = validateInlineMarkup(contentZh);
  if (markupIssues.length > 0) {
    return { error: markupIssues[0].message };
  }

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
    [id, userId, titleZh, titleEn, unit, hskLevel, contentZh, sourceType, sourceRef, sourcePrompt]
  );

  revalidatePath("/notebook");
  return { id };
}

export async function updateJournalEntry(formData: FormData) {
  const userId = await getAuthUserId();
  const id = formData.get("id") as string;
  const titleZh = formData.get("title_zh") as string;
  const titleEn = formData.get("title_en") as string;
  const contentZh = formData.get("content_zh") as string;
  const unit = (formData.get("unit") as string) || null;
  const hskLevel = parseInt((formData.get("hsk_level") as string) || "1", 10);

  if (!id || !titleZh || !titleEn || !contentZh) {
    return { error: "All fields are required." };
  }

  const markupIssues = validateInlineMarkup(contentZh);
  if (markupIssues.length > 0) {
    return { error: markupIssues[0].message };
  }

  const existing = await getOwnedJournalEntry(userId, id);
  if (!existing) {
    return { error: "Entry not found." };
  }

  await execute(
    `UPDATE journal_entries
     SET title_zh = $1,
         title_en = $2,
         content_zh = $3,
         unit = $4,
         hsk_level = $5,
         updated_at = NOW()
     WHERE id = $6`,
    [titleZh, titleEn, contentZh, unit, hskLevel, id]
  );

  revalidatePath("/notebook");
  return { id };
}

export async function deleteJournalEntry(entryId: string): Promise<{ success: true } | { error: string }> {
  if (!entryId) {
    return { error: "Entry ID is required." };
  }

  const userId = await getAuthUserId();
  const existing = await getOwnedJournalEntry(userId, entryId);
  if (!existing) {
    return { error: "Entry not found." };
  }

  await execute("DELETE FROM journal_entries WHERE id = $1", [entryId]);
  revalidatePath("/notebook");
  revalidatePath("/notebook/dashboard");
  return { success: true };
}

export async function getCharacterOfTheDayAction(
  level: number
): Promise<HskWord | null> {
  return getCharacterOfTheDay(level);
}

export async function saveFlashcardsFromEntry(
  entryId: string,
  cards: { front: string; back: string }[]
): Promise<{ saved: number; duplicates: number }> {
  const userId = await getAuthUserId();
  const sourceEntry = await getOwnedJournalEntry(userId, entryId);
  if (!sourceEntry) {
    throw new Error("Entry not found");
  }

  let saved = 0;
  let duplicates = 0;

  for (const card of cards) {
    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM flashcards WHERE user_id = $1 AND front = $2",
      [userId, card.front]
    );

    if (existing) {
      duplicates++;
      continue;
    }

    await execute(
      `INSERT INTO flashcards (id, user_id, front, back, deck, source_entry_id)
       VALUES ($1, $2, $3, $4, 'journal', $5)`,
      [randomUUID(), userId, card.front, card.back, entryId]
    );
    saved++;
  }

  revalidatePath("/notebook/flashcards");
  return { saved, duplicates };
}

export async function reviewFlashcard(
  cardId: string,
  quality: number
): Promise<{ interval: number; easeFactor: number } | { error: "DAILY_LIMIT_REACHED" }> {
  const userId = await getAuthUserId();

  if (!(await canReviewFlashcard(userId))) {
    return { error: "DAILY_LIMIT_REACHED" };
  }

  const card = await getOwnedFlashcard(userId, cardId);
  if (!card) throw new Error("Card not found");

  const { interval, easeFactor } = sm2(
    quality,
    card.interval_days,
    card.ease_factor,
    card.review_count
  );

  await updateFlashcardReview(card.id, interval, easeFactor);
  await addReviewRecord(userId, "flashcard", card.id, card.front, quality);

  revalidatePath("/notebook/flashcards");
  return { interval, easeFactor };
}

export async function getDueCountAction(): Promise<number> {
  const userId = await getAuthUserId();
  return getDueFlashcardCount(userId);
}

export async function getDailyPracticeAction(level: number): Promise<DailyPracticePlan> {
  const userId = await getAuthUserId();
  return getDailyPracticePlanForUser(userId, level);
}

export async function getProgressAction(
  level: number
): Promise<{ encountered: number; total: number; percent: number }> {
  const userId = await getAuthUserId();
  return getUserProgress(userId, level);
}

export async function getStudyGuideDataAction(
  level: number
): Promise<StudyGuideData> {
  const userId = await getAuthUserId();
  if (!(await canAccessHskLevel(userId, level))) {
    return {
      level,
      locked: true,
      words: [],
      grammarPoints: [],
      summary: { total: 0, encountered: 0, withFlashcard: 0, dueForReview: 0 },
    };
  }
  return getStudyGuideData(userId, level);
}

export async function getStreakAction(): Promise<number> {
  const userId = await getAuthUserId();
  return getUserStreak(userId);
}

export async function getWeakFlashcardsAction(limit = 3): Promise<Flashcard[]> {
  const userId = await getAuthUserId();
  return getWeakFlashcards(userId, limit);
}

export async function getUserStatsAction() {
  const userId = await getAuthUserId();
  return getUserStats(userId);
}

export async function searchHskWordsAction(
  query: string
): Promise<HskWord[]> {
  if (!query || query.trim().length === 0) return [];
  return searchHskWords(query.trim());
}

export async function createFlashcardForWord(
  simplified: string,
  pinyin: string,
  english: string
): Promise<{ id: string } | { duplicate: true }> {
  const userId = await getAuthUserId();
  const existing = await queryOne<{ id: string }>(
    "SELECT id FROM flashcards WHERE user_id = $1 AND front = $2",
    [userId, simplified]
  );

  if (existing) return { duplicate: true };

  const id = randomUUID();
  await execute(
    `INSERT INTO flashcards (id, user_id, front, back, deck)
     VALUES ($1, $2, $3, $4, 'study-guide')`,
    [id, userId, simplified, `${pinyin} — ${english}`]
  );

  revalidatePath("/notebook/flashcards");
  return { id };
}
