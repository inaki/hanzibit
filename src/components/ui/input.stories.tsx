import type { Meta, StoryObj } from "@storybook/react";
import { Search } from "lucide-react";

import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  args: {
    placeholder: "Search words...",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: () => (
    <div className="grid w-[320px] gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Default</label>
        <Input placeholder="Search words..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">With value</label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" defaultValue="hello" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Disabled</label>
        <Input disabled defaultValue="Unavailable" />
      </div>
    </div>
  ),
};
