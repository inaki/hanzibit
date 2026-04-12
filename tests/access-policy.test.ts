import test from "node:test";
import assert from "node:assert/strict";
import { canAccessHskLevelFromPlan } from "../src/lib/access-policy";

test("HSK 1 is available to free users", () => {
  assert.equal(canAccessHskLevelFromPlan(1, false), true);
});

test("higher HSK levels are blocked for free users", () => {
  assert.equal(canAccessHskLevelFromPlan(2, false), false);
  assert.equal(canAccessHskLevelFromPlan(6, false), false);
});

test("pro users can access higher HSK levels", () => {
  assert.equal(canAccessHskLevelFromPlan(2, true), true);
  assert.equal(canAccessHskLevelFromPlan(6, true), true);
});
