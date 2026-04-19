import type { StudyGuideWord } from "./data";
import { summarizeEnglishGloss } from "./annotation-suggestions";

export interface StudyGuideReading {
  title: string;
  passageZh: string;
  passageEn: string;
  listeningZh: string;
  listeningEn: string;
  listeningPrompt: string;
  focusPhraseZh: string;
  focusPhraseEn: string;
  phraseCandidates: Array<{
    zh: string;
    en: string;
  }>;
  comprehensionCheck: string;
  responsePrompt: string;
}

export function buildStudyGuideReading(
  item: StudyGuideWord,
  level: number
): StudyGuideReading {
  const word = item.word.simplified;
  const english = item.word.english;
  const compactEnglish = summarizeEnglishGloss(english) || english;

  if (level <= 1) {
    return {
      title: `Mini Reading with ${word}`,
      passageZh: `今天我学习${word}。老师说“${word}”很重要。我回家以后用${word}写一个短句。`,
      passageEn: `Today I studied "${compactEnglish}." My teacher said "${compactEnglish}" is important. After going home, I used it in a short sentence.`,
      listeningZh: `老师问：“你今天怎么用${word}？” 我说：“我想先用${word}写一句话。”`,
      listeningEn: `The teacher asked, "How will you use ${compactEnglish} today?" I said, "I want to use ${compactEnglish} in one sentence first."`,
      listeningPrompt: `Repeat the listening line in your own words and answer the same question with ${word}.`,
      focusPhraseZh: `用${word}写一个短句`,
      focusPhraseEn: `use ${compactEnglish} in a short sentence`,
      phraseCandidates: [
        {
          zh: `老师说“${word}”很重要`,
          en: `${compactEnglish} is important`,
        },
        {
          zh: `用${word}写一个短句`,
          en: `use ${compactEnglish} in a short sentence`,
        },
      ],
      comprehensionCheck: `Where did the learner use ${word} after class?`,
      responsePrompt: `Write 2 to 4 sentences about how you can use ${word} in daily life.`,
    };
  }

  if (level <= 3) {
    return {
      title: `Context Practice: ${word}`,
      passageZh: `这周我们学到${word}这个词。我先在课本里看到它，后来又在自己的日记里试着用了一次。现在我对这个词更熟悉了。`,
      passageEn: `This week we learned the word "${compactEnglish}." I first saw it in the textbook, and later I tried using it once in my own journal. Now I feel more familiar with it.`,
      listeningZh: `同学说：“我先在课本里看到${word}，后来才敢自己用。” 老师回答：“先听懂，再自己说出来，很好。”`,
      listeningEn: `A classmate said, "I first saw ${compactEnglish} in the textbook, and only later dared to use it myself." The teacher replied, "First understand it, then say it yourself. Good."`,
      listeningPrompt: `Summarize the listening exchange and add one new sentence using ${word}.`,
      focusPhraseZh: `在自己的日记里试着用了一次`,
      focusPhraseEn: `tried using it once in my own journal`,
      phraseCandidates: [
        {
          zh: `我先在课本里看到它`,
          en: `I first saw it in the textbook`,
        },
        {
          zh: `在自己的日记里试着用了一次`,
          en: `tried using it once in my own journal`,
        },
      ],
      comprehensionCheck: `What helped the learner become more familiar with ${word}?`,
      responsePrompt: `Retell this idea in your own words and include ${word} in a new sentence.`,
    };
  }

  return {
    title: `Usage Reflection: ${word}`,
    passageZh: `学习新词的时候，我会先注意它出现的语境，再想一想自己什么时候会主动使用它。${word}不只是一个要记住的词，也是表达想法的工具。`,
    passageEn: `When learning a new word, I first notice the context where it appears, then think about when I would actively use it myself. "${compactEnglish}" is not only something to memorize, but also a tool for expressing ideas.`,
    listeningZh: `老师说：“听到${word}的时候，不要只想意思，也要想它为什么出现在这里。” 这个提醒让我更注意语境。`,
    listeningEn: `The teacher said, "When you hear ${compactEnglish}, don't think only about the meaning. Also think about why it appears here." That reminder makes me pay more attention to context.`,
    listeningPrompt: `Respond to the listening idea by explaining when you would actively use ${word} yourself.`,
    focusPhraseZh: `${word}不只是一个要记住的词`,
    focusPhraseEn: `${compactEnglish} is not only something to memorize`,
    phraseCandidates: [
      {
        zh: `先注意它出现的语境`,
        en: `first notice the context where it appears`,
      },
      {
        zh: `${word}不只是一个要记住的词`,
        en: `${english} is not only something to memorize`,
      },
    ],
    comprehensionCheck: `According to the passage, why is ${word} more than a vocabulary item to memorize?`,
    responsePrompt: `Write a short reflection using ${word} and one other HSK ${level} word you already know.`,
  };
}
