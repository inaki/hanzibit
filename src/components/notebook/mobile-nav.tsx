"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PenLine,
  BookOpen,
  Layers,
  GraduationCap,
} from "lucide-react";

const tabs = [
  { label: "Journal", icon: PenLine, href: "/notebook" },
  { label: "Study", icon: GraduationCap, href: "/notebook/lessons" },
  { label: "Flashcards", icon: Layers, href: "/notebook/flashcards" },
  { label: "Vocab", icon: BookOpen, href: "/notebook/vocabulary" },
];

export function MobileNav() {
  const pathname = usePathname();

  function isActive(href: string) {
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

  return (
    <nav
      data-testid="mobile-nav"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="flex h-14">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                active
                  ? "text-[var(--cn-orange)]"
                  : "text-gray-400"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
