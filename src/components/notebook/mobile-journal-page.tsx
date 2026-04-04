"use client";

import { useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Volume2, Layers, Eye, RotateCcw } from "lucide-react";
import type { JournalEntry } from "@/lib/data";
import { parseInput, extractHanziTokens } from "@/lib/parse-tokens";
import {
  createJournalEntry,
  updateJournalEntry,
  saveFlashcardsFromEntry,
} from "@/lib/actions";
import { MobileEntryList } from "./entry-list";
import { MobileActionBar } from "./mobile-action-bar";

interface MobileJournalPageProps {
  entry?: JournalEntry;
  entries: JournalEntry[];
}

export function MobileJournalPage({ entry, entries }: MobileJournalPageProps) {
  const highlights = entry
    ? extractHanziTokens(parseInput(entry.content_zh))
    : [];

  const [entryListOpen, setEntryListOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [pronunciationOpen, setPronunciationOpen] = useState(false);
  const [flashcardOpen, setFlashcardOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <MobileActionBar
        entry={entry}
        onEditOpen={() => setEditOpen(true)}
        onNewEntryOpen={() => setNewEntryOpen(true)}
        onPronunciationOpen={() => setPronunciationOpen(true)}
        onFlashcardOpen={() => setFlashcardOpen(true)}
        onEntryListOpen={() => setEntryListOpen(true)}
        hasHighlights={highlights.length > 0}
      />

      {/* Entry list sheet */}
      <Sheet open={entryListOpen} onOpenChange={setEntryListOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-xs p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Journal Entries</SheetTitle>
            <SheetDescription className="sr-only">Select a journal entry</SheetDescription>
          </SheetHeader>
          <MobileEntryList
            entries={entries}
            activeEntryId={entry?.id}
            onSelect={() => setEntryListOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Edit Entry Dialog */}
      {entry && (
        <MobileEditDialog
          entry={entry}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      {/* New Entry Dialog */}
      <MobileNewEntryDialog open={newEntryOpen} onOpenChange={setNewEntryOpen} />

      {/* Pronunciation Dialog */}
      <MobilePronunciationDialog
        highlights={highlights}
        open={pronunciationOpen}
        onOpenChange={setPronunciationOpen}
      />

      {/* Flashcard Mode Dialog */}
      <MobileFlashcardDialog
        highlights={highlights}
        open={flashcardOpen}
        onOpenChange={setFlashcardOpen}
        entryId={entry?.id}
      />
    </div>
  );
}

// --- Compact mobile dialogs ---

interface HanziItem {
  hanzi: string;
  pinyin: string;
  english: string;
}

function MobileEditDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: JournalEntry;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState(entry.content_zh);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateJournalEntry(formData);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
          <DialogDescription>Update this journal entry.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <input type="hidden" name="id" value={entry.id} />
          <div className="space-y-3 py-2">
            <Input name="title_zh" defaultValue={entry.title_zh} placeholder="Chinese Title" required />
            <Input name="title_en" defaultValue={entry.title_en} placeholder="English Title" required />
            <div className="flex gap-2">
              <Input name="unit" defaultValue={entry.unit || ""} placeholder="Unit" className="flex-1" />
              <Input name="hsk_level" type="number" min={1} max={6} defaultValue={entry.hsk_level} className="w-20" />
            </div>
            <textarea
              name="content_zh"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-[var(--cn-orange)] focus:ring-1 focus:ring-[var(--cn-orange)]"
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isPending} className="bg-[var(--cn-orange)] hover:bg-[var(--cn-orange-dark)]">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MobileNewEntryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createJournalEntry(formData);
      setContent("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Entry</DialogTitle>
          <DialogDescription>Write a new journal entry.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-3 py-2">
            <Input name="title_zh" placeholder="Chinese Title (e.g. 我的周末)" required />
            <Input name="title_en" placeholder="English Title (e.g. My Weekend)" required />
            <div className="flex gap-2">
              <Input name="unit" placeholder="Unit" className="flex-1" />
              <Input name="hsk_level" type="number" min={1} max={6} defaultValue={1} className="w-20" />
            </div>
            <textarea
              name="content_zh"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`我去[餐厅|can1 ting1|restaurant]吃饭。`}
              required
              rows={6}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-[var(--cn-orange)] focus:ring-1 focus:ring-[var(--cn-orange)]"
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isPending} className="bg-[var(--cn-orange)] hover:bg-[var(--cn-orange-dark)]">
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MobilePronunciationDialog({
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
      <DialogContent className="max-h-[85vh] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Volume2 className="mr-2 inline h-5 w-5 text-[var(--cn-orange)]" />
            Pronunciation
          </DialogTitle>
          <DialogDescription className="sr-only">Pronunciation guide</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-2 overflow-auto py-2">
          {highlights.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground/70">No vocabulary in this entry.</p>
          ) : (
            highlights.map((h) => (
              <div key={h.hanzi} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-[var(--cn-orange)]">{h.hanzi}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{h.pinyin}</p>
                    <p className="text-xs text-muted-foreground">{h.english}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    new Audio(`/api/tts?text=${encodeURIComponent(h.hanzi)}`).play();
                  }}
                  className="rounded-full bg-[var(--cn-orange-light)] p-2 text-[var(--cn-orange)] transition-colors hover:bg-[var(--cn-orange)] hover:text-white"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileFlashcardDialog({
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

  async function handleSave() {
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

  function handleOpenChange(v: boolean) {
    if (v) restart();
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Layers className="mr-2 inline h-5 w-5 text-[var(--cn-orange)]" />
            Flashcards
          </DialogTitle>
          <DialogDescription>{total} cards from this entry.</DialogDescription>
        </DialogHeader>

        {total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground/70">No vocabulary to practice.</p>
        ) : completed ? (
          <div className="py-6 text-center">
            <p className="mb-2 text-lg font-semibold">All done!</p>
            <p className="mb-4 text-sm text-muted-foreground">Reviewed {total} cards.</p>
            {entryId && !saveStatus && (
              <div className="mb-4 rounded-lg border bg-muted/50 p-3 text-left">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Save to Flashcards</p>
                <div className="max-h-32 space-y-1 overflow-auto">
                  {highlights.map((h, i) => (
                    <label key={h.hanzi} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedCards.has(i)}
                        onChange={() => toggleCard(i)}
                        className="accent-[var(--cn-orange)]"
                      />
                      <span className="font-medium">{h.hanzi}</span>
                      <span className="text-xs text-muted-foreground/70">{h.pinyin}</span>
                    </label>
                  ))}
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || selectedCards.size === 0}
                  className="mt-2 w-full bg-[var(--cn-orange)] hover:bg-[var(--cn-orange-dark)]"
                  size="sm"
                >
                  {isSaving ? "Saving..." : `Save ${selectedCards.size} Cards`}
                </Button>
              </div>
            )}
            {saveStatus && <p className="mb-4 text-sm font-medium text-green-600">{saveStatus}</p>}
            <Button onClick={restart} variant="outline" size="sm">
              <RotateCcw className="mr-1.5 h-4 w-4" /> Again
            </Button>
          </div>
        ) : (
          <>
            <div className="text-xs text-muted-foreground/70">
              Card {currentIndex + 1} of {total}
            </div>
            <button
              onClick={() => setFlipped(!flipped)}
              className="flex h-40 w-full items-center justify-center rounded-xl border-2 bg-card"
            >
              {!flipped ? (
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">{card.hanzi}</p>
                  <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground/70">
                    <Eye className="h-3.5 w-3.5" /> Tap to reveal
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">{card.pinyin}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.english}</p>
                </div>
              )}
            </button>
            <div className="flex justify-center gap-3">
              <Button onClick={() => setFlipped(!flipped)} variant="outline" size="sm">
                <RotateCcw className="mr-1.5 h-4 w-4" /> Flip
              </Button>
              <Button
                onClick={next}
                size="sm"
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
