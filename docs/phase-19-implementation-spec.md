# Phase 19 Implementation Spec

## Phase Goal

Phase 19 adds a **teacher stabilization and handoff layer** on top of:
- Phase 17 review rhythm
- Phase 18 workload balancing

By the end of Phase 18, HanziBit can help a teacher answer:
- what matters most now
- what needs to be revisited
- where pressure is clustering
- whether overall load is healthy, stretched, or overloaded

Phase 19 should add the next operating question:

**Which learners and support paths are stable enough to simplify or monitor more lightly, and which ones still need active intervention?**

## Scope

Phase 19 should remain:
- derived-first
- teacher-facing
- lightweight
- operational, not administrative

It should add:
- stabilization summaries
- learner-level stable / simplify / handoff-ready signals
- support simplification visibility
- low-friction “keep active vs simplify” guidance

It should not add:
- staff reassignment
- external handoff workflows
- scheduling changes
- messaging
- marketplace routing
- automated learner transfer

## Core Model

### Definition of Stabilization

In Phase 19, a learner is **stabilizing** when recent signals suggest:
- low active pressure
- no repeated blocked goals
- no fresh recurring-issue escalation
- recent review/adaptation history is steady enough
- current support paths are not repeatedly failing

### Definition of Simplification Opportunity

A learner or support path shows a **simplification opportunity** when:
- support is still attached
- recent outcomes are positive or steady
- current pressure is low
- no urgent checkpoint or adaptation pressure is visible

### Definition of Handoff-Ready

In the first pass, **handoff-ready** does not mean external transfer.

It means:
- light-touch monitoring may be enough
- the learner no longer needs the same active intervention load
- the teacher can afford to reduce operational intensity safely

## Data Direction

Phase 19 should be implemented without adding a new persistence layer.

It should derive from existing data already available in:
- `src/lib/teacher-reporting.ts`
- `privateLearnerItems`
- `priorityItems`
- `checkpointItems`
- `strategyItems`
- `playbookItems`

## Shared Types

Recommended additions in:
- `src/lib/teacher-reporting.ts`

### Stabilization summary

```ts
export interface TeacherStabilizationSummary {
  stable_private_learners: number;
  simplify_support_candidates: number;
  handoff_ready_private_learners: number;
  still_active_pressure: number;
  summary_note: string;
}
```

### Stabilization item

```ts
export interface TeacherStabilizationItem {
  kind: "learner" | "strategy" | "playbook";
  id: string;
  title: string;
  href: string;
  stabilization_state: "keep_active" | "simplify" | "light_touch" | "handoff_ready";
  reason: string;
  supporting_note: string | null;
}
```

## Derived Rules

### Stable Private Learner

A private learner should count as stable when all of the following are broadly true:
- no blocked goals
- no fresh recurring issue pressure
- no urgent priority
- no overdue checkpoint
- no recent weak strategy/playbook outcome
- has recent enough review/adaptation/history context

### Simplify Support Candidate

A learner or support path should count here when:
- current support exists
- current pressure is low
- latest outcome is helped / steady
- no fresh adaptation pressure is visible

### Handoff-Ready Learner

Conservative first pass:
- learner is stable
- learner has a current support path or lesson structure
- no urgent / overdue / blocked state
- no recent weak outcome
- no repeated issue concentration

### Keep Active

If any strong pressure is still present, the state should remain `keep_active`.

## Screen Map

### 1. `Teaching > Overview`

Add a **Stabilization Snapshot** block.

Should show:
- stable private learners
- simplify support candidates
- handoff-ready learners
- still-active pressure
- a short note like:
  - `Most current support still needs active follow-through`
  - `Several learners look stable enough for lighter-touch support`

### 2. `Teaching > Private Learners`

Add learner-level stabilization cues:
- `stable`
- `simplify support`
- `light-touch`
- `handoff-ready`

These should complement existing priority and rhythm, not replace them.

### 3. `Teaching > Reporting`

Add stabilization reporting:
- stable learners
- simplify support opportunities
- handoff-ready learners
- support structures that look heavier than necessary

## Milestones

### Milestone 1: Derived Stabilization Summary

Primary files:
- `src/lib/teacher-reporting.ts`
- `src/app/notebook/teacher/page.tsx`

Deliverables:
- `TeacherStabilizationSummary`
- derived stabilization logic
- stabilization snapshot in `Teaching > Overview`

### Milestone 2: Learner-Level Stabilization Visibility

Primary files:
- `src/app/notebook/teacher/private-students/page.tsx`

Deliverables:
- stabilization state on learner cards
- simple guidance on whether to keep active or simplify

### Milestone 3: Stabilization Reporting

Primary files:
- `src/app/notebook/teacher/reporting/page.tsx`

Deliverables:
- stabilization summary cards
- stabilization reporting rows
- support simplification visibility

## Risks

### 1. Too optimistic

The system should be conservative about handoff-ready states. Better to under-call than over-call.

### 2. Too much overlap with workload

Phase 18 = where load is too concentrated  
Phase 19 = where load may now be low enough to simplify

### 3. Too much overlap with rhythm

Phase 17 = what should be revisited  
Phase 19 = what may no longer need the same intensity

## Ready to Implement

Phase 19 is ready to implement when:
- the model stays derived-first
- the first pass does not add persistence
- states are conservative and explainable
- language clearly supports teachers instead of implying abandonment
