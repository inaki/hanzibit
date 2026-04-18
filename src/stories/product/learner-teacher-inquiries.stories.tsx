import type { Meta, StoryObj } from "@storybook/react";
import { Inbox } from "lucide-react";

import { GuidanceBanner } from "@/components/patterns/guidance";
import { SummaryStatCard } from "@/components/patterns/metrics";
import { MetricPill } from "@/components/patterns/status";
import { SectionCard } from "@/components/patterns/surfaces";

type InquiryItem = {
  id: string;
  teacherName: string;
  sentAt: string;
  message: string;
  status: "pending" | "accepted" | "converted" | "declined";
  onboardingMessage?: string;
  assignmentTitle?: string;
  hasClassroom?: boolean;
};

type LearnerInquiriesScenario = {
  badge: string;
  summary: {
    total: number;
    pending: number;
    converted: number;
  };
  guidanceTone: "sky" | "amber" | "violet" | "emerald";
  guidanceTitle: string;
  guidanceBody: string;
  inquiries: InquiryItem[];
};

const meta = {
  title: "Product/Learner Teacher Inquiries",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function StatusPill({ status }: { status: InquiryItem["status"] }) {
  const styles =
    status === "pending"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
      : status === "accepted"
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
        : status === "converted"
          ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
          : "border-rose-500/20 bg-rose-500/10 text-rose-500";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${styles}`}>
      {status}
    </span>
  );
}

function InquiryCard({ inquiry }: { inquiry: InquiryItem }) {
  return (
    <article className="rounded-2xl border bg-card p-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={inquiry.status} />
          {inquiry.status === "converted" ? (
            <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">
              Private tutoring
            </span>
          ) : null}
          <p className="text-sm font-semibold text-foreground">{inquiry.teacherName}</p>
        </div>
        <p className="text-sm text-muted-foreground">{inquiry.sentAt}</p>
        <div className="rounded-xl border bg-muted/30 p-4 text-sm text-foreground/85">
          {inquiry.message}
        </div>
        {inquiry.status === "converted" ? (
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm">
            <p className="font-semibold text-foreground">Private tutoring next steps</p>
            <p className="mt-1 text-muted-foreground">
              {inquiry.onboardingMessage ??
                (inquiry.assignmentTitle
                  ? `Your teacher has opened a private classroom and the first assignment is ready: ${inquiry.assignmentTitle}.`
                  : "Your teacher has opened a private classroom for you.")}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {inquiry.assignmentTitle ? (
                <span className="font-medium text-[var(--cn-orange)]">Open first assignment: {inquiry.assignmentTitle}</span>
              ) : null}
              {inquiry.hasClassroom ? (
                <span className="font-medium text-[var(--cn-orange)]">Open classroom</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function LearnerInquiriesStory({ scenario }: { scenario: LearnerInquiriesScenario }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teacher Inquiries</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Track outreach to teachers before it turns into a classroom or private tutoring relationship.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
          {scenario.badge}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryStatCard label="Total" value={scenario.summary.total} tone="sky" />
        <SummaryStatCard label="Pending" value={scenario.summary.pending} tone="amber" />
        <SummaryStatCard label="Converted" value={scenario.summary.converted} tone="emerald" />
      </div>

      <SectionCard title="Inquiry Focus" icon={Inbox}>
        <div className="flex flex-wrap gap-2">
          <MetricPill label={`${scenario.summary.pending} pending`} tone="amber" />
          <MetricPill label={`${scenario.summary.converted} converted`} tone="emerald" />
        </div>

        <GuidanceBanner tone={scenario.guidanceTone} className="mt-4">
          <p className="text-sm font-medium text-foreground">{scenario.guidanceTitle}</p>
          <p className="mt-2 text-sm">{scenario.guidanceBody}</p>
        </GuidanceBanner>
      </SectionCard>

      <div className="space-y-4">
        {scenario.inquiries.map((inquiry) => (
          <InquiryCard key={inquiry.id} inquiry={inquiry} />
        ))}
      </div>
    </div>
  );
}

const pendingScenario: LearnerInquiriesScenario = {
  badge: "Teacher outreach in progress",
  summary: {
    total: 1,
    pending: 1,
    converted: 0,
  },
  guidanceTone: "sky",
  guidanceTitle: "Your first inquiry is still pending",
  guidanceBody:
    "This space is mainly for tracking outreach. Once a teacher accepts and converts the relationship, classes and assignments become the active workspace.",
  inquiries: [
    {
      id: "i1",
      teacherName: "Ana Chen",
      sentAt: "Sent Apr 17, 2026",
      message: "Hi! I’m starting Chinese from zero and I’m looking for light weekly guidance.",
      status: "pending",
    },
  ],
};

const mixedScenario: LearnerInquiriesScenario = {
  badge: "Inquiries and tutoring mixed",
  summary: {
    total: 3,
    pending: 1,
    converted: 1,
  },
  guidanceTone: "amber",
  guidanceTitle: "One relationship is already active",
  guidanceBody:
    "Keep inquiries here for history and pending outreach, but use classes and assignments as the main place for active teacher-guided work.",
  inquiries: [
    {
      id: "i2",
      teacherName: "Liu Mei",
      sentAt: "Sent Apr 10, 2026",
      message: "I want help turning study-guide prompts into real writing practice.",
      status: "converted",
      onboardingMessage: "Your teacher has opened a private classroom and added a first journaling assignment.",
      assignmentTitle: "Use 爱 in 3 sentences",
      hasClassroom: true,
    },
    {
      id: "i3",
      teacherName: "Ana Chen",
      sentAt: "Sent Apr 17, 2026",
      message: "I’m also exploring whether a second teacher might be helpful for conversation confidence.",
      status: "pending",
    },
  ],
};

const convertedScenario: LearnerInquiriesScenario = {
  badge: "Private tutoring active",
  summary: {
    total: 2,
    pending: 0,
    converted: 2,
  },
  guidanceTone: "emerald",
  guidanceTitle: "Your inquiries already became guided learning",
  guidanceBody:
    "Use this page mostly as relationship history. Your active classroom and assignments are now the main work surfaces.",
  inquiries: [
    {
      id: "i4",
      teacherName: "Liu Mei",
      sentAt: "Sent Apr 10, 2026",
      message: "I want help turning study-guide prompts into real writing practice.",
      status: "converted",
      assignmentTitle: "Use 爱 in 3 sentences",
      hasClassroom: true,
    },
    {
      id: "i5",
      teacherName: "Wang Jun",
      sentAt: "Sent Apr 02, 2026",
      message: "I’d like support with confidence, repetition, and keeping a regular practice rhythm.",
      status: "converted",
      onboardingMessage: "Your teacher has created a private classroom and added a first check-in assignment.",
      assignmentTitle: "Introduce yourself in simple Chinese",
      hasClassroom: true,
    },
  ],
};

export const PendingOutreach: Story = {
  render: () => <LearnerInquiriesStory scenario={pendingScenario} />,
};

export const MixedState: Story = {
  render: () => <LearnerInquiriesStory scenario={mixedScenario} />,
};

export const ConvertedRelationships: Story = {
  render: () => <LearnerInquiriesStory scenario={convertedScenario} />,
};
