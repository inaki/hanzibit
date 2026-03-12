"use client";

import { createContext, useContext, useState, useCallback, useTransition, type ReactNode } from "react";
import { glossEntryAction } from "@/lib/gloss-action";
import type { GlossParagraph } from "@/lib/gloss";

interface GlossState {
  active: boolean;
  sticky: boolean;
  loading: boolean;
  data: GlossParagraph[] | null;
  entryId: string | null;
}

interface GlossContextValue {
  state: GlossState;
  activate: (entryId: string, contentZh: string) => void;
  deactivate: () => void;
  toggleSticky: (entryId: string, contentZh: string) => void;
}

const GlossContext = createContext<GlossContextValue | null>(null);

export function GlossProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GlossState>({
    active: false,
    sticky: false,
    loading: false,
    data: null,
    entryId: null,
  });
  const [isPending, startTransition] = useTransition();

  const fetchGloss = useCallback(
    (entryId: string, contentZh: string) => {
      // Don't refetch if we already have data for this entry
      if (state.data && state.entryId === entryId) {
        setState((s) => ({ ...s, active: true }));
        return;
      }

      setState((s) => ({ ...s, active: true, loading: true, entryId }));
      startTransition(async () => {
        const data = await glossEntryAction(entryId, contentZh);
        setState((s) => ({ ...s, loading: false, data }));
      });
    },
    [state.data, state.entryId]
  );

  const activate = useCallback(
    (entryId: string, contentZh: string) => {
      if (state.sticky) return; // Don't override sticky mode on hover
      fetchGloss(entryId, contentZh);
    },
    [state.sticky, fetchGloss]
  );

  const deactivate = useCallback(() => {
    if (state.sticky) return; // Don't deactivate in sticky mode
    setState((s) => ({ ...s, active: false }));
  }, [state.sticky]);

  const toggleSticky = useCallback(
    (entryId: string, contentZh: string) => {
      setState((s) => {
        if (s.sticky) {
          // Turn off sticky and deactivate
          return { ...s, sticky: false, active: false };
        }
        // Turn on sticky
        return { ...s, sticky: true, active: true };
      });
      // Ensure data is loaded
      fetchGloss(entryId, contentZh);
    },
    [fetchGloss]
  );

  return (
    <GlossContext.Provider
      value={{
        state: { ...state, loading: state.loading || isPending },
        activate,
        deactivate,
        toggleSticky,
      }}
    >
      {children}
    </GlossContext.Provider>
  );
}

export function useGloss() {
  const ctx = useContext(GlossContext);
  if (!ctx) throw new Error("useGloss must be used within GlossProvider");
  return ctx;
}
