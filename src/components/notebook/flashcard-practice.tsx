"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { Flashcard } from "@/lib/data";
import { RotateCcw, ChevronLeft, ChevronRight, Eye, Volume2, Target, BookText } from "lucide-react";
import { getDailyPracticeAction, reviewFlashcard } from "@/lib/actions";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import type { DailyPracticePlan } from "@/lib/daily-practice";

interface FlashcardPracticeProps {
  cards: Flashcard[];
  dueCount?: number;
  initialFilter?: FilterTab;
  initialFocusFront?: string;
  initialFocusWordId?: string;
  initialFocusLevel?: string;
}

type FilterTab = "all" | "due";

const QUALITY_BUTTONS = [
  { label: "Again", quality: 1, color: "bg-red-500 hover:bg-red-600" },
  { label: "Hard", quality: 2, color: "bg-orange-500 hover:bg-orange-600" },
  { label: "Good", quality: 3, color: "bg-green-500 hover:bg-green-600" },
  { label: "Easy", quality: 5, color: "bg-blue-500 hover:bg-blue-600" },
];

export function FlashcardPractice({
  cards,
  dueCount = 0,
  initialFilter = "all",
  initialFocusFront = "",
  initialFocusWordId = "",
  initialFocusLevel = "",
}: FlashcardPracticeProps) {
  const focusFront = initialFocusFront.trim();
  const initialNow = new Date().toISOString();
  const initialCards = initialFilter === "due"
    ? cards.filter((c) => c.next_review <= initialNow)
    : cards;
  const initialFocusedIndex = focusFront
    ? initialCards.findIndex((card) => card.front === focusFront)
    : -1;
  const [currentIndex, setCurrentIndex] = useState(initialFocusedIndex >= 0 ? initialFocusedIndex : 0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<"practice" | "browse">("practice");
  const [filter, setFilter] = useState<FilterTab>(initialFilter);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [dailyPractice, setDailyPractice] = useState<DailyPracticePlan | null>(null);

  const now = new Date().toISOString();
  const filteredCards = filter === "due"
    ? cards.filter((c) => c.next_review <= now)
    : cards;
  const currentCard = filteredCards[currentIndex];
  const total = filteredCards.length;
  const focusStudyHref =
    initialFocusWordId && initialFocusLevel
      ? `/notebook/lessons?level=${encodeURIComponent(initialFocusLevel)}&wordId=${encodeURIComponent(initialFocusWordId)}`
      : null;
  const focusJournalHref =
    focusFront && initialFocusLevel
      ? `/notebook?new=1&draftTitleZh=${encodeURIComponent(`练习：${focusFront}`)}&draftTitleEn=${encodeURIComponent(`Practice: ${currentCard?.back ?? focusFront}`)}&draftUnit=${encodeURIComponent(`HSK ${initialFocusLevel} Daily Practice`)}&draftLevel=${encodeURIComponent(initialFocusLevel)}&draftContentZh=${encodeURIComponent(focusFront)}&draftPrompt=${encodeURIComponent(`Use ${focusFront} in 2-3 original sentences. Reuse it in a natural context and annotate at least one useful phrase.`)}&draftTargetWord=${encodeURIComponent(focusFront)}${initialFocusWordId ? `&draftSourceType=study_guide&draftSourceRef=${encodeURIComponent(initialFocusWordId)}` : ""}`
      : null;
  const focusLatestResponseHref =
    initialFocusWordId && dailyPractice?.latestGuidedResponseToday?.sourceRef === initialFocusWordId
      ? `/notebook?entry=${dailyPractice.latestGuidedResponseToday.id}`
      : null;

  useEffect(() => {
    let cancelled = false;
    if (!initialFocusLevel) return;

    getDailyPracticeAction(Number.parseInt(initialFocusLevel, 10)).then((plan) => {
      if (!cancelled) {
        setDailyPractice(plan);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialFocusLevel]);

  function next() {
    setFlipped(false);
    setReviewFeedback(null);
    setCurrentIndex((i) => Math.min(i + 1, total - 1));
  }

  function prev() {
    setFlipped(false);
    setReviewFeedback(null);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  function handleScore(quality: number) {
    if (!currentCard) return;
    startTransition(async () => {
      const result = await reviewFlashcard(currentCard.id, quality);
      if ("error" in result) {
        setLimitReached(true);
        return;
      }
      if (result.interval === 1) {
        setReviewFeedback("Review again tomorrow");
      } else {
        setReviewFeedback(`Next review in ${result.interval} days`);
      }
      // Auto-advance after a short delay
      setTimeout(() => {
        if (currentIndex + 1 < total) {
          next();
        }
      }, 1200);
    });
  }

  // Reset index when filter changes
  function handleFilterChange(tab: FilterTab) {
    setFilter(tab);
    const nextCards = tab === "due"
      ? cards.filter((c) => c.next_review <= now)
      : cards;
    const nextFocusIndex = focusFront
      ? nextCards.findIndex((card) => card.front === focusFront)
      : -1;
    setCurrentIndex(nextFocusIndex >= 0 ? nextFocusIndex : 0);
    setFlipped(false);
    setReviewFeedback(null);
  }

  if (cards.length === 0) {
    return (
      <div data-testid="flashcards-empty" className="mx-auto max-w-2xl rounded-xl border bg-card py-16 text-center text-sm text-muted-foreground/70">
        No flashcards yet. Add vocabulary to create flashcards!
      </div>
    );
  }

  return (
    <div data-testid="flashcard-practice" className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 data-testid="flashcards-heading" className="text-3xl font-bold text-foreground">Flashcards</h1>
          <p data-testid="flashcards-count" className="mt-1 text-sm text-muted-foreground">
            {total} {filter === "due" ? "due " : ""}cards
            {total > 0 && ` · Card ${currentIndex + 1} of ${total}`}
          </p>
          {focusFront && filteredCards.some((card) => card.front === focusFront) && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--cn-orange-light)] px-2.5 py-1 text-xs font-medium text-[var(--cn-orange)]">
              <Target className="h-3.5 w-3.5" />
              Focus word: {focusFront}
            </p>
          )}
        </div>
        <div data-testid="flashcards-mode-toggle" className="flex rounded-lg border bg-card p-0.5">
          <button
            data-testid="flashcards-mode-practice"
            onClick={() => setMode("practice")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "practice" ? "bg-[var(--cn-orange)] text-white" : "text-muted-foreground"
            }`}
          >
            Practice
          </button>
          <button
            data-testid="flashcards-mode-browse"
            onClick={() => setMode("browse")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "browse" ? "bg-[var(--cn-orange)] text-white" : "text-muted-foreground"
            }`}
          >
            Browse All
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      {mode === "practice" && (
        <div data-testid="flashcards-filter" className="mb-6 flex gap-2">
          <button
            data-testid="flashcards-filter-all"
            onClick={() => handleFilterChange("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted"
            }`}
          >
            All ({cards.length})
          </button>
          <button
            data-testid="flashcards-filter-due"
            onClick={() => handleFilterChange("due")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === "due"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted"
            }`}
          >
            Due ({dueCount})
          </button>
        </div>
      )}

      {mode === "practice" ? (
        total === 0 ? (
          <div className="rounded-xl border bg-card py-16 text-center text-sm text-muted-foreground/70">
            {filter === "due" ? "No cards due for review!" : "No cards to practice."}
          </div>
        ) : (
          <>
            {focusFront && currentCard?.front === focusFront && (
              <div className="mb-4 rounded-xl border border-[var(--cn-orange)]/30 bg-[var(--cn-orange-light)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cn-orange)]">
                  Today&apos;s Focus
                </p>
                <p className="mt-1 text-sm text-foreground">
                  Review this card first, then continue through the rest of your due queue.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {focusStudyHref && (
                    <Link
                      href={focusStudyHref}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--cn-orange)] hover:underline"
                    >
                      <BookText className="h-3.5 w-3.5" />
                      Back to study item
                    </Link>
                  )}
                  {focusJournalHref && (
                    <Link
                      href={focusJournalHref}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--cn-orange)] hover:underline"
                    >
                      <Target className="h-3.5 w-3.5" />
                      Write with this word
                    </Link>
                  )}
                  {focusLatestResponseHref && (
                    <Link
                      href={focusLatestResponseHref}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--cn-orange)] hover:underline"
                    >
                      <BookText className="h-3.5 w-3.5" />
                      Open latest response
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Flashcard */}
            <button
              data-testid="flashcard-card"
              onClick={() => setFlipped(!flipped)}
              className="mb-6 flex h-72 w-full items-center justify-center rounded-2xl border-2 bg-card shadow-sm transition-all hover:shadow-md"
            >
              {!flipped ? (
                <div data-testid="flashcard-front" className="text-center">
                  <p className="text-6xl font-bold text-foreground">{currentCard.front}</p>
                  <p className="mt-4 flex items-center gap-1 text-sm text-muted-foreground/70">
                    <Eye className="h-4 w-4" />
                    Tap to reveal
                  </p>
                </div>
              ) : (
                <div data-testid="flashcard-back" className="text-center">
                  <p className="text-2xl text-foreground/80">{currentCard.back}</p>
                  <p className="mt-2 text-xs text-muted-foreground/70">Deck: {currentCard.deck}</p>
                </div>
              )}
            </button>

            {/* Speak button — shown on front face only */}
            {!flipped && (
              <div className="mb-4 flex justify-center">
                <button
                  onClick={() => new Audio(`/api/tts?text=${encodeURIComponent(currentCard.front)}`).play()}
                  className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  Pronounce
                </button>
              </div>
            )}

            {/* Daily limit reached */}
            {limitReached && (
              <div className="mb-4">
                <UpgradePrompt reason="You've used your 5 free daily reviews. Upgrade to Pro for unlimited flashcard reviews." />
              </div>
            )}

            {/* Review feedback */}
            {reviewFeedback && (
              <p data-testid="flashcard-review-feedback" className="mb-4 text-center text-sm font-medium text-green-600">
                {reviewFeedback}
              </p>
            )}

            {/* SM-2 scoring buttons (shown after flip) */}
            {flipped && !reviewFeedback && !limitReached && (
              <div data-testid="flashcard-scoring" className="mb-6 flex justify-center gap-2">
                {QUALITY_BUTTONS.map((btn) => (
                  <button
                    key={btn.quality}
                    data-testid={`flashcard-score-${btn.label.toLowerCase()}`}
                    onClick={() => handleScore(btn.quality)}
                    disabled={isPending}
                    className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${btn.color}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div data-testid="flashcard-navigation" className="flex items-center justify-center gap-4">
              <button
                data-testid="flashcard-prev"
                onClick={prev}
                disabled={currentIndex === 0}
                className="rounded-lg border bg-card p-2.5 text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                data-testid="flashcard-flip"
                onClick={() => { setFlipped(!flipped); setReviewFeedback(null); }}
                className="rounded-lg border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
              >
                <RotateCcw className="mr-1.5 inline h-4 w-4" />
                Flip
              </button>
              <button
                data-testid="flashcard-next"
                onClick={next}
                disabled={currentIndex === total - 1}
                className="rounded-lg border bg-card p-2.5 text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div data-testid="flashcard-progress" className="mt-6 h-1.5 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[var(--cn-orange)] transition-all"
                style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
              />
            </div>
          </>
        )
      ) : (
        /* Browse mode */
        <div data-testid="flashcards-browse" className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.id}
              data-testid={`flashcard-browse-${card.front}`}
              className="rounded-xl border bg-card p-5 transition-colors hover:border-[var(--cn-orange)]/30"
            >
              <p className="text-2xl font-bold text-foreground">{card.front}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.back}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground/70">
                <span>{card.deck}</span>
                <span>{card.review_count} reviews</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
