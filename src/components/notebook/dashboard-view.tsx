"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Layers, PenLine, RotateCcw, TrendingUp, AlertCircle, CheckCircle2, Circle, BookText, Loader2 } from "lucide-react";
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
import { buildInlineAnnotation } from "@/lib/parse-tokens";

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
    !loading && dailyPractice?.recommendedStudyWord?.id
      ? `/notebook/lessons?level=${settings.hskLevel}&wordId=${encodeURIComponent(String(dailyPractice.recommendedStudyWord.id))}`
      : `/notebook/lessons?level=${settings.hskLevel}`;
  const dueFlashcardsHref =
    !loading && dailyPractice?.recommendedStudyWord?.simplified
      ? `/notebook/flashcards?mode=due&focus=${encodeURIComponent(dailyPractice.recommendedStudyWord.simplified)}&wordId=${encodeURIComponent(String(dailyPractice.recommendedStudyWord.id))}&level=${settings.hskLevel}`
      : "/notebook/flashcards?mode=due";
  const journalDraftHref =
    !loading && dailyPractice
      ? `/notebook?new=1&draftTitleZh=${encodeURIComponent("今日练习")}&draftTitleEn=${encodeURIComponent("Daily practice")}&draftUnit=${encodeURIComponent(`HSK ${settings.hskLevel} Daily Practice`)}&draftLevel=${settings.hskLevel}&draftContentZh=${encodeURIComponent(
        dailyPractice.recommendedStudyWord?.simplified && dailyPractice.recommendedStudyWord?.pinyin && dailyPractice.recommendedStudyWord?.english
          ? buildInlineAnnotation(
              dailyPractice.recommendedStudyWord.simplified,
              dailyPractice.recommendedStudyWord.pinyin,
              dailyPractice.recommendedStudyWord.english
            )
          : dailyPractice.recommendedStudyWord?.simplified ?? ""
      )}&draftPrompt=${encodeURIComponent(dailyPractice.writingPromptBody)}&draftTargetWord=${encodeURIComponent(dailyPractice.recommendedStudyWord?.simplified ?? "")}&draftTargetPinyin=${encodeURIComponent(dailyPractice.recommendedStudyWord?.pinyin ?? "")}&draftTargetEnglish=${encodeURIComponent(dailyPractice.recommendedStudyWord?.english ?? "")}${dailyPractice.recommendedStudyWord?.id ? `&draftSourceType=study_guide&draftSourceRef=${encodeURIComponent(String(dailyPractice.recommendedStudyWord.id))}` : ""}`
      : "/notebook";
  const missingStepActionHref = (key: "review" | "study" | "write") => {
    if (key === "review") return dueFlashcardsHref;
    if (key === "study") return latestStudyHref;
    return journalDraftHref;
  };

  const missingStepActionLabel = (key: "review" | "study" | "write") => {
    if (key === "review") return "Open flashcards";
    if (key === "study") {
      return !loading && dailyPractice?.recommendedStudyWord?.id
        ? "Open related study item"
        : "Open study guide";
    }
    return "Open journal";
  };
  const focusWordPriorityStepKey =
    !loading && dailyPractice?.recommendedStudyWord && dailyPractice.focusWordProgress
      ? !dailyPractice.focusWordProgress.reviewedToday
        ? "review"
        : !dailyPractice.focusWordProgress.studiedToday
          ? "study"
          : !dailyPractice.focusWordProgress.wroteToday
            ? "write"
            : null
      : null;
  const priorityStepKey =
    focusWordPriorityStepKey ??
    dailyPractice?.missingSteps[0]?.key ??
    (dailyPractice?.stepPattern.weakestStep && dailyPractice && !dailyPractice.loopCompleted
      ? dailyPractice.stepPattern.weakestStep
      : null);
  const priorityActionHref = priorityStepKey ? missingStepActionHref(priorityStepKey) : null;
  const priorityActionLabel = priorityStepKey
    ? focusWordPriorityStepKey && dailyPractice?.recommendedStudyWord?.simplified
      ? priorityStepKey === "review"
        ? `Finish reviewing ${dailyPractice.recommendedStudyWord.simplified}`
        : priorityStepKey === "study"
          ? `Finish studying ${dailyPractice.recommendedStudyWord.simplified}`
          : `Finish writing with ${dailyPractice.recommendedStudyWord.simplified}`
      : priorityStepKey === "review"
        ? "Focus on review"
        : priorityStepKey === "study"
          ? `Focus on ${dailyPractice?.recommendedStudyWord?.simplified ?? "study"}`
          : dailyPractice?.recommendedStudyWord?.simplified
            ? `Write with ${dailyPractice.recommendedStudyWord.simplified}`
            : "Focus on writing"
    : null;
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
              ? "Loading practice..."
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
              {loading && (
                <div className="mt-3 flex items-start gap-3">
                  <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-[var(--cn-orange)]" />
                  <div className="space-y-2">
                    <LoadingLine className="h-6 w-40 rounded-full" />
                    <LoadingLine className="h-3 w-56" />
                  </div>
                </div>
              )}
              {!loading && dailyPractice && (
                <div className="mt-1 space-y-1">
                  {dailyPractice.recommendedStudyWord && (
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-background px-2.5 py-1 text-xs text-foreground shadow-sm">
                        <span className="font-semibold text-[var(--cn-orange)]">
                          {dailyPractice.recommendedStudyWord.simplified}
                        </span>
                        <span className="text-muted-foreground">
                          {dailyPractice.recommendedStudyWord.pinyin}
                        </span>
                        {dailyPractice.recommendedStudyWord.english && (
                          <span className="text-muted-foreground/80">
                            {dailyPractice.recommendedStudyWord.english}
                          </span>
                        )}
                      </div>
                      {dailyPractice.focusWordProgress && (
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="font-medium text-foreground/80">
                            Today with {dailyPractice.recommendedStudyWord.simplified}:
                          </span>
                          <FocusWordStepBadge done={dailyPractice.focusWordProgress.reviewedToday} label="Review" />
                          <FocusWordStepBadge done={dailyPractice.focusWordProgress.studiedToday} label="Study" />
                          <FocusWordStepBadge done={dailyPractice.focusWordProgress.wroteToday} label="Write" />
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    7-day pattern: review {dailyPractice.stepPattern.reviewCompletedDays}/7, study {dailyPractice.stepPattern.studyCompletedDays}/7, write {dailyPractice.stepPattern.writeCompletedDays}/7.
                  </p>
                  {dailyPractice.stepPatternInsight.weakestLabel && (
                    <p className="text-xs text-muted-foreground">
                      Strongest: {dailyPractice.stepPatternInsight.strongestLabel}. Gap: {dailyPractice.stepPatternInsight.weakestLabel}.
                    </p>
                  )}
                  {dailyPractice.stepPatternInsight.weakestMessage && (
                    <p className="text-xs text-amber-400">
                      {dailyPractice.stepPatternInsight.weakestMessage}
                    </p>
                  )}
                  {!dailyPractice.loopCompleted && priorityActionHref && priorityActionLabel && (
                    <Link
                      href={priorityActionHref}
                      className="mt-2 inline-flex items-center rounded-full border border-[var(--cn-orange)]/30 bg-[var(--cn-orange)]/12 px-3 py-1 text-xs font-medium text-[var(--cn-orange)] transition-colors hover:bg-[var(--cn-orange)]/18 lg:hidden"
                    >
                      {priorityActionLabel} now →
                    </Link>
                  )}
                  {!dailyPractice.loopCompleted && priorityActionHref && priorityActionLabel && (
                    <Link
                      href={priorityActionHref}
                      className="hidden items-center rounded-full bg-[var(--cn-orange)] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[var(--cn-orange-dark)] lg:inline-flex"
                    >
                      {priorityActionLabel} →
                    </Link>
                  )}
                </div>
              )}
            </div>
            {!loading && dailyPractice && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  dailyPractice.loopCompleted
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
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
                        ? "bg-emerald-500/80"
                        : day.isToday
                          ? "bg-amber-500/40"
                          : "bg-muted-foreground/20"
                    }`}
                    title={`${day.label} ${day.date}: ${day.completed ? "completed" : "not completed"}`}
                  />
                </div>
              ))}
            </div>
          )}
          {!loading && dailyPractice && !dailyPractice.loopCompleted && dailyPractice.missingSteps.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
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
              focusDone={
                !loading && dailyPractice?.recommendedStudyWord
                  ? stepKey === "review"
                    ? dailyPractice.focusWordProgress?.reviewedToday ?? false
                    : stepKey === "study"
                      ? dailyPractice.focusWordProgress?.studiedToday ?? false
                      : dailyPractice.focusWordProgress?.wroteToday ?? false
                  : null
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
                    {loading || !dailyPractice ? <LoadingStatWithIcon className="h-8 w-10" /> : dailyPractice.dueCount}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {loading || !dailyPractice
                      ? "Checking due cards..."
                      : dailyPractice.focusWordProgress?.reviewedToday && dailyPractice.recommendedStudyWord
                        ? `You already reviewed ${dailyPractice.recommendedStudyWord.simplified} today.`
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
                    {loading || !dailyPractice ? (
                      <>
                        <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-sky-400" />
                        <div className="space-y-2 pt-0.5">
                          <LoadingLine className="h-3 w-40" />
                          <LoadingLine className="h-3 w-28" />
                        </div>
                      </>
                    ) : (
                      <>
                        <BookText className="mt-0.5 h-4 w-4 text-sky-400" />
                        <p className="text-sm text-foreground">
                          {dailyPractice.focusWordProgress?.studiedToday && dailyPractice.recommendedStudyWord
                            ? `You already studied ${dailyPractice.recommendedStudyWord.simplified} in context today.`
                            : dailyPractice.studyFocus}
                        </p>
                      </>
                    )}
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
                    {loading || !dailyPractice ? <LoadingLineWithIcon className="h-4 w-32" /> : dailyPractice.writingPromptTitle}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {loading || !dailyPractice ? <LoadingParagraph lines={2} withIcon /> : dailyPractice.writingPromptBody}
                  </p>
                  {!loading && dailyPractice && (
                    <p className="mt-2 text-xs text-emerald-400">
                      {dailyPractice.focusWordProgress?.wroteToday && dailyPractice.recommendedStudyWord
                        ? `You already wrote with ${dailyPractice.recommendedStudyWord.simplified} today.`
                        : dailyPractice.guidedResponsesToday > 0
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
          <p className="text-4xl font-bold text-foreground">{loading ? <LoadingStatWithIcon className="h-10 w-12" /> : streak}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {streak === 0 ? "Start your streak today" : streak === 1 ? "day in a row" : "days in a row"}
          </p>
        </div>

        {/* Journal entries */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <PenLine className="h-4 w-4 text-sky-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Entries</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{loading ? <LoadingStatWithIcon className="h-10 w-12" /> : stats.entryCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">journal entries written</p>
        </div>

        {/* Reviews */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Reviews</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{loading ? <LoadingStatWithIcon className="h-10 w-12" /> : stats.reviewCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">total reviews completed</p>
        </div>
      </div>

      {/* HSK Progress */}
      <div className="mb-6 rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--cn-orange)]" />
          <h2 className="text-sm font-semibold text-foreground/80">HSK {settings.hskLevel} Progress</h2>
          <span className="ml-auto text-sm font-bold text-[var(--cn-orange)]">
            {loading ? <LoadingStatWithIcon className="h-5 w-12" compact /> : `${progress.percent}%`}
          </span>
        </div>
        <Progress
          value={progress.percent}
          className="mb-3 h-2.5 [&_[data-slot=progress-indicator]]:bg-[var(--cn-orange)]"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{loading ? <LoadingLineWithIcon className="h-4 w-40" compact /> : `${progress.encountered} / ${progress.total} words encountered`}</span>
          <Link href="/notebook/lessons" className="text-xs text-[var(--cn-orange)] hover:underline">
            Open study guide →
          </Link>
        </div>
      </div>

      {/* Flashcard stats + weak cards */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-sky-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Flashcards</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{loading ? <LoadingStatWithIcon className="h-10 w-14" /> : stats.vocabCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">cards in your deck</p>
          <Link href={dueFlashcardsHref} className="mt-3 block text-xs text-[var(--cn-orange)] hover:underline">
            Review due cards →
          </Link>
        </div>

        {/* Character of the day */}
        <div className="rounded-xl border bg-card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Character of the day</p>
          <div className="flex items-center gap-4">
            {loading ? (
              <>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--cn-orange)]/12">
                  <Loader2 className="h-7 w-7 animate-spin text-[var(--cn-orange)]" />
                </div>
                <div className="space-y-2">
                  <LoadingLine className="h-4 w-16" />
                  <LoadingLine className="h-3 w-20" />
                  <LoadingLine className="h-3 w-28" />
                </div>
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--cn-orange)]/12">
                  <span className="text-4xl font-bold leading-none text-[var(--cn-orange)]">
                    {charOfDay ? charOfDay.simplified[0] : "—"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{charOfDay?.simplified ?? ""}</p>
                  <p className="text-sm text-foreground/70">{charOfDay?.pinyin ?? ""}</p>
                  <p className="text-sm text-muted-foreground">{charOfDay?.english ?? ""}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Needs attention */}
      {!loading && weakCards.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400" />
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
                  <span className="font-medium text-rose-400">ease {card.ease_factor.toFixed(1)}</span>
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
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
          <p className="text-sm font-medium text-emerald-400">All caught up — no struggling cards right now.</p>
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
  focusDone,
  stepLabel,
}: {
  children: React.ReactNode;
  done: boolean;
  emphasized?: boolean;
  focusDone?: boolean | null;
  stepLabel: string;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        done
          ? "border-emerald-500/20 bg-emerald-500/10"
          : emphasized
            ? "border-[var(--cn-orange)]/40 bg-[var(--cn-orange)]/12 shadow-sm"
            : "border-border bg-muted/40"
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="sr-only">{stepLabel}</span>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          {done ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Circle className="h-3.5 w-3.5" />
              Pending
            </span>
          )}
          {focusDone !== null && focusDone !== undefined && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                focusDone
                  ? "border border-[var(--cn-orange)]/30 bg-[var(--cn-orange)]/12 text-[var(--cn-orange)]"
                  : "bg-background/80 text-muted-foreground"
              }`}
            >
              {focusDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
              Focus word
            </span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function LoadingValue({ className = "h-8 w-10" }: { className?: string }) {
  return <span className={`inline-block animate-pulse rounded-md bg-muted/70 align-middle ${className}`} />;
}

function LoadingLine({ className = "h-3 w-24" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-full bg-muted/60 ${className}`} />;
}

function LoadingParagraph({ lines = 2, withIcon = false }: { lines?: number; withIcon?: boolean }) {
  if (withIcon) {
    return (
      <span className="flex items-start gap-2 pt-0.5">
        <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-[var(--cn-orange)]" />
        <span className="block flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <LoadingLine
              key={index}
              className={`h-3 ${index === lines - 1 ? "w-24" : "w-full max-w-[14rem]"}`}
            />
          ))}
        </span>
      </span>
    );
  }
  return (
    <span className="block space-y-2 pt-0.5">
      {Array.from({ length: lines }).map((_, index) => (
        <LoadingLine
          key={index}
          className={`h-3 ${index === lines - 1 ? "w-24" : "w-full max-w-[14rem]"}`}
        />
      ))}
    </span>
  );
}

function LoadingLineWithIcon({
  className = "h-3 w-24",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <Loader2 className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} animate-spin text-[var(--cn-orange)]`} />
      <LoadingLine className={className} />
    </span>
  );
}

function LoadingStatWithIcon({
  className = "h-8 w-10",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <Loader2 className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} animate-spin text-[var(--cn-orange)]`} />
      <LoadingValue className={className} />
    </span>
  );
}

function PriorityBadge() {
  return (
    <span className="mb-2 inline-flex items-center rounded-full bg-[var(--cn-orange)] px-2 py-0.5 text-[11px] font-medium text-white">
      Priority
    </span>
  );
}

function FocusWordStepBadge({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
        done
          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "bg-background text-muted-foreground"
      }`}
    >
      {done ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
      {label}
    </span>
  );
}
