# Phase 22 Implementation Spec

## Phase Goal

Phase 22 adds a **teacher capacity expansion and intake-readiness layer** after operating review.

By the end of Phase 21, HanziBit can help a teacher answer:
- what is most urgent
- what rhythm is overdue
- where support is clustering
- whether the current portfolio should be reset, rebalanced, simplified, or maintained

Phase 22 should add the next operating question:

**Is the current portfolio actually ready to absorb more active learners, or should intake pause until pressure settles?**

## Scope

Phase 22 should remain:
- derived-first
- teacher-facing
- lightweight
- operational

It should add:
- intake-readiness summary
- hold / cautious / ready / pause cues
- overview visibility first

It should not add:
- automatic throttling
- waitlists
- lead routing
- booking
- hard caps

## Shared Types

Recommended additions in `src/lib/teacher-reporting.ts`:

```ts
export interface TeacherIntakeReadinessSummary {
  pause_intake_count: number;
  hold_steady_count: number;
  cautious_capacity_count: number;
  ready_to_expand_count: number;
  intake_state: "ready" | "cautious" | "hold" | "pause";
  summary_note: string;
}
```

## Derived Rules

### `pause_intake_count`

Count learners contributing to immediate reset pressure.

Suggested first pass:
- reuse `operatingReviewSummary.reset_now_count`

### `hold_steady_count`

Count learners contributing to strong but not full-reset pressure.

Suggested first pass:
- reuse `operatingReviewSummary.rebalance_count`

### `cautious_capacity_count`

Count learners who are moving into simpler support but still represent meaningful active load.

Suggested first pass:
- reuse `operatingReviewSummary.simplify_now_count`

### `ready_to_expand_count`

Count learners currently stable enough to maintain without high near-term pressure.

Suggested first pass:
- reuse `operatingReviewSummary.stable_to_maintain_count`

### `intake_state`

Suggested first pass:
- `pause`
  - `workloadSummary.load_state === "overloaded"` or `operatingReviewSummary.review_state === "reset"`
- `hold`
  - `workloadSummary.load_state === "stretched"` or `operatingReviewSummary.review_state === "rebalance"` or portfolio mode is still active-heavy/stretched
- `cautious`
  - there is still meaningful due-now or concentration pressure
- `ready`
  - otherwise

## Screen Map

### 1. `Teaching > Overview`

Add an **Intake Readiness** block showing:
- pause intake
- hold steady
- cautious capacity
- ready to expand
- intake state
- summary note

### 2. `Teaching > Private Learners`

Milestone 2 should surface:
- why the portfolio is still not ready to expand
- which learners are carrying intake-blocking pressure

### 3. `Teaching > Reporting`

Milestone 3 should add:
- intake-readiness summary cards
- a dedicated capacity / intake section
- grouped reasons blocking safe expansion

## Milestones

### Milestone 1: Intake Readiness Summary

Primary files:
- `src/lib/teacher-reporting.ts`
- `src/app/notebook/teacher/page.tsx`

Deliverables:
- `TeacherIntakeReadinessSummary`
- derived `intake_state`
- overview block

### Milestone 2: Learner-Level Capacity Pressure Visibility

Primary files:
- `src/app/notebook/teacher/private-students/page.tsx`

### Milestone 3: Capacity / Intake Reporting

Primary files:
- `src/app/notebook/teacher/reporting/page.tsx`

## Ready To Implement

Phase 22 is ready once:
- Milestone 1 is implemented
- overview shows a clear intake-readiness block
- the first pass stays fully derived from existing teacher-reporting signals
