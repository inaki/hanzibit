# Phase 15 Implementation Spec

## Purpose

Phase 15 turns the planning baseline in `docs/phase-15-planning.md` into an implementation-ready spec.

The goal is to add a **cross-learner teaching pattern layer** on top of the existing private tutoring system, so teachers can understand:

- which recurring issues are showing up across multiple private learners
- which strategies are broadly helping or broadly weak
- which playbooks are repeatedly useful, stale, or underperforming
- where support is still ad hoc instead of systematic

Phase 15 should remain operational and lightweight.

It should help the teacher decide what to do next.

It should not become a BI dashboard.

---

## Scope

Phase 15 includes:

1. cross-learner issue pattern reporting
2. strategy pattern reporting across private learners
3. playbook pattern reporting across private learners
4. pattern-aware context inside strategy and playbook detail pages

Phase 15 does **not** include:

- automated teacher recommendations
- machine learning or AI pattern detection
- arbitrary analytics slicing
- charts for their own sake
- teacher benchmarking
- learner-to-learner comparison views outside teacher operations

---

## Product Goal

By the end of Phase 15, a teacher should be able to answer:

- What problems are repeating across my learners?
- Which approaches seem broadly useful?
- Which approaches are being reused but still weak?
- Where am I responding ad hoc instead of using repeatable support?

---

## Product Principles

### 1. Derived first

Phase 15 should derive as much as possible from existing data before introducing new storage.

Primary existing sources:

- `private_lesson_history`
- `private_student_goals`
- `private_student_strategy_applications`
- `private_student_strategy_outcomes`
- `private_student_playbook_applications`
- `private_student_playbook_outcomes`
- `private_students`
- `private_student_reviews`

### 2. Action-linked reporting

Every pattern signal should connect to an existing action path:

- open a private learner
- refine a strategy
- refine or replace a playbook
- apply a strategy/playbook where missing

### 3. Plain-language summaries

Phase 15 should prioritize human-readable summaries such as:

- `Tone accuracy is recurring across 4 learners`
- `This strategy is used often, but outcomes are still mixed`
- `This playbook is active but often ends in replacement`

---

## No New Top-Level Workspace

Phase 15 should extend existing teacher surfaces:

- `Teaching > Reporting`
- `Teaching > Library`
- `Teaching > Overview`
- optionally `Teaching > Private Learners`

No new global sidebar item should be created.

---

## Data Direction

### Prefer derived aggregates

Milestones 1 through 3 should be implementable without introducing new core tables.

New tables are optional and should only be added if a real gap appears.

Possible future additions, only if needed:

- `teacher_pattern_notes`
- `teacher_pattern_snapshots`

These are explicitly **not required** for the first implementation pass.

---

## Core Derived Signals

### A. Cross-Learner Issue Patterns

Derived from:

- recurring issue tags in `private_lesson_history`
- latest intervention context
- linked private learner status

Useful computed values:

- issue tag
- affected learner count
- affected learner ids
- learners with no strategy
- learners with no playbook
- learners with no recent outcome

### B. Strategy Pattern Signals

Derived from:

- `private_student_strategy_applications`
- `private_student_strategy_outcomes`

Useful computed values:

- strategy usage breadth
- helped / partial / no change / replace counts
- learners currently using the strategy
- strategies with repeated weak outcomes across multiple learners

### C. Playbook Pattern Signals

Derived from:

- `private_student_playbook_applications`
- `private_student_playbook_outcomes`

Useful computed values:

- playbook usage breadth
- helped / partial / no change / replace counts
- active learners under the playbook
- weak or stale playbooks used across multiple learners

### D. Ad Hoc Support Signal

Derived from:

- intervention pressure exists
- no strategy applied
- no playbook applied

This helps identify where the teacher is still handling problems one-off instead of using reusable support.

---

## Screen Map

### 1. Teaching > Reporting

Add a new top-level reporting section:

- `Teaching Patterns`

This section should include:

- common issue clusters
- strategy pattern summary
- playbook pattern summary
- ad hoc support summary

### 2. Teaching > Library > Strategy Detail

Extend strategy detail to include:

- affected learner count
- repeated issue overlap
- broad-outcome pattern language
- whether the strategy is helping only in isolated cases or across multiple learners

### 3. Teaching > Library > Playbook Detail

Extend playbook detail to include:

- active learner count
- repeated replacement pressure
- repeated weak outcomes
- whether the playbook looks broadly useful or stale

### 4. Teaching > Overview

Optional first-pass additions:

- one summary card for cross-learner issue pressure
- one summary card for weak repeated approaches

This should remain compact and should not duplicate the full reporting page.

---

## Milestone Order

### Milestone 1: Cross-Learner Pattern Reporting

Add cross-learner issue cluster summaries to `Teaching > Reporting`.

Deliverables:

- issue-pattern aggregation in reporting helper layer
- summary cards like:
  - `Recurring issue clusters`
  - `Learners with no support path`
- issue cluster rows with:
  - tag
  - learner count
  - support gap counts

Primary files:

- `src/lib/teacher-reporting.ts`
- `src/app/notebook/teacher/reporting/page.tsx`

### Milestone 2: Strategy and Playbook Pattern Signals

Extend reporting to show broad reuse/effectiveness patterns, not only per-record effectiveness.

Deliverables:

- `widely helping`
- `mixed outcomes`
- `weak across learners`
- `used but underperforming`

Primary files:

- `src/lib/teacher-reporting.ts`
- `src/app/notebook/teacher/reporting/page.tsx`

### Milestone 3: Pattern-Aware Library Context

Add cross-learner pattern context into strategy and playbook detail pages.

Deliverables:

- strategy detail shows repeated issue overlap and cross-learner usefulness
- playbook detail shows cross-learner effectiveness and replacement pressure

Primary files:

- `src/app/notebook/teacher/library/strategies/[strategyId]/page.tsx`
- `src/app/notebook/teacher/library/playbooks/[playbookId]/page.tsx`
- supporting helper modules

### Milestone 4: Phase 15 Polish

Polish copy, summaries, and action links.

Deliverables:

- plain-language summary improvements
- clearer support-gap copy
- better connection from reporting rows into learner/library workflows

---

## Suggested Types

These may live in `src/lib/teacher-reporting.ts` or a dedicated helper if it grows too large.

### `TeacherReportingIssuePatternItem`

Suggested shape:

```ts
type TeacherReportingIssuePatternItem = {
  issue_tag: string;
  learner_count: number;
  learner_ids: string[];
  learners_without_strategy: number;
  learners_without_playbook: number;
  learners_without_recent_outcome: number;
  latest_intervention_note: string | null;
};
```

### Strategy Pattern Item

Could extend the existing strategy reporting row shape with:

```ts
type TeacherReportingStrategyPatternItem = {
  strategy_id: string;
  title: string;
  learner_count: number;
  usage_count: number;
  helped_count: number;
  partial_count: number;
  no_change_count: number;
  replace_count: number;
  broad_status: "helping" | "mixed" | "weak" | "insufficient_data";
};
```

### Playbook Pattern Item

Could extend the existing playbook reporting row shape with:

```ts
type TeacherReportingPlaybookPatternItem = {
  playbook_id: string;
  title: string;
  learner_count: number;
  usage_count: number;
  helped_count: number;
  partial_count: number;
  no_change_count: number;
  replace_count: number;
  broad_status: "helping" | "mixed" | "weak" | "insufficient_data";
};
```

---

## Permissions

Phase 15 should follow existing teacher-reporting permissions:

- only the teacher who owns the reporting context can see cross-learner pattern summaries
- learners do not see cross-learner teacher pattern reporting
- no public exposure of private learner clusters

No new public permissions should be introduced.

---

## Reporting Copy Direction

Prefer copy like:

- `Recurring issue: tone accuracy across 4 learners`
- `2 of these learners still have no strategy`
- `This strategy is helping broadly`
- `This playbook is frequently reused but outcomes are still mixed`
- `Support is still ad hoc for 3 learners with recurring issue pressure`

Avoid copy like:

- `cluster confidence`
- `pattern score`
- `effectiveness coefficient`

This product should remain teacher-readable.

---

## Risks

### 1. Too much reporting noise

If every derived metric becomes visible, Phase 15 will feel bloated.

Mitigation:

- show only the top pattern summaries
- rank by teacher usefulness, not total possible metrics

### 2. Weak signals from small sample size

Some strategies/playbooks may only have one or two uses.

Mitigation:

- add `insufficient data` style states
- do not overstate effectiveness from tiny samples

### 3. Duplication with existing strategy/playbook effectiveness

Phase 15 must go beyond “this record has outcomes” and focus on cross-learner patterns.

Mitigation:

- reuse existing reporting where possible
- add only truly broader signals

---

## Definition of Ready

Phase 15 implementation is ready to begin when:

- existing reporting helper output is understood well enough to extend safely
- milestone 1 is clearly derived from current data
- no new schema is required for the first pass

That condition is already met.

---

## Recommended Next Step

Start **Phase 15 Milestone 1: Cross-Learner Pattern Reporting**.

Build it in this order:

1. extend `src/lib/teacher-reporting.ts`
2. add issue-cluster and support-gap summaries
3. render a `Teaching Patterns` section in `Teaching > Reporting`
4. keep it derived-only on the first pass
