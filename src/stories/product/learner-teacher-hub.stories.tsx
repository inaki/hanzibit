import type { Meta, StoryObj } from "@storybook/react";
import { BookOpenCheck, ClipboardList, Inbox, Users } from "lucide-react";

import { GuidanceBanner } from "@/components/patterns/guidance";
import { SummaryStatCard } from "@/components/patterns/metrics";
import { MetricPill } from "@/components/patterns/status";
import { SectionCard } from "@/components/patterns/surfaces";

type LearnerTeacherScenario = {
  badge: string;
  summary: {
    classes: number;
    assignments: number;
    pendingAssignments: number;
    inquiries: number;
    pendingInquiries: number;
    convertedInquiries: number;
  };
  guidanceTone: "sky" | "amber" | "violet" | "emerald";
  guidanceTitle: string;
  guidanceBody: string;
  actions: Array<{
    title: string;
    body: string;
    cta: string;
  }>;
};

const meta = {
  title: "Product/Learner Teacher Hub",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-2xl bg-[var(--cn-orange)]/10 p-3 text-[var(--cn-orange)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function LearnerTeacherHubStory({ scenario }: { scenario: LearnerTeacherScenario }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teacher</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Keep teacher-guided work separate from solo study, while still making assignments, classes, and outreach
            easy to manage.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
          {scenario.badge}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Classes"
          value={scenario.summary.classes}
          description="Classrooms where a teacher is guiding your work."
          icon={Users}
        />
        <SummaryCard
          label="Assignments"
          value={scenario.summary.assignments}
          description={
            scenario.summary.pendingAssignments > 0
              ? `${scenario.summary.pendingAssignments} still need your attention.`
              : "No assignment pressure right now."
          }
          icon={ClipboardList}
        />
        <SummaryCard
          label="Inquiries"
          value={scenario.summary.inquiries}
          description={
            scenario.summary.convertedInquiries > 0
              ? `${scenario.summary.convertedInquiries} already turned into a classroom or tutoring relationship.`
              : "Track teacher outreach before it becomes a classroom."
          }
          icon={Inbox}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
        <SectionCard title="Guided Learning" icon={BookOpenCheck}>
          <div className="flex flex-wrap gap-2">
            <MetricPill label={`${scenario.summary.pendingAssignments} assignments to do`} tone="amber" />
            <MetricPill label={`${scenario.summary.pendingInquiries} live inquiries`} tone="sky" />
            <MetricPill label={`${scenario.summary.convertedInquiries} converted`} tone="emerald" />
          </div>

          <GuidanceBanner tone={scenario.guidanceTone} className="mt-4">
            <p className="text-sm font-medium text-foreground">{scenario.guidanceTitle}</p>
            <p className="mt-2 text-sm">{scenario.guidanceBody}</p>
          </GuidanceBanner>

          <div className="mt-4 grid gap-3">
            {scenario.actions.map((action) => (
              <div key={action.title} className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{action.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{action.body}</p>
                  </div>
                  <span className="text-sm font-medium text-[var(--cn-orange)]">{action.cta} →</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Current Signals" icon={Users}>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <SummaryStatCard label="Pending assignments" value={scenario.summary.pendingAssignments} tone="amber" />
            <SummaryStatCard label="Pending inquiries" value={scenario.summary.pendingInquiries} tone="sky" />
            <SummaryStatCard label="Converted inquiries" value={scenario.summary.convertedInquiries} tone="emerald" />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

const newConnectionScenario: LearnerTeacherScenario = {
  badge: "Exploring teacher support",
  summary: {
    classes: 0,
    assignments: 0,
    pendingAssignments: 0,
    inquiries: 1,
    pendingInquiries: 1,
    convertedInquiries: 0,
  },
  guidanceTone: "sky",
  guidanceTitle: "Your first teacher connection is in progress",
  guidanceBody:
    "You do not have classroom work yet. Use this space to track inquiry status and know when a teacher connection turns into active guided learning.",
  actions: [
    {
      title: "Check inquiry status",
      body: "See whether your teacher has accepted or declined your request.",
      cta: "Open inquiries",
    },
    {
      title: "Keep your solo study moving",
      body: "Your notebook and study guide stay separate from teacher workflows until a real relationship exists.",
      cta: "Open notebook",
    },
  ],
};

const activeStudentScenario: LearnerTeacherScenario = {
  badge: "Guided learner",
  summary: {
    classes: 2,
    assignments: 4,
    pendingAssignments: 2,
    inquiries: 2,
    pendingInquiries: 0,
    convertedInquiries: 1,
  },
  guidanceTone: "amber",
  guidanceTitle: "Teacher-guided work is active",
  guidanceBody:
    "You have live classroom work and at least one active tutoring relationship. Focus on assignments first, then check classes for shared context and teacher guidance.",
  actions: [
    {
      title: "Finish your pending assignments",
      body: "Two assignments still need your attention before the next review cycle.",
      cta: "Open assignments",
    },
    {
      title: "Review classroom guidance",
      body: "Use classes when you need context, roster visibility, or private tutoring onboarding details.",
      cta: "Open classes",
    },
  ],
};

const convertedPrivateScenario: LearnerTeacherScenario = {
  badge: "Private tutoring active",
  summary: {
    classes: 1,
    assignments: 3,
    pendingAssignments: 1,
    inquiries: 3,
    pendingInquiries: 0,
    convertedInquiries: 2,
  },
  guidanceTone: "emerald",
  guidanceTitle: "Private tutoring is already established",
  guidanceBody:
    "At least one inquiry has already become a private classroom. This area should now help you keep tutoring work organized without crowding your solo-study navigation.",
  actions: [
    {
      title: "Open your private classroom",
      body: "See your current assignment, next-step guidance, and recent teacher follow-through.",
      cta: "Open classes",
    },
    {
      title: "Track converted teacher relationships",
      body: "Keep inquiries visible for history, but use classes and assignments as the main active workspace.",
      cta: "Open inquiries",
    },
  ],
};

export const NewConnection: Story = {
  render: () => <LearnerTeacherHubStory scenario={newConnectionScenario} />,
};

export const ActiveStudent: Story = {
  render: () => <LearnerTeacherHubStory scenario={activeStudentScenario} />,
};

export const ConvertedPrivateTutoring: Story = {
  render: () => <LearnerTeacherHubStory scenario={convertedPrivateScenario} />,
};
