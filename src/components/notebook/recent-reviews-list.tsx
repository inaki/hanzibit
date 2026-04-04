"use client";

import type { ReviewHistoryItem } from "@/lib/data";
import { BookOpen, Brain, Languages } from "lucide-react";

interface RecentReviewsListProps {
  items: ReviewHistoryItem[];
}

const typeIcons = {
  vocabulary: BookOpen,
  flashcard: Brain,
  grammar: Languages,
};

const typeLabels = {
  vocabulary: "Vocabulary",
  flashcard: "Flashcard",
  grammar: "Grammar",
};

const scoreLabels = ["", "Again", "Hard", "Good", "Easy", "Perfect"];
const scoreColors = [
  "",
  "bg-red-100 text-red-700",
  "bg-orange-100 text-orange-700",
  "bg-yellow-100 text-yellow-700",
  "bg-green-100 text-green-700",
  "bg-emerald-100 text-emerald-700",
];

export function RecentReviewsList({ items }: RecentReviewsListProps) {
  return (
    <div data-testid="recent-reviews-list" className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 data-testid="recent-reviews-heading" className="text-3xl font-bold text-foreground">Recent Reviews</h1>
        <p data-testid="recent-reviews-count" className="mt-1 text-sm text-muted-foreground">
          {items.length} reviews in your history
        </p>
      </div>

      {items.length === 0 ? (
        <div data-testid="recent-reviews-empty" className="rounded-xl border bg-card py-16 text-center text-sm text-muted-foreground/70">
          No reviews yet. Start reviewing vocabulary and flashcards!
        </div>
      ) : (
        <div data-testid="recent-reviews-table" className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Reviewed</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => {
                const Icon = typeIcons[item.item_type];
                const date = new Date(item.reviewed_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr
                    key={item.id}
                    data-testid={`review-row-${item.id}`}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[var(--cn-orange)]" />
                        <span className="text-xs text-muted-foreground">
                          {typeLabels[item.item_type]}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {item.item_label}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${scoreColors[item.score]}`}
                      >
                        {scoreLabels[item.score]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
