// Tone maps for each vowel — maps vowel + tone number to accented character
const TONE_MAP: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à", "a"],
  e: ["ē", "é", "ě", "è", "e"],
  i: ["ī", "í", "ǐ", "ì", "i"],
  o: ["ō", "ó", "ǒ", "ò", "o"],
  u: ["ū", "ú", "ǔ", "ù", "u"],
  v: ["ǖ", "ǘ", "ǚ", "ǜ", "ü"], // v as shorthand for ü
};

/** Convert numbered pinyin to accented — e.g. "ni3 hao3" → "nǐ hǎo" */
export function convertTones(text: string): string {
  return text.replace(/([aeiouv])([1-5])/gi, (_, vowel: string, num: string) => {
    const map = TONE_MAP[vowel.toLowerCase()];
    if (!map) return _;
    const char = map[parseInt(num) - 1] || vowel;
    return vowel === vowel.toUpperCase() ? char.toUpperCase() : char;
  });
}

export type Token =
  | { type: "hanzi"; hanzi: string; pinyin: string; english: string }
  | { type: "text"; text: string }
  | { type: "break" };

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
