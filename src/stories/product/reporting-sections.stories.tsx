import type { Meta, StoryObj } from "@storybook/react";
import { AlertTriangle, BarChart3 } from "lucide-react";

import { EmptyStateNotice } from "@/components/patterns/guidance";
import {
  ActionRow,
  CompactBadgeRow,
  CompactStatCard,
  HealthRow,
  SummaryStatCard,
} from "@/components/patterns/metrics";
import { OverviewMetric } from "@/components/patterns/reporting";
import { MetricPill, PriorityPill } from "@/components/patterns/status";

type ReportingScenario = {
  badge: string;
  classrooms: number;
  students: number;
  privateLearners: number;
  operatingMode: string;
  priority: {
    waitingReview: number;
    reviewDueNow: number;
    reviewOverdue: number;
    missingWork: number;
    overduePlans: number;
    noNextPlan: number;
  };
  reviewActions: {
    resetNow: number;
    rebalance: number;
    simplifyNow: number;
    stableToMaintain: number;
  };
  health: {
    issueClusters: number;
    issueSupportGaps: number;
    learnersWithoutPath: number;
    playbookGaps: string | number;
    weakStrategies: string | number;
    pathIntegrity: string;
    workloadTone: "muted" | "rose" | "amber" | "emerald" | "sky" | "violet";
    workloadLabel: string;
  };
  stabilization: {
    stableLearners: number;
    simplifySupport: number;
    handoffReady: number;
  };
  urgentActions: {
    total: number;
    heading: string;
    body: string;
  };
  followThrough: Array<{
    title: string;
    level: "urgent" | "high" | "watch";
    note: string;
  }>;
};

const meta = {
  title: "Product/Reporting Sections",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ReportingSectionsStory({ scenario }: { scenario: ReportingScenario }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reporting</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Track classroom health, review pressure, support quality, and private learner follow-through from one
            denser operational view.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
          {scenario.badge}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_300px]">
        <section className="space-y-6">
          <div className="rounded-3xl border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Core Portfolio Overview
                </p>
                <div className="mt-4 flex flex-wrap gap-8">
                  <OverviewMetric label="Classrooms" value={scenario.classrooms} />
                  <OverviewMetric label="Students" value={scenario.students} />
                  <OverviewMetric label="Private learners" value={scenario.privateLearners} />
                </div>
              </div>
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Operating mode
                </p>
                <p className="mt-1 text-lg font-semibold capitalize text-foreground">{scenario.operatingMode}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-3xl border bg-card p-6">
              <div className="mb-5 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Priority & Rhythm
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <CompactStatCard label="Waiting review" value={scenario.priority.waitingReview} tone="sky" />
                <CompactStatCard label="Review due now" value={scenario.priority.reviewDueNow} tone="amber" />
                <CompactStatCard label="Review overdue" value={scenario.priority.reviewOverdue} tone="rose" />
                <CompactStatCard label="Missing work" value={scenario.priority.missingWork} tone="rose" />
                <CompactStatCard label="Overdue plans" value={scenario.priority.overduePlans} tone="amber" />
                <CompactStatCard label="No next plan" value={scenario.priority.noNextPlan} tone="rose" />
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/[0.08] p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Review Actions
                </h2>
              </div>
              <div className="space-y-3">
                <ActionRow label="Reset now" value={scenario.reviewActions.resetNow} tone="rose" />
                <ActionRow label="Rebalance" value={scenario.reviewActions.rebalance} tone="amber" />
                <ActionRow label="Simplify now" value={scenario.reviewActions.simplifyNow} tone="sky" />
                <ActionRow label="Stable to maintain" value={scenario.reviewActions.stableToMaintain} tone="emerald" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Workload & Support Health
              </h2>
              <MetricPill label={scenario.health.workloadLabel} tone={scenario.health.workloadTone} />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(220px,0.85fr)]">
              <div className="space-y-4">
                <HealthRow label="Issue clusters" value={scenario.health.issueClusters} tone="amber" />
                <HealthRow label="Issue support gaps" value={scenario.health.issueSupportGaps} tone="rose" />
                <HealthRow label="Learners w/o path" value={scenario.health.learnersWithoutPath} tone="rose" />
              </div>
              <div className="space-y-3">
                <CompactBadgeRow
                  label="Playbook gaps"
                  value={scenario.health.playbookGaps}
                  tone={scenario.health.playbookGaps === "None" ? "muted" : "rose"}
                />
                <CompactBadgeRow
                  label="Weak strategies"
                  value={scenario.health.weakStrategies}
                  tone={scenario.health.weakStrategies === "None" ? "muted" : "amber"}
                />
                <CompactBadgeRow label="Path integrity" value={scenario.health.pathIntegrity} tone="sky" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Stabilization & Handoff
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <SummaryStatCard label="Stable learners" value={scenario.stabilization.stableLearners} tone="emerald" />
              <SummaryStatCard label="Simplify support" value={scenario.stabilization.simplifySupport} tone="amber" />
              <SummaryStatCard label="Handoff-ready" value={scenario.stabilization.handoffReady} tone="sky" />
            </div>
            <div className="mt-4 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              Handoff-ready means the learner may be stable enough for lower-intensity monitoring. Maintain caution
              before shifting tiers.
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/[0.08] p-5">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Urgent Actions
              </h2>
            </div>
            <EmptyStateNotice className="rounded-2xl border-[var(--cn-orange)]/20 bg-card/60 text-center">
              <p className="text-3xl font-bold text-foreground">{scenario.urgentActions.total}</p>
              <p className="mt-2 text-sm font-medium text-foreground">{scenario.urgentActions.heading}</p>
              <p className="mt-2 text-xs text-muted-foreground">{scenario.urgentActions.body}</p>
            </EmptyStateNotice>
            <div className="mt-4 border-l-2 border-[var(--cn-orange)]/60 pl-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Next scheduled sync
              </p>
              <p className="mt-1 font-medium text-foreground">Tomorrow, 09:00 AM</p>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--cn-orange)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Priority Follow-Through
              </h2>
            </div>
            <div className="space-y-3">
              {scenario.followThrough.map((item) => (
                <div key={item.title} className="rounded-2xl border bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <PriorityPill level={item.level} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const healthyScenario: ReportingScenario = {
  badge: "Healthy reporting state",
  classrooms: 3,
  students: 12,
  privateLearners: 4,
  operatingMode: "balanced",
  priority: {
    waitingReview: 1,
    reviewDueNow: 1,
    reviewOverdue: 0,
    missingWork: 0,
    overduePlans: 0,
    noNextPlan: 0,
  },
  reviewActions: {
    resetNow: 0,
    rebalance: 1,
    simplifyNow: 1,
    stableToMaintain: 5,
  },
  health: {
    issueClusters: 1,
    issueSupportGaps: 0,
    learnersWithoutPath: 0,
    playbookGaps: "None",
    weakStrategies: "None",
    pathIntegrity: "96%",
    workloadTone: "emerald",
    workloadLabel: "healthy",
  },
  stabilization: {
    stableLearners: 6,
    simplifySupport: 2,
    handoffReady: 1,
  },
  urgentActions: {
    total: 1,
    heading: "Light follow-through",
    body: "Most current support is healthy. One learner or assignment still needs near-term attention.",
  },
  followThrough: [
    {
      title: "One learner is ready for a lighter support tier",
      level: "watch",
      note: "Recent review and adaptation are in place. Simplify support if the next checkpoint stays stable.",
    },
    {
      title: "Homework follow-through cluster should be rechecked",
      level: "watch",
      note: "1 learner affected • current strategy appears to be helping broadly.",
    },
  ],
};

const stretchedScenario: ReportingScenario = {
  badge: "Stretched reporting state",
  classrooms: 4,
  students: 18,
  privateLearners: 6,
  operatingMode: "balanced",
  priority: {
    waitingReview: 3,
    reviewDueNow: 4,
    reviewOverdue: 1,
    missingWork: 2,
    overduePlans: 2,
    noNextPlan: 1,
  },
  reviewActions: {
    resetNow: 1,
    rebalance: 3,
    simplifyNow: 2,
    stableToMaintain: 4,
  },
  health: {
    issueClusters: 4,
    issueSupportGaps: 2,
    learnersWithoutPath: 1,
    playbookGaps: 2,
    weakStrategies: 1,
    pathIntegrity: "82%",
    workloadTone: "amber",
    workloadLabel: "stretched",
  },
  stabilization: {
    stableLearners: 7,
    simplifySupport: 3,
    handoffReady: 2,
  },
  urgentActions: {
    total: 6,
    heading: "Action needed",
    body: "Waiting review, missing work, overdue checkpoints, or reset-level learners still need follow-through.",
  },
  followThrough: [
    {
      title: "Blocked goals across tone practice cluster",
      level: "urgent",
      note: "3 learners affected • no playbook yet.",
    },
    {
      title: "Sentence rebuild strategy is mixed across learners",
      level: "high",
      note: "Used by 4 learners • latest outcome was partial.",
    },
    {
      title: "Homework follow-through cluster needs recheck",
      level: "watch",
      note: "2 learners affected • latest support path is weak.",
    },
  ],
};

const overloadedScenario: ReportingScenario = {
  badge: "Overloaded reporting state",
  classrooms: 6,
  students: 28,
  privateLearners: 11,
  operatingMode: "active heavy",
  priority: {
    waitingReview: 7,
    reviewDueNow: 8,
    reviewOverdue: 5,
    missingWork: 6,
    overduePlans: 5,
    noNextPlan: 4,
  },
  reviewActions: {
    resetNow: 4,
    rebalance: 6,
    simplifyNow: 3,
    stableToMaintain: 2,
  },
  health: {
    issueClusters: 8,
    issueSupportGaps: 6,
    learnersWithoutPath: 4,
    playbookGaps: 5,
    weakStrategies: 4,
    pathIntegrity: "61%",
    workloadTone: "rose",
    workloadLabel: "overloaded",
  },
  stabilization: {
    stableLearners: 2,
    simplifySupport: 1,
    handoffReady: 0,
  },
  urgentActions: {
    total: 22,
    heading: "Immediate follow-through required",
    body: "Multiple learners, support paths, and checkpoints are stacked enough that the current cycle looks overloaded.",
  },
  followThrough: [
    {
      title: "Multiple private learners have blocked goals with no recent adaptation",
      level: "urgent",
      note: "5 learners affected • repeated pressure is clustering in the same support path.",
    },
    {
      title: "Current playbook is weak across learners and needs replacement",
      level: "urgent",
      note: "Used by 6 learners • outcome pattern is mostly no_change or replace.",
    },
    {
      title: "Recurring confidence + consistency issues have no support path",
      level: "high",
      note: "4 learners affected • no linked strategy or playbook yet.",
    },
  ],
};

export const Healthy: Story = {
  render: () => <ReportingSectionsStory scenario={healthyScenario} />,
};

export const Stretched: Story = {
  render: () => <ReportingSectionsStory scenario={stretchedScenario} />,
};

export const Overloaded: Story = {
  render: () => <ReportingSectionsStory scenario={overloadedScenario} />,
};
