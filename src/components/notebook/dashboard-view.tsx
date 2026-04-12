"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Layers, PenLine, RotateCcw, TrendingUp, AlertCircle, CheckCircle2, Circle, BookText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "./settings-context";
import {
  getDailyPracticeAction,
  getStreakAction,
  getProgressAction,
  getUserStatsAction,
  getWeakFlashcardsAction,
  getCharacterOfTheDayAction,
} from "@/lib/actions";
import type { Flashcard, HskWord } from "@/lib/data";
import type { DailyPracticePlan } from "@/lib/daily-practice";

type PracticeStepKey = "review" | "study" | "write";

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
  const [dailyPractice, setDailyPractice] = useState<DailyPracticePlan | null>(null);
  const [loadedLevel, setLoadedLevel] = useState<number | null>(null);
  const loading = loadedLevel !== settings.hskLevel;
  const latestStudyHref =
    !loading && dailyPractice?.latestGuidedResponseToday?.sourceRef
      ? `/notebook/lessons?level=${settings.hskLevel}&wordId=${encodeURIComponent(dailyPractice.latestGuidedResponseToday.sourceRef)}`
      : `/notebook/lessons?level=${settings.hskLevel}`;
  const dueFlashcardsHref = "/notebook/flashcards?mode=due";
  const journalDraftHref =
    !loading && dailyPractice
      ? `/notebook?new=1&draftTitleZh=${encodeURIComponent("今日练习")}&draftTitleEn=${encodeURIComponent("Daily practice")}&draftUnit=${encodeURIComponent(`HSK ${settings.hskLevel} Daily Practice`)}&draftLevel=${settings.hskLevel}&draftContentZh=${encodeURIComponent(dailyPractice.latestGuidedResponseToday?.sourceWordSimplified ?? "")}&draftPrompt=${encodeURIComponent(dailyPractice.writingPromptBody)}&draftTargetWord=${encodeURIComponent(dailyPractice.latestGuidedResponseToday?.sourceWordSimplified ?? "")}${dailyPractice.latestGuidedResponseToday?.sourceRef ? `&draftSourceType=study_guide&draftSourceRef=${encodeURIComponent(dailyPractice.latestGuidedResponseToday.sourceRef)}` : ""}`
      : "/notebook";
  const missingStepActionHref = (key: "review" | "study" | "write") => {
    if (key === "review") return dueFlashcardsHref;
    if (key === "study") return latestStudyHref;
    return journalDraftHref;
  };

  const missingStepActionLabel = (key: "review" | "study" | "write") => {
    if (key === "review") return "Open flashcards";
    if (key === "study") {
      return !loading && dailyPractice?.latestGuidedResponseToday?.sourceRef
        ? "Open related study item"
        : "Open study guide";
    }
    return "Open journal";
  };
  const practiceStepOrder = getPracticeStepOrder(dailyPractice);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getStreakAction(),
      getProgressAction(settings.hskLevel),
      getUserStatsAction(),
      getWeakFlashcardsAction(5),
      getCharacterOfTheDayAction(settings.hskLevel),
      getDailyPracticeAction(settings.hskLevel),
    ]).then(([s, p, st, w, c, plan]) => {
      if (cancelled) return;
      setStreak(s);
      setProgress(p);
      setStats(st);
      setWeakCards(w);
      setCharOfDay(c);
      setDailyPractice(plan);
      setLoadedLevel(settings.hskLevel);
    });

    return () => {
      cancelled = true;
    };
  }, [settings.hskLevel]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your learning progress at a glance</p>
      </div>

      <div className="mb-6 rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[var(--cn-orange)]" />
          <h2 className="text-sm font-semibold text-foreground/80">Today&apos;s Practice</h2>
          <span className="ml-auto text-xs text-muted-foreground/70">
            {loading || !dailyPractice
              ? "Loading..."
              : `${dailyPractice.reviewsCompletedToday} reviews · ${dailyPractice.entriesCreatedToday} entries · ${dailyPractice.guidedResponsesToday} guided responses`}
          </span>
        </div>

        <div className="mb-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {loading || !dailyPractice
                  ? "Checking your daily loop..."
                  : dailyPractice.loopCompleted
                    ? "Daily loop completed"
                    : `${dailyPractice.completedSteps} of ${dailyPractice.totalSteps} steps completed`}
              </p>
              <p className="text-xs text-muted-foreground">
                {loading || !dailyPractice
                  ? "Loading today's progress..."
                  : dailyPractice.loopCompleted
                    ? `You reviewed, studied, and wrote today. ${dailyPractice.weeklyCompletedLoops} loop${dailyPractice.weeklyCompletedLoops === 1 ? "" : "s"} completed this week.`
                    : `${dailyPractice.weeklyCompletedLoops} of the last 7 days completed. Finish the remaining steps to complete today’s practice.`}
              </p>
              {!loading && dailyPractice && (
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    7-day pattern: review {dailyPractice.stepPattern.reviewCompletedDays}/7, study {dailyPractice.stepPattern.studyCompletedDays}/7, write {dailyPractice.stepPattern.writeCompletedDays}/7.
                  </p>
                  {dailyPractice.stepPatternInsight.weakestLabel && (
                    <p className="text-xs text-muted-foreground">
                      Strongest: {dailyPractice.stepPatternInsight.strongestLabel}. Gap: {dailyPractice.stepPatternInsight.weakestLabel}.
                    </p>
                  )}
                  {dailyPractice.stepPatternInsight.weakestMessage && (
                    <p className="text-xs text-amber-700">
                      {dailyPractice.stepPatternInsight.weakestMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
            {!loading && dailyPractice && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  dailyPractice.loopCompleted
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-background text-muted-foreground"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {dailyPractice.completedSteps}/{dailyPractice.totalSteps}
              </span>
            )}
          </div>
          {!loading && dailyPractice && (
            <div className="mt-3 flex items-center gap-2">
              {dailyPractice.recentLoopHistory.map((day) => (
                <div key={day.date} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                    {day.label}
                  </span>
                  <span
                    className={`h-3 w-8 rounded-full ${
                      day.completed
                        ? "bg-emerald-500"
                        : day.isToday
                          ? "bg-amber-200"
                          : "bg-muted-foreground/20"
                    }`}
                    title={`${day.label} ${day.date}: ${day.completed ? "completed" : "not completed"}`}
                  />
                </div>
              ))}
            </div>
          )}
          {!loading && dailyPractice && !dailyPractice.loopCompleted && dailyPractice.missingSteps.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                Still to do
              </p>
              <div className="mt-2 space-y-2">
                {dailyPractice.missingSteps.map((step) => (
                  <div key={step.key} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.hint}</p>
                    </div>
                    <Link
                      href={missingStepActionHref(step.key)}
                      className="shrink-0 text-xs font-medium text-[var(--cn-orange)] hover:underline"
                    >
                      {missingStepActionLabel(step.key)} →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {practiceStepOrder.map((stepKey, index) => (
            <PracticeCard
              key={stepKey}
              done={
                stepKey === "review"
                  ? !loading && !!dailyPractice?.reviewCompleted
                  : stepKey === "study"
                    ? !loading && !!dailyPractice?.studyCompleted
                    : !loading && !!dailyPractice?.writeCompleted
              }
              emphasized={
                !!dailyPractice &&
                !dailyPractice.loopCompleted &&
                index === 0 &&
                ((stepKey === "review" && !dailyPractice.reviewCompleted) ||
                  (stepKey === "study" && !dailyPractice.studyCompleted) ||
                  (stepKey === "write" && !dailyPractice.writeCompleted))
              }
              stepLabel={`${index + 1}. ${stepKey === "review" ? "Review" : stepKey === "study" ? "Study" : "Write"}`}
            >
              {stepKey === "review" ? (
                <>
                  {index === 0 && !loading && dailyPractice && !dailyPractice.reviewCompleted && (
                    <PriorityBadge />
                  )}
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {index + 1}. Review
                  </p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {loading || !dailyPractice ? "—" : dailyPractice.dueCount}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {loading || !dailyPractice
                      ? "Checking due cards..."
                      : dailyPractice.dueCount > 0
                        ? "due flashcards waiting for you"
                        : "no due cards right now"}
                  </p>
                  <Link href={dueFlashcardsHref} className="mt-3 block text-xs font-medium text-[var(--cn-orange)] hover:underline">
                    Open due reviews →
                  </Link>
                </>
              ) : stepKey === "study" ? (
                <>
                  {index === 0 && !loading && dailyPractice && !dailyPractice.studyCompleted && (
                    <PriorityBadge />
                  )}
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {index + 1}. Study
                  </p>
                  <div className="mt-2 flex items-start gap-2">
                    <BookText className="mt-0.5 h-4 w-4 text-blue-500" />
                    <p className="text-sm text-foreground/85">
                      {loading || !dailyPractice
                        ? "Preparing your study focus..."
                        : dailyPractice.studyFocus}
                    </p>
                  </div>
                  <Link
                    href={latestStudyHref}
                    className="mt-3 block text-xs font-medium text-[var(--cn-orange)] hover:underline"
                  >
                    {!loading && dailyPractice?.latestGuidedResponseToday?.sourceRef
                      ? "Open related study item →"
                      : "Open study guide →"}
                  </Link>
                </>
              ) : (
                <>
                  {index === 0 && !loading && dailyPractice && !dailyPractice.writeCompleted && (
                    <PriorityBadge />
                  )}
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {index + 1}. Write
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {loading || !dailyPractice ? "Preparing prompt..." : dailyPractice.writingPromptTitle}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {loading || !dailyPractice ? "..." : dailyPractice.writingPromptBody}
                  </p>
                  {!loading && dailyPractice && (
                    <p className="mt-2 text-xs text-emerald-700">
                      {dailyPractice.guidedResponsesToday > 0
                        ? `You already completed ${dailyPractice.guidedResponsesToday} guided response${dailyPractice.guidedResponsesToday === 1 ? "" : "s"} today.`
                        : "No guided study response yet today."}
                    </p>
                  )}
                  {!loading && dailyPractice?.latestGuidedResponseToday ? (
                    <Link
                      href={`/notebook?entry=${dailyPractice.latestGuidedResponseToday.id}`}
                      className="mt-3 block text-xs font-medium text-[var(--cn-orange)] hover:underline"
                    >
                      Open latest response →
                    </Link>
                  ) : (
                    <Link href={journalDraftHref} className="mt-3 block text-xs font-medium text-[var(--cn-orange)] hover:underline">
                      Start guided draft →
                    </Link>
                  )}
                </>
              )}
            </PracticeCard>
          ))}
        </div>
      </div>

      {/* Top stat cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {/* Streak */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-[var(--cn-orange)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Streak</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{loading ? "—" : streak}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {streak === 0 ? "Start your streak today" : streak === 1 ? "day in a row" : "days in a row"}
          </p>
        </div>

        {/* Journal entries */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <PenLine className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Entries</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{loading ? "—" : stats.entryCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">journal entries written</p>
        </div>

        {/* Reviews */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-green-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Reviews</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{loading ? "—" : stats.reviewCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">total reviews completed</p>
        </div>
      </div>

      {/* HSK Progress */}
      <div className="mb-6 rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--cn-orange)]" />
          <h2 className="text-sm font-semibold text-foreground/80">HSK {settings.hskLevel} Progress</h2>
          <span className="ml-auto text-sm font-bold text-[var(--cn-orange)]">
            {loading ? "—" : `${progress.percent}%`}
          </span>
        </div>
        <Progress
          value={progress.percent}
          className="mb-3 h-2.5 [&_[data-slot=progress-indicator]]:bg-[var(--cn-orange)]"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{loading ? "—" : `${progress.encountered} / ${progress.total} words encountered`}</span>
          <Link href="/notebook/lessons" className="text-xs text-[var(--cn-orange)] hover:underline">
            Open study guide →
          </Link>
        </div>
      </div>

      {/* Flashcard stats + weak cards */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Flashcards</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{loading ? "—" : stats.vocabCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">cards in your deck</p>
          <Link href={dueFlashcardsHref} className="mt-3 block text-xs text-[var(--cn-orange)] hover:underline">
            Review due cards →
          </Link>
        </div>

        {/* Character of the day */}
        <div className="rounded-xl border bg-card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Character of the day</p>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--cn-orange-light)]">
              <span className="text-4xl font-bold leading-none text-[var(--cn-orange)]">
                {charOfDay ? charOfDay.simplified[0] : "—"}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{charOfDay?.simplified ?? ""}</p>
              <p className="text-sm text-foreground/70">{charOfDay?.pinyin ?? ""}</p>
              <p className="text-sm text-muted-foreground">{charOfDay?.english ?? ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Needs attention */}
      {!loading && weakCards.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-foreground/80">Needs Attention</h2>
            <span className="ml-auto text-xs text-muted-foreground/70">Low ease factor — review these soon</span>
          </div>
          <div className="space-y-2">
            {weakCards.map((card) => (
              <div key={card.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3">
                <div>
                  <span className="text-lg font-bold text-foreground">{card.front}</span>
                  <span className="ml-3 text-sm text-muted-foreground">{card.back}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                  <span>{card.review_count} reviews</span>
                  <span className="font-medium text-red-500">ease {card.ease_factor.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
          <Link href={dueFlashcardsHref} className="mt-4 block text-center text-sm font-medium text-[var(--cn-orange)] hover:underline">
            Review due flashcards →
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

function getPracticeStepOrder(dailyPractice: DailyPracticePlan | null): PracticeStepKey[] {
  const defaultOrder: PracticeStepKey[] = ["review", "study", "write"];
  if (!dailyPractice) return defaultOrder;

  const doneMap: Record<PracticeStepKey, boolean> = {
    review: dailyPractice.reviewCompleted,
    study: dailyPractice.studyCompleted,
    write: dailyPractice.writeCompleted,
  };

  const weakest = dailyPractice.stepPattern.weakestStep;
  const prioritizedIncomplete = defaultOrder.filter((step) => !doneMap[step]);
  const completed = defaultOrder.filter((step) => doneMap[step]);

  if (weakest && prioritizedIncomplete.includes(weakest)) {
    return [
      weakest,
      ...prioritizedIncomplete.filter((step) => step !== weakest),
      ...completed,
    ];
  }

  return [...prioritizedIncomplete, ...completed];
}

function PracticeCard({
  children,
  done,
  emphasized,
  stepLabel,
}: {
  children: React.ReactNode;
  done: boolean;
  emphasized?: boolean;
  stepLabel: string;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        done
          ? "border-emerald-200 bg-emerald-50/70"
          : emphasized
            ? "border-[var(--cn-orange)]/40 bg-[var(--cn-orange-light)] shadow-sm"
            : "border-border bg-muted/40"
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="sr-only">{stepLabel}</span>
        {done ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Done
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <Circle className="h-3.5 w-3.5" />
            Pending
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function PriorityBadge() {
  return (
    <span className="mb-2 inline-flex items-center rounded-full bg-[var(--cn-orange)] px-2 py-0.5 text-[11px] font-medium text-white">
      Priority
    </span>
  );
}
