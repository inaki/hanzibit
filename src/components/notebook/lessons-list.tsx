"use client";

import { useState } from "react";
import type { Lesson } from "@/lib/data";
import { BookOpen, ChevronRight } from "lucide-react";

interface LessonsListProps {
  items: Lesson[];
}

export function LessonsList({ items }: LessonsListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedLesson = items.find((l) => l.id === selectedId);

  // Group by unit
  const units = items.reduce(
    (acc, lesson) => {
      if (!acc[lesson.unit]) acc[lesson.unit] = [];
      acc[lesson.unit].push(lesson);
      return acc;
    },
    {} as Record<string, Lesson[]>
  );

  return (
    <div data-testid="lessons-list" className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 data-testid="lessons-heading" className="text-3xl font-bold text-gray-900">Lessons</h1>
        <p data-testid="lessons-count" className="mt-1 text-sm text-gray-500">
          {items.length} lessons across {Object.keys(units).length} units
        </p>
      </div>

      <div className="flex gap-6">
        {/* Lesson list */}
        <div data-testid="lessons-sidebar" className="w-80 shrink-0 space-y-6">
          {Object.entries(units).map(([unit, unitLessons]) => (
            <div key={unit}>
              <h3 data-testid={`lessons-unit-${unit.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {unit}
              </h3>
              <div className="space-y-1">
                {unitLessons.map((lesson) => {
                  const isActive = selectedId === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      data-testid={`lessons-item-${lesson.id}`}
                      onClick={() => setSelectedId(lesson.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "bg-[var(--cn-orange-light)] border border-[var(--cn-orange)]/20"
                          : "bg-white border border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isActive ? "bg-[var(--cn-orange)] text-white" : "bg-gray-100 text-gray-400"
                      }`}>
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${isActive ? "text-[var(--cn-orange)]" : "text-gray-900"}`}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500">HSK {lesson.hsk_level}</p>
                      </div>
                      <ChevronRight className={`h-4 w-4 shrink-0 ${isActive ? "text-[var(--cn-orange)]" : "text-gray-300"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Lesson detail */}
        <div className="flex-1">
          {selectedLesson ? (
            <div data-testid="lesson-detail" className="rounded-xl border bg-white p-8">
              <div className="mb-1 flex items-center gap-2">
                <span data-testid="lesson-detail-unit" className="text-xs font-semibold uppercase tracking-wider text-[var(--cn-orange)]">
                  {selectedLesson.unit}
                </span>
                <span className="text-xs text-gray-400">· HSK {selectedLesson.hsk_level}</span>
              </div>
              <h2 data-testid="lesson-detail-title" className="mb-2 text-2xl font-bold text-gray-900">
                {selectedLesson.title}
              </h2>
              {selectedLesson.description && (
                <p data-testid="lesson-detail-description" className="mb-6 text-sm text-gray-500">
                  {selectedLesson.description}
                </p>
              )}
              <div data-testid="lesson-detail-content" className="prose prose-sm max-w-none text-gray-700">
                {selectedLesson.content.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ) : (
            <div data-testid="lesson-detail-empty" className="flex h-64 items-center justify-center rounded-xl border bg-white text-sm text-gray-400">
              Select a lesson to view its content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
