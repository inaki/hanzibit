# HanziBit — Design System Brief

A reference document for a designer creating a full design system for HanziBit. It describes what the product is, who uses it, the current technical implementation, and what we need from the new system.

---

## 1. Product Overview

**HanziBit** is a Mandarin Chinese learning web app aimed at English-speaking adult learners. It combines daily journaling in Chinese with spaced-repetition flashcards, vocabulary and grammar references, and a structured study guide.

### Core value proposition
- Write Chinese sentences daily, get AI-assisted glossing and feedback
- Learn vocabulary through interlinear gloss (character + pinyin + English stacked)
- Practice with smart flashcards tied to your own writing
- Follow a structured study path (HSK levels 1–6)
- Optional teacher–learner hub for tutored learning

### User types
| Type | Description |
|---|---|
| Solo learner | Beginner to intermediate, self-directed |
| Learner with teacher | Connected to a human tutor |
| Teacher | Manages multiple students, assigns lessons |

### App sections (sidebar nav)
| Section | Purpose |
|---|---|
| Dashboard | Daily practice loop, streak, focus word |
| Daily Journal | Write Chinese sentences, get AI gloss |
| Study Guide | HSK-leveled word and lesson detail |
| Flashcards | Spaced-repetition review and browsing |
| Vocabulary List | Full word list (advanced) |
| Grammar Points | Grammar reference (advanced) |
| Numbers Guide | Number system guide |
| Recent Reviews | Review history |
| Teacher | Teacher-only management hub |
| With Teacher | Learner–teacher collaboration hub |

### Platform
Web-only today. Mobile-responsive with a dedicated mobile journal view. No native app yet.

---

## 2. Brand Identity (Current State)

### Name and feel
**HanziBit** — approachable, focused, not intimidating. The tone is calm and structured, not gamified or emoji-heavy. This is a serious learning tool for adults who want to make real progress.

### Brand color
The primary brand color is a warm **Chinese orange** (`#e8601c`), intentionally referencing Chinese ink and traditional aesthetics without being kitschy.

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--cn-orange` | `#e8601c` | `#f07030` | Brand primary |
| `--cn-orange-light` | `#fef3ed` | `#2a1a10` | Tinted surface |
| `--cn-orange-dark` | `#c44d14` | `#ff8844` | Hover/active state |

The orange is used for: primary buttons, active nav states, section header icons, focus word accents, CTA highlights.

---

## 3. Current Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, RSC) |
| Styling | Tailwind CSS v4 (PostCSS plugin, no tailwind.config file — config lives in `globals.css`) |
| Base component library | shadcn (style: `base-nova`) |
| Headless primitives | `@base-ui/react` ^1.2.0 |
| CSS utilities | `clsx` + `tailwind-merge` via `cn()` helper |
| Component variants | `class-variance-authority` |
| Icons | `lucide-react` |
| Animation | `tw-animate-css` |
| Color space | OKLCH throughout |
| Design docs | Storybook (stories for all pattern components) |

---

## 4. Current Design Tokens

All tokens are CSS custom properties declared in `src/app/globals.css`, with full light and dark variants.

### 4.1 Color — Semantic (shadcn standard)

| Token | Light (OKLCH) | Dark (OKLCH) | Role |
|---|---|---|---|
| `--background` | `0.975 0.002 75` | `0.145 0 0` | Page background |
| `--foreground` | `0.145 0 0` | `0.985 0 0` | Body text |
| `--card` | `1 0 0` (white) | `0.205 0 0` | Card surfaces |
| `--card-foreground` | `0.145 0 0` | `0.985 0 0` | Text on cards |
| `--primary` | `0.6 0.18 45` | `0.7 0.18 45` | Brand orange |
| `--primary-foreground` | `0.985 0 0` | `0.145 0 0` | Text on primary |
| `--muted` | `0.97 0 0` | `0.269 0 0` | Subdued surfaces |
| `--muted-foreground` | `0.556 0 0` | `0.708 0 0` | Secondary text |
| `--accent` | `0.97 0.01 55` | `0.269 0 0` | Accent surface |
| `--border` | `0.922 0 0` | `oklch(1 0 0 / 10%)` | Default borders |
| `--input` | `0.922 0 0` | `oklch(1 0 0 / 15%)` | Input borders |
| `--ring` | `0.6 0.18 45` | `0.7 0.18 45` | Focus ring |
| `--destructive` | `0.577 0.245 27.3` | `0.704 0.191 22.2` | Errors/danger |

### 4.2 Color — UI Tone System (Custom)

This is a bespoke layer on top of shadcn. Each tone has four semantic sub-tokens: surface, border, text, and soft-text. They are exposed both as CSS variables and as Tailwind utility classes.

**Six tones:**

| Tone | hue° | Purpose |
|---|---|---|
| `orange` | 45 | Focus word, brand accent, primary state |
| `sky` | 240 | Informational, neutral positive |
| `emerald` | 165 | Success, completed, done states |
| `amber` | 85 | Caution, in-progress, warm neutral |
| `rose` | 15 | Error, warning, overdue |
| `violet` | 315 | Special, grammar, advanced content |

**Each tone's four layers:**

| Sub-token | Semantic meaning |
|---|---|
| `surface` | Tinted background (panel, card) |
| `border` | Border matching the tone |
| `text` | Readable colored text |
| `soft-text` | Softer, lower-contrast text |

**CSS variables example (orange, light):**
```
--ui-tone-orange-surface:   oklch(0.965 0.02 45)
--ui-tone-orange-border:    oklch(0.88 0.05 45)
--ui-tone-orange-text:      oklch(0.6 0.18 45)
--ui-tone-orange-soft-text: oklch(0.36 0.07 45)
```

**Tailwind utility classes generated per tone:**
```
.ui-tone-{tone}-panel     → applies surface bg + border color
.ui-tone-{tone}-text      → applies text color
.ui-tone-{tone}-soft-text → applies soft text color
.ui-tone-{tone}-dot       → applies bg color (used for dot indicators)
```

### 4.3 Typography

| Token | Value | Notes |
|---|---|---|
| `--app-font-sans` | SF Pro Text / SF Pro Display / Segoe UI / system-ui | Apple-system-first sans stack |
| `--app-font-mono` | SFMono / SF Mono / ui-monospace / Menlo | Mono for code, pinyin annotations |
| Base size | 16px | Via `html { font-size: 16px }` |
| Large font | 18px | `html.cn-font-large` class |
| XL font | 20px | `html.cn-font-xl` class |

The app has a user-controlled font size setting (standard, large, XL) to accommodate learners who want larger Chinese characters.

**Typography scale in use (Tailwind):**
- `text-[10px]` / `text-[11px]` — micro labels, badges, pill text
- `text-xs` (12px) — secondary labels, metadata
- `text-sm` (14px) — body text, descriptions, list items
- `text-base` (16px) — primary body
- `text-lg` (18px) — card titles, section headers
- `text-xl` (20px) — subsection titles
- `text-3xl` (30px) — metric values, page stat numbers
- `text-4xl` (36px) — page titles

**Font weight conventions:**
- `font-medium` — secondary labels
- `font-semibold` — section headers, card titles, nav items
- `font-bold` — page titles, large metric values

**Tracking conventions:**
- `tracking-[0.18em]` — ALLCAPS micro labels (consistent pattern throughout)
- `tracking-wide` / `tracking-wider` — small secondary labels

### 4.4 Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius` | `0.625rem` (10px) | Base unit |
| `--radius-sm` | `× 0.6` ≈ 6px | Tight elements: badge, chip |
| `--radius-md` | `× 0.8` ≈ 8px | Inputs, small cards |
| `--radius-lg` | `× 1.0` = 10px | Standard card, panel |
| `--radius-xl` | `× 1.4` ≈ 14px | Large panels |
| `--radius-2xl` | `× 1.8` ≈ 18px | Section cards (frequently used) |
| `--radius-3xl` | `× 2.2` ≈ 22px | Hero panels |
| `--radius-4xl` | `× 2.6` ≈ 26px | Large modals/sheets |

In practice: `rounded-full` for pills/badges, `rounded-xl` and `rounded-2xl` for cards.

### 4.5 Sidebar

Uses a separate sidebar token set (shadcn standard), matching the main theme:
- `--sidebar` — sidebar background (white / dark card)
- `--sidebar-foreground` — sidebar text
- `--sidebar-primary` — active nav item color (orange)
- `--sidebar-accent` — hover state
- `--sidebar-border` — sidebar dividers

---

## 5. Component Library

### 5.1 Base UI Components (shadcn `base-nova` style)

Located in `src/components/ui/`:

| Component | Description |
|---|---|
| `Button` | Primary, outline, ghost, destructive variants |
| `Card` | CardHeader, CardContent, CardTitle, CardDescription |
| `Input` | Form input |
| `Badge` | Default, secondary, outline variants |
| `Progress` | With ProgressLabel and ProgressValue sub-components |
| `Tabs` | TabsList, TabsTrigger, TabsContent |
| `Avatar` | User avatar |
| `ScrollArea` | Scrollable containers |
| `Separator` | Divider |
| `DropdownMenu` | Context menus |
| `Tooltip` | Hover tooltips (heavily used) |
| `Sheet` | Slide-out panel (used for mobile sidebar, modals) |
| `Dialog` | Modal dialogs |

### 5.2 Pattern Components

Located in `src/components/patterns/`. These are reusable domain-aware compositions built on top of the base UI components.

**Surfaces**
- `SectionCard` — standard bordered card with optional icon, title, description, and action slot
- `InfoPanel` — compact info block with icon and label

**Metrics / Stats**
- `SummaryMetric` — large number + label (no border)
- `SummaryStatCard` — bordered card with large value + tone support
- `CompactStatCard` — same but smaller
- `ActionRow` — horizontal row with toned badge label + value
- `HealthRow` — dot indicator + label + value row
- `CompactBadgeRow` — toned row for summary lists

**Status**
- `MetricPill` — small rounded pill with tone
- `PriorityPill` — urgent / high / watch pill (maps to rose / amber / sky)
- `PriorityBadge` — primary-colored "Priority" badge
- `FocusWordStepBadge` — done/pending badge for Review/Study/Write steps (emerald when done, muted when pending)

**Guidance**
- `GuidanceBanner` — toned informational callout box with optional title
- `EmptyStateNotice` — dashed-border empty state placeholder

**Forms**
- `FormErrorNotice` — rose-toned error message block
- `DialogFormActions` — cancel + submit button row for dialogs

**Navigation**
- `ActionRailButton` — icon button with tooltip, multiple states (active, filled, danger)

**Hub pages**
- `HubPageHeader` — page title + description + optional badge
- `HubFocusSection` — section card with pills + guidance banner

**Teaching-specific**
- `TeachingPageHeader` — page header with optional orange badge
- `TeachingToneMetricCard` — toned metric card with icon
- `TeachingExplainerBlock` — toned explanation/info block
- `TeachingCollectionSection` — section card with empty state
- `TeachingEntityCard` — linked entity card with badges, title, meta grid

**Dashboard-specific**
- `DashboardSection` — primary dashboard panel with optional icon + action
- `DashboardPanel` — simpler toned panel
- `DashboardStatCard` — stat widget with icon label

**Flashcard-specific**
- `FlashcardPanel` — base flashcard container
- `FlashcardActionPanel` — padded action area panel
- `FlashcardBrowseCard` — hoverable browse card
- `FlashcardNoticePanel` — notice/info panel (orange or default)
- `FlashcardControlButton` — secondary control button
- `FlashcardProgressBar` — orange progress bar

**Reporting**
- `OverviewMetric` — large bold number + all-caps label

### 5.3 Product-Specific Components

Located in `src/components/notebook/`. These are the actual page-level components:

| Component | Description |
|---|---|
| `NotebookSidebar` | Left nav with all sections, stats, character of the day |
| `DashboardView` | Main dashboard: daily loop, streak, focus word, practice cards |
| `JournalEntry` | Full journal entry view with interlinear gloss |
| `InterlinearGlossView` | Character + pinyin + English stacked annotation view |
| `StudyGuide` | HSK word detail: definitions, phrases, examples |
| `FlashcardPractice` | Flashcard session + browse mode |
| `MobileJournalPage` | Full mobile journal view with sheet navigation |
| `AudioPlayButton` | TTS audio button: idle / loading / playing / locked (Pro) |
| `GlossContext` | Context provider for gloss state |
| `ActionBar` | Top action bar (save, settings, etc.) |

---

## 6. Interaction & UX Patterns

### Tones as state
The tone system maps directly to semantic states throughout the UI:
- **emerald** = completed, done, success
- **orange** = active, focus, current, brand
- **amber** = in-progress, caution, medium priority
- **rose** = error, overdue, urgent
- **sky** = informational, neutral
- **violet** = special content, grammar

### Navigation
- Desktop: persistent 240px left sidebar
- Mobile: bottom sheet navigation + mobile action bar

### Chinese character display
- Characters always appear larger than surrounding Latin text
- Pinyin appears directly above or below characters (interlinear style)
- English gloss appears in a third row
- Font size is user-configurable (3 sizes)

### Audio
- `AudioPlayButton` component: small speaker icon button
- States: idle → loading spinner → playing (pause icon) → locked (lock icon for Pro)
- Appears inline next to characters and sentences
- Word audio: free; sentence/phrase audio: Pro only

### Flashcard practice
- Full-screen card flip interaction
- Progress bar at bottom
- Rating buttons (Again / Hard / Good / Easy) with keyboard shortcuts
- Browse mode: grid of all cards

### Badges / pills
- Always text-only (no icons inside pills per recent cleanup)
- Small text: `text-[11px]` uppercase tracking
- Rounded-full shape
- Toned with the semantic tone system

---

## 7. Dark Mode

Full dark mode support via `.dark` class on `<html>`. All tokens have dark variants. Dark backgrounds use deep near-black OKLCH values. The tone surfaces invert: dark surfaces are deep and saturated, text becomes lighter.

The app uses system preference or user toggle (not documented here but implemented).

---

## 8. What We Need From the Designer

We have a working token system and component library, but it has grown organically. We need a designer to:

### 8.1 Visual identity
- Refine or replace the brand color palette — does `#e8601c` orange feel right? Is the OKLCH tone system the right approach?
- Define a clear type scale and hierarchy (we're using Tailwind defaults informally)
- Create a logo or wordmark if we don't have one

### 8.2 Token system design
- Validate and formalize the semantic token naming (`--primary`, `--cn-orange`, `--ui-tone-*`)
- Define spacing and sizing scale (we use arbitrary Tailwind values heavily — `p-5`, `gap-4`, `text-[11px]`)
- Define a clear elevation/shadow system (currently mostly flat, minimal shadow use)
- Specify icon usage guidelines (we use Lucide React across the board)

### 8.3 Component redesign
For each of these, provide visual specifications and light+dark variants:
- Buttons (primary, secondary, ghost, destructive, icon-only)
- Badges and pills (all tone variants)
- Cards (section card, stat card, entity card)
- Inputs and form fields
- Navigation (sidebar item states: default, hover, active, badge count)
- Progress bar
- Tabs
- Modals / sheets
- Tooltip
- AudioPlayButton states
- Flashcard (front, back, rating buttons)

### 8.4 Page-level compositions
Provide annotated mockups or redlines for:
- **Dashboard** — daily practice loop, streak widget, focus word card, practice section cards
- **Daily Journal** — text entry + interlinear gloss view
- **Study Guide** — HSK word detail view
- **Flashcard practice** — session mode + browse mode
- **Sidebar** — full sidebar with all states

### 8.5 Deliverables we can actually use
We use Tailwind CSS v4 + shadcn. The most useful deliverables:
1. **Figma file** with components using the existing token names (so we can map them)
2. **Updated CSS custom property values** if you change the token colors
3. **Tailwind class annotations** on specs wherever possible (e.g., `text-sm font-semibold text-foreground`)
4. **Light and dark variants** for all components

---

## 9. Constraints

- **Tailwind CSS v4** — no `tailwind.config.js`, all tokens in `globals.css` via `@theme inline`
- **shadcn `base-nova` style** — we are tied to the shadcn component shapes; major structural changes to primitives must still be expressible as shadcn overrides
- **OKLCH colors** — we use OKLCH throughout, which allows perceptual uniformity across light/dark; any new palette should continue in OKLCH
- **System font stack** — we prefer system fonts (SF Pro on Apple, Segoe UI on Windows) for performance and native feel; introducing a custom web font is welcome but adds a loading constraint
- **Dense information UI** — this is a language learning tool, content is dense by nature; the design must remain highly readable at small text sizes, not trade legibility for aesthetics

---

## Appendix: File Locations

| What | Where |
|---|---|
| CSS tokens + globals | `src/app/globals.css` |
| Base UI components | `src/components/ui/` |
| Pattern components | `src/components/patterns/` |
| Product components | `src/components/notebook/` |
| Storybook stories | `src/stories/` + `src/components/**/*.stories.tsx` |
| shadcn config | `components.json` |
