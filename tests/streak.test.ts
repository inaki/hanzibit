import test from "node:test";
import assert from "node:assert/strict";
import { calculateUserStreak } from "../src/lib/streak";

const TODAY = new Date("2026-04-10T12:00:00.000Z");

test("returns 0 when the user has no activity", () => {
  assert.equal(calculateUserStreak([], TODAY), 0);
});

test("counts a streak including today", () => {
  assert.equal(
    calculateUserStreak(["2026-04-10", "2026-04-09", "2026-04-08"], TODAY),
    3
  );
});

test("counts yesterday-first streak when there is no activity yet today", () => {
  assert.equal(
    calculateUserStreak(["2026-04-09", "2026-04-08", "2026-04-07"], TODAY),
    3
  );
});

test("breaks the streak after a gap", () => {
  assert.equal(
    calculateUserStreak(["2026-04-10", "2026-04-08", "2026-04-07"], TODAY),
    1
  );
});
