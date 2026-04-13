export type AnnotationLookupField = "hanzi" | "pinyin" | "english";

export interface AnnotationLookupEntry {
  hanzi: string;
  pinyin: string;
  english: string;
  source: "hsk" | "cedict";
  hskLevel?: number | null;
}

export interface AnnotationSuggestion {
  hanzi: string;
  pinyin: string;
  english: string;
  exact: boolean;
  source: "hsk" | "cedict";
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function splitEnglishGloss(english: string): string[] {
  const parts = english
    .split(/[;/]/)
    .map((part) => part.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const variants = new Set<string>();
  for (const part of parts) {
    variants.add(part);
    variants.add(part.replace(/^to\s+/i, "").trim());
  }

  return Array.from(variants).filter(Boolean);
}

export function summarizeEnglishGloss(english: string): string {
  const segments = splitEnglishGloss(english);
  const primary = segments[0] ?? english.trim();
  if (!primary) return "";

  const cleaned = primary.replace(/^to\s+/i, "to ").trim();
  if (cleaned.length <= 48) return cleaned;
  return `${cleaned.slice(0, 45).trimEnd()}...`;
}

function rankCandidate(candidate: string, query: string): { rank: number; exact: boolean } {
  const normalizedCandidate = normalize(candidate);
  const exact = normalizedCandidate === query;
  const startsWith = normalizedCandidate.startsWith(query);
  const contains = normalizedCandidate.includes(query);

  let rank = 3;
  if (exact) rank = 0;
  else if (startsWith) rank = 1;
  else if (contains) rank = 2;

  return { rank, exact };
}

export function rankAnnotationSuggestions(
  entries: AnnotationLookupEntry[],
  query: string,
  field: AnnotationLookupField,
  preferredHskLevel?: number | null
): AnnotationSuggestion[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const mapped = entries.map((entry) => {
    const candidates =
      field === "english"
        ? [entry.english, ...splitEnglishGloss(entry.english)]
        : [field === "hanzi" ? entry.hanzi : entry.pinyin];
    const rankedCandidates = candidates.map((candidate) =>
      rankCandidate(candidate, normalizedQuery)
    );
    const best = rankedCandidates.sort((a, b) => a.rank - b.rank)[0] ?? {
      rank: 3,
      exact: false,
    };

    return {
      hanzi: entry.hanzi,
      pinyin: entry.pinyin,
      english: entry.english,
      exact: best.exact,
      rank: best.rank,
      source: entry.source,
      hskLevel: entry.hskLevel ?? Number.MAX_SAFE_INTEGER,
      preferredDistance:
        preferredHskLevel && entry.hskLevel
          ? Math.abs(entry.hskLevel - preferredHskLevel)
          : Number.MAX_SAFE_INTEGER,
    };
  });

  return mapped
    .filter((item) => item.rank < 3)
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (a.source !== b.source) return a.source === "hsk" ? -1 : 1;
      if (!a.exact && !b.exact && a.preferredDistance !== b.preferredDistance) {
        return a.preferredDistance - b.preferredDistance;
      }
      if (a.hskLevel !== b.hskLevel) return a.hskLevel - b.hskLevel;
      return a.hanzi.localeCompare(b.hanzi, "zh-Hans");
    })
    .map(({ hanzi, pinyin, english, exact, source }) => ({
      hanzi,
      pinyin,
      english,
      exact,
      source,
    }));
}
