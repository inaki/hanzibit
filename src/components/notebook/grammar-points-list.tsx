"use client";

import { useState } from "react";
import type { GrammarPoint } from "@/lib/data";

interface GrammarPointsListProps {
  items: GrammarPoint[];
}

export function GrammarPointsList({ items }: GrammarPointsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div data-testid="grammar-points-list" className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 data-testid="grammar-points-heading" className="text-3xl font-bold text-foreground">Grammar Points</h1>
        <p data-testid="grammar-points-count" className="mt-1 text-sm text-muted-foreground">
          {items.length} grammar {items.length === 1 ? "point" : "points"} across HSK 1-2
        </p>
      </div>

      <div className="space-y-3">
        {items.map((point) => {
          const isExpanded = expandedId === point.id;
          let examples: string[] = [];
          try {
            examples = JSON.parse(point.examples);
          } catch {
            examples = [];
          }

          return (
            <div
              key={point.id}
              data-testid={`grammar-point-${point.id}`}
              className="overflow-hidden rounded-xl bg-card card-ring"
            >
              <button
                data-testid={`grammar-point-toggle-${point.id}`}
                onClick={() => setExpandedId(isExpanded ? null : point.id)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <div>
                  <h3 className="font-semibold text-foreground">{point.title}</h3>
                  {point.pattern && (
                    <p className="ui-tone-orange-text mt-0.5 text-sm font-mono">
                      {point.pattern}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    HSK {point.hsk_level}
                  </span>
                  <svg
                    className={`h-4 w-4 text-muted-foreground/70 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div data-testid={`grammar-point-detail-${point.id}`} className="border-t px-6 py-5">
                  <p data-testid={`grammar-point-explanation-${point.id}`} className="mb-4 text-sm leading-relaxed text-foreground/80">
                    {point.explanation}
                  </p>

                  {examples.length > 0 && (
                    <div data-testid={`grammar-point-examples-${point.id}`}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Examples
                      </p>
                      <div className="space-y-2">
                        {examples.map((ex, i) => (
                          <div
                            key={i}
                            className="ui-tone-orange-panel rounded-lg px-4 py-2.5 text-sm text-foreground/90"
                          >
                            {ex}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
