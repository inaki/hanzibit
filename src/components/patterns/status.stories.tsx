import type { Meta, StoryObj } from "@storybook/react";

import { FocusWordStepBadge, MetricPill, PriorityBadge, PriorityPill } from "./status";

const meta = {
  title: "Patterns/Status",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <MetricPill label="Learner" tone="muted" />
        <MetricPill label="Waiting review" tone="sky" />
        <MetricPill label="Needs adaptation" tone="amber" />
        <MetricPill label="Blocked" tone="rose" />
        <MetricPill label="Stable" tone="emerald" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PriorityPill level="urgent" />
        <PriorityPill level="high" />
        <PriorityPill level="watch" />
        <PriorityBadge />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FocusWordStepBadge done label="Review" />
        <FocusWordStepBadge done={false} label="Study" />
        <FocusWordStepBadge done label="Write" />
      </div>
    </div>
  ),
};
