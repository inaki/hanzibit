import test from "node:test";
import assert from "node:assert/strict";
import { parseLevel, parseQuality, requireArray, requireObject, requireString } from "../src/lib/mobile-api";

test("requireObject accepts plain objects", () => {
  const result = requireObject({ ok: true });
  assert.deepEqual(result, { ok: true });
});

test("requireObject rejects arrays and null", () => {
  const arrayResult = requireObject([]);
  const nullResult = requireObject(null);
  assert.equal("error" in arrayResult && arrayResult.error, "body must be an object");
  assert.equal("error" in nullResult && nullResult.error, "body must be an object");
});

test("requireArray accepts arrays and rejects other values", () => {
  const ok = requireArray([1, 2], "cards");
  const bad = requireArray("nope", "cards");
  assert.deepEqual(ok, [1, 2]);
  assert.equal("error" in bad && bad.error, "cards must be an array");
});

test("parseQuality enforces flashcard review bounds", () => {
  assert.equal(parseQuality(3), 3);
  const bad = parseQuality(7);
  assert.equal("error" in bad && bad.error, "quality must be between 1 and 5");
});

test("parseLevel and requireString still validate expected ranges", () => {
  assert.equal(parseLevel("2"), 2);
  assert.equal(requireString(" 爱 ", "front"), "爱");
});

