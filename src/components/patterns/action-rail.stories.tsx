import type { Meta, StoryObj } from "@storybook/react";
import { Bookmark, BookmarkCheck, Layers, Mic, Pencil, Plus, Printer } from "lucide-react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ActionRailButton } from "./action-rail";

const meta = {
  title: "Patterns/Action Rail",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex w-14 flex-col items-center gap-2 rounded-xl border bg-card py-4">
        <ActionRailButton label="Edit entry" icon={Pencil} />
        <ActionRailButton label="Pronunciation" icon={Mic} />
        <ActionRailButton label="Flashcard mode" icon={Layers} />
        <ActionRailButton label="Bookmarked" filled>
          <BookmarkCheck className="h-[18px] w-[18px]" />
        </ActionRailButton>
        <ActionRailButton label="Bookmark" filled danger>
          <Bookmark className="h-[18px] w-[18px]" />
        </ActionRailButton>
        <ActionRailButton label="Print" icon={Printer} />
        <div className="flex-1" />
        <ActionRailButton label="New entry" icon={Plus} filled className="rounded-full p-3 shadow-lg" />
      </div>
    </TooltipProvider>
  ),
};
