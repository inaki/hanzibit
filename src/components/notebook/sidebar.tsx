"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Languages,
  RotateCcw,
  PenLine,
  Hash,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const sections = [
  { label: "Daily Journal", icon: PenLine, href: "/notebook" },
  { label: "Vocabulary List", icon: BookOpen, href: "/notebook/vocabulary" },
  { label: "Numbers Guide", icon: Hash, href: "/notebook/numbers" },
  { label: "Grammar Points", icon: Languages, href: "/notebook/grammar" },
  { label: "Recent Reviews", icon: RotateCcw, href: "/notebook/reviews" },
];

export function NotebookSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/notebook") {
      return pathname === "/notebook";
    }
    return pathname.startsWith(href);
  }

  return (
    <aside data-testid="notebook-sidebar" className="hidden w-60 shrink-0 border-r bg-white p-5 lg:block">
      {/* Progress */}
      <div data-testid="notebook-sidebar-progress" className="mb-8">
        <p className="mb-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
          Current Progress
        </p>
        <div className="flex items-center justify-between">
          <span data-testid="notebook-sidebar-hsk-level" className="text-sm font-medium text-gray-900">HSK 2 Level</span>
          <span data-testid="notebook-sidebar-hsk-percentage" className="text-sm font-bold text-[var(--cn-orange)]">65%</span>
        </div>
        <Progress
          data-testid="notebook-sidebar-progress-bar"
          value={65}
          className="mt-2 h-2 [&>div]:bg-[var(--cn-orange)]"
        />
      </div>

      {/* Sections */}
      <div data-testid="notebook-sidebar-sections" className="mb-8">
        <p className="mb-3 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
          Notebook Sections
        </p>
        <div className="space-y-1">
          {sections.map((section) => {
            const active = isActive(section.href);
            return (
              <Link
                key={section.label}
                href={section.href}
                data-testid={`notebook-sidebar-section-${section.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-[var(--cn-orange)] font-medium text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Character of the day */}
      <div data-testid="notebook-sidebar-character-of-day" className="rounded-xl border bg-gray-50/50 p-4">
        <p className="mb-2 text-[10px] text-gray-400">Character of the day</p>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white shadow-sm">
            <span data-testid="notebook-sidebar-character" className="text-3xl font-bold text-[var(--cn-orange)]">
              学
            </span>
          </div>
          <div>
            <p data-testid="notebook-sidebar-character-pinyin" className="font-medium text-gray-900">xué</p>
            <p data-testid="notebook-sidebar-character-meaning" className="text-xs text-gray-500">To study / learn</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
