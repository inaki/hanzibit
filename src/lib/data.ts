import { getDb } from "./db";
import { parseInput, extractHanziTokens } from "./parse-tokens";

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
  source_entry_id: string | null;
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

// --- Vocabulary (legacy) ---

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

// --- HSK Words ---

export interface HskWord {
  id: number;
  simplified: string;
  traditional: string | null;
  pinyin: string;
  english: string;
  hsk_level: number;
}

export interface HskLevelSummary {
  hsk_level: number;
  word_count: number;
}

export function getHskWords(level?: number): HskWord[] {
  const db = getDb();
  if (level) {
    return db
      .prepare("SELECT * FROM hsk_words WHERE hsk_level = ? ORDER BY id")
      .all(level) as HskWord[];
  }
  return db
    .prepare("SELECT * FROM hsk_words ORDER BY hsk_level, id")
    .all() as HskWord[];
}

export function getHskLevelSummaries(): HskLevelSummary[] {
  const db = getDb();
  return db
    .prepare("SELECT hsk_level, COUNT(*) as word_count FROM hsk_words GROUP BY hsk_level ORDER BY hsk_level")
    .all() as HskLevelSummary[];
}

export function searchHskWords(query: string): HskWord[] {
  const db = getDb();
  const pattern = `%${query}%`;
  return db
    .prepare(
      "SELECT * FROM hsk_words WHERE simplified LIKE ? OR pinyin LIKE ? OR english LIKE ? ORDER BY hsk_level, id LIMIT 50"
    )
    .all(pattern, pattern, pattern) as HskWord[];
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

// --- Character of the Day ---

export function getCharacterOfTheDay(level: number): HskWord | null {
  const words = getHskWords(level);
  if (words.length === 0) return null;
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const hash = (dayIndex * 2654435761) >>> 0; // Knuth multiplicative hash
  const index = hash % words.length;
  return words[index];
}

// --- Due Flashcard Count ---

export function getDueFlashcardCount(userId: string): number {
  const db = getDb();
  return (
    db
      .prepare(
        "SELECT COUNT(*) as count FROM flashcards WHERE user_id = ? AND next_review <= datetime('now')"
      )
      .get(userId) as { count: number }
  ).count;
}

// --- Progress ---

export function getUserProgress(
  userId: string,
  level: number
): { encountered: number; total: number; percent: number } {
  const db = getDb();

  // Get all HSK words for the target level
  const hskWords = getHskWords(level);
  if (hskWords.length === 0) return { encountered: 0, total: 0, percent: 0 };

  const hskSet = new Set(hskWords.map((w) => w.simplified));

  // Extract unique hanzi from all journal entries
  const entries = db
    .prepare("SELECT content_zh FROM journal_entries WHERE user_id = ?")
    .all(userId) as { content_zh: string }[];

  const encounteredSet = new Set<string>();

  for (const entry of entries) {
    const tokens = parseInput(entry.content_zh);
    const hanziTokens = extractHanziTokens(tokens);
    for (const t of hanziTokens) {
      if (hskSet.has(t.hanzi)) {
        encounteredSet.add(t.hanzi);
      }
    }
  }

  // Also include flashcard fronts
  const flashcardFronts = db
    .prepare("SELECT DISTINCT front FROM flashcards WHERE user_id = ?")
    .all(userId) as { front: string }[];

  for (const fc of flashcardFronts) {
    if (hskSet.has(fc.front)) {
      encounteredSet.add(fc.front);
    }
  }

  const encountered = encounteredSet.size;
  const total = hskWords.length;
  const percent = Math.round((encountered / total) * 100);

  return { encountered, total, percent };
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

// --- Study Guide ---

export interface StudyGuideWord {
  word: HskWord;
  encountered: boolean;
  journalEntries: { id: string; title_zh: string; title_en: string }[];
  flashcard: {
    id: string;
    nextReview: string;
    intervalDays: number;
    reviewCount: number;
  } | null;
}

export interface StudyGuideData {
  level: number;
  words: StudyGuideWord[];
  grammarPoints: GrammarPoint[];
  summary: {
    total: number;
    encountered: number;
    withFlashcard: number;
    dueForReview: number;
  };
}

export function getStudyGuideData(userId: string, level: number): StudyGuideData {
  const db = getDb();

  const hskWords = getHskWords(level);
  const hskSet = new Set(hskWords.map((w) => w.simplified));

  // Build word → journal entries mapping
  const entries = db
    .prepare("SELECT id, title_zh, title_en, content_zh FROM journal_entries WHERE user_id = ?")
    .all(userId) as { id: string; title_zh: string; title_en: string; content_zh: string }[];

  const wordToEntries = new Map<string, { id: string; title_zh: string; title_en: string }[]>();

  for (const entry of entries) {
    const tokens = parseInput(entry.content_zh);
    const hanziTokens = extractHanziTokens(tokens);
    const seen = new Set<string>();
    for (const t of hanziTokens) {
      if (hskSet.has(t.hanzi) && !seen.has(t.hanzi)) {
        seen.add(t.hanzi);
        const list = wordToEntries.get(t.hanzi) || [];
        list.push({ id: entry.id, title_zh: entry.title_zh, title_en: entry.title_en });
        wordToEntries.set(t.hanzi, list);
      }
    }
  }

  // Build flashcard map
  const flashcards = db
    .prepare("SELECT id, front, next_review, interval_days, review_count FROM flashcards WHERE user_id = ?")
    .all(userId) as { id: string; front: string; next_review: string; interval_days: number; review_count: number }[];

  const flashcardMap = new Map<string, { id: string; nextReview: string; intervalDays: number; reviewCount: number }>();
  const now = new Date().toISOString();
  let dueForReview = 0;

  for (const fc of flashcards) {
    if (hskSet.has(fc.front)) {
      flashcardMap.set(fc.front, {
        id: fc.id,
        nextReview: fc.next_review,
        intervalDays: fc.interval_days,
        reviewCount: fc.review_count,
      });
      if (fc.next_review <= now) dueForReview++;
    }
  }

  // Grammar points for this level
  const grammarPoints = db
    .prepare("SELECT * FROM grammar_points WHERE user_id = ? AND hsk_level = ? ORDER BY created_at")
    .all(userId, level) as GrammarPoint[];

  // Assemble words
  let encountered = 0;
  let withFlashcard = 0;

  const words: StudyGuideWord[] = hskWords.map((word) => {
    const journalEntries = wordToEntries.get(word.simplified) || [];
    const flashcard = flashcardMap.get(word.simplified) || null;
    const isEncountered = journalEntries.length > 0 || flashcard !== null;

    if (isEncountered) encountered++;
    if (flashcard) withFlashcard++;

    return {
      word,
      encountered: isEncountered,
      journalEntries: journalEntries.slice(0, 5),
      flashcard,
    };
  });

  return {
    level,
    words,
    grammarPoints,
    summary: {
      total: hskWords.length,
      encountered,
      withFlashcard,
      dueForReview,
    },
  };
}
