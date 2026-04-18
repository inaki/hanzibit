import type { Meta, StoryObj } from "@storybook/react";
import {
  AlertTriangle,
  BookOpen,
  BookText,
  CircleHelp,
  Languages,
  Sparkles,
  Users,
} from "lucide-react";

import { ActionRailButton } from "@/components/patterns/action-rail";
import { DialogFormActions, FormErrorNotice } from "@/components/patterns/forms";
import { EmptyStateNotice, GuidanceBanner } from "@/components/patterns/guidance";
import {
  ActionRow,
  CompactBadgeRow,
  CompactStatCard,
  HealthRow,
  SummaryMetric,
  SummaryStatCard,
} from "@/components/patterns/metrics";
import { OverviewMetric } from "@/components/patterns/reporting";
import { FocusWordStepBadge, MetricPill, PriorityBadge, PriorityPill } from "@/components/patterns/status";
import { InfoPanel, SectionCard } from "@/components/patterns/surfaces";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";

const meta = {
  title: "Foundations/Patterns Overview",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <TooltipProvider>
      <div className="mx-auto max-w-7xl space-y-10 p-8">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
            Product patterns
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">HanziBit pattern layer</h1>
            <p className="max-w-3xl text-base text-muted-foreground">
              These components sit between raw UI primitives and feature pages. They are the right
              place to stabilize notebook, reporting, study-guide, and teaching UI before broader
              refactors.
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--cn-orange)]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Metrics and status
            </h2>
          </div>
          <div className="rounded-3xl border bg-card p-6">
            <div className="flex flex-wrap gap-8">
              <OverviewMetric label="Classrooms" value={4} />
              <SummaryMetric label="Students" value={18} />
              <SummaryMetric label="Private learners" value={6} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <SummaryStatCard label="Waiting review" value={5} tone="sky" />
              <SummaryStatCard label="Missing work" value={2} tone="rose" />
              <SummaryStatCard label="Stable learners" value={7} tone="emerald" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <CompactStatCard label="Review due now" value={3} tone="amber" />
              <CompactStatCard label="Review overdue" value={1} tone="rose" />
              <CompactStatCard label="Active private" value={6} tone="emerald" />
              <CompactStatCard label="Plan without support" value={2} tone="sky" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl border bg-card p-4">
                <ActionRow label="Reset now" value={2} tone="rose" />
                <ActionRow label="Rebalance" value={3} tone="amber" />
                <ActionRow label="Stable to maintain" value={4} tone="emerald" />
              </div>
              <div className="space-y-3 rounded-2xl border bg-card p-4">
                <HealthRow label="Issue clusters" value={4} tone="amber" />
                <HealthRow label="Issue support gaps" value={2} tone="rose" />
                <HealthRow label="Learners without path" value={1} tone="sky" />
                <CompactBadgeRow label="Weak strategies" value="3" tone="amber" />
                <CompactBadgeRow label="Path integrity" value="82%" tone="sky" />
                <CompactBadgeRow label="Playbook gaps" value="None" tone="muted" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <MetricPill label="Learner" tone="muted" />
              <MetricPill label="Waiting review" tone="sky" />
              <MetricPill label="Needs adaptation" tone="amber" />
              <MetricPill label="Blocked" tone="rose" />
              <MetricPill label="Stable" tone="emerald" />
              <PriorityPill level="urgent" />
              <PriorityPill level="high" />
              <PriorityPill level="watch" />
              <PriorityBadge />
              <FocusWordStepBadge done label="Review" />
              <FocusWordStepBadge done={false} label="Study" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[var(--cn-orange)]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Guidance and surfaces
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
            <SectionCard
              title="Input Practice"
              description="Mini reading with a focus word and linked guided writing."
              icon={BookText}
            >
              <p className="text-sm font-semibold text-foreground">Mini Reading with 爱</p>
              <p className="mt-3 text-base leading-8 text-foreground/90">
                今天我学习爱。老师说“爱”很重要。我回家以后用爱写一个短句。
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Today I studied “to love.” My teacher said it was important, and I used it in a short sentence at home.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <InfoPanel title="Notice This Phrase" icon={Sparkles}>
                  <p className="text-sm font-semibold text-foreground">用爱写一个短句</p>
                  <p className="mt-1 text-sm text-muted-foreground">Use “love” in a short sentence.</p>
                </InfoPanel>

                <InfoPanel title="Quick Check" icon={CircleHelp}>
                  <p className="text-sm text-foreground">Where did the learner use 爱 after class?</p>
                </InfoPanel>
              </div>

              <InfoPanel title="Listening Echo" icon={Languages} className="mt-4">
                <p className="text-sm font-semibold text-foreground">老师问：“你今天怎么用爱？”</p>
                <p className="mt-1 text-sm text-muted-foreground">The teacher asked, “How did you use love today?”</p>
              </InfoPanel>
            </SectionCard>

            <div className="space-y-4">
              <GuidanceBanner title="Guided Response" tone="sky">
                <p className="text-sm">Retell the source text in your own words and try to reuse the focus word naturally.</p>
              </GuidanceBanner>

              <GuidanceBanner title="Revision Feedback" tone="violet">
                <div className="space-y-1 text-sm">
                  <p>✓ You already marked 2 vocabulary items for later review.</p>
                  <p>• Add at least one more sentence so the entry becomes fuller output practice.</p>
                </div>
              </GuidanceBanner>

              <GuidanceBanner title="Fix annotation markup before saving." tone="amber">
                <div className="space-y-1 text-xs">
                  <p>Annotation 2 has the wrong number of parts.</p>
                  <p className="font-mono text-amber-200/80">[你好|ni3 hao3]</p>
                </div>
              </GuidanceBanner>

              <EmptyStateNotice>
                No guided response yet for this study item.
              </EmptyStateNotice>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Action and form patterns
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[80px_minmax(0,1fr)]">
            <div className="flex justify-center">
              <div className="flex w-14 flex-col items-center gap-2 rounded-xl border bg-card py-4">
                <ActionRailButton label="Edit entry" icon={BookOpen} />
                <ActionRailButton label="Print" icon={Users} />
                <div className="flex-1" />
                <ActionRailButton label="New entry" icon={Sparkles} filled className="rounded-full p-3 shadow-lg" />
              </div>
            </div>

            <div className="space-y-4">
              <FormErrorNotice>There was a problem saving this entry. Please try again.</FormErrorNotice>

              <Dialog defaultOpen>
                <DialogContent showCloseButton={false} className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>New Journal Entry</DialogTitle>
                    <DialogDescription>Write a new journal entry in Mandarin.</DialogDescription>
                  </DialogHeader>
                  <div className="py-6 text-sm text-muted-foreground">
                    Extracted dialog footer actions should stay visually consistent across create/edit notebook flows.
                  </div>
                  <DialogFooter>
                    <DialogFormActions
                      submitLabel="Create Entry"
                      submitPendingLabel="Creating..."
                      submitTestId="storybook-submit"
                      leading={<Button variant="ghost">Optional leading action</Button>}
                    />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>
      </div>
    </TooltipProvider>
  ),
};
