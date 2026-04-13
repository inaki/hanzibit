import test from "node:test";
import assert from "node:assert/strict";
import { buildStudyGuideReading } from "../src/lib/study-guide-content";
import type { StudyGuideWord } from "../src/lib/data";

const sampleWord: StudyGuideWord = {
  word: {
    id: 1,
    simplified: "好",
    traditional: "好",
    pinyin: "hao3",
    english: "good",
    hsk_level: 1,
  },
  encountered: false,
  journalEntries: [],
  flashcard: null,
};

test("builds beginner reading content for lower levels", () => {
  const result = buildStudyGuideReading(sampleWord, 1);
  assert.match(result.title, /好/);
  assert.match(result.passageZh, /好/);
  assert.match(result.listeningZh, /好/);
  assert.match(result.listeningPrompt, /好/);
  assert.match(result.focusPhraseZh, /好/);
  assert.equal(result.phraseCandidates.length, 2);
  assert.match(result.phraseCandidates[0]?.zh ?? "", /好/);
  assert.match(result.comprehensionCheck, /好|good/i);
  assert.match(result.responsePrompt, /好/);
});

test("builds a more reflective reading for advanced levels", () => {
  const result = buildStudyGuideReading(sampleWord, 5);
  assert.match(result.passageEn, /tool for expressing ideas/i);
  assert.match(result.listeningEn, /don't think only about the meaning/i);
  assert.match(result.focusPhraseEn, /memorize/i);
  assert.match(result.phraseCandidates[0]?.en ?? "", /context/i);
  assert.match(result.responsePrompt, /HSK 5/i);
});
