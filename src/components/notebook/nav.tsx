"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Settings, Moon, Sun, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { SettingsDialog } from "./settings-dialog";
import { useSettings } from "./settings-context";
import { useSession } from "@/lib/auth-client";
import {
  hasLearnerTeacherHubAction,
  isTeacherUserAction,
  searchHskWordsAction,
} from "@/lib/actions";
import type { HskWord } from "@/lib/data";

const navLinks = [
  { label: "Teacher", href: "/notebook/with-teacher", learnerTeacherOnly: true },
  { label: "Teaching", href: "/notebook/teacher", teacherOnly: true },
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
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("theme");
    return (
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });
  const [signingOut, setSigningOut] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [hasLearnerTeacherHub, setHasLearnerTeacherHub] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const { data: session } = useSession();
  const displayName = settings.profile.name || session?.user?.name || "";
  const userEmail = session?.user?.email ?? "";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    isTeacherUserAction().then(setIsTeacher);
    hasLearnerTeacherHubAction().then(setHasLearnerTeacherHub);
  }, []);

  function toggleDarkMode() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{}",
      });

      if (!response.ok) {
        throw new Error(`Sign out failed with status ${response.status}`);
      }

      window.location.assign("/auth/signin");
      return;
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      setSigningOut(false);
    }
  }

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
    <header data-testid="notebook-nav" className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-8">
        <nav data-testid="notebook-nav-links" className="hidden items-center gap-6 text-sm md:flex">
          {navLinks
            .filter(
              (link) =>
                (!link.teacherOnly || isTeacher) &&
                (!link.learnerTeacherOnly || hasLearnerTeacherHub)
            )
            .map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                data-testid={`notebook-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}-link`}
                className={
                  active
                    ? "border-b-2 border-[var(--ui-tone-orange-border)] pb-0.5 font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
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
            className="w-56 rounded-full border-border bg-muted/50 pl-9 text-sm"
          />
          {showResults && searchQuery.length > 0 && (
            <div className="absolute top-full right-0 z-50 mt-1 w-80 rounded-lg bg-card card-ring shadow-lg">
              {isPending ? (
                <p className="px-4 py-3 text-sm text-muted-foreground/70">Searching...</p>
              ) : searchResults.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground/70">No results</p>
              ) : (
                <div className="max-h-72 overflow-auto py-1">
                  {searchResults.slice(0, 15).map((word) => (
                    <Link
                      key={word.id}
                      href={`/notebook/lessons?word=${word.simplified}`}
                      onClick={() => { setShowResults(false); setSearchQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50"
                    >
                      <span className="ui-tone-orange-text text-lg font-bold">{word.simplified}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground/80">{word.pinyin}</p>
                        <p className="truncate text-xs text-muted-foreground/70">{word.english}</p>
                      </div>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">HSK {word.hsk_level}</span>
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
          className="text-muted-foreground/70 hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="notebook-nav-avatar" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-tone-orange-border)]">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {displayName ? displayName.slice(0, 2).toUpperCase() : "HB"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <p className="font-medium text-foreground">{displayName || "Account"}</p>
                {userEmail && <p className="truncate text-xs text-muted-foreground/70">{userEmail}</p>}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleDarkMode} className="cursor-pointer justify-between">
              <span className="flex items-center gap-2">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? "Light mode" : "Dark mode"}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={<button type="button" />}
              nativeButton
              onClick={handleSignOut}
              variant="destructive"
              className="w-full cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
