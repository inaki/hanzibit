---
name: HanziBit Design System
description: Warm, paper-leaning notebook UI for a Mandarin learning web app. Use when designing any surface for the HanziBit product — marketing, notebook (dashboard/journal/study/flashcards), teacher hub, or auth. Built on shadcn + Tailwind v4 with a single ink-orange accent (#e8601c), system-font stack, thin 1px borders, near-flat elevation, and a six-tone UI status system layered on top of shadcn primitives.
---

# HanziBit Design System

This skill covers the HanziBit Mandarin learning web app. The design system is defined in this folder; read `README.md` first, then the supporting files.

## When to use

Invoke this skill whenever a user asks you to design for HanziBit — any screen in the notebook (Dashboard, Daily Journal, Study Guide, Flashcards, Vocabulary, Grammar, Numbers, Recent Reviews), teacher surfaces, landing page sections, auth flows, or emails/notifications that need to look like the product.

## Where to start

1. Read `README.md` in full — product overview, content fundamentals, visual foundations, iconography, and the folder index.
2. Read `colors_and_type.css` — canonical tokens to drop into any new HTML you produce.
3. Browse `preview/` to see cards rendered for every major component, color, type scale, radii, spacing, and brand mark.
4. If building a product surface (not a one-off page), start from `ui_kits/hanzibit-app/` — it has the sidebar, dashboard, journal (with interlinear gloss), and flashcard practice already wired.
5. Read `assets/icons.md` for the canonical Lucide icon → concept mapping.

## Core rules (do not violate)

- **One accent only.** `#e8601c` (`--cn-orange`) is the single saturated color. Hover = `#c44d14`. Everything else is neutral OKLCH grayscale on a warm off-white page.
- **Chinese-first.** Hanzi renders larger than surrounding Latin text and appears before pinyin and English in the gloss order `hanzi → pinyin → English`.
- **System fonts.** No webfont is loaded. Use the SF Pro / Segoe UI / system-ui stack and the SFMono / ui-monospace stack for pinyin.
- **Near-flat elevation.** `ring-1 ring-foreground/10` on cards. One `shadow-sm` exception (character-of-the-day tile). No drop-shadow systems, no gradients (except the single landing nav backdrop-blur).
- **No emoji. No custom illustrations. No photography on product surfaces.** If a spot feels empty, the answer is whitespace — or the giant pale hanzi motif (学, 写, 读) at `/5` opacity.
- **Tone system for status.** emerald = done, orange = active/focus, amber = caution/in-progress, rose = error/urgent, sky = informational, violet = grammar. Each tone has surface / border / text / soft-text subtokens — use them for pills and panels.
- **Adult voice.** Calm, structured, second-person, active verbs. Never gamified, never cheerleader. Status words are consistent: *Due, Review/Study/Write, Done, Pending, Focus word, Priority, Streak*.

## Common patterns

- **Eyebrow row** — `Eyebrow` primitive: Lucide icon (orange or tone-colored) + all-caps-adjacent semibold label + optional right-aligned meta.
- **Stat card** — white card, 10px all-caps eyebrow with tone-colored icon, giant `font-bold` number, 12px muted sub.
- **Practice step card** — one of three horizontal cards in a loop; done variant gets emerald tint, next-up gets orange tint and a CTA button.
- **Interlinear gloss** — stack `hanzi (26px bold) / pinyin (mono 11px muted) / English (10px very muted)` centered per word, flex-wrap by sentence. Focus words tint their hanzi orange.
- **Flashcard** — large white card, `rounded-2xl`, hanzi `text-6xl bold`. Rating row uses 4 buttons: Again (rose) / Hard (amber) / Good (emerald) / Easy (solid orange).
