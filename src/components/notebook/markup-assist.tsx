"use client";

import { useState } from "react";
import { parseInput, validateInlineMarkup } from "@/lib/parse-tokens";
import { evaluateGuidedDraft } from "@/lib/composer-guidance";
import { evaluateJournalFeedback } from "@/lib/journal-feedback";
import { buildInlineAnnotation } from "@/lib/parse-tokens";

export function ContentPreview({ content }: { content: string }) {
  const tokens = parseInput(content);
  if (tokens.length === 0) return null;

  return (
    <div data-testid="content-preview" className="rounded-lg border border-dashed border-border bg-muted/50 p-4">
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
    </div>
  );
}

export function MarkupValidationPanel({ content }: { content: string }) {
  const issues = validateInlineMarkup(content);
  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
        Annotation format looks valid.
      </div>
    );
  }

  return (
    <div
      data-testid="markup-validation-panel"
      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900"
    >
      <p className="font-semibold">Fix annotation markup before saving.</p>
      <div className="mt-2 space-y-2">
        {issues.slice(0, 3).map((issue, index) => (
          <div key={`${issue.index}-${index}`}>
            <p>{issue.message}</p>
            <p className="font-mono text-[11px] text-amber-800/80">{issue.snippet}</p>
          </div>
        ))}
      </div>
    </div>
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
    <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">
        Guided Response
      </p>
      {prompt && <p className="mt-2 text-sm font-medium text-foreground">{prompt}</p>}
      {sourceZh && (
        <div className="mt-3 rounded-md border border-white/80 bg-white/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Source Text
          </p>
          <p className="mt-2 text-base leading-7 text-foreground/90">{sourceZh}</p>
          {sourceEn && <p className="mt-2 text-sm text-muted-foreground">{sourceEn}</p>}
        </div>
      )}
      <div className="mt-3 rounded-md border border-sky-100 bg-white/70 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Quick Check
        </p>
        <div className="mt-2 space-y-1 text-sm">
          {targetWord && (
            <p className={checklist.hasTargetWord ? "text-emerald-700" : "text-amber-800"}>
              {checklist.hasTargetWord ? "✓" : "•"} Use the target word: {targetWord}
            </p>
          )}
          <p className={checklist.hasEnoughSentences ? "text-emerald-700" : "text-amber-800"}>
            {checklist.hasEnoughSentences ? "✓" : "•"} Write at least 2 sentences
            {checklist.sentenceCount > 0 ? ` (${checklist.sentenceCount} so far)` : ""}
          </p>
        </div>
      </div>
    </div>
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
    <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">
        Revision Feedback
      </p>
      {feedback.strengths.length > 0 && (
        <div className="mt-2 space-y-1 text-sm text-emerald-700">
          {feedback.strengths.map((message) => (
            <p key={message}>✓ {message}</p>
          ))}
        </div>
      )}
      {feedback.messages.length > 0 && (
        <div className="mt-3 space-y-1 text-sm text-violet-900">
          {feedback.messages.map((message) => (
            <p key={message}>• {message}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export function AnnotationBuilder({
  onInsert,
  suggestedAnnotation,
  selectedText,
  onUseSelection,
}: {
  onInsert: (annotation: string) => void;
  suggestedAnnotation?: {
    hanzi: string;
    pinyin: string;
    english: string;
  };
  selectedText?: string;
  onUseSelection?: () => void;
}) {
  const [hanzi, setHanzi] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [english, setEnglish] = useState("");
  const trimmedSelection = selectedText?.trim() ?? "";

  const canInsert = hanzi.trim() && pinyin.trim() && english.trim();

  function handleInsert() {
    if (!canInsert) return;
    onInsert(buildInlineAnnotation(hanzi, pinyin, english));
    setHanzi("");
    setPinyin("");
    setEnglish("");
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
    onUseSelection?.();
  }

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cn-orange)]">
        Quick Annotation
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Build one annotation block without typing the markup manually.
      </p>
      {trimmedSelection && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-orange-200/80 bg-white/70 px-3 py-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cn-orange)]">
              Current selection
            </p>
            <p className="truncate text-sm text-foreground">{trimmedSelection}</p>
          </div>
          <button
            type="button"
            onClick={handleUseSelection}
            className="shrink-0 rounded-full border border-[var(--cn-orange)]/30 bg-white px-3 py-1 text-xs font-medium text-[var(--cn-orange)] transition-colors hover:bg-white/80"
          >
            Use selection
          </button>
        </div>
      )}
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <input
          value={hanzi}
          onChange={(e) => setHanzi(e.target.value)}
          placeholder="汉字"
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
        />
        <input
          value={pinyin}
          onChange={(e) => setPinyin(e.target.value)}
          placeholder="pin1 yin1"
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
        />
        <input
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          placeholder="meaning"
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="truncate font-mono text-xs text-muted-foreground">
          {canInsert ? buildInlineAnnotation(hanzi, pinyin, english) : "[汉字|pinyin|meaning]"}
        </p>
        <div className="flex items-center gap-2">
          {suggestedAnnotation && (
            <button
              type="button"
              onClick={handleInsertSuggested}
              className="rounded-full border border-[var(--cn-orange)]/30 bg-white px-3 py-1 text-xs font-medium text-[var(--cn-orange)] transition-colors hover:bg-white/80"
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
    </div>
  );
}
