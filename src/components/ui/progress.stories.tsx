import type { Meta, StoryObj } from "@storybook/react";

import { Progress, ProgressLabel, ProgressValue } from "./progress";

const meta = {
  title: "UI/Progress",
  component: Progress,
  args: {
    value: 42,
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[360px]">
      <Progress {...args}>
        <ProgressLabel>HSK 1 Progress</ProgressLabel>
        <ProgressValue>{args.value}%</ProgressValue>
      </Progress>
    </div>
  ),
};

export const Milestones: Story = {
  render: () => (
    <div className="grid w-[360px] gap-4">
      {[18, 42, 76].map((value) => (
        <Progress key={value} value={value}>
          <ProgressLabel>Completion</ProgressLabel>
          <ProgressValue>{value}%</ProgressValue>
        </Progress>
      ))}
    </div>
  ),
};
