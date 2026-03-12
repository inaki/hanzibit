"use client";

import { useState } from "react";
import type { Flashcard } from "@/lib/data";
import { RotateCcw, ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface FlashcardPracticeProps {
  cards: Flashcard[];
}

export function FlashcardPractice({ cards }: FlashcardPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<"practice" | "browse">("practice");

  const currentCard = cards[currentIndex];
  const total = cards.length;

  function next() {
    setFlipped(false);
    setCurrentIndex((i) => Math.min(i + 1, total - 1));
  }

  function prev() {
    setFlipped(false);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  if (total === 0) {
    return (
      <div data-testid="flashcards-empty" className="mx-auto max-w-2xl rounded-xl border bg-white py-16 text-center text-sm text-gray-400">
        No flashcards yet. Add vocabulary to create flashcards!
      </div>
    );
  }

  return (
    <div data-testid="flashcard-practice" className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 data-testid="flashcards-heading" className="text-3xl font-bold text-gray-900">Flashcards</h1>
          <p data-testid="flashcards-count" className="mt-1 text-sm text-gray-500">
            {total} cards · Card {currentIndex + 1} of {total}
          </p>
        </div>
        <div data-testid="flashcards-mode-toggle" className="flex rounded-lg border bg-white p-0.5">
          <button
            data-testid="flashcards-mode-practice"
            onClick={() => setMode("practice")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "practice" ? "bg-[var(--cn-orange)] text-white" : "text-gray-600"
            }`}
          >
            Practice
          </button>
          <button
            data-testid="flashcards-mode-browse"
            onClick={() => setMode("browse")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "browse" ? "bg-[var(--cn-orange)] text-white" : "text-gray-600"
            }`}
          >
            Browse All
          </button>
        </div>
      </div>

      {mode === "practice" ? (
        <>
          {/* Flashcard */}
          <button
            data-testid="flashcard-card"
            onClick={() => setFlipped(!flipped)}
            className="mb-6 flex h-72 w-full items-center justify-center rounded-2xl border-2 bg-white shadow-sm transition-all hover:shadow-md"
          >
            {!flipped ? (
              <div data-testid="flashcard-front" className="text-center">
                <p className="text-6xl font-bold text-gray-900">{currentCard.front}</p>
                <p className="mt-4 flex items-center gap-1 text-sm text-gray-400">
                  <Eye className="h-4 w-4" />
                  Tap to reveal
                </p>
              </div>
            ) : (
              <div data-testid="flashcard-back" className="text-center">
                <p className="text-2xl text-gray-700">{currentCard.back}</p>
                <p className="mt-2 text-xs text-gray-400">Deck: {currentCard.deck}</p>
              </div>
            )}
          </button>

          {/* Navigation */}
          <div data-testid="flashcard-navigation" className="flex items-center justify-center gap-4">
            <button
              data-testid="flashcard-prev"
              onClick={prev}
              disabled={currentIndex === 0}
              className="rounded-lg border bg-white p-2.5 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              data-testid="flashcard-flip"
              onClick={() => setFlipped(!flipped)}
              className="rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <RotateCcw className="mr-1.5 inline h-4 w-4" />
              Flip
            </button>
            <button
              data-testid="flashcard-next"
              onClick={next}
              disabled={currentIndex === total - 1}
              className="rounded-lg border bg-white p-2.5 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div data-testid="flashcard-progress" className="mt-6 h-1.5 rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[var(--cn-orange)] transition-all"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        </>
      ) : (
        /* Browse mode */
        <div data-testid="flashcards-browse" className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.id}
              data-testid={`flashcard-browse-${card.front}`}
              className="rounded-xl border bg-white p-5 transition-colors hover:border-[var(--cn-orange)]/30"
            >
              <p className="text-2xl font-bold text-gray-900">{card.front}</p>
              <p className="mt-1 text-sm text-gray-600">{card.back}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
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
