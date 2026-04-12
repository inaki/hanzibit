import type { StudyGuideWord } from "./data";

export interface StudyGuideReading {
  title: string;
  passageZh: string;
  passageEn: string;
  focusPhraseZh: string;
  focusPhraseEn: string;
  comprehensionCheck: string;
  responsePrompt: string;
}

export function buildStudyGuideReading(
  item: StudyGuideWord,
  level: number
): StudyGuideReading {
  const word = item.word.simplified;
  const english = item.word.english;

  if (level <= 1) {
    return {
      title: `Mini Reading with ${word}`,
      passageZh: `今天我学习${word}。老师说“${word}”很重要。我回家以后用${word}写一个短句。`,
      passageEn: `Today I studied "${english}." My teacher said "${english}" is important. After going home, I used it in a short sentence.`,
      focusPhraseZh: `用${word}写一个短句`,
      focusPhraseEn: `use ${english} in a short sentence`,
      comprehensionCheck: `Where did the learner use ${word} after class?`,
      responsePrompt: `Write 2 to 4 sentences about how you can use ${word} in daily life.`,
    };
  }

  if (level <= 3) {
    return {
      title: `Context Practice: ${word}`,
      passageZh: `这周我们学到${word}这个词。我先在课本里看到它，后来又在自己的日记里试着用了一次。现在我对这个词更熟悉了。`,
      passageEn: `This week we learned the word "${english}." I first saw it in the textbook, and later I tried using it once in my own journal. Now I feel more familiar with it.`,
      focusPhraseZh: `在自己的日记里试着用了一次`,
      focusPhraseEn: `tried using it once in my own journal`,
      comprehensionCheck: `What helped the learner become more familiar with ${word}?`,
      responsePrompt: `Retell this idea in your own words and include ${word} in a new sentence.`,
    };
  }

  return {
    title: `Usage Reflection: ${word}`,
    passageZh: `学习新词的时候，我会先注意它出现的语境，再想一想自己什么时候会主动使用它。${word}不只是一个要记住的词，也是表达想法的工具。`,
    passageEn: `When learning a new word, I first notice the context where it appears, then think about when I would actively use it myself. "${english}" is not only something to memorize, but also a tool for expressing ideas.`,
    focusPhraseZh: `${word}不只是一个要记住的词`,
    focusPhraseEn: `${english} is not only something to memorize`,
    comprehensionCheck: `According to the passage, why is ${word} more than a vocabulary item to memorize?`,
    responsePrompt: `Write a short reflection using ${word} and one other HSK ${level} word you already know.`,
  };
}
