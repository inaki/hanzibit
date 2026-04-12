import test from "node:test";
import assert from "node:assert/strict";
import { evaluateJournalFeedback } from "../src/lib/journal-feedback";

test("flags short unannotated drafts", () => {
  const result = evaluateJournalFeedback("我爱你", "爱");
  assert.equal(result.annotationCount, 0);
  assert.ok(result.messages.some((message) => message.includes("Annotate at least one useful word")));
  assert.ok(result.messages.some((message) => message.includes("real message")));
});

test("recognizes stronger drafts", () => {
  const result = evaluateJournalFeedback(
    "我喜欢[爱|ai4|love]中文。今天我爱学习，也爱写日记。",
    "爱"
  );
  assert.equal(result.annotationCount, 1);
  assert.ok(result.strengths.some((message) => message.includes("target word")));
  assert.ok(result.strengths.some((message) => message.includes("vocabulary item")));
});
