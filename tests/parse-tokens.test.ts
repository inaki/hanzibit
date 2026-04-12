import test from "node:test";
import assert from "node:assert/strict";
import { validateInlineMarkup } from "../src/lib/parse-tokens";

test("accepts valid inline markup", () => {
  assert.deepEqual(
    validateInlineMarkup("我去[餐厅|can1 ting1|restaurant]吃饭。"),
    []
  );
});

test("rejects unmatched opening bracket", () => {
  const issues = validateInlineMarkup("我去[餐厅|can1 ting1|restaurant 吃饭。");
  assert.equal(issues[0]?.message, "Opening [ is missing a closing ].");
});

test("rejects unmatched closing bracket", () => {
  const issues = validateInlineMarkup("我去餐厅]吃饭。");
  assert.equal(
    issues[0]?.message,
    "Closing ] appears without a matching opening [."
  );
});

test("rejects annotations with the wrong number of parts", () => {
  const issues = validateInlineMarkup("我去[餐厅|restaurant]吃饭。");
  assert.equal(
    issues[0]?.message,
    "Annotations must use exactly three parts: [汉字|pinyin|meaning]."
  );
});

test("rejects empty annotation parts", () => {
  const issues = validateInlineMarkup("我去[餐厅||restaurant]吃饭。");
  assert.equal(
    issues[0]?.message,
    "Each annotation needs hanzi, pinyin, and meaning."
  );
});
