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
  prompt?: string;
  sourceZh?: string;
  sourceEn?: string;
  targetWord?: string;
  sourceType?: string;
  sourceRef?: string;
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
    draftPrompt?: string;
    draftSourceZh?: string;
    draftSourceEn?: string;
    draftTargetWord?: string;
    draftSourceType?: string;
    draftSourceRef?: string;
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
    draftPrompt?: string;
    draftSourceZh?: string;
    draftSourceEn?: string;
    draftTargetWord?: string;
    draftSourceType?: string;
    draftSourceRef?: string;
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
    draftPrompt,
    draftSourceZh,
    draftSourceEn,
    draftTargetWord,
    draftSourceType,
    draftSourceRef,
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
    prompt: draftPrompt ?? "",
    sourceZh: draftSourceZh ?? "",
    sourceEn: draftSourceEn ?? "",
    targetWord: draftTargetWord ?? "",
    sourceType: draftSourceType ?? "",
    sourceRef: draftSourceRef ?? "",
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
            <div data-testid="notebook-empty-state" className="flex h-full items-center justify-center text-gray-400">
              <p>No journal entries yet. Create your first entry!</p>
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
