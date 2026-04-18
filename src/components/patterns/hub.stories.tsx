import type { Meta, StoryObj } from "@storybook/react";
import { BookOpenCheck, Users } from "lucide-react";

import { MetricPill } from "@/components/patterns/status";

import { HubFocusSection, HubPageHeader } from "./hub";

const meta = {
  title: "Patterns/Hub",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Header: Story = {
  render: () => (
    <div className="mx-auto max-w-5xl p-4">
      <HubPageHeader
        title="Teacher"
        description="Keep teacher-guided work separate from solo study, while still making assignments, classes, and outreach easy to manage."
        badge="Guided learner"
      />
    </div>
  ),
};

export const FocusSection: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl p-4">
      <HubFocusSection
        title="Guided Learning"
        icon={BookOpenCheck}
        tone="amber"
        guidanceTitle="Teacher-guided work is active"
        guidanceBody="You have live classroom work. Focus on assignments first, then use classes for shared context and teacher guidance."
        pills={
          <>
            <MetricPill label="3 assignments to do" tone="amber" />
            <MetricPill label="1 live inquiry" tone="sky" />
            <MetricPill label="1 converted" tone="emerald" />
          </>
        }
      />
    </div>
  ),
};

export const ClassroomFocus: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl p-4">
      <HubFocusSection
        title="Classroom Focus"
        icon={Users}
        tone="emerald"
        guidanceTitle="One class is now your private tutoring space"
        guidanceBody="Use your private classroom as the main place for tutoring follow-through, and keep other classes for broader guided support."
        pills={
          <>
            <MetricPill label="2 active" tone="amber" />
            <MetricPill label="1 private" tone="sky" />
            <MetricPill label="Join by code when invited" tone="muted" />
          </>
        }
      />
    </div>
  ),
};
