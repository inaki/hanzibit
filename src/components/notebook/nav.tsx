"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Search, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { SettingsDialog } from "./settings-dialog";
import { useSettings } from "./settings-context";
import { useSession } from "@/lib/auth-client";
import { searchHskWordsAction } from "@/lib/actions";
import type { HskWord } from "@/lib/data";

const navLinks = [
  { label: "Study Guide", href: "/notebook/lessons" },
  { label: "Flashcards", href: "/notebook/flashcards" },
  { label: "My Notebook", href: "/notebook" },
];

export function NotebookNav() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HskWord[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const { data: session } = useSession();
  const displayName = settings.profile.name || session?.user?.name || "";

  useEffect(() => {
    if (searchQuery.length === 0) return;
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const results = await searchHskWordsAction(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      });
    }, 200);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
        <div ref={searchRef} data-testid="notebook-nav-search" className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            data-testid="notebook-nav-search-input"
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (val.length === 0) { setSearchResults([]); setShowResults(false); }
            }}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            className="w-56 rounded-full border-gray-200 bg-gray-50 pl-9 text-sm"
          />
          {showResults && searchQuery.length > 0 && (
            <div className="absolute top-full right-0 z-50 mt-1 w-80 rounded-lg border bg-white shadow-lg">
              {isPending ? (
                <p className="px-4 py-3 text-sm text-gray-400">Searching...</p>
              ) : searchResults.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">No results</p>
              ) : (
                <div className="max-h-72 overflow-auto py-1">
                  {searchResults.slice(0, 15).map((word) => (
                    <Link
                      key={word.id}
                      href={`/notebook/lessons?word=${word.simplified}`}
                      onClick={() => { setShowResults(false); setSearchQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                    >
                      <span className="text-lg font-bold text-[var(--cn-orange)]">{word.simplified}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-700">{word.pinyin}</p>
                        <p className="truncate text-xs text-gray-400">{word.english}</p>
                      </div>
                      <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">HSK {word.hsk_level}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
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
            {displayName
              ? displayName.slice(0, 2).toUpperCase()
              : "CN"}
          </AvatarFallback>
        </Avatar>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
