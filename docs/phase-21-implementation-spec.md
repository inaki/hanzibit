# Phase 21 Implementation Spec

## Phase Goal

Phase 21 adds a **teacher operating review and portfolio reset layer** after portfolio shaping.

By the end of Phase 20, HanziBit can show:
- urgency
- rhythm
- concentration
- stabilization
- portfolio mix

Phase 21 should help a teacher answer:

**Should I keep operating as-is, rebalance support, simplify parts of the portfolio, or reset before taking on more pressure?**

## Scope

Phase 21 should remain:
- derived-first
- teacher-facing
- lightweight
- operational

It should add:
- operating review summary
- reset / rebalance / simplify states
- overview guidance
- learner-level and reporting visibility later

It should not add:
- automation
- hard portfolio limits
- pricing or sales logic
- scheduling

## Shared Types

Recommended additions in `src/lib/teacher-reporting.ts`:

```ts
export interface TeacherOperatingReviewSummary {
  reset_now_count: number;
  rebalance_count: number;
  simplify_now_count: number;
  stable_to_maintain_count: number;
  review_state: "steady" | "watch" | "rebalance" | "reset";
  summary_note: string;
}
```

## Derived Rules

### `reset_now_count`

Count private learners that are carrying the highest operating risk, for example:
- blocked goals plus no clear support path
- reviewed but not adapted with continuing pressure
- high active pressure plus overdue plan or overdue checkpoint

### `rebalance_count`

Count learners still in active-management mode but not severe enough to count as reset-now pressure.

### `simplify_now_count`

Count learners currently in the derived `simplify` stabilization state.

### `stable_to_maintain_count`

Count learners currently in:
- `light_touch`
- `handoff_ready`

### `review_state`

Suggested first pass:
- `reset`
  - overloaded workload, or high reset-now pressure
- `rebalance`
  - active-heavy portfolio or high concentration without full reset pressure
- `watch`
  - balanced enough, but still carrying meaningful operational pressure
- `steady`
  - portfolio looks sustainable right now

## Screen Map

### 1. `Teaching > Overview`

Add an **Operating Review** block showing:
- reset now
- rebalance
- simplify now
- stable to maintain
- review state
- summary note

### 2. `Teaching > Private Learners`

Milestone 2 should surface:
- reset-now learners
- rebalance learners
- simplify-now learners

### 3. `Teaching > Reporting`

Milestone 3 should add:
- operating review summary cards
- a dedicated reset / rebalance follow-through section

## Milestones

### Milestone 1: Operating Review Summary

Primary files:
- `src/lib/teacher-reporting.ts`
- `src/app/notebook/teacher/page.tsx`

Deliverables:
- `TeacherOperatingReviewSummary`
- derived `review_state`
- overview block

### Milestone 2: Learner-Level Reset / Rebalance Visibility

Primary files:
- `src/app/notebook/teacher/private-students/page.tsx`

### Milestone 3: Operating Review Reporting

Primary files:
- `src/app/notebook/teacher/reporting/page.tsx`

## Ready To Implement

Phase 21 is ready once:
- Milestone 1 is implemented
- overview shows a clear operating review block
- summary stays fully derived from existing teacher-reporting signals
