import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateEncounteredProgress,
  selectWeakFlashcards,
  type Flashcard,
} from "../src/lib/data";

function makeCard(overrides: Partial<Flashcard>): Flashcard {
  return {
    id: overrides.id ?? "card-1",
    user_id: overrides.user_id ?? "user-1",
    front: overrides.front ?? "好",
    back: overrides.back ?? "good",
    deck: overrides.deck ?? "journal",
    next_review: overrides.next_review ?? "2026-04-12T00:00:00.000Z",
    interval_days: overrides.interval_days ?? 1,
    ease_factor: overrides.ease_factor ?? 2.5,
    review_count: overrides.review_count ?? 0,
    created_at: overrides.created_at ?? "2026-04-12T00:00:00.000Z",
    source_entry_id: overrides.source_entry_id ?? null,
  };
}

test("calculateEncounteredProgress merges journal tokens and flashcard fronts without double-counting", () => {
  const result = calculateEncounteredProgress(
    [
      { simplified: "好" },
      { simplified: "学" },
      { simplified: "吃" },
      { simplified: "看" },
    ],
    [
      "今天我觉得[好|hao3|good]。",
      "我想[学|xue2|study]中文，也想[好|hao3|good]好休息。",
    ],
    ["吃", "好", "不在HSK里"],
  );

  assert.deepEqual(result, {
    encountered: 3,
    total: 4,
    percent: 75,
  });
});

test("calculateEncounteredProgress returns zeros when there is no HSK content", () => {
  const result = calculateEncounteredProgress([], ["我爱中文"], ["好"]);
  assert.deepEqual(result, {
    encountered: 0,
    total: 0,
    percent: 0,
  });
});

test("selectWeakFlashcards filters to weak reviewed cards and sorts by ease then next review", () => {
  const cards = [
    makeCard({ id: "a", front: "好", ease_factor: 1.9, review_count: 3, next_review: "2026-04-15T00:00:00.000Z" }),
    makeCard({ id: "b", front: "学", ease_factor: 1.6, review_count: 2, next_review: "2026-04-14T00:00:00.000Z" }),
    makeCard({ id: "c", front: "吃", ease_factor: 1.6, review_count: 4, next_review: "2026-04-13T00:00:00.000Z" }),
    makeCard({ id: "d", front: "看", ease_factor: 2.1, review_count: 8 }),
    makeCard({ id: "e", front: "说", ease_factor: 1.4, review_count: 1 }),
  ];

  const result = selectWeakFlashcards(cards, 2);

  assert.deepEqual(
    result.map((card) => card.id),
    ["c", "b"],
  );
});

