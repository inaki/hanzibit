"use client";

import {
  Pencil,
  Mic,
  Layers,
  Plus,
  Bookmark,
  Printer,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const actions = [
  { icon: Pencil, label: "Edit entry", testId: "action-bar-edit" },
  { icon: Mic, label: "Pronunciation", testId: "action-bar-pronunciation" },
  { icon: Layers, label: "Flashcard mode", testId: "action-bar-flashcard" },
];

export function NotebookActionBar() {
  return (
    <div data-testid="notebook-action-bar" className="hidden w-14 flex-col items-center gap-2 border-l bg-white py-4 lg:flex">
      {actions.map((action) => (
        <Tooltip key={action.label}>
          <TooltipTrigger
            data-testid={action.testId}
            className="rounded-lg p-2.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <action.icon className="h-[18px] w-[18px]" />
          </TooltipTrigger>
          <TooltipContent side="left">{action.label}</TooltipContent>
        </Tooltip>
      ))}

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger
          data-testid="action-bar-new-entry"
          className="rounded-full bg-[var(--cn-orange)] p-3 text-white shadow-lg transition-colors hover:bg-[var(--cn-orange-dark)]"
        >
          <Plus className="h-5 w-5" />
        </TooltipTrigger>
        <TooltipContent side="left">New entry</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          data-testid="action-bar-bookmark"
          className="rounded-lg bg-red-500 p-2.5 text-white transition-colors hover:bg-red-600"
        >
          <Bookmark className="h-[18px] w-[18px]" />
        </TooltipTrigger>
        <TooltipContent side="left">Bookmark</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          data-testid="action-bar-print"
          className="rounded-lg p-2.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <Printer className="h-[18px] w-[18px]" />
        </TooltipTrigger>
        <TooltipContent side="left">Print</TooltipContent>
      </Tooltip>
    </div>
  );
}
