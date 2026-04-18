"use client";

import { useEffect, useRef, useState } from "react";
import { parseInput, validateInlineMarkup } from "@/lib/parse-tokens";
import { evaluateGuidedDraft } from "@/lib/composer-guidance";
import { evaluateJournalFeedback } from "@/lib/journal-feedback";
import { buildInlineAnnotation } from "@/lib/parse-tokens";
import { searchAnnotationSuggestionsAction } from "@/lib/actions";
import { EmptyStateNotice, GuidanceBanner } from "@/components/patterns/guidance";
import {
  rankAnnotationSuggestions,
  summarizeEnglishGloss,
  type AnnotationLookupField,
  type AnnotationSuggestion,
} from "@/lib/annotation-suggestions";

export function ContentPreview({ content }: { content: string }) {
  const tokens = parseInput(content);
  if (tokens.length === 0) return null;

  return (
    <EmptyStateNotice
      data-testid="content-preview"
      className="rounded-lg border-border bg-muted/50"
    >
      <p className="mb-2 text-xs font-medium text-muted-foreground/70">Preview</p>
      <div className="text-base leading-[2] text-foreground/90">
        {tokens.map((t, i) => {
          if (t.type === "break") return <br key={i} />;
          if (t.type === "text") return <span key={i}>{t.text}</span>;
          return (
            <span key={i} className="font-bold text-[var(--cn-orange)]" title={`${t.pinyin} — ${t.english}`}>
              {t.hanzi}
            </span>
          );
        })}
      </div>
    </EmptyStateNotice>
  );
}

export function MarkupValidationPanel({ content }: { content: string }) {
  const issues = validateInlineMarkup(content);
  if (issues.length === 0) {
    return (
      <GuidanceBanner tone="emerald" className="px-3 py-2 text-xs">
        Annotation format looks valid.
      </GuidanceBanner>
    );
  }

  return (
    <GuidanceBanner
      data-testid="markup-validation-panel"
      tone="amber"
      title="Fix annotation markup before saving."
      className="px-3 py-3 text-xs"
    >
      <div className="mt-2 space-y-2">
        {issues.slice(0, 3).map((issue, index) => (
          <div key={`${issue.index}-${index}`}>
            <p>{issue.message}</p>
            <p className="font-mono text-[11px] text-amber-200/80">{issue.snippet}</p>
          </div>
        ))}
      </div>
    </GuidanceBanner>
  );
}

export function GuidedDraftPanel({
  prompt,
  sourceZh,
  sourceEn,
  targetWord,
  content,
}: {
  prompt?: string;
  sourceZh?: string;
  sourceEn?: string;
  targetWord?: string;
  content?: string;
}) {
  if (!prompt && !sourceZh && !sourceEn) return null;
  const checklist = evaluateGuidedDraft(content ?? "", targetWord);

  return (
    <GuidanceBanner title="Guided Response" tone="sky">
      {prompt && <p className="mt-2 text-sm font-medium text-foreground">{prompt}</p>}
      {sourceZh && (
        <div className="mt-3 rounded-md border border-border/80 bg-card/90 p-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Source Text
          </p>
          <p className="mt-2 text-base leading-7 text-foreground/90">{sourceZh}</p>
          {sourceEn && <p className="mt-2 text-sm text-muted-foreground">{sourceEn}</p>}
        </div>
      )}
      <div className="mt-3 rounded-md border border-border/80 bg-card/90 p-3 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Quick Check
        </p>
        <div className="mt-2 space-y-1 text-sm">
          {targetWord && (
            <p className={checklist.hasTargetWord ? "text-emerald-400" : "text-amber-300"}>
              {checklist.hasTargetWord ? "✓" : "•"} Use the target word: {targetWord}
            </p>
          )}
          <p className={checklist.hasEnoughSentences ? "text-emerald-400" : "text-amber-300"}>
            {checklist.hasEnoughSentences ? "✓" : "•"} Write at least 2 sentences
            {checklist.sentenceCount > 0 ? ` (${checklist.sentenceCount} so far)` : ""}
          </p>
        </div>
      </div>
    </GuidanceBanner>
  );
}

export function JournalFeedbackPanel({
  content,
  targetWord,
}: {
  content: string;
  targetWord?: string;
}) {
  const feedback = evaluateJournalFeedback(content, targetWord);
  if (content.trim().length === 0) return null;

  return (
    <GuidanceBanner title="Revision Feedback" tone="violet">
      {feedback.strengths.length > 0 && (
        <div className="mt-2 space-y-1 text-sm text-emerald-400">
          {feedback.strengths.map((message) => (
            <p key={message}>✓ {message}</p>
          ))}
        </div>
      )}
      {feedback.messages.length > 0 && (
        <div className="mt-3 space-y-1 text-sm text-violet-100">
          {feedback.messages.map((message) => (
            <p key={message}>• {message}</p>
          ))}
        </div>
      )}
    </GuidanceBanner>
  );
}

export function AnnotationBuilder({
  onInsert,
  suggestedAnnotation,
  selectedText,
  onUseSelection,
  currentHskLevel,
}: {
  onInsert: (annotation: string) => void;
  suggestedAnnotation?: {
    hanzi: string;
    pinyin: string;
    english: string;
  };
  selectedText?: string;
  onUseSelection?: () => void;
  currentHskLevel?: number;
}) {
  const [hanzi, setHanzi] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [english, setEnglish] = useState("");
  const [lookupField, setLookupField] = useState<AnnotationLookupField | null>(null);
  const [suggestions, setSuggestions] = useState<AnnotationSuggestion[]>([]);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupAttempted, setLookupAttempted] = useState(false);
  const lookupTokenRef = useRef(0);
  const suggestionCacheRef = useRef(new Map<string, AnnotationSuggestion[]>());
  const trimmedSelection = selectedText?.trim() ?? "";

  const canInsert = hanzi.trim() && pinyin.trim() && english.trim();
  const lookupValue =
    lookupField === "hanzi"
      ? hanzi.trim()
      : lookupField === "pinyin"
        ? pinyin.trim()
        : lookupField === "english"
          ? english.trim()
          : "";
  const lookupCacheKey = `${lookupField ?? "none"}|${currentHskLevel ?? "any"}|${lookupValue.toLowerCase()}`;

  function clearLookupState() {
    setSuggestions([]);
    setLookupBusy(false);
    setLookupAttempted(false);
  }

  function applyExactMatch(ranked: AnnotationSuggestion[]) {
    const exactMatches = ranked.filter((item) => item.exact);
    if (exactMatches.length !== 1) return;
    const match = exactMatches[0];
    setHanzi((current) => current.trim() || match.hanzi);
    setPinyin((current) => current.trim() || match.pinyin);
    setEnglish((current) => current.trim() || match.english);
  }

  useEffect(() => {
    if (!lookupField || !lookupValue) {
      return;
    }

    const cached = suggestionCacheRef.current.get(lookupCacheKey);
    if (cached) {
      setSuggestions(cached);
      setLookupBusy(false);
      setLookupAttempted(true);
      applyExactMatch(cached);
      return;
    }

    const token = ++lookupTokenRef.current;
    setLookupBusy(true);
    const timer = window.setTimeout(async () => {
      try {
        const results = await searchAnnotationSuggestionsAction(lookupValue);
        if (lookupTokenRef.current !== token) return;
        const ranked = rankAnnotationSuggestions(
          results,
          lookupValue,
          lookupField,
          currentHskLevel
        );
        const topRanked = ranked.slice(0, 5);
        suggestionCacheRef.current.set(lookupCacheKey, topRanked);
        setSuggestions(topRanked);
        setLookupAttempted(true);
        applyExactMatch(topRanked);
      } finally {
        if (lookupTokenRef.current === token) {
          setLookupBusy(false);
        }
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [currentHskLevel, lookupCacheKey, lookupField, lookupValue]);

  function handleInsert() {
    if (!canInsert) return;
    onInsert(buildInlineAnnotation(hanzi, pinyin, english));
    resetBuilder();
  }

  function resetBuilder() {
    setHanzi("");
    setPinyin("");
    setEnglish("");
    clearLookupState();
    setLookupField(null);
  }

  function handleInsertSuggested() {
    if (!suggestedAnnotation) return;
    onInsert(
      buildInlineAnnotation(
        suggestedAnnotation.hanzi,
        suggestedAnnotation.pinyin,
        suggestedAnnotation.english
      )
    );
  }

  function handleUseSelection() {
    if (!trimmedSelection) return;
    setHanzi(trimmedSelection);
    if (suggestedAnnotation && trimmedSelection === suggestedAnnotation.hanzi) {
      setPinyin(suggestedAnnotation.pinyin);
      setEnglish(suggestedAnnotation.english);
    }
    setLookupField("hanzi");
    onUseSelection?.();
  }

  function applySuggestion(suggestion: AnnotationSuggestion) {
    setHanzi(suggestion.hanzi);
    setPinyin(suggestion.pinyin);
    setEnglish(suggestion.english);
    setSuggestions([]);
    setLookupField(null);
  }

  const topSuggestion = suggestions[0];
  const canUseTopMatch =
    !lookupBusy &&
    suggestions.length > 0 &&
    !(suggestions.length === 1 && suggestions[0]?.exact);

  return (
    <div className="rounded-lg border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cn-orange)]">
        Quick Annotation
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Build one annotation block without typing the markup manually.
      </p>
      {trimmedSelection && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-card/90 px-3 py-2 shadow-sm">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cn-orange)]">
              Current selection
            </p>
            <p className="truncate text-sm text-foreground">{trimmedSelection}</p>
          </div>
          <button
            type="button"
            onClick={handleUseSelection}
            className="shrink-0 rounded-full border border-[var(--cn-orange)]/30 bg-card px-3 py-1 text-xs font-medium text-[var(--cn-orange)] transition-colors hover:bg-muted/60"
          >
            Use selection
          </button>
        </div>
      )}
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <input
          value={hanzi}
          onChange={(e) => {
            const nextValue = e.target.value;
            setHanzi(nextValue);
            setLookupField("hanzi");
            if (!nextValue.trim()) clearLookupState();
          }}
          placeholder="汉字"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
        />
        <input
          value={pinyin}
          onChange={(e) => {
            const nextValue = e.target.value;
            setPinyin(nextValue);
            setLookupField("pinyin");
            if (!nextValue.trim()) clearLookupState();
          }}
          placeholder="pin1 yin1"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
        />
        <input
          value={english}
          onChange={(e) => {
            const nextValue = e.target.value;
            setEnglish(nextValue);
            setLookupField("english");
            if (!nextValue.trim()) clearLookupState();
          }}
          placeholder="meaning"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
        />
      </div>
      {(lookupBusy || suggestions.length > 1 || (lookupAttempted && suggestions.length === 0)) && (
        <div className="mt-3 rounded-lg border border-border/80 bg-card/90 px-3 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cn-orange)]">
            {lookupBusy ? "Looking up..." : suggestions.length > 0 ? "Suggestions" : "No matches"}
          </p>
          {suggestions.length > 1 && (
            <div className="mt-2 space-y-1">
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.hanzi}-${suggestion.pinyin}-${suggestion.english}-${suggestion.source}`}
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left text-xs transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-[var(--cn-orange)]/10"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{suggestion.hanzi}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {suggestion.source}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-3">
                      <span className="truncate text-muted-foreground">{suggestion.pinyin}</span>
                      <span
                        className="truncate text-muted-foreground"
                        title={suggestion.english}
                      >
                        {summarizeEnglishGloss(suggestion.english)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!lookupBusy && lookupAttempted && suggestions.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              No annotation matches found for this input yet. Try a different gloss, pinyin, or Hanzi.
            </p>
          )}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="truncate font-mono text-xs text-muted-foreground">
          {canInsert ? buildInlineAnnotation(hanzi, pinyin, english) : "[汉字|pinyin|meaning]"}
        </p>
        <div className="flex items-center gap-2">
          {(hanzi || pinyin || english) && (
            <button
              type="button"
              onClick={resetBuilder}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Clear
            </button>
          )}
          {canUseTopMatch && topSuggestion && (
            <button
              type="button"
              onClick={() => applySuggestion(topSuggestion)}
              className="rounded-full border border-[var(--cn-orange)]/30 bg-card px-3 py-1 text-xs font-medium text-[var(--cn-orange)] transition-colors hover:bg-muted/60"
            >
              Use top match
            </button>
          )}
          {suggestedAnnotation && (
            <button
              type="button"
              onClick={handleInsertSuggested}
              className="rounded-full border border-[var(--cn-orange)]/30 bg-card px-3 py-1 text-xs font-medium text-[var(--cn-orange)] transition-colors hover:bg-muted/60"
            >
              Insert target word
            </button>
          )}
          <button
            type="button"
            onClick={handleInsert}
            disabled={!canInsert}
            className="rounded-full bg-[var(--cn-orange)] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[var(--cn-orange-dark)] disabled:opacity-50"
          >
            Insert
          </button>
        </div>
      </div>
      {!lookupBusy && topSuggestion?.source === "cedict" && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Top match is from CEDICT, so it may be broader than your current HSK list.
        </p>
      )}
    </div>
  );
}
