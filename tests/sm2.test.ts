import test from "node:test";
import assert from "node:assert/strict";
import { sm2 } from "../src/lib/sm2";

test("first successful review schedules 1 day", () => {
  assert.deepEqual(sm2(3, 1, 2.5, 0), {
    interval: 1,
    easeFactor: 2.36,
  });
});

test("second successful review schedules 6 days", () => {
  assert.deepEqual(sm2(4, 1, 2.5, 1), {
    interval: 6,
    easeFactor: 2.5,
  });
});

test("later successful reviews scale from previous interval and ease factor", () => {
  assert.deepEqual(sm2(5, 6, 2.5, 2), {
    interval: 15,
    easeFactor: 2.6,
  });
});

test("failed reviews reset interval to 1 day", () => {
  assert.deepEqual(sm2(2, 6, 2.5, 3), {
    interval: 1,
    easeFactor: 2.1799999999999997,
  });
});

test("ease factor never drops below the minimum", () => {
  const result = sm2(0, 10, 1.3, 10);
  assert.equal(result.interval, 1);
  assert.equal(result.easeFactor, 1.3);
});
