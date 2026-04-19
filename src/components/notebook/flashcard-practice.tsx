"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { Flashcard } from "@/lib/data";
import { RotateCcw, ChevronLeft, ChevronRight, Eye, Target, BookText } from "lucide-react";
import { AudioPlayButton } from "./audio-play-button";
import { getDailyPracticeAction, reviewFlashcard } from "@/lib/actions";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import type { DailyPracticePlan } from "@/lib/daily-practice";
import {
  FlashcardActionPanel,
  FlashcardBrowseCard,
  FlashcardControlButton,
  FlashcardNoticePanel,
  FlashcardPanel,
  FlashcardProgressBar,
} from "@/components/patterns/flashcards";

interface FlashcardPracticeProps {
  cards: Flashcard[];
  dueCount?: number;
  initialFilter?: FilterTab;
  initialFocusFront?: string;
  initialFocusWordId?: string;
  initialFocusLevel?: string;
  beginnerMode?: boolean;
}

type FilterTab = "all" | "due";

const QUALITY_BUTTONS = [
  { label: "Again", quality: 1, color: "border ui-tone-rose-panel ui-tone-rose-text hover:opacity-80 active:translate-y-px" },
  { label: "Hard", quality: 2, color: "border ui-tone-amber-panel ui-tone-amber-text hover:opacity-80 active:translate-y-px" },
  { label: "Good", quality: 3, color: "border ui-tone-emerald-panel ui-tone-emerald-text hover:opacity-80 active:translate-y-px" },
  { label: "Easy", quality: 5, color: "border-transparent bg-[var(--cn-orange)] text-white hover:bg-[var(--cn-orange-dark)] active:translate-y-px" },
];

export function FlashcardPractice({
  cards,
  dueCount = 0,
  initialFilter = "all",
  initialFocusFront = "",
  initialFocusWordId = "",
  initialFocusLevel = "",
  beginnerMode = false,
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
  const isBeginnerFocusedSession = beginnerMode && !!focusFront;
  const focusStudyHref =
    initialFocusWordId && initialFocusLevel
      ? `/notebook/lessons?level=${encodeURIComponent(initialFocusLevel)}&wordId=${encodeURIComponent(initialFocusWordId)}${beginnerMode ? "&beginner=1" : ""}`
      : null;
  const focusJournalHref =
    focusFront && initialFocusLevel
      ? `/notebook?new=1&draftTitleZh=${encodeURIComponent(`练习：${focusFront}`)}&draftTitleEn=${encodeURIComponent(`Practice: ${currentCard?.back ?? focusFront}`)}&draftUnit=${encodeURIComponent(`HSK ${initialFocusLevel} Daily Practice`)}&draftLevel=${encodeURIComponent(initialFocusLevel)}&draftContentZh=${encodeURIComponent(focusFront)}&draftPrompt=${encodeURIComponent(`Use ${focusFront} in 2-3 original sentences. Reuse it in a natural context and annotate at least one useful phrase.`)}&draftTargetWord=${encodeURIComponent(focusFront)}&draftTargetEnglish=${encodeURIComponent(currentCard?.back ?? "")}${initialFocusWordId ? `&draftSourceType=study_guide&draftSourceRef=${encodeURIComponent(initialFocusWordId)}` : ""}${beginnerMode ? "&draftBeginner=1" : ""}`
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
      <FlashcardPanel
        data-testid="flashcards-empty"
        className="mx-auto max-w-2xl py-16 text-center text-sm text-muted-foreground/70"
      >
        No flashcards yet. Add vocabulary to create flashcards!
      </FlashcardPanel>
    );
  }

  return (
    <div data-testid="flashcard-practice" className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 data-testid="flashcards-heading" className="text-3xl font-bold text-foreground">
            {isBeginnerFocusedSession ? "Tiny Review" : "Flashcards"}
          </h1>
          <p data-testid="flashcards-count" className="mt-1 text-sm text-muted-foreground">
            {isBeginnerFocusedSession
              ? total > 0
                ? `Review one focused word first${total > 1 ? ` · Card ${currentIndex + 1} of ${total}` : ""}`
                : "Start with one focused review"
              : `${total} ${filter === "due" ? "due " : ""}cards${total > 0 ? ` · Card ${currentIndex + 1} of ${total}` : ""}`}
          </p>
          {focusFront && filteredCards.some((card) => card.front === focusFront) && (
            <p className="ui-tone-orange-panel ui-tone-orange-text mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium">
              <Target className="h-3.5 w-3.5" />
              {isBeginnerFocusedSession ? `Study word: ${focusFront}` : `Focus word: ${focusFront}`}
            </p>
          )}
        </div>
        {!isBeginnerFocusedSession && (
          <div data-testid="flashcards-mode-toggle" className="flex rounded-lg bg-card card-ring p-0.5">
            <button
              data-testid="flashcards-mode-practice"
              onClick={() => setMode("practice")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "practice" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Practice
            </button>
            <button
              data-testid="flashcards-mode-browse"
              onClick={() => setMode("browse")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "browse" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Browse All
            </button>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      {mode === "practice" && !isBeginnerFocusedSession && (
        <div data-testid="flashcards-filter" className="mb-6 inline-flex rounded-full border border-border bg-card/70 p-1">
          <button
            data-testid="flashcards-filter-all"
            onClick={() => handleFilterChange("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-muted/70"
            }`}
          >
            All ({cards.length})
          </button>
          <button
            data-testid="flashcards-filter-due"
            onClick={() => handleFilterChange("due")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === "due"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-muted/70"
            }`}
          >
            Due ({dueCount})
          </button>
        </div>
      )}

      {mode === "practice" ? (
        total === 0 ? (
          <FlashcardPanel className="py-16 text-center text-sm text-muted-foreground/70">
            {filter === "due" ? "No cards due for review!" : "No cards to practice."}
          </FlashcardPanel>
        ) : (
          <>
            {isBeginnerFocusedSession && (
              <FlashcardNoticePanel tone="orange" className="mb-4">
                <p className="ui-tone-orange-text text-xs font-semibold uppercase tracking-wide">
                  Start with one review
                </p>
                <p className="mt-1 text-sm text-foreground">
                  Flip this card, listen once, and choose how it felt. You only need to review one word right now.
                </p>
              </FlashcardNoticePanel>
            )}
            {focusFront && currentCard?.front === focusFront && (
              <FlashcardNoticePanel tone="orange" className="mb-4">
                <p className="ui-tone-orange-text text-xs font-semibold uppercase tracking-wide">
                  {isBeginnerFocusedSession ? "Next step" : "Today&apos;s Focus"}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {isBeginnerFocusedSession
                    ? "After this review, go back to the study word or write one short sentence with it."
                    : "Review this card first, then continue through the rest of your due queue."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {focusStudyHref && (
                    <Link
                      href={focusStudyHref}
                      className="ui-tone-orange-text inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      <BookText className="h-3.5 w-3.5" />
                      Back to study item
                    </Link>
                  )}
                  {focusJournalHref && (
                    <Link
                      href={focusJournalHref}
                      className="ui-tone-orange-text inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      <Target className="h-3.5 w-3.5" />
                      Write with this word
                    </Link>
                  )}
                  {focusLatestResponseHref && (
                    <Link
                      href={focusLatestResponseHref}
                      className="ui-tone-orange-text inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      <BookText className="h-3.5 w-3.5" />
                      Open latest response
                    </Link>
                  )}
                </div>
              </FlashcardNoticePanel>
            )}

            {/* Flashcard */}
            <button
              data-testid="flashcard-card"
              onClick={() => setFlipped(!flipped)}
              className="mb-6 flex min-h-[260px] w-full cursor-pointer flex-col items-center justify-center rounded-[20px] bg-card card-ring px-8 py-14 gap-3 transition-colors"
            >
              {!flipped ? (
                <div data-testid="flashcard-front" className="text-center">
                  <p className="text-[64px] font-bold leading-none text-foreground">{currentCard.front}</p>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {isBeginnerFocusedSession ? "Tap to see the meaning" : "Click to reveal"}
                  </p>
                </div>
              ) : (
                <div data-testid="flashcard-back" className="flex flex-col items-center gap-2 text-center">
                  <p className="text-[48px] font-bold leading-none text-[var(--cn-orange)]">{currentCard.front}</p>
                  <p className="text-lg text-foreground/90">{currentCard.back}</p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">Deck</span>
                    <span>{currentCard.deck}</span>
                  </div>
                </div>
              )}
            </button>

            {/* Speak button — shown on front face only */}
            {!flipped && (
              <div className="mb-4 flex justify-center">
                <AudioPlayButton text={currentCard.front} type="word" size="md" />
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
              <p data-testid="flashcard-review-feedback" className="ui-tone-emerald-text mb-4 text-center text-sm font-medium">
                {reviewFeedback}
              </p>
            )}

            {/* SM-2 scoring buttons (shown after flip) */}
            {flipped && !reviewFeedback && !limitReached && (
              <FlashcardActionPanel data-testid="flashcard-scoring" className="mb-6 rounded-2xl bg-card/70">
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                  {isBeginnerFocusedSession ? "How did this one word feel?" : "How did this feel?"}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {QUALITY_BUTTONS.map((btn) => (
                    <button
                      key={btn.quality}
                      data-testid={`flashcard-score-${btn.label.toLowerCase()}`}
                      onClick={() => handleScore(btn.quality)}
                      disabled={isPending}
                      className={`rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${btn.color}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </FlashcardActionPanel>
            )}

            {/* Navigation */}
            {isBeginnerFocusedSession ? (
              <div data-testid="flashcard-navigation" className="flex items-center justify-center gap-3">
                <FlashcardControlButton
                  data-testid="flashcard-flip"
                  onClick={() => { setFlipped(!flipped); setReviewFeedback(null); }}
                >
                  <RotateCcw className="mr-1.5 inline h-4 w-4" />
                  {flipped ? "Hide meaning" : "Reveal meaning"}
                </FlashcardControlButton>
              </div>
            ) : (
              <div data-testid="flashcard-navigation" className="flex items-center justify-center gap-3">
                <FlashcardControlButton
                  data-testid="flashcard-prev"
                  onClick={prev}
                  disabled={currentIndex === 0}
                  className="p-2.5"
                >
                  <ChevronLeft className="h-5 w-5" />
                </FlashcardControlButton>
                <FlashcardControlButton
                  data-testid="flashcard-flip"
                  onClick={() => { setFlipped(!flipped); setReviewFeedback(null); }}
                >
                  <RotateCcw className="mr-1.5 inline h-4 w-4" />
                  Flip
                </FlashcardControlButton>
                <FlashcardControlButton
                  data-testid="flashcard-next"
                  onClick={next}
                  disabled={currentIndex === total - 1}
                  className="p-2.5"
                >
                  <ChevronRight className="h-5 w-5" />
                </FlashcardControlButton>
              </div>
            )}

            {/* Progress bar */}
            <FlashcardProgressBar
              value={((currentIndex + 1) / total) * 100}
              className="mt-6"
            />
          </>
        )
      ) : (
        /* Browse mode */
        <div data-testid="flashcards-browse" className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <FlashcardBrowseCard
              key={card.id}
              data-testid={`flashcard-browse-${card.front}`}
            >
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">{card.front}</p>
                <AudioPlayButton text={card.front} type="word" size="sm" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{card.back}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground/70">
                <span>{card.deck}</span>
                <span>{card.review_count} reviews</span>
              </div>
            </FlashcardBrowseCard>
          ))}
        </div>
      )}
    </div>
  );
}
