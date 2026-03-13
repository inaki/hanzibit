"use client";

import { useRef, useState, useEffect } from "react";
import type { JournalEntry, EntryAnnotation } from "@/lib/data";
import { parseInput, type Token } from "@/lib/parse-tokens";
import { useGloss } from "./gloss-context";
import { InterlinearGlossView } from "./interlinear-gloss-view";

interface JournalEntryViewProps {
  entry: JournalEntry;
  annotations: EntryAnnotation[];
}

function HanziToken({ hanzi, pinyin, english }: { hanzi: string; pinyin: string; english: string }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<"left" | "center" | "right">("center");

  const handleEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.left < 120) setPos("left");
      else if (window.innerWidth - rect.right < 120) setPos("right");
      else setPos("center");
    }
    setShow(true);
  };

  return (
    <span
      ref={ref}
      data-testid={`journal-entry-vocab-${hanzi}`}
      className="relative inline-block cursor-pointer"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((s) => !s)}
    >
      <span
        className={`rounded px-0.5 font-bold transition-all ${
          show
            ? "bg-[var(--cn-orange)] text-white"
            : "text-[var(--cn-orange)] border-b-2 border-dotted border-[var(--cn-orange)]/40"
        }`}
      >
        {hanzi}
      </span>
      {show && (
        <span
          className={`absolute bottom-[calc(100%+8px)] z-50 min-w-[100px] rounded-lg bg-gray-900 px-3 py-2 text-center shadow-lg pointer-events-none ${
            pos === "center"
              ? "left-1/2 -translate-x-1/2"
              : pos === "left"
                ? "left-0"
                : "right-0"
          }`}
        >
          <span className="block text-sm font-bold text-[var(--cn-orange-light)]">{pinyin}</span>
          <span className="block text-xs text-gray-300">{english}</span>
          {/* Arrow */}
          <span
            className={`absolute top-full border-[6px] border-transparent border-t-gray-900 ${
              pos === "center"
                ? "left-1/2 -translate-x-1/2"
                : pos === "left"
                  ? "left-5"
                  : "right-5"
            }`}
          />
        </span>
      )}
    </span>
  );
}

function renderTokens(tokens: Token[]) {
  return tokens.map((t, i) => {
    if (t.type === "break") return <br key={i} />;
    if (t.type === "text") return <span key={i}>{t.text}</span>;
    return <HanziToken key={i} hanzi={t.hanzi} pinyin={t.pinyin} english={t.english} />;
  });
}

export function JournalEntryView({
  entry,
  annotations,
}: JournalEntryViewProps) {
  const date = new Date(entry.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Split by double newlines into paragraphs, then parse each
  const paragraphs = entry.content_zh.split("\n\n");

  const gloss = useGloss();
  const showGloss = gloss.state.active && gloss.state.data && !gloss.state.loading;

  // --- Smooth height animation for the entire card ---
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const sync = () => {
      const h = inner.scrollHeight;
      if (firstRender.current) {
        // No transition on first paint — just set the height
        outer.style.transition = "none";
        outer.style.height = `${h}px`;
        // Force reflow then restore transition
        outer.offsetHeight; // eslint-disable-line @typescript-eslint/no-unused-expressions
        outer.style.transition = "";
        firstRender.current = false;
      } else {
        outer.style.height = `${h}px`;
      }
    };

    const ro = new ResizeObserver(sync);
    ro.observe(inner);
    sync();
    return () => ro.disconnect();
  }, [entry.id, showGloss]);

  return (
    <div
      ref={outerRef}
      data-testid="journal-entry"
      className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-white shadow-sm transition-[height] duration-400 ease-in-out"
    >
      <div ref={innerRef} className="p-8 md:p-10">
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

        {/* Chinese Text Content — crossfade between normal and interlinear gloss */}
        <div className="relative">
          {/* Normal view */}
          <div
            data-testid="journal-entry-content"
            className={`space-y-6 text-[22px] leading-[2] text-gray-800 transition-opacity duration-300 ease-in-out ${
              showGloss ? "pointer-events-none absolute inset-0 opacity-0" : "opacity-100"
            }`}
          >
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{renderTokens(parseInput(paragraph))}</p>
            ))}
          </div>

          {/* Gloss view */}
          <div
            className={`transition-opacity duration-300 ease-in-out ${
              showGloss ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            {gloss.state.loading && gloss.state.active && (
              <p className="text-sm text-gray-400 animate-pulse">Loading interlinear gloss...</p>
            )}
            {gloss.state.data && (
              <InterlinearGlossView paragraphs={gloss.state.data} />
            )}
          </div>
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
    </div>
  );
}
