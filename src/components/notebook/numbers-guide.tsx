"use client";

import { useState } from "react";
import { Info, Calculator } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- Data ---

const FOUNDATION = [
  { num: 1, char: "一", pinyin: "yī" },
  { num: 2, char: "二", pinyin: "èr" },
  { num: 3, char: "三", pinyin: "sān" },
  { num: 4, char: "四", pinyin: "sì" },
  { num: 5, char: "五", pinyin: "wǔ" },
  { num: 6, char: "六", pinyin: "liù" },
  { num: 7, char: "七", pinyin: "qī" },
  { num: 8, char: "八", pinyin: "bā" },
  { num: 9, char: "九", pinyin: "jiǔ" },
  { num: 10, char: "十", pinyin: "shí" },
];

const TEEN_EXAMPLES = [
  { num: 11, chars: "十一", pinyin: "shí yī" },
  { num: 15, chars: "十五", pinyin: "shí wǔ" },
  { num: 19, chars: "十九", pinyin: "shí jiǔ" },
];

const MULTIPLES = [
  { label: "20 (2 × 10)", chars: "二十", pinyin: "èr shí" },
  { label: "50 (5 × 10)", chars: "五十", pinyin: "wǔ shí" },
];

const COMBINATIONS = [
  { label: "21 (20 + 1)", chars: "二十一", pinyin: "èr shí yī" },
  { label: "99 (90 + 9)", chars: "九十九", pinyin: "jiǔ shí jiǔ" },
];

const LARGE_NUMBERS = [
  { number: "100", char: "百", pinyin: "bǎi", logic: 'The "hundred" unit' },
  { number: "1,000", char: "千", pinyin: "qiān", logic: 'The "thousand" unit' },
  { number: "1,0000 (10k)", char: "万", pinyin: "wàn", logic: 'The "myriad" (base 4-zero unit)' },
  { number: "100,0000 (1M)", char: "百万", pinyin: "bǎi wàn", logic: "100 × 10,000" },
  { number: "1,0000,0000 (100M)", char: "亿", pinyin: "yì", logic: "The next level (8 zeros)" },
];

// --- Components ---

function SectionNumber({ n }: { n: number }) {
  return (
    <span className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
      {n}
    </span>
  );
}

function FoundationSection() {
  return (
    <section data-testid="numbers-foundation">
      <div className="mb-4 flex items-center gap-3">
        <SectionNumber n={1} />
        <h2 className="text-xl font-bold text-foreground">The Foundation (1–10)</h2>
      </div>
      <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
        {FOUNDATION.map((item) => (
          <div
            key={item.num}
            data-testid={`number-card-${item.num}`}
            className="flex flex-col items-center rounded-xl bg-card card-ring p-3 shadow-sm"
          >
            <span className="ui-tone-orange-panel ui-tone-orange-text mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold">
              {item.num}
            </span>
            <span className="text-2xl font-bold text-foreground">{item.char}</span>
            <span className="mt-1 text-xs text-muted-foreground">{item.pinyin}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TeensSection() {
  return (
    <section data-testid="numbers-teens">
      <div className="mb-4 flex items-center gap-3">
        <SectionNumber n={2} />
        <h2 className="text-xl font-bold text-foreground">The Logic of Teens (11–19)</h2>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="ui-tone-orange-panel flex-1 rounded-xl border-l-4 border-[var(--ui-tone-orange-border)] p-5">
          <p className="text-sm font-bold text-foreground">Pattern: 10 + N</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Numbers from 11 to 19 are formed by taking &lsquo;10&rsquo; (十) and adding the single digit (1-9) after it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {TEEN_EXAMPLES.map((ex) => (
            <div key={ex.num} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground/70">{ex.num}:</span>
              <span className="ui-tone-orange-text text-lg font-bold">{ex.chars}</span>
              <span className="text-xs text-muted-foreground">{ex.pinyin}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PatternCard({
  title,
  description,
  examples,
}: {
  title: string;
  description: string;
  examples: { label: string; chars: string; pinyin: string }[];
}) {
  return (
    <div className="flex-1 rounded-xl bg-card card-ring p-5">
      <p className="text-sm font-bold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 space-y-3">
        {examples.map((ex) => (
          <div key={ex.label} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{ex.label}</span>
            <div className="flex items-center gap-2">
              <span className="ui-tone-orange-text text-lg font-bold">{ex.chars}</span>
              <span className="text-xs text-muted-foreground">{ex.pinyin}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiplesSection() {
  return (
    <section data-testid="numbers-multiples">
      <div className="mb-4 flex items-center gap-3">
        <SectionNumber n={3} />
        <h2 className="text-xl font-bold text-foreground">Multiples & Combinations (20–99)</h2>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <PatternCard
          title="Pattern: N × 10"
          description="Multiples of ten are formed by placing the multiplier BEFORE the 10."
          examples={MULTIPLES}
        />
        <PatternCard
          title="Pattern: N × 10 + N"
          description="Combined numbers like 21 or 99 follow a predictable sequence."
          examples={COMBINATIONS}
        />
      </div>
    </section>
  );
}

function LargeNumbersSection() {
  return (
    <section data-testid="numbers-large">
      <div className="mb-4 flex items-center gap-3">
        <SectionNumber n={4} />
        <h2 className="text-xl font-bold text-foreground">Large Scale Numbers & The Myriad System</h2>
      </div>

      {/* Info callout */}
      <div className="bg-primary text-primary-foreground mb-6 rounded-xl p-5">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Info className="h-4 w-4" />
          The 4-Digit Grouping (Myriad)
        </p>
        <p className="mt-2 text-sm leading-relaxed text-primary-foreground/90">
          Unlike English, which groups numbers by thousands (3 zeros: 1,000), Mandarin fundamentally groups large numbers by{" "}
          <strong className="text-primary-foreground">ten-thousands</strong> (4 zeros). This unit is called 万 (wàn). When translating large numbers, always count in blocks of four digits from the right.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-card card-ring">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Number</th>
              <th className="px-5 py-3">Mandarin</th>
              <th className="px-5 py-3">Pinyin</th>
              <th className="px-5 py-3">Logic</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {LARGE_NUMBERS.map((row) => (
              <tr key={row.number} className="transition-colors hover:bg-muted/50">
                <td className="px-5 py-3 font-mono text-sm text-foreground/80">{row.number}</td>
                <td className="ui-tone-orange-text px-5 py-3 text-lg font-bold">{row.char}</td>
                <td className="px-5 py-3 text-sm italic text-muted-foreground">{row.pinyin}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{row.logic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// --- Number converter ---

const DIGITS: Record<number, { char: string; pinyin: string }> = {
  0: { char: "零", pinyin: "líng" },
  1: { char: "一", pinyin: "yī" },
  2: { char: "二", pinyin: "èr" },
  3: { char: "三", pinyin: "sān" },
  4: { char: "四", pinyin: "sì" },
  5: { char: "五", pinyin: "wǔ" },
  6: { char: "六", pinyin: "liù" },
  7: { char: "七", pinyin: "qī" },
  8: { char: "八", pinyin: "bā" },
  9: { char: "九", pinyin: "jiǔ" },
};

const UNITS: { value: number; char: string; pinyin: string }[] = [
  { value: 1_0000_0000, char: "亿", pinyin: "yì" },
  { value: 1_0000, char: "万", pinyin: "wàn" },
  { value: 1000, char: "千", pinyin: "qiān" },
  { value: 100, char: "百", pinyin: "bǎi" },
  { value: 10, char: "十", pinyin: "shí" },
];

interface NumberResult {
  hanzi: string;
  pinyin: string;
  english: string;
}

function convertNumber(n: number): NumberResult | null {
  if (!Number.isInteger(n) || n < 0 || n > 9_9999_9999_9999) return null;

  if (n === 0) return { hanzi: "零", pinyin: "líng", english: "zero" };

  const parts: { char: string; pinyin: string }[] = [];

  function process(num: number) {
    if (num === 0) return;

    for (const unit of UNITS) {
      if (num >= unit.value) {
        const quotient = Math.floor(num / unit.value);
        // For 亿 and 万, recurse since they can have compound multipliers
        if (unit.value >= 1_0000) {
          process(quotient);
        } else {
          parts.push(DIGITS[quotient]);
        }
        parts.push({ char: unit.char, pinyin: unit.pinyin });
        const remainder = num % unit.value;
        // Insert 零 if there's a gap (e.g., 101 = 一百零一)
        if (remainder > 0 && remainder < unit.value / 10) {
          parts.push(DIGITS[0]);
        }
        process(remainder);
        return;
      }
    }

    // Single digit
    if (num > 0 && num <= 9) {
      parts.push(DIGITS[num]);
    }
  }

  process(n);

  let hanzi = parts.map((p) => p.char).join("");
  let pinyin = parts.map((p) => p.pinyin).join(" ");

  // Convention: drop leading 一 before 十 for 10-19
  if (n >= 10 && n <= 19) {
    hanzi = hanzi.replace(/^一十/, "十");
    pinyin = pinyin.replace(/^yī shí/, "shí");
  }

  return { hanzi, pinyin, english: n.toLocaleString("en-US") };
}

function TryNumberDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const parsed = input.trim() ? parseInt(input.trim(), 10) : NaN;
  const result = !isNaN(parsed) ? convertNumber(parsed) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="try-number-dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Calculator className="ui-tone-orange-text mr-2 inline h-5 w-5" />
            Try Any Number
          </DialogTitle>
          <DialogDescription>
            Enter a number to see its Mandarin Chinese form.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Input
            data-testid="try-number-input"
            type="number"
            min={0}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a number, e.g. 42, 1234, 100000..."
            className="text-lg"
            autoFocus
          />
        </div>

        {result && (
          <div data-testid="try-number-result" className="rounded-xl bg-card card-ring p-6 text-center">
            <p className="ui-tone-orange-text text-4xl font-bold">
              {result.hanzi}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{result.pinyin}</p>
            <p className="mt-1 text-xs text-muted-foreground/70">{result.english}</p>
          </div>
        )}

        {input.trim() && !result && (
          <div className="rounded-xl border border-dashed border-border bg-muted/50 p-6 text-center">
            <p className="text-sm text-muted-foreground/70">
              {isNaN(parsed)
                ? "Please enter a valid number."
                : "Number out of range. Try 0 to 999,999,999,999."}
            </p>
          </div>
        )}

        {!input.trim() && (
          <div className="rounded-xl border border-dashed border-border bg-muted/50 p-6 text-center">
            <p className="text-sm text-muted-foreground/70">
              Type a number above to see the conversion.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- Main ---

export function NumbersGuide() {
  const [tryOpen, setTryOpen] = useState(false);

  return (
    <div data-testid="numbers-guide" className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">
          Mandarin Numbers: The Complete Logic Guide
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Master the systematic structure of Chinese numerals, from the basic foundation to large-scale myriad groupings.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-12">
        <FoundationSection />
        <TeensSection />
        <MultiplesSection />
        <LargeNumbersSection />
      </div>

      {/* Try any number */}
      <div className="mt-12 flex justify-center">
        <Button
          data-testid="try-number-button"
          onClick={() => setTryOpen(true)}
          className="bg-primary text-primary-foreground hover:opacity-90 px-8 py-3 text-base"
        >
          <Calculator className="mr-2 h-5 w-5" />
          Try Any Number
        </Button>
      </div>

      <TryNumberDialog open={tryOpen} onOpenChange={setTryOpen} />
    </div>
  );
}
