"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  Layers,
  Clock,
  CheckCircle2,
  Circle,
  Search,
  Plus,
  Languages,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "./settings-context";
import { getStudyGuideDataAction, createFlashcardForWord } from "@/lib/actions";
import type { StudyGuideData, StudyGuideWord } from "@/lib/data";

type Filter = "all" | "encountered" | "not-yet" | "flashcard";

interface StudyGuideProps {
  initialData: StudyGuideData;
}

export function StudyGuide({ initialData }: StudyGuideProps) {
  const { settings } = useSettings();
  const [data, setData] = useState(initialData);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Sync with settings HSK level on mount only
  const [initialSynced, setInitialSynced] = useState(false);
  useEffect(() => {
    if (!initialSynced && settings.hskLevel !== data.level) {
      setInitialSynced(true);
      startTransition(async () => {
        const newData = await getStudyGuideDataAction(settings.hskLevel);
        setData(newData);
        setSelectedIndex(null);
        setSearch("");
      });
    } else {
      setInitialSynced(true);
    }
  }, [initialSynced, settings.hskLevel, data.level]);

  function handleLevelChange(level: number) {
    startTransition(async () => {
      const newData = await getStudyGuideDataAction(level);
      setData(newData);
      setSelectedIndex(null);
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

  const selected = selectedIndex !== null ? data.words[selectedIndex] : null;

  return (
    <div data-testid="study-guide" className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Study Guide</h1>
        <p className="mt-1 text-sm text-gray-500">
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
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            HSK {level}
          </button>
        ))}
      </div>

      {/* Summary bar */}
      <div className="mb-6 rounded-xl border bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
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
            <p className="text-2xl font-bold text-gray-900">{data.summary.total}</p>
            <p className="text-xs text-gray-500">Total words</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{data.summary.encountered}</p>
            <p className="text-xs text-gray-500">Encountered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{data.summary.withFlashcard}</p>
            <p className="text-xs text-gray-500">Flashcards</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{data.summary.dueForReview}</p>
            <p className="text-xs text-gray-500">Due for review</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Word list */}
        <div className="w-80 shrink-0">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                onClick={() => { setFilter(f.key); setSelectedIndex(null); }}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  filter === f.key
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Word list */}
          <div data-testid="study-guide-word-list" className="max-h-[60vh] space-y-1 overflow-auto">
            {filteredWords.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
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
                        : "bg-white border border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {item.encountered ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-gray-300" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${isSelected ? "text-[var(--cn-orange)]" : "text-gray-900"}`}>
                          {item.word.simplified}
                        </span>
                        <span className="truncate text-xs text-gray-400">{item.word.pinyin}</span>
                      </div>
                      <p className="truncate text-xs text-gray-500">{item.word.english}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
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
            <WordDetail item={selected} />
          ) : (
            <div data-testid="study-guide-empty" className="flex h-64 items-center justify-center rounded-xl border bg-white text-sm text-gray-400">
              Select a word to view details
            </div>
          )}

          {/* Grammar Points */}
          {data.grammarPoints.length > 0 && (
            <div className="mt-6 rounded-xl border bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Languages className="h-4 w-4 text-[var(--cn-orange)]" />
                Grammar Points — HSK {data.level}
              </h3>
              <div className="space-y-3">
                {data.grammarPoints.map((gp) => (
                  <div key={gp.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">{gp.title}</p>
                    {gp.pattern && (
                      <p className="mt-0.5 font-mono text-xs text-[var(--cn-orange)]">{gp.pattern}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-600">{gp.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Word Detail ---

function WordDetail({ item }: { item: StudyGuideWord }) {
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

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
    <div data-testid="study-guide-detail" className="rounded-xl border bg-white p-8">
      {/* Character display */}
      <div className="mb-6 text-center">
        <p className="text-7xl font-bold text-[var(--cn-orange)]">{item.word.simplified}</p>
        {item.word.traditional && (
          <p className="mt-1 text-lg text-gray-400">{item.word.traditional}</p>
        )}
        <p className="mt-3 text-xl font-medium text-gray-700">{item.word.pinyin}</p>
        <p className="mt-1 text-gray-500">{item.word.english}</p>
      </div>

      {/* Status badges */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {item.encountered ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Encountered
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
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
      </div>

      {/* Journal entries */}
      {item.journalEntries.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <BookOpen className="h-3.5 w-3.5" />
            Appeared in
          </h4>
          <div className="space-y-1">
            {item.journalEntries.map((entry) => (
              <Link
                key={entry.id}
                href="/notebook"
                className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-[var(--cn-orange-light)]"
              >
                <BookOpen className="h-3.5 w-3.5 text-[var(--cn-orange)]" />
                <span className="font-medium text-gray-900">{entry.title_zh}</span>
                <span className="text-xs text-gray-400">{entry.title_en}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

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
