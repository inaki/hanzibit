import type { Meta, StoryObj } from "@storybook/react";
import { BookText, CircleHelp, Languages, Sparkles } from "lucide-react";

import { InfoPanel, SectionCard } from "./surfaces";

const meta = {
  title: "Patterns/Surfaces",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="max-w-5xl space-y-6 p-4">
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
    </div>
  ),
};
