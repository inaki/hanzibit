# Phase 18 Implementation Spec

## Phase Goal

Phase 18 adds a **teacher workload balancing and operating-capacity layer** on top of:
- Phase 16 prioritization
- Phase 17 review rhythm

By the end of Phase 17, HanziBit can help a teacher answer:
- what matters most right now
- what needs follow-through first
- what should be revisited this week
- what is overdue vs recently checked

Phase 18 should add the next operational question:

**Is my current teaching load still balanced enough to keep support quality steady, or is pressure concentrating in ways that will make follow-through slip?**

## Scope

Phase 18 should remain:
- derived-first
- teacher-facing
- lightweight
- operational, not predictive

It should add:
- workload summaries
- concentration signals
- healthy / stretched / overloaded cues
- repeated-pressure visibility across learners and support paths

It should not add:
- staffing
- multi-teacher coordination
- schedule optimization
- notifications
- forecasting models
- financial capacity planning

## Core Model

### Definition of Load

In Phase 18, **load** is a derived measure of how much meaningful support pressure is active in the teacher’s workspace right now.

Inputs can include:
- urgent private learners
- overdue checkpoints
- blocked goals
- recurring issue pressure
- no-playbook / no-strategy gaps under pressure
- weak strategies and weak playbooks carrying too many learners

### Definition of Concentration

**Concentration** means pressure is not just present, but clustered:
- repeated urgent pressure on the same learners
- too many learners tied to weak/mixed strategies or playbooks
- issue clusters affecting many learners without a stable support path

### Operating Capacity State

The first pass should use simple, explainable derived states:
- `healthy`
- `stretched`
- `overloaded`

These should come from thresholds based on current active counts, not opaque scoring.

## Data Direction

Phase 18 should be implemented without adding a new persistence layer.

It should derive from existing data already available in:
- `src/lib/teacher-reporting.ts`
- `priorityItems`
- `checkpointItems`
- `privateLearnerItems`
- `issuePatternItems`
- `strategyItems`
- `playbookItems`

## Shared Types

Recommended additions in:
- `src/lib/teacher-reporting.ts`

### Workload summary

```ts
export interface TeacherWorkloadSummary {
  load_state: "healthy" | "stretched" | "overloaded";
  urgent_private_learners: number;
  overdue_checkpoints: number;
  repeated_pressure_learners: number;
  weak_support_paths: number;
  summary_note: string;
}
```

### Concentration item

```ts
export interface TeacherLoadConcentrationItem {
  kind: "learner" | "issue_cluster" | "strategy" | "playbook";
  id: string;
  title: string;
  href: string;
  concentration_level: "high" | "medium" | "watch";
  reason: string;
  supporting_note: string | null;
}
```

## Derived Rules

### Workload Summary Inputs

Suggested first-pass inputs:
- urgent priority items
- overdue checkpoints
- private learners with:
  - blocked goals
  - recurring issue pressure
  - no playbook under pressure
  - no strategy under pressure
- weak strategies / weak playbooks with learner breadth

### Load State Thresholds

Keep these simple.

Suggested first pass:

#### `healthy`
- low overdue checkpoint count
- limited urgent learners
- limited weak support-path concentration

#### `stretched`
- moderate overdue checkpoint count
- multiple urgent learners
- repeated support gaps visible

#### `overloaded`
- many urgent learners
- many overdue checkpoints
- several repeated-pressure learners
- weak support concentration visible across multiple learners

The exact thresholds should remain easy to tune in code.

### Repeated Pressure Learner

A learner should count toward repeated pressure when they have multiple active burden signals together, for example:
- blocked goal + no playbook
- recurring issues + no strategy
- overdue checkpoint + adaptation due

### Weak Support Path Concentration

Strategies/playbooks should count toward load concentration when they are:
- weak or mixed
- reused across multiple learners
- still carrying active learner pressure

## Screen Map

### 1. `Teaching > Overview`

Add a new **Workload Snapshot** block.

Should show:
- load state
- urgent private learners
- overdue checkpoints
- repeated-pressure learners
- weak support paths
- a short explanation like:
  - `Current load looks healthy`
  - `Current load looks stretched`
  - `Current load looks overloaded`

This is the main entry point for Phase 18.

### 2. `Teaching > Reporting`

Add:
- workload summary cards
- concentration sections
- repeated-pressure learner visibility
- support concentration visibility

This should answer:
- where pressure is clustering
- whether support structures are keeping up

### 3. `Teaching > Private Learners`

Add learner-level repeated-pressure visibility:
- repeated-pressure badge
- load-related guidance when the same learners keep surfacing

This should remain secondary in Milestone 3.

## Milestones

### Milestone 1: Derived Workload Summary

Primary files:
- `src/lib/teacher-reporting.ts`
- `src/app/notebook/teacher/page.tsx`

Deliverables:
- `TeacherWorkloadSummary`
- derived load-state logic
- workload snapshot section in `Teaching > Overview`

### Milestone 2: Workload Concentration Reporting

Primary files:
- `src/lib/teacher-reporting.ts`
- `src/app/notebook/teacher/reporting/page.tsx`

Deliverables:
- concentration items
- learner concentration visibility
- weak support path concentration visibility

### Milestone 3: Learner-Level Repeated Pressure Visibility

Primary file:
- `src/app/notebook/teacher/private-students/page.tsx`

Deliverables:
- repeated-pressure learner badges
- repeated-load guidance on learner cards

### Polish

Make the language feel helpful and operational, not judgmental.

Preferred wording:
- healthy load
- stretched load
- overloaded load
- concentrated pressure
- repeated support burden

Avoid:
- failure language
- score-heavy UI
- overly analytical framing

## Repo Touchpoints

### Primary
- `src/lib/teacher-reporting.ts`
- `src/app/notebook/teacher/page.tsx`
- `src/app/notebook/teacher/reporting/page.tsx`
- `src/app/notebook/teacher/private-students/page.tsx`

### Secondary
- `docs/next-steps.md`

## Risks

### 1. Overlap with priority and rhythm

Phase 16 = what matters most now  
Phase 17 = what must be revisited on rhythm  
Phase 18 = whether the total active load is becoming unbalanced

### 2. Arbitrary thresholds

If load states feel random, the feature will feel fake. Keep the thresholds simple and inspectable.

### 3. Negative emotional framing

This should help teachers rebalance, not shame them.

## Ready to Implement

Phase 18 is ready to implement when:
- load-state model is accepted
- Milestone 1 stays fully derived
- no persistence is required for the first pass

## Recommended Next Step

Start:
- **Phase 18 Milestone 1: derived workload summary**
