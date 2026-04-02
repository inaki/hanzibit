"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Layers, PenLine, RotateCcw, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "./settings-context";
import {
  getStreakAction,
  getProgressAction,
  getUserStatsAction,
  getWeakFlashcardsAction,
  getCharacterOfTheDayAction,
} from "@/lib/actions";
import type { Flashcard, HskWord } from "@/lib/data";

interface Stats {
  entryCount: number;
  vocabCount: number;
  reviewCount: number;
  avgMastery: number;
}

interface ProgressData {
  encountered: number;
  total: number;
  percent: number;
}

export function DashboardView() {
  const { settings } = useSettings();

  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState<ProgressData>({ encountered: 0, total: 0, percent: 0 });
  const [stats, setStats] = useState<Stats>({ entryCount: 0, vocabCount: 0, reviewCount: 0, avgMastery: 0 });
  const [weakCards, setWeakCards] = useState<Flashcard[]>([]);
  const [charOfDay, setCharOfDay] = useState<HskWord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getStreakAction(),
      getProgressAction(settings.hskLevel),
      getUserStatsAction(),
      getWeakFlashcardsAction(5),
      getCharacterOfTheDayAction(settings.hskLevel),
    ]).then(([s, p, st, w, c]) => {
      setStreak(s);
      setProgress(p);
      setStats(st);
      setWeakCards(w);
      setCharOfDay(c);
      setLoading(false);
    });
  }, [settings.hskLevel]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Your learning progress at a glance</p>
      </div>

      {/* Top stat cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {/* Streak */}
        <div className="rounded-xl border bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-[var(--cn-orange)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Streak</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{loading ? "—" : streak}</p>
          <p className="mt-1 text-xs text-gray-500">
            {streak === 0 ? "Start your streak today" : streak === 1 ? "day in a row" : "days in a row"}
          </p>
        </div>

        {/* Journal entries */}
        <div className="rounded-xl border bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <PenLine className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Entries</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{loading ? "—" : stats.entryCount}</p>
          <p className="mt-1 text-xs text-gray-500">journal entries written</p>
        </div>

        {/* Reviews */}
        <div className="rounded-xl border bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-green-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Reviews</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{loading ? "—" : stats.reviewCount}</p>
          <p className="mt-1 text-xs text-gray-500">total reviews completed</p>
        </div>
      </div>

      {/* HSK Progress */}
      <div className="mb-6 rounded-xl border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--cn-orange)]" />
          <h2 className="text-sm font-semibold text-gray-700">HSK {settings.hskLevel} Progress</h2>
          <span className="ml-auto text-sm font-bold text-[var(--cn-orange)]">
            {loading ? "—" : `${progress.percent}%`}
          </span>
        </div>
        <Progress
          value={progress.percent}
          className="mb-3 h-2.5 [&_[data-slot=progress-indicator]]:bg-[var(--cn-orange)]"
        />
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{loading ? "—" : `${progress.encountered} / ${progress.total} words encountered`}</span>
          <Link href="/notebook/lessons" className="text-xs text-[var(--cn-orange)] hover:underline">
            Open study guide →
          </Link>
        </div>
      </div>

      {/* Flashcard stats + weak cards */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Flashcards</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{loading ? "—" : stats.vocabCount}</p>
          <p className="mt-1 text-xs text-gray-500">cards in your deck</p>
          <Link href="/notebook/flashcards" className="mt-3 block text-xs text-[var(--cn-orange)] hover:underline">
            Practice now →
          </Link>
        </div>

        {/* Character of the day */}
        <div className="rounded-xl border bg-white p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Character of the day</p>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--cn-orange-light)]">
              <span className="text-4xl font-bold text-[var(--cn-orange)]">
                {charOfDay?.simplified ?? "—"}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{charOfDay?.pinyin ?? ""}</p>
              <p className="text-sm text-gray-500">{charOfDay?.english ?? ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Needs attention */}
      {!loading && weakCards.length > 0 && (
        <div className="rounded-xl border bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-gray-700">Needs Attention</h2>
            <span className="ml-auto text-xs text-gray-400">Low ease factor — review these soon</span>
          </div>
          <div className="space-y-2">
            {weakCards.map((card) => (
              <div key={card.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div>
                  <span className="text-lg font-bold text-gray-900">{card.front}</span>
                  <span className="ml-3 text-sm text-gray-500">{card.back}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{card.review_count} reviews</span>
                  <span className="font-medium text-red-500">ease {card.ease_factor.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/notebook/flashcards" className="mt-4 block text-center text-sm font-medium text-[var(--cn-orange)] hover:underline">
            Review flashcards →
          </Link>
        </div>
      )}

      {!loading && weakCards.length === 0 && (
        <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
          <p className="text-sm font-medium text-green-700">All caught up — no struggling cards right now.</p>
        </div>
      )}
    </div>
  );
}
