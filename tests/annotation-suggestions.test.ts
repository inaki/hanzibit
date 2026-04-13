import test from "node:test";
import assert from "node:assert/strict";
import {
  rankAnnotationSuggestions,
  summarizeEnglishGloss,
  type AnnotationLookupEntry,
} from "../src/lib/annotation-suggestions";
import type { HskWord } from "../src/lib/data";

const words: HskWord[] = [
  { id: 1, simplified: "爱", traditional: "愛", pinyin: "ai4", english: "love", hsk_level: 1 },
  { id: 2, simplified: "爱好", traditional: "愛好", pinyin: "ai4 hao4", english: "hobby", hsk_level: 2 },
  { id: 3, simplified: "学习", traditional: "學習", pinyin: "xue2 xi2", english: "study", hsk_level: 1 },
];

const entries: AnnotationLookupEntry[] = words.map((word) => ({
  hanzi: word.simplified,
  pinyin: word.pinyin,
  english: word.english,
  source: "hsk",
  hskLevel: word.hsk_level,
}));

test("ranks exact hanzi matches first", () => {
  const results = rankAnnotationSuggestions(entries, "爱", "hanzi");
  assert.equal(results[0]?.hanzi, "爱");
  assert.equal(results[0]?.exact, true);
});

test("ranks exact pinyin matches first", () => {
  const results = rankAnnotationSuggestions(entries, "ai4", "pinyin");
  assert.equal(results[0]?.hanzi, "爱");
  assert.equal(results[0]?.exact, true);
});

test("ranks exact english matches first", () => {
  const results = rankAnnotationSuggestions(entries, "love", "english");
  assert.equal(results[0]?.hanzi, "爱");
  assert.equal(results[0]?.exact, true);
});

test("prefers hsk matches over cedict when rank is otherwise equal", () => {
  const results = rankAnnotationSuggestions(
    [
      {
        hanzi: "爱",
        pinyin: "ai4",
        english: "love",
        source: "cedict",
      },
      {
        hanzi: "爱",
        pinyin: "ai4",
        english: "love",
        source: "hsk",
        hskLevel: 1,
      },
    ],
    "love",
    "english"
  );

  assert.equal(results[0]?.source, "hsk");
});

test("prefers suggestions closest to the current hsk level when matches are non-exact", () => {
  const results = rankAnnotationSuggestions(
    [
      {
        hanzi: "爱人",
        pinyin: "ai4 ren2",
        english: "lover",
        source: "hsk",
        hskLevel: 4,
      },
      {
        hanzi: "爱好",
        pinyin: "ai4 hao4",
        english: "hobby",
        source: "hsk",
        hskLevel: 2,
      },
    ],
    "ai4 h",
    "pinyin",
    2
  );

  assert.equal(results[0]?.hanzi, "爱好");
});

test("matches english against individual gloss segments", () => {
  const results = rankAnnotationSuggestions(
    [
      {
        hanzi: "吃",
        pinyin: "chi1",
        english: "to eat; to consume; to absorb",
        source: "cedict",
      },
    ],
    "consume",
    "english"
  );

  assert.equal(results[0]?.hanzi, "吃");
  assert.equal(results[0]?.exact, true);
});

test("ignores parenthetical notes when ranking english gloss segments", () => {
  const results = rankAnnotationSuggestions(
    [
      {
        hanzi: "爸爸",
        pinyin: "ba4 ba",
        english: "(coll.) father; dad",
        source: "cedict",
      },
    ],
    "father",
    "english"
  );

  assert.equal(results[0]?.hanzi, "爸爸");
  assert.equal(results[0]?.exact, true);
});

test("summarizes long english glosses for compact display", () => {
  assert.equal(
    summarizeEnglishGloss("to eat; to consume; to absorb"),
    "to eat"
  );
});

test("truncates a long single english gloss when needed", () => {
  assert.equal(
    summarizeEnglishGloss("very long descriptive gloss that keeps going for compact rows"),
    "very long descriptive gloss that keeps going..."
  );
});
