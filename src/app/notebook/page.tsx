import Link from "next/link";
import { getJournalEntries, getEntryAnnotations } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-utils";
import { isProUser } from "@/lib/subscription";
import { JournalEntryView } from "@/components/notebook/journal-entry";
import { NotebookActionBar } from "@/components/notebook/action-bar";
import { EntryList } from "@/components/notebook/entry-list";
import { GlossProvider } from "@/components/notebook/gloss-context";
import { MobileJournalPage } from "@/components/notebook/mobile-journal-page";

export const dynamic = "force-dynamic";

interface JournalDraftPrefill {
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
}

export default function NotebookPage({
  searchParams,
}: {
  searchParams: Promise<{
    entry?: string;
    new?: string;
    draftTitleZh?: string;
    draftTitleEn?: string;
    draftUnit?: string;
    draftLevel?: string;
    draftContentZh?: string;
    draftSelectedText?: string;
    draftPrompt?: string;
    draftSourceZh?: string;
    draftSourceEn?: string;
    draftTargetWord?: string;
    draftTargetPinyin?: string;
    draftTargetEnglish?: string;
    draftSourceType?: string;
    draftSourceRef?: string;
    draftAssignmentId?: string;
    draftBeginner?: string;
  }>;
}) {
  return <NotebookPageInner searchParamsPromise={searchParams} />;
}

async function NotebookPageInner({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{
    entry?: string;
    new?: string;
    draftTitleZh?: string;
    draftTitleEn?: string;
    draftUnit?: string;
    draftLevel?: string;
    draftContentZh?: string;
    draftSelectedText?: string;
    draftPrompt?: string;
    draftSourceZh?: string;
    draftSourceEn?: string;
    draftTargetWord?: string;
    draftTargetPinyin?: string;
    draftTargetEnglish?: string;
    draftSourceType?: string;
    draftSourceRef?: string;
    draftAssignmentId?: string;
    draftBeginner?: string;
  }>;
}) {
  const {
    entry: selectedEntryId,
    new: shouldOpenNewEntry,
    draftTitleZh,
    draftTitleEn,
    draftUnit,
    draftLevel,
    draftContentZh,
    draftSelectedText,
    draftPrompt,
    draftSourceZh,
    draftSourceEn,
    draftTargetWord,
    draftTargetPinyin,
    draftTargetEnglish,
    draftSourceType,
    draftSourceRef,
    draftAssignmentId,
    draftBeginner,
  } = await searchParamsPromise;
  const userId = await getAuthUserId();
  const [entries, isPro] = await Promise.all([
    getJournalEntries(userId),
    isProUser(userId),
  ]);
  const activeEntry = selectedEntryId
    ? entries.find((e) => e.id === selectedEntryId) ?? entries[0]
    : entries[0];

  const annotations = activeEntry
    ? await getEntryAnnotations(activeEntry.id)
    : [];

  const draft: JournalDraftPrefill = {
    titleZh: draftTitleZh ?? "",
    titleEn: draftTitleEn ?? "",
    unit: draftUnit ?? "",
    hskLevel: Number.parseInt(draftLevel ?? "1", 10) || 1,
    contentZh: draftContentZh ?? "",
    selectedText: draftSelectedText ?? "",
    prompt: draftPrompt ?? "",
    sourceZh: draftSourceZh ?? "",
    sourceEn: draftSourceEn ?? "",
    targetWord: draftTargetWord ?? "",
    targetPinyin: draftTargetPinyin ?? "",
    targetEnglish: draftTargetEnglish ?? "",
    sourceType: draftSourceType ?? "",
    sourceRef: draftSourceRef ?? "",
    assignmentId: draftAssignmentId ?? "",
    beginner: draftBeginner === "1",
  };

  return (
    <GlossProvider>
      <div data-testid="notebook-page" className="flex h-full">
        {/* Desktop entry sidebar list */}
        <EntryList entries={entries} activeEntryId={activeEntry?.id} />

        {/* Main content */}
        <div className="flex-1 overflow-auto p-4 pb-20 md:p-10 lg:pb-10">
          {activeEntry ? (
            <JournalEntryView
              entry={activeEntry}
              annotations={annotations}
            />
          ) : (
            <div data-testid="notebook-empty-state" className="flex h-full items-center justify-center px-6">
              <div className="max-w-sm text-center">
                <div className="mb-4 text-4xl font-bold text-[var(--cn-orange)]">你好</div>
                <h2 className="mb-2 text-xl font-bold text-foreground">Your journal is empty</h2>
                <p className="mb-6 text-sm leading-6 text-muted-foreground">
                  Write one short sentence using a word you just studied. Your entries will appear here and build into a real learning record.
                </p>
                <div className="flex flex-col items-center gap-3">
                  <Link
                    href="/notebook/lessons?level=1&beginner=1"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Start with one word →
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Or use the button above to create an entry directly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop action bar */}
        <NotebookActionBar
          entry={activeEntry}
          isPro={isPro}
          initialNewEntryOpen={shouldOpenNewEntry === "1"}
          newEntryDraft={draft}
        />

        {/* Mobile action bar + entry list sheet */}
        <MobileJournalPage
          entry={activeEntry}
          entries={entries}
          initialNewEntryOpen={shouldOpenNewEntry === "1"}
          newEntryDraft={draft}
        />
      </div>
    </GlossProvider>
  );
}
