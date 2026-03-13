"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Languages,
  RotateCcw,
  PenLine,
  Hash,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "./settings-context";
import {
  getCharacterOfTheDayAction,
  getDueCountAction,
  getProgressAction,
} from "@/lib/actions";
import type { HskWord } from "@/lib/data";

const sections = [
  { label: "Daily Journal", icon: PenLine, href: "/notebook" },
  { label: "Study Guide", icon: GraduationCap, href: "/notebook/lessons" },
  { label: "Flashcards", icon: Layers, href: "/notebook/flashcards" },
  { label: "Vocabulary List", icon: BookOpen, href: "/notebook/vocabulary" },
  { label: "Numbers Guide", icon: Hash, href: "/notebook/numbers" },
  { label: "Grammar Points", icon: Languages, href: "/notebook/grammar" },
  { label: "Recent Reviews", icon: RotateCcw, href: "/notebook/reviews" },
];

export function NotebookSidebar() {
  const pathname = usePathname();
  const { settings } = useSettings();

  const [charOfDay, setCharOfDay] = useState<HskWord | null>(null);
  const [dueCount, setDueCount] = useState(0);
  const [progress, setProgress] = useState({ encountered: 0, total: 0, percent: 0 });

  useEffect(() => {
    getCharacterOfTheDayAction(settings.hskLevel).then(setCharOfDay);
    getDueCountAction().then(setDueCount);
    getProgressAction(settings.hskLevel).then(setProgress);
  }, [settings.hskLevel]);

  function isActive(href: string) {
    if (href === "/notebook") return pathname === "/notebook";
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
          <span data-testid="notebook-sidebar-hsk-level" className="text-sm font-medium text-gray-900">
            HSK {settings.hskLevel} Level
          </span>
          <span data-testid="notebook-sidebar-hsk-percentage" className="text-sm font-bold text-[var(--cn-orange)]">
            {progress.percent}%
          </span>
        </div>
        <Progress
          data-testid="notebook-sidebar-progress-bar"
          value={progress.percent}
          className="mt-2 h-2 [&_[data-slot=progress-indicator]]:bg-[var(--cn-orange)]"
        />
        <p className="mt-1 text-[10px] text-gray-400">
          {progress.encountered}/{progress.total} words encountered
        </p>
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
                {section.label === "Flashcards" && dueCount > 0 && (
                  <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {dueCount}
                  </span>
                )}
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
              {charOfDay?.simplified ?? "..."}
            </span>
          </div>
          <div>
            <p data-testid="notebook-sidebar-character-pinyin" className="font-medium text-gray-900">
              {charOfDay?.pinyin ?? ""}
            </p>
            <p data-testid="notebook-sidebar-character-meaning" className="text-xs text-gray-500">
              {charOfDay?.english ?? ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
