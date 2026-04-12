"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Layers,
  Clock,
  CheckCircle2,
  Circle,
  Search,
  Plus,
  Languages,
  Lock,
  BookText,
  PenSquare,
  Sparkles,
  CircleHelp,
  NotebookPen,
} from "lucide-react";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "./settings-context";
import { getStudyGuideDataAction, createFlashcardForWord, getDailyPracticeAction } from "@/lib/actions";
import type { StudyGuideData, StudyGuideWord } from "@/lib/data";
import { buildStudyGuideReading } from "@/lib/study-guide-content";
import type { DailyPracticePlan } from "@/lib/daily-practice";

type Filter = "all" | "encountered" | "not-yet" | "flashcard";

interface StudyGuideProps {
  initialData: StudyGuideData;
}

export function StudyGuide({ initialData }: StudyGuideProps) {
  const { settings } = useSettings();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [dailyPractice, setDailyPractice] = useState<DailyPracticePlan | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sync with settings HSK level on mount only
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

  useEffect(() => {
    const wordIdFromUrl = searchParams.get("wordId");
    if (wordIdFromUrl) {
      const parsedWordId = Number.parseInt(wordIdFromUrl, 10);
      if (Number.isInteger(parsedWordId)) {
        const idx = data.words.findIndex((item) => item.word.id === parsedWordId);
        if (idx >= 0) {
          setSelectedIndex(idx);
          return;
        }
      }
    }

    const wordFromUrl = searchParams.get("word");
    if (!wordFromUrl) return;

    const idx = data.words.findIndex((item) => item.word.simplified === wordFromUrl);
    if (idx >= 0) {
      setSelectedIndex(idx);
    }
  }, [data.words, searchParams]);

  useEffect(() => {
    let cancelled = false;
    getDailyPracticeAction(data.level).then((plan) => {
      if (!cancelled) {
        setDailyPractice(plan);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [data.level]);

  function handleLevelChange(level: number) {
    startTransition(async () => {
      const newData = await getStudyGuideDataAction(level);
      setData(newData);
      setSelectedIndex(0);
      setSearch("");
    });
  }

  // Filter + search
  const filteredWords = data.words.filter((w) => {
    if (filter === "encountered" && !w.encountered) return false;
    if (filter === "not-yet" && w.encountered) return false;
    if (filter === "flashcard" && !w.flashcard) return false;
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

  const selected = filteredWords.length > 0
    ? data.words[selectedIndex] ?? filteredWords[0]
    : null;

  return (
    <div data-testid="study-guide" className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Study Guide</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your progress through HSK vocabulary
        </p>
      </div>

      {/* Level tabs */}
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <button
            key={level}
            data-testid={`study-guide-level-${level}`}
            onClick={() => handleLevelChange(level)}
            disabled={isPending}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              data.level === level
                ? "bg-[var(--cn-orange)] text-white"
                : "bg-muted text-muted-foreground hover:bg-muted"
            }`}
          >
            HSK {level}
          </button>
        ))}
      </div>

      {/* Locked state */}
      {data.locked && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
          <Lock className="mb-3 h-8 w-8 text-muted-foreground/50" />
          <h3 className="text-base font-semibold text-foreground/80">
            HSK {data.level} is for Pro members
          </h3>
          <p className="mb-4 mt-1 text-sm text-muted-foreground/70">
            Upgrade to access all 6 HSK levels
          </p>
          <UpgradePrompt reason="Get unlimited access to all HSK levels and vocabulary with Pro." />
        </div>
      )}

      {/* Summary bar + word list (hidden when locked) */}
      {!data.locked && (<><div className="mb-6 rounded-xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground/80">
            HSK {data.level} Progress
          </span>
          <span className="text-sm font-bold text-[var(--cn-orange)]">
            {data.summary.total > 0
              ? Math.round((data.summary.encountered / data.summary.total) * 100)
              : 0}%
          </span>
        </div>
        <Progress
          value={data.summary.total > 0 ? (data.summary.encountered / data.summary.total) * 100 : 0}
          className="mb-4 h-2 [&_[data-slot=progress-indicator]]:bg-[var(--cn-orange)]"
        />
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{data.summary.total}</p>
            <p className="text-xs text-muted-foreground">Total words</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{data.summary.encountered}</p>
            <p className="text-xs text-muted-foreground">Encountered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{data.summary.withFlashcard}</p>
            <p className="text-xs text-muted-foreground">Flashcards</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{data.summary.dueForReview}</p>
            <p className="text-xs text-muted-foreground">Due for review</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Word list */}
        <div className="w-80 shrink-0">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              data-testid="study-guide-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words..."
              className="pl-9 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="mb-3 flex flex-wrap gap-1">
            {([
              { key: "all", label: `All (${data.words.length})` },
              { key: "encountered", label: `Known (${data.summary.encountered})` },
              { key: "not-yet", label: `New (${data.summary.total - data.summary.encountered})` },
              { key: "flashcard", label: `Cards (${data.summary.withFlashcard})` },
            ] as { key: Filter; label: string }[]).map((f) => (
              <button
                key={f.key}
                data-testid={`study-guide-filter-${f.key}`}
                onClick={() => { setFilter(f.key); setSelectedIndex(0); }}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  filter === f.key
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Word list */}
          <div data-testid="study-guide-word-list" className="max-h-[60vh] space-y-1 overflow-auto">
            {filteredWords.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground/70">
                No words match your filter.
              </p>
            ) : (
              filteredWords.map((item) => {
                const idx = data.words.indexOf(item);
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={item.word.id}
                    data-testid={`study-guide-word-${item.word.simplified}`}
                    onClick={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "bg-[var(--cn-orange-light)] border border-[var(--cn-orange)]/20"
                        : "bg-card border border-border hover:border-border"
                    }`}
                  >
                    {item.encountered ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${isSelected ? "text-[var(--cn-orange)]" : "text-foreground"}`}>
                          {item.word.simplified}
                        </span>
                        <span className="truncate text-xs text-muted-foreground/70">{item.word.pinyin}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{item.word.english}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {item.flashcard && item.flashcard.easeFactor < 2.0 && item.flashcard.reviewCount > 1 && (
                        <span className="rounded bg-red-100 px-1 text-[10px] text-red-600">struggling</span>
                      )}
                      {item.flashcard && (
                        <Layers className="h-3.5 w-3.5 text-blue-400" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1">
          {selected ? (
            <WordDetail item={selected} level={data.level} dailyPractice={dailyPractice} />
          ) : (
            <div data-testid="study-guide-empty" className="flex h-64 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground/70">
              Select a word to view details
            </div>
          )}

          {/* Grammar Points */}
          {data.grammarPoints.length > 0 && (
            <div className="mt-6 rounded-xl border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <Languages className="h-4 w-4 text-[var(--cn-orange)]" />
                Grammar Points — HSK {data.level}
              </h3>
              <div className="space-y-3">
                {data.grammarPoints.map((gp) => (
                  <div key={gp.id} className="rounded-lg border border-border bg-muted/50 p-4">
                    <p className="text-sm font-semibold text-foreground">{gp.title}</p>
                    {gp.pattern && (
                      <p className="mt-0.5 font-mono text-xs text-[var(--cn-orange)]">{gp.pattern}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{gp.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </>)}
    </div>
  );
}

// --- Word Detail ---

function WordDetail({
  item,
  level,
  dailyPractice,
}: {
  item: StudyGuideWord;
  level: number;
  dailyPractice: DailyPracticePlan | null;
}) {
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const reading = buildStudyGuideReading(item, level);
  const draftTitleZh = `练习：${item.word.simplified}`;
  const draftTitleEn = `Practice: ${item.word.english}`;
  const draftUnit = `HSK ${level} Study Guide`;
  const draftContentZh = `${item.word.simplified}`;
  const journalHref = `/notebook?new=1&draftTitleZh=${encodeURIComponent(draftTitleZh)}&draftTitleEn=${encodeURIComponent(draftTitleEn)}&draftUnit=${encodeURIComponent(draftUnit)}&draftLevel=${level}&draftContentZh=${encodeURIComponent(draftContentZh)}&draftPrompt=${encodeURIComponent(reading.responsePrompt)}&draftSourceZh=${encodeURIComponent(reading.passageZh)}&draftSourceEn=${encodeURIComponent(reading.passageEn)}&draftTargetWord=${encodeURIComponent(item.word.simplified)}&draftSourceType=study_guide&draftSourceRef=${encodeURIComponent(String(item.word.id))}`;
  const reviewHref = `/notebook/flashcards?mode=due&focus=${encodeURIComponent(item.word.simplified)}&wordId=${encodeURIComponent(String(item.word.id))}&level=${encodeURIComponent(String(level))}`;
  const isFocusWord = dailyPractice?.recommendedStudyWord?.id === item.word.id;
  const latestFocusResponseHref =
    dailyPractice?.latestGuidedResponseToday?.sourceRef === String(item.word.id)
      ? `/notebook?entry=${dailyPractice.latestGuidedResponseToday.id}`
      : null;

  // Reset created state when word changes
  useEffect(() => {
    setCreated(false);
  }, [item.word.id]);

  async function handleCreateFlashcard() {
    setCreating(true);
    try {
      const result = await createFlashcardForWord(
        item.word.simplified,
        item.word.pinyin,
        item.word.english
      );
      if ("id" in result || "duplicate" in result) {
        setCreated(true);
      }
    } finally {
      setCreating(false);
    }
  }

  const hasFlashcard = item.flashcard !== null || created;

  return (
    <div data-testid="study-guide-detail" className="rounded-xl border bg-card p-8">
      {/* Character display */}
      <div className="mb-6 text-center">
        <p className="text-7xl font-bold text-[var(--cn-orange)]">{item.word.simplified}</p>
        {item.word.traditional && (
          <p className="mt-1 text-lg text-muted-foreground/70">{item.word.traditional}</p>
        )}
        <p className="mt-3 text-xl font-medium text-foreground/80">{item.word.pinyin}</p>
        <p className="mt-1 text-muted-foreground">{item.word.english}</p>
      </div>

      {/* Status badges */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {item.encountered ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Encountered
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Circle className="h-3.5 w-3.5" />
            Not yet encountered
          </span>
        )}
        {hasFlashcard ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Layers className="h-3.5 w-3.5" />
            In flashcards
          </span>
        ) : null}
        {isFocusWord ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cn-orange-light)] px-3 py-1 text-xs font-medium text-[var(--cn-orange)]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Today&apos;s focus
          </span>
        ) : null}
      </div>

      {isFocusWord && dailyPractice?.focusWordProgress ? (
        <div className="mb-6 rounded-lg border border-[var(--cn-orange)]/20 bg-[var(--cn-orange-light)]/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cn-orange)]">
            Today&apos;s Loop
          </p>
          <p className="mt-1 text-sm text-foreground/85">
            This study item is the current focus word in today&apos;s learner loop.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FocusStatusPill done={dailyPractice.focusWordProgress.reviewedToday} label="Review" />
            <FocusStatusPill done={dailyPractice.focusWordProgress.studiedToday} label="Study" />
            <FocusStatusPill done={dailyPractice.focusWordProgress.wroteToday} label="Write" />
          </div>
          {(!dailyPractice.focusWordProgress.reviewedToday || !dailyPractice.focusWordProgress.wroteToday) && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!dailyPractice.focusWordProgress.reviewedToday && (
                <Link
                  href={reviewHref}
                  className="inline-flex items-center rounded-full bg-[var(--cn-orange)] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[var(--cn-orange-dark)]"
                >
                  Review now →
                </Link>
              )}
              {!dailyPractice.focusWordProgress.wroteToday && (
                <Link
                  href={journalHref}
                  className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/30 bg-white px-3 py-1 text-xs font-medium text-[var(--cn-orange)] transition-colors hover:bg-white/80"
                >
                  Write now →
                </Link>
              )}
            </div>
          )}
          {dailyPractice.focusWordProgress.wroteToday && latestFocusResponseHref && (
            <div className="mt-4">
              <Link
                href={latestFocusResponseHref}
                className="inline-flex items-center text-xs font-medium text-[var(--cn-orange)] hover:underline"
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
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            <BookOpen className="h-3.5 w-3.5" />
            Appeared in
          </h4>
          <div className="space-y-1">
            {item.journalEntries.map((entry) => (
              <Link
                key={entry.id}
                href="/notebook"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-[var(--cn-orange-light)]"
              >
                <BookOpen className="h-3.5 w-3.5 text-[var(--cn-orange)]" />
                <span className="font-medium text-foreground">{entry.title_zh}</span>
                <span className="text-xs text-muted-foreground/70">{entry.title_en}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          <NotebookPen className="h-3.5 w-3.5" />
          Guided Responses
        </h4>
        {item.guidedResponses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            No guided response yet for this study item.
          </div>
        ) : (
          <div className="space-y-2">
            {item.guidedResponses.map((response) => (
              <Link
                key={response.id}
                href={`/notebook?entry=${response.id}`}
                className="flex items-center justify-between rounded-lg border border-sky-100 bg-sky-50 px-3 py-3 text-sm transition-colors hover:border-sky-200"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{response.title_zh}</p>
                  <p className="truncate text-xs text-muted-foreground">{response.title_en}</p>
                </div>
                <span className="shrink-0 text-xs text-sky-700">
                  {new Date(response.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 rounded-lg border border-[var(--cn-orange)]/20 bg-[var(--cn-orange-light)] p-5">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--cn-orange)]">
          <BookText className="h-3.5 w-3.5" />
          Input Practice
        </h4>
        <p className="text-sm font-semibold text-foreground">{reading.title}</p>
        <p className="mt-3 text-lg leading-[1.9] text-foreground/90">{reading.passageZh}</p>
        <p className="mt-3 text-sm text-muted-foreground">{reading.passageEn}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-white/70 bg-white/70 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              <Sparkles className="h-3.5 w-3.5" />
              Notice This Phrase
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">{reading.focusPhraseZh}</p>
            <p className="mt-1 text-sm text-muted-foreground">{reading.focusPhraseEn}</p>
          </div>
          <div className="rounded-lg border border-white/70 bg-white/70 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              <CircleHelp className="h-3.5 w-3.5" />
              Quick Check
            </p>
            <p className="mt-2 text-sm text-foreground/85">{reading.comprehensionCheck}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-white/70 bg-white/70 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            <PenSquare className="h-3.5 w-3.5" />
            Journal Response
          </p>
          <p className="mt-2 text-sm text-foreground/85">{reading.responsePrompt}</p>
          <Link
            href={journalHref}
            className="mt-3 inline-flex items-center text-xs font-medium text-[var(--cn-orange)] hover:underline"
          >
            Respond in journal →
          </Link>
        </div>
      </div>

      {/* Flashcard status */}
      {item.flashcard ? (
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
            <Layers className="h-3.5 w-3.5" />
            Flashcard
          </h4>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-xs text-blue-500">Reviews</p>
              <p className="font-bold text-blue-700">{item.flashcard.reviewCount}</p>
            </div>
            <div>
              <p className="text-xs text-blue-500">Interval</p>
              <p className="font-bold text-blue-700">{item.flashcard.intervalDays}d</p>
            </div>
            <div>
              <p className="text-xs text-blue-500">Next review</p>
              <p className="font-bold text-blue-700">
                {new Date(item.flashcard.nextReview) <= new Date() ? (
                  <span className="flex items-center gap-1 text-amber-600">
                    <Clock className="h-3.5 w-3.5" /> Due now
                  </span>
                ) : (
                  new Date(item.flashcard.nextReview).toLocaleDateString()
                )}
              </p>
            </div>
          </div>
        </div>
      ) : !created ? (
        <div className="text-center">
          <button
            data-testid="study-guide-create-flashcard"
            onClick={handleCreateFlashcard}
            disabled={creating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--cn-orange)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--cn-orange-dark)] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {creating ? "Creating..." : "Create Flashcard"}
          </button>
        </div>
      ) : (
        <p className="text-center text-sm font-medium text-green-600">
          Flashcard created!
        </p>
      )}
    </div>
  );
}

function FocusStatusPill({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
        done
          ? "bg-emerald-100 text-emerald-700"
          : "bg-background text-muted-foreground"
      }`}
    >
      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
