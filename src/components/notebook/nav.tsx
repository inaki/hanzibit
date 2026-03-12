"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Search, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { SettingsDialog } from "./settings-dialog";
import { useSettings } from "./settings-context";

const navLinks = [
  { label: "Lessons", href: "/notebook/lessons" },
  { label: "Flashcards", href: "/notebook/flashcards" },
  { label: "My Notebook", href: "/notebook" },
];

export function NotebookNav() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings } = useSettings();

  function isActive(href: string) {
    if (href === "/notebook") {
      return (
        pathname === "/notebook" ||
        pathname === "/notebook/vocabulary" ||
        pathname === "/notebook/grammar" ||
        pathname === "/notebook/reviews"
      );
    }
    return pathname.startsWith(href);
  }

  return (
    <header data-testid="notebook-nav" className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-8">
        <Link href="/" data-testid="notebook-nav-logo" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cn-orange)] text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-base font-bold text-gray-900">
            Chinese Notebook
          </span>
        </Link>

        <nav data-testid="notebook-nav-links" className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                data-testid={`notebook-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}-link`}
                className={
                  active
                    ? "border-b-2 border-[var(--cn-orange)] pb-0.5 font-medium text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div data-testid="notebook-nav-search" className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            data-testid="notebook-nav-search-input"
            placeholder="Search characters..."
            className="w-56 rounded-full border-gray-200 bg-gray-50 pl-9 text-sm"
          />
        </div>
        <button
          data-testid="notebook-nav-settings-button"
          onClick={() => setSettingsOpen(true)}
          className="text-gray-400 hover:text-gray-600"
        >
          <Settings className="h-5 w-5" />
        </button>
        <Avatar data-testid="notebook-nav-avatar" className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-[var(--cn-orange)] text-xs text-white">
            {settings.profile.name
              ? settings.profile.name.slice(0, 2).toUpperCase()
              : "CN"}
          </AvatarFallback>
        </Avatar>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
