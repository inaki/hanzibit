"use client";

import type { GlossParagraph, GlossSegment } from "@/lib/gloss";

interface InterlinearGlossViewProps {
  paragraphs: GlossParagraph[];
}

function GlossWord({ segment }: { segment: GlossSegment & { type: "gloss" } }) {
  const { token } = segment;
  return (
    <span
      data-testid={`gloss-word-${token.hanzi}`}
      className="inline-flex flex-col items-center mx-1 my-1"
    >
      <span
        className={`text-[22px] font-bold leading-tight ${
          token.userAnnotated
            ? "text-[var(--cn-orange)]"
            : "text-gray-900"
        }`}
      >
        {token.hanzi}
      </span>
      <span className="text-xs leading-tight text-gray-500">{token.pinyin}</span>
      <span className="text-[10px] leading-tight text-gray-400">{token.english}</span>
    </span>
  );
}

function GlossPunctuation({ char }: { char: string }) {
  return (
    <span className="inline-flex items-end mx-0.5 self-start">
      <span className="text-[22px] leading-tight text-gray-800">{char}</span>
    </span>
  );
}

export function InterlinearGlossView({ paragraphs }: InterlinearGlossViewProps) {
  return (
    <div data-testid="interlinear-gloss-view" className="space-y-6">
      {paragraphs.map((segments, pi) => (
        <div key={pi} className="flex flex-wrap items-end">
          {segments.map((seg, si) => {
            if (seg.type === "break") return <div key={si} className="w-full" />;
            if (seg.type === "punctuation") return <GlossPunctuation key={si} char={seg.char} />;
            return <GlossWord key={si} segment={seg} />;
          })}
        </div>
      ))}
    </div>
  );
}
