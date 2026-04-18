import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircle2 } from "lucide-react";

import { GuidanceBanner } from "@/components/patterns/guidance";
import { PriorityBadge, FocusWordStepBadge } from "@/components/patterns/status";
import { SectionCard } from "@/components/patterns/surfaces";

type LearnerScenario = {
  badge: string;
  summary: {
    description: string;
    completedText: string;
    helperText: string;
  };
  focus: {
    word: string;
    pinyin: string;
    english: string;
    reviewDone: boolean;
    studyDone: boolean;
    writeDone: boolean;
    patternText: string;
  };
  guidanceTone: "sky" | "amber" | "violet" | "emerald";
  guidanceTitle: string;
  guidanceItems: Array<{
    title: string;
    body: string;
    cta: string;
  }>;
  cards: Array<{
    index: number;
    title: string;
    value: string;
    body: string;
    cta: string;
    priority?: boolean;
    pending: boolean;
    focusWord: boolean;
  }>;
};

const meta = {
  title: "Product/Dashboard Cards",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function PracticeCard({
  title,
  value,
  body,
  cta,
  priority = false,
  index,
  pending,
  focusWord,
}: {
  index: number;
  title: string;
  value: string;
  body: string;
  cta: string;
  priority?: boolean;
  pending: boolean;
  focusWord: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        priority ? "border-[var(--cn-orange)]/25 bg-[var(--cn-orange-light)]/50" : "bg-card"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {index}. {title}
        </p>
        <div className="flex items-center gap-2 text-xs">
          <FocusWordStepBadge done={!pending} label={pending ? "Pending" : "Done"} />
          <FocusWordStepBadge done={focusWord} label="Focus word" />
        </div>
      </div>
      {priority ? <PriorityBadge /> : null}
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{body}</p>
      <p className="mt-4 text-sm font-medium text-[var(--cn-orange)]">{cta} →</p>
    </div>
  );
}

function DashboardCardsStory({ scenario }: { scenario: LearnerScenario }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Your learning progress at a glance.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
          {scenario.badge}
        </div>
      </div>

      <SectionCard
        title="Today's Practice"
        description={scenario.summary.description}
        icon={CheckCircle2}
      >
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-sm font-medium text-foreground">{scenario.summary.completedText}</p>
          <p className="mt-1 text-xs text-muted-foreground">{scenario.summary.helperText}</p>

          <div className="mt-3 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-background px-2.5 py-1 text-xs text-foreground shadow-sm">
              <span className="font-semibold text-[var(--cn-orange)]">{scenario.focus.word}</span>
              <span className="text-muted-foreground">{scenario.focus.pinyin}</span>
              <span className="text-muted-foreground/80">{scenario.focus.english}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="font-medium text-foreground/80">Today with {scenario.focus.word}:</span>
              <FocusWordStepBadge done={scenario.focus.reviewDone} label="Review" />
              <FocusWordStepBadge done={scenario.focus.studyDone} label="Study" />
              <FocusWordStepBadge done={scenario.focus.writeDone} label="Write" />
            </div>
            <p className="text-xs text-muted-foreground">{scenario.focus.patternText}</p>
          </div>

          <GuidanceBanner tone={scenario.guidanceTone} className="mt-4 px-4 py-4">
            <p className="text-sm font-medium text-foreground">{scenario.guidanceTitle}</p>
            <div className="mt-3 space-y-3 text-sm">
              {scenario.guidanceItems.map((item) => (
                <div key={item.title} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-muted-foreground">{item.body}</p>
                  </div>
                  <span className="font-medium text-[var(--cn-orange)]">{item.cta} →</span>
                </div>
              ))}
            </div>
          </GuidanceBanner>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {scenario.cards.map((card) => (
            <PracticeCard key={card.index} {...card} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

const newLearnerScenario: LearnerScenario = {
  badge: "New learner",
  summary: {
    description: "0 reviews · 0 entries · 0 guided responses",
    completedText: "0 of 3 steps completed",
    helperText: "This is your first practice loop. Start with a short review, then read one study item and write one guided response.",
  },
  focus: {
    word: "你",
    pinyin: "nǐ",
    english: "you",
    reviewDone: false,
    studyDone: false,
    writeDone: false,
    patternText: "7-day pattern: review 0/7, study 0/7, write 0/7.",
  },
  guidanceTone: "sky",
  guidanceTitle: "Start here",
  guidanceItems: [
    {
      title: "Review your first flashcards",
      body: "Warm up with a few due cards so the loop feels light.",
      cta: "Open flashcards",
    },
    {
      title: "Read one study item",
      body: "See 你 in context before you try writing with it.",
      cta: "Open study guide",
    },
  ],
  cards: [
    {
      index: 1,
      title: "Review",
      value: "3",
      body: "starter flashcards waiting for you",
      cta: "Open due reviews",
      priority: true,
      pending: true,
      focusWord: false,
    },
    {
      index: 2,
      title: "Study",
      value: "你",
      body: "Review how 你 appears in context.",
      cta: "Open study guide",
      pending: true,
      focusWord: false,
    },
    {
      index: 3,
      title: "Write",
      value: "短文",
      body: "Write your first guided sentence.",
      cta: "Start guided draft",
      pending: true,
      focusWord: false,
    },
  ],
};

const activeLearnerScenario: LearnerScenario = {
  badge: "Active learner",
  summary: {
    description: "2 reviews · 1 entry · 1 guided response",
    completedText: "2 of 3 steps completed",
    helperText: "You already reviewed and studied today. Finish the writing step to complete the loop.",
  },
  focus: {
    word: "六",
    pinyin: "liù",
    english: "six; 6",
    reviewDone: true,
    studyDone: true,
    writeDone: false,
    patternText: "7-day pattern: review 5/7, study 4/7, write 3/7.",
  },
  guidanceTone: "amber",
  guidanceTitle: "Still to do",
  guidanceItems: [
    {
      title: "Write with 六",
      body: "Use 六 (liu, six; 6) in a short guided response.",
      cta: "Open journal",
    },
    {
      title: "Reuse today’s study phrase",
      body: "Turn the phrase you just studied into your own sentence.",
      cta: "Open guided draft",
    },
  ],
  cards: [
    {
      index: 1,
      title: "Review",
      value: "Done",
      body: "You already cleared your due cards today.",
      cta: "Open due reviews",
      pending: false,
      focusWord: true,
    },
    {
      index: 2,
      title: "Study",
      value: "六",
      body: "You already studied 六 in context today.",
      cta: "Open study guide",
      pending: false,
      focusWord: true,
    },
    {
      index: 3,
      title: "Write",
      value: "1",
      body: "One short guided response still completes the loop.",
      cta: "Start guided draft",
      priority: true,
      pending: true,
      focusWord: false,
    },
  ],
};

const stuckLearnerScenario: LearnerScenario = {
  badge: "Stuck learner",
  summary: {
    description: "0 reviews · 0 entries · 0 guided responses",
    completedText: "0 of 3 steps completed",
    helperText: "This loop has been slipping. Clear the oldest review pressure first, then restart the study and writing rhythm.",
  },
  focus: {
    word: "爱",
    pinyin: "ài",
    english: "to love; affection",
    reviewDone: false,
    studyDone: false,
    writeDone: false,
    patternText: "7-day pattern: review 1/7, study 1/7, write 0/7.",
  },
  guidanceTone: "violet",
  guidanceTitle: "Needs attention",
  guidanceItems: [
    {
      title: "Clear overdue reviews",
      body: "8 due cards are piling up and will make new study feel heavier if ignored.",
      cta: "Open flashcards",
    },
    {
      title: "Restart with one study item",
      body: "Read 爱 in context once before trying to write again.",
      cta: "Open related study item",
    },
  ],
  cards: [
    {
      index: 1,
      title: "Review",
      value: "8",
      body: "overdue flashcards waiting for you",
      cta: "Open due reviews",
      priority: true,
      pending: true,
      focusWord: false,
    },
    {
      index: 2,
      title: "Study",
      value: "爱",
      body: "Revisit how 爱 appears in context.",
      cta: "Open study guide",
      pending: true,
      focusWord: false,
    },
    {
      index: 3,
      title: "Write",
      value: "0",
      body: "No guided response yet today.",
      cta: "Start guided draft",
      pending: true,
      focusWord: false,
    },
  ],
};

export const NewLearner: Story = {
  render: () => <DashboardCardsStory scenario={newLearnerScenario} />,
};

export const ActiveLearner: Story = {
  render: () => <DashboardCardsStory scenario={activeLearnerScenario} />,
};

export const StuckLearner: Story = {
  render: () => <DashboardCardsStory scenario={stuckLearnerScenario} />,
};
