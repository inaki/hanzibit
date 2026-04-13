import test from "node:test";
import assert from "node:assert/strict";
import { buildGlossPhraseCandidates } from "../src/lib/gloss-phrases";
import type { GlossParagraph } from "../src/lib/gloss";

test("builds short phrase candidates from adjacent gloss tokens", () => {
  const paragraph: GlossParagraph = [
    { type: "gloss", token: { hanzi: "我", pinyin: "wo3", english: "I", userAnnotated: false } },
    { type: "gloss", token: { hanzi: "学习", pinyin: "xue2 xi2", english: "study", userAnnotated: false } },
    { type: "gloss", token: { hanzi: "中文", pinyin: "zhong1 wen2", english: "Chinese", userAnnotated: false } },
  ];

  assert.deepEqual(buildGlossPhraseCandidates(paragraph), [
    { hanzi: "我学习", english: "I study" },
    { hanzi: "学习中文", english: "study Chinese" },
  ]);
});

test("skips punctuation and deduplicates repeated candidates", () => {
  const paragraph: GlossParagraph = [
    { type: "gloss", token: { hanzi: "你好", pinyin: "ni3 hao3", english: "hello", userAnnotated: false } },
    { type: "punctuation", char: "，" },
    { type: "gloss", token: { hanzi: "你好", pinyin: "ni3 hao3", english: "hello", userAnnotated: false } },
    { type: "gloss", token: { hanzi: "吗", pinyin: "ma", english: "question", userAnnotated: false } },
  ];

  assert.deepEqual(buildGlossPhraseCandidates(paragraph), [
    { hanzi: "你好吗", english: "hello question" },
  ]);
});
