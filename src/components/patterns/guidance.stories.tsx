import type { Meta, StoryObj } from "@storybook/react";

import { EmptyStateNotice, GuidanceBanner } from "./guidance";

const meta = {
  title: "Patterns/Guidance",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="max-w-3xl space-y-4 p-4">
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

      <GuidanceBanner tone="emerald" className="text-xs">
        Annotation format looks valid.
      </GuidanceBanner>

      <EmptyStateNotice>
        No guided response yet for this study item.
      </EmptyStateNotice>
    </div>
  ),
};
