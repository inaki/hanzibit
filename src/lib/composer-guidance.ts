export interface GuidedDraftChecklist {
  hasTargetWord: boolean;
  sentenceCount: number;
  hasEnoughSentences: boolean;
}

export function evaluateGuidedDraft(content: string, targetWord?: string): GuidedDraftChecklist {
  const normalized = content.trim();
  const sentenceCount = normalized.length === 0
    ? 0
    : normalized
        .split(/[。！？!?]+/)
        .map((part) => part.trim())
        .filter(Boolean).length;

  return {
    hasTargetWord: targetWord ? normalized.includes(targetWord) : true,
    sentenceCount,
    hasEnoughSentences: sentenceCount >= 2,
  };
}
