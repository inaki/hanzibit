# Phase 20 Implementation Spec

## Phase Goal

Phase 20 adds a **teacher portfolio shaping and operating-mode layer** on top of:
- Phase 18 workload balancing
- Phase 19 stabilization and handoff

By the end of Phase 19, HanziBit can help a teacher answer:
- where pressure is clustering
- what still needs active intervention
- what can simplify
- which learners look stable enough for lighter-touch support

Phase 20 should add the next operating question:

**What does my overall private learner portfolio look like right now, and is that mix sustainable for the way I teach?**

## Scope

Phase 20 should remain:
- derived-first
- teacher-facing
- lightweight
- operational, not financial or marketplace-facing

It should add:
- portfolio mix summaries
- support-mode distribution visibility
- simple operating-mode labels
- guidance about whether the current learner mix is balanced or skewed

It should not add:
- staffing
- delegation
- pricing logic
- lead throttling
- scheduling
- automation

## Core Model

### Definition of Portfolio Mix

In Phase 20, **portfolio mix** is the distribution of private learners across broad support modes, such as:
- keep active
- simplify support
- light-touch
- handoff-ready

### Definition of Operating Mode

An **operating mode** is a derived teacher-facing state that summarizes whether the current learner mix looks sustainable.

First-pass states:
- `balanced`
- `active_heavy`
- `stretched`
- `stabilization_heavy`

These states should be derived from current learner distribution, not manual settings.

### Definition of Support-Mode Concentration

Support-mode concentration means too much of the learner portfolio is clustering in one operational mode:
- too many learners still requiring active support
- too few learners stabilizing
- too many learners stuck in repeated intervention cycles

## Data Direction

Phase 20 should be implemented without a new persistence layer.

It should derive from existing signals already available in:
- `src/lib/teacher-reporting.ts`
- private learner stabilization states
- workload and concentration summaries
- checkpoint and priority summaries

## Shared Types

Recommended additions in:
- `src/lib/teacher-reporting.ts`

### Portfolio mix summary

```ts
export interface TeacherPortfolioMixSummary {
  keep_active_count: number;
  simplify_support_count: number;
  light_touch_count: number;
  handoff_ready_count: number;
  operating_mode: "balanced" | "active_heavy" | "stretched" | "stabilization_heavy";
  summary_note: string;
}
```

### Portfolio mode item

```ts
export interface TeacherPortfolioModeItem {
  mode: "keep_active" | "simplify" | "light_touch" | "handoff_ready";
  learner_count: number;
  reason: string;
}
```

## Derived Rules

### `keep_active_count`

Count private learners whose current derived stabilization state is:
- `keep_active`

### `simplify_support_count`

Count private learners whose current derived stabilization state is:
- `simplify`

### `light_touch_count`

Count private learners whose current derived stabilization state is:
- `light_touch`

### `handoff_ready_count`

Count private learners whose current derived stabilization state is:
- `handoff_ready`

### Operating Mode

Suggested first pass:

#### `active_heavy`
- keep-active learners clearly dominate the portfolio
- or active pressure is substantially larger than stable/support-light states

#### `stretched`
- keep-active pressure is high and simplification is not offsetting it
- but not severe enough to call overloaded (that remains Phase 18 language)

#### `stabilization_heavy`
- simplify + light-touch + handoff-ready materially outweigh keep-active

#### `balanced`
- no one mode dominates heavily
- the portfolio shows a workable spread between active support and stable learners

These rules should be conservative and explainable.

## Screen Map

### 1. `Teaching > Overview`

Add a **Portfolio Mix** block.

Should show:
- keep active
- simplify support
- light-touch
- handoff-ready
- derived operating mode
- a short summary note

This is the main entry point for Phase 20.

### 2. `Teaching > Private Learners`

Add clearer support-mode visibility:
- mode summary counts
- optional grouped language or section notes by operational mode

The first pass can remain within the current status-group structure, as long as the mode is visible.

### 3. `Teaching > Reporting`

Add:
- portfolio summary cards
- operating-mode explanation
- distribution / concentration visibility by support mode

This should answer:
- whether the current learner mix is balanced
- whether too much of the portfolio is still active-heavy

## Milestones

### Milestone 1: Derived Portfolio Mix Summary

Primary files:
- `src/lib/teacher-reporting.ts`
- `src/app/notebook/teacher/page.tsx`

Deliverables:
- `TeacherPortfolioMixSummary`
- derived operating-mode logic
- portfolio mix block in `Teaching > Overview`

### Milestone 2: Learner-Level Portfolio-Mode Visibility

Primary files:
- `src/app/notebook/teacher/private-students/page.tsx`

Deliverables:
- visible support-mode counts and language in the private learner workflow
- clearer mode context per learner

### Milestone 3: Portfolio Distribution Reporting

Primary files:
- `src/app/notebook/teacher/reporting/page.tsx`

Deliverables:
- portfolio summary cards
- operating-mode explanation
- distribution reporting by support mode

## Risks

### 1. Too much overlap with stabilization

Phase 19 = which learners are stable enough to simplify  
Phase 20 = what the teacher’s whole learner mix looks like

### 2. Too much overlap with workload balancing

Phase 18 = whether current pressure is clustering badly  
Phase 20 = whether the whole portfolio shape is sustainable

### 3. Mode language feels managerial

Keep labels teacher-readable and concrete. Avoid language that sounds like staffing dashboards.

## Ready to Implement

Phase 20 is ready to implement when:
- the first pass stays derived-first
- the operating-mode rules are simple and explainable
- the portfolio layer complements rather than duplicates workload and stabilization
- language stays teacher-supportive instead of judgmental
