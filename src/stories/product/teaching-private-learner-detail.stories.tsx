import type { Meta, StoryObj } from "@storybook/react";
import { MessageSquareMore, Repeat2, Users } from "lucide-react";

import {
  TeachingCollectionSection,
  TeachingExplainerBlock,
  TeachingPageHeader,
  TeachingToneMetricCard,
} from "@/components/patterns/teaching";

const meta = {
  title: "Product/Teaching Private Learner Detail",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function StatusPill({ label, tone }: { label: string; tone: "orange" | "amber" | "sky" | "rose" | "emerald" }) {
  const toneMap = {
    orange: "border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 text-[var(--cn-orange)]",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    sky: "border-sky-500/20 bg-sky-500/10 text-sky-400",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-300",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  } as const;

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${toneMap[tone]}`}>
      {label}
    </span>
  );
}

function FakeInput({ label, textarea = false }: { label: string; textarea?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="text-sm font-medium text-foreground/80">{label}</div>
      <div className={textarea ? "h-24 rounded-lg border bg-background" : "h-11 rounded-lg border bg-background"} />
    </div>
  );
}

function PrivateLearnerDetailStory() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4">
      <TeachingPageHeader
        title="Marina Soto"
        description="Beginner Tutoring · marina@example.com"
        badge={
          <div className="flex items-center gap-2">
            <StatusPill label="Awaiting student" tone="sky" />
            <a href="#" className="inline-flex items-center text-xs font-medium">
              Back to Private Learners
            </a>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <TeachingToneMetricCard title="Submissions" value={4} tone="muted" />
        <TeachingToneMetricCard title="Awaiting review" value={1} tone="sky" />
        <TeachingToneMetricCard title="Active goals" value={2} tone="emerald" />
        <TeachingToneMetricCard title="Last activity" value="04/17/2026" tone="muted" />
      </div>

      <TeachingExplainerBlock tone="amber">
        You are waiting on learner follow-through. Keep the next assignment narrow and avoid adding extra support layers until the current step is complete.
      </TeachingExplainerBlock>
      <TeachingExplainerBlock tone="sky">
        The next lesson is tied to a short guided writing task due tomorrow. Keep the lesson focus aligned with that one assignment.
      </TeachingExplainerBlock>
      <TeachingExplainerBlock tone="violet">
        A recent review exists, but the plan still needs adaptation. Use the review summary and blocked-goal context below to tighten the next lesson.
      </TeachingExplainerBlock>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="space-y-6">
          <TeachingCollectionSection title="Review Snapshot" icon={MessageSquareMore}>
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed p-4">
                <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                  <FakeInput label="Reviewed date" />
                  <FakeInput label="Summary" />
                </div>
                <div className="mt-4 grid gap-4">
                  <FakeInput label="What improved" textarea />
                  <FakeInput label="What needs change" textarea />
                </div>
                <button className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-[var(--cn-orange)] px-4 text-sm font-medium text-white">
                  Save review snapshot
                </button>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">Confidence is improving, but output still freezes when the task opens too wide.</p>
                  <span className="text-xs text-muted-foreground">04/16/2026</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Needs change: keep next tasks structured and reduce blank-page pressure.</p>
              </div>
            </div>
          </TeachingCollectionSection>

          <TeachingCollectionSection title="Apply Strategy" icon={Repeat2}>
            <div className="space-y-4">
              <TeachingExplainerBlock tone="sky">
                Latest strategy: Confidence ladder. Reapply a strategy only if the learner still needs a repeatable support response.
              </TeachingExplainerBlock>
              <div className="grid gap-4 md:grid-cols-2">
                <FakeInput label="Strategy" />
                <FakeInput label="Goal to connect" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FakeInput label="Plan status" />
                <FakeInput label="Target date" />
              </div>
              <FakeInput label="Application note" textarea />
              <button className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--cn-orange)] px-4 text-sm font-medium text-white">
                Apply strategy
              </button>
            </div>
          </TeachingCollectionSection>

          <TeachingCollectionSection title="Learner Goals" icon={Users}>
            <div className="space-y-3">
              <div className="rounded-xl border p-4">
                <div className="flex flex-wrap gap-2 text-xs">
                  <StatusPill label="Active" tone="emerald" />
                  <StatusPill label="Needs reinforcement" tone="amber" />
                </div>
                <p className="mt-3 font-semibold text-foreground">Build confidence in guided writing</p>
                <p className="mt-2 text-sm text-muted-foreground">Progress note: still improving, but free output becomes unstable without one anchor phrase.</p>
              </div>
              <div className="rounded-xl border border-dashed p-4">
                <FakeInput label="New goal" />
              </div>
            </div>
          </TeachingCollectionSection>
        </div>

        <aside className="space-y-6">
          <TeachingCollectionSection title="Context">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Classroom:</span> Beginner Tutoring</p>
              <p><span className="font-medium text-foreground">Current assignment:</span> Describe your family in 4 sentences</p>
              <p><span className="font-medium text-foreground">Conversion:</span> 04/10/2026</p>
              <p><span className="font-medium text-foreground">Next lesson plan:</span> Awaiting completion · 04/18/2026</p>
            </div>
          </TeachingCollectionSection>

          <TeachingCollectionSection title="Inquiry Context" icon={MessageSquareMore}>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-xl border bg-muted/20 p-4">
                I’m starting Chinese from zero and want steady accountability without getting overwhelmed.
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Onboarding message</p>
                <p className="mt-2">We’ll begin with one short assignment and one focused check-in so you can build confidence before expanding your output.</p>
              </div>
            </div>
          </TeachingCollectionSection>
        </aside>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <PrivateLearnerDetailStory />,
};
