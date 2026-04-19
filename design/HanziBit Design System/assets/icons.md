# Iconography

HanziBit uses **Lucide React** across the entire codebase — one library, one stroke style, no mixing.

## Library

- **Package:** `lucide-react`
- **CDN (used by UI kits in this design system):** `https://cdn.jsdelivr.net/npm/lucide@latest`
- **Stroke:** default (1.5). Never adjust.
- **Fill:** none. Icons are outline only.
- **Color:** icons inherit `currentColor`. They take the color of the containing text — so a `text-emerald-400` pill's leading check-circle comes out emerald automatically.
- **Sizing:** `h-4 w-4` inline with text, `h-5 w-5` in the nav logo and primary CTAs, `h-3.5 w-3.5` inside pills, `h-3 w-3` inside very small pills.

## The canonical icon map

| Concept | Lucide name |
|---|---|
| Dashboard | `layout-dashboard` |
| Daily Journal / write | `pen-line` |
| Study Guide | `graduation-cap` |
| Flashcards | `layers` |
| Vocabulary | `book-open` |
| Grammar | `languages` |
| Numbers | `hash` |
| Recent Reviews | `rotate-ccw` |
| Teacher hub | `briefcase-business` |
| With Teacher | `user-round-search` |
| Streak | `flame` |
| Trending / progress | `trending-up` |
| Brand sparkle | `sparkles` |
| Navigation → | `arrow-right` |
| Done | `check-circle-2` |
| Pending | `circle` |
| Warning / needs attention | `alert-circle` |
| Study item / book snippet | `book-text` |
| Audio: idle | `volume-2` |
| Audio: playing | `pause` |
| Audio: locked (Pro) | `lock` |
| Audio: loading | `loader-2` (with spin) |

## Hanzi-as-icon

A **single hanzi** in a rounded tile is a legitimate brand mark in HanziBit. The default app logo uses a `BookOpen` Lucide icon in an orange `rounded-lg` tile, but you may substitute the character 汉 (Hàn, "Han Chinese") for a stronger wordmark moment. Either is on-brand.

## What is NOT used

- **No emoji.** Not in buttons, not in empty states, not in copy.
- **No PNG icons.** Everything is SVG.
- **No custom illustration system.** The only decorative graphic is giant pale-orange hanzi characters used as a hero backdrop (see `preview/brand-motif.html`).
- **No icon fonts** beyond Lucide.
