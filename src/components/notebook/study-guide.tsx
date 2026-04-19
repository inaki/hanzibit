"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Layers,
  Clock,
  CheckCircle2,
  Circle,
  Search,
  Plus,
  Lock,
  PenSquare,
  Sparkles,
  NotebookPen,
  ChevronDown,
  GraduationCap,
  PenLine,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Quote,
  Puzzle,
  ArrowRight,
  Check,
  Languages,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { AudioPlayButton } from "./audio-play-button";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { EmptyStateNotice } from "@/components/patterns/guidance";
import { SectionCard } from "@/components/patterns/surfaces";
import { Input } from "@/components/ui/input";
import { useSettings } from "./settings-context";
import {
  getStudyGuideDataAction,
  createFlashcardForWord,
  getDailyPracticeAction,
  getCuratedGrammarPointsAction,
  markGrammarPointStudiedAction,
  getCollocationsAction,
  getCharacterBreakdownsAction,
} from "@/lib/actions";
import type {
  StudyGuideData,
  StudyGuideWord,
  CuratedGrammarPoint,
  HskCollocation,
  CharacterBreakdown,
} from "@/lib/data";
import { buildStudyGuideReading } from "@/lib/study-guide-content";
import type { DailyPracticePlan } from "@/lib/daily-practice";
import { buildInlineAnnotation } from "@/lib/parse-tokens";
import { summarizeEnglishGloss } from "@/lib/annotation-suggestions";

type Filter = "all" | "new" | "learning" | "known";

interface StudyGuideProps {
  initialData: StudyGuideData;
  assignmentId?: string;
  beginnerMode?: boolean;
  isPro?: boolean;
}

function detectTone(pinyin: string): number {
  if (/[āēīōūǖ]/.test(pinyin)) return 1;
  if (/[áéíóúǘ]/.test(pinyin)) return 2;
  if (/[ǎěǐǒǔǚ]/.test(pinyin)) return 3;
  if (/[àèìòùǜ]/.test(pinyin)) return 4;
  return 5;
}

function SecTitle({
  icon: Icon,
  right,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  right?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5 flex items-center gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 text-[var(--cn-orange)]" />}
      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        {children}
      </span>
      <span className="flex-1" />
      {right && (
        <span className="text-[11px] font-medium text-muted-foreground">{right}</span>
      )}
    </div>
  );
}

function HighlightWord({ text, target }: { text: string; target: string }) {
  const parts = text.split(target);
  if (parts.length <= 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="rounded px-0.5 bg-[var(--cn-orange-light)] text-[var(--cn-orange-dark)] font-bold">
              {target}
            </span>
          )}
        </span>
      ))}
    </>
  );
}

function HighlightPatternWord({ text, words }: { text: string; words: string[] }) {
  type Seg = { t: string; hi: boolean };
  let segments: Seg[] = [{ t: text, hi: false }];
  for (const word of words) {
    const next: Seg[] = [];
    for (const seg of segments) {
      if (seg.hi || !seg.t.includes(word)) { next.push(seg); continue; }
      const parts = seg.t.split(word);
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) next.push({ t: parts[i], hi: false });
        if (i < parts.length - 1) next.push({ t: word, hi: true });
      }
    }
    segments = next;
  }
  return (
    <>
      {segments.map((seg, i) =>
        seg.hi ? (
          <span key={i} className="font-bold text-[var(--ui-tone-violet-text)]">{seg.t}</span>
        ) : (
          <span key={i}>{seg.t}</span>
        )
      )}
    </>
  );
}

export function StudyGuide({
  initialData,
  assignmentId,
  beginnerMode = false,
  isPro = false,
}: StudyGuideProps) {
  const { settings } = useSettings();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(
    initialData.words[0]?.word.id ?? null
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [dailyPractice, setDailyPractice] = useState<DailyPracticePlan | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sidebarTab, setSidebarTab] = useState<"words" | "grammar">("words");
  const [grammarPoints, setGrammarPoints] = useState<CuratedGrammarPoint[]>([]);
  const [selectedGrammarId, setSelectedGrammarId] = useState<number | null>(null);
  const [grammarLoading, setGrammarLoading] = useState(false);

  const initialSynced = useRef(false);
  useEffect(() => {
    if (!initialSynced.current && settings.hskLevel !== data.level) {
      initialSynced.current = true;
      handleLevelChange(settings.hskLevel);
    } else {
      initialSynced.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestedWordId = (() => {
    const wordIdFromUrl = searchParams.get("wordId");
    if (wordIdFromUrl) {
      const parsedWordId = Number.parseInt(wordIdFromUrl, 10);
      if (
        Number.isInteger(parsedWordId) &&
        data.words.some((item) => item.word.id === parsedWordId)
      ) {
        return parsedWordId;
      }
    }
    const wordFromUrl = searchParams.get("word");
    if (!wordFromUrl) return null;
    const found = data.words.find((item) => item.word.simplified === wordFromUrl);
    return found?.word.id ?? null;
  })();

  useEffect(() => {
    let cancelled = false;
    getDailyPracticeAction(data.level).then((plan) => {
      if (!cancelled) setDailyPractice(plan);
    });
    return () => {
      cancelled = true;
    };
  }, [data.level]);

  useEffect(() => {
    if (sidebarTab !== "grammar") return;
    let cancelled = false;
    setGrammarLoading(true);
    getCuratedGrammarPointsAction(data.level).then((pts) => {
      if (cancelled) return;
      setGrammarPoints(pts);
      setSelectedGrammarId(pts[0]?.id ?? null);
      setGrammarLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [sidebarTab, data.level]);

  function handleLevelChange(level: number) {
    startTransition(async () => {
      const newData = await getStudyGuideDataAction(level);
      setData(newData);
      setSelectedWordId(newData.words[0]?.word.id ?? null);
      setSearch("");
      if (sidebarTab === "grammar") {
        setGrammarLoading(true);
        const pts = await getCuratedGrammarPointsAction(level);
        setGrammarPoints(pts);
        setSelectedGrammarId(pts[0]?.id ?? null);
        setGrammarLoading(false);
      }
    });
  }

  const newCount = data.words.filter((w) => !w.encountered && !w.flashcard).length;
  const learningCount = data.words.filter((w) => w.flashcard !== null).length;
  const knownCount = data.words.filter((w) => w.encountered).length;

  const filteredWords = data.words.filter((w) => {
    if (filter === "new" && (w.encountered || w.flashcard)) return false;
    if (filter === "learning" && !w.flashcard) return false;
    if (filter === "known" && !w.encountered) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        w.word.simplified.includes(q) ||
        w.word.pinyin.toLowerCase().includes(q) ||
        w.word.english.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const effectiveSelectedWordId = requestedWordId ?? selectedWordId;
  const selected =
    filteredWords.find((item) => item.word.id === effectiveSelectedWordId) ??
    filteredWords[0] ??
    null;
  const selectedIndex = filteredWords.findIndex(
    (item) => item.word.id === selected?.word.id
  );
  const prevWord = selectedIndex > 0 ? filteredWords[selectedIndex - 1] : null;
  const nextWord =
    selectedIndex < filteredWords.length - 1
      ? filteredWords[selectedIndex + 1]
      : null;
  const isBeginnerMode = beginnerMode && data.level === 1;

  const encPct =
    data.summary.total > 0
      ? (data.summary.encountered / data.summary.total) * 100
      : 0;
  const fcPct =
    data.summary.total > 0
      ? (data.summary.withFlashcard / data.summary.total) * 100
      : 0;

  return (
    <div
      data-testid="study-guide"
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Slim HSK header — desktop only, non-beginner, non-locked */}
      {!isBeginnerMode && !data.locked && (
        <div className="hidden shrink-0 items-center gap-5 border-b bg-card px-8 py-3 lg:flex">
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[rgba(232,96,28,0.2)] bg-[var(--cn-orange-light)] px-2.5 py-1 text-xs font-semibold text-[var(--cn-orange-dark)]">
            <BookMarked className="h-3 w-3" />
            HSK {data.level}
          </div>
          <div className="flex min-w-[200px] max-w-[360px] flex-1 items-center gap-2.5">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[var(--cn-orange)]"
                style={{ width: `${encPct}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[var(--t-sky-t)] opacity-85"
                style={{ width: `${fcPct}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-[12px] text-muted-foreground">
              {Math.round(encPct)}%
            </span>
          </div>
          <div className="flex gap-5">
            {[
              { v: data.summary.total, l: "words", c: "text-foreground" },
              { v: data.summary.encountered, l: "encountered", c: "text-[var(--cn-orange)]" },
              { v: data.summary.withFlashcard, l: "flashcards", c: "text-[var(--t-sky-t)]" },
              { v: data.summary.dueForReview, l: "due", c: "text-[var(--t-amber-t)]" },
            ].map(({ v, l, c }) => (
              <div key={l} className="flex flex-col gap-0.5">
                <span className={`text-[16px] font-bold leading-none ${c}`}>{v}</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {l}
                </span>
              </div>
            ))}
          </div>
          <div className="ml-auto shrink-0">
            <div className="relative">
              <select
                data-testid="study-guide-level-select"
                value={data.level}
                onChange={(e) => handleLevelChange(Number.parseInt(e.target.value, 10))}
                disabled={isPending}
                className="appearance-none rounded-lg border border-border bg-card py-1.5 pl-3 pr-8 text-xs font-medium text-foreground outline-none transition-colors focus:border-[var(--ui-tone-orange-border)]"
              >
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <option key={level} value={level}>
                    HSK {level}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
            </div>
          </div>
        </div>
      )}

      {/* Main body */}
      <div className="flex flex-1 min-h-0 flex-col overflow-auto p-6 pb-20 md:p-10 lg:flex-row lg:overflow-hidden lg:p-0">
        {/* Left sidebar */}
        <div className="mb-6 lg:mb-0 lg:h-full lg:w-[320px] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:bg-card">
          {/* Sticky tab bar */}
          <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex rounded-[10px] bg-muted p-0.5">
                <button
                  onClick={() => setSidebarTab("words")}
                  className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-medium transition-colors ${
                    sidebarTab === "words"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Words
                </button>
                <button
                  onClick={() => setSidebarTab("grammar")}
                  className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-medium transition-colors ${
                    sidebarTab === "grammar"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Grammar
                </button>
              </div>
              {/* Level selector — mobile only (desktop has it in the slim header) */}
              <div className="relative shrink-0 lg:hidden">
                <select
                  value={data.level}
                  onChange={(e) => handleLevelChange(Number.parseInt(e.target.value, 10))}
                  disabled={isPending}
                  className="appearance-none rounded-lg border border-border bg-card py-1.5 pl-3 pr-8 text-xs font-medium text-foreground outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <option key={level} value={level}>
                      HSK {level}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
              </div>
            </div>
          </div>

          {/* Words list */}
          {!data.locked && sidebarTab === "words" && (
            <div className="p-4">
              {isBeginnerMode && (
                <EmptyStateNotice className="ui-tone-sky-panel mb-4 px-4 py-3">
                  Start with one HSK 1 word. Open the first word, read the tiny
                  example, and use it in one short journal response.
                </EmptyStateNotice>
              )}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  data-testid="study-guide-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search words…"
                  className="pl-9 text-sm"
                />
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {(
                  [
                    { key: "all" as Filter, label: "All", count: data.words.length },
                    { key: "new" as Filter, label: "New", count: newCount },
                    { key: "learning" as Filter, label: "Learning", count: learningCount },
                    { key: "known" as Filter, label: "Known", count: knownCount },
                  ]
                ).map((f) => (
                  <button
                    key={f.key}
                    data-testid={`study-guide-filter-${f.key}`}
                    onClick={() => setFilter(f.key)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      filter === f.key
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                        filter === f.key
                          ? "bg-white/25"
                          : "bg-black/[0.06]"
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              <div data-testid="study-guide-word-list" className="space-y-0.5">
                {filteredWords.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground/70">
                    No words match your filter.
                  </p>
                ) : (
                  filteredWords.map((item) => {
                    const isSelected = selected?.word.id === item.word.id;
                    const wStatus = item.encountered
                      ? "known"
                      : item.flashcard
                      ? "learning"
                      : "not-yet";
                    const isDue =
                      item.flashcard &&
                      new Date(item.flashcard.nextReview) <= new Date();
                    const isStuck =
                      item.flashcard &&
                      item.flashcard.easeFactor < 2.0 &&
                      item.flashcard.reviewCount > 1;
                    return (
                      <button
                        key={item.word.id}
                        data-testid={`study-guide-word-${item.word.simplified}`}
                        onClick={() => setSelectedWordId(item.word.id)}
                        className={`grid w-full rounded-[10px] border px-2.5 py-2.5 text-left transition-colors ${
                          isSelected
                            ? "border-[rgba(232,96,28,0.35)] bg-[var(--cn-orange-light)]"
                            : "border-transparent hover:bg-muted"
                        }`}
                        style={{ gridTemplateColumns: "18px 1fr auto" }}
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            wStatus === "known"
                              ? "bg-[var(--t-emerald-t)]"
                              : wStatus === "learning"
                              ? "bg-[var(--cn-orange)]"
                              : "border border-border/80"
                          }`}
                        >
                          {wStatus === "known" && (
                            <Check className="h-2.5 w-2.5 stroke-[3.5] text-white" />
                          )}
                          {wStatus === "learning" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="min-w-0 px-3">
                          <div className="mb-0.5 flex items-baseline gap-1.5">
                            <span
                              className={`text-[18px] font-bold leading-none ${
                                isSelected
                                  ? "text-[var(--cn-orange)]"
                                  : "text-foreground"
                              }`}
                            >
                              {item.word.simplified}
                            </span>
                            <span className="truncate font-mono text-[11px] leading-none text-muted-foreground">
                              {item.word.pinyin}
                            </span>
                          </div>
                          <p className="truncate text-xs leading-snug text-muted-foreground">
                            {item.word.english}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          {isStuck && (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--t-rose-t)]">
                              Stuck
                            </span>
                          )}
                          {isDue && !isStuck && (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--t-amber-t)]">
                              Due
                            </span>
                          )}
                          {wStatus === "not-yet" && !isDue && !isStuck && (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--t-sky-t)]">
                              New
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Grammar list */}
          {!data.locked && sidebarTab === "grammar" && (
            <div
              data-testid="study-guide-grammar-list"
              className="space-y-1 p-4"
            >
              {grammarLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground/70">
                  Loading grammar…
                </p>
              ) : grammarPoints.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground/70">
                  No grammar patterns yet.
                </p>
              ) : (
                grammarPoints.map((gp) => (
                  <button
                    key={gp.id}
                    onClick={() => setSelectedGrammarId(gp.id)}
                    className={`flex w-full items-start gap-3 rounded-[10px] border px-3 py-2.5 text-left transition-colors ${
                      selectedGrammarId === gp.id
                        ? "border-[var(--ui-tone-violet-border)] bg-[var(--ui-tone-violet-surface)]"
                        : "border-transparent hover:bg-muted"
                    }`}
                  >
                    {gp.studied ? (
                      <CheckCircle2 className="ui-tone-emerald-text mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold leading-tight ${
                          selectedGrammarId === gp.id
                            ? "text-[var(--ui-tone-violet-text)]"
                            : "text-foreground"
                        }`}
                      >
                        {gp.title}
                      </p>
                      {gp.pattern && (
                        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/70">
                          {gp.pattern}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right detail pane */}
        <div className="min-h-0 flex-1 lg:overflow-y-auto lg:px-10 lg:py-8">
          {data.locked ? (
            <EmptyStateNotice className="mx-6 mt-6 flex flex-col items-center justify-center rounded-xl py-16 text-center lg:mx-0 lg:mt-0">
              <Lock className="mb-3 h-8 w-8 text-muted-foreground/50" />
              <h3 className="text-base font-semibold text-foreground/80">
                HSK {data.level} is for Pro members
              </h3>
              <p className="mb-4 mt-1 text-sm text-muted-foreground/70">
                Upgrade to access all 6 HSK levels
              </p>
              <UpgradePrompt reason="Get unlimited access to all HSK levels and vocabulary with Pro." />
            </EmptyStateNotice>
          ) : (
            <>
              {/* Mobile progress card */}
              {!isBeginnerMode && (
                <div className="mb-6 lg:hidden">
                  <div className="rounded-xl bg-card card-ring p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        HSK {data.level} Progress
                      </p>
                      <span className="text-sm font-bold text-[var(--cn-orange)]">
                        {Math.round(encPct)}%
                      </span>
                    </div>
                    <div className="relative mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-[var(--cn-orange)]"
                        style={{ width: `${encPct}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-[var(--t-sky-t)] opacity-85"
                        style={{ width: `${fcPct}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-xl font-bold text-foreground">{data.summary.total}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[var(--cn-orange)]">{data.summary.encountered}</p>
                        <p className="text-xs text-muted-foreground">Enc.</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[var(--t-sky-t)]">{data.summary.withFlashcard}</p>
                        <p className="text-xs text-muted-foreground">Cards</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[var(--t-amber-t)]">{data.summary.dueForReview}</p>
                        <p className="text-xs text-muted-foreground">Due</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sidebarTab === "grammar" ? (
                (() => {
                  const selectedGrammarIndex = grammarPoints.findIndex(
                    (g) => g.id === selectedGrammarId
                  );
                  const selectedGp = grammarPoints[selectedGrammarIndex] ?? null;
                  const prevGrammarPoint =
                    selectedGrammarIndex > 0
                      ? grammarPoints[selectedGrammarIndex - 1]
                      : null;
                  const nextGrammarPoint =
                    selectedGrammarIndex < grammarPoints.length - 1
                      ? grammarPoints[selectedGrammarIndex + 1]
                      : null;
                  return selectedGp ? (
                    <GrammarDetail
                      key={selectedGp.id}
                      point={selectedGp}
                      level={data.level}
                      prevPoint={prevGrammarPoint ?? null}
                      nextPoint={nextGrammarPoint ?? null}
                      onSelectGrammar={setSelectedGrammarId}
                      onStudied={(id) => {
                        setGrammarPoints((prev) =>
                          prev.map((g) => (g.id === id ? { ...g, studied: true } : g))
                        );
                      }}
                    />
                  ) : (
                    <EmptyStateNotice className="flex h-64 items-center justify-center rounded-xl bg-card card-ring text-sm">
                      Select a grammar pattern to view details
                    </EmptyStateNotice>
                  );
                })()
              ) : selected ? (
                <WordDetail
                  key={`${selected.word.id}-${isBeginnerMode ? "beginner" : "full"}`}
                  item={selected}
                  level={data.level}
                  dailyPractice={dailyPractice}
                  assignmentId={assignmentId}
                  beginnerMode={isBeginnerMode}
                  isPro={isPro}
                  prevWord={prevWord}
                  nextWord={nextWord}
                  onSelectWord={setSelectedWordId}
                />
              ) : (
                <EmptyStateNotice
                  data-testid="study-guide-empty"
                  className="flex h-64 items-center justify-center rounded-xl bg-card card-ring text-sm"
                >
                  Select a word to view details
                </EmptyStateNotice>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Word Detail ---

function WordDetail({
  item,
  level,
  dailyPractice,
  assignmentId,
  beginnerMode = false,
  isPro = false,
  prevWord,
  nextWord,
  onSelectWord,
}: {
  item: StudyGuideWord;
  level: number;
  dailyPractice: DailyPracticePlan | null;
  assignmentId?: string;
  beginnerMode?: boolean;
  isPro?: boolean;
  prevWord: StudyGuideWord | null;
  nextWord: StudyGuideWord | null;
  onSelectWord: (id: number) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [openingReview, setOpeningReview] = useState(false);
  const [createdWordId, setCreatedWordId] = useState<number | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(!beginnerMode);
  const [collocations, setCollocations] = useState<HskCollocation[]>([]);
  const [breakdowns, setBreakdowns] = useState<CharacterBreakdown[]>([]);
  const [openStep, setOpenStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    getCollocationsAction(item.word.simplified).then(setCollocations).catch(() => {});
    getCharacterBreakdownsAction(item.word.simplified).then(setBreakdowns).catch(() => {});
  }, [item.word.simplified]);

  const reading = buildStudyGuideReading(item, level);
  const compactEnglish = summarizeEnglishGloss(item.word.english) || item.word.english;
  const draftTitleZh = `练习：${item.word.simplified}`;
  const draftTitleEn = `Practice: ${compactEnglish}`;
  const draftUnit = `HSK ${level} Study Guide`;
  const draftContentZh = buildInlineAnnotation(
    item.word.simplified,
    item.word.pinyin,
    compactEnglish
  );
  const beginnerSentenceZh = reading.focusPhraseZh.includes(item.word.simplified)
    ? reading.focusPhraseZh.replace(
        item.word.simplified,
        buildInlineAnnotation(item.word.simplified, item.word.pinyin, compactEnglish)
      )
    : `${draftContentZh} ${reading.focusPhraseZh}`.trim();
  const assignmentParam = assignmentId
    ? `&draftAssignmentId=${encodeURIComponent(assignmentId)}`
    : "";
  const journalHref = `/notebook?new=1&draftTitleZh=${encodeURIComponent(draftTitleZh)}&draftTitleEn=${encodeURIComponent(draftTitleEn)}&draftUnit=${encodeURIComponent(draftUnit)}&draftLevel=${level}&draftContentZh=${encodeURIComponent(beginnerMode ? beginnerSentenceZh : draftContentZh)}&draftPrompt=${encodeURIComponent(beginnerMode ? `Optional: keep this sentence as it is, or change one small part so it still uses ${item.word.simplified}. You can also skip writing for now and go review the word.` : reading.responsePrompt)}&draftSourceZh=${encodeURIComponent(reading.passageZh)}&draftSourceEn=${encodeURIComponent(reading.passageEn)}&draftTargetWord=${encodeURIComponent(item.word.simplified)}&draftTargetPinyin=${encodeURIComponent(item.word.pinyin)}&draftTargetEnglish=${encodeURIComponent(beginnerMode ? compactEnglish : item.word.english)}&draftSourceType=study_guide&draftSourceRef=${encodeURIComponent(String(item.word.id))}${assignmentParam}${beginnerMode ? "&draftBeginner=1" : ""}`;
  const phraseJournalHref = `/notebook?new=1&draftTitleZh=${encodeURIComponent(draftTitleZh)}&draftTitleEn=${encodeURIComponent(draftTitleEn)}&draftUnit=${encodeURIComponent(draftUnit)}&draftLevel=${level}&draftContentZh=${encodeURIComponent(`${draftContentZh} ${reading.focusPhraseZh}`)}&draftSelectedText=${encodeURIComponent(reading.focusPhraseZh)}&draftPrompt=${encodeURIComponent(`Use the phrase "${reading.focusPhraseZh}" in your own response and keep ${item.word.simplified} annotated.`)}&draftSourceZh=${encodeURIComponent(reading.passageZh)}&draftSourceEn=${encodeURIComponent(reading.passageEn)}&draftTargetWord=${encodeURIComponent(item.word.simplified)}&draftTargetPinyin=${encodeURIComponent(item.word.pinyin)}&draftTargetEnglish=${encodeURIComponent(item.word.english)}&draftSourceType=study_guide&draftSourceRef=${encodeURIComponent(String(item.word.id))}${assignmentParam}`;
  const listeningJournalHref = `/notebook?new=1&draftTitleZh=${encodeURIComponent(draftTitleZh)}&draftTitleEn=${encodeURIComponent(draftTitleEn)}&draftUnit=${encodeURIComponent(`${draftUnit} Listening`)}&draftLevel=${level}&draftContentZh=${encodeURIComponent(`${draftContentZh} ${reading.listeningZh}`)}&draftSelectedText=${encodeURIComponent(reading.listeningZh)}&draftPrompt=${encodeURIComponent(reading.listeningPrompt)}&draftSourceZh=${encodeURIComponent(reading.listeningZh)}&draftSourceEn=${encodeURIComponent(reading.listeningEn)}&draftTargetWord=${encodeURIComponent(item.word.simplified)}&draftTargetPinyin=${encodeURIComponent(item.word.pinyin)}&draftTargetEnglish=${encodeURIComponent(item.word.english)}&draftSourceType=study_guide&draftSourceRef=${encodeURIComponent(String(item.word.id))}${assignmentParam}`;
  const phraseCandidateHrefs = reading.phraseCandidates.map((candidate) => ({
    ...candidate,
    href: `/notebook?new=1&draftTitleZh=${encodeURIComponent(draftTitleZh)}&draftTitleEn=${encodeURIComponent(draftTitleEn)}&draftUnit=${encodeURIComponent(draftUnit)}&draftLevel=${level}&draftContentZh=${encodeURIComponent(`${draftContentZh} ${candidate.zh}`)}&draftSelectedText=${encodeURIComponent(candidate.zh)}&draftPrompt=${encodeURIComponent(`Use the phrase "${candidate.zh}" in your own response and keep ${item.word.simplified} annotated.`)}&draftSourceZh=${encodeURIComponent(reading.passageZh)}&draftSourceEn=${encodeURIComponent(reading.passageEn)}&draftTargetWord=${encodeURIComponent(item.word.simplified)}&draftTargetPinyin=${encodeURIComponent(item.word.pinyin)}&draftTargetEnglish=${encodeURIComponent(item.word.english)}&draftSourceType=study_guide&draftSourceRef=${encodeURIComponent(String(item.word.id))}${assignmentParam}`,
  }));
  const reviewHref = `/notebook/flashcards?mode=due&focus=${encodeURIComponent(item.word.simplified)}&wordId=${encodeURIComponent(String(item.word.id))}&level=${encodeURIComponent(String(level))}${beginnerMode ? "&beginner=1" : ""}`;
  const isFocusWord = dailyPractice?.recommendedStudyWord?.id === item.word.id;
  const latestFocusResponseHref =
    dailyPractice?.latestGuidedResponseToday?.sourceRef === String(item.word.id)
      ? `/notebook?entry=${dailyPractice.latestGuidedResponseToday.id}`
      : null;

  async function handleCreateFlashcard() {
    setCreating(true);
    try {
      const result = await createFlashcardForWord(
        item.word.simplified,
        item.word.pinyin,
        item.word.english
      );
      if ("id" in result || "duplicate" in result) {
        setCreatedWordId(item.word.id);
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleOpenReview() {
    if (beginnerMode && !hasFlashcard) {
      setOpeningReview(true);
      try {
        const result = await createFlashcardForWord(
          item.word.simplified,
          item.word.pinyin,
          item.word.english
        );
        if ("id" in result || "duplicate" in result) {
          setCreatedWordId(item.word.id);
        }
      } finally {
        setOpeningReview(false);
      }
    }
    router.push(reviewHref);
  }

  const created = createdWordId === item.word.id;
  const hasFlashcard = item.flashcard !== null || created;
  const tone = detectTone(item.word.pinyin);

  // Beginner mode — simplified view
  if (beginnerMode && !showFullDetails) {
    return (
      <SectionCard data-testid="study-guide-detail" className="rounded-xl p-8">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2">
            <p className="text-[64px] font-bold leading-none text-[var(--cn-orange)]">
              {item.word.simplified}
            </p>
            <AudioPlayButton text={item.word.simplified} type="word" size="md" />
          </div>
          <p className="font-mono mt-3 text-base text-muted-foreground">
            {item.word.pinyin}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{item.word.english}</p>
        </div>

        <SectionCard
          className="ui-tone-sky-panel border p-5"
          title="Start here"
          description="You only need to learn one small thing right now."
          icon={Sparkles}
        >
          <div className="rounded-lg bg-card card-ring p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
              Tiny example
            </p>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-lg leading-8 text-foreground">{reading.focusPhraseZh}</p>
              {isPro && (
                <AudioPlayButton text={reading.focusPhraseZh} type="sentence" />
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{reading.focusPhraseEn}</p>
          </div>
          <p className="mt-4 text-sm text-foreground/85">
            Read the word, glance at the example, then open one tiny review card. If you
            want, you can also try one ready-made sentence before that.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleOpenReview}
              disabled={openingReview}
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {openingReview ? "Preparing tiny review..." : "Open tiny review →"}
            </button>
            <Link
              href={journalHref}
              className="ui-tone-sky-panel ui-tone-sky-text inline-flex items-center rounded-full bg-card card-ring px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60"
            >
              Try one sentence (optional) →
            </Link>
            <button
              type="button"
              onClick={() => setShowFullDetails(true)}
              className="ui-tone-sky-panel ui-tone-sky-text inline-flex items-center rounded-full bg-card card-ring px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60"
            >
              See full study details
            </button>
          </div>
        </SectionCard>
      </SectionCard>
    );
  }

  const practiceSteps = [
    {
      verb: "Notice",
      title: `Spot ${item.word.simplified} in a phrase`,
      time: "~30s",
      body: (
        <div className="pt-3">
          <p className="mb-3 text-sm text-muted-foreground">
            Find {item.word.simplified} in context. Tap a phrase to use it in your journal:
          </p>
          <div className="flex flex-wrap gap-2">
            {phraseCandidateHrefs.map((c) => (
              <Link
                key={c.zh}
                href={c.href}
                title={c.en}
                className="inline-flex items-center rounded-full border border-[var(--ui-tone-orange-border)] bg-[var(--ui-tone-orange-surface)] px-3 py-1.5 text-xs font-medium text-[var(--cn-orange-dark)] transition-colors hover:bg-[var(--cn-orange-light)]"
              >
                {c.zh}
              </Link>
            ))}
            <Link
              href={phraseJournalHref}
              className="inline-flex items-center rounded-full border border-[var(--ui-tone-orange-border)] bg-[var(--ui-tone-orange-surface)] px-3 py-1.5 text-xs font-medium text-[var(--cn-orange-dark)] transition-colors hover:bg-[var(--cn-orange-light)]"
            >
              {reading.focusPhraseZh}
            </Link>
          </div>
        </div>
      ),
    },
    {
      verb: "Echo",
      title: "Listen and repeat",
      time: "~1 min",
      body: (
        <div className="pt-3">
          <div className="mb-3 rounded-lg bg-muted/40 px-4 py-3">
            <p className="font-medium text-foreground">{reading.listeningZh}</p>
            <p className="mt-1 text-sm text-muted-foreground">{reading.listeningEn}</p>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">{reading.listeningPrompt}</p>
          <div className="flex items-center gap-2">
            {isPro && (
              <AudioPlayButton text={reading.listeningZh} type="sentence" />
            )}
            <Link
              href={listeningJournalHref}
              className="inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Respond in journal →
            </Link>
          </div>
        </div>
      ),
    },
    {
      verb: "Check",
      title: "Quick comprehension",
      time: "~30s",
      body: (
        <div className="pt-3">
          <p className="text-sm text-foreground">{reading.comprehensionCheck}</p>
        </div>
      ),
    },
    {
      verb: "Write",
      title: `Use ${item.word.simplified} in your own sentence`,
      time: "~3 min",
      body: (
        <div className="pt-3">
          <p className="mb-3 text-sm text-muted-foreground">{reading.responsePrompt}</p>
          <Link
            href={journalHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--cn-orange)] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            <PenLine className="h-3.5 w-3.5" />
            Open journal →
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div data-testid="study-guide-detail">
      {/* Hero */}
      <div
        className="mb-7 grid items-center gap-9 border-b border-border/60 pb-7"
        style={{ gridTemplateColumns: "auto 1fr" }}
      >
        {/* Left: char + action buttons */}
        <div className="flex flex-col items-center gap-2.5">
          <p className="text-[120px] font-bold leading-none tracking-[-0.02em] text-foreground">
            {item.word.simplified}
          </p>
          <div className="flex gap-2">
            <AudioPlayButton
              text={item.word.simplified}
              type="word"
              size="md"
              className="bg-[var(--cn-orange)] text-white hover:bg-[var(--cn-orange-dark)] hover:text-white"
            />
            <button
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground transition-colors hover:bg-muted"
              title="Stroke order"
            >
              <PenSquare className="h-4 w-4" />
            </button>
            <button
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground transition-colors hover:bg-muted"
              title="Bookmark"
            >
              <BookMarked className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: meta */}
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-baseline gap-2 font-mono text-[28px] font-semibold leading-none text-[var(--cn-orange)]">
            {item.word.pinyin}
            {tone < 5 && (
              <span className="inline-block rounded-[5px] bg-[var(--cn-orange-light)] px-1.5 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wider text-[var(--cn-orange-dark)]">
                Tone {tone}
              </span>
            )}
          </div>
          <div className="mb-0.5 text-lg font-medium leading-snug text-foreground">
            {item.word.english.split(";")[0]}
          </div>
          {item.word.english.includes(";") && (
            <div className="mb-2 text-sm text-muted-foreground">
              {item.word.english.split(";").slice(1).join(";").trim()}
            </div>
          )}
          {item.word.traditional &&
            item.word.traditional !== item.word.simplified && (
              <div className="mb-2 text-sm text-muted-foreground/60">
                Traditional: {item.word.traditional}
              </div>
            )}
          <div className="mt-3 flex flex-wrap gap-2">
            {item.encountered ? (
              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ui-tone-emerald-panel ui-tone-emerald-text">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Encountered
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--t-sky-b)] bg-[var(--t-sky-s)] px-3 py-1 text-xs font-medium text-[var(--t-sky-t)]">
                <Sparkles className="h-3.5 w-3.5" />
                Not yet encountered
              </span>
            )}
            {hasFlashcard ? (
              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ui-tone-sky-panel ui-tone-sky-text">
                <Layers className="h-3.5 w-3.5" />
                In flashcards
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <Layers className="h-3.5 w-3.5" />
                No flashcard yet
              </span>
            )}
            {isFocusWord && (
              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ui-tone-orange-panel ui-tone-orange-text">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Today&apos;s focus
              </span>
            )}
            <RegisterBadge register={item.word.register} />
          </div>
        </div>
      </div>

      {/* Cultural note */}
      {item.word.cultural_note && (
        <div className="mb-6 rounded-lg ui-tone-amber-panel px-4 py-3 text-sm">
          <p className="ui-tone-amber-text mb-1 text-[10px] font-semibold uppercase tracking-wider">
            Cultural note
          </p>
          <p className="leading-relaxed text-foreground/90">{item.word.cultural_note}</p>
        </div>
      )}

      {/* Character Breakdown */}
      {breakdowns.length > 0 && (
        <div className="mb-7">
          <SecTitle icon={Puzzle} right="Hover a radical for details">
            Character Breakdown
          </SecTitle>
          <div className="space-y-3">
            {breakdowns.map((bd) => (
              <div
                key={bd.character}
                className="relative overflow-hidden rounded-[14px] border border-border bg-card px-5 py-5"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-7 -top-10 text-[200px] font-bold leading-none text-[var(--cn-orange)] opacity-[0.04]"
                >
                  {bd.character}
                </div>
                <div className="relative flex flex-wrap items-center gap-2.5">
                  <span className="mr-1 border-r border-dashed border-border pr-3 text-[48px] font-bold leading-none text-foreground">
                    {bd.character}
                  </span>
                  <span className="text-2xl font-light text-muted-foreground">=</span>
                  {bd.components.map((c, i) => (
                    <span key={i} className="flex items-center gap-2">
                      {i > 0 && (
                        <span className="text-lg font-light text-muted-foreground">+</span>
                      )}
                      <span className="flex min-w-[60px] cursor-pointer flex-col items-center gap-1 rounded-[10px] bg-[var(--cn-orange-light)] px-2.5 py-1.5 transition-colors hover:bg-[oklch(0.96_0.04_45)]">
                        <span className="text-[28px] font-bold leading-none text-[var(--cn-orange-dark)]">
                          {c.char}
                        </span>
                        <span className="text-[10px] font-semibold tracking-[0.02em] text-[var(--cn-orange-dark)]">
                          {c.meaning}
                        </span>
                      </span>
                    </span>
                  ))}
                </div>
                {bd.mnemonic && (
                  <div className="relative mt-4 flex items-start gap-2.5 border-t border-border/60 pt-3.5 text-sm italic text-foreground/70">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--cn-orange)]" />
                    <p>{bd.mnemonic}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seen in context */}
      {collocations.length > 0 && (
        <div className="mb-7">
          <SecTitle icon={Quote}>Seen in context</SecTitle>
          <div className="space-y-2.5">
            {collocations.map((c) => (
              <div
                key={c.id}
                className="grid gap-3 rounded-[12px] border border-border bg-card p-4"
                style={{ gridTemplateColumns: "1fr auto" }}
              >
                <div>
                  <p className="mb-1 text-[17px] font-medium leading-relaxed">
                    <HighlightWord
                      text={c.sentence_zh}
                      target={item.word.simplified}
                    />
                  </p>
                  <p className="text-sm text-muted-foreground">{c.sentence_en}</p>
                  {c.known_words.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.known_words.map((w) => (
                        <span
                          key={w}
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            c.encountered_words.includes(w)
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {w}
                          {c.encountered_words.includes(w) && (
                            <span className="ml-1 opacity-70">✓</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-start gap-1 whitespace-nowrap pt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cn-orange-dark)]">
                  <BookMarked className="h-3 w-3" />
                  HSK context
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Loop (focus word only) */}
      {isFocusWord && dailyPractice?.focusWordProgress ? (
        <div className="ui-tone-orange-panel mb-6 rounded-lg border p-4">
          <p className="ui-tone-orange-text text-xs font-semibold uppercase tracking-wider">
            Today&apos;s Loop
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FocusStatusPill done={dailyPractice.focusWordProgress.reviewedToday} label="Review" />
            <FocusStatusPill done={dailyPractice.focusWordProgress.studiedToday} label="Study" />
            <FocusStatusPill done={dailyPractice.focusWordProgress.wroteToday} label="Write" />
          </div>
          {(!dailyPractice.focusWordProgress.reviewedToday ||
            !dailyPractice.focusWordProgress.wroteToday) && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {!dailyPractice.focusWordProgress.reviewedToday && (
                <Link
                  href={reviewHref}
                  className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Review now →
                </Link>
              )}
              {!dailyPractice.focusWordProgress.wroteToday && (
                <Link
                  href={journalHref}
                  className="ui-tone-orange-panel ui-tone-orange-text inline-flex items-center rounded-full bg-card card-ring px-3 py-1 text-xs font-medium transition-colors hover:bg-muted/60"
                >
                  Write now →
                </Link>
              )}
            </div>
          )}
          {dailyPractice.focusWordProgress.wroteToday && latestFocusResponseHref && (
            <div className="mt-3">
              <Link
                href={latestFocusResponseHref}
                className="ui-tone-orange-text inline-flex items-center text-xs font-medium hover:underline"
              >
                Open latest response →
              </Link>
            </div>
          )}
        </div>
      ) : null}

      {/* Journal entries */}
      {item.journalEntries.length > 0 && (
        <div className="mb-6">
          <SecTitle icon={BookOpen}>Appeared in</SecTitle>
          <div className="space-y-1">
            {item.journalEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/notebook?entry=${entry.id}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-[var(--ui-tone-orange-border)] hover:bg-[var(--ui-tone-orange-surface)]"
              >
                <BookOpen className="ui-tone-orange-text h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{entry.title_zh}</span>
                <span className="text-xs text-muted-foreground/70">{entry.title_en}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Guided Responses */}
      {item.guidedResponses.length > 0 && (
        <div className="mb-6">
          <SecTitle icon={NotebookPen}>Guided Responses</SecTitle>
          <div className="space-y-2">
            {item.guidedResponses.map((response) => (
              <Link
                key={response.id}
                href={`/notebook?entry=${response.id}`}
                className="ui-tone-sky-panel flex items-center justify-between rounded-lg border px-3 py-3 text-sm transition-colors hover:opacity-90"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{response.title_zh}</p>
                  <p className="truncate text-xs text-muted-foreground">{response.title_en}</p>
                </div>
                <span className="ui-tone-sky-text shrink-0 text-xs">
                  {new Date(response.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Practice Ladder */}
      <div className="mb-7">
        <SecTitle
          icon={ListChecks}
          right={`${completedSteps.size} of 4 done · ~5 min total`}
        >
          Practice Ladder
        </SecTitle>
        <div className="space-y-2.5">
          {practiceSteps.map((step, i) => {
            const isDone = completedSteps.has(i);
            const isOpen = openStep === i;
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-[14px] border transition-all ${
                  isDone
                    ? "border-[var(--t-emerald-b)] bg-[var(--t-emerald-s)]"
                    : isOpen
                    ? "border-[rgba(232,96,28,0.4)] bg-card shadow-[0_0_0_1px_rgba(232,96,28,0.4),0_2px_6px_rgba(232,96,28,0.06)]"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className="grid cursor-pointer items-center gap-3.5 px-4 py-3.5"
                  style={{ gridTemplateColumns: "32px 1fr auto auto" }}
                  onClick={() => setOpenStep(isOpen ? -1 : i)}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      isDone
                        ? "bg-[var(--t-emerald-t)] text-white"
                        : isOpen
                        ? "bg-[var(--cn-orange)] text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : i + 1}
                  </div>
                  <div>
                    <span className="mr-2 text-xs font-bold uppercase tracking-wider text-[var(--cn-orange)]">
                      {step.verb}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {step.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{step.time}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isOpen && (
                  <div className="border-t border-border/50 px-4 pb-4">
                    {step.body}
                    <button
                      onClick={() => {
                        setCompletedSteps((prev) => new Set([...prev, i]));
                        setOpenStep(i < 3 ? i + 1 : -1);
                      }}
                      className="mt-3 text-xs font-medium text-[var(--cn-orange)] hover:underline"
                    >
                      Mark done →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: flashcard info/action + prev/next navigation */}
      <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-5">
        <div>
          {item.flashcard ? (
            <div className="flex gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground/70">Reviews</p>
                <p className="font-bold text-foreground">{item.flashcard.reviewCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/70">Interval</p>
                <p className="font-bold text-foreground">{item.flashcard.intervalDays}d</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/70">Next review</p>
                <p className="font-bold">
                  {new Date(item.flashcard.nextReview) <= new Date() ? (
                    <span className="ui-tone-amber-text flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Due now
                    </span>
                  ) : (
                    <span className="text-foreground">
                      {new Date(item.flashcard.nextReview).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : !created ? (
            <button
              data-testid="study-guide-create-flashcard"
              onClick={handleCreateFlashcard}
              disabled={creating}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {creating ? "Creating..." : `Create flashcard`}
            </button>
          ) : (
            <p className="ui-tone-emerald-text flex items-center gap-1.5 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Flashcard created!
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={!prevWord}
            onClick={() => prevWord && onSelectWord(prevWord.word.id)}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            title="Previous word"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            disabled={!nextWord}
            onClick={() => nextWord && onSelectWord(nextWord.word.id)}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            title="Next word"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {nextWord && (
            <button
              onClick={() => onSelectWord(nextWord.word.id)}
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--cn-orange)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Next: {nextWord.word.simplified}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function RegisterBadge({ register }: { register: string }) {
  if (!register || register === "neutral") return null;
  const configs: Record<string, { label: string; className: string }> = {
    chengyu: {
      label: "Chengyu",
      className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    formal: { label: "Formal", className: "ui-tone-sky-panel ui-tone-sky-text" },
    written: {
      label: "Written",
      className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
    colloquial: { label: "Colloquial", className: "ui-tone-amber-panel ui-tone-amber-text" },
    slang: {
      label: "Slang",
      className: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    },
  };
  const config = configs[register];
  if (!config) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function FocusStatusPill({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        done
          ? "border ui-tone-emerald-panel ui-tone-emerald-text"
          : "bg-background text-muted-foreground"
      }`}
    >
      {label}
    </span>
  );
}

// --- Grammar Detail ---

function GrammarDetail({
  point,
  level,
  onStudied,
  prevPoint,
  nextPoint,
  onSelectGrammar,
}: {
  point: CuratedGrammarPoint;
  level: number;
  onStudied: (id: number) => void;
  prevPoint: CuratedGrammarPoint | null;
  nextPoint: CuratedGrammarPoint | null;
  onSelectGrammar: (id: number) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const allExamples: { zh: string; pinyin: string; en: string; type?: "good" | "bad"; note?: string }[] = (() => {
    try {
      return JSON.parse(point.examples);
    } catch {
      return [];
    }
  })();
  const examples = allExamples.filter((e) => e.type !== "bad");
  const badExamples = allExamples.filter((e) => e.type === "bad");

  const watchOutNotes: string[] = (() => {
    if (!point.watch_out_notes) return [];
    try {
      return JSON.parse(point.watch_out_notes);
    } catch {
      return [];
    }
  })();

  // Parse "Subj + 不 + V/Adj" → ["Subj", "不", "V/Adj"]
  const patternTokens = point.pattern
    ? point.pattern.split("+").map((t) => t.trim())
    : [];

  // Chinese tokens from pattern — used to highlight in examples
  const grammarWords = patternTokens.filter((t) => /[\u4e00-\u9fff]/.test(t));

  const journalHref = `/notebook?new=1&draftTitleZh=${encodeURIComponent("语法练习")}&draftTitleEn=${encodeURIComponent(`Grammar: ${point.title}`)}&draftUnit=${encodeURIComponent(`HSK ${level} Grammar`)}&draftLevel=${level}&draftPrompt=${encodeURIComponent(point.journal_prompt)}`;

  function handleMarkStudied() {
    if (point.studied) return;
    startTransition(async () => {
      await markGrammarPointStudiedAction(point.id);
      onStudied(point.id);
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-7 border-b border-border/60 pb-7">
        <div className="mb-3 flex items-center gap-2">
          <Languages className="h-4 w-4 text-[var(--ui-tone-violet-text)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--ui-tone-violet-text)]">
            Grammar Pattern · HSK {level}
          </span>
        </div>
        <h2 className="mb-3.5 text-[32px] font-bold leading-tight tracking-[-0.01em] text-foreground">
          {point.title}
        </h2>

        {/* Formula token pills */}
        {patternTokens.length > 0 && (
          <div
            data-testid="grammar-pattern-formula"
            className="mb-3.5 inline-flex flex-wrap items-center gap-2.5 rounded-[12px] border border-[var(--ui-tone-violet-border)] bg-[var(--ui-tone-violet-surface)] px-4 py-2.5 font-mono text-lg font-semibold text-[var(--ui-tone-violet-text)]"
          >
            {patternTokens.map((token, i) => {
              const isChinese = /[\u4e00-\u9fff]/.test(token);
              return (
                <span
                  key={i}
                  data-testid={`grammar-pattern-slot-${i}`}
                  className="flex items-center gap-2.5"
                >
                  {i > 0 && (
                    <span
                      data-testid="grammar-pattern-separator"
                      className="opacity-50"
                    >
                      +
                    </span>
                  )}
                  <span
                    data-testid={isChinese ? "grammar-pattern-token-chinese" : "grammar-pattern-token-label"}
                    className={`rounded-[6px] px-2 py-0.5 ${
                      isChinese
                        ? "bg-[var(--cn-orange-light)] text-[var(--cn-orange-dark)]"
                        : "bg-white text-[var(--ui-tone-violet-text)]"
                    }`}
                  >
                    {token}
                  </span>
                </span>
              );
            })}
          </div>
        )}

        <p className="max-w-[720px] text-[15px] leading-[1.6] text-foreground/80">
          {point.explanation}
        </p>

        <div className="mt-4">
          {point.studied ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ui-tone-emerald-panel ui-tone-emerald-text">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Studied
            </span>
          ) : (
            <button
              onClick={handleMarkStudied}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Circle className="h-3.5 w-3.5" />
              Mark studied
            </button>
          )}
        </div>
      </div>

      {/* Examples */}
      {examples.length > 0 && (
        <div className="mb-7">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Examples
          </h3>
          <div className="space-y-2.5">
            {examples.map((ex, i) => (
              <div
                key={i}
                className="rounded-[12px] border border-border bg-card px-4 py-4"
                style={{ borderLeftWidth: "3px", borderLeftColor: "var(--t-emerald-t)" }}
              >
                <p className="mb-1 text-[17px] font-medium leading-[1.6] text-foreground">
                  <HighlightPatternWord text={ex.zh} words={grammarWords} />
                </p>
                <p className="mb-1 font-mono text-[12px] text-muted-foreground">{ex.pinyin}</p>
                <p className="text-[13px] text-muted-foreground">{ex.en}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Mistake */}
      {badExamples.length > 0 && (
        <div className="mb-7">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Common Mistake
          </h3>
          <div className="space-y-2.5">
            {badExamples.map((ex, i) => (
              <div
                key={i}
                className="rounded-[12px] border border-border bg-card px-4 py-4"
                style={{ borderLeftWidth: "3px", borderLeftColor: "var(--t-rose-t)" }}
              >
                <p className="mb-1 text-[17px] font-medium leading-[1.6]">
                  <span
                    style={{
                      color: "var(--t-rose-t)",
                      fontWeight: 700,
                      textDecoration: "line-through",
                      textDecorationColor: "var(--t-rose-b)",
                    }}
                  >
                    {ex.zh}
                  </span>
                </p>
                <p className="mb-1 font-mono text-[12px] text-muted-foreground">{ex.pinyin}</p>
                <p className="mb-2 text-[13px] text-muted-foreground">{ex.en}</p>
                {ex.note && (
                  <div className="flex items-start gap-1.5 text-[12px] font-medium text-[var(--t-rose-t)]">
                    <AlertCircle className="mt-px h-[13px] w-[13px] shrink-0" />
                    <span>{ex.note}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watch Out For */}
      {watchOutNotes.length > 0 && (
        <div className="mb-7 rounded-[12px] border border-[var(--t-amber-b)] bg-[var(--t-amber-s)] px-4 py-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--t-amber-t)]">
            <AlertTriangle className="h-[13px] w-[13px]" />
            Watch out for
          </p>
          <ul className="list-none space-y-1">
            {watchOutNotes.map((note, i) => (
              <li key={i} className="relative pl-3.5 text-[13px] leading-[1.65] text-[var(--text-body)]">
                <span
                  className="absolute left-0 top-[9px] h-1 w-1 rounded-full bg-[var(--t-amber-t)]"
                  aria-hidden
                />
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reading Passage */}
      <div className="mb-7 rounded-xl bg-card card-ring px-5 py-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Reading Passage
        </p>
        <p className="text-base leading-[2] text-foreground/90">{point.reading_passage}</p>
        <div className="mt-3 border-t border-border/40 pt-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-[var(--cn-orange)]">Comprehension: </span>
            {point.comprehension_question}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
        <Link
          href={journalHref}
          onClick={handleMarkStudied}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <PenLine className="h-4 w-4" />
          Try this pattern in a journal entry
        </Link>
        <div className="flex items-center gap-2">
          {prevPoint && (
            <button
              onClick={() => onSelectGrammar(prevPoint.id)}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground transition-colors hover:bg-muted"
              title={`Previous: ${prevPoint.title}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {nextPoint && (
            <button
              onClick={() => onSelectGrammar(nextPoint.id)}
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--cn-orange)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Next: {nextPoint.title}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
