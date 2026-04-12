import { randomUUID } from "crypto";
import { query, queryOne, execute } from "./db";
import { parseInput, extractHanziTokens } from "./parse-tokens";
import { calculateUserStreak } from "./streak";

export interface JournalEntry {
  id: string;
  user_id: string;
  title_zh: string;
  title_en: string;
  unit: string | null;
  hsk_level: number;
  content_zh: string;
  bookmarked: number;
  source_type: string | null;
  source_ref: string | null;
  source_prompt: string | null;
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
  examples: string;
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

export interface StudyGuideWord {
  word: HskWord;
  encountered: boolean;
  journalEntries: { id: string; title_zh: string; title_en: string }[];
  guidedResponses: {
    id: string;
    title_zh: string;
    title_en: string;
    created_at: string;
  }[];
  flashcard: {
    id: string;
    nextReview: string;
    intervalDays: number;
    easeFactor: number;
    reviewCount: number;
  } | null;
}

export interface StudyGuideData {
  level: number;
  locked: boolean;
  words: StudyGuideWord[];
  grammarPoints: GrammarPoint[];
  summary: {
    total: number;
    encountered: number;
    withFlashcard: number;
    dueForReview: number;
  };
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  return query<JournalEntry>(
    "SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
}

export async function getJournalEntry(id: string): Promise<JournalEntry | undefined> {
  return queryOne<JournalEntry>("SELECT * FROM journal_entries WHERE id = $1", [id]);
}

export async function getEntryAnnotations(entryId: string): Promise<EntryAnnotation[]> {
  return query<EntryAnnotation>(
    "SELECT * FROM entry_annotations WHERE entry_id = $1",
    [entryId]
  );
}

export async function toggleBookmark(entryId: string): Promise<void> {
  await execute(
    `UPDATE journal_entries
     SET bookmarked = CASE WHEN bookmarked = 1 THEN 0 ELSE 1 END
     WHERE id = $1`,
    [entryId]
  );
}

export async function getVocabulary(userId: string): Promise<VocabularyItem[]> {
  return query<VocabularyItem>(
    "SELECT * FROM vocabulary WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
}

export async function getVocabularyByHskLevel(
  userId: string,
  level: number
): Promise<VocabularyItem[]> {
  return query<VocabularyItem>(
    `SELECT * FROM vocabulary
     WHERE user_id = $1 AND hsk_level = $2
     ORDER BY character_zh`,
    [userId, level]
  );
}

export async function getHskWords(level?: number): Promise<HskWord[]> {
  if (level) {
    return query<HskWord>(
      "SELECT * FROM hsk_words WHERE hsk_level = $1 ORDER BY id",
      [level]
    );
  }

  return query<HskWord>("SELECT * FROM hsk_words ORDER BY hsk_level, id");
}

export async function getHskLevelSummaries(): Promise<HskLevelSummary[]> {
  return query<HskLevelSummary>(
    `SELECT hsk_level, COUNT(*)::int AS word_count
     FROM hsk_words
     GROUP BY hsk_level
     ORDER BY hsk_level`
  );
}

export async function searchHskWords(queryText: string): Promise<HskWord[]> {
  const pattern = `%${queryText}%`;
  return query<HskWord>(
    `SELECT * FROM hsk_words
     WHERE simplified ILIKE $1 OR pinyin ILIKE $1 OR english ILIKE $1
     ORDER BY hsk_level, id
     LIMIT 50`,
    [pattern]
  );
}

export async function getGrammarPoints(userId: string): Promise<GrammarPoint[]> {
  return query<GrammarPoint>(
    `SELECT * FROM grammar_points
     WHERE user_id = $1
     ORDER BY hsk_level, created_at`,
    [userId]
  );
}

export async function getFlashcards(userId: string): Promise<Flashcard[]> {
  return query<Flashcard>(
    "SELECT * FROM flashcards WHERE user_id = $1 ORDER BY next_review ASC",
    [userId]
  );
}

export async function getDueFlashcards(userId: string): Promise<Flashcard[]> {
  return query<Flashcard>(
    `SELECT * FROM flashcards
     WHERE user_id = $1 AND next_review <= NOW()
     ORDER BY ease_factor ASC, next_review ASC`,
    [userId]
  );
}

export async function updateFlashcardReview(
  id: string,
  intervalDays: number,
  easeFactor: number
): Promise<void> {
  await execute(
    `UPDATE flashcards
     SET next_review = NOW() + ($1 * INTERVAL '1 day'),
         interval_days = $1,
         ease_factor = $2,
         review_count = review_count + 1
     WHERE id = $3`,
    [intervalDays, easeFactor, id]
  );
}

export async function getReviewHistory(userId: string): Promise<ReviewHistoryItem[]> {
  return query<ReviewHistoryItem>(
    `SELECT * FROM review_history
     WHERE user_id = $1
     ORDER BY reviewed_at DESC
     LIMIT 50`,
    [userId]
  );
}

export async function addReviewRecord(
  userId: string,
  itemType: string,
  itemId: string,
  itemLabel: string,
  score: number
): Promise<void> {
  await execute(
    `INSERT INTO review_history (id, user_id, item_type, item_id, item_label, score)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [randomUUID(), userId, itemType, itemId, itemLabel, score]
  );
}

export async function getCharacterOfTheDay(level: number): Promise<HskWord | null> {
  const words = await getHskWords(level);
  if (words.length === 0) return null;

  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const hash = (dayIndex * 2654435761) >>> 0;
  return words[hash % words.length];
}

export async function getDueFlashcardCount(userId: string): Promise<number> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int AS count
     FROM flashcards
     WHERE user_id = $1 AND next_review <= NOW()`,
    [userId]
  );
  return row?.count ?? 0;
}

export async function getTodayActivitySummary(userId: string): Promise<{
  reviewsCompletedToday: number;
  entriesCreatedToday: number;
  guidedResponsesToday: number;
  latestGuidedResponseToday: {
    id: string;
    title_zh: string;
    title_en: string;
    created_at: string;
    source_ref: string | null;
    source_word_simplified: string | null;
    source_word_pinyin: string | null;
  } | null;
}> {
  const [reviews, entries, guidedResponses, latestGuidedResponseToday] = await Promise.all([
    queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM review_history
       WHERE user_id = $1
         AND reviewed_at >= CURRENT_DATE`,
      [userId]
    ),
    queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM journal_entries
       WHERE user_id = $1
         AND created_at >= CURRENT_DATE`,
      [userId]
    ),
    queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM journal_entries
       WHERE user_id = $1
         AND created_at >= CURRENT_DATE
         AND source_type = 'study_guide'`,
      [userId]
    ),
    queryOne<{
      id: string;
      title_zh: string;
      title_en: string;
      created_at: string;
      source_ref: string | null;
      source_word_simplified: string | null;
      source_word_pinyin: string | null;
    }>(
      `SELECT
         journal_entries.id,
         journal_entries.title_zh,
         journal_entries.title_en,
         journal_entries.created_at,
         journal_entries.source_ref,
         hsk_words.simplified AS source_word_simplified,
         hsk_words.pinyin AS source_word_pinyin
       FROM journal_entries
       LEFT JOIN hsk_words
         ON hsk_words.id = CASE
           WHEN journal_entries.source_ref ~ '^[0-9]+$' THEN journal_entries.source_ref::int
           ELSE NULL
         END
       WHERE journal_entries.user_id = $1
         AND journal_entries.created_at >= CURRENT_DATE
         AND journal_entries.source_type = 'study_guide'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    ),
  ]);

  return {
    reviewsCompletedToday: reviews?.count ?? 0,
    entriesCreatedToday: entries?.count ?? 0,
    guidedResponsesToday: guidedResponses?.count ?? 0,
    latestGuidedResponseToday: latestGuidedResponseToday ?? null,
  };
}

export async function syncDailyLoopCompletion(
  userId: string,
  input: {
    completed: boolean;
    reviewCompleted: boolean;
    studyCompleted: boolean;
    writeCompleted: boolean;
  }
): Promise<void> {
  await execute(
    `INSERT INTO daily_loop_completions (
       id,
       user_id,
       completed_on,
       review_completed,
       study_completed,
       write_completed,
       completed_at
     )
     VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, NOW())
       ON CONFLICT (user_id, completed_on)
       DO UPDATE SET
         review_completed = EXCLUDED.review_completed,
         study_completed = EXCLUDED.study_completed,
         write_completed = EXCLUDED.write_completed,
         completed_at = CASE
           WHEN EXCLUDED.review_completed = 1
            AND EXCLUDED.study_completed = 1
            AND EXCLUDED.write_completed = 1
           THEN NOW()
           ELSE daily_loop_completions.completed_at
         END`,
    [
      randomUUID(),
      userId,
      input.reviewCompleted ? 1 : 0,
      input.studyCompleted ? 1 : 0,
      input.writeCompleted ? 1 : 0,
    ]
  );
}

export async function getRecentDailyLoopCompletionCount(
  userId: string,
  days = 7
): Promise<number> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int AS count
     FROM daily_loop_completions
     WHERE user_id = $1
       AND completed_on >= CURRENT_DATE - ($2::int - 1)`,
    [userId, days]
  );

  return row?.count ?? 0;
}

export async function getRecentDailyLoopHistory(
  userId: string,
  days = 7
): Promise<{ completedOn: string }[]> {
  return query<{ completedOn: string }>(
    `SELECT completed_on::text AS "completedOn"
     FROM daily_loop_completions
     WHERE user_id = $1
       AND completed_on >= CURRENT_DATE - ($2::int - 1)
     ORDER BY completed_on ASC`,
    [userId, days]
  );
}

export async function getRecentDailyLoopStepSummary(
  userId: string,
  days = 7
): Promise<{
  reviewCompletedDays: number;
  studyCompletedDays: number;
  writeCompletedDays: number;
}> {
  const row = await queryOne<{
    reviewCompletedDays: number;
    studyCompletedDays: number;
    writeCompletedDays: number;
  }>(
    `SELECT
       COALESCE(SUM(review_completed), 0)::int AS "reviewCompletedDays",
       COALESCE(SUM(study_completed), 0)::int AS "studyCompletedDays",
       COALESCE(SUM(write_completed), 0)::int AS "writeCompletedDays"
     FROM daily_loop_completions
     WHERE user_id = $1
       AND completed_on >= CURRENT_DATE - ($2::int - 1)`,
    [userId, days]
  );

  return {
    reviewCompletedDays: row?.reviewCompletedDays ?? 0,
    studyCompletedDays: row?.studyCompletedDays ?? 0,
    writeCompletedDays: row?.writeCompletedDays ?? 0,
  };
}

export async function getUserProgress(
  userId: string,
  level: number
): Promise<{ encountered: number; total: number; percent: number }> {
  const hskWords = await getHskWords(level);
  if (hskWords.length === 0) return { encountered: 0, total: 0, percent: 0 };

  const hskSet = new Set(hskWords.map((word) => word.simplified));
  const entries = await query<{ content_zh: string }>(
    "SELECT content_zh FROM journal_entries WHERE user_id = $1",
    [userId]
  );
  const flashcardFronts = await query<{ front: string }>(
    "SELECT DISTINCT front FROM flashcards WHERE user_id = $1",
    [userId]
  );

  const encounteredSet = new Set<string>();

  for (const entry of entries) {
    const tokens = parseInput(entry.content_zh);
    const hanziTokens = extractHanziTokens(tokens);
    for (const token of hanziTokens) {
      if (hskSet.has(token.hanzi)) {
        encounteredSet.add(token.hanzi);
      }
    }
  }

  for (const flashcard of flashcardFronts) {
    if (hskSet.has(flashcard.front)) {
      encounteredSet.add(flashcard.front);
    }
  }

  const encountered = encounteredSet.size;
  const total = hskWords.length;
  const percent = Math.round((encountered / total) * 100);

  return { encountered, total, percent };
}

export async function getUserStats(userId: string): Promise<{
  entryCount: number;
  vocabCount: number;
  reviewCount: number;
  avgMastery: number;
}> {
  const [entries, vocabulary, reviews, avg] = await Promise.all([
    queryOne<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM journal_entries WHERE user_id = $1",
      [userId]
    ),
    queryOne<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM vocabulary WHERE user_id = $1",
      [userId]
    ),
    queryOne<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM review_history WHERE user_id = $1",
      [userId]
    ),
    queryOne<{ avg: number }>(
      "SELECT COALESCE(AVG(mastery), 0) AS avg FROM vocabulary WHERE user_id = $1",
      [userId]
    ),
  ]);

  return {
    entryCount: entries?.count ?? 0,
    vocabCount: vocabulary?.count ?? 0,
    reviewCount: reviews?.count ?? 0,
    avgMastery: Math.round(avg?.avg ?? 0),
  };
}

export async function getUserStreak(userId: string): Promise<number> {
  const rows = await query<{ active_date: string }>(
    `SELECT DISTINCT DATE(reviewed_at)::text AS active_date
     FROM review_history
     WHERE user_id = $1
     UNION
     SELECT DISTINCT DATE(created_at)::text AS active_date
     FROM journal_entries
     WHERE user_id = $1`,
    [userId]
  );

  return calculateUserStreak(rows.map((row) => row.active_date));
}

export async function getWeakFlashcards(userId: string, limit = 5): Promise<Flashcard[]> {
  return query<Flashcard>(
    `SELECT * FROM flashcards
     WHERE user_id = $1
       AND ease_factor < 2.0
       AND review_count > 1
     ORDER BY ease_factor ASC
     LIMIT $2`,
    [userId, limit]
  );
}

export async function getStudyGuideData(
  userId: string,
  level: number
): Promise<StudyGuideData> {
  const [hskWords, entries, guidedEntries, flashcards, grammarPoints] = await Promise.all([
    getHskWords(level),
    query<{ id: string; title_zh: string; title_en: string; content_zh: string }>(
      `SELECT id, title_zh, title_en, content_zh
       FROM journal_entries
       WHERE user_id = $1`,
      [userId]
    ),
    query<{
      id: string;
      title_zh: string;
      title_en: string;
      created_at: string;
      source_ref: string | null;
    }>(
      `SELECT id, title_zh, title_en, created_at, source_ref
       FROM journal_entries
       WHERE user_id = $1
         AND source_type = 'study_guide'
         AND source_ref IS NOT NULL`,
      [userId]
    ),
    query<{
      id: string;
      front: string;
      next_review: string;
      interval_days: number;
      ease_factor: number;
      review_count: number;
    }>(
      `SELECT id, front, next_review, interval_days, ease_factor, review_count
       FROM flashcards
       WHERE user_id = $1`,
      [userId]
    ),
    query<GrammarPoint>(
      `SELECT * FROM grammar_points
       WHERE user_id = $1 AND hsk_level = $2
       ORDER BY created_at`,
      [userId, level]
    ),
  ]);

  const hskSet = new Set(hskWords.map((word) => word.simplified));
  const wordToEntries = new Map<string, { id: string; title_zh: string; title_en: string }[]>();
  const guidedResponseMap = new Map<
    number,
    { id: string; title_zh: string; title_en: string; created_at: string }[]
  >();

  for (const entry of entries) {
    const tokens = parseInput(entry.content_zh);
    const hanziTokens = extractHanziTokens(tokens);
    const seen = new Set<string>();

    for (const token of hanziTokens) {
      if (!hskSet.has(token.hanzi) || seen.has(token.hanzi)) continue;
      seen.add(token.hanzi);

      const list = wordToEntries.get(token.hanzi) ?? [];
      list.push({ id: entry.id, title_zh: entry.title_zh, title_en: entry.title_en });
      wordToEntries.set(token.hanzi, list);
    }
  }

  for (const entry of guidedEntries) {
    const wordId = Number.parseInt(entry.source_ref ?? "", 10);
    if (!Number.isInteger(wordId)) continue;

    const list = guidedResponseMap.get(wordId) ?? [];
    list.push({
      id: entry.id,
      title_zh: entry.title_zh,
      title_en: entry.title_en,
      created_at: entry.created_at,
    });
    guidedResponseMap.set(wordId, list);
  }

  const flashcardMap = new Map<
    string,
    { id: string; nextReview: string; intervalDays: number; easeFactor: number; reviewCount: number }
  >();
  const now = new Date().toISOString();
  let dueForReview = 0;

  for (const flashcard of flashcards) {
    if (!hskSet.has(flashcard.front)) continue;

    flashcardMap.set(flashcard.front, {
      id: flashcard.id,
      nextReview: flashcard.next_review,
      intervalDays: flashcard.interval_days,
      easeFactor: flashcard.ease_factor,
      reviewCount: flashcard.review_count,
    });

    if (flashcard.next_review <= now) {
      dueForReview++;
    }
  }

  let encountered = 0;
  let withFlashcard = 0;

  const words = hskWords.map((word) => {
    const journalEntries = wordToEntries.get(word.simplified) ?? [];
    const flashcard = flashcardMap.get(word.simplified) ?? null;
    const isEncountered = journalEntries.length > 0 || flashcard !== null;

    if (isEncountered) encountered++;
    if (flashcard) withFlashcard++;

    return {
      word,
      encountered: isEncountered,
      journalEntries: journalEntries.slice(0, 5),
      guidedResponses: (guidedResponseMap.get(word.id) ?? []).slice(0, 5),
      flashcard,
    };
  });

  return {
    level,
    locked: false,
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
