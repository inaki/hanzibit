import type { StudyGuideWord } from "./data";
import type { DailyPracticePlan } from "./daily-practice";
import { buildInlineAnnotation } from "./parse-tokens";
import { buildStudyGuideReading } from "./study-guide-content";

export interface GuidedDraftPayload {
  draftTitleZh: string;
  draftTitleEn: string;
  draftUnit: string;
  draftLevel: number;
  draftContentZh: string;
  draftSelectedText?: string;
  draftPrompt?: string;
  draftSourceZh?: string;
  draftSourceEn?: string;
  draftTargetWord?: string;
  draftTargetPinyin?: string;
  draftTargetEnglish?: string;
  draftSourceType?: string;
  draftSourceRef?: string;
}

export function buildStudyGuideDraftPayload(input: {
  level: number;
  item: StudyGuideWord;
  contentZh: string;
  selectedText?: string;
  prompt: string;
  sourceZh: string;
  sourceEn: string;
  unitSuffix?: string;
}): GuidedDraftPayload {
  const { level, item, contentZh, selectedText, prompt, sourceZh, sourceEn, unitSuffix } = input;
  return {
    draftTitleZh: `练习：${item.word.simplified}`,
    draftTitleEn: `Practice: ${item.word.english}`,
    draftUnit: unitSuffix ? `HSK ${level} Study Guide ${unitSuffix}` : `HSK ${level} Study Guide`,
    draftLevel: level,
    draftContentZh: contentZh,
    draftSelectedText: selectedText,
    draftPrompt: prompt,
    draftSourceZh: sourceZh,
    draftSourceEn: sourceEn,
    draftTargetWord: item.word.simplified,
    draftTargetPinyin: item.word.pinyin,
    draftTargetEnglish: item.word.english,
    draftSourceType: "study_guide",
    draftSourceRef: String(item.word.id),
  };
}

export function buildStudyGuideDetailPayload(input: {
  level: number;
  item: StudyGuideWord;
  dailyPractice: DailyPracticePlan;
}) {
  const { level, item, dailyPractice } = input;
  const reading = buildStudyGuideReading(item, level);
  const baseAnnotation = buildInlineAnnotation(
    item.word.simplified,
    item.word.pinyin,
    item.word.english
  );
  const isFocusWord = dailyPractice.recommendedStudyWord?.id === item.word.id;
  const latestResponse =
    dailyPractice.latestGuidedResponseToday?.sourceRef === String(item.word.id)
      ? dailyPractice.latestGuidedResponseToday
      : null;

  return {
    item,
    focusContext: {
      isFocusWord,
      focusWordProgress: isFocusWord ? dailyPractice.focusWordProgress : null,
      latestResponse,
    },
    reviewTarget: {
      mode: "due",
      level,
      focusWord: item.word.simplified,
      wordId: item.word.id,
    },
    presentation: {
      readingTitle: reading.title,
      readingPassageZh: reading.passageZh,
      readingPassageEn: reading.passageEn,
      tryThesePhrases: reading.phraseCandidates.map((candidate) => ({
        zh: candidate.zh,
        en: candidate.en,
        draft: buildStudyGuideDraftPayload({
          level,
          item,
          contentZh: `${baseAnnotation} ${candidate.zh}`,
          selectedText: candidate.zh,
          prompt: `Use the phrase "${candidate.zh}" in your own response and keep ${item.word.simplified} annotated.`,
          sourceZh: reading.passageZh,
          sourceEn: reading.passageEn,
        }),
      })),
      noticeThisPhrase: {
        zh: reading.focusPhraseZh,
        en: reading.focusPhraseEn,
        draft: buildStudyGuideDraftPayload({
          level,
          item,
          contentZh: `${baseAnnotation} ${reading.focusPhraseZh}`,
          selectedText: reading.focusPhraseZh,
          prompt: `Use the phrase "${reading.focusPhraseZh}" in your own response and keep ${item.word.simplified} annotated.`,
          sourceZh: reading.passageZh,
          sourceEn: reading.passageEn,
        }),
      },
      quickCheck: {
        prompt: reading.comprehensionCheck,
      },
      listeningEcho: {
        zh: reading.listeningZh,
        en: reading.listeningEn,
        prompt: reading.listeningPrompt,
        draft: buildStudyGuideDraftPayload({
          level,
          item,
          contentZh: `${baseAnnotation} ${reading.listeningZh}`,
          selectedText: reading.listeningZh,
          prompt: reading.listeningPrompt,
          sourceZh: reading.listeningZh,
          sourceEn: reading.listeningEn,
          unitSuffix: "Listening",
        }),
      },
      journalResponse: {
        prompt: reading.responsePrompt,
        draft: buildStudyGuideDraftPayload({
          level,
          item,
          contentZh: baseAnnotation,
          prompt: reading.responsePrompt,
          sourceZh: reading.passageZh,
          sourceEn: reading.passageEn,
        }),
      },
    },
  };
}

export function buildFocusedReviewPayload(input: {
  level: number;
  dailyPractice: DailyPracticePlan;
}) {
  const { level, dailyPractice } = input;
  const focusWord = dailyPractice.recommendedStudyWord;
  const writeDraft = focusWord
    ? {
        draftTitleZh: "今日练习",
        draftTitleEn: "Daily practice",
        draftUnit: `HSK ${level} Daily Practice`,
        draftLevel: level,
        draftContentZh:
          focusWord.pinyin && focusWord.english
            ? buildInlineAnnotation(focusWord.simplified, focusWord.pinyin, focusWord.english)
            : focusWord.simplified,
        draftPrompt: dailyPractice.writingPromptBody,
        draftTargetWord: focusWord.simplified,
        draftTargetPinyin: focusWord.pinyin,
        draftTargetEnglish: focusWord.english,
        draftSourceType: "study_guide",
        draftSourceRef: String(focusWord.id),
      }
    : null;

  return {
    dueCount: dailyPractice.dueCount,
    recommendedStudyWord: focusWord,
    focusWordProgress: dailyPractice.focusWordProgress,
    latestGuidedResponseToday: dailyPractice.latestGuidedResponseToday,
    studyTarget: focusWord
      ? {
          level,
          wordId: focusWord.id,
          focusWord: focusWord.simplified,
        }
      : null,
    writeDraft,
  };
}
