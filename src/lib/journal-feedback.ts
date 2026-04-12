import { extractHanziTokens, parseInput } from "./parse-tokens";

export interface JournalFeedback {
  sentenceCount: number;
  annotationCount: number;
  messages: string[];
  strengths: string[];
}

export function evaluateJournalFeedback(content: string, targetWord?: string): JournalFeedback {
  const trimmed = content.trim();
  const tokens = parseInput(content);
  const annotations = extractHanziTokens(tokens);
  const sentenceCount =
    trimmed.length === 0
      ? 0
      : trimmed
          .split(/[。！？!?]+/)
          .map((part) => part.trim())
          .filter(Boolean).length;

  const messages: string[] = [];
  const strengths: string[] = [];

  if (sentenceCount < 2) {
    messages.push("Add at least one more sentence so the entry becomes fuller output practice.");
  } else {
    strengths.push("You have enough sentence-level output to practice recall, not just recognition.");
  }

  if (annotations.length === 0) {
    messages.push("Annotate at least one useful word with [汉字|pinyin|meaning] so you can reuse it later.");
  } else {
    strengths.push(`You already marked ${annotations.length} vocabulary item${annotations.length === 1 ? "" : "s"} for later review.`);
  }

  if (targetWord) {
    if (trimmed.includes(targetWord)) {
      strengths.push(`You used the target word ${targetWord} in your draft.`);
    } else {
      messages.push(`Use the target word ${targetWord} at least once in your response.`);
    }
  }

  if (trimmed.length > 0 && trimmed.length < 20) {
    messages.push("Try adding a little more detail so this reads like a real message, not a fragment.");
  }

  return {
    sentenceCount,
    annotationCount: annotations.length,
    messages,
    strengths,
  };
}
