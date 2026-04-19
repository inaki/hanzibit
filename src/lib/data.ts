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

export interface CuratedGrammarPoint {
  id: number;
  hsk_level: number;
  display_order: number;
  title: string;
  pattern: string | null;
  explanation: string;
  examples: string;
  reading_passage: string;
  comprehension_question: string;
  journal_prompt: string;
  watch_out_notes: string | null;
  studied: boolean;
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
  register: string;
  cultural_note: string | null;
}

export interface CedictWord {
  simplified: string;
  traditional: string;
  pinyin: string;
  pinyin_display: string;
  english: string;
  char_count: number;
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

export function calculateEncounteredProgress(
  hskWords: Pick<HskWord, "simplified">[],
  entryContents: string[],
  flashcardFronts: string[]
): { encountered: number; total: number; percent: number } {
  if (hskWords.length === 0) {
    return { encountered: 0, total: 0, percent: 0 };
  }

  const hskSet = new Set(hskWords.map((word) => word.simplified));
  const encounteredSet = new Set<string>();

  for (const contentZh of entryContents) {
    const tokens = parseInput(contentZh);
    const hanziTokens = extractHanziTokens(tokens);
    for (const token of hanziTokens) {
      if (hskSet.has(token.hanzi)) {
        encounteredSet.add(token.hanzi);
      }
    }
  }

  for (const front of flashcardFronts) {
    if (hskSet.has(front)) {
      encounteredSet.add(front);
    }
  }

  const encountered = encounteredSet.size;
  const total = hskWords.length;
  const percent = Math.round((encountered / total) * 100);

  return { encountered, total, percent };
}

export function selectWeakFlashcards(cards: Flashcard[], limit = 5): Flashcard[] {
  return [...cards]
    .filter((card) => card.ease_factor < 2.0 && card.review_count > 1)
    .sort((a, b) => {
      if (a.ease_factor !== b.ease_factor) {
        return a.ease_factor - b.ease_factor;
      }
      return a.next_review.localeCompare(b.next_review);
    })
    .slice(0, limit);
}

export interface HskCollocation {
  id: number;
  word_simplified: string;
  sentence_zh: string;
  sentence_en: string;
  known_words: string[];
  encountered_words: string[];
}

export interface CharacterComponent {
  char: string;
  meaning: string;
}

export interface CharacterBreakdown {
  character: string;
  radical: string;
  radical_meaning: string;
  components: CharacterComponent[];
  mnemonic: string | null;
}

export interface LevelReadiness {
  level: number;
  score: number;
  encountered: { count: number; total: number; percent: number };
  withFlashcard: { count: number; total: number; percent: number };
  reviewedTwice: { count: number; total: number; percent: number };
  isReady: boolean;
}

export async function getLevelReadiness(
  userId: string,
  level: number
): Promise<LevelReadiness> {
  const [hskWords, entries, levelFlashcards] = await Promise.all([
    getHskWords(level),
    query<{ content_zh: string }>(
      "SELECT content_zh FROM journal_entries WHERE user_id = $1",
      [userId]
    ),
    query<{ front: string; review_count: number }>(
      `SELECT DISTINCT ON (f.front) f.front, f.review_count
       FROM flashcards f
       JOIN hsk_words w ON w.simplified = f.front
       WHERE f.user_id = $1 AND w.hsk_level = $2`,
      [userId, level]
    ),
  ]);

  const total = hskWords.length;
  if (total === 0) {
    return {
      level,
      score: 0,
      encountered: { count: 0, total: 0, percent: 0 },
      withFlashcard: { count: 0, total: 0, percent: 0 },
      reviewedTwice: { count: 0, total: 0, percent: 0 },
      isReady: false,
    };
  }

  const encounteredProgress = calculateEncounteredProgress(
    hskWords,
    entries.map((e) => e.content_zh),
    levelFlashcards.map((f) => f.front)
  );

  const withFlashcardCount = levelFlashcards.length;
  const reviewedTwiceCount = levelFlashcards.filter((f) => f.review_count >= 2).length;
  const withFlashcardPct = Math.round((withFlashcardCount / total) * 100);
  const reviewedTwicePct = Math.round((reviewedTwiceCount / total) * 100);

  const score = Math.round(
    encounteredProgress.percent * 0.4 +
    withFlashcardPct * 0.3 +
    reviewedTwicePct * 0.3
  );

  return {
    level,
    score,
    encountered: {
      count: encounteredProgress.encountered,
      total,
      percent: encounteredProgress.percent,
    },
    withFlashcard: { count: withFlashcardCount, total, percent: withFlashcardPct },
    reviewedTwice: { count: reviewedTwiceCount, total, percent: reviewedTwicePct },
    isReady: score >= 80,
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

export async function getOwnedJournalEntry(
  userId: string,
  id: string
): Promise<JournalEntry | undefined> {
  return queryOne<JournalEntry>(
    "SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
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

export async function searchCedictWords(queryText: string): Promise<CedictWord[]> {
  const pattern = `%${queryText}%`;
  return query<CedictWord>(
    `SELECT DISTINCT ON (simplified, pinyin_display, english)
        simplified,
        traditional,
        pinyin,
        pinyin_display,
        english,
        char_count
     FROM cedict_entries
     WHERE simplified ILIKE $1 OR pinyin_display ILIKE $1 OR english ILIKE $1
     ORDER BY simplified, pinyin_display, english, char_count DESC
     LIMIT 50`,
    [pattern]
  );
}

export async function getCollocations(
  userId: string,
  wordSimplified: string
): Promise<HskCollocation[]> {
  const [collocations, flashcardFronts] = await Promise.all([
    query<Omit<HskCollocation, "encountered_words">>(
      "SELECT * FROM hsk_collocations WHERE word_simplified = $1 ORDER BY id",
      [wordSimplified]
    ),
    query<{ front: string }>(
      "SELECT DISTINCT front FROM flashcards WHERE user_id = $1",
      [userId]
    ),
  ]);

  if (collocations.length === 0) return [];

  const knownSet = new Set(flashcardFronts.map((f) => f.front));
  return collocations.map((c) => ({
    ...c,
    encountered_words: c.known_words.filter((w) => knownSet.has(w)),
  }));
}

export async function getCharacterBreakdowns(
  wordSimplified: string
): Promise<CharacterBreakdown[]> {
  const chars = [...wordSimplified];
  if (chars.length === 0) return [];

  const rows = await query<{
    character: string;
    radical: string;
    radical_meaning: string;
    components_json: string;
    mnemonic: string | null;
  }>(
    `SELECT * FROM character_components WHERE character = ANY($1)`,
    [chars]
  );

  return chars
    .map((ch) => rows.find((r) => r.character === ch))
    .filter((r): r is NonNullable<typeof r> => r !== undefined)
    .map((r) => ({
      character: r.character,
      radical: r.radical,
      radical_meaning: r.radical_meaning,
      components: JSON.parse(r.components_json) as CharacterComponent[],
      mnemonic: r.mnemonic,
    }));
}

export async function getAllCharacterRadicals(): Promise<Record<string, string>> {
  const rows = await query<{ character: string; radical: string }>(
    "SELECT character, radical FROM character_components"
  );
  return Object.fromEntries(rows.map((r) => [r.character, r.radical]));
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

export async function getOwnedFlashcard(
  userId: string,
  id: string
): Promise<Flashcard | undefined> {
  return queryOne<Flashcard>(
    "SELECT * FROM flashcards WHERE id = $1 AND user_id = $2",
    [id, userId]
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
  reviewedWordLabelsToday: string[];
  guidedResponseSourceRefsToday: string[];
  latestGuidedResponseToday: {
    id: string;
    title_zh: string;
    title_en: string;
    created_at: string;
    source_ref: string | null;
    source_word_simplified: string | null;
    source_word_pinyin: string | null;
    source_word_english: string | null;
  } | null;
}> {
  const [reviews, entries, guidedResponses, reviewedWordLabelsToday, guidedResponseSourceRefsToday, latestGuidedResponseToday] = await Promise.all([
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
    query<{ item_label: string }>(
      `SELECT DISTINCT item_label
       FROM review_history
       WHERE user_id = $1
         AND reviewed_at >= CURRENT_DATE
         AND item_type = 'flashcard'`,
      [userId]
    ),
    query<{ source_ref: string }>(
      `SELECT DISTINCT source_ref
       FROM journal_entries
       WHERE user_id = $1
         AND created_at >= CURRENT_DATE
         AND source_type = 'study_guide'
         AND source_ref IS NOT NULL`,
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
      source_word_english: string | null;
    }>(
      `SELECT
         journal_entries.id,
         journal_entries.title_zh,
         journal_entries.title_en,
         journal_entries.created_at,
         journal_entries.source_ref,
         hsk_words.simplified AS source_word_simplified,
         hsk_words.pinyin AS source_word_pinyin,
         hsk_words.english AS source_word_english
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
    reviewedWordLabelsToday: reviewedWordLabelsToday.map((row) => row.item_label),
    guidedResponseSourceRefsToday: guidedResponseSourceRefsToday.map((row) => row.source_ref),
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
  const entries = await query<{ content_zh: string }>(
    "SELECT content_zh FROM journal_entries WHERE user_id = $1",
    [userId]
  );
  const flashcardFronts = await query<{ front: string }>(
    "SELECT DISTINCT front FROM flashcards WHERE user_id = $1",
    [userId]
  );

  return calculateEncounteredProgress(
    hskWords,
    entries.map((entry) => entry.content_zh),
    flashcardFronts.map((flashcard) => flashcard.front)
  );
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
  const cards = await query<Flashcard>(
    `SELECT * FROM flashcards
     WHERE user_id = $1`,
    [userId]
  );

  return selectWeakFlashcards(cards, limit);
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

export async function getCuratedGrammarPoints(
  userId: string,
  level: number
): Promise<CuratedGrammarPoint[]> {
  const rows = await query<{
    id: number;
    hsk_level: number;
    display_order: number;
    title: string;
    pattern: string | null;
    explanation: string;
    examples: string;
    reading_passage: string;
    comprehension_question: string;
    journal_prompt: string;
    watch_out_notes: string | null;
    studied_at: string | null;
  }>(
    `SELECT cgp.*, ugp.studied_at
     FROM curated_grammar_points cgp
     LEFT JOIN user_grammar_progress ugp
       ON ugp.grammar_point_id = cgp.id AND ugp.user_id = $1
     WHERE cgp.hsk_level = $2
     ORDER BY cgp.display_order`,
    [userId, level]
  );

  return rows.map((row) => ({
    id: row.id,
    hsk_level: row.hsk_level,
    display_order: row.display_order,
    title: row.title,
    pattern: row.pattern,
    explanation: row.explanation,
    examples: row.examples,
    reading_passage: row.reading_passage,
    comprehension_question: row.comprehension_question,
    journal_prompt: row.journal_prompt,
    watch_out_notes: row.watch_out_notes,
    studied: row.studied_at !== null,
  }));
}

export async function markGrammarPointStudied(
  userId: string,
  grammarPointId: number
): Promise<void> {
  await execute(
    `INSERT INTO user_grammar_progress (id, user_id, grammar_point_id)
     VALUES (gen_random_uuid()::text, $1, $2)
     ON CONFLICT (user_id, grammar_point_id) DO NOTHING`,
    [userId, grammarPointId]
  );
}
