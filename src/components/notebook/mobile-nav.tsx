"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  PenLine,
  BookOpen,
  Layers,
  GraduationCap,
} from "lucide-react";
import { getDailyPracticeAction } from "@/lib/actions";
import type { DailyPracticePlan } from "@/lib/daily-practice";
import { useSettings } from "./settings-context";

const tabs = [
  { label: "Home", icon: LayoutDashboard, href: "/notebook/dashboard" },
  { label: "Journal", icon: PenLine, href: "/notebook" },
  { label: "Study", icon: GraduationCap, href: "/notebook/lessons" },
  { label: "Flashcards", icon: Layers, href: "/notebook/flashcards" },
  { label: "Vocab", icon: BookOpen, href: "/notebook/vocabulary" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const [dailyPractice, setDailyPractice] = useState<DailyPracticePlan | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDailyPracticeAction(settings.hskLevel).then((plan) => {
      if (!cancelled) {
        setDailyPractice(plan);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [settings.hskLevel]);

  function isActive(href: string) {
    if (href === "/notebook/dashboard") {
      return pathname === "/notebook/dashboard";
    }
    if (href === "/notebook") {
      return (
        pathname === "/notebook" ||
        pathname === "/notebook/grammar" ||
        pathname === "/notebook/reviews" ||
        pathname === "/notebook/numbers"
      );
    }
    return pathname.startsWith(href);
  }

  const priorityBadge =
    dailyPractice?.loopCompleted || !dailyPractice?.stepPattern.weakestStep
      ? null
      : dailyPractice.stepPattern.weakestStep === "review"
        ? { label: "R", className: "ui-tone-sky-panel ui-tone-sky-text border" }
        : dailyPractice.stepPattern.weakestStep === "study"
          ? { label: "S", className: "ui-tone-emerald-panel ui-tone-emerald-text border" }
          : { label: "W", className: "bg-primary text-primary-foreground" };

  return (
    <nav
      data-testid="mobile-nav"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="flex h-14">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const showUrgencyBadge =
            tab.href === "/notebook/dashboard" &&
            !!priorityBadge;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                active
                  ? "ui-tone-orange-text"
                  : "text-muted-foreground/70"
              }`}
            >
              {showUrgencyBadge && priorityBadge && (
                <span
                  className={`absolute right-[18%] top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none ${priorityBadge.className}`}
                  title={`${dailyPractice?.stepPatternInsight.weakestLabel ?? "Priority"} needs attention`}
                >
                  {priorityBadge.label}
                </span>
              )}
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
