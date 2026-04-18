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
  LayoutDashboard,
  BriefcaseBusiness,
  UserRoundSearch,
} from "lucide-react";
import { useSettings } from "./settings-context";
import {
  getCharacterOfTheDayAction,
  getDueCountAction,
  getUserStatsAction,
  hasLearnerTeacherHubAction,
  isTeacherUserAction,
} from "@/lib/actions";
import type { HskWord } from "@/lib/data";

const sections = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/notebook/dashboard" },
  { label: "Daily Journal", icon: PenLine, href: "/notebook" },
  { label: "Study Guide", icon: GraduationCap, href: "/notebook/lessons" },
  { label: "Teacher", icon: UserRoundSearch, href: "/notebook/with-teacher", learnerTeacherOnly: true },
  { label: "Teaching", icon: BriefcaseBusiness, href: "/notebook/teacher", teacherOnly: true },
  { label: "Flashcards", icon: Layers, href: "/notebook/flashcards" },
  { label: "Vocabulary List", icon: BookOpen, href: "/notebook/vocabulary", advancedOnly: true },
  { label: "Numbers Guide", icon: Hash, href: "/notebook/numbers", advancedOnly: true },
  { label: "Grammar Points", icon: Languages, href: "/notebook/grammar", advancedOnly: true },
  { label: "Recent Reviews", icon: RotateCcw, href: "/notebook/reviews", advancedOnly: true },
];

export function NotebookSidebar() {
  const pathname = usePathname();
  const { settings } = useSettings();

  const [charOfDay, setCharOfDay] = useState<HskWord | null>(null);
  const [dueCount, setDueCount] = useState(0);
  const [isTeacher, setIsTeacher] = useState(false);
  const [hasLearnerTeacherHub, setHasLearnerTeacherHub] = useState(false);
  const [stats, setStats] = useState({ entryCount: 0, vocabCount: 0, reviewCount: 0 });

  useEffect(() => {
    getCharacterOfTheDayAction(settings.hskLevel).then(setCharOfDay);
    getDueCountAction().then(setDueCount);
    isTeacherUserAction().then(setIsTeacher);
    hasLearnerTeacherHubAction().then(setHasLearnerTeacherHub);
    getUserStatsAction().then((value) =>
      setStats({
        entryCount: value.entryCount,
        vocabCount: value.vocabCount,
        reviewCount: value.reviewCount,
      })
    );
  }, [settings.hskLevel]);

  const isBeginnerSoloLearner =
    !isTeacher &&
    !hasLearnerTeacherHub &&
    settings.hskLevel === 1 &&
    stats.entryCount <= 1 &&
    stats.reviewCount <= 5 &&
    stats.vocabCount <= 10;

  function isActive(href: string) {
    if (href === "/notebook") return pathname === "/notebook";
    return pathname.startsWith(href);
  }

  return (
    <aside data-testid="notebook-sidebar" className="hidden w-60 shrink-0 flex-col border-r bg-card p-5 lg:flex overflow-y-auto h-full">
      {/* Sections */}
      <div data-testid="notebook-sidebar-sections" className="mb-8">
        <p className="mb-3 text-[10px] font-semibold tracking-widest text-muted-foreground/70 uppercase">
          Notebook Sections
        </p>
        <div className="space-y-1">
          {sections
            .filter(
              (section) =>
                (!section.teacherOnly || isTeacher) &&
                (!section.learnerTeacherOnly || hasLearnerTeacherHub) &&
                (!section.advancedOnly || !isBeginnerSoloLearner)
            )
            .map((section) => {
            const active = isActive(section.href);
            return (
              <Link
                key={section.label}
                href={section.href}
                data-testid={`notebook-sidebar-section-${section.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
                {section.label === "Flashcards" && dueCount > 0 && (
                  <span className="ui-tone-rose-panel ui-tone-rose-text ml-auto rounded-full border px-1.5 py-0.5 text-[10px] font-bold leading-none">
                    {dueCount}
                  </span>
                )}
              </Link>
            );
            })}
        </div>
        {isBeginnerSoloLearner && (
          <p className="mt-3 px-3 text-xs leading-5 text-muted-foreground">
            More study tools will appear here after you complete a few entries and reviews.
          </p>
        )}
      </div>

      {/* Character of the day */}
      <div data-testid="notebook-sidebar-character-of-day" className="rounded-xl border bg-muted/30 p-4">
        <p className="mb-2 text-[10px] text-muted-foreground/70">Character of the day</p>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-card shadow-sm">
            <span data-testid="notebook-sidebar-character" className="ui-tone-orange-text text-3xl font-bold leading-none">
              {charOfDay ? charOfDay.simplified[0] : "…"}
            </span>
          </div>
          <div className="min-w-0">
            <p data-testid="notebook-sidebar-character-simplified" className="font-semibold text-foreground">
              {charOfDay?.simplified ?? ""}
            </p>
            <p data-testid="notebook-sidebar-character-pinyin" className="text-xs text-foreground/70">
              {charOfDay?.pinyin ?? ""}
            </p>
            <p data-testid="notebook-sidebar-character-meaning" className="truncate text-xs text-muted-foreground">
              {charOfDay?.english ?? ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
