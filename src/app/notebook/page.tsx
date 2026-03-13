import { getJournalEntries, getEntryAnnotations } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-utils";
import { JournalEntryView } from "@/components/notebook/journal-entry";
import { NotebookActionBar } from "@/components/notebook/action-bar";
import { EntryList } from "@/components/notebook/entry-list";
import { GlossProvider } from "@/components/notebook/gloss-context";
import { MobileJournalPage } from "@/components/notebook/mobile-journal-page";

export const dynamic = "force-dynamic";

export default function NotebookPage({
  searchParams,
}: {
  searchParams: Promise<{ entry?: string }>;
}) {
  return <NotebookPageInner searchParamsPromise={searchParams} />;
}

async function NotebookPageInner({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ entry?: string }>;
}) {
  const { entry: selectedEntryId } = await searchParamsPromise;
  const userId = await getAuthUserId();
  const entries = getJournalEntries(userId);
  const activeEntry = selectedEntryId
    ? entries.find((e) => e.id === selectedEntryId) ?? entries[0]
    : entries[0];

  const annotations = activeEntry ? getEntryAnnotations(activeEntry.id) : [];

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
        <NotebookActionBar entry={activeEntry} />

        {/* Mobile action bar + entry list sheet */}
        <MobileJournalPage entry={activeEntry} entries={entries} />
      </div>
    </GlossProvider>
  );
}
