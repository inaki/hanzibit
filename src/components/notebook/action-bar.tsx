"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
  Trash2,
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionRailButton } from "@/components/patterns/action-rail";
import { DialogFormActions, FormErrorNotice } from "@/components/patterns/forms";
import { GuidanceBanner } from "@/components/patterns/guidance";
import type { JournalEntry } from "@/lib/data";
import { toggleBookmarkAction, createJournalEntry, updateJournalEntry, saveFlashcardsFromEntry, deleteJournalEntry } from "@/lib/actions";
import { parseInput, extractHanziTokens, replaceTextRange, validateInlineMarkup } from "@/lib/parse-tokens";
import { useGloss } from "./gloss-context";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { AnnotationBuilder, ContentPreview, GuidedDraftPanel, JournalFeedbackPanel, MarkupValidationPanel } from "./markup-assist";
import { useRouter } from "next/navigation";

interface NotebookActionBarProps {
  entry?: JournalEntry;
  isPro?: boolean;
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

export function NotebookActionBar({
  entry,
  isPro = false,
  initialNewEntryOpen = false,
  newEntryDraft,
}: NotebookActionBarProps) {
  const highlights = entry
    ? extractHanziTokens(parseInput(entry.content_zh))
    : [];
  const [editOpen, setEditOpen] = useState(false);
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [pronunciationOpen, setPronunciationOpen] = useState(false);
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [printUpgradeOpen, setPrintUpgradeOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(entry?.bookmarked === 1);
  const [isPending, startTransition] = useTransition();
  const gloss = useGloss();

  useEffect(() => {
    if (!initialNewEntryOpen) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    const timer = window.setTimeout(() => {
      setNewEntryOpen(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialNewEntryOpen]);

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
    if (!isPro) {
      setPrintUpgradeOpen(true);
      return;
    }
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
  <title>Print — HanziBit</title>
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
      <div data-testid="notebook-action-bar" className="hidden w-14 flex-col items-center gap-2 border-l bg-card py-4 lg:flex">
        {/* Edit */}
        <ActionRailButton
          testId="action-bar-edit"
          label="Edit entry"
          icon={Pencil}
          onClick={() => setEditOpen(true)}
          disabled={!entry}
        />

        {/* Pronunciation */}
        <ActionRailButton
          testId="action-bar-pronunciation"
          label="Pronunciation"
          icon={Mic}
          onClick={() => setPronunciationOpen(true)}
          disabled={highlights.length === 0}
        />

        {/* Flashcard mode */}
        <ActionRailButton
          testId="action-bar-flashcard"
          label="Flashcard mode"
          icon={Layers}
          onClick={() => setFlashcardOpen(true)}
          disabled={highlights.length === 0}
        />

        {/* Interlinear Gloss */}
        <Tooltip>
          <TooltipTrigger
            data-testid="action-bar-gloss"
            onMouseEnter={() => entry && gloss.activate(entry.id, entry.content_zh)}
            onMouseLeave={() => gloss.deactivate()}
            onClick={() => entry && gloss.toggleSticky(entry.id, entry.content_zh)}
            disabled={!entry}
            className={`press-down rounded-[10px] p-2.5 transition-colors disabled:opacity-30 ${
              gloss.state.sticky
                ? "bg-[var(--cn-orange)] text-white"
                : "text-muted-foreground/70 hover:bg-muted hover:text-foreground"
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
        <ActionRailButton
          testId="action-bar-new-entry"
          label="New entry"
          icon={Plus}
          onClick={() => setNewEntryOpen(true)}
          filled
          className="rounded-full p-3 shadow-lg"
        />

        {/* Bookmark */}
        <ActionRailButton
          testId="action-bar-bookmark"
          label={bookmarked ? "Bookmarked" : "Bookmark"}
          onClick={handleBookmark}
          disabled={!entry || isPending}
          filled
          danger={!bookmarked}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-[18px] w-[18px]" />
          ) : (
            <Bookmark className="h-[18px] w-[18px]" />
          )}
        </ActionRailButton>

        {/* Print */}
        <ActionRailButton
          testId="action-bar-print"
          label="Print"
          icon={Printer}
          onClick={handlePrint}
          disabled={!entry}
        />
      </div>

      {/* --- Dialogs --- */}

      {/* Print upgrade dialog */}
      <Dialog open={printUpgradeOpen} onOpenChange={setPrintUpgradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pro Feature</DialogTitle>
            <DialogDescription>Print and export are available on the Pro plan.</DialogDescription>
          </DialogHeader>
          <UpgradePrompt reason="Upgrade to Pro to print and export your journal entries." />
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      {entry && (
        <EditEntryDialog
          entry={entry}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      {/* New Entry Dialog */}
      <NewEntryDialog
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
      <GuidanceBanner title="Vocabulary markup" tone="orange" className="px-3 py-2 text-xs text-foreground/80">
        <p className="mt-1">
          Wrap words in <code className="rounded bg-card px-1 py-0.5 font-mono text-[var(--cn-orange)]">[汉字|pīnyīn|english]</code> to highlight them.
        </p>
        <p className="mt-1 text-muted-foreground">
          Example: <code className="font-mono">我去[餐厅|can1 ting1|restaurant]吃饭</code>
        </p>
      </GuidanceBanner>
      <GuidanceBanner title="Tone shortcut" tone="amber" className="px-3 py-2 text-xs text-foreground/80">
        <p className="mt-1 font-mono text-muted-foreground">
          a1→ā &nbsp; a2→á &nbsp; a3→ǎ &nbsp; a4→à &nbsp; v=ü
        </p>
        <p className="mt-0.5 text-muted-foreground">
          e.g. <code className="font-mono">ni3 hao3</code> → nǐ hǎo
        </p>
      </GuidanceBanner>
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
  const [isDeleting, startDeleteTransition] = useTransition();
  const [preview, setPreview] = useState(false);
  const [content, setContent] = useState(entry.content_zh);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
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
  const router = useRouter();

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

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteJournalEntry(entry.id);
      if ("error" in result) {
        setSubmitError(result.error);
        setConfirmDelete(false);
        return;
      }

      setConfirmDelete(false);
      onOpenChange(false);
      router.push("/notebook");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="edit-entry-dialog" className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
          <DialogDescription>
            Update this journal entry.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <input type="hidden" name="id" value={entry.id} />
          <div className="themed-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto py-2 pr-3">
            <div>
              <label data-testid="edit-entry-title-zh-label" className="mb-1 block text-sm font-medium text-foreground/80">
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
              <label data-testid="edit-entry-title-en-label" className="mb-1 block text-sm font-medium text-foreground/80">
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
                <label className="mb-1 block text-sm font-medium text-foreground/80">Unit</label>
                <Input data-testid="edit-entry-unit" name="unit" defaultValue={entry.unit || ""} />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-sm font-medium text-foreground/80">HSK</label>
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
                <label data-testid="edit-entry-content-label" className="block text-sm font-medium text-foreground/80">
                  Content
                </label>
                <button
                  type="button"
                  data-testid="edit-entry-preview-toggle"
                  onClick={() => setPreview((p) => !p)}
                  className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                    preview
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {preview ? "Hide Preview" : "Preview"}
                </button>
              </div>
              <textarea
                data-testid="edit-entry-content"
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
              <div className="mt-3 space-y-3">
                <AnnotationBuilder
                  onInsert={handleInsertAnnotation}
                  selectedText={selectedText}
                  onUseSelection={captureSelection}
                  currentHskLevel={entry.hsk_level}
                />
                <MarkupValidationPanel content={content} />
                <JournalFeedbackPanel content={content} />
                {submitError && <FormErrorNotice>{submitError}</FormErrorNotice>}
              </div>
              {preview && <ContentPreview content={content} />}
            </div>
            <MarkupHelp />
          </div>
          <DialogFooter>
            <DialogFormActions
              submitLabel="Save Changes"
              submitPendingLabel="Saving..."
              submitDisabled={hasMarkupIssues}
              isPending={isPending}
              submitTestId="edit-entry-submit"
              leading={
                <Button
                  type="button"
                  variant="ghost"
                  className="ui-tone-rose-text mr-auto hover:bg-[var(--ui-tone-rose-surface)] hover:ui-tone-rose-soft-text"
                  onClick={() => setConfirmDelete((value) => !value)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
              destructiveConfirm={
                confirmDelete ? (
                  <Button
                    data-testid="edit-entry-delete-confirm"
                    type="button"
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={handleDelete}
                  >
                    {isDeleting ? "Deleting..." : "Delete Entry"}
                  </Button>
                ) : undefined
              }
            />
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
  const [preview, setPreview] = useState(false);
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
      setPreview(false);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="new-entry-dialog" className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{draft?.beginner ? "Try One Sentence" : "New Journal Entry"}</DialogTitle>
          <DialogDescription>
            {draft?.beginner
              ? "Optional: keep the ready-made sentence, change one small part, or close this and review instead."
              : "Write a new journal entry in Mandarin."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <input type="hidden" name="source_type" value={draft?.sourceType ?? ""} />
          <input type="hidden" name="source_ref" value={draft?.sourceRef ?? ""} />
          <input type="hidden" name="source_prompt" value={draft?.prompt ?? ""} />
          <input type="hidden" name="assignment_id" value={draft?.assignmentId ?? ""} />
          <div className="themed-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto py-2 pr-3">
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
                <GuidanceBanner title="Start small" tone="sky" className="px-4 py-3 text-sm">
                  You can keep the ready-made sentence as it is, change one small part, or skip writing for now. This step is optional.
                </GuidanceBanner>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">
                    Chinese Title
                  </label>
                  <Input
                    data-testid="new-entry-title-zh"
                    name="title_zh"
                    placeholder="e.g. 我的周末"
                    defaultValue={draft?.titleZh ?? ""}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">
                    English Title
                  </label>
                  <Input
                    data-testid="new-entry-title-en"
                    name="title_en"
                    placeholder="e.g. My Weekend"
                    defaultValue={draft?.titleEn ?? ""}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Unit</label>
                    <Input data-testid="new-entry-unit" name="unit" placeholder="e.g. Unit 8: Hobbies" defaultValue={draft?.unit ?? ""} />
                  </div>
                  <div className="w-24">
                    <label className="mb-1 block text-sm font-medium text-foreground/80">HSK</label>
                    <Input data-testid="new-entry-hsk-level" name="hsk_level" type="number" min={1} max={6} defaultValue={draft?.hskLevel ?? 1} />
                  </div>
                </div>
              </>
            )}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground/80">
                  Content
                </label>
                <button
                  type="button"
                  data-testid="new-entry-preview-toggle"
                  onClick={() => setPreview((p) => !p)}
                  className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                    preview
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {preview ? "Hide Preview" : "Preview"}
                </button>
              </div>
              <textarea
                data-testid="new-entry-content"
                name="content_zh"
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onSelect={captureSelection}
                onKeyUp={captureSelection}
                onMouseUp={captureSelection}
                placeholder={`我去[餐厅|can1 ting1|restaurant]吃饭。\n[服务员|fu2 wu4 yuan2|waiter]很热情。`}
                required
                rows={draft?.beginner ? 4 : 6}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)] focus:ring-1 focus:ring-[var(--ui-tone-orange-border)]"
              />
              {!!draft?.prompt && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {draft?.beginner
                    ? "Keep this sentence, change one small part, or close this and go review."
                    : "Use the prompt above, then write your own response below."}
                </p>
              )}
              <div className="mt-3 space-y-3">
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
                {submitError && <FormErrorNotice>{submitError}</FormErrorNotice>}
              </div>
              {preview && content && <ContentPreview content={content} />}
            </div>
            <MarkupHelp />
          </div>
          <DialogFooter>
            <DialogFormActions
              submitLabel={draft?.beginner ? "Save sentence" : "Create Entry"}
              submitPendingLabel="Creating..."
              submitDisabled={hasMarkupIssues}
              isPending={isPending}
              submitTestId="new-entry-submit"
            />
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
            <Volume2 className="ui-tone-orange-text mr-2 inline h-5 w-5" />
            Pronunciation Guide
          </DialogTitle>
          <DialogDescription>
            Pinyin pronunciation for vocabulary in this entry.
          </DialogDescription>
        </DialogHeader>
        <div data-testid="pronunciation-list" className="max-h-80 space-y-2 overflow-auto py-2">
          {highlights.length === 0 ? (
            <p data-testid="pronunciation-empty" className="py-4 text-center text-sm text-muted-foreground/70">
              No vocabulary highlights in this entry.
            </p>
          ) : (
            highlights.map((h) => (
              <div
                key={h.hanzi}
                data-testid={`pronunciation-item-${h.hanzi}`}
                className="flex items-center justify-between rounded-lg bg-card card-ring px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <span className="ui-tone-orange-text text-2xl font-bold">
                    {h.hanzi}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{h.pinyin}</p>
                    <p className="text-xs text-muted-foreground">{h.english}</p>
                  </div>
                </div>
                <button
                  data-testid={`pronunciation-speak-${h.hanzi}`}
                  onClick={() => {
                    new Audio(`/api/tts?text=${encodeURIComponent(h.hanzi)}`).play();
                  }}
                  className="ui-tone-orange-panel ui-tone-orange-text rounded-full border p-2 transition-colors hover:bg-primary hover:text-primary-foreground"
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
            <Layers className="ui-tone-orange-text mr-2 inline h-5 w-5" />
            Flashcard Mode
          </DialogTitle>
          <DialogDescription>
            Review the vocabulary from this entry. {total} cards.
          </DialogDescription>
        </DialogHeader>

        {total === 0 ? (
          <p data-testid="flashcard-mode-empty" className="py-8 text-center text-sm text-muted-foreground/70">
            No vocabulary highlights to practice.
          </p>
        ) : completed ? (
          <div data-testid="flashcard-mode-complete" className="py-6 text-center">
            <p className="mb-2 text-lg font-semibold text-foreground">All done!</p>
            <p className="mb-4 text-sm text-muted-foreground">
              You reviewed {total} {total === 1 ? "card" : "cards"} from this entry.
            </p>

            {/* Save to Flashcards */}
            {entryId && !saveStatus && (
              <div className="mb-4 rounded-lg border bg-muted/50 p-4 text-left">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Save to Flashcards</p>
                <div className="max-h-40 space-y-1 overflow-auto">
                  {highlights.map((h, i) => (
                    <label
                      key={h.hanzi}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCards.has(i)}
                        onChange={() => toggleCard(i)}
                        className="accent-primary"
                      />
                      <span className="font-medium text-foreground">{h.hanzi}</span>
                      <span className="text-xs text-muted-foreground">{h.pinyin}</span>
                    </label>
                  ))}
                </div>
                <Button
                  data-testid="flashcard-mode-save"
                  onClick={handleSaveFlashcards}
                  disabled={isSaving || selectedCards.size === 0}
                  className="mt-3 w-full bg-primary text-sm hover:opacity-90"
                  size="sm"
                >
                  {isSaving ? "Saving..." : `Save ${selectedCards.size} to Flashcards`}
                </Button>
              </div>
            )}

            {saveStatus && (
              <p className="ui-tone-emerald-panel ui-tone-emerald-text mb-4 rounded-lg border px-3 py-2 text-sm font-medium">{saveStatus}</p>
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
            <div data-testid="flashcard-mode-progress" className="flex items-center gap-2 text-xs text-muted-foreground/70">
              <span>Card {currentIndex + 1} of {total}</span>
              <div className="h-[10px] flex-1 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            {/* Card */}
            <button
              data-testid="flashcard-mode-card"
              onClick={() => setFlipped(!flipped)}
              className="flex h-48 w-full items-center justify-center rounded-[20px] bg-card card-ring transition-all hover:shadow-md"
            >
              {!flipped ? (
                <div data-testid="flashcard-mode-front" className="text-center">
                  <p className="text-5xl font-bold text-foreground">{card.hanzi}</p>
                  <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground/70">
                    <Eye className="h-3.5 w-3.5" />
                    Tap to reveal
                  </p>
                </div>
              ) : (
                <div data-testid="flashcard-mode-back" className="text-center">
                  <p className="text-lg font-medium text-foreground">{card.pinyin}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.english}</p>
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
                className="bg-primary hover:opacity-90"
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
