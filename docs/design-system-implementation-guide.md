# HanziBit Design System — Implementation Guide

How to refactor the app to match the new design system in `design/HanziBit Design System/`. Organized by impact and dependency order. Do phases in order — later phases reference shared patterns established in earlier ones.

---

## What Stays the Same

These are already correct and need no changes:

- All CSS custom property tokens in `globals.css` (colors, radii, fonts)
- The six-tone system (`ui-tone-*` classes)
- Typography scale (Tailwind classes)
- Lucide React icons and their sizing conventions
- Dark mode token values
- Light/dark sidebar token set
- `cn()` utility, `tailwind-merge`, `clsx`
- shadcn primitives (Button, Input, Dialog, Sheet, etc.) — style only

---

## Phase 1 — Global Baseline (`globals.css`)

Two small additions to `src/app/globals.css`.

### 1a. Button focus ring

Add to `@layer base`:

```css
button:focus-visible,
[role="button"]:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px oklch(0.6 0.18 45 / 30%);
}
```

### 1b. Button press nudge

Add to `@layer utilities`:

```css
.press-down:active {
  transform: translateY(1px);
}
```

Apply `press-down` class to all `<Button>` components and icon buttons.

### 1c. Card elevation helper

Add to `@layer utilities`:

```css
.card-ring {
  box-shadow: 0 0 0 1px oklch(0 0 0 / 6%);
  border: none;
}
```

This is the new card elevation style. Replaces `border` on every card.

---

## Phase 2 — Core Pattern Components

### 2a. Card elevation — `src/components/patterns/surfaces.tsx`

**`SectionCard`**: Replace `border bg-card` with `bg-card card-ring` (no explicit border class).

```tsx
// Before
<div className={`rounded-xl border bg-card p-5 ${className}`}>

// After
<div className={`rounded-xl bg-card card-ring p-5 ${className}`}>
```

Apply the same `card-ring` swap to:
- `InfoPanel` — replace `border border-border/80` with `card-ring`
- `DashboardSection` / `DashboardPanel` in `patterns/dashboard.tsx`
- `FlashcardPanel` in `patterns/flashcards.tsx`
- Every `rounded-xl border bg-card` / `rounded-2xl border bg-card` instance across the app

> **Why**: The design system spec says cards use `ring-1 ring-foreground/10` (rendered as a thin inset shadow, not an explicit border). This makes cards float subtly off the background instead of drawing hard outlines.

### 2b. Pill / badge variants — `src/components/patterns/status.tsx`

The new system defines seven explicit pill variants. Update `MetricPill` (or add a new `StatusPill` component) to support all of them:

| Variant | Classes |
|---|---|
| `priority` | `bg-[var(--cn-orange)] text-white` (solid) |
| `focus` | `bg-[var(--cn-orange-light)] text-[var(--cn-orange-dark)] border border-[var(--cn-orange)]/25` |
| `done` | `ui-tone-emerald-panel ui-tone-emerald-text border` |
| `pending` | `bg-muted text-muted-foreground` |
| `watch` | `ui-tone-sky-panel ui-tone-sky-text border` |
| `caution` | `ui-tone-amber-panel ui-tone-amber-text border` |
| `urgent` | `ui-tone-rose-panel ui-tone-rose-text border` |

Base pill classes (shared): `inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium`

Update `FocusWordStepBadge` in the same file — the done/pending states should use `done` and `pending` variants from above.

### 2c. Eyebrow row pattern — `src/components/patterns/surfaces.tsx`

The eyebrow pattern (icon + label + optional right-aligned meta) is used throughout the design kit. Formalize it as a reusable component in `surfaces.tsx`:

```tsx
export function Eyebrow({
  icon: Icon,
  children,
  meta,
  className,
}: {
  icon?: LucideIcon;
  children: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3.5 flex items-center gap-2", className)}>
      {Icon && <Icon className="ui-tone-orange-text h-4 w-4 shrink-0" />}
      <span className="text-[13px] font-semibold text-foreground/80">{children}</span>
      {meta && (
        <>
          <span className="flex-1" />
          <span className="text-xs font-normal text-muted-foreground">{meta}</span>
        </>
      )}
    </div>
  );
}
```

Replace all current eyebrow-style header rows (icon + h3) in `SectionCard`, `DashboardSection`, etc. with this component.

### 2d. Stat card eyebrow icons — `src/components/patterns/metrics.tsx`

Stat card icons should use their semantic tone color, not always orange. Update `SummaryStatCard` and `CompactStatCard` to accept a `tone` on the icon independently from the card surface tone, or pass `iconClassName` as a prop. 

Reference from design kit:
- Streak icon → `ui-tone-orange-text`
- Entries/Journal icon → `ui-tone-sky-text`
- Cards Due icon → `ui-tone-emerald-text`
- Overdue/error → `ui-tone-rose-text`

---

## Phase 3 — Sidebar (`src/components/notebook/sidebar.tsx`)

### 3a. Logo mark

Add the brand mark at the top of the sidebar, before the nav sections. Replace whatever wordmark exists with:

```tsx
<div className="mb-7 flex items-center gap-2.5">
  {/* Orange tile with 汉 */}
  <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--cn-orange)] text-[18px] font-bold text-white leading-none">
    汉
  </div>
  <span className="text-base font-bold">HanziBit</span>
</div>
```

### 3b. Active nav item style

Current active state uses a border or text-color indicator. New design uses solid orange fill:

```tsx
// Active state classes
"bg-[var(--cn-orange)] text-white font-medium hover:bg-[var(--cn-orange-dark)]"

// Default state classes
"text-muted-foreground hover:bg-muted hover:text-foreground"

// Shared base
"flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors w-full"
```

### 3c. Character of the Day tile

The tile should display a white square with the character in orange + shadow:

```tsx
{/* character tile */}
<div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-card shadow-sm text-[28px] font-bold text-[var(--cn-orange)]">
  {charOfDay.hanzi}
</div>
{/* meta */}
<div>
  <div className="text-[13px] font-semibold">{charOfDay.pinyin} · {charOfDay.meaning}</div>
  <div className="font-mono text-[11px] text-muted-foreground">Radical: {charOfDay.radical}</div>
  <div className="text-[11px] text-muted-foreground/70">{streakDays}-day streak</div>
</div>
```

Wrap the whole tile in a container:

```tsx
<div className="mt-6 rounded-[12px] border bg-muted/40 p-3.5">
  <p className="eyebrow mb-2">Character of the day</p>
  <div className="flex items-center gap-3">
    {/* tile + meta above */}
  </div>
</div>
```

Add `.eyebrow` to `globals.css` `@layer utilities`:

```css
.eyebrow {
  font-size: 0.625rem;   /* 10px */
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
```

### 3d. Due count badge on nav items

The count badge (e.g. "12" on Flashcards):

```tsx
<span className="ml-auto rounded-full bg-rose-500 px-1.5 py-px text-[10px] font-bold leading-tight text-white">
  {count}
</span>
```

---

## Phase 4 — Dashboard (`src/components/notebook/dashboard-view.tsx`)

### 4a. Practice step cards

The three practice step cards (Read / Review / Write) follow a specific pattern:

```
done state:     bg + border from emerald tone
emphasized:     bg + border from orange tone  + shadow-[0_1px_2px_oklch(0.6_0.18_45/8%)]
default/pending: bg-muted/40 border-border
```

Update the three card container classes:

```tsx
// Done card
"rounded-[12px] border bg-emerald-50 border-emerald-200/80 p-3.5"
// → or using existing tone classes:
"rounded-[12px] border ui-tone-emerald-panel p-3.5"

// Emphasized (active/next-up) card
"rounded-[12px] border ui-tone-orange-panel p-3.5 shadow-[0_1px_2px_oklch(0.6_0.18_45/8%)]"

// Default/pending card
"rounded-[12px] border border-border bg-muted/40 p-3.5"
```

The emphasized card gets a primary CTA button:

```tsx
<Button className="mt-3 h-7 bg-[var(--cn-orange)] hover:bg-[var(--cn-orange-dark)] text-[13px]">
  Start writing
</Button>
```

### 4b. Practice card step label

Replace current step label rendering with:

```tsx
<span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
  Step {n} · {stepName}
</span>
```

### 4c. Focus word strip

The current focus word inline display. Use:

```tsx
<span className="inline-flex items-center gap-2 rounded-full bg-card px-2.5 py-1 shadow-sm text-[13px]">
  <span className="font-bold text-[var(--cn-orange)]">{hanzi}</span>
  <span className="text-muted-foreground">{pinyin}</span>
  <span className="text-[12px] text-muted-foreground/70">{english}</span>
</span>
```

### 4d. Streak loop bars

Day bars in the streak history row:

```tsx
// completed day
<span className="h-2 w-[30px] rounded-full bg-emerald-600/70" />

// today (in-progress)
<span className="h-2 w-[30px] rounded-full bg-amber-500/45" />

// missed / empty
<span className="h-2 w-[30px] rounded-full bg-muted" />
```

### 4e. Stat grid

Three-column stat grid. Each card:

```tsx
<div className="rounded-[14px] bg-card card-ring p-[18px]">
  {/* eyebrow */}
  <div className="mb-2.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
    <Icon className="h-3.5 w-3.5 {tone-class}" />
    {label}
  </div>
  {/* value */}
  <div className="text-[36px] font-bold leading-none">{value}</div>
  <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
</div>
```

Assign tone-colored icons: streak → `ui-tone-orange-text`, entries → `ui-tone-sky-text`, cards due → `ui-tone-emerald-text`.

### 4f. Needs Attention rows

Current rows for struggling/overdue/new words. New pattern:

```tsx
<div className="flex items-center justify-between rounded-[10px] border border-border bg-muted/50 px-3.5 py-3">
  <div className="flex items-center gap-3">
    <span className="text-[18px] font-bold">{hanzi}</span>
    <span className="text-[13px] text-muted-foreground">{english}</span>
  </div>
  <div className="text-[11px] text-muted-foreground/70">{meta}</div>
  <StatusPill variant="urgent|caution|watch">{label}</StatusPill>
</div>
```

---

## Phase 5 — Journal & Interlinear Gloss

### 5a. Entry title (`src/components/notebook/journal-entry.tsx`)

Journal entry header title pattern — Chinese first, in orange:

```tsx
<h2 className="text-[22px] font-bold leading-tight">
  <span className="mr-2.5 text-[var(--cn-orange)]">{entryHanziTitle}</span>
  {entryEnglishTitle}
</h2>
<div className="mt-1 text-xs text-muted-foreground">{date} · {charCount} characters · {sentenceCount} sentences</div>
```

### 5b. Interlinear gloss word sizing (`src/components/notebook/interlinear-gloss-view.tsx`)

Update the per-word stacked layout:

```tsx
// Hanzi
<span className="text-[26px] font-bold leading-none text-foreground">
  {word.hanzi}
</span>

// Annotated hanzi (focus word or new word)
<span className="text-[26px] font-bold leading-none text-[var(--cn-orange)]">
  {word.hanzi}
</span>

// Pinyin
<span className="font-mono text-[11px] text-muted-foreground mt-0.5">
  {word.pinyin}
</span>

// English gloss
<span className="text-[10px] text-muted-foreground/70 mt-px">
  {word.english}
</span>
```

Wrapper per word (no change to existing `group` + hover pattern):

```tsx
<span className="group relative inline-flex flex-col items-center mx-1.5">
  {/* hanzi, pinyin, english above */}
  {/* hover audio button (absolute positioned) */}
</span>
```

Punctuation (。，！？):

```tsx
<span className="self-start text-[26px] text-foreground">
  {punct}
</span>
```

Sentence wrapper:

```tsx
<div className="flex flex-wrap items-end gap-y-4 leading-none mb-3.5">
```

---

## Phase 6 — Flashcards (`src/components/notebook/flashcard-practice.tsx`)

### 6a. Flashcard card shape

```tsx
// Card container
<div
  className="mx-auto max-w-[480px] rounded-[20px] bg-card card-ring px-8 py-14 min-h-[260px] flex flex-col items-center justify-center gap-3 cursor-pointer"
  onClick={handleFlip}
>
  {/* Front: large hanzi + hint */}
  {!flipped && (
    <>
      <span className="text-[64px] font-bold leading-none text-foreground">{card.hanzi}</span>
      <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        Click to reveal
      </span>
    </>
  )}

  {/* Back: medium hanzi (orange) + pinyin + english + audio */}
  {flipped && (
    <>
      <span className="text-[48px] font-bold leading-none text-[var(--cn-orange)]">{card.hanzi}</span>
      <span className="font-mono text-base text-muted-foreground mt-1.5">{card.pinyin}</span>
      <span className="text-[18px] text-foreground mt-1">{card.english}</span>
      <AudioPlayButton text={card.hanzi} type="word" className="mt-3" />
    </>
  )}
</div>
```

### 6b. Rating buttons

Four-column grid, shown only when flipped:

```tsx
<div className="mt-4.5 grid grid-cols-4 gap-2">
  {/* Again — rose */}
  <button className="rounded-[10px] border border-[oklch(0.63_0.15_15/20%)] bg-[oklch(0.965_0.02_15)] py-2.5 text-[13px] font-semibold text-[oklch(0.63_0.15_15)] hover:bg-[oklch(0.93_0.03_15)] active:translate-y-px">
    Again
    <div className="mt-0.5 text-[10px] font-normal opacity-70">&lt;1m</div>
  </button>

  {/* Hard — amber */}
  <button className="rounded-[10px] border border-[oklch(0.69_0.12_85/20%)] bg-[oklch(0.97_0.02_85)] py-2.5 text-[13px] font-semibold text-[oklch(0.69_0.12_85)] hover:bg-[oklch(0.94_0.03_85)] active:translate-y-px">
    Hard
    <div className="mt-0.5 text-[10px] font-normal opacity-70">6m</div>
  </button>

  {/* Good — emerald */}
  <button className="rounded-[10px] border border-[oklch(0.61_0.15_165/20%)] bg-[oklch(0.965_0.02_165)] py-2.5 text-[13px] font-semibold text-[oklch(0.61_0.15_165)] hover:bg-[oklch(0.93_0.03_165)] active:translate-y-px">
    Good
    <div className="mt-0.5 text-[10px] font-normal opacity-70">1d</div>
  </button>

  {/* Easy — solid orange */}
  <button className="rounded-[10px] border-transparent bg-[var(--cn-orange)] py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--cn-orange-dark)] active:translate-y-px">
    Easy
    <div className="mt-0.5 text-[10px] font-normal opacity-70">4d</div>
  </button>
</div>
```

Or use the existing `ui-tone-*` classes for the Again/Hard/Good buttons:

```tsx
// Again
className="rounded-[10px] border ui-tone-rose-panel ui-tone-rose-text py-2.5 text-[13px] font-semibold"

// Hard
className="rounded-[10px] border ui-tone-amber-panel ui-tone-amber-text py-2.5 text-[13px] font-semibold"

// Good
className="rounded-[10px] border ui-tone-emerald-panel ui-tone-emerald-text py-2.5 text-[13px] font-semibold"
```

### 6c. Progress bar

```tsx
<div className="mt-7 h-[10px] rounded-full bg-muted overflow-hidden">
  <div
    className="ui-tone-orange-dot h-full rounded-full transition-all duration-300"
    style={{ width: `${progress}%` }}
  />
</div>
```

### 6d. Browse mode cards

The browse grid cards should use `card-ring` and show hanzi prominently:

```tsx
<div className="rounded-[14px] bg-card card-ring p-5 transition-colors hover:bg-[var(--ui-tone-orange-surface)] cursor-pointer">
  <div className="text-[32px] font-bold leading-none">{card.hanzi}</div>
  <div className="font-mono text-[11px] text-muted-foreground mt-1.5">{card.pinyin}</div>
  <div className="text-xs text-muted-foreground/70 mt-1">{card.english}</div>
</div>
```

---

## Phase 7 — Study Guide (`src/components/notebook/study-guide.tsx`)

### 7a. Word header

The large character display at the top of a word detail view:

```tsx
<div className="text-[64px] font-bold leading-none text-foreground">{word.hanzi}</div>
<div className="font-mono text-base text-muted-foreground mt-2">{word.pinyin}</div>
<div className="text-sm text-muted-foreground mt-1">{word.english}</div>
```

HSK and part-of-speech pills next to the title use `watch` and `pending` variants respectively.

### 7b. Example phrase display

Focus phrase with `text-[26px]` Chinese + audio button same pattern as gloss. Surrounding context sentences stay `text-sm`.

### 7c. FocusStatusPill steps (already updated)

The Review/Study/Write step pills use `FocusWordStepBadge` which was already cleaned up to be text-only. No further change needed.

---

## Phase 8 — Progress bars (global)

Every `<Progress>` component and any hand-rolled progress bar in the codebase:

```
Height:   h-[10px] (not h-1.5 or h-2)
BG:       bg-muted
Fill:     ui-tone-orange-dot (orange background)
Radius:   rounded-full
```

Files to check: `dashboard-view.tsx`, `flashcard-practice.tsx`, `study-guide.tsx`, `src/components/ui/progress.tsx`.

---

## Phase 9 — Icon Button Standard

Icon buttons (settings, audio, edit, more-horizontal, etc.) throughout the app:

```tsx
<button className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground active:translate-y-px transition-colors">
  <Icon className="h-4 w-4" />
</button>
```

---

## File Checklist

| File | Changes |
|---|---|
| `src/app/globals.css` | Add `.eyebrow`, `.card-ring`, `.press-down`, focus-visible rule |
| `src/components/patterns/surfaces.tsx` | `card-ring` on cards, add `Eyebrow` component |
| `src/components/patterns/status.tsx` | Full pill variant set |
| `src/components/patterns/metrics.tsx` | Tone-colored icon support on stat cards |
| `src/components/patterns/dashboard.tsx` | `card-ring`, practice card states |
| `src/components/patterns/flashcards.tsx` | `card-ring`, flashcard shape, rating buttons |
| `src/components/notebook/sidebar.tsx` | Logo mark, active state, char-of-day tile |
| `src/components/notebook/dashboard-view.tsx` | Practice cards, stat grid, needs-attention rows, streak bars |
| `src/components/notebook/interlinear-gloss-view.tsx` | Gloss word sizing (26px/11px/10px) |
| `src/components/notebook/journal-entry.tsx` | Entry title (orange hanzi first) |
| `src/components/notebook/flashcard-practice.tsx` | Card shape, rating buttons, progress bar |
| `src/components/notebook/study-guide.tsx` | Word header sizing |
| `src/components/ui/progress.tsx` | Height + fill color tokens |

---

## Quick Reference — Most Common Class Swaps

| Before | After | Why |
|---|---|---|
| `rounded-xl border bg-card` | `rounded-xl bg-card card-ring` | Ring elevation vs hard border |
| `rounded-2xl border bg-card` | `rounded-2xl bg-card card-ring` | Same |
| `border border-border/80 bg-card/90 shadow-sm` | `bg-card card-ring` | Simplify |
| Active nav: `bg-accent text-accent-foreground` | `bg-[var(--cn-orange)] text-white font-medium` | Solid orange active |
| Flashcard hanzi: `text-4xl` or similar | Front: `text-[64px]`, Back: `text-[48px] text-[var(--cn-orange)]` | Design spec sizes |
| Gloss hanzi: `text-2xl` or `text-3xl` | `text-[26px]` | Design spec |
| Progress bar: `h-1.5 bg-primary` | `h-[10px] ui-tone-orange-dot` | Spec height |
| Rating buttons: custom variants | `ui-tone-rose/amber/emerald-panel` + solid orange for Easy | Tone system |
| `gap-1` in pill | remove `gap-1` (pills are text-only now) | Already done |
