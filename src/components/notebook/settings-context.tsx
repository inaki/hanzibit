"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type FontSize = "normal" | "large" | "extra-large";
export type HskVersion = "2.0" | "3.0";

export interface UserProfile {
  name: string;
  email: string;
}

export interface Settings {
  fontSize: FontSize;
  hskVersion: HskVersion;
  profile: UserProfile;
}

const DEFAULT_SETTINGS: Settings = {
  fontSize: "normal",
  hskVersion: "2.0",
  profile: { name: "", email: "" },
};

const STORAGE_KEY = "cn-settings";

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage might be full or disabled
  }
}

/** Maps font size setting to a CSS class on <html> */
const FONT_SIZE_CLASS: Record<FontSize, string> = {
  normal: "",
  large: "cn-font-large",
  "extra-large": "cn-font-xl",
};

function applyFontSize(size: FontSize) {
  const html = document.documentElement;
  // Remove any existing font class
  html.classList.remove("cn-font-large", "cn-font-xl");
  const cls = FONT_SIZE_CLASS[size];
  if (cls) html.classList.add(cls);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    applyFontSize(loaded.fontSize);
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      if (patch.fontSize) applyFontSize(patch.fontSize);
      return next;
    });
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setSettings((prev) => {
      const next = { ...prev, profile: { ...prev.profile, ...patch } };
      saveSettings(next);
      return next;
    });
  }, []);

  // Don't render children until hydrated to avoid mismatch
  if (!hydrated) return null;

  return (
    <SettingsContext.Provider value={{ settings, update, updateProfile }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
