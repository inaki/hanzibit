# UI Extraction Roadmap

Date: April 17, 2026

## Goal

Turn the current UI audit into an execution plan:

- what to extract first
- where extracted pieces should live
- what should stay page-level for now
- how Storybook should grow alongside the extraction work

This roadmap is intentionally practical. It is meant to reduce UI duplication without over-abstracting the product too early.

## Target layering

### 1. Foundation primitives

Location:

- `src/components/ui`

Use for:

- low-level building blocks
- accessibility wrappers
- theme-aware base controls

Examples:

- `Button`
- `Input`
- `Badge`
- `Card`
- `Dialog`
- `Sheet`
- `Tabs`
- `Progress`

These should stay small, generic, and portable.

### 2. Product patterns

Suggested new location:

- `src/components/patterns`

Use for:

- repeated HanziBit-specific UI structures
- visual patterns reused across notebook, teaching, reporting, and learner workflows

Examples:

- summary stat tiles
- status pills
- action rows
- reporting rows
- guidance banners
- panel shells

These are reusable across the app, but they are not generic enough for `ui`.

### 3. Feature components

Existing locations:

- `src/components/notebook`
- `src/components/landing`

Use for:

- full product sections
- composed workflow surfaces
- feature-specific layout logic

Examples:

- `DashboardView`
- `StudyGuide`
- `FlashcardPractice`
- `NotebookActionBar`

These should consume primitives and patterns, not define lots of one-off subcomponents inline.

## Extraction principles

### Extract when:

- a visual pattern appears in 2 or more major surfaces
- the component is mostly presentational
- the component has stable states and naming
- the component can be explained in Storybook without page context

### Do not extract yet when:

- the UI is still changing every session
- the component is mostly domain logic with a little markup
- the abstraction would only wrap one page
- naming is not stable

## Priority order

## Phase A: strengthen the design-system base

This is already started.

### Scope

- document and stabilize `src/components/ui`
- increase actual adoption of:
  - `Card`
  - `Badge`
  - `Tabs`
  - `Separator`

### Immediate tasks

1. Finish Storybook package install and runtime validation
2. Add stories for:
   - `Dialog`
   - `Sheet`
   - `Tooltip`
   - `DropdownMenu`
3. Refactor a few easy consumers to use:
   - `Card`
   - `Badge`
   - `Tabs`

### Why first

There is no point extracting product patterns while the primitive layer is still underused.

## Phase B: extract cross-surface product patterns

This is the highest-value next cleanup.

### B1. Metric and state primitives for product UI

Suggested destination:

- `src/components/patterns/metrics`
- `src/components/patterns/status`

Extract first:

- `SummaryMetric`
- `CompactStatCard`
- `StatusPill`
- `MetricPill`
- `PriorityBadge`
- `FocusWordStepBadge`

Source candidates:

- `src/components/notebook/dashboard-view.tsx`
- `src/app/notebook/teacher/reporting/page.tsx`
- `src/app/notebook/teacher/page.tsx`
- `src/app/notebook/teacher/private-students/page.tsx`

Why first:

- repeated many times
- mostly visual
- low extraction risk

### B2. Action and guidance patterns

Suggested destination:

- `src/components/patterns/actions`
- `src/components/patterns/guidance`

Extract next:

- `ActionRow`
- `HealthRow`
- `CompactBadgeRow`
- `GuidanceBanner`
- `OperationalExplainer`
- `SectionCallout`

Source candidates:

- `teacher/reporting/page.tsx`
- `teacher/page.tsx`
- `private-students/page.tsx`
- `classes/[classroomId]/page.tsx`

Why:

- these are repeated in different “teacher ops” surfaces
- they would clean up reporting and overview pages quickly

### B3. Reusable row/list patterns

Suggested destination:

- `src/components/patterns/reporting`

Extract:

- `ReportingRow`
- `LearnerAttentionRow`
- `SupportStateRow`
- `CheckpointRow`

Source candidates:

- `teacher/reporting/page.tsx`
- `teacher/private-students/page.tsx`

Why:

- reporting is now feature-rich but still visually assembled page-by-page
- extracting rows is safer than extracting full sections

## Phase C: notebook workflow panel extraction

This is the next highest-value cleanup after dashboard/reporting patterns.

### C1. Markup and journal support panels

Suggested destination:

- `src/components/patterns/notebook`

Extract:

- `MarkupValidationPanel`
- `GuidedDraftPanel`
- `JournalFeedbackPanel`
- `AnnotationBuilder`

Current source:

- `src/components/notebook/markup-assist.tsx`

Why:

- they are already acting like reusable product components
- ideal Storybook candidates
- would reduce complexity in journal create/edit surfaces

### C2. Dialog workflow parts

Extract:

- dialog footer with destructive confirmation state
- pending submit footer
- pronunciation action group
- flashcard action group

Current source:

- `src/components/notebook/action-bar.tsx`
- `src/components/notebook/mobile-journal-page.tsx`

Why:

- large source files
- duplicated desktop/mobile workflow structure

## Phase D: study and review patterns

### D1. Study Guide patterns

Suggested destination:

- `src/components/patterns/study`

Extract:

- `StudyWordListItem`
- `StudyDetailSection`
- `FocusStatusPill`
- `GuidedResponseList`
- `InputPracticePanel`

Current source:

- `src/components/notebook/study-guide.tsx`

Why:

- large file
- strong internal reuse potential
- useful for future mobile parity and design work

### D2. Flashcard patterns

Extract:

- `ReviewActionPanel`
- `FocusCardBanner`
- `QualityButtonGroup`

Current source:

- `src/components/notebook/flashcard-practice.tsx`

Why:

- clearly reusable within flashcard flows
- good Storybook candidates after they stabilize

## Phase E: navigation and shell cleanup

This should happen later, not first.

### Candidates

- `NotebookSidebar`
- `NotebookNav`
- `TeacherTabs`
- `LearnerTeacherTabs`
- mobile nav shells

Suggested destination:

- `src/components/app`

Why later:

- these are reusable, but they depend heavily on route structure and role logic
- extracting them too early risks moving app architecture concerns into a fake “design system”

## High-value source files to reduce first

These should shrink over time as patterns are extracted.

### Top priority

- `src/components/notebook/action-bar.tsx`
- `src/components/notebook/dashboard-view.tsx`
- `src/components/notebook/study-guide.tsx`
- `src/components/notebook/mobile-journal-page.tsx`
- `src/components/notebook/markup-assist.tsx`

### Second priority

- `src/app/notebook/teacher/reporting/page.tsx`
- `src/app/notebook/teacher/page.tsx`
- `src/app/notebook/teacher/private-students/page.tsx`
- `src/components/notebook/flashcard-practice.tsx`

## Storybook growth plan

### Step 1

Only `src/components/ui`

### Step 2

Add stable extracted product patterns:

- stat cards
- status pills
- action rows
- guidance banners
- notebook support panels

### Step 3

Add selected composed examples:

- dashboard metrics group
- reporting section demo
- study detail panel demo

Do **not** jump directly to full-screen notebook pages in Storybook.

## Suggested first extraction sprint

If doing this as a real implementation pass, the best first sprint is:

1. Create `src/components/patterns`
2. Extract:
   - `StatusPill`
   - `SummaryMetric`
   - `CompactStatCard`
   - `ActionRow`
   - `GuidanceBanner`
3. Refactor:
   - `dashboard-view.tsx`
   - `teacher/page.tsx`
   - `teacher/reporting/page.tsx`
4. Add stories for those new pattern components

This is the best risk/reward slice.

## What should explicitly stay page-level for now

Do not try to extract these yet:

- full dashboard layout
- full teacher reporting layout
- full study guide screen layout
- full inquiry/classroom/assignment detail pages

Those are compositions of patterns, not themselves reusable components.

## Success criteria

This cleanup is working if:

- `src/components/ui` remains generic and stable
- `src/components/patterns` grows with real reusable app patterns
- large notebook and teacher files shrink
- Storybook becomes useful for real UI iteration
- fewer visual changes require editing multiple pages by hand

## Recommendation

Best next implementation move:

1. finish Storybook runtime install
2. create `src/components/patterns`
3. extract metrics/status/action patterns first
4. only then move into notebook workflow panel extraction
