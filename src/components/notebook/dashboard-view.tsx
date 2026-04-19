"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target, Flame, PenLine, RotateCcw, AlertCircle,
  Play, ArrowRight, Check, TrendingUp, Calendar,
} from "lucide-react";
import { DashboardPanel } from "@/components/patterns/dashboard";
import { useSettings } from "./settings-context";
import {
  getDailyPracticeAction,
  getStreakAction,
  getProgressAction,
  getUserStatsAction,
  getWeakFlashcardsAction,
  getCharacterOfTheDayAction,
  getLevelReadinessAction,
} from "@/lib/actions";
import type { Flashcard, HskWord, LevelReadiness } from "@/lib/data";
import type { DailyPracticePlan } from "@/lib/daily-practice";
import { buildInlineAnnotation } from "@/lib/parse-tokens";

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

interface BeginnerCompletionState {
  word: string;
  wroteSentence: boolean;
}

interface LoopStepData {
  id: "review" | "study" | "write";
  verb: string;
  done: boolean;
  current: boolean;
  title: string;
  desc: string;
  action: string;
  href: string;
}

export function DashboardView() {
  const { settings } = useSettings();

  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState<ProgressData>({ encountered: 0, total: 0, percent: 0 });
  const [stats, setStats] = useState<Stats>({ entryCount: 0, vocabCount: 0, reviewCount: 0, avgMastery: 0 });
  const [weakCards, setWeakCards] = useState<Flashcard[]>([]);
  const [charOfDay, setCharOfDay] = useState<HskWord | null>(null);
  const [dailyPractice, setDailyPractice] = useState<DailyPracticePlan | null>(null);
  const [readiness, setReadiness] = useState<LevelReadiness | null>(null);
  const [loadedLevel, setLoadedLevel] = useState<number | null>(null);

  const loading = loadedLevel !== settings.hskLevel;
  const dashboardMode = !loading && dailyPractice ? getDashboardMode(dailyPractice, stats) : null;
  const isBeginnerFirstRun = !loading && dashboardMode?.badge === "New learner";
  const beginnerCompletion = !loading && dailyPractice ? getBeginnerCompletionState(dailyPractice, stats) : null;
  const isBeginnerFirstCompletion = !!beginnerCompletion;
  const beginnerStudyHref = "/notebook/lessons?level=1&beginner=1";

  const focusWord = !loading ? dailyPractice?.recommendedStudyWord ?? null : null;

  const latestStudyHref =
    !loading && isBeginnerFirstRun
      ? beginnerStudyHref
      : !loading && dailyPractice?.recommendedStudyWord?.id
        ? `/notebook/lessons?level=${settings.hskLevel}&wordId=${encodeURIComponent(String(dailyPractice.recommendedStudyWord.id))}`
        : `/notebook/lessons?level=${settings.hskLevel}`;

  const dueFlashcardsHref =
    !loading && dailyPractice?.recommendedStudyWord?.simplified
      ? `/notebook/flashcards?mode=due&focus=${encodeURIComponent(dailyPractice.recommendedStudyWord.simplified)}&wordId=${encodeURIComponent(String(dailyPractice.recommendedStudyWord.id))}&level=${settings.hskLevel}${isBeginnerFirstRun ? "&beginner=1" : ""}`
      : `/notebook/flashcards?mode=due${isBeginnerFirstRun ? "&beginner=1" : ""}`;

  const journalDraftHref =
    !loading && dailyPractice
      ? `/notebook?new=1&draftTitleZh=${encodeURIComponent("今日练习")}&draftTitleEn=${encodeURIComponent("Daily practice")}&draftUnit=${encodeURIComponent(`HSK ${settings.hskLevel} Daily Practice`)}&draftLevel=${settings.hskLevel}&draftContentZh=${encodeURIComponent(
          dailyPractice.recommendedStudyWord?.simplified && dailyPractice.recommendedStudyWord?.pinyin && dailyPractice.recommendedStudyWord?.english
            ? buildInlineAnnotation(dailyPractice.recommendedStudyWord.simplified, dailyPractice.recommendedStudyWord.pinyin, dailyPractice.recommendedStudyWord.english)
            : dailyPractice.recommendedStudyWord?.simplified ?? ""
        )}&draftPrompt=${encodeURIComponent(dailyPractice.writingPromptBody)}&draftTargetWord=${encodeURIComponent(dailyPractice.recommendedStudyWord?.simplified ?? "")}&draftTargetPinyin=${encodeURIComponent(dailyPractice.recommendedStudyWord?.pinyin ?? "")}&draftTargetEnglish=${encodeURIComponent(dailyPractice.recommendedStudyWord?.english ?? "")}${dailyPractice.recommendedStudyWord?.id ? `&draftSourceType=study_guide&draftSourceRef=${encodeURIComponent(String(dailyPractice.recommendedStudyWord.id))}` : ""}`
      : "/notebook";

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getStreakAction(),
      getProgressAction(settings.hskLevel),
      getUserStatsAction(),
      getWeakFlashcardsAction(5),
      getCharacterOfTheDayAction(settings.hskLevel),
      getDailyPracticeAction(settings.hskLevel),
      getLevelReadinessAction(settings.hskLevel),
    ]).then(([s, p, st, w, c, plan, r]) => {
      if (cancelled) return;
      setStreak(s);
      setProgress(p);
      setStats(st);
      setWeakCards(w);
      setCharOfDay(c);
      setDailyPractice(plan);
      setReadiness(r);
      setLoadedLevel(settings.hskLevel);
    });
    return () => { cancelled = true; };
  }, [settings.hskLevel]);

  // Build loop steps from live data
  const stepItems: LoopStepData[] = loading || !dailyPractice
    ? [
        { id: "review", verb: "Review", done: false, current: true, title: "Checking due cards…", desc: "", action: "Start review", href: dueFlashcardsHref },
        { id: "study", verb: "Study", done: false, current: false, title: "Loading study item…", desc: "", action: "Open study", href: latestStudyHref },
        { id: "write", verb: "Write", done: false, current: false, title: "Loading writing prompt…", desc: "", action: "Start draft", href: journalDraftHref },
      ]
    : [
        {
          id: "review",
          verb: "Review",
          done: dailyPractice.reviewCompleted,
          current: false,
          title: dailyPractice.dueCount > 0
            ? `${dailyPractice.dueCount} due flashcard${dailyPractice.dueCount === 1 ? "" : "s"}`
            : "All cards reviewed",
          desc: focusWord
            ? `Clear due cards first — this keeps ${focusWord.simplified} and older words active.`
            : "Clear due cards to keep your vocabulary active.",
          action: "Start review",
          href: dueFlashcardsHref,
        },
        {
          id: "study",
          verb: "Study",
          done: dailyPractice.studyCompleted,
          current: false,
          title: focusWord
            ? `How ${focusWord.simplified} appears in context`
            : dailyPractice.studyFocus,
          desc: "Read one example passage and see the word used naturally.",
          action: "Open study",
          href: latestStudyHref,
        },
        {
          id: "write",
          verb: "Write",
          done: dailyPractice.writeCompleted,
          current: false,
          title: dailyPractice.writingPromptTitle,
          desc: dailyPractice.writingPromptBody,
          action: "Start draft",
          href: journalDraftHref,
        },
      ];

  // First incomplete step is "current"
  const firstIncompleteIdx = stepItems.findIndex((s) => !s.done);
  if (firstIncompleteIdx >= 0) stepItems[firstIncompleteIdx].current = true;

  const allDone = !loading && (dailyPractice?.loopCompleted ?? false);
  const priorityHref = firstIncompleteIdx >= 0 ? stepItems[firstIncompleteIdx].href : dueFlashcardsHref;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const dateSubline = loading
    ? "Loading today's practice…"
    : allDone
      ? `Daily loop complete · ${dailyPractice?.weeklyCompletedLoops ?? 0} loop${(dailyPractice?.weeklyCompletedLoops ?? 0) === 1 ? "" : "s"} this week`
      : `HSK ${settings.hskLevel} · ${stepItems.filter((s) => s.done).length} of 3 steps done`;

  return (
    <div className="mx-auto max-w-[1080px]">

      {/* ─── Beginner first-run welcome ─── */}
      {!loading && isBeginnerFirstRun && (
        <DashboardPanel tone="sky" className="mb-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl">
              <p className="ui-tone-sky-text text-xs font-semibold uppercase tracking-wider">Welcome</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">Start learning Chinese one small step at a time.</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                HanziBit works best when you do one tiny loop: study one word, try one ready-made sentence, and finish with a tiny review.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <Link href={beginnerStudyHref} className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Start with one word →
              </Link>
              <Link href={beginnerStudyHref} className="ui-tone-sky-panel ui-tone-sky-text inline-flex items-center justify-center rounded-full border bg-background/80 px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--ui-tone-sky-surface)]/80">
                Open Study Guide
              </Link>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <BeginnerStepCard step="1" title="Study one word" body="Open one HSK 1 word, read the pinyin, and see one tiny example." />
            <BeginnerStepCard step="2" title="Optionally try one sentence" body="Use a ready-made sentence if you want. You can also skip writing for now." />
            <BeginnerStepCard step="3" title="Review a few cards" body="Finish with a tiny review so the app remembers what you just studied." />
          </div>
        </DashboardPanel>
      )}

      {!loading && isBeginnerFirstRun && (
        <DashboardPanel className="mb-6 p-4">
          <p className="text-sm text-muted-foreground">
            After you finish your first loop, your progress, reviews, and study history will start to appear here.
          </p>
        </DashboardPanel>
      )}

      {!loading && isBeginnerFirstCompletion && beginnerCompletion && (
        <DashboardPanel tone="emerald" className="mb-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="ui-tone-emerald-text text-xs font-semibold uppercase tracking-wider">Day one complete</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">You finished your first Chinese practice loop.</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                You studied <span className="font-medium text-foreground">{beginnerCompletion.word}</span>
                {beginnerCompletion.wroteSentence ? ", tried one sentence," : ""} and completed your first review. That is enough for today.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <Link href={beginnerStudyHref} className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Study one more word →
              </Link>
              <p className="text-center text-xs text-muted-foreground">Or stop here and come back tomorrow.</p>
            </div>
          </div>
        </DashboardPanel>
      )}

      {/* ─── Main dashboard (hidden for true first-run) ─── */}
      {!isBeginnerFirstRun && (
        <>
          {/* Date header */}
          <div className="mb-8">
            <h1 className="text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">{today}</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">{dateSubline}</p>
          </div>

          {/* ─── Hero: Focus word + Loop ─── */}
          <section className="relative mb-5 overflow-hidden rounded-[18px] bg-gradient-to-b from-white to-[#fffdfb] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_rgba(232,96,28,0.04)]">
            {/* Oversized background hanzi */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-1/2 -right-5 -translate-y-1/2 select-none font-bold leading-none text-[var(--cn-orange)]"
              style={{ fontSize: 200, opacity: 0.05 }}
            >
              {loading ? "今" : (focusWord?.simplified?.[0] ?? charOfDay?.simplified?.[0] ?? "好")}
            </div>

            <div
              className="relative z-[1] grid items-center gap-6 p-6"
              style={{ gridTemplateColumns: "minmax(240px, 0.8fr) 1fr" }}
            >
              {/* Left: Focus word */}
              <div>
                <div className="mb-3.5 flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-[var(--cn-orange)]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/60">
                    Today&apos;s Focus Word
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <Skel className="h-[72px] w-24 rounded-xl" />
                    <Skel className="h-5 w-40 rounded-full" />
                  </div>
                ) : (
                  <>
                    <div className="text-[72px] font-bold leading-none tracking-[-0.02em] text-foreground">
                      {focusWord?.simplified ?? charOfDay?.simplified ?? "—"}
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-baseline gap-3.5">
                      <span className="font-mono text-xl font-semibold text-[var(--cn-orange)]">
                        {focusWord?.pinyin ?? charOfDay?.pinyin ?? ""}
                      </span>
                      <span className="text-lg font-medium text-foreground">
                        {focusWord?.english ?? charOfDay?.english ?? ""}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                        HSK {settings.hskLevel}
                      </span>
                    </div>
                    <p className="mt-3.5 max-w-[280px] text-[13px] leading-[1.55] text-muted-foreground">
                      Cycle{" "}
                      <strong className="font-semibold text-foreground">
                        {focusWord?.simplified ?? charOfDay?.simplified ?? "this word"}
                      </strong>{" "}
                      through all three steps today — review it, see it in context, then use it in your own writing.
                    </p>
                    {!allDone && (
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        <Link
                          href={priorityHref}
                          className="inline-flex h-[42px] items-center gap-1.5 rounded-xl bg-primary px-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                          <Play className="h-3.5 w-3.5" />
                          Start today&apos;s practice
                        </Link>
                      </div>
                    )}
                    {allDone && (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-xl border bg-[var(--ui-tone-emerald-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ui-tone-emerald-text)]">
                        <Check className="h-4 w-4" />
                        Loop complete today
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right: Daily loop */}
              <div>
                <div className="mb-3.5 flex items-baseline justify-between">
                  <span className="text-[15px] font-semibold text-foreground">Daily Practice Loop</span>
                  <span className="text-[12px] font-medium text-muted-foreground">
                    {loading ? (
                      <Skel className="inline-block h-3.5 w-20 rounded-full" />
                    ) : (
                      <>
                        <b className="font-bold text-foreground">{stepItems.filter((s) => s.done).length} of 3</b> steps
                      </>
                    )}
                  </span>
                </div>
                <div className="grid gap-2.5">
                  {stepItems.map((step, i) => (
                    <LoopStep key={step.id} step={step} index={i} loading={loading} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ─── Stat cards ─── */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            <StatCard
              icon={<Flame className="h-3 w-3" />}
              label="Streak"
              tone="orange"
              loading={loading}
              value={loading ? null : streak}
              unit={streak === 1 ? "day" : "days"}
              sub={streak === 0 ? "Finish today's loop to start your streak." : `${streak} day${streak === 1 ? "" : "s"} in a row.`}
              spark={dailyPractice?.recentLoopHistory.map((d) => (d.completed ? 1 : 0)) ?? [0,0,0,0,0,0,0]}
            />
            <StatCard
              icon={<PenLine className="h-3 w-3" />}
              label="Journal entries"
              tone="sky"
              loading={loading}
              value={loading ? null : stats.entryCount}
              unit="total"
              sub={stats.entryCount === 0 ? "Write your first entry today." : `${stats.entryCount} entr${stats.entryCount === 1 ? "y" : "ies"} written.`}
              spark={null}
            />
            <StatCard
              icon={<RotateCcw className="h-3 w-3" />}
              label="Reviews"
              tone="emerald"
              loading={loading}
              value={loading ? null : stats.reviewCount}
              unit="total"
              sub={stats.reviewCount === 0 ? "Complete your first review today." : `${stats.reviewCount} reviews completed.`}
              spark={null}
            />
          </div>

          {/* ─── HSK Progress + Needs Attention ─── */}
          <div className="mb-4 grid gap-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
            {/* HSK Progress card */}
            <div className="rounded-[14px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
              <div className="mb-3.5 flex items-end justify-between">
                <div>
                  <div className="mb-2.5 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-[var(--cn-orange)]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/60">
                      HSK {settings.hskLevel} Progress
                    </span>
                  </div>
                  <p className="text-[15px] font-semibold text-foreground">
                    {loading ? (
                      <Skel className="inline-block h-5 w-48 rounded-full" />
                    ) : (
                      <>
                        You&apos;ve met <b>{progress.encountered}</b> of {progress.total} HSK {settings.hskLevel} words.
                      </>
                    )}
                  </p>
                </div>
                <div className="text-[22px] font-bold leading-none tracking-[-0.02em] text-[var(--cn-orange)]">
                  {loading ? <Skel className="inline-block h-6 w-12 rounded-full" /> : `${progress.percent}%`}
                </div>
              </div>

              {/* Segmented bar */}
              <div className="flex h-3 gap-px overflow-hidden rounded-full bg-muted">
                {Array.from({ length: 30 }).map((_, i) => {
                  const filled = Math.round((progress.encountered / Math.max(1, progress.total)) * 30);
                  return (
                    <div
                      key={i}
                      className={`flex-1 transition-colors duration-200 ${i < filled ? "bg-[var(--cn-orange)]" : "bg-muted"}`}
                    />
                  );
                })}
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[12px] text-muted-foreground">
                <span>
                  <b className="font-semibold text-foreground">{progress.encountered}</b> encountered ·{" "}
                  <b className="font-semibold text-foreground">{stats.vocabCount}</b> in flashcards ·{" "}
                  <b className="font-semibold text-foreground">{readiness?.reviewedTwice.count ?? 0}</b> retained
                </span>
                <Link href={latestStudyHref} className="inline-flex items-center gap-1 text-[var(--cn-orange)] font-medium hover:underline underline-offset-[3px]">
                  Open study guide <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Readiness rows */}
              {(!loading && readiness && readiness.score > 0) && (
                <>
                  <div className="my-4 h-px bg-border" />
                  <div className="grid gap-2.5">
                    <ReadinessRow label="Words encountered" pct={(readiness.encountered.count / Math.max(1, readiness.encountered.total)) * 100} count={readiness.encountered.count} total={readiness.encountered.total} tone="orange" />
                    <ReadinessRow label="Flashcard coverage" pct={(readiness.withFlashcard.count / Math.max(1, readiness.withFlashcard.total)) * 100} count={readiness.withFlashcard.count} total={readiness.withFlashcard.total} tone="sky" />
                    <ReadinessRow label="Retained (2× reviewed)" pct={(readiness.reviewedTwice.count / Math.max(1, readiness.reviewedTwice.total)) * 100} count={readiness.reviewedTwice.count} total={readiness.reviewedTwice.total} tone="emerald" />
                  </div>
                  {readiness.isReady && (
                    <p className="mt-3 text-[13px] font-medium text-[var(--ui-tone-emerald-text)]">
                      You&apos;re ready for the HSK {readiness.level} exam!{" "}
                      {readiness.level < 6 && (
                        <Link href="/notebook/settings" className="underline underline-offset-2">Move to HSK {readiness.level + 1} →</Link>
                      )}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Needs attention */}
            <div className="rounded-[14px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-[var(--cn-orange)]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/60">
                    Needs attention
                  </span>
                </div>
                <Link href={dueFlashcardsHref} className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--cn-orange)] hover:underline underline-offset-[3px]">
                  All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3 pt-1">
                  {[1, 2, 3].map((i) => <Skel key={i} className="h-12 w-full rounded-xl" />)}
                </div>
              ) : weakCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-2 text-2xl">✓</div>
                  <p className="text-[13px] font-medium text-foreground">All caught up!</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">No struggling cards right now.</p>
                </div>
              ) : (
                <div>
                  {weakCards.map((card, i) => (
                    <div
                      key={card.id}
                      className={`flex items-center gap-3 py-2.5 ${i < weakCards.length - 1 ? "border-b border-border" : ""}`}
                    >
                      <div className="text-[22px] font-bold leading-none text-foreground min-w-[34px]">
                        {card.front}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[11px] font-semibold text-[var(--cn-orange)]">{card.back?.split(" ")[0]}</p>
                        <p className="truncate text-[13px] font-medium text-foreground">{card.back}</p>
                        <p className="text-[11px] text-muted-foreground">ease {card.ease_factor.toFixed(1)} · {card.review_count} reviews</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                        Struggling
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Week strip ─── */}
          <div className="rounded-[14px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-[var(--cn-orange)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/60">This week</span>
              </div>
              <span className="text-[12px] text-muted-foreground">
                {loading ? "" : `${dailyPractice?.weeklyCompletedLoops ?? 0} / 7 days completed`}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {(loading
                ? Array.from({ length: 7 }, (_, i) => ({ date: "", label: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i], completed: false, isToday: false }))
                : dailyPractice?.recentLoopHistory ?? []
              ).map((day, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-1.5 rounded-[10px] border px-1.5 py-2.5 ${
                    day.isToday
                      ? "border-[rgba(232,96,28,0.45)] bg-[var(--cn-orange-light,#fef3ed)]"
                      : "border-border bg-white"
                  }`}
                >
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${day.isToday ? "text-[var(--cn-orange-dark,#c44d14)]" : "text-muted-foreground"}`}>
                    {day.label}
                  </span>
                  <span className={`text-[13px] font-semibold ${day.isToday ? "text-[var(--cn-orange-dark,#c44d14)]" : "text-foreground"}`}>
                    {day.date ? new Date(day.date + "T00:00:00").getDate() : "·"}
                  </span>
                  <div className="flex gap-1">
                    {loading ? (
                      <div className="h-2 w-2 rounded-full bg-muted" />
                    ) : (
                      <div
                        className={`h-2 w-2 rounded-full ${
                          day.isToday && !day.completed
                            ? "border border-[rgba(232,96,28,0.4)] bg-transparent"
                            : day.completed
                              ? "bg-[var(--ui-tone-emerald-text,oklch(0.58_0.13_165))]"
                              : "border border-border bg-muted"
                        }`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-4 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--ui-tone-emerald-text,oklch(0.58_0.13_165))]" />
                Loop completed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full border border-border bg-muted" />
                Not done
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Loop step card ───────────────────────────────────────────────────────────
function LoopStep({ step, loading }: { step: LoopStepData; index: number; loading: boolean }) {
  return (
    <Link
      href={step.href}
      className={`grid items-center gap-3.5 rounded-xl border p-3 transition-all hover:opacity-90 ${
        step.done
          ? "border-[var(--ui-tone-emerald-border)] bg-[var(--ui-tone-emerald-surface)]"
          : step.current
            ? "border-[rgba(232,96,28,0.35)] bg-[#fef3ed] shadow-[0_1px_3px_rgba(232,96,28,0.08)]"
            : "border-border bg-white"
      }`}
      style={{ gridTemplateColumns: "32px 1fr auto" }}
    >
      {/* Step number / check */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-bold ${
          step.done
            ? "border-transparent bg-[var(--ui-tone-emerald-text,oklch(0.58_0.13_165))] text-white"
            : step.current
              ? "border-transparent bg-[var(--cn-orange)] text-white"
              : "border-border bg-muted text-muted-foreground"
        }`}
      >
        {step.done ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : { review: 1, study: 2, write: 3 }[step.id]}
      </div>

      {/* Body */}
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
              step.done
                ? "text-[var(--ui-tone-emerald-text)]"
                : step.current
                  ? "text-[var(--cn-orange-dark,#c44d14)]"
                  : "text-muted-foreground"
            }`}
          >
            {step.verb}
          </span>
          <span className="truncate text-[14px] font-semibold text-foreground">
            {loading ? <Skel className="inline-block h-3.5 w-32 rounded-full" /> : step.title}
          </span>
        </div>
        {!loading && step.desc && (
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{step.desc}</p>
        )}
      </div>

      {/* CTA */}
      {!step.done && (
        <span
          className={`flex shrink-0 items-center gap-1 text-[12px] font-medium ${
            step.current ? "text-[var(--cn-orange)]" : "text-muted-foreground"
          }`}
        >
          {step.action}
          <ArrowRight className="h-3 w-3" />
        </span>
      )}
    </Link>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  tone,
  loading,
  value,
  unit,
  sub,
  spark,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "orange" | "sky" | "emerald";
  loading: boolean;
  value: number | null;
  unit: string;
  sub: string;
  spark: number[] | null;
}) {
  const iconColor =
    tone === "orange" ? "text-[var(--cn-orange)]" : tone === "sky" ? "text-[var(--ui-tone-sky-text)]" : "text-[var(--ui-tone-emerald-text)]";
  const sparkColor =
    tone === "orange" ? "bg-[var(--cn-orange)]" : tone === "sky" ? "bg-[var(--t-sky-t,oklch(0.6_0.14_240))]" : "bg-[var(--t-emerald-t,oklch(0.58_0.13_165))]";

  return (
    <div className="flex flex-col gap-2 rounded-[14px] bg-white p-[18px_20px] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
      <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground ${iconColor} [&>svg]:h-[13px] [&>svg]:w-[13px]`}>
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5 text-[32px] font-bold leading-none tracking-[-0.02em]">
        {loading ? <Skel className="h-8 w-14 rounded-lg" /> : value}
        {!loading && <span className="text-[13px] font-medium text-muted-foreground">{unit}</span>}
      </div>
      <p className="text-[12px] text-muted-foreground">{loading ? <Skel className="h-3 w-36 rounded-full" /> : sub}</p>
      {spark && (
        <div className="mt-1 flex h-6 items-end gap-[3px]">
          {spark.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-[2px] ${v > 0 ? sparkColor : "bg-muted"}`}
              style={{ height: v > 0 ? "70%" : "25%" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Readiness bar row ────────────────────────────────────────────────────────
function ReadinessRow({ label, pct, count, total, tone }: {
  label: string;
  pct: number;
  count: number;
  total: number;
  tone: "orange" | "sky" | "emerald";
}) {
  const fillColor =
    tone === "orange" ? "bg-[var(--cn-orange)]" : tone === "sky" ? "bg-[var(--t-sky-t,oklch(0.6_0.14_240))]" : "bg-[var(--t-emerald-t,oklch(0.58_0.13_165))]";
  const textColor =
    tone === "orange" ? "text-[var(--cn-orange)]" : tone === "sky" ? "text-[var(--t-sky-t,oklch(0.6_0.14_240))]" : "text-[var(--t-emerald-t,oklch(0.58_0.13_165))]";

  return (
    <div className="grid items-center gap-3" style={{ gridTemplateColumns: "120px 1fr 56px" }}>
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${fillColor}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
      <span className={`font-mono text-[12px] font-semibold text-right ${textColor}`}>{count} / {total}</span>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skel({ className = "" }: { className?: string }) {
  return <span className={`inline-block animate-pulse rounded-md bg-muted/70 align-middle ${className}`} />;
}

// ─── Beginner step card ───────────────────────────────────────────────────────
function BeginnerStepCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <DashboardPanel tone="sky" className="bg-background/80 p-4">
      <div className="ui-tone-sky-panel ui-tone-sky-text mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold">
        {step}
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
    </DashboardPanel>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getBeginnerCompletionState(
  dailyPractice: DailyPracticePlan,
  stats: Stats
): BeginnerCompletionState | null {
  if (!dailyPractice.studyCompleted) return null;
  if (!dailyPractice.reviewCompleted) return null;
  if (!dailyPractice.recommendedStudyWord?.simplified) return null;
  if (stats.entryCount > 1) return null;
  if (stats.reviewCount > 5) return null;
  return {
    word: dailyPractice.recommendedStudyWord.simplified,
    wroteSentence:
      dailyPractice.guidedResponsesToday > 0 ||
      dailyPractice.entriesCreatedToday > 0 ||
      stats.entryCount > 0,
  };
}

function getDashboardMode(dailyPractice: DailyPracticePlan, stats: Stats) {
  const noRealActivityYet =
    stats.entryCount === 0 &&
    stats.reviewCount === 0 &&
    dailyPractice.guidedResponsesToday === 0 &&
    dailyPractice.entriesCreatedToday === 0 &&
    dailyPractice.reviewsCompletedToday === 0;

  if (noRealActivityYet) {
    return { badge: "New learner" };
  }
  return { badge: "Active learner" };
}
