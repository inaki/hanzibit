// Tone maps for each vowel — maps vowel + tone number to accented character
const TONE_MAP: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à", "a"],
  e: ["ē", "é", "ě", "è", "e"],
  i: ["ī", "í", "ǐ", "ì", "i"],
  o: ["ō", "ó", "ǒ", "ò", "o"],
  u: ["ū", "ú", "ǔ", "ù", "u"],
  v: ["ǖ", "ǘ", "ǚ", "ǜ", "ü"], // v as shorthand for ü
};

/**
 * Find which vowel in a syllable receives the tone mark.
 * Standard rules: a/e always get it; for "ou" → o; otherwise last vowel.
 */
function findToneVowelIndex(syllable: string): number {
  const lower = syllable.toLowerCase();
  // Rule 1: a or e always takes the mark
  for (let i = 0; i < lower.length; i++) {
    if (lower[i] === "a" || lower[i] === "e") return i;
  }
  // Rule 2: "ou" → tone goes on o
  const ouIdx = lower.indexOf("ou");
  if (ouIdx !== -1) return ouIdx;
  // Rule 3: last vowel gets the mark
  for (let i = lower.length - 1; i >= 0; i--) {
    if ("iouv".includes(lower[i])) return i;
  }
  return -1;
}

/** Convert numbered pinyin to accented — e.g. "ni3 hao3" → "nǐ hǎo", "jing1" → "jīng" */
export function convertTones(text: string): string {
  // Match each pinyin syllable: letters followed by a tone number
  return text.replace(/([a-zA-ZüÜ]+)([1-5])/g, (match, syllable: string, tone: string) => {
    const toneNum = parseInt(tone);
    const idx = findToneVowelIndex(syllable);
    if (idx === -1) return match;

    const vowel = syllable[idx].toLowerCase();
    const map = TONE_MAP[vowel];
    if (!map) return match;

    const accented = map[toneNum - 1] || syllable[idx];
    const result =
      syllable.slice(0, idx) +
      (syllable[idx] === syllable[idx].toUpperCase() ? accented.toUpperCase() : accented) +
      syllable.slice(idx + 1);

    // Replace v with ü in the rest of the syllable too
    return result.replace(/v/g, "ü").replace(/V/g, "Ü");
  });
}

export type Token =
  | { type: "hanzi"; hanzi: string; pinyin: string; english: string }
  | { type: "text"; text: string }
  | { type: "break" };

export interface MarkupValidationIssue {
  index: number;
  message: string;
  snippet: string;
}

/**
 * Parse content with inline vocabulary markup.
 * Format: [汉字|pīnyīn|english] or [汉字|pin1yin1|english] (tone numbers auto-convert)
 * Plain text and line breaks are preserved as-is.
 */
export function parseInput(text: string): Token[] {
  const tokens: Token[] = [];
  const regex = /\[([^|]+)\|([^|]+)\|([^\]]+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      pushTextTokens(tokens, text.slice(last, m.index));
    }
    tokens.push({
      type: "hanzi",
      hanzi: m[1].trim(),
      pinyin: convertTones(m[2].trim()),
      english: m[3].trim(),
    });
    last = m.index + m[0].length;
  }

  if (last < text.length) {
    pushTextTokens(tokens, text.slice(last));
  }

  return tokens;
}

export function validateInlineMarkup(text: string): MarkupValidationIssue[] {
  const issues: MarkupValidationIssue[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const openIndex = text.indexOf("[", cursor);
    const closeIndex = text.indexOf("]", cursor);

    if (closeIndex !== -1 && (openIndex === -1 || closeIndex < openIndex)) {
      issues.push({
        index: closeIndex,
        message: "Closing ] appears without a matching opening [.",
        snippet: text.slice(Math.max(0, closeIndex - 12), Math.min(text.length, closeIndex + 13)),
      });
      cursor = closeIndex + 1;
      continue;
    }

    if (openIndex === -1) break;

    const matchingClose = text.indexOf("]", openIndex + 1);
    if (matchingClose === -1) {
      issues.push({
        index: openIndex,
        message: "Opening [ is missing a closing ].",
        snippet: text.slice(openIndex, Math.min(text.length, openIndex + 24)),
      });
      break;
    }

    const body = text.slice(openIndex + 1, matchingClose);
    const parts = body.split("|");

    if (parts.length !== 3) {
      issues.push({
        index: openIndex,
        message: "Annotations must use exactly three parts: [汉字|pinyin|meaning].",
        snippet: text.slice(openIndex, matchingClose + 1),
      });
      cursor = matchingClose + 1;
      continue;
    }

    const [hanzi, pinyin, english] = parts.map((part) => part.trim());
    if (!hanzi || !pinyin || !english) {
      issues.push({
        index: openIndex,
        message: "Each annotation needs hanzi, pinyin, and meaning.",
        snippet: text.slice(openIndex, matchingClose + 1),
      });
    }

    cursor = matchingClose + 1;
  }

  return issues;
}

export function buildInlineAnnotation(hanzi: string, pinyin: string, english: string): string {
  return `[${hanzi.trim()}|${pinyin.trim()}|${english.trim()}]`;
}

export function replaceTextRange(
  content: string,
  start: number,
  end: number,
  replacement: string
): string {
  const safeStart = Math.max(0, Math.min(start, content.length));
  const safeEnd = Math.max(safeStart, Math.min(end, content.length));
  return `${content.slice(0, safeStart)}${replacement}${content.slice(safeEnd)}`;
}

function pushTextTokens(tokens: Token[], text: string) {
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    if (line) tokens.push({ type: "text", text: line });
    if (i < lines.length - 1) tokens.push({ type: "break" });
  });
}

/** Extract only the hanzi tokens from parsed content — useful for flashcards, pronunciation, etc. */
export function extractHanziTokens(
  tokens: Token[]
): Array<{ hanzi: string; pinyin: string; english: string }> {
  return tokens
    .filter((t): t is Token & { type: "hanzi" } => t.type === "hanzi");
}
