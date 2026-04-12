import test from "node:test";
import assert from "node:assert/strict";
import {
  FREE_DAILY_REVIEW_LIMIT,
  canReviewFlashcardFromCount,
} from "../src/lib/review-policy";

test("free users can review when below the daily limit", () => {
  assert.equal(
    canReviewFlashcardFromCount(FREE_DAILY_REVIEW_LIMIT - 1, false),
    true
  );
});

test("free users cannot review when they hit the daily limit", () => {
  assert.equal(
    canReviewFlashcardFromCount(FREE_DAILY_REVIEW_LIMIT, false),
    false
  );
});

test("pro users bypass the daily limit", () => {
  assert.equal(
    canReviewFlashcardFromCount(FREE_DAILY_REVIEW_LIMIT + 20, true),
    true
  );
});
