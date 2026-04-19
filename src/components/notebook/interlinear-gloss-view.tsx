"use client";
import type { GlossParagraph, GlossSegment } from "@/lib/gloss";
import { summarizeEnglishGloss } from "@/lib/annotation-suggestions";
import { AudioPlayButton } from "./audio-play-button";

interface InterlinearGlossViewProps {
  paragraphs: GlossParagraph[];
}

function buildReadableSentenceEnglish(segments: GlossParagraph): string {
  const glosses = (Array.isArray(segments) ? segments : []).filter(
    (seg): seg is Extract<GlossSegment, { type: "gloss" }> => seg.type === "gloss"
  );

  const hanziLine = glosses.map((seg) => seg.token.hanzi).join("").trim();
  const englishLine = glosses
    .map((seg) => seg.token.english)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!hanziLine) return englishLine;

  const compactEnglishFor = (word: string): string => {
    const token = glosses.find((seg) => seg.token.hanzi === word);
    return token?.token.english || word;
  };

  const quotedWordMeaning = (word: string): string => {
    const compact = summarizeEnglishGloss(compactEnglishFor(word)) || compactEnglishFor(word);
    return `"${compact.replace(/^to\s+/i, "").trim()}"`;
  };

  const useInShortSentenceMatch = hanziLine.match(/^用(.+)写一个短句$/);
  if (useInShortSentenceMatch) {
    const word = useInShortSentenceMatch[1];
    return `Use ${quotedWordMeaning(word)} in a short sentence.`;
  }

  const importantMatch = hanziLine.match(/^老师说[“"]?(.+?)[”"]?很重要$/);
  if (importantMatch) {
    const word = importantMatch[1];
    return `${quotedWordMeaning(word)} is important.`;
  }

  const studiedMatch = hanziLine.match(/^今天我学习(.+)$/);
  if (studiedMatch) {
    const word = studiedMatch[1];
    return `Today I studied ${quotedWordMeaning(word)}.`;
  }

  const afterClassMatch = hanziLine.match(/^我回家以后用(.+)写一个短句$/);
  if (afterClassMatch) {
    const word = afterClassMatch[1];
    return `After going home, I used ${quotedWordMeaning(word)} in a short sentence.`;
  }

  return englishLine;
}

function GlossWord({
  segment,
}: {
  segment: GlossSegment & { type: "gloss" };
}) {
  const { token } = segment;
  return (
    <span
      data-testid={`gloss-word-${token.hanzi}`}
      className="group inline-flex flex-col items-center mx-1.5 my-1"
    >
      <span className="relative inline-flex items-center justify-center">
        <span
          className={`text-[26px] font-bold leading-none ${
            token.userAnnotated
              ? "text-[var(--cn-orange)]"
              : "text-foreground"
          }`}
        >
          {token.hanzi}
        </span>
        <span className="absolute -right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <AudioPlayButton text={token.hanzi} type="word" size="sm" />
        </span>
      </span>
      <span className="font-mono text-[11px] leading-tight text-muted-foreground mt-0.5">{token.pinyin}</span>
      <span className="text-[10px] leading-tight text-muted-foreground/70 mt-px">{token.english}</span>
    </span>
  );
}

function GlossPunctuation({ char }: { char: string }) {
  return (
    <span className="inline-flex items-end mx-0.5 self-start">
      <span className="text-[26px] leading-none text-foreground/90">{char}</span>
    </span>
  );
}

export function InterlinearGlossView({
  paragraphs,
}: InterlinearGlossViewProps) {
  const safeParagraphs = Array.isArray(paragraphs) ? paragraphs : [];

  return (
    <div data-testid="interlinear-gloss-view" className="space-y-6">
      {safeParagraphs.map((segments, pi) => (
        <div key={pi} className="space-y-3">
          <div className="flex flex-wrap items-end gap-y-4">
            {(Array.isArray(segments) ? segments : []).map((seg, si) => {
              if (seg.type === "break") return <div key={si} className="w-full" />;
              if (seg.type === "punctuation") return <GlossPunctuation key={si} char={seg.char} />;
              return <GlossWord key={si} segment={seg} />;
            })}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {buildReadableSentenceEnglish(segments)}
          </p>
        </div>
      ))}
    </div>
  );
}
