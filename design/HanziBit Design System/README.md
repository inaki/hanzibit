# HanziBit Design System

A reference for designing and building interfaces for **HanziBit**, a Mandarin Chinese learning web app for English-speaking adults. The app pairs daily journaling in Chinese with spaced-repetition flashcards, an HSK-aligned study guide, and an optional teacher–learner hub.

## Sources

This design system is derived from:

- **Codebase:** [`inaki/hanzibit`](https://github.com/inaki/hanzibit) — Next.js 16 + Tailwind v4 + shadcn (`base-nova` style). The canonical source for tokens is [`src/app/globals.css`](https://github.com/inaki/hanzibit/blob/main/src/app/globals.css). Component conventions live under `src/components/ui/` (shadcn primitives), `src/components/notebook/` (product surfaces), and `src/components/landing/` (marketing).
- **Design brief:** the HanziBit Design System Brief pasted at project kickoff — it describes user types, section routing, the "UI tone system" layered on top of shadcn, and the Pro/teacher flows.
- **Product docs:** `docs/app-overview.md`, `docs/language-learning-effectiveness-strategy.md` and the many `docs/phase-*-planning.md` files give product tone and feature intent.

Assume the reader does **not** have access — everything needed to design for HanziBit should live inside this folder.

## Product at a glance

**HanziBit** is a notebook-style Mandarin learning companion. The defining idea: learners *write* Mandarin from day one and get AI-assisted glossing (character + pinyin + English interlinear). Vocabulary flows out of what the learner wrote, into flashcards that ladder up through the HSK 1–6 curriculum.

### Who uses it

| Type | Description |
|---|---|
| **Solo learner** | Self-directed beginner → intermediate. The default experience. |
| **Learner with teacher** | Connected to a human tutor; adds an extra "Teacher" hub section. |
| **Teacher** | Manages private students and classrooms; assigns lessons and reviews submissions. |

### App sections (sidebar nav)

Dashboard · Daily Journal · Study Guide · Flashcards · Vocabulary List · Grammar Points · Numbers Guide · Recent Reviews · Teacher hub (contextual) · With Teacher (contextual).

### Platform

Web-only today. The marketing site (`/`) → auth → `/notebook/*` is the main surface. Mobile-responsive with a dedicated mobile journal view and bottom sheet navigation.

---

## Content fundamentals

**Voice.** Calm, structured, and respectful — *not* gamified, *not* emoji-heavy, *not* a cheerleader. HanziBit is a serious tool for adults who want to make real progress. Treat the learner like an adult in a night class, not a toddler being rewarded for taps.

**Second-person, active verbs.** Microcopy uses "you" and direct verbs: *"Start your streak today"*, *"Review due cards"*, *"Open study guide"*. Avoid "let's" or "we".

**Chinese-first naming.** When referring to a word or a character, show the hanzi first, then pinyin, then English. Example button label: *"Finish reviewing 服务员"*. Never romanize away the hanzi.

**Consistent status vocabulary.** The UI uses the same half-dozen words everywhere:

- *Due* — flashcards waiting for review (never "pending" or "queued")
- *Review / Study / Write* — the three daily-loop verbs, always in that order
- *Done* / *Pending* — step state on practice cards
- *Focus word* — the one word the learner is asked to cycle through review/study/write today
- *Priority* — the next step the learner should take
- *Streak* — consecutive days with a completed loop

**Casing.**

- **Title Case** for page titles, section titles, and nav items (*"Daily Journal"*, *"Study Guide"*, *"Needs Attention"*).
- **Sentence case** for descriptions, hints, and body copy (*"Your learning progress at a glance"*).
- **ALL CAPS + letter-spaced** only for micro-labels and eyebrows (*"STREAK"*, *"CHARACTER OF THE DAY"*, *"NOTEBOOK SECTIONS"*). The codebase uses `text-[10px] tracking-widest uppercase` or `text-xs tracking-wider uppercase`.

**Numbers and units.** Write "HSK 1" (space, no hyphen). Write "day in a row" singular vs. "days in a row" plural — the code pluralizes explicitly, don't let it read "1 days". Ranges as "5 / 20" (with spaces) when rendering progress.

**Hanzi copy examples from the product.**

- Hero: *"Master Chinese, One Character at a Time"*
- Eyebrow: *"Your personal Chinese learning companion"*
- Empty state: *"All caught up — no struggling cards right now."*
- Streak empty: *"Start your streak today"*
- Practice prompt (tone): *"Finish the remaining steps to complete today's practice."*
- Section descriptions are one sentence, often ending in a period; micro-labels never end in a period.

**No emoji.** Not in copy, not in empty states. Iconography carries that load (Lucide, and the hanzi characters themselves). The only "glyphs" that appear as content are actual Chinese characters, used decoratively in very pale orange at huge sizes on the landing hero (学, 写, 读).

**Tone of error / pro-gate.** Kind and specific, never punitive. *"Sentence/phrase audio is available on Pro."* *"Please sign in to continue."* Never *"You can't do that"*.

---

## Visual foundations

### The core aesthetic

HanziBit is a **warm, paper-leaning notebook**. The marketing and the app both sit on a barely-tinted off-white (`oklch(0.975 0.002 75)` — warm because the hue is 75°, not gray) with bright white cards, thin neutral borders, and a single saturated accent: Chinese ink orange (`#e8601c`). Dark mode inverts to near-black with the same orange at slightly higher lightness.

The vocabulary is **restrained**. Flat surfaces, thin 1px borders, soft radii, almost no shadows, no gradients except one very subtle backdrop-blur on the landing nav. The only flourish is giant pale hanzi on the landing hero, used as a background motif at `text-[var(--cn-orange)]/5` opacity.

### Color

- **Brand primary: `--cn-orange` `#e8601c`** — used for primary buttons, active nav states, focus words inside gloss, eyebrow icons, CTA highlights, progress bar fill, focus ring.
- **Tinted surface: `--cn-orange-light` `#fef3ed`** — the bed for hero badges and orange-toned panels. Inverted to a deep warm near-black (`#2a1a10`) in dark mode.
- **Hover/active: `--cn-orange-dark` `#c44d14`** — the *only* thing primary buttons do on hover: shift to this darker shade. No lift, no shadow.
- **Neutrals are grayscale OKLCH** (hue 0) with a warm page background (hue 75). Borders are `oklch(0.922 0 0)` — light gray. Muted text is `oklch(0.556 0 0)`.
- **The UI tone system** — orange (45°), sky (240°), emerald (165°), amber (85°), rose (15°), violet (315°) — maps directly to semantic state: emerald = done, orange = active, amber = caution, rose = error, sky = informational, violet = special (grammar). Each tone has four subtokens: `surface`, `border`, `text`, `soft-text`. Rose/amber/emerald are used as `text-rose-400`, `text-amber-400`, `text-emerald-400` in the codebase with subtle `/10` backgrounds.
- **Color of imagery.** The app itself is not photo-heavy. Where photography appears on the marketing site, it should skew warm and natural — paper, ink, book textures. No cool corporate blue. Avoid grayscale photography.

### Type

- **UI stack:** SF Pro Text / SF Pro Display / Segoe UI / system-ui — Apple-system-first. We keep the native feel; no custom web font loaded by default. A brand display font is **not** used.
- **Mono stack:** SFMono / SF Mono / ui-monospace / Menlo — used for pinyin annotations and code.
- **Size.** Base is 16px. The user can toggle `html.cn-font-large` (18px) or `html.cn-font-xl` (20px) for larger hanzi. Every size scales from that.
- **Hanzi always reads bigger** than the surrounding Latin text. In the gloss view the character is `text-[22px] font-bold`, with pinyin at `text-xs` below and English at `text-[10px]`. In flashcards the character can go up to `text-4xl` or larger.
- **Weights used:** `font-medium` for secondary labels, `font-semibold` for nav items / card titles / section headers, `font-bold` for page titles and big metrics. Never `font-light` or `font-thin`.
- **Tracking:** `tracking-widest` on the 10px all-caps eyebrows, `tracking-wider` on 12px eyebrows, default tracking elsewhere.
- **`text-wrap: pretty` / `text-wrap: balance`** is welcome on headings.

### Spacing & layout

- **8-point-ish scale** expressed in Tailwind: `gap-1 / 2 / 3 / 4 / 6 / 8`. Card internal padding is `p-4` or `p-5`; section cards use `p-6`. Arbitrary values (`p-5`, `px-2.5`, `text-[11px]`, `text-[10px]`) appear frequently — accept them as part of the system, they're intentional.
- **Content widths:** `max-w-3xl` for the primary notebook column, `max-w-4xl` for the landing hero, `max-w-7xl` for the landing nav shell.
- **Sidebar:** fixed 240px (`w-60`), `shrink-0`, `border-r`, on `bg-card`. Hidden below `lg`.

### Borders, radii, elevation

- **Borders are 1px, neutral, low-contrast.** `border` with `--border` is the default. Subtle tone borders (`border-emerald-500/20`, `border-[var(--cn-orange)]/30`) appear on toned panels and pills.
- **Radii scale off `--radius: 0.625rem` (10px).** In practice: `rounded-lg` (10px) for buttons and nav items, `rounded-xl` (14px) for cards and inner panels, `rounded-2xl` (18px) for the largest section cards, `rounded-full` for pills/badges, and `rounded-4xl` (26px) for some badge pills.
- **Elevation is almost flat.** The main card uses `ring-1 ring-foreground/10` — a 1px ring, not a shadow. Only the Character-of-the-Day tile uses `shadow-sm`, and the landing nav uses `backdrop-blur-md` over a semi-transparent white. No drop shadows on hover. No layered shadow systems.

### Motion

- **Motion is minimal and functional.** Global `transition-colors` / `transition-all` on interactive elements for hover; no choreographed entrances, no bounce, no stagger.
- **Hover = color shift.** Buttons and nav items shift background or text color. Primary buttons shift from `--cn-orange` → `--cn-orange-dark`. Ghost buttons pick up `bg-muted`. Links underline.
- **Press = `active:translate-y-px`** on buttons — a 1px downward nudge, nothing more.
- **Focus = 3px ring.** `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` — the ring is orange at 50% opacity. Never remove it.
- **`tw-animate-css`** is available for the rare case a transition is needed (sheet/dialog slides). Keep durations under ~200ms.

### Transparency, blur, overlays

- **Blur is rare.** Only the landing nav uses `backdrop-blur-md` over `bg-white/80`.
- **`/10` and `/20` alpha tones** are the workhorse for tinted panels — e.g. `bg-emerald-500/10` over a `border-emerald-500/20` produces the toned notice panels.
- **Dialogs** use a muted backdrop. No gradient backdrops.

### Cards, panels, pills — the canonical shapes

- **Plain card.** `rounded-xl bg-card p-5 ring-1 ring-foreground/10`. Content is `gap-4` vertically.
- **Section card.** Same as plain card but `p-6` and usually includes a small eyebrow row (Lucide icon + all-caps label at `text-sm font-semibold text-foreground/80`).
- **Toned panel.** `rounded-lg border border-<tone>/20 bg-<tone>/10 p-3`. Text inside uses the tone color.
- **Status pill.** `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium` — tinted bed + matching tone text, optional leading Lucide icon.
- **Priority badge.** Solid `bg-[var(--cn-orange)] text-white rounded-full px-2 py-0.5 text-[11px]`.

### Backgrounds & motifs

- **Page background** is the warm off-white in light mode, near-black in dark.
- **The only decorative motif** is oversized hanzi characters (`text-[150–200px]`) at `text-[var(--cn-orange)]/5` used *behind* the landing hero. Pick meaningful characters (学 learn, 写 write, 读 read). Never random.
- **No repeating patterns, no textures, no gradients, no illustrations.** If a spot feels empty, the answer is whitespace, not a flourish.

---

## Iconography

- **System: [Lucide React](https://lucide.dev)** — used across the entire codebase. Default stroke `1.5`, sizes `h-4 w-4` inline and `h-5 w-5` in buttons and hero badges. Icons are monochrome and inherit text color. See [`assets/icons.md`](assets/icons.md) for the canonical icon → concept map.
- **Since Lucide is CDN-available**, we link it from unpkg in UI-kit files rather than shipping SVG copies. Consistent weight/style means anything Lucide ships will slot in naturally.
- **Placement & color.** Icons precede their label (`gap-2`). In eyebrow rows they take the tone of their section: `text-[var(--cn-orange)]` for brand, `text-sky-400` / `text-emerald-400` / `text-rose-400` / `text-amber-400` for the UI tone the section represents. In nav they inherit the nav text color.
- **Hanzi as icon.** The brand logo mark is a single hanzi character (汉 "Han") inside a rounded square tile. In the app sidebar and landing nav, an orange `rounded-lg` tile contains a `BookOpen` Lucide icon at `h-5 w-5` white. Either is valid; the hanzi version is stronger for the wordmark.
- **No emoji, ever.** Not in copy, not as decoration.
- **No PNG/raster icons.** Everything is SVG or Lucide.
- **No custom-drawn illustrations** have shipped. If you need an illustrative moment, fall back to the large-pale-hanzi motif.

---

## Index

This folder is a flat, skimmable manifest. Start at the top.

### Root files

- **`README.md`** — you are here
- **`SKILL.md`** — agent-skill front matter; how to invoke this system
- **`colors_and_type.css`** — copy-paste CSS custom properties + semantic class utilities

### Folders

- **`assets/`** — logos, icon usage notes. Iconography comes from Lucide via CDN.
- **`fonts/`** — empty by design; the brand uses system fonts (SF Pro / Segoe UI). No webfont files.
- **`preview/`** — design-system cards (colors, type, components, states) used to populate the Design System tab.
- **`ui_kits/hanzibit-app/`** — high-fidelity recreation of the HanziBit notebook UI: sidebar, dashboard, journal entry with interlinear gloss, flashcard practice.

### Not included (and why)

- **Slide templates** — the product has no deck style; none provided.
- **Custom illustrations / photography** — the brand doesn't use them. Large pale hanzi is the only decorative motif.
- **Custom webfont files** — intentional; the stack is system-first.
