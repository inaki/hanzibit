import type { Meta, StoryObj } from "@storybook/react";
import { AlertTriangle, FolderKanban, IdCard, Inbox, Share2, Users } from "lucide-react";

import { GuidanceBanner } from "@/components/patterns/guidance";
import { SummaryStatCard } from "@/components/patterns/metrics";
import { MetricPill } from "@/components/patterns/status";
import { SectionCard } from "@/components/patterns/surfaces";

type OverviewScenario = {
  badge: string;
  summary: {
    publicProfile: string;
    pendingInquiries: number;
    privateLearners: number;
    resources: number;
    classrooms: number;
    referredStudents: number;
  };
  followThrough: {
    urgent: number;
    high: number;
    watch: number;
  };
  workload: {
    state: string;
    urgentLearners: number;
    overdueCheckpoints: number;
    repeatedPressure: number;
    weakSupportPaths: number;
    note: string;
    tone: "healthy" | "stretched" | "overloaded";
  };
  reuse: {
    helping: boolean;
    mixed: boolean;
    weak: boolean;
    note: string;
  };
};

const meta = {
  title: "Product/Teaching Overview Blocks",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function SummaryLinkCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 text-[var(--cn-orange)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function WorkloadTonePill({ tone }: { tone: OverviewScenario["workload"]["tone"] }) {
  const toneMap = {
    healthy: { bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    stretched: { bg: "bg-amber-500/10", border: "border-amber-500/20" },
    overloaded: { bg: "bg-rose-500/10", border: "border-rose-500/20" },
  } as const;

  return (
    <div className={`rounded-xl border p-4 ${toneMap[tone].border} ${toneMap[tone].bg}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Load state</p>
      <p className="mt-2 text-xl font-bold capitalize text-foreground">{tone}</p>
    </div>
  );
}

function TeachingOverviewStory({ scenario }: { scenario: OverviewScenario }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teaching Workspace</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Manage your public profile, incoming inquiries, reusable teaching assets, classroom reporting, and
            referral growth from one place.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
          {scenario.badge}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryLinkCard label="Public profile" value={scenario.summary.publicProfile} icon={IdCard} />
        <SummaryLinkCard label="Pending inquiries" value={scenario.summary.pendingInquiries} icon={Inbox} />
        <SummaryLinkCard label="Private learners" value={scenario.summary.privateLearners} icon={Users} />
        <SummaryLinkCard label="Resources" value={scenario.summary.resources} icon={FolderKanban} />
        <SummaryLinkCard label="Classrooms" value={scenario.summary.classrooms} icon={Users} />
        <SummaryLinkCard label="Referred students" value={scenario.summary.referredStudents} icon={Share2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryStatCard label="Urgent follow-through" value={scenario.followThrough.urgent} tone="rose" />
        <SummaryStatCard label="High follow-through" value={scenario.followThrough.high} tone="amber" />
        <SummaryStatCard label="Watch list" value={scenario.followThrough.watch} tone="sky" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Workload Snapshot" icon={AlertTriangle}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <WorkloadTonePill tone={scenario.workload.tone} />
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Urgent learners</p>
              <p className="mt-2 text-xl font-bold text-foreground">{scenario.workload.urgentLearners}</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Overdue checkpoints
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">{scenario.workload.overdueCheckpoints}</p>
            </div>
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Repeated pressure</p>
              <p className="mt-2 text-xl font-bold text-foreground">{scenario.workload.repeatedPressure}</p>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Weak support paths
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">{scenario.workload.weakSupportPaths}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{scenario.workload.note}</p>
        </SectionCard>

        <SectionCard title="Strategy & Playbook Reuse" icon={FolderKanban}>
          <div className="flex flex-wrap gap-2">
            {scenario.reuse.helping ? <MetricPill label="Helping broadly" tone="emerald" /> : null}
            {scenario.reuse.mixed ? <MetricPill label="Mixed across learners" tone="amber" /> : null}
            {scenario.reuse.weak ? <MetricPill label="Weak across learners" tone="rose" /> : null}
            {!scenario.reuse.helping && !scenario.reuse.mixed && !scenario.reuse.weak ? (
              <MetricPill label="Not enough evidence yet" tone="muted" />
            ) : null}
          </div>
          <GuidanceBanner tone={scenario.reuse.weak ? "amber" : scenario.reuse.helping ? "sky" : "violet"} className="mt-4">
            <p className="text-sm">{scenario.reuse.note}</p>
          </GuidanceBanner>
        </SectionCard>
      </div>
    </div>
  );
}

const healthyScenario: OverviewScenario = {
  badge: "Healthy teaching state",
  summary: {
    publicProfile: "Live",
    pendingInquiries: 1,
    privateLearners: 4,
    resources: 8,
    classrooms: 3,
    referredStudents: 3,
  },
  followThrough: {
    urgent: 0,
    high: 2,
    watch: 3,
  },
  workload: {
    state: "healthy",
    urgentLearners: 0,
    overdueCheckpoints: 1,
    repeatedPressure: 1,
    weakSupportPaths: 0,
    note: "Your current learner base looks stable. You still have a few watch-level items, but nothing suggests overload.",
    tone: "healthy",
  },
  reuse: {
    helping: true,
    mixed: false,
    weak: false,
    note: "Your current support paths look healthy. Reuse is being supported by actual outcomes rather than guesswork.",
  },
};

const stretchedScenario: OverviewScenario = {
  badge: "Stretched teaching state",
  summary: {
    publicProfile: "Live",
    pendingInquiries: 3,
    privateLearners: 6,
    resources: 12,
    classrooms: 4,
    referredStudents: 5,
  },
  followThrough: {
    urgent: 3,
    high: 5,
    watch: 4,
  },
  workload: {
    state: "stretched",
    urgentLearners: 2,
    overdueCheckpoints: 3,
    repeatedPressure: 4,
    weakSupportPaths: 2,
    note: "You can still support your current learner base, but pressure is clustering enough that you should be cautious about adding more active support without rebalancing.",
    tone: "stretched",
  },
  reuse: {
    helping: true,
    mixed: true,
    weak: false,
    note: "Reuse is strongest when outcomes are recorded and weak strategies/playbooks are refined instead of reused blindly.",
  },
};

const overloadedScenario: OverviewScenario = {
  badge: "Overloaded teaching state",
  summary: {
    publicProfile: "Live",
    pendingInquiries: 6,
    privateLearners: 11,
    resources: 18,
    classrooms: 6,
    referredStudents: 7,
  },
  followThrough: {
    urgent: 8,
    high: 6,
    watch: 3,
  },
  workload: {
    state: "overloaded",
    urgentLearners: 5,
    overdueCheckpoints: 7,
    repeatedPressure: 6,
    weakSupportPaths: 4,
    note: "Support load is concentrated enough that the current portfolio likely needs simplification before you expand active support any further.",
    tone: "overloaded",
  },
  reuse: {
    helping: false,
    mixed: true,
    weak: true,
    note: "Several reused strategies and playbooks are weak or mixed across learners. Refinement should happen before more reuse.",
  },
};

export const Healthy: Story = {
  render: () => <TeachingOverviewStory scenario={healthyScenario} />,
};

export const Stretched: Story = {
  render: () => <TeachingOverviewStory scenario={stretchedScenario} />,
};

export const Overloaded: Story = {
  render: () => <TeachingOverviewStory scenario={overloadedScenario} />,
};
