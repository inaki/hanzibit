"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, useTransition, type ReactNode } from "react";
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
  const cacheRef = useRef<{ entryId: string | null; data: GlossParagraph[] | null }>({ entryId: null, data: null });
  const stickyRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    cacheRef.current = { entryId: state.entryId, data: state.data };
    stickyRef.current = state.sticky;
  });

  const fetchGloss = useCallback(
    (entryId: string, contentZh: string) => {
      // Don't refetch if we already have data for this entry
      if (cacheRef.current.data && cacheRef.current.entryId === entryId) {
        setState((s) => ({ ...s, active: true }));
        return;
      }

      setState((s) => ({ ...s, active: true, loading: true, entryId }));
      startTransition(async () => {
        const data = await glossEntryAction(entryId, contentZh);
        setState((s) => ({ ...s, loading: false, data }));
      });
    },
    [] // stable — uses ref for cache check
  );

  const activate = useCallback(
    (entryId: string, contentZh: string) => {
      if (stickyRef.current) return; // Don't override sticky mode on hover
      fetchGloss(entryId, contentZh);
    },
    [fetchGloss]
  );

  const deactivate = useCallback(() => {
    if (stickyRef.current) return; // Don't deactivate in sticky mode
    setState((s) => ({ ...s, active: false }));
  }, []);

  const toggleSticky = useCallback(
    (entryId: string, contentZh: string) => {
      setState((s) => {
        if (s.sticky) {
          return { ...s, sticky: false, active: false };
        }
        return { ...s, sticky: true, active: true };
      });
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
