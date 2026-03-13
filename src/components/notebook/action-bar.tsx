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
  Languages,
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
import type { JournalEntry } from "@/lib/data";
import { toggleBookmarkAction, createJournalEntry, updateJournalEntry, saveFlashcardsFromEntry } from "@/lib/actions";
import { parseInput, extractHanziTokens } from "@/lib/parse-tokens";
import { useGloss } from "./gloss-context";

interface NotebookActionBarProps {
  entry?: JournalEntry;
}

export function NotebookActionBar({ entry }: NotebookActionBarProps) {
  const highlights = entry
    ? extractHanziTokens(parseInput(entry.content_zh))
    : [];
  const [editOpen, setEditOpen] = useState(false);
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [pronunciationOpen, setPronunciationOpen] = useState(false);
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(entry?.bookmarked === 1);
  const [isPending, startTransition] = useTransition();
  const gloss = useGloss();

  function handleBookmark() {
    if (!entry) return;
    const prev = bookmarked;
    setBookmarked(!prev); // Optimistic update
    startTransition(async () => {
      const result = await toggleBookmarkAction(entry.id);
      if (result) setBookmarked(result.bookmarked);
      else setBookmarked(prev); // Revert on failure
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
    [data-testid^="journal-entry-vocab-"] > span:first-child { font-weight: 700; color: ${orange || "#e8601c"}; border-bottom: none !important; }
    [data-testid^="journal-entry-vocab-"] > span:last-child:not(:first-child) { display: none; }
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

        {/* Interlinear Gloss */}
        <Tooltip>
          <TooltipTrigger
            data-testid="action-bar-gloss"
            onMouseEnter={() => entry && gloss.activate(entry.id, entry.content_zh)}
            onMouseLeave={() => gloss.deactivate()}
            onClick={() => entry && gloss.toggleSticky(entry.id, entry.content_zh)}
            disabled={!entry}
            className={`rounded-lg p-2.5 transition-colors disabled:opacity-30 ${
              gloss.state.sticky
                ? "bg-[var(--cn-orange)] text-white"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
          >
            <Languages className="h-[18px] w-[18px]" />
          </TooltipTrigger>
          <TooltipContent side="left">
            {gloss.state.sticky ? "Hide interlinear" : "Interlinear gloss"}
          </TooltipContent>
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
        entryId={entry?.id}
      />
    </>
  );
}

// --- Edit Entry Dialog ---

function MarkupHelp() {
  return (
    <div data-testid="markup-help" className="space-y-2">
      <div className="rounded-lg bg-[var(--cn-orange-light)] border border-[var(--cn-orange)]/20 px-3 py-2 text-xs text-gray-700">
        <p className="font-semibold text-[var(--cn-orange)]">Vocabulary markup</p>
        <p className="mt-1">
          Wrap words in <code className="rounded bg-white px-1 py-0.5 font-mono text-[var(--cn-orange)]">[汉字|pīnyīn|english]</code> to highlight them.
        </p>
        <p className="mt-1 text-gray-500">
          Example: <code className="font-mono">我去[餐厅|can1 ting1|restaurant]吃饭</code>
        </p>
      </div>
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-gray-700">
        <p className="font-semibold text-amber-700">Tone shortcut</p>
        <p className="mt-1 font-mono text-gray-500">
          a1→ā &nbsp; a2→á &nbsp; a3→ǎ &nbsp; a4→à &nbsp; v=ü
        </p>
        <p className="mt-0.5 text-gray-500">
          e.g. <code className="font-mono">ni3 hao3</code> → nǐ hǎo
        </p>
      </div>
    </div>
  );
}

function ContentPreview({ content }: { content: string }) {
  const tokens = parseInput(content);
  if (tokens.length === 0) return null;

  return (
    <div data-testid="content-preview" className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
      <p className="mb-2 text-xs font-medium text-gray-400">Preview</p>
      <div className="text-base leading-[2] text-gray-800">
        {tokens.map((t, i) => {
          if (t.type === "break") return <br key={i} />;
          if (t.type === "text") return <span key={i}>{t.text}</span>;
          return (
            <span key={i} className="font-bold text-[var(--cn-orange)]" title={`${t.pinyin} — ${t.english}`}>
              {t.hanzi}
            </span>
          );
        })}
      </div>
    </div>
  );
}

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
  const [preview, setPreview] = useState(false);
  const [content, setContent] = useState(entry.content_zh);

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
              <div className="mb-1 flex items-center justify-between">
                <label data-testid="edit-entry-content-label" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <button
                  type="button"
                  data-testid="edit-entry-preview-toggle"
                  onClick={() => setPreview((p) => !p)}
                  className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                    preview
                      ? "bg-[var(--cn-orange)] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {preview ? "Hide Preview" : "Preview"}
                </button>
              </div>
              <textarea
                data-testid="edit-entry-content"
                name="content_zh"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-900 outline-none focus:border-[var(--cn-orange)] focus:ring-1 focus:ring-[var(--cn-orange)]"
              />
              {preview && <ContentPreview content={content} />}
            </div>
            <MarkupHelp />
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
  const [preview, setPreview] = useState(false);
  const [content, setContent] = useState("");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createJournalEntry(formData);
      setContent("");
      setPreview(false);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="new-entry-dialog" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Journal Entry</DialogTitle>
          <DialogDescription>
            Write a new journal entry in Mandarin.
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
                <Input data-testid="new-entry-hsk-level" name="hsk_level" type="number" min={1} max={6} defaultValue={1} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <button
                  type="button"
                  data-testid="new-entry-preview-toggle"
                  onClick={() => setPreview((p) => !p)}
                  className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                    preview
                      ? "bg-[var(--cn-orange)] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {preview ? "Hide Preview" : "Preview"}
                </button>
              </div>
              <textarea
                data-testid="new-entry-content"
                name="content_zh"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`我去[餐厅|can1 ting1|restaurant]吃饭。\n[服务员|fu2 wu4 yuan2|waiter]很热情。`}
                required
                rows={6}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-900 outline-none focus:border-[var(--cn-orange)] focus:ring-1 focus:ring-[var(--cn-orange)]"
              />
              {preview && content && <ContentPreview content={content} />}
            </div>
            <MarkupHelp />
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

interface HanziItem {
  hanzi: string;
  pinyin: string;
  english: string;
}

function PronunciationDialog({
  highlights,
  open,
  onOpenChange,
}: {
  highlights: HanziItem[];
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
                key={h.hanzi}
                data-testid={`pronunciation-item-${h.hanzi}`}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-[var(--cn-orange)]">
                    {h.hanzi}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{h.pinyin}</p>
                    <p className="text-xs text-gray-500">{h.english}</p>
                  </div>
                </div>
                <button
                  data-testid={`pronunciation-speak-${h.hanzi}`}
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(h.hanzi);
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
  entryId,
}: {
  highlights: HanziItem[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entryId?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const card = highlights[currentIndex];
  const total = highlights.length;

  function next() {
    setFlipped(false);
    if (currentIndex + 1 >= total) {
      setCompleted(true);
      // Select all cards by default when completing
      setSelectedCards(new Set(highlights.map((_, i) => i)));
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function restart() {
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
    setSaveStatus(null);
    setSelectedCards(new Set());
  }

  function toggleCard(index: number) {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleSaveFlashcards() {
    if (!entryId || selectedCards.size === 0) return;
    setIsSaving(true);
    try {
      const cards = Array.from(selectedCards).map((i) => ({
        front: highlights[i].hanzi,
        back: `${highlights[i].pinyin} — ${highlights[i].english}`,
      }));
      const result = await saveFlashcardsFromEntry(entryId, cards);
      const parts: string[] = [];
      if (result.saved > 0) parts.push(`Saved ${result.saved}`);
      if (result.duplicates > 0) parts.push(`${result.duplicates} already existed`);
      setSaveStatus(parts.join(", "));
    } finally {
      setIsSaving(false);
    }
  }

  // Reset state when dialog opens
  function handleOpenChange(v: boolean) {
    if (v) {
      setCurrentIndex(0);
      setFlipped(false);
      setCompleted(false);
      setSaveStatus(null);
      setSelectedCards(new Set());
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
          <div data-testid="flashcard-mode-complete" className="py-6 text-center">
            <p className="mb-2 text-lg font-semibold text-gray-900">All done!</p>
            <p className="mb-4 text-sm text-gray-500">
              You reviewed {total} {total === 1 ? "card" : "cards"} from this entry.
            </p>

            {/* Save to Flashcards */}
            {entryId && !saveStatus && (
              <div className="mb-4 rounded-lg border bg-gray-50 p-4 text-left">
                <p className="mb-2 text-xs font-semibold text-gray-600">Save to Flashcards</p>
                <div className="max-h-40 space-y-1 overflow-auto">
                  {highlights.map((h, i) => (
                    <label
                      key={h.hanzi}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCards.has(i)}
                        onChange={() => toggleCard(i)}
                        className="accent-[var(--cn-orange)]"
                      />
                      <span className="font-medium text-gray-900">{h.hanzi}</span>
                      <span className="text-xs text-gray-500">{h.pinyin}</span>
                    </label>
                  ))}
                </div>
                <Button
                  data-testid="flashcard-mode-save"
                  onClick={handleSaveFlashcards}
                  disabled={isSaving || selectedCards.size === 0}
                  className="mt-3 w-full bg-[var(--cn-orange)] hover:bg-[var(--cn-orange-dark)] text-sm"
                  size="sm"
                >
                  {isSaving ? "Saving..." : `Save ${selectedCards.size} to Flashcards`}
                </Button>
              </div>
            )}

            {saveStatus && (
              <p className="mb-4 text-sm font-medium text-green-600">{saveStatus}</p>
            )}

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
                  <p className="text-5xl font-bold text-gray-900">{card.hanzi}</p>
                  <p className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400">
                    <Eye className="h-3.5 w-3.5" />
                    Tap to reveal
                  </p>
                </div>
              ) : (
                <div data-testid="flashcard-mode-back" className="text-center">
                  <p className="text-lg font-medium text-gray-900">{card.pinyin}</p>
                  <p className="mt-1 text-sm text-gray-600">{card.english}</p>
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
