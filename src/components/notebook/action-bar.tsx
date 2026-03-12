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
  Volume2,
  Eye,
  RotateCcw,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { JournalEntry, EntryHighlight } from "@/lib/data";
import { toggleBookmarkAction, createJournalEntry, updateJournalEntry } from "@/lib/actions";

interface NotebookActionBarProps {
  entry?: JournalEntry;
  highlights?: EntryHighlight[];
}

export function NotebookActionBar({ entry, highlights = [] }: NotebookActionBarProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [pronunciationOpen, setPronunciationOpen] = useState(false);
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(entry?.bookmarked === 1);
  const [isPending, startTransition] = useTransition();

  function handleBookmark() {
    if (!entry) return;
    startTransition(async () => {
      const result = await toggleBookmarkAction(entry.id);
      if (result) setBookmarked(result.bookmarked);
    });
  }

  function handlePrint() {
    const el = document.querySelector('[data-testid="journal-entry"]');
    if (!el) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Grab computed styles for the orange CSS variable
    const orange = getComputedStyle(document.documentElement).getPropertyValue("--cn-orange").trim();
    const orangeLight = getComputedStyle(document.documentElement).getPropertyValue("--cn-orange-light").trim();

    printWindow.document.write(`<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="utf-8" />
  <title>Print — Chinese Notebook</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei", system-ui, -apple-system, sans-serif; color: #111; padding: 40px; }
    [data-testid="journal-entry"] { max-width: 640px; margin: 0 auto; }
    [data-testid="journal-entry-header"] { display: flex; justify-content: space-between; margin-bottom: 24px; }
    [data-testid="journal-entry-unit"] { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: ${orange || "#e8601c"}; font-weight: 600; }
    [data-testid="journal-entry-unit"] span { color: #999; font-weight: 400; }
    [data-testid="journal-entry-date"] { font-size: 11px; color: ${orange || "#e8601c"}; font-weight: 500; }
    [data-testid="journal-entry-id"] { font-size: 11px; color: #999; }
    [data-testid="journal-entry-title"] { font-size: 32px; font-weight: 700; margin-bottom: 32px; }
    [data-testid="journal-entry-title"] span { font-size: 16px; font-weight: 400; color: #999; }
    [data-testid="journal-entry-content"] { font-size: 20px; line-height: 2; }
    [data-testid="journal-entry-content"] p { margin-bottom: 20px; }
    [data-testid="journal-entry-content"] .font-bold { font-weight: 700; color: ${orange || "#e8601c"}; }
    [data-testid="journal-entry-annotations"] { margin-top: 40px; padding: 20px; border-left: 4px solid ${orange || "#e8601c"}; background: ${orangeLight || "#fef3ed"}; border-radius: 12px; }
    [data-testid="journal-entry-annotations-title"] { font-size: 13px; font-weight: 600; color: ${orange || "#e8601c"}; margin-bottom: 12px; }
    [data-testid="journal-entry-annotations-title"] span { display: none; }
    [data-testid="journal-entry-annotations"] > div:last-child { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    [data-testid^="journal-entry-annotation-"] { background: white; border: 1px solid #f0d0b8; border-radius: 8px; padding: 16px; }
    [data-testid^="journal-entry-annotation-"] p:first-child { font-weight: 600; font-size: 13px; margin-bottom: 6px; }
    [data-testid^="journal-entry-annotation-"] p:last-child { font-size: 13px; color: #555; line-height: 1.6; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>${el.outerHTML}</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  return (
    <>
      <div data-testid="notebook-action-bar" className="hidden w-14 flex-col items-center gap-2 border-l bg-white py-4 lg:flex">
        {/* Edit */}
        <Tooltip>
          <TooltipTrigger
            data-testid="action-bar-edit"
            onClick={() => setEditOpen(true)}
            disabled={!entry}
            className="rounded-lg p-2.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
          >
            <Pencil className="h-[18px] w-[18px]" />
          </TooltipTrigger>
          <TooltipContent side="left">Edit entry</TooltipContent>
        </Tooltip>

        {/* Pronunciation */}
        <Tooltip>
          <TooltipTrigger
            data-testid="action-bar-pronunciation"
            onClick={() => setPronunciationOpen(true)}
            disabled={highlights.length === 0}
            className="rounded-lg p-2.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
          >
            <Mic className="h-[18px] w-[18px]" />
          </TooltipTrigger>
          <TooltipContent side="left">Pronunciation</TooltipContent>
        </Tooltip>

        {/* Flashcard mode */}
        <Tooltip>
          <TooltipTrigger
            data-testid="action-bar-flashcard"
            onClick={() => setFlashcardOpen(true)}
            disabled={highlights.length === 0}
            className="rounded-lg p-2.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
          >
            <Layers className="h-[18px] w-[18px]" />
          </TooltipTrigger>
          <TooltipContent side="left">Flashcard mode</TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        {/* New entry */}
        <Tooltip>
          <TooltipTrigger
            data-testid="action-bar-new-entry"
            onClick={() => setNewEntryOpen(true)}
            className="rounded-full bg-[var(--cn-orange)] p-3 text-white shadow-lg transition-colors hover:bg-[var(--cn-orange-dark)]"
          >
            <Plus className="h-5 w-5" />
          </TooltipTrigger>
          <TooltipContent side="left">New entry</TooltipContent>
        </Tooltip>

        {/* Bookmark */}
        <Tooltip>
          <TooltipTrigger
            data-testid="action-bar-bookmark"
            onClick={handleBookmark}
            disabled={!entry || isPending}
            className={`rounded-lg p-2.5 transition-colors disabled:opacity-30 ${
              bookmarked
                ? "bg-[var(--cn-orange)] text-white hover:bg-[var(--cn-orange-dark)]"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-[18px] w-[18px]" />
            ) : (
              <Bookmark className="h-[18px] w-[18px]" />
            )}
          </TooltipTrigger>
          <TooltipContent side="left">
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </TooltipContent>
        </Tooltip>

        {/* Print */}
        <Tooltip>
          <TooltipTrigger
            data-testid="action-bar-print"
            onClick={handlePrint}
            disabled={!entry}
            className="rounded-lg p-2.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
          >
            <Printer className="h-[18px] w-[18px]" />
          </TooltipTrigger>
          <TooltipContent side="left">Print</TooltipContent>
        </Tooltip>
      </div>

      {/* --- Dialogs --- */}

      {/* Edit Entry Dialog */}
      {entry && (
        <EditEntryDialog
          entry={entry}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      {/* New Entry Dialog */}
      <NewEntryDialog open={newEntryOpen} onOpenChange={setNewEntryOpen} />

      {/* Pronunciation Dialog */}
      <PronunciationDialog
        highlights={highlights}
        open={pronunciationOpen}
        onOpenChange={setPronunciationOpen}
      />

      {/* Flashcard Mode Dialog */}
      <FlashcardModeDialog
        highlights={highlights}
        open={flashcardOpen}
        onOpenChange={setFlashcardOpen}
      />
    </>
  );
}

// --- Edit Entry Dialog ---

function EditEntryDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: JournalEntry;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateJournalEntry(formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="edit-entry-dialog" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
          <DialogDescription>
            Update this journal entry.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <input type="hidden" name="id" value={entry.id} />
          <div className="space-y-4 py-2">
            <div>
              <label data-testid="edit-entry-title-zh-label" className="mb-1 block text-sm font-medium text-gray-700">
                Chinese Title
              </label>
              <Input
                data-testid="edit-entry-title-zh"
                name="title_zh"
                defaultValue={entry.title_zh}
                required
              />
            </div>
            <div>
              <label data-testid="edit-entry-title-en-label" className="mb-1 block text-sm font-medium text-gray-700">
                English Title
              </label>
              <Input
                data-testid="edit-entry-title-en"
                name="title_en"
                defaultValue={entry.title_en}
                required
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Unit</label>
                <Input data-testid="edit-entry-unit" name="unit" defaultValue={entry.unit || ""} />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-sm font-medium text-gray-700">HSK</label>
                <Input
                  data-testid="edit-entry-hsk-level"
                  name="hsk_level"
                  type="number"
                  min={1}
                  max={6}
                  defaultValue={entry.hsk_level}
                />
              </div>
            </div>
            <div>
              <label data-testid="edit-entry-content-label" className="mb-1 block text-sm font-medium text-gray-700">
                Content (Chinese)
              </label>
              <textarea
                data-testid="edit-entry-content"
                name="content_zh"
                defaultValue={entry.content_zh}
                required
                rows={6}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--cn-orange)] focus:ring-1 focus:ring-[var(--cn-orange)]"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              data-testid="edit-entry-submit"
              type="submit"
              disabled={isPending}
              className="bg-[var(--cn-orange)] hover:bg-[var(--cn-orange-dark)]"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- New Entry Dialog ---

function NewEntryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createJournalEntry(formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="new-entry-dialog" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Journal Entry</DialogTitle>
          <DialogDescription>
            Write a new journal entry in Chinese.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Chinese Title
              </label>
              <Input
                data-testid="new-entry-title-zh"
                name="title_zh"
                placeholder="e.g. 我的周末"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                English Title
              </label>
              <Input
                data-testid="new-entry-title-en"
                name="title_en"
                placeholder="e.g. My Weekend"
                required
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Unit</label>
                <Input data-testid="new-entry-unit" name="unit" placeholder="e.g. Unit 8: Hobbies" />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-sm font-medium text-gray-700">HSK</label>
                <Input data-testid="new-entry-hsk-level" name="hsk_level" type="number" min={1} max={6} defaultValue={2} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Content (Chinese)
              </label>
              <textarea
                data-testid="new-entry-content"
                name="content_zh"
                placeholder="Write your journal entry in Chinese..."
                required
                rows={6}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--cn-orange)] focus:ring-1 focus:ring-[var(--cn-orange)]"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              data-testid="new-entry-submit"
              type="submit"
              disabled={isPending}
              className="bg-[var(--cn-orange)] hover:bg-[var(--cn-orange-dark)]"
            >
              {isPending ? "Creating..." : "Create Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Pronunciation Dialog ---

function PronunciationDialog({
  highlights,
  open,
  onOpenChange,
}: {
  highlights: EntryHighlight[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="pronunciation-dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Volume2 className="mr-2 inline h-5 w-5 text-[var(--cn-orange)]" />
            Pronunciation Guide
          </DialogTitle>
          <DialogDescription>
            Pinyin pronunciation for vocabulary in this entry.
          </DialogDescription>
        </DialogHeader>
        <div data-testid="pronunciation-list" className="max-h-80 space-y-2 overflow-auto py-2">
          {highlights.length === 0 ? (
            <p data-testid="pronunciation-empty" className="py-4 text-center text-sm text-gray-400">
              No vocabulary highlights in this entry.
            </p>
          ) : (
            highlights.map((h) => (
              <div
                key={h.id}
                data-testid={`pronunciation-item-${h.character_zh}`}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-[var(--cn-orange)]">
                    {h.character_zh}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{h.pinyin}</p>
                    <p className="text-xs text-gray-500">{h.meaning}</p>
                  </div>
                </div>
                <button
                  data-testid={`pronunciation-speak-${h.character_zh}`}
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(h.character_zh);
                    utterance.lang = "zh-CN";
                    utterance.rate = 0.8;
                    speechSynthesis.speak(utterance);
                  }}
                  className="rounded-full bg-[var(--cn-orange-light)] p-2 text-[var(--cn-orange)] transition-colors hover:bg-[var(--cn-orange)] hover:text-white"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

// --- Flashcard Mode Dialog ---

function FlashcardModeDialog({
  highlights,
  open,
  onOpenChange,
}: {
  highlights: EntryHighlight[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const card = highlights[currentIndex];
  const total = highlights.length;

  function next() {
    setFlipped(false);
    if (currentIndex + 1 >= total) {
      setCompleted(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function restart() {
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
  }

  // Reset state when dialog opens
  function handleOpenChange(v: boolean) {
    if (v) {
      setCurrentIndex(0);
      setFlipped(false);
      setCompleted(false);
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent data-testid="flashcard-mode-dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Layers className="mr-2 inline h-5 w-5 text-[var(--cn-orange)]" />
            Flashcard Mode
          </DialogTitle>
          <DialogDescription>
            Review the vocabulary from this entry. {total} cards.
          </DialogDescription>
        </DialogHeader>

        {total === 0 ? (
          <p data-testid="flashcard-mode-empty" className="py-8 text-center text-sm text-gray-400">
            No vocabulary highlights to practice.
          </p>
        ) : completed ? (
          <div data-testid="flashcard-mode-complete" className="py-8 text-center">
            <p className="mb-2 text-lg font-semibold text-gray-900">All done!</p>
            <p className="mb-4 text-sm text-gray-500">
              You reviewed {total} {total === 1 ? "card" : "cards"} from this entry.
            </p>
            <Button
              data-testid="flashcard-mode-restart"
              onClick={restart}
              variant="outline"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Review Again
            </Button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div data-testid="flashcard-mode-progress" className="flex items-center gap-2 text-xs text-gray-400">
              <span>Card {currentIndex + 1} of {total}</span>
              <div className="h-1 flex-1 rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[var(--cn-orange)] transition-all"
                  style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            {/* Card */}
            <button
              data-testid="flashcard-mode-card"
              onClick={() => setFlipped(!flipped)}
              className="flex h-48 w-full items-center justify-center rounded-xl border-2 bg-white transition-all hover:shadow-md"
            >
              {!flipped ? (
                <div data-testid="flashcard-mode-front" className="text-center">
                  <p className="text-5xl font-bold text-gray-900">{card.character_zh}</p>
                  <p className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400">
                    <Eye className="h-3.5 w-3.5" />
                    Tap to reveal
                  </p>
                </div>
              ) : (
                <div data-testid="flashcard-mode-back" className="text-center">
                  <p className="text-lg font-medium text-gray-900">{card.pinyin}</p>
                  <p className="mt-1 text-sm text-gray-600">{card.meaning}</p>
                </div>
              )}
            </button>

            {/* Actions */}
            <div data-testid="flashcard-mode-actions" className="flex justify-center gap-3">
              <Button
                data-testid="flashcard-mode-flip"
                onClick={() => setFlipped(!flipped)}
                variant="outline"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Flip
              </Button>
              <Button
                data-testid="flashcard-mode-next"
                onClick={next}
                className="bg-[var(--cn-orange)] hover:bg-[var(--cn-orange-dark)]"
              >
                {currentIndex + 1 >= total ? "Finish" : "Next"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
