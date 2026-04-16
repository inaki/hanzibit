# Phase 17 Implementation Spec

## Phase Goal

Phase 17 adds a **teacher review rhythm and operational checkpoint layer** on top of the priority system from Phase 16.

By the end of Phase 16, HanziBit can help a teacher answer:

- what matters most right now?
- which learner, issue cluster, strategy, or playbook needs action first?

Phase 17 should add the next operational question:

**What needs to be revisited this week, what is overdue, and where is my review rhythm slipping?**

## Scope

Phase 17 should remain:
- lightweight
- derived-first
- teacher-facing
- operational, not calendar-driven

It should add:
- review checkpoint signals
- current-vs-overdue review framing
- checkpoint visibility across `Overview`, `Private Learners`, and `Reporting`

It should not add:
- booking
- scheduling
- reminders
- calendar sync
- notification systems
- explicit learner scheduling flows

## Core Model

### Definition of a Checkpoint

A **checkpoint** is a derived need for a teacher to re-evaluate a learner or support path based on elapsed time and visible pressure.

Checkpoint examples:
- learner has no recent review snapshot
- learner has recurring issue pressure with no recent follow-up
- learner has a recent review but no recent adaptation
- learner has a stale lesson plan or stale support path
- learner has pressure but no recent support outcome

### Checkpoint Categories

The first pass should keep this simple:

1. `review_due`
2. `adaptation_due`
3. `support_recheck_due`

Optional later:
4. `continuity_recheck_due`

## Data Direction

### Derived-First Approach

Phase 17 should be implemented without a new required persistence layer.

Checkpoint state should be derived from existing fields such as:
- `last_review_snapshot_at`
- `last_plan_adapted_at`
- `latest_history_at`
- `lesson_plan_target_date`
- `latest_strategy_outcome_at`
- `latest_playbook_outcome_at`
- private learner pressure flags already present in reporting

### Optional Future Persistence

If later needed, Phase 17.5+ could add explicit checkpoint acknowledgements, but that is out of scope here.

## Derived Rules

These are the recommended first-pass checkpoint rules.

### Review Due

`review_due = true` when:
- learner is not onboarding
- and no recent review snapshot exists
- and meaningful pressure exists

Pressure can include:
- blocked goals
- recurring issue tags
- reinforcement pressure
- no recent history

### Adaptation Due

`adaptation_due = true` when:
- a recent review exists
- but plan adaptation is stale or missing
- and learner pressure still exists

### Support Recheck Due

`support_recheck_due = true` when:
- strategy or playbook exists
- but no recent outcome exists
- or latest outcome is weak/replace
- or support path exists but pressure continues

### Overdue

A checkpoint is `overdue` when:
- it is due
- and the derived elapsed window is significantly past target

The first pass can use simple windows like:
- review: 14 days
- adaptation: 14 days
- support recheck: 14 days

These thresholds should stay centralized and easy to tune.

## Shared Types

Add a derived type in reporting logic, likely in:
- `src/lib/teacher-reporting.ts`

Suggested shape:

```ts
export interface TeacherCheckpointItem {
  kind: "review_due" | "adaptation_due" | "support_recheck_due";
  private_student_id: string;
  student_name: string;
  classroom_id: string;
  classroom_name: string;
  due_state: "due_now" | "overdue" | "recently_checked";
  days_open: number | null;
  reason: string;
  supporting_note: string | null;
  href: string;
}
```

## Screen Map

### 1. `Teaching > Overview`

Add a compact **Review Window** section.

Should show:
- due now count
- overdue count
- recently checked count
- top checkpoint items

This is the highest-level operational rhythm entry point.

### 2. `Teaching > Private Learners`

Add checkpoint visibility directly on learner cards:
- due now
- overdue
- recently reviewed

Also add a small explanation:
- why this learner is back in the teacher’s review window

This should complement, not replace, the Phase 16 priority signals.

### 3. `Teaching > Reporting`

Add rhythm reporting:
- review due
- adaptation due
- support recheck due
- overdue checkpoint groups

Reporting should answer:
- where rhythm is slipping
- what kind of checkpoint is being missed

## Milestones

### Milestone 1: Derived Review Checkpoint Model

Add derived checkpoint logic in:
- `src/lib/teacher-reporting.ts`

Deliverables:
- checkpoint item type
- checkpoint derivation
- due / overdue summary totals
- review window summary for `Teaching > Overview`

### Milestone 2: Checkpoint Visibility in `Private Learners`

Add learner-facing teacher workflow signals in:
- `src/app/notebook/teacher/private-students/page.tsx`

Deliverables:
- due / overdue checkpoint badges
- checkpoint reason
- learner card ordering support

### Milestone 3: Checkpoint Rhythm Reporting

Add reporting visibility in:
- `src/app/notebook/teacher/reporting/page.tsx`

Deliverables:
- checkpoint summary cards
- overdue checkpoint rows
- rhythm-focused grouped reporting

### Polish

Clarify copy and avoid turning the system into task-management jargon.

Preferred wording:
- due now
- overdue
- reviewed recently
- needs a fresh check-in
- review rhythm is slipping

## Repo Touchpoints

### Primary
- `src/lib/teacher-reporting.ts`
- `src/app/notebook/teacher/page.tsx`
- `src/app/notebook/teacher/private-students/page.tsx`
- `src/app/notebook/teacher/reporting/page.tsx`

### Possibly touched
- `src/lib/private-students.ts`
- `src/app/notebook/classes/[classroomId]/page.tsx`

## Risks

### 1. Too much overlap with priority

Phase 16 and Phase 17 must stay distinct:
- Phase 16 = what matters most
- Phase 17 = what must be revisited on rhythm

### 2. Too much admin language

This should feel like tutoring workflow support, not project management software.

### 3. Too many derived rules

The first pass should stay explainable. If a teacher cannot understand why an item is due, the feature will feel arbitrary.

## Ready to Implement

Phase 17 is ready to implement when:
- checkpoint categories are fixed
- first-pass time windows are accepted
- Milestone 1 stays derived-first with no new persistence requirement

## Recommended Next Step

Start:
- **Phase 17 Milestone 1: derived review checkpoint model**
