"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type FontSize = "normal" | "large" | "extra-large";
export type HskVersion = "2.0" | "3.0";
export type ChineseFont = "kaiti" | "noto-sans" | "source-han-sans" | "fangsong" | "yahei";

export interface UserProfile {
  name: string;
}

export interface Settings {
  fontSize: FontSize;
  chineseFont: ChineseFont;
  hskVersion: HskVersion;
  hskLevel: number;
  profile: UserProfile;
}

const DEFAULT_SETTINGS: Settings = {
  fontSize: "normal",
  chineseFont: "kaiti",
  hskVersion: "2.0",
  hskLevel: 1,
  profile: { name: "" },
};

const STORAGE_KEY = "cn-settings";

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  reset: () => void;
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

const FONT_SIZE_CLASS: Record<FontSize, string> = {
  normal: "",
  large: "cn-font-large",
  "extra-large": "cn-font-xl",
};

function applyFontSize(size: FontSize) {
  const html = document.documentElement;
  html.classList.remove("cn-font-large", "cn-font-xl");
  const cls = FONT_SIZE_CLASS[size];
  if (cls) html.classList.add(cls);
}

const ALL_CHINESE_FONT_CLASSES = [
  "cn-font-kaiti",
  "cn-font-noto-sans",
  "cn-font-source-han",
  "cn-font-fangsong",
  "cn-font-yahei",
] as const;

const CHINESE_FONT_CLASS: Record<ChineseFont, string> = {
  "kaiti": "cn-font-kaiti",
  "noto-sans": "cn-font-noto-sans",
  "source-han-sans": "cn-font-source-han",
  "fangsong": "cn-font-fangsong",
  "yahei": "cn-font-yahei",
};

function applyChineseFont(font: ChineseFont) {
  const html = document.documentElement;
  html.classList.remove(...ALL_CHINESE_FONT_CLASSES);
  const cls = CHINESE_FONT_CLASS[font];
  if (cls) html.classList.add(cls);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount (must setState here to hydrate client-only data)
  useEffect(() => {
    const loaded = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loaded);
    applyFontSize(loaded.fontSize);
    applyChineseFont(loaded.chineseFont);
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      if (patch.fontSize) applyFontSize(patch.fontSize);
      if (patch.chineseFont) applyChineseFont(patch.chineseFont);
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

  const reset = useCallback(() => {
    setSettings((prev) => {
      const next = { ...DEFAULT_SETTINGS, profile: prev.profile };
      saveSettings(next);
      applyFontSize(next.fontSize);
      applyChineseFont(next.chineseFont);
      return next;
    });
  }, []);

  // Don't render children until hydrated to avoid mismatch
  if (!hydrated) return null;

  return (
    <SettingsContext.Provider value={{ settings, update, updateProfile, reset }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
