import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, ClipboardList } from "lucide-react";

import { GuidanceBanner } from "@/components/patterns/guidance";
import { SummaryStatCard } from "@/components/patterns/metrics";
import { MetricPill } from "@/components/patterns/status";
import { SectionCard } from "@/components/patterns/surfaces";

type AssignmentItem = {
  id: string;
  title: string;
  classroom: string;
  description?: string;
  type: string;
  hsk?: number;
  due: string;
  overdue?: boolean;
  status: {
    label: string;
    tone: "muted" | "sky" | "amber" | "emerald" | "rose";
  };
};

type LearnerAssignmentsScenario = {
  badge: string;
  summary: {
    total: number;
    needsAction: number;
    reviewed: number;
  };
  guidanceTone: "sky" | "amber" | "violet" | "emerald";
  guidanceTitle: string;
  guidanceBody: string;
  todo: AssignmentItem[];
  reviewed: AssignmentItem[];
};

const meta = {
  title: "Product/Learner Teacher Assignments",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function statusToneClass(tone: AssignmentItem["status"]["tone"]) {
  if (tone === "sky") return "border-sky-500/20 bg-sky-500/10 text-sky-400";
  if (tone === "amber") return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  if (tone === "emerald") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  if (tone === "rose") return "border-rose-500/20 bg-rose-500/10 text-rose-300";
  return "border-border bg-muted text-muted-foreground";
}

function AssignmentCard({ assignment }: { assignment: AssignmentItem }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[var(--cn-orange)]" />
            <h3 className="truncate text-lg font-semibold text-foreground">{assignment.title}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{assignment.classroom}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {assignment.type}
          </span>
          {assignment.overdue ? (
            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300">
              Overdue
            </span>
          ) : null}
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusToneClass(assignment.status.tone)}`}>
            {assignment.status.label}
          </span>
        </div>
      </div>

      {assignment.description ? (
        <p className="mt-3 text-sm text-muted-foreground">{assignment.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {assignment.hsk ? <span>HSK {assignment.hsk}</span> : null}
        <span className={assignment.overdue ? "text-rose-300" : undefined}>{assignment.due}</span>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--cn-orange)]">
        Open assignment
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
}

function LearnerAssignmentsStory({ scenario }: { scenario: LearnerAssignmentsScenario }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teacher Assignments</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            See the work your teachers assigned without leaving the notebook.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
          {scenario.badge}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryStatCard label="Total" value={scenario.summary.total} tone="sky" />
        <SummaryStatCard label="Needs action" value={scenario.summary.needsAction} tone="amber" />
        <SummaryStatCard label="Reviewed" value={scenario.summary.reviewed} tone="emerald" />
      </div>

      <SectionCard title="Assignment Focus" icon={ClipboardList}>
        <div className="flex flex-wrap gap-2">
          <MetricPill label={`${scenario.summary.needsAction} needs action`} tone="amber" />
          <MetricPill label={`${scenario.summary.reviewed} reviewed`} tone="emerald" />
        </div>

        <GuidanceBanner tone={scenario.guidanceTone} className="mt-4">
          <p className="text-sm font-medium text-foreground">{scenario.guidanceTitle}</p>
          <p className="mt-2 text-sm">{scenario.guidanceBody}</p>
        </GuidanceBanner>
      </SectionCard>

      <div className="space-y-8">
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">To do</p>
            <p className="mt-1 text-sm text-muted-foreground">Assignments you still need to complete.</p>
          </div>
          <div className="space-y-4">
            {scenario.todo.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </section>

        {scenario.reviewed.length > 0 ? (
          <section className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reviewed</p>
              <p className="mt-1 text-sm text-muted-foreground">Assignments that already completed the teacher review loop.</p>
            </div>
            <div className="space-y-4">
              {scenario.reviewed.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const firstAssignmentsScenario: LearnerAssignmentsScenario = {
  badge: "New guided work",
  summary: {
    total: 1,
    needsAction: 1,
    reviewed: 0,
  },
  guidanceTone: "sky",
  guidanceTitle: "Your first teacher assignment is ready",
  guidanceBody:
    "Start with the open assignment, then use classes only when you need broader context from your teacher space.",
  todo: [
    {
      id: "a1",
      title: "Use 爱 in 3 sentences",
      classroom: "HSK 1 Foundations",
      description: "Write 2 to 4 short sentences using 爱 at least once.",
      type: "journal prompt",
      hsk: 1,
      due: "Due Apr 25, 2026",
      status: { label: "Not started", tone: "muted" },
    },
  ],
  reviewed: [],
};

const activeAssignmentsScenario: LearnerAssignmentsScenario = {
  badge: "Guided work in progress",
  summary: {
    total: 4,
    needsAction: 2,
    reviewed: 2,
  },
  guidanceTone: "amber",
  guidanceTitle: "Focus on the next assignments first",
  guidanceBody:
    "Your teacher-guided work is already active. Finish pending assignments before digging into reviewed ones again.",
  todo: [
    {
      id: "a2",
      title: "Use 六 in a short guided response",
      classroom: "Daily Practice Support",
      description: "Turn today’s study word into your own short response.",
      type: "journal prompt",
      hsk: 1,
      due: "Due Apr 20, 2026",
      status: { label: "Draft started", tone: "amber" },
    },
    {
      id: "a3",
      title: "Review lesson 3 dialogue",
      classroom: "Private Tutoring",
      description: "Revisit the dialogue and answer the listening echo prompt.",
      type: "study review",
      hsk: 1,
      due: "Due Apr 22, 2026",
      status: { label: "Awaiting review", tone: "sky" },
    },
  ],
  reviewed: [
    {
      id: "a4",
      title: "Describe your family",
      classroom: "HSK 1 Foundations",
      description: "Write a short paragraph using family vocabulary.",
      type: "journal prompt",
      hsk: 1,
      due: "Reviewed Apr 14, 2026",
      status: { label: "Reviewed", tone: "emerald" },
    },
  ],
};

const overloadedAssignmentsScenario: LearnerAssignmentsScenario = {
  badge: "Needs attention",
  summary: {
    total: 5,
    needsAction: 4,
    reviewed: 1,
  },
  guidanceTone: "violet",
  guidanceTitle: "You have overdue guided work",
  guidanceBody:
    "Do not try to catch up everywhere at once. Start with the most overdue assignment, then return to the rest in order.",
  todo: [
    {
      id: "a5",
      title: "Retell the lesson story",
      classroom: "Private Tutoring",
      description: "Retell the mini-reading in your own words and reuse the target phrase.",
      type: "guided response",
      hsk: 1,
      due: "Due Apr 12, 2026",
      overdue: true,
      status: { label: "Not started", tone: "muted" },
    },
    {
      id: "a6",
      title: "Listening echo follow-up",
      classroom: "Daily Practice Support",
      description: "Respond to the listening line with a new example sentence.",
      type: "listening task",
      hsk: 1,
      due: "Due Apr 14, 2026",
      overdue: true,
      status: { label: "Draft started", tone: "amber" },
    },
  ],
  reviewed: [
    {
      id: "a7",
      title: "Introduce yourself",
      classroom: "HSK 1 Foundations",
      description: "Short self-introduction using basic greetings and nationality words.",
      type: "journal prompt",
      hsk: 1,
      due: "Reviewed Apr 10, 2026",
      status: { label: "Reviewed", tone: "emerald" },
    },
  ],
};

export const FirstAssignments: Story = {
  render: () => <LearnerAssignmentsStory scenario={firstAssignmentsScenario} />,
};

export const ActiveAssignments: Story = {
  render: () => <LearnerAssignmentsStory scenario={activeAssignmentsScenario} />,
};

export const OverloadedAssignments: Story = {
  render: () => <LearnerAssignmentsStory scenario={overloadedAssignmentsScenario} />,
};
