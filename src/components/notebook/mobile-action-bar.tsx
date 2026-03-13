"use client";

import { useState, useTransition } from "react";
import {
  Pencil,
  Mic,
  Layers,
  Plus,
  Bookmark,
  BookmarkCheck,
  Printer,
  Languages,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { JournalEntry } from "@/lib/data";
import { toggleBookmarkAction } from "@/lib/actions";
import { useGloss } from "./gloss-context";

interface MobileActionBarProps {
  entry?: JournalEntry;
  onEditOpen: () => void;
  onNewEntryOpen: () => void;
  onPronunciationOpen: () => void;
  onFlashcardOpen: () => void;
  onEntryListOpen: () => void;
  hasHighlights: boolean;
}

export function MobileActionBar({
  entry,
  onEditOpen,
  onNewEntryOpen,
  onPronunciationOpen,
  onFlashcardOpen,
  onEntryListOpen,
  hasHighlights,
}: MobileActionBarProps) {
  const [open, setOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(entry?.bookmarked === 1);
  const [isPending, startTransition] = useTransition();
  const gloss = useGloss();

  function handleBookmark() {
    if (!entry) return;
    startTransition(async () => {
      const result = await toggleBookmarkAction(entry.id);
      if (result) setBookmarked(result.bookmarked);
    });
    setOpen(false);
  }

  function handleAction(fn: () => void) {
    setOpen(false);
    // Small delay to let sheet close animation start
    setTimeout(fn, 150);
  }

  const actions = [
    {
      label: "Browse Entries",
      icon: FileText,
      onClick: () => handleAction(onEntryListOpen),
      disabled: false,
      show: true,
    },
    {
      label: "New Entry",
      icon: Plus,
      onClick: () => handleAction(onNewEntryOpen),
      disabled: false,
      show: true,
    },
    {
      label: "Edit Entry",
      icon: Pencil,
      onClick: () => handleAction(onEditOpen),
      disabled: !entry,
      show: true,
    },
    {
      label: "Pronunciation",
      icon: Mic,
      onClick: () => handleAction(onPronunciationOpen),
      disabled: !hasHighlights,
      show: true,
    },
    {
      label: "Flashcard Mode",
      icon: Layers,
      onClick: () => handleAction(onFlashcardOpen),
      disabled: !hasHighlights,
      show: true,
    },
    {
      label: gloss.state.sticky ? "Hide Gloss" : "Interlinear Gloss",
      icon: Languages,
      onClick: () => {
        if (entry) gloss.toggleSticky(entry.id, entry.content_zh);
        setOpen(false);
      },
      disabled: !entry,
      show: true,
    },
    {
      label: bookmarked ? "Bookmarked" : "Bookmark",
      icon: bookmarked ? BookmarkCheck : Bookmark,
      onClick: handleBookmark,
      disabled: !entry || isPending,
      show: true,
    },
    {
      label: "Print",
      icon: Printer,
      onClick: () => {
        setOpen(false);
        const el = document.querySelector('[data-testid="journal-entry"]');
        if (el) window.print();
      },
      disabled: !entry,
      show: true,
    },
  ];

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          data-testid="mobile-action-fab"
          className="fixed right-4 bottom-20 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--cn-orange)] text-white shadow-lg transition-transform active:scale-95"
        >
          <MoreHorizontal className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
          <SheetHeader className="pb-0">
            <SheetTitle>Actions</SheetTitle>
            <SheetDescription className="sr-only">Journal entry actions</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-2 px-4 pb-4">
            {actions
              .filter((a) => a.show)
              .map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30"
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium leading-tight text-center">
                    {action.label}
                  </span>
                </button>
              ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
