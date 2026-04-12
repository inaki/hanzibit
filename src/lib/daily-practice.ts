import type { HskWord } from "./data";

export interface DailyPracticePlan {
  dueCount: number;
  reviewsCompletedToday: number;
  entriesCreatedToday: number;
  guidedResponsesToday: number;
  reviewCompleted: boolean;
  studyCompleted: boolean;
  writeCompleted: boolean;
  completedSteps: number;
  totalSteps: number;
  loopCompleted: boolean;
  weeklyCompletedLoops: number;
  recentLoopHistory: {
    date: string;
    label: string;
    completed: boolean;
    isToday: boolean;
  }[];
  stepPattern: {
    reviewCompletedDays: number;
    studyCompletedDays: number;
    writeCompletedDays: number;
    strongestStep: "review" | "study" | "write" | null;
    weakestStep: "review" | "study" | "write" | null;
  };
  stepPatternInsight: {
    strongestLabel: string | null;
    weakestLabel: string | null;
    weakestMessage: string | null;
  };
  missingSteps: {
    key: "review" | "study" | "write";
    label: string;
    hint: string;
  }[];
  suggestedStudyLevel: number;
  writingPromptTitle: string;
  writingPromptBody: string;
  studyFocus: string;
  latestGuidedResponseToday: {
    id: string;
    titleZh: string;
    titleEn: string;
    createdAt: string;
    sourceRef: string | null;
    sourceWordSimplified: string | null;
    sourceWordPinyin: string | null;
  } | null;
}

export function buildDailyPracticePlan(input: {
  level: number;
  dueCount: number;
  reviewsCompletedToday: number;
  entriesCreatedToday: number;
  guidedResponsesToday: number;
  latestGuidedResponseToday: {
    id: string;
    title_zh: string;
    title_en: string;
    created_at: string;
    source_ref: string | null;
    source_word_simplified: string | null;
    source_word_pinyin: string | null;
  } | null;
  characterOfTheDay: HskWord | null;
  weeklyCompletedLoops: number;
  recentLoopCompletionDates: string[];
  recentStepSummary: {
    reviewCompletedDays: number;
    studyCompletedDays: number;
    writeCompletedDays: number;
  };
}): DailyPracticePlan {
  const {
    level,
    dueCount,
    reviewsCompletedToday,
    entriesCreatedToday,
    guidedResponsesToday,
    latestGuidedResponseToday,
    characterOfTheDay,
    weeklyCompletedLoops,
    recentLoopCompletionDates,
    recentStepSummary,
  } =
    input;

  const latestStudyWord = latestGuidedResponseToday?.source_word_simplified;
  const latestStudyWordPinyin = latestGuidedResponseToday?.source_word_pinyin;
  const focusWord = characterOfTheDay?.simplified ?? "今天";
  const focusMeaning = characterOfTheDay?.english ?? "today";
  const studyFocus = latestStudyWord
    ? latestStudyWordPinyin
      ? `Return to ${latestStudyWord} (${latestStudyWordPinyin}) and review it again in context.`
      : `Return to ${latestStudyWord} and review it again in context.`
    : characterOfTheDay
    ? `Review how ${characterOfTheDay.simplified} (${characterOfTheDay.pinyin}) appears in context.`
    : "Review one HSK word in context before you write.";

  const writingPromptTitle =
    entriesCreatedToday > 0 ? "Write one more variation" : "Write today's short entry";

  const writingPromptBody =
    entriesCreatedToday > 0
      ? `Reuse ${focusWord} in a new sentence. Change the setting, time, or person so you practice flexible output.`
      : `Write 3 to 5 sentences about your day or plans. Try to include ${focusWord} (${focusMeaning}) and at least one HSK ${level} pattern you know.`;

  const reviewCompleted = dueCount === 0 || reviewsCompletedToday > 0;
  const studyCompleted = guidedResponsesToday > 0;
  const writeCompleted = guidedResponsesToday > 0 || entriesCreatedToday > 0;
  const completedSteps = [reviewCompleted, studyCompleted, writeCompleted].filter(Boolean).length;
  const totalSteps = 3;
  const recentCompletionDateSet = new Set(recentLoopCompletionDates);
  const recentLoopHistory = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (6 - offset));
    const isoDate = date.toISOString().slice(0, 10);

    return {
      date: isoDate,
      label: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      completed: recentCompletionDateSet.has(isoDate),
      isToday: offset === 6,
    };
  });
  const missingSteps: DailyPracticePlan["missingSteps"] = [];
  const stepEntries = [
    ["review", recentStepSummary.reviewCompletedDays],
    ["study", recentStepSummary.studyCompletedDays],
    ["write", recentStepSummary.writeCompletedDays],
  ] as const;
  const strongestStep = [...stepEntries].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const weakestStep = [...stepEntries].sort((a, b) => a[1] - b[1])[0]?.[0] ?? null;
  const labelForStep = (step: "review" | "study" | "write" | null) => {
    if (step === "review") return "Review";
    if (step === "study") return "Study";
    if (step === "write") return "Writing";
    return null;
  };
  const weakestMessage =
    weakestStep === "review"
      ? "Review is the current gap. Clear due cards first to keep old material active."
      : weakestStep === "study"
        ? "Study is the current gap. Revisit an input block before you write."
        : weakestStep === "write"
          ? "Writing is the current gap. Turn one study item into a short guided response."
          : null;

  if (!reviewCompleted) {
    missingSteps.push({
      key: "review",
      label: "Review flashcards",
      hint: dueCount > 0 ? `${dueCount} due card${dueCount === 1 ? "" : "s"} waiting.` : "Do a quick review pass.",
    });
  }

  if (!studyCompleted) {
    missingSteps.push({
      key: "study",
      label: latestStudyWord ? `Revisit ${latestStudyWord}` : "Open the study guide",
      hint: latestStudyWord
        ? "Return to the related study item and read it again in context."
        : "Read one short input block before writing.",
    });
  }

  if (!writeCompleted) {
    missingSteps.push({
      key: "write",
      label: "Write a guided response",
      hint: "Use the journal prompt to turn input into output.",
    });
  }

  return {
    dueCount,
    reviewsCompletedToday,
    entriesCreatedToday,
    guidedResponsesToday,
    reviewCompleted,
    studyCompleted,
    writeCompleted,
    completedSteps,
    totalSteps,
    loopCompleted: completedSteps === totalSteps,
    weeklyCompletedLoops,
    recentLoopHistory,
    stepPattern: {
      reviewCompletedDays: recentStepSummary.reviewCompletedDays,
      studyCompletedDays: recentStepSummary.studyCompletedDays,
      writeCompletedDays: recentStepSummary.writeCompletedDays,
      strongestStep,
      weakestStep,
    },
    stepPatternInsight: {
      strongestLabel: labelForStep(strongestStep),
      weakestLabel: labelForStep(weakestStep),
      weakestMessage,
    },
    missingSteps,
    suggestedStudyLevel: level,
    writingPromptTitle,
    writingPromptBody,
    studyFocus,
    latestGuidedResponseToday: latestGuidedResponseToday
      ? {
          id: latestGuidedResponseToday.id,
          titleZh: latestGuidedResponseToday.title_zh,
          titleEn: latestGuidedResponseToday.title_en,
          createdAt: latestGuidedResponseToday.created_at,
          sourceRef: latestGuidedResponseToday.source_ref,
          sourceWordSimplified: latestGuidedResponseToday.source_word_simplified,
          sourceWordPinyin: latestGuidedResponseToday.source_word_pinyin,
        }
      : null,
  };
}
