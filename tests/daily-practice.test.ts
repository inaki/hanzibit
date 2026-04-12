import test from "node:test";
import assert from "node:assert/strict";
import { buildDailyPracticePlan } from "../src/lib/daily-practice";

function isoDateDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

test("builds a first-entry prompt when the learner has not written today", () => {
  const plan = buildDailyPracticePlan({
    level: 1,
    dueCount: 4,
    reviewsCompletedToday: 1,
    entriesCreatedToday: 0,
    guidedResponsesToday: 0,
    latestGuidedResponseToday: null,
    weeklyCompletedLoops: 2,
    recentLoopCompletionDates: [isoDateDaysAgo(4), isoDateDaysAgo(1)],
    recentStepSummary: {
      reviewCompletedDays: 5,
      studyCompletedDays: 2,
      writeCompletedDays: 1,
    },
    characterOfTheDay: {
      id: 1,
      simplified: "好",
      traditional: "好",
      pinyin: "hao3",
      english: "good",
      hsk_level: 1,
    },
  });

  assert.equal(plan.dueCount, 4);
  assert.equal(plan.writingPromptTitle, "Write today's short entry");
  assert.equal(plan.reviewCompleted, true);
  assert.equal(plan.studyCompleted, false);
  assert.equal(plan.writeCompleted, false);
  assert.equal(plan.completedSteps, 1);
  assert.equal(plan.totalSteps, 3);
  assert.equal(plan.loopCompleted, false);
  assert.equal(plan.weeklyCompletedLoops, 2);
  assert.equal(plan.recentLoopHistory.length, 7);
  assert.equal(plan.recentLoopHistory.filter((day) => day.completed).length, 2);
  assert.equal(plan.stepPattern.reviewCompletedDays, 5);
  assert.equal(plan.stepPattern.strongestStep, "review");
  assert.equal(plan.stepPattern.weakestStep, "write");
  assert.equal(plan.stepPatternInsight.strongestLabel, "Review");
  assert.equal(plan.stepPatternInsight.weakestLabel, "Writing");
  assert.match(plan.stepPatternInsight.weakestMessage ?? "", /Writing is the current gap/i);
  assert.deepEqual(
    plan.missingSteps.map((step) => step.key),
    ["study", "write"]
  );
  assert.match(plan.writingPromptBody, /好/);
});

test("builds a variation prompt when the learner already wrote today", () => {
  const plan = buildDailyPracticePlan({
    level: 2,
    dueCount: 0,
    reviewsCompletedToday: 5,
    entriesCreatedToday: 1,
    guidedResponsesToday: 1,
    latestGuidedResponseToday: {
      id: "entry-1",
      title_zh: "练习：今天",
      title_en: "Practice: today",
      created_at: "2026-04-12T12:00:00.000Z",
      source_ref: "42",
      source_word_simplified: "吃",
      source_word_pinyin: "chi1",
    },
    weeklyCompletedLoops: 6,
    recentLoopCompletionDates: [
      isoDateDaysAgo(6),
      isoDateDaysAgo(5),
      isoDateDaysAgo(4),
      isoDateDaysAgo(3),
      isoDateDaysAgo(2),
      isoDateDaysAgo(0),
    ],
    recentStepSummary: {
      reviewCompletedDays: 7,
      studyCompletedDays: 6,
      writeCompletedDays: 6,
    },
    characterOfTheDay: null,
  });

  assert.equal(plan.writingPromptTitle, "Write one more variation");
  assert.equal(plan.guidedResponsesToday, 1);
  assert.equal(plan.reviewCompleted, true);
  assert.equal(plan.studyCompleted, true);
  assert.equal(plan.writeCompleted, true);
  assert.equal(plan.completedSteps, 3);
  assert.equal(plan.totalSteps, 3);
  assert.equal(plan.loopCompleted, true);
  assert.equal(plan.weeklyCompletedLoops, 6);
  assert.equal(plan.recentLoopHistory.filter((day) => day.completed).length, 6);
  assert.equal(plan.recentLoopHistory.at(-1)?.isToday, true);
  assert.equal(plan.stepPattern.strongestStep, "review");
  assert.equal(plan.stepPattern.weakestStep, "study");
  assert.equal(plan.stepPatternInsight.strongestLabel, "Review");
  assert.equal(plan.stepPatternInsight.weakestLabel, "Study");
  assert.match(plan.stepPatternInsight.weakestMessage ?? "", /Study is the current gap/i);
  assert.equal(plan.missingSteps.length, 0);
  assert.equal(plan.latestGuidedResponseToday?.id, "entry-1");
  assert.equal(plan.latestGuidedResponseToday?.sourceRef, "42");
  assert.equal(plan.latestGuidedResponseToday?.sourceWordSimplified, "吃");
  assert.match(plan.writingPromptBody, /new sentence/i);
  assert.match(plan.studyFocus, /吃/);
});
