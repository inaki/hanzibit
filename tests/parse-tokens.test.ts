import test from "node:test";
import assert from "node:assert/strict";
import { buildInlineAnnotation, replaceTextRange, validateInlineMarkup } from "../src/lib/parse-tokens";

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

test("builds inline annotation markup from trimmed parts", () => {
  assert.equal(
    buildInlineAnnotation(" 爱 ", " ai4 ", " love "),
    "[爱|ai4|love]"
  );
});

test("replaces the selected range in-place", () => {
  assert.equal(
    replaceTextRange("我喜欢爱你。", 3, 4, "[爱|ai4|love]"),
    "我喜欢[爱|ai4|love]你。"
  );
});

test("clamps replacement ranges safely", () => {
  assert.equal(
    replaceTextRange("你好", -5, 99, "[你好|ni3 hao3|hello]"),
    "[你好|ni3 hao3|hello]"
  );
});
