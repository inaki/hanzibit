# Phase 10 Implementation Spec

## Purpose

This document turns Phase 10 into an implementation-ready specification.

It should answer:

- what Phase 10 builds first
- what schema changes are needed
- what permissions apply
- which screens and flows are required
- what order we should implement in

This doc is the bridge between the Phase 10 plan and actual code.

Current implementation status as of April 14, 2026:

- Phase 10 planning baseline is defined
- Milestone 1 is implemented on web
- Milestone 2 is implemented on web
- Milestone 3 is implemented on web
- the web app already has:
  - private learner lifecycle workflow
  - next lesson/check-in planning
  - private learner goals
  - lesson/check-in history
  - continuity reporting
  - goal progress markers
  - repeated issue capture
  - intervention-oriented reporting
  - intervention guidance inside `Teaching > Private Learners`, private learner detail, and private classroom tutoring cards

It complements:

- `docs/phase-10-planning.md`
- `docs/phase-9-implementation-spec.md`
- `docs/product-evolution-strategy.md`
- `docs/implementation-roadmap.md`

---

## Phase 10 Objective

Phase 10 should help teachers turn recent private learner observations into lightweight plan adaptation.

The practical goal is:

- a private learner already has goals, next lesson context, recent history, and intervention signals
- the teacher can create a compact review snapshot of the learner’s current state
- that review can update the live tutoring plan without extra admin work
- reporting can show which private learners have intervention pressure but no recent adaptation

Phase 10 should build on:

- private learners
- next lesson planning
- private learner goals
- lesson/check-in history
- continuity reporting
- intervention reporting

---

## Phase 10 Structure

Phase 10 should be implemented in three internal tracks:

1. **Phase 10A: private learner review snapshots**
2. **Phase 10B: plan adaptation workflow**
3. **Phase 10C: adaptation reporting**

Recommended order:

1. review snapshots
2. adaptation workflow
3. adaptation reporting

---

## Core Product Rules

### 1. Keep reviews lightweight

Teachers should not have to complete a formal evaluation after every lesson.

The first version should prefer:

- a short review summary
- a short note on what improved
- a short note on what should change next
- visible adaptation timestamps

### 2. Adaptation must update the live workflow

Phase 10 should tie directly into:

- current goals
- next lesson/check-in plan
- linked assignment or template direction
- intervention context

It should not become a disconnected retrospective log.

### 3. Optimize for teacher action

The main value is:

- the teacher can decide what should change
- the learner plan updates in the same workflow
- reporting can surface stale plans that were not adapted

### 4. Reporting should show adaptation freshness

Phase 10 reporting should help answer:

- Which learners have intervention pressure but no recent review?
- Which learners were reviewed and adapted recently?
- Which learners have stale next-step plans despite active tutoring?

### 5. Keep it inside the `Teaching` workspace

Preferred placement:

- `Teaching > Private Learners`
- private learner detail
- `Teaching > Reporting`
- private classroom tutoring card for summary context only

Current implementation checkpoint:

- private learner review snapshots are now implemented on web
- teachers can add compact review notes from `Teaching > Private Learners`
- latest review context now appears in private learner list and reporting
- plan adaptation workflow is now implemented on web
- teachers can adapt the live next-lesson plan from private learner detail
- adaptation can optionally update a goal’s momentum marker in the same workflow
- adaptation timestamps now surface in private learner detail and private classroom context
- adaptation reporting is now implemented on web
- `Teaching > Reporting` now distinguishes:
  - intervention pressure with no recent review
  - intervention pressure with no recent adaptation
  - reviewed-but-not-adapted learners

---

## Scope

### Included

- private learner review snapshots
- short adaptation note
- quick carry-forward updates into goals and next lesson plans
- reporting for adaptation freshness

### Excluded

- formal grading
- parent-facing reports
- automated curriculum generation
- scheduling/calendar sync
- messaging
- learner-facing change history feed

---

## Roles And Permissions

### Teacher can

- create and update review snapshots for their own private learners
- adapt goals and next lesson plans for their own private learners
- view adaptation reporting for their own private learners

### Teacher cannot

- modify another teacher’s reviews or adaptation records
- view another teacher’s adaptation reporting

### Learner can

- view the resulting current tutoring direction in existing private classroom context

### Learner cannot

- edit review snapshots
- edit adaptation notes
- directly modify teacher adaptation state

### Recommended permission helpers

- `canManagePrivateLearnerReview(userId, privateStudentId)`
- `canManagePrivateLearnerAdaptation(userId, privateStudentId)`
- `canViewPrivateLearnerAdaptation(userId, privateStudentId)`

Recommendation:

- extend the current private learner permission pattern instead of adding a separate review/admin system

---

## Data Model

Phase 10 should extend the current private learner workflow rather than creating a parallel review subsystem.

## Group 1: Review snapshots

### Table: `private_student_reviews`

Recommended fields:

- `id UUID PRIMARY KEY`
- `private_student_id UUID NOT NULL REFERENCES private_students(id) ON DELETE CASCADE`
- `teacher_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE`
- `reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `summary TEXT NOT NULL`
- `what_improved TEXT`
- `what_needs_change TEXT`
- `adaptation_note TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Purpose:

- capture a compact teacher review of the learner’s current state

Recommendation:

- keep it short and teacher-facing
- do not expose a long learner-facing review feed in V1

## Group 2: Adaptation freshness on private learners

### Table: `private_students`

Recommended additive fields:

- `last_reviewed_at TIMESTAMPTZ`
- `last_adapted_at TIMESTAMPTZ`

Purpose:

- allow fast reporting on whether the tutoring plan has been revisited recently

Recommendation:

- derive most detail from review rows
- store only the latest review/adaptation markers on the lifecycle record for speed and clarity

## Group 3: Adaptation targets

Phase 10 should update existing workflow records rather than duplicating them.

Likely targets:

- `private_student_goals`
- `private_lesson_plans`

Possible V1 adaptation behaviors:

- update goal `progress_status`
- add or revise goal notes
- update next lesson focus
- update linked assignment/template
- update before-lesson expectation

Recommendation:

- do not create a separate “adapted plan” table in V1
- use the review workflow to write into the live goal/plan records

---

## Screen Map

### 1. `Teaching > Private Learners`

Purpose:

- show which private learners need review/adaptation

Additions:

- `Needs review` / `Plan stale` cues
- latest review/adaptation date
- direct CTA into learner review

### 2. `Teaching > Private Learners > [Learner]`

Purpose:

- primary Phase 10 workflow

Additions:

- `Review snapshot` form
- recent review history list
- quick adaptation controls
- visible “last adapted” context

### 3. Private classroom tutoring card

Purpose:

- show the learner-facing current tutoring direction

Additions:

- adaptation freshness summary
- latest adapted focus summary

Keep this lightweight. The classroom should not become the main teacher review surface.

### 4. `Teaching > Reporting`

Purpose:

- show adaptation freshness and stale-plan pressure

Additions:

- `Needs review`
- `Needs adaptation`
- `Reviewed recently`
- per-learner adaptation health rows

---

## Flow Specs

## Flow 1: Teacher reviews a private learner

Starting point:

- `Teaching > Private Learners`
- or a private learner detail page

Teacher action:

- opens learner detail
- writes a short review snapshot
- notes what improved
- notes what should change

Expected result:

- a review record is saved
- `last_reviewed_at` is updated
- teacher can immediately move into adaptation controls

## Flow 2: Teacher adapts the live plan

Starting point:

- just after review
- or from learner detail when a review already exists

Teacher action:

- updates goal progress
- revises next lesson focus
- optionally changes linked assignment/template
- adds a short adaptation note

Expected result:

- live goal/plan records are updated
- `last_adapted_at` is updated
- private classroom summary reflects the new plan

## Flow 3: Reporting identifies stale plans

Starting point:

- `Teaching > Reporting`

Derived signals:

- intervention pressure exists but no recent review
- review exists but no recent adaptation
- plan exists but next lesson focus is stale

Expected result:

- teacher can open the relevant private learner and act immediately

---

## Action And Helper Direction

Likely new module:

- `src/lib/private-student-reviews.ts`

Likely responsibilities:

- create review snapshot
- list learner reviews
- get latest learner review
- derive adaptation freshness helpers

Likely action additions:

- `createPrivateStudentReviewAction`
- `updatePrivateLessonPlanFromReviewAction`
- or a single `adaptPrivateLearnerPlanAction` if a bundled workflow feels cleaner

Recommendation:

- keep review creation and plan adaptation logically separate in the helper layer
- the UI can still present them together

---

## Milestone Order

### Milestone 1: Private learner review snapshots

Build:

- `private_student_reviews`
- helper module
- review form on private learner detail
- latest review summary on learner detail/list

### Milestone 2: Plan adaptation workflow

Build:

- write review-driven updates into goals and next lesson plan
- update `last_adapted_at`
- show adapted plan state in private classroom and learner detail

### Milestone 3: Adaptation reporting

Build:

- stale review/adaptation reporting
- `needs review` and `needs adaptation` reporting groupings
- reporting links back into private learner workflow

---

## Suggested Milestone 1 Build Order

1. add `private_student_reviews` to `src/lib/db.ts`
2. add `src/lib/private-student-reviews.ts`
3. add actions in `src/lib/actions.ts`
4. add review UI to private learner detail
5. show latest review summary in private learner list and reporting

---

## Risks

### Risk 1: Review becomes duplicative

If the review flow repeats the same information already present in goals/history, it will feel like busywork.

Mitigation:

- keep review snapshots short
- use them to summarize and adapt, not to restate everything

### Risk 2: Adaptation workflow becomes too heavy

If teachers must update many separate forms, they will skip it.

Mitigation:

- keep V1 to a few high-value fields
- favor quick carry-forward controls

### Risk 3: Reporting becomes noisy

If stale-plan signals are too sensitive, teachers will ignore them.

Mitigation:

- keep thresholds simple
- start with only a few adaptation health indicators

---

## Definition Of Ready

Phase 10 is ready to build when:

- we agree that review snapshots are short and teacher-facing
- we agree that adaptation writes into existing goals/plans instead of a separate plan table
- we agree on the first stale-plan reporting thresholds

That is enough to start Milestone 1.
