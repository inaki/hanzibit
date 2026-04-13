import type { GlossParagraph } from "./gloss";

export interface GlossPhraseCandidate {
  hanzi: string;
  english: string;
}

export function buildGlossPhraseCandidates(
  paragraph: GlossParagraph,
  maxPhrases = 2
): GlossPhraseCandidate[] {
  const candidates: GlossPhraseCandidate[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < paragraph.length - 1; i++) {
    const first = paragraph[i];
    const second = paragraph[i + 1];

    if (first?.type !== "gloss" || second?.type !== "gloss") continue;

    const hanzi = `${first.token.hanzi}${second.token.hanzi}`.trim();
    if (hanzi.length < 2 || seen.has(hanzi)) continue;

    seen.add(hanzi);
    candidates.push({
      hanzi,
      english: `${first.token.english} ${second.token.english}`.trim(),
    });

    if (candidates.length >= maxPhrases) {
      break;
    }
  }

  return candidates;
}
