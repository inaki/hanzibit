# UI Component Audit

Date: April 17, 2026

## Goal

This audit separates:

- what is already part of the reusable component library
- what is reusable but still living inside page or feature files
- what is currently hardcoded product UI and should stay product-specific

It is meant to guide:

- Storybook scope
- design-system cleanup
- future UI extraction work
- production-readiness polish

## Current UI Structure

### Reusable primitive library

Location:

- `src/components/ui`

Current size:

- 19 files
- about 1,503 lines

This layer is the closest thing to the real design-system foundation.

It currently contains:

- `button`
- `input`
- `badge`
- `card`
- `dialog`
- `sheet`
- `tabs`
- `tooltip`
- `dropdown-menu`
- `progress`
- `avatar`
- `separator`
- `scroll-area`

This is a good primitive base. It already covers the low-level controls and layout shells that should be documented in Storybook first.

### Product UI layer

Locations:

- `src/components/notebook`
- `src/components/landing`
- `src/app/notebook`

Notebook layer size:

- 24 files
- about 6,539 lines

Landing layer size:

- 6 files
- about 624 lines

The notebook layer is much larger than the primitive UI library and includes a lot of UI that is reusable in practice but not yet extracted as reusable components.

## Adoption of the primitive UI library

Across notebook, landing, and notebook pages, the current `src/components/ui` usage is relatively limited:

- `button`: 7 imports
- `input`: 6 imports
- `dialog`: 4 imports
- `progress`: 3 imports
- `avatar`: 2 imports
- `sheet`: 2 imports
- `dropdown-menu`: 1 import
- `tooltip`: 1 import

Notably absent from broad usage:

- `card`
- `badge`
- `tabs`
- `separator`
- `scroll-area`

This means much of the app’s visual system is still implemented as custom local `div` structures with Tailwind classes instead of reusable UI components.

## What is clearly part of the component library today

These should be considered the real current design-system primitives:

- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/tooltip.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/scroll-area.tsx`

These are reusable, theme-aware, and stable enough to be the first-class Storybook surface.

## What is reusable but not yet treated as library

These are currently feature-local, but they behave like reusable product components or reusable product patterns.

### Navigation and shell patterns

- `src/components/notebook/sidebar.tsx`
- `src/components/notebook/nav.tsx`
- `src/components/notebook/mobile-nav.tsx`
- `src/components/notebook/teacher-tabs.tsx`
- `src/components/notebook/learner-teacher-tabs.tsx`

These are not design-system primitives, but they are reusable app-shell components.

Recommendation:

- keep them outside `src/components/ui`
- consider a middle layer such as `src/components/app` or `src/components/patterns`

### Form and submit patterns

- `src/components/notebook/pending-submit-button.tsx`
- parts of `src/components/notebook/action-bar.tsx`
- parts of `src/components/notebook/mobile-journal-page.tsx`

Reusable candidates:

- pending submit button pattern
- dialog form footer pattern
- destructive confirm-toggle pattern

### Dashboard and reporting patterns

Current repeated patterns exist inside:

- `src/components/notebook/dashboard-view.tsx`
- `src/app/notebook/teacher/reporting/page.tsx`
- `src/app/notebook/teacher/page.tsx`
- `src/app/notebook/teacher/private-students/page.tsx`

Reusable candidates:

- summary metric block
- compact stat card
- action rail row
- status pill / focus pill
- operational explainer card
- reporting row / learner row

These should probably become reusable **product patterns**, not low-level UI primitives.

### Study and learning patterns

Inside:

- `src/components/notebook/study-guide.tsx`
- `src/components/notebook/flashcard-practice.tsx`
- `src/components/notebook/journal-entry.tsx`
- `src/components/notebook/interlinear-gloss-view.tsx`
- `src/components/notebook/markup-assist.tsx`

Reusable candidates:

- study word list item
- study detail section card
- focus-status pill
- flashcard action panel
- inline annotation helper panel
- journal feedback panel
- guided draft panel

These are reusable within the product, but they are too domain-specific for `src/components/ui`.

## What is still mostly hardcoded product UI

These files contain large amounts of page-specific layout and styling, even when they include some smaller local helpers.

### High-priority hardcoded surfaces

- `src/components/notebook/action-bar.tsx`
  - 1,059 lines
  - multiple local dialogs and action modes
- `src/components/notebook/dashboard-view.tsx`
  - 746 lines
  - many local helper components
- `src/components/notebook/study-guide.tsx`
  - 688 lines
  - list/detail layout and many embedded UI sections
- `src/components/notebook/mobile-journal-page.tsx`
  - 638 lines
  - mobile-specific dialogs and workflow UI
- `src/components/notebook/markup-assist.tsx`
  - 438 lines
  - multiple reusable-looking panels still embedded in one file
- `src/components/notebook/numbers-guide.tsx`
  - 404 lines
  - almost entirely feature-specific UI
- `src/components/notebook/flashcard-practice.tsx`
  - 389 lines
- `src/components/notebook/settings-dialog.tsx`
  - 380 lines

These are the main sources of hardcoded UI complexity right now.

### Why they are hardcoded

Common patterns:

- large page-local Tailwind class blocks
- multiple internal helper components defined inside the page/component file
- domain logic and UI mixed together
- repeated visual patterns without extraction

## Recommended layering model

Right now the repo effectively has only two layers:

1. `src/components/ui`
2. everything else

That is too coarse.

A better structure would be:

### 1. Foundation primitives

Location:

- `src/components/ui`

Examples:

- button
- input
- card
- badge
- tabs
- dialog

### 2. Reusable product patterns

Suggested location:

- `src/components/patterns`

Examples:

- summary metric card
- operational section header
- status pill
- action row
- dashboard stat tile
- learner state card
- reporting row
- guided panel shell
- notebook dialog footer

These are reusable across HanziBit, but they are too product-specific to belong in `ui`.

### 3. Feature components

Location:

- `src/components/notebook`
- `src/components/landing`

Examples:

- StudyGuide
- DashboardView
- FlashcardPractice
- JournalEntryView

These should compose primitives and patterns, not define so many bespoke visual subcomponents inline.

## Best extraction candidates

If the goal is to improve reusability and Storybook usefulness, these are the best next extractions.

### Tier 1: easiest high-value extractions

- summary/stat card variants from dashboard + reporting
- status pills / priority pills / focus pills
- action row / compact metric row
- generic operational section shell

Why:

- used repeatedly
- mostly presentational
- low logic coupling

### Tier 2: workflow panel extractions

- guided draft panel
- journal feedback panel
- markup validation panel
- annotation builder shell
- flashcard action panel

Why:

- clearly reusable inside notebook learning flows
- ideal Storybook candidates after primitives

### Tier 3: shell and navigation patterns

- notebook shell header blocks
- teacher workspace section headers
- learner-with-teacher hub shells

Why:

- useful, but should be extracted carefully to avoid over-abstracting app layout too early

## What should stay product-specific

These should not be forced into the component library unless they stabilize strongly:

- full dashboard page layout
- full teacher reporting page layout
- full study guide screen layout
- full inquiry / classroom / assignment detail pages

Those should consume reusable pieces, but the full screens themselves should stay feature-level.

## Storybook recommendation

Storybook should not try to document the whole notebook UI.

Recommended scope:

### Phase A: primitive library

- `src/components/ui`

### Phase B: product patterns

After extraction, add stories for:

- stat cards
- status pills
- action rails
- reporting rows
- guided panels

### Phase C: stable feature slices only

Only once stable:

- flashcard action block
- study word card
- learner priority card

Do not start Storybook with full screens.

## Current conclusion

### Already reusable and library-worthy

- the `src/components/ui` primitives

### Reusable but not yet properly extracted

- many dashboard/reporting/status/panel patterns inside notebook and teacher flows

### Hardcoded and feature-bound

- large parts of `dashboard-view`, `study-guide`, `action-bar`, `mobile-journal-page`, and teacher reporting pages

## Suggested next cleanup order

1. Keep Storybook focused on `src/components/ui`
2. Create `src/components/patterns`
3. Extract stat/status/action patterns from dashboard + reporting
4. Extract notebook support panels from `markup-assist`
5. Only then refactor larger screens to consume those patterns

This gives the most value without prematurely abstracting entire pages.
