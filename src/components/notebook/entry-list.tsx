"use client";

import Link from "next/link";
import type { JournalEntry } from "@/lib/data";

interface EntryListProps {
  entries: JournalEntry[];
  activeEntryId?: string;
  onSelect?: () => void;
}

function EntryListContent({ entries, activeEntryId, onSelect }: EntryListProps) {
  if (entries.length === 0) return null;

  return (
    <div className="p-4">
      <h2 data-testid="journal-entry-list-heading" className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
        Journal Entries
      </h2>
      <div className="space-y-1">
        {entries.map((entry) => {
          const isActive = entry.id === activeEntryId;
          const date = new Date(entry.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          return (
            <Link
              key={entry.id}
              href={`/notebook?entry=${entry.id}`}
              onClick={onSelect}
              data-testid={`journal-entry-list-item-${entry.id}`}
              className={`block rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? "bg-[var(--cn-orange-light)] border border-[var(--cn-orange)]/20"
                  : "hover:bg-gray-50"
              }`}
            >
              <p className={`text-sm font-medium ${isActive ? "text-[var(--cn-orange)]" : "text-gray-900"}`}>
                {entry.title_zh}
              </p>
              <p className="text-xs text-gray-500">
                {entry.title_en}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">{date}</span>
                <span className="text-[10px] text-gray-400">HSK {entry.hsk_level}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Desktop sidebar entry list */
export function EntryList({ entries, activeEntryId }: EntryListProps) {
  if (entries.length === 0) return null;

  return (
    <div data-testid="journal-entry-list" className="hidden w-64 shrink-0 overflow-auto border-r bg-white md:block">
      <EntryListContent entries={entries} activeEntryId={activeEntryId} />
    </div>
  );
}

/** Mobile entry list (used inside a Sheet) */
export function MobileEntryList({ entries, activeEntryId, onSelect }: EntryListProps) {
  return (
    <div className="overflow-auto">
      <EntryListContent entries={entries} activeEntryId={activeEntryId} onSelect={onSelect} />
    </div>
  );
}
