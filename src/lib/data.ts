import { getDb } from "./db";

// --- Types ---

export interface JournalEntry {
  id: string;
  user_id: string;
  title_zh: string;
  title_en: string;
  unit: string | null;
  hsk_level: number;
  content_zh: string;
  bookmarked: number;
  created_at: string;
  updated_at: string;
}

export interface EntryAnnotation {
  id: string;
  entry_id: string;
  type: "grammar_tip" | "mnemonic";
  title: string;
  content: string;
}

export interface VocabularyItem {
  id: string;
  user_id: string;
  character_zh: string;
  pinyin: string;
  meaning: string;
  hsk_level: number;
  category: string;
  mastery: number;
  created_at: string;
  last_reviewed: string | null;
}

export interface GrammarPoint {
  id: string;
  user_id: string;
  title: string;
  pattern: string | null;
  explanation: string;
  examples: string; // JSON array
  hsk_level: number;
  created_at: string;
}

export interface Flashcard {
  id: string;
  user_id: string;
  front: string;
  back: string;
  deck: string;
  next_review: string;
  interval_days: number;
  ease_factor: number;
  review_count: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  unit: string;
  hsk_level: number;
  description: string | null;
  content: string;
  sort_order: number;
}

export interface ReviewHistoryItem {
  id: string;
  user_id: string;
  item_type: "vocabulary" | "flashcard" | "grammar";
  item_id: string;
  item_label: string;
  score: number;
  reviewed_at: string;
}

// --- Journal Entries ---

export function getJournalEntries(userId: string): JournalEntry[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as JournalEntry[];
}

export function getJournalEntry(id: string): JournalEntry | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM journal_entries WHERE id = ?").get(id) as
    | JournalEntry
    | undefined;
}

export function getEntryAnnotations(entryId: string): EntryAnnotation[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM entry_annotations WHERE entry_id = ?")
    .all(entryId) as EntryAnnotation[];
}

export function toggleBookmark(entryId: string): void {
  const db = getDb();
  db.prepare(
    "UPDATE journal_entries SET bookmarked = CASE WHEN bookmarked = 1 THEN 0 ELSE 1 END WHERE id = ?"
  ).run(entryId);
}

// --- Vocabulary ---

export function getVocabulary(userId: string): VocabularyItem[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM vocabulary WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as VocabularyItem[];
}

export function getVocabularyByHskLevel(
  userId: string,
  level: number
): VocabularyItem[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM vocabulary WHERE user_id = ? AND hsk_level = ? ORDER BY character_zh"
    )
    .all(userId, level) as VocabularyItem[];
}

// --- Grammar Points ---

export function getGrammarPoints(userId: string): GrammarPoint[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM grammar_points WHERE user_id = ? ORDER BY hsk_level, created_at")
    .all(userId) as GrammarPoint[];
}

// --- Flashcards ---

export function getFlashcards(userId: string): Flashcard[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM flashcards WHERE user_id = ? ORDER BY next_review ASC")
    .all(userId) as Flashcard[];
}

export function getDueFlashcards(userId: string): Flashcard[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM flashcards WHERE user_id = ? AND next_review <= datetime('now') ORDER BY next_review ASC"
    )
    .all(userId) as Flashcard[];
}

export function updateFlashcardReview(
  id: string,
  intervalDays: number,
  easeFactor: number
): void {
  const db = getDb();
  db.prepare(
    `UPDATE flashcards
     SET next_review = datetime('now', '+' || ? || ' days'),
         interval_days = ?,
         ease_factor = ?,
         review_count = review_count + 1
     WHERE id = ?`
  ).run(intervalDays, intervalDays, easeFactor, id);
}

// --- Lessons ---

export function getLessons(): Lesson[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM lessons ORDER BY hsk_level, sort_order")
    .all() as Lesson[];
}

export function getLesson(id: string): Lesson | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM lessons WHERE id = ?").get(id) as
    | Lesson
    | undefined;
}

// --- Review History ---

export function getReviewHistory(userId: string): ReviewHistoryItem[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM review_history WHERE user_id = ? ORDER BY reviewed_at DESC LIMIT 50"
    )
    .all(userId) as ReviewHistoryItem[];
}

export function addReviewRecord(
  userId: string,
  itemType: string,
  itemId: string,
  itemLabel: string,
  score: number
): void {
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(
    "INSERT INTO review_history (id, user_id, item_type, item_id, item_label, score) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, userId, itemType, itemId, itemLabel, score);
}

// --- Stats ---

export function getUserStats(userId: string) {
  const db = getDb();
  const entryCount = (
    db
      .prepare("SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ?")
      .get(userId) as { count: number }
  ).count;
  const vocabCount = (
    db
      .prepare("SELECT COUNT(*) as count FROM vocabulary WHERE user_id = ?")
      .get(userId) as { count: number }
  ).count;
  const reviewCount = (
    db
      .prepare("SELECT COUNT(*) as count FROM review_history WHERE user_id = ?")
      .get(userId) as { count: number }
  ).count;
  const avgMastery = (
    db
      .prepare(
        "SELECT COALESCE(AVG(mastery), 0) as avg FROM vocabulary WHERE user_id = ?"
      )
      .get(userId) as { avg: number }
  ).avg;
  return { entryCount, vocabCount, reviewCount, avgMastery: Math.round(avgMastery) };
}
