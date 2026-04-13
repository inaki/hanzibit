"use client";

import Link from "next/link";
import type { GlossParagraph, GlossSegment } from "@/lib/gloss";
import { buildGlossPhraseCandidates } from "@/lib/gloss-phrases";

interface InterlinearGlossViewProps {
  paragraphs: GlossParagraph[];
  buildJournalHref?: (token: { hanzi: string; pinyin: string; english: string }) => string;
  buildPhraseJournalHref?: (phrase: { hanzi: string; english: string }) => string;
}

function GlossWord({
  segment,
  buildJournalHref,
}: {
  segment: GlossSegment & { type: "gloss" };
  buildJournalHref?: (token: { hanzi: string; pinyin: string; english: string }) => string;
}) {
  const { token } = segment;
  const journalHref = buildJournalHref?.(token);
  return (
    <span
      data-testid={`gloss-word-${token.hanzi}`}
      className="inline-flex flex-col items-center mx-1 my-1"
    >
      <span
        className={`text-[22px] font-bold leading-tight ${
          token.userAnnotated
            ? "text-[var(--cn-orange)]"
            : "text-foreground"
        }`}
      >
        {token.hanzi}
      </span>
      <span className="text-xs leading-tight text-muted-foreground">{token.pinyin}</span>
      <span className="text-[10px] leading-tight text-muted-foreground/80">{token.english}</span>
      {journalHref && (
        <Link
          href={journalHref}
          className="mt-1 text-[10px] font-medium text-[var(--cn-orange)] hover:underline"
        >
          Use in journal
        </Link>
      )}
    </span>
  );
}

function GlossPunctuation({ char }: { char: string }) {
  return (
    <span className="inline-flex items-end mx-0.5 self-start">
      <span className="text-[22px] leading-tight text-foreground/90">{char}</span>
    </span>
  );
}

export function InterlinearGlossView({
  paragraphs,
  buildJournalHref,
  buildPhraseJournalHref,
}: InterlinearGlossViewProps) {
  const safeParagraphs = Array.isArray(paragraphs) ? paragraphs : [];

  return (
    <div data-testid="interlinear-gloss-view" className="space-y-6">
      {safeParagraphs.map((segments, pi) => (
        <div key={pi} className="space-y-3">
          <div className="flex flex-wrap items-end">
            {(Array.isArray(segments) ? segments : []).map((seg, si) => {
              if (seg.type === "break") return <div key={si} className="w-full" />;
              if (seg.type === "punctuation") return <GlossPunctuation key={si} char={seg.char} />;
              return <GlossWord key={si} segment={seg} buildJournalHref={buildJournalHref} />;
            })}
          </div>
          {buildPhraseJournalHref && buildGlossPhraseCandidates(segments).length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Try a phrase
              </p>
              {buildGlossPhraseCandidates(segments).map((phrase) => (
                <Link
                  key={`${pi}-${phrase.hanzi}`}
                  href={buildPhraseJournalHref(phrase)}
                  className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1 text-[11px] font-medium text-[var(--cn-orange)] transition-colors hover:bg-[var(--cn-orange)]/15"
                  title={phrase.english}
                >
                  {phrase.hanzi}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
