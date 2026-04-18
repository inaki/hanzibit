import type { Meta, StoryObj } from "@storybook/react";

import {
  ActionRow,
  CompactBadgeRow,
  CompactStatCard,
  HealthRow,
  SummaryMetric,
  SummaryStatCard,
} from "./metrics";

const meta = {
  title: "Patterns/Metrics",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="space-y-8 p-4">
      <div className="flex flex-wrap gap-8">
        <SummaryMetric label="Classrooms" value={4} />
        <SummaryMetric label="Students" value={18} />
        <SummaryMetric label="Private learners" value={6} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryStatCard label="Waiting review" value={5} tone="sky" />
        <SummaryStatCard label="Missing work" value={2} tone="rose" />
        <SummaryStatCard label="Stable learners" value={7} tone="emerald" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <CompactStatCard label="Review due now" value={3} tone="amber" />
        <CompactStatCard label="Review overdue" value={1} tone="rose" />
        <CompactStatCard label="Active private" value={6} tone="emerald" />
        <CompactStatCard label="Plan without support" value={2} tone="sky" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
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
    </div>
  ),
};
