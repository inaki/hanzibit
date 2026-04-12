import test from "node:test";
import assert from "node:assert/strict";
import { evaluateGuidedDraft } from "../src/lib/composer-guidance";

test("detects target word usage", () => {
  const result = evaluateGuidedDraft("我爱中文。今天我也爱学习。", "爱");
  assert.equal(result.hasTargetWord, true);
  assert.equal(result.hasEnoughSentences, true);
});

test("flags when target word is missing", () => {
  const result = evaluateGuidedDraft("我学习中文。今天很忙。", "爱");
  assert.equal(result.hasTargetWord, false);
  assert.equal(result.sentenceCount, 2);
});
