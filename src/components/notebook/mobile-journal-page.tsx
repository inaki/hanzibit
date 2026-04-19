"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
import { AudioPlayButton } from "./audio-play-button";
import { GuidanceBanner } from "@/components/patterns/guidance";
import type { JournalEntry } from "@/lib/data";
import { parseInput, extractHanziTokens, replaceTextRange, validateInlineMarkup } from "@/lib/parse-tokens";
import {
  createJournalEntry,
  updateJournalEntry,
  saveFlashcardsFromEntry,
} from "@/lib/actions";
import { MobileEntryList } from "./entry-list";
import { MobileActionBar } from "./mobile-action-bar";
import { AnnotationBuilder, GuidedDraftPanel, JournalFeedbackPanel, MarkupValidationPanel } from "./markup-assist";

interface MobileJournalPageProps {
  entry?: JournalEntry;
  entries: JournalEntry[];
  initialNewEntryOpen?: boolean;
  newEntryDraft?: {
    titleZh: string;
    titleEn: string;
    unit: string;
    hskLevel: number;
    contentZh: string;
    selectedText?: string;
    prompt?: string;
    sourceZh?: string;
    sourceEn?: string;
    targetWord?: string;
    targetPinyin?: string;
    targetEnglish?: string;
    sourceType?: string;
    sourceRef?: string;
    assignmentId?: string;
    beginner?: boolean;
  };
}

export function MobileJournalPage({
  entry,
  entries,
  initialNewEntryOpen = false,
  newEntryDraft,
}: MobileJournalPageProps) {
  const highlights = entry
    ? extractHanziTokens(parseInput(entry.content_zh))
    : [];

  const [entryListOpen, setEntryListOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [pronunciationOpen, setPronunciationOpen] = useState(false);
  const [flashcardOpen, setFlashcardOpen] = useState(false);

  useEffect(() => {
    if (!initialNewEntryOpen) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const timer = window.setTimeout(() => {
      setNewEntryOpen(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialNewEntryOpen]);

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
      <MobileNewEntryDialog
        key={[
          newEntryDraft?.titleZh ?? "",
          newEntryDraft?.titleEn ?? "",
          newEntryDraft?.unit ?? "",
          newEntryDraft?.hskLevel ?? 1,
          newEntryDraft?.contentZh ?? "",
        ].join("|")}
        open={newEntryOpen}
        onOpenChange={setNewEntryOpen}
        draft={newEntryDraft}
      />

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasMarkupIssues = validateInlineMarkup(content).length > 0;

  function handleInsertAnnotation(annotation: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? 0;
    const end = textarea?.selectionEnd ?? 0;
    const hasSelection = end > start;
    setContent((current) => {
      if (hasSelection) {
        return replaceTextRange(current, start, end, annotation);
      }
      if (!current.trim()) return annotation;
      const needsBreak = /[\n\s]$/.test(current);
      return `${current}${needsBreak ? "" : " "}${annotation}`;
    });
    setSelectedText("");
    if (hasSelection && textarea) {
      window.requestAnimationFrame(() => {
        textarea.focus();
        const nextPos = start + annotation.length;
        textarea.setSelectionRange(nextPos, nextPos);
      });
    }
  }

  function captureSelection() {
    const selection = textareaRef.current?.value.slice(
      textareaRef.current.selectionStart ?? 0,
      textareaRef.current.selectionEnd ?? 0
    ) ?? "";
    setSelectedText(selection);
  }

  function handleSubmit(formData: FormData) {
    setSubmitError(null);
    startTransition(async () => {
      const result = await updateJournalEntry(formData);
      if (result?.error) {
        setSubmitError(result.error);
        return;
      }
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
          <DialogDescription>Update this journal entry.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <input type="hidden" name="id" value={entry.id} />
          <div className="themed-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto py-2 pr-3">
            <Input name="title_zh" defaultValue={entry.title_zh} placeholder="Chinese Title" required />
            <Input name="title_en" defaultValue={entry.title_en} placeholder="English Title" required />
            <div className="flex gap-2">
              <Input name="unit" defaultValue={entry.unit || ""} placeholder="Unit" className="flex-1" />
              <Input name="hsk_level" type="number" min={1} max={6} defaultValue={entry.hsk_level} className="w-20" />
            </div>
            <textarea
              name="content_zh"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onSelect={captureSelection}
              onKeyUp={captureSelection}
              onMouseUp={captureSelection}
              required
              rows={6}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)] focus:ring-1 focus:ring-[var(--ui-tone-orange-border)]"
            />
            <AnnotationBuilder
              onInsert={handleInsertAnnotation}
              selectedText={selectedText}
              onUseSelection={captureSelection}
              currentHskLevel={entry.hsk_level}
            />
            <MarkupValidationPanel content={content} />
            {submitError && (
              <p className="ui-tone-rose-panel ui-tone-rose-text rounded-lg border px-3 py-2 text-sm">
                {submitError}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isPending || hasMarkupIssues} className="bg-primary text-primary-foreground hover:opacity-90">
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
  draft,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  draft?: {
    titleZh: string;
    titleEn: string;
    unit: string;
    hskLevel: number;
    contentZh: string;
    selectedText?: string;
    prompt?: string;
    sourceZh?: string;
    sourceEn?: string;
    targetWord?: string;
    targetPinyin?: string;
    targetEnglish?: string;
    sourceType?: string;
    sourceRef?: string;
    assignmentId?: string;
    beginner?: boolean;
  };
}) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState(draft?.contentZh ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasMarkupIssues = validateInlineMarkup(content).length > 0;

  function handleInsertAnnotation(annotation: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? 0;
    const end = textarea?.selectionEnd ?? 0;
    const hasSelection = end > start;
    setContent((current) => {
      if (hasSelection) {
        return replaceTextRange(current, start, end, annotation);
      }
      if (!current.trim()) return annotation;
      const needsBreak = /[\n\s]$/.test(current);
      return `${current}${needsBreak ? "" : " "}${annotation}`;
    });
    setSelectedText("");
    if (hasSelection && textarea) {
      window.requestAnimationFrame(() => {
        textarea.focus();
        const nextPos = start + annotation.length;
        textarea.setSelectionRange(nextPos, nextPos);
      });
    }
  }

  function captureSelection() {
    const selection = textareaRef.current?.value.slice(
      textareaRef.current.selectionStart ?? 0,
      textareaRef.current.selectionEnd ?? 0
    ) ?? "";
    setSelectedText(selection);
  }

  function handleSubmit(formData: FormData) {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createJournalEntry(formData);
      if (result?.error) {
        setSubmitError(result.error);
        return;
      }
      setContent("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{draft?.beginner ? "Try One Sentence" : "New Entry"}</DialogTitle>
          <DialogDescription>
            {draft?.beginner ? "Optional: keep the ready-made sentence, change one small part, or close this and review instead." : "Write a new journal entry."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <input type="hidden" name="source_type" value={draft?.sourceType ?? ""} />
          <input type="hidden" name="source_ref" value={draft?.sourceRef ?? ""} />
          <input type="hidden" name="source_prompt" value={draft?.prompt ?? ""} />
          <input type="hidden" name="assignment_id" value={draft?.assignmentId ?? ""} />
          <div className="themed-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto py-2 pr-3">
            <GuidedDraftPanel
              prompt={draft?.prompt}
              sourceZh={draft?.sourceZh}
              sourceEn={draft?.sourceEn}
              targetWord={draft?.targetWord}
              content={content}
            />
            {draft?.beginner ? (
              <>
                <input type="hidden" name="title_zh" value={draft?.titleZh ?? ""} />
                <input type="hidden" name="title_en" value={draft?.titleEn ?? ""} />
                <input type="hidden" name="unit" value={draft?.unit ?? ""} />
                <input type="hidden" name="hsk_level" value={draft?.hskLevel ?? 1} />
                <GuidanceBanner title="Start small" tone="sky" className="px-3 py-3 text-sm">
                  You can keep the ready-made sentence as it is, change one small part, or skip this and go review.
                </GuidanceBanner>
              </>
            ) : (
              <>
                <Input name="title_zh" placeholder="Chinese Title (e.g. 我的周末)" defaultValue={draft?.titleZh ?? ""} required />
                <Input name="title_en" placeholder="English Title (e.g. My Weekend)" defaultValue={draft?.titleEn ?? ""} required />
                <div className="flex gap-2">
                  <Input name="unit" placeholder="Unit" defaultValue={draft?.unit ?? ""} className="flex-1" />
                  <Input name="hsk_level" type="number" min={1} max={6} defaultValue={draft?.hskLevel ?? 1} className="w-20" />
                </div>
              </>
            )}
            <textarea
              name="content_zh"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onSelect={captureSelection}
              onKeyUp={captureSelection}
              onMouseUp={captureSelection}
              placeholder={`我去[餐厅|can1 ting1|restaurant]吃饭。`}
              required
              rows={draft?.beginner ? 4 : 6}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)] focus:ring-1 focus:ring-[var(--ui-tone-orange-border)]"
            />
            {!!draft?.prompt && (
              <p className="text-xs text-muted-foreground">
                {draft?.beginner
                  ? "Keep this sentence, change one small part, or close this and go review."
                  : "Read the prompt above, then write your own answer here."}
              </p>
            )}
            <AnnotationBuilder
              onInsert={handleInsertAnnotation}
              selectedText={selectedText || draft?.selectedText}
              onUseSelection={captureSelection}
              currentHskLevel={draft?.hskLevel ?? 1}
              suggestedAnnotation={
                draft?.targetWord && draft?.targetPinyin && draft?.targetEnglish
                  ? {
                      hanzi: draft.targetWord,
                      pinyin: draft.targetPinyin,
                      english: draft.targetEnglish,
                    }
                  : undefined
              }
            />
            <MarkupValidationPanel content={content} />
            <JournalFeedbackPanel content={content} targetWord={draft?.targetWord} />
            {submitError && (
              <p className="ui-tone-rose-panel ui-tone-rose-text rounded-lg border px-3 py-2 text-sm">
                {submitError}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isPending || hasMarkupIssues} className="bg-primary text-primary-foreground hover:opacity-90">
              {isPending ? "Creating..." : draft?.beginner ? "Save sentence" : "Create"}
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
            <Volume2 className="ui-tone-orange-text mr-2 inline h-5 w-5" />
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
                  <span className="ui-tone-orange-text text-2xl font-bold">{h.hanzi}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{h.pinyin}</p>
                    <p className="text-xs text-muted-foreground">{h.english}</p>
                  </div>
                </div>
                <AudioPlayButton
                  text={h.hanzi}
                  type="word"
                  size="md"
                  className="ui-tone-orange-panel ui-tone-orange-text border"
                />
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
            <Layers className="ui-tone-orange-text mr-2 inline h-5 w-5" />
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
                        className="accent-primary"
                      />
                      <span className="font-medium">{h.hanzi}</span>
                      <span className="text-xs text-muted-foreground/70">{h.pinyin}</span>
                    </label>
                  ))}
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || selectedCards.size === 0}
                  className="mt-2 w-full bg-primary text-primary-foreground hover:opacity-90"
                  size="sm"
                >
                  {isSaving ? "Saving..." : `Save ${selectedCards.size} Cards`}
                </Button>
              </div>
            )}
            {saveStatus && (
              <p className="ui-tone-emerald-panel ui-tone-emerald-text mb-4 rounded-lg border px-3 py-2 text-sm font-medium">
                {saveStatus}
              </p>
            )}
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
                className="bg-primary text-primary-foreground hover:opacity-90"
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
