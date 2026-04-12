"use client";

import { parseInput, validateInlineMarkup } from "@/lib/parse-tokens";
import { evaluateGuidedDraft } from "@/lib/composer-guidance";
import { evaluateJournalFeedback } from "@/lib/journal-feedback";

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
