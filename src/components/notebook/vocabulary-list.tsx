"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { HskWord, HskLevelSummary } from "@/lib/data";

interface HskVocabularyListProps {
  words: HskWord[];
  summaries: HskLevelSummary[];
}

export function HskVocabularyList({ words, summaries }: HskVocabularyListProps) {
  const [activeLevel, setActiveLevel] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = words.filter((w) => w.hsk_level === activeLevel);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (w) =>
          w.simplified.includes(q) ||
          w.pinyin.toLowerCase().includes(q) ||
          w.english.toLowerCase().includes(q)
      );
    }
    return result;
  }, [words, activeLevel, search]);

  const activeSummary = summaries.find((s) => s.hsk_level === activeLevel);

  return (
    <div data-testid="vocabulary-list" className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 data-testid="vocabulary-list-heading" className="text-3xl font-bold text-gray-900">
          HSK Vocabulary
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Official word lists for the HSK proficiency exam
        </p>
      </div>

      {/* Level tabs */}
      <div data-testid="vocabulary-level-tabs" className="mb-6 flex flex-wrap gap-2">
        {summaries.map((s) => (
          <button
            key={s.hsk_level}
            data-testid={`vocabulary-level-${s.hsk_level}`}
            onClick={() => { setActiveLevel(s.hsk_level); setSearch(""); }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeLevel === s.hsk_level
                ? "bg-[var(--cn-orange)] text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            HSK {s.hsk_level}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeLevel === s.hsk_level
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {s.word_count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          data-testid="vocabulary-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by character, pinyin, or meaning..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--cn-orange)] focus:ring-1 focus:ring-[var(--cn-orange)]"
        />
      </div>

      {/* Count */}
      <p data-testid="vocabulary-list-count" className="mb-3 text-xs text-gray-400">
        {search
          ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
          : `${activeSummary?.word_count ?? 0} words in HSK ${activeLevel}`}
      </p>

      {/* Word table */}
      <div data-testid="vocabulary-table" className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Character</th>
              <th className="px-5 py-3">Pinyin</th>
              <th className="px-5 py-3">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((word) => (
              <tr
                key={word.id}
                data-testid={`vocabulary-row-${word.simplified}`}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="px-5 py-3">
                  <span className="text-lg font-bold text-[var(--cn-orange)]">
                    {word.simplified}
                  </span>
                  {word.traditional && word.traditional !== word.simplified && (
                    <span className="ml-2 text-sm text-gray-400">{word.traditional}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-sm text-gray-700">{word.pinyin}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{word.english}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div data-testid="vocabulary-empty" className="py-12 text-center text-sm text-gray-400">
            {search ? "No words match your search." : "No words for this level."}
          </div>
        )}
      </div>
    </div>
  );
}
