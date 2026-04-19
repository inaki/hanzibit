import { query } from "./db";
import { parseInput } from "./parse-tokens";

export interface GlossToken {
  hanzi: string;
  pinyin: string;
  english: string;
  userAnnotated: boolean;
}

export type GlossSegment =
  | { type: "gloss"; token: GlossToken }
  | { type: "punctuation"; char: string }
  | { type: "break" };

export type GlossParagraph = GlossSegment[];

/** Characters treated as punctuation — rendered inline without pinyin/english rows */
const PUNCTUATION = /^[\u3000-\u303F\uFF00-\uFFEF\u2000-\u206F.,!?;:""''()（）、。，！？；：「」『』【】—…·\s]+$/;

const MAX_WORD_LEN = 6;

interface DictEntry {
  simplified: string;
  pinyin_display: string;
  english: string;
}

const BEGINNER_GLOSS_OVERRIDES: Record<string, string> = {
  短句: "sentence",
};

/**
 * Batch-load all possible substrings from CEDICT for a given text.
 * Returns a Map<simplified, DictEntry> (first match wins for duplicates).
 */
async function loadDictSubstrings(text: string): Promise<Map<string, DictEntry>> {
  const substrings = new Set<string>();
  for (let i = 0; i < text.length; i++) {
    for (let len = 1; len <= MAX_WORD_LEN && i + len <= text.length; len++) {
      const sub = text.slice(i, i + len);
      // Only look up Chinese characters
      if (!PUNCTUATION.test(sub)) {
        substrings.add(sub);
      }
    }
  }

  if (substrings.size === 0) return new Map();

  const rows = await query<DictEntry>(
    `SELECT DISTINCT ON (simplified) simplified, pinyin_display, english
     FROM cedict_entries
     WHERE simplified = ANY($1::text[])
     ORDER BY simplified, char_count DESC`,
    [Array.from(substrings)]
  );

  const map = new Map<string, DictEntry>();
  for (const row of rows) {
    if (!map.has(row.simplified)) {
      map.set(row.simplified, row);
    }
  }
  return map;
}

/**
 * Greedy forward maximum matching segmentation.
 * Segments raw Chinese text into GlossSegments using CEDICT lookup.
 */
function segmentText(text: string, dict: Map<string, DictEntry>): GlossSegment[] {
  const segments: GlossSegment[] = [];
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    // Handle newlines
    if (char === "\n") {
      segments.push({ type: "break" });
      i++;
      continue;
    }

    // Handle punctuation and whitespace
    if (PUNCTUATION.test(char)) {
      segments.push({ type: "punctuation", char });
      i++;
      continue;
    }

    // Greedy longest match
    let matched = false;
    for (let len = Math.min(MAX_WORD_LEN, text.length - i); len > 0; len--) {
      const sub = text.slice(i, i + len);
      const entry = dict.get(sub);
      if (entry) {
        const beginnerEnglish =
          BEGINNER_GLOSS_OVERRIDES[sub] ?? entry.english.split("; ")[0];
        segments.push({
          type: "gloss",
          token: {
            hanzi: sub,
            pinyin: entry.pinyin_display,
            english: beginnerEnglish,
            userAnnotated: false,
          },
        });
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Single character not in dictionary
      segments.push({
        type: "gloss",
        token: {
          hanzi: char,
          pinyin: "?",
          english: "?",
          userAnnotated: false,
        },
      });
      i++;
    }
  }

  return segments;
}

/**
 * Gloss an entire entry content string.
 * Two-pass: parseInput for user annotations, then CEDICT segmentation for raw text.
 */
export async function glossContent(content: string): Promise<GlossParagraph[]> {
  const paragraphs = content.split("\n\n");
  const result: GlossParagraph[] = [];

  // Collect all raw text across paragraphs for a single batch dictionary lookup
  const allRawText: string[] = [];
  const parsedParagraphs = paragraphs.map((p) => {
    const tokens = parseInput(p);
    for (const t of tokens) {
      if (t.type === "text") allRawText.push(t.text);
    }
    return tokens;
  });

  // Single batch lookup
  const dict = await loadDictSubstrings(allRawText.join(""));

  for (const tokens of parsedParagraphs) {
    const segments: GlossSegment[] = [];

    for (const token of tokens) {
      if (token.type === "break") {
        segments.push({ type: "break" });
      } else if (token.type === "hanzi") {
        // User-annotated token — pass through directly
        segments.push({
          type: "gloss",
          token: {
            hanzi: token.hanzi,
            pinyin: token.pinyin,
            english: token.english,
            userAnnotated: true,
          },
        });
      } else {
        // Raw text — segment with dictionary
        segments.push(...segmentText(token.text, dict));
      }
    }

    result.push(segments);
  }

  return result;
}
