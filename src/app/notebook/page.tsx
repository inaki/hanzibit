import { getJournalEntries, getEntryHighlights, getEntryAnnotations } from "@/lib/data";
import { DEV_USER_ID } from "@/lib/constants";
import { JournalEntryView } from "@/components/notebook/journal-entry";
import { NotebookActionBar } from "@/components/notebook/action-bar";
import { EntryList } from "@/components/notebook/entry-list";

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
  const entries = getJournalEntries(DEV_USER_ID);
  const activeEntry = selectedEntryId
    ? entries.find((e) => e.id === selectedEntryId) ?? entries[0]
    : entries[0];

  const highlights = activeEntry ? getEntryHighlights(activeEntry.id) : [];
  const annotations = activeEntry ? getEntryAnnotations(activeEntry.id) : [];

  return (
    <div data-testid="notebook-page" className="flex h-full">
      {/* Entry sidebar list */}
      <EntryList entries={entries} activeEntryId={activeEntry?.id} />

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6 md:p-10">
        {activeEntry ? (
          <JournalEntryView
            entry={activeEntry}
            highlights={highlights}
            annotations={annotations}
          />
        ) : (
          <div data-testid="notebook-empty-state" className="flex h-full items-center justify-center text-gray-400">
            <p>No journal entries yet. Create your first entry!</p>
          </div>
        )}
      </div>

      <NotebookActionBar />
    </div>
  );
}
