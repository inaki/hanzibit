"use client";

import { useState } from "react";
import type { VocabularyItem } from "@/lib/data";

interface VocabularyListProps {
  items: VocabularyItem[];
}

const categories = ["all", "greetings", "verbs", "adjectives", "food", "places", "professions", "family", "shopping", "nature", "technology", "people", "daily life", "general"];

export function VocabularyList({ items }: VocabularyListProps) {
  const [filter, setFilter] = useState("all");
  const [hskFilter, setHskFilter] = useState<number | null>(null);

  const filtered = items.filter((item) => {
    if (filter !== "all" && item.category !== filter) return false;
    if (hskFilter !== null && item.hsk_level !== hskFilter) return false;
    return true;
  });

  const usedCategories = categories.filter(
    (c) => c === "all" || items.some((i) => i.category === c)
  );

  return (
    <div data-testid="vocabulary-list" className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 data-testid="vocabulary-list-heading" className="text-3xl font-bold text-gray-900">Vocabulary List</h1>
        <p data-testid="vocabulary-list-count" className="mt-1 text-sm text-gray-500">
          {filtered.length} {filtered.length === 1 ? "word" : "words"}
          {filter !== "all" ? ` in "${filter}"` : ""}
          {hskFilter !== null ? ` · HSK ${hskFilter}` : ""}
        </p>
      </div>

      {/* Filters */}
      <div data-testid="vocabulary-filters" className="mb-6 flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-1.5">
          {usedCategories.map((cat) => (
            <button
              key={cat}
              data-testid={`vocabulary-filter-${cat}`}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === cat
                  ? "bg-[var(--cn-orange)] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          {[null, 1, 2].map((level) => (
            <button
              key={level ?? "any"}
              data-testid={`vocabulary-hsk-filter-${level ?? "all"}`}
              onClick={() => setHskFilter(level)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                hskFilter === level
                  ? "bg-[var(--cn-orange)] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {level === null ? "All HSK" : `HSK ${level}`}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Table */}
      <div data-testid="vocabulary-table" className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Character</th>
              <th className="px-5 py-3">Pinyin</th>
              <th className="px-5 py-3">Meaning</th>
              <th className="px-5 py-3">HSK</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Mastery</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((item) => (
              <tr
                key={item.id}
                data-testid={`vocabulary-row-${item.character_zh}`}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="px-5 py-3 text-lg font-bold text-[var(--cn-orange)]">
                  {item.character_zh}
                </td>
                <td className="px-5 py-3 text-sm text-gray-700">{item.pinyin}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{item.meaning}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    HSK {item.hsk_level}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500 capitalize">{item.category}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-[var(--cn-orange)]"
                        style={{ width: `${item.mastery}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{item.mastery}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div data-testid="vocabulary-empty" className="py-12 text-center text-sm text-gray-400">
            No vocabulary items match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
