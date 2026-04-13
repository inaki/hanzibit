import {
  getCharacterOfTheDay,
  getDueFlashcardCount,
  getRecentDailyLoopCompletionCount,
  getRecentDailyLoopHistory,
  getRecentDailyLoopStepSummary,
  getTodayActivitySummary,
  syncDailyLoopCompletion,
} from "./data";
import { buildDailyPracticePlan, type DailyPracticePlan } from "./daily-practice";

export async function getDailyPracticePlanForUser(
  userId: string,
  level: number
): Promise<DailyPracticePlan> {
  const [dueCount, activity, characterOfTheDay] = await Promise.all([
    getDueFlashcardCount(userId),
    getTodayActivitySummary(userId),
    getCharacterOfTheDay(level),
  ]);

  const buildPlan = (
    weeklyCompletedLoops: number,
    recentLoopCompletionDates: string[],
    recentStepSummary = {
      reviewCompletedDays: 0,
      studyCompletedDays: 0,
      writeCompletedDays: 0,
    }
  ) =>
    buildDailyPracticePlan({
      level,
      dueCount,
      reviewsCompletedToday: activity.reviewsCompletedToday,
      entriesCreatedToday: activity.entriesCreatedToday,
      guidedResponsesToday: activity.guidedResponsesToday,
      reviewedWordLabelsToday: activity.reviewedWordLabelsToday,
      guidedResponseSourceRefsToday: activity.guidedResponseSourceRefsToday,
      latestGuidedResponseToday: activity.latestGuidedResponseToday,
      characterOfTheDay,
      weeklyCompletedLoops,
      recentLoopCompletionDates,
      recentStepSummary,
    });

  const initialPlan = buildPlan(0, []);

  await syncDailyLoopCompletion(userId, {
    completed: initialPlan.loopCompleted,
    reviewCompleted: initialPlan.reviewCompleted,
    studyCompleted: initialPlan.studyCompleted,
    writeCompleted: initialPlan.writeCompleted,
  });

  const [weeklyCompletedLoops, recentLoopHistory, recentStepSummary] = await Promise.all([
    getRecentDailyLoopCompletionCount(userId, 7),
    getRecentDailyLoopHistory(userId, 7),
    getRecentDailyLoopStepSummary(userId, 7),
  ]);

  return buildPlan(
    weeklyCompletedLoops,
    recentLoopHistory.map((item) => item.completedOn),
    recentStepSummary
  );
}
