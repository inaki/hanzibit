"use client";

import type { JournalEntry, EntryHighlight, EntryAnnotation } from "@/lib/data";

interface JournalEntryViewProps {
  entry: JournalEntry;
  highlights: EntryHighlight[];
  annotations: EntryAnnotation[];
}

function highlightText(text: string, highlights: EntryHighlight[]) {
  if (highlights.length === 0) return text;

  const chars = highlights.map((h) => h.character_zh);
  // Sort by length descending so longer matches take priority
  chars.sort((a, b) => b.length - a.length);

  const pattern = new RegExp(`(${chars.map(escapeRegex).join("|")})`, "g");
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const match = highlights.find((h) => h.character_zh === part);
    if (match) {
      return (
        <span
          key={i}
          data-testid={`journal-entry-vocab-${match.character_zh}`}
          className="font-bold text-[var(--cn-orange)]"
          title={`${match.pinyin} — ${match.meaning}`}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function JournalEntryView({
  entry,
  highlights,
  annotations,
}: JournalEntryViewProps) {
  const date = new Date(entry.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const paragraphs = entry.content_zh.split("\n\n");

  return (
    <div data-testid="journal-entry" className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm md:p-10">
      {/* Entry Header */}
      <div data-testid="journal-entry-header" className="mb-8 flex items-start justify-between">
        <div>
          <p data-testid="journal-entry-unit" className="text-xs font-semibold tracking-wider text-[var(--cn-orange)] uppercase">
            {entry.unit || "Journal Entry"}{" "}
            <span className="font-normal text-gray-400">
              · {entry.hsk_level > 0 ? `HSK ${entry.hsk_level}` : "General"}
            </span>
          </p>
        </div>
        <div className="text-right text-xs">
          <p data-testid="journal-entry-date" className="font-medium text-[var(--cn-orange)]">
            {date}
          </p>
          <p data-testid="journal-entry-id" className="text-gray-400">
            {entry.id}
          </p>
        </div>
      </div>

      {/* Title */}
      <h1 data-testid="journal-entry-title" className="mb-10 text-4xl font-bold text-gray-900">
        {entry.title_zh}{" "}
        <span className="text-xl font-normal text-gray-400">({entry.title_en})</span>
      </h1>

      {/* Chinese Text Content */}
      <div data-testid="journal-entry-content" className="space-y-6 text-[22px] leading-[2] text-gray-800">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{highlightText(paragraph, highlights)}</p>
        ))}
      </div>

      {/* Self-Notes & Annotations */}
      {annotations.length > 0 && (
        <div data-testid="journal-entry-annotations" className="mt-12 rounded-xl border-l-4 border-[var(--cn-orange)] bg-[var(--cn-orange-light)] p-6">
          <p data-testid="journal-entry-annotations-title" className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--cn-orange)]">
            <span className="inline-block h-4 w-4 rounded bg-[var(--cn-orange)] text-center text-[10px] leading-4 text-white">
              !
            </span>
            Self-Notes &amp; Annotations
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {annotations.map((annotation) => (
              <div
                key={annotation.id}
                data-testid={`journal-entry-annotation-${annotation.type}`}
                className="rounded-lg border border-[var(--cn-orange)]/20 bg-white p-5"
              >
                <p className="mb-2 text-sm font-semibold text-gray-900">
                  {annotation.title}
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  {annotation.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
