# Phase 16 Implementation Spec

## Purpose

Phase 16 turns `docs/phase-16-planning.md` into an implementation-ready spec.

The goal is to add a **teacher prioritization and sequencing layer** on top of the existing teaching workflow so HanziBit can help answer:

- which private learners need attention first
- which recurring issue clusters deserve near-term follow-through
- which weak strategies or playbooks should be addressed next
- what the teacher should act on first across the workspace

Phase 16 should remain operational and lightweight.

It should support prioritization, not automate teaching decisions.

---

## Scope

Phase 16 includes:

1. a ranked teacher priority queue in `Teaching > Overview`
2. stronger ranking inside `Teaching > Private Learners`
3. ranked follow-through signals in `Teaching > Reporting`

Phase 16 does **not** include:

- scheduling
- notifications
- auto-generated plans
- auto-created assignments
- teacher task automation
- calendar sync

---

## Product Goal

By the end of Phase 16, a teacher should be able to open the `Teaching` workspace and quickly understand:

- what requires attention first
- why it is high priority
- where to go next to act on it

---

## Product Principles

### 1. Derived-first prioritization

The first implementation pass should derive priority from existing signals, not add a new task system.

Primary sources:

- `private_students`
- `private_student_goals`
- `private_lesson_history`
- `private_lesson_plans`
- `private_student_reviews`
- `private_student_strategy_applications`
- `private_student_strategy_outcomes`
- `private_student_playbook_applications`
- `private_student_playbook_outcomes`
- teacher reporting aggregates already in place

### 2. Explain the priority

Every priority item should show *why* it is high priority.

Good examples:

- `Blocked goal + no playbook + no recent adaptation`
- `Recurring tone issue across 4 learners, 2 without support path`
- `Weak playbook used across 3 learners`

### 3. Link to action, not just visibility

Every priority row should take the teacher somewhere useful:

- private learner detail
- reporting drill-down
- strategy detail
- playbook detail

---

## No New Workspace

Phase 16 stays inside:

- `Teaching > Overview`
- `Teaching > Private Learners`
- `Teaching > Reporting`

Optionally, Milestone 3 may add stronger action hints to:

- `Teaching > Library`

No new top-level nav should be introduced.

---

## Data Direction

### No new schema in the first pass

Phase 16 should be fully derived for Milestones 1 through 3.

No new tables are required to start.

If a future phase needs persistent teacher task tracking, that should be a later decision, not Phase 16.

---

## Priority Model

Phase 16 needs a lightweight, explainable ranking model.

### Priority Inputs

A private learner should rank higher when multiple pressure signals stack:

- `awaiting_teacher`
- `inactive`
- blocked goals
- needs reinforcement
- recurring issue tags
- no strategy
- no playbook
- reviewed but not adapted
- no recent review
- no recent adaptation
- no next plan
- overdue plan
- no active goal
- no recent history
- weak continuity

### Example Priority Heuristic

The first pass can use weighted scoring, for example:

- blocked goal: high
- no support path: high
- recurring issue cluster: high
- reviewed, not adapted: medium-high
- overdue plan: medium
- no recent history: medium
- no strategy or no playbook alone: medium

This should remain internal implementation detail.

In the UI, the app should show:

- `Urgent`
- `High`
- `Watch`

or similar human-readable labels.

---

## Screen Map

### 1. Teaching > Overview

Add a compact **Priority Queue** section.

This should show:

- top private learners needing attention
- top issue clusters with support gaps
- top weak strategy/playbook follow-through items

This should be short and opinionated, not a long list.

### 2. Teaching > Private Learners

Strengthen ordering and summary cards so the page behaves more like an operational queue.

Add:

- stronger priority ordering within each group
- visible priority badges
- clear “why this learner is high priority”

### 3. Teaching > Reporting

Add ranked pattern follow-through sections:

- highest priority issue clusters
- most urgent weak strategies
- most urgent weak playbooks

### 4. Optional: Library Context

Later in the phase, library cards may show:

- `High priority to refine`
- `Common active issue`
- `Broad but weak`

But that is secondary to the overview/reporting/learner workflow.

---

## Milestone Order

### Milestone 1: Teacher Priority Queue

Add a top-level ranked queue to `Teaching > Overview`.

Deliverables:

- top private learner priority items
- top issue-cluster priority items
- plain-language reason strings
- direct action links

Primary files:

- `src/lib/teacher-reporting.ts`
- `src/app/notebook/teacher/page.tsx`

### Milestone 2: Private Learner Priority Ranking

Improve `Teaching > Private Learners` ranking and row explanation.

Deliverables:

- stronger ordering
- priority badges
- compact “why now” guidance on learner cards

Primary files:

- `src/app/notebook/teacher/private-students/page.tsx`
- supporting helper logic, likely derived there or shared from reporting

### Milestone 3: Ranked Pattern Follow-Through

Make `Teaching > Reporting` show which issue clusters, strategies, and playbooks deserve action first.

Deliverables:

- ranked pattern sections
- top weak strategy/playbook candidates
- top unsupported recurring issue clusters

Primary files:

- `src/lib/teacher-reporting.ts`
- `src/app/notebook/teacher/reporting/page.tsx`

### Milestone 4: Phase 16 Polish

Deliverables:

- clearer copy
- simpler prioritization labels
- better action-link consistency

---

## Suggested Types

### `TeacherPriorityItem`

Suggested shape:

```ts
type TeacherPriorityItem = {
  kind: "private_learner" | "issue_cluster" | "strategy" | "playbook";
  id: string;
  title: string;
  href: string;
  priority_score: number;
  priority_level: "urgent" | "high" | "watch";
  reason: string;
  supporting_note: string | null;
};
```

This could live inside `src/lib/teacher-reporting.ts` on the first pass.

### `TeacherPrioritySummary`

Suggested shape:

```ts
type TeacherPrioritySummary = {
  urgent_count: number;
  high_count: number;
  watch_count: number;
  items: TeacherPriorityItem[];
};
```

---

## Ranking Rules

### Private Learners

A learner should likely become `urgent` when:

- blocked goal + no playbook
- recurring issue + no support path
- reviewed but not adapted + overdue or no plan
- inactive + still under active private support expectation

### Issue Clusters

A cluster should likely rank highest when:

- many learners are affected
- support gaps still exist
- no recent outcome evidence exists

### Strategies / Playbooks

These should rank highest when:

- broad weak status
- significant usage breadth
- no recent refinement
- repeated replacement or no-change outcomes

---

## Permissions

Phase 16 follows existing teacher workspace permissions:

- only teachers see prioritization across learners
- learners do not see teacher priority queues
- no public exposure of teacher priority data

---

## Copy Direction

Prefer plain-language summaries such as:

- `Urgent: blocked learner still has no playbook`
- `High: tone accuracy is recurring across 4 learners, 2 with no support path`
- `Watch: this strategy is mixed across learners and still needs refinement`

Avoid internal product language like:

- `priority coefficient`
- `queue score`
- `escalation severity index`

---

## Risks

### 1. Too many high-priority signals

If everything becomes urgent, the queue loses value.

Mitigation:

- cap visible top items
- require stacked signals for `urgent`
- demote isolated weak signals to `watch`

### 2. Priority model feels arbitrary

If the UI doesn’t explain the reason, the ranking will feel untrustworthy.

Mitigation:

- always show a reason string
- keep priority labels simple

### 3. Duplicate information across pages

Phase 16 should not just restate reporting everywhere.

Mitigation:

- `Overview`: what to do first
- `Private Learners`: who to act on first
- `Reporting`: why these patterns deserve attention

---

## Definition of Ready

Phase 16 is ready to implement now if:

- reporting already exposes enough signals to derive the first priority queue
- no new schema is needed
- the first pass can stay inside existing teaching surfaces

That condition is already met.

---

## Recommended Next Step

Start **Phase 16 Milestone 1: Teacher Priority Queue**.

Implementation order:

1. extend `src/lib/teacher-reporting.ts` with a derived `priorityItems` layer
2. rank private learners, issue clusters, strategies, and playbooks
3. render a compact priority queue in `Teaching > Overview`
4. keep the first pass short and practical
