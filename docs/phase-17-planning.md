# Phase 17 Planning

## Phase Focus

Phase 17 is the **teacher review rhythm and operational checkpoint layer** after prioritization.

By the end of Phase 16, HanziBit can:
- rank teacher follow-through
- surface urgent private learner pressure
- expose issue-cluster, strategy, and playbook follow-through
- help teachers decide what matters first

What it still does not do well is support a **repeatable review rhythm** across that work. Teachers can see pressure, but the product does not yet make it easy to answer:

- what should I revisit this week?
- what review work is overdue?
- which follow-through loops are slipping because I have not checked them recently?

Phase 17 should fill that gap.

## Core Question

**Can HanziBit help a teacher maintain a steady review rhythm across private learners and support layers, instead of relying on ad hoc follow-through?**

## What Phase 17 Is

Phase 17 should introduce a lightweight operational checkpoint layer for teachers:
- review checkpoints across private learners
- checkpoint state that distinguishes current vs overdue
- teacher-facing summaries for “review this week”
- rhythm visibility across priorities, not just isolated urgent items

This is a coordination layer, not a scheduling system.

## What Phase 17 Is Not

Phase 17 should **not** include:
- calendar sync
- lesson booking
- reminders/notification infrastructure
- chat, email automation, or SMS
- full task management
- learner-facing scheduling

It should stay focused on **teacher operational rhythm inside the existing Teaching workspace**.

## Product Goal

Make the teacher workspace answer:

**“What needs review this week, what is overdue, and what is slipping because I have not revisited it?”**

## Proposed Scope

### 1. Lightweight Teacher Review Checkpoints

Introduce derived or lightweight persisted checkpoints around:
- private learner review rhythm
- strategy/playbook follow-up rhythm
- unresolved intervention pressure

Examples:
- learner has not had a review snapshot recently
- learner has not had a plan adaptation after meaningful pressure
- learner has recurring issues but no recent checkpoint

### 2. Weekly / Current Review Window

Inside `Teaching`, provide a compact “current review window” model:
- due this week
- overdue
- recently completed

This should remain simple and operational.

### 3. Checkpoint Summaries in Overview and Reporting

Use the existing priority layer, but add rhythm-aware framing:
- what is due now
- what is becoming stale
- what has been reviewed recently

### 4. Follow-Through Stability Signals

Show whether the teacher is keeping up with their own operational rhythm:
- healthy cadence
- drifting
- overloaded

These should be lightweight derived signals, not judgment-heavy analytics.

## Likely Data Direction

Phase 17 can probably stay mostly **derived-first**.

### Option A: Fully derived checkpoint model
Use existing timestamps to derive:
- review due
- adaptation due
- support recheck due

This is the preferred first pass.

### Option B: Lightweight persisted checkpoint acknowledgements
If needed later, add a small `teacher_review_checkpoints` table for explicit completion tracking.

Do **not** start there unless the derived model proves too weak.

## Main Surfaces Affected

### `Teaching > Overview`
- current review window
- overdue review pressure
- checkpoint rhythm summary

### `Teaching > Private Learners`
- checkpoint due / overdue badges
- stronger “review this week” guidance

### `Teaching > Reporting`
- review rhythm summary
- overdue checkpoint groups
- teacher follow-through health

## Milestone Direction

### Milestone 1
Derived checkpoint model and `Teaching > Overview` review window

### Milestone 2
Checkpoint visibility in `Private Learners`

### Milestone 3
Checkpoint rhythm reporting and teacher follow-through summary

### Polish
Clarify teacher language:
- due now
- overdue
- reviewed recently
- rhythm healthy / drifting

## Risks

### 1. Accidental task-manager sprawl
If this becomes too detailed, it stops being a tutoring operations layer and starts becoming a task app.

### 2. Too much overlap with priority
Phase 17 must complement Phase 16.
- Phase 16 = what matters most now
- Phase 17 = what must be revisited on a stable rhythm

### 3. Weak definitions
If “review due” is too vague, the UI will feel arbitrary.
Definitions need to stay simple and explainable.

## Success Criteria

Phase 17 is successful if a teacher can:
- see what needs review this week
- see what is overdue
- tell whether their follow-through rhythm is slipping
- revisit learner support without hunting across many pages

## Recommended Next Step

Create:
- `docs/phase-17-implementation-spec.md`

Then start with:
- derived checkpoint logic
- overview review-window UI
- no persisted checkpoint table unless clearly necessary
