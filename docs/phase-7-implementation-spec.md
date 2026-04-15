# Phase 7 Implementation Spec

## Purpose

This document turns Phase 7 into an implementation-ready specification.

It should answer:

- what Phase 7 builds first
- what schema changes are needed
- what permissions apply
- which screens and flows are required
- what order we should implement in

This doc is the bridge between the Phase 7 plan and actual code.

Current implementation status as of April 14, 2026:

- Phase 7 planning baseline is defined
- Milestone 1 is implemented on web
- Milestone 2 is implemented on web
- Milestone 3 is implemented on web
- the web app already has:
  - private classroom conversion
  - tutoring setup defaults
  - learner onboarding and next steps
  - private learner lifecycle workflow
  - private learner reporting and stalled-state visibility
  - cadence defaults inside `Teaching > Setup`
  - next lesson/check-in planning inside `Teaching > Private Learners`
  - learner-facing next lesson summaries inside private classrooms
  - cadence-aware reporting for missing plans, overdue plans, and unsupported plans
  - cadence health cues in `Teaching > Overview` and `Teaching > Private Learners`

It complements:

- `docs/phase-7-planning.md`
- `docs/phase-6-implementation-spec.md`
- `docs/product-evolution-strategy.md`
- `docs/implementation-roadmap.md`

---

## Phase 7 Objective

Phase 7 should make ongoing private tutoring relationships easier to sustain over time with a lightweight lesson-planning and cadence layer.

The first practical goal is:

- a teacher already has a private learner relationship
- the teacher can define what the next lesson or check-in is
- the teacher can connect that plan to assignments or templates
- the teacher can see which private learners have a plan versus which are drifting
- the learner can understand what is expected before the next lesson

Phase 7 should build on:

- private classrooms
- assignments
- tutoring setup
- private learner workflow
- teacher reporting

---

## Phase 7 Structure

Phase 7 should be implemented in three internal tracks:

1. **Phase 7A: tutoring cadence defaults**
2. **Phase 7B: next lesson / check-in planning**
3. **Phase 7C: cadence reporting**

Recommended order:

1. teacher defaults
2. per-private-learner next lesson planning
3. cadence reporting and drift signals

Current status:

- all three planned Phase 7 milestones are implemented on web
- the remaining work is polish, business-rule refinement, and later mobile catch-up
- Phase 7 no longer needs foundational implementation work before the next planning phase

---

## Core Product Rules

### 1. Planning must stay tied to actual work

The value of Phase 7 is not storing lesson notes in isolation.

Plans should connect back to:

- assignments
- templates
- notebook work
- review and feedback

Phase 7 should not become a disconnected planner.

### 2. The first version should be intentionally lightweight

The teacher mostly needs:

- a next lesson/check-in label
- a target date or week
- a short focus note
- an optional linked assignment or template

The first version does not need:

- recurring event automation
- full weekly calendars
- student messaging

### 3. Every private learner should have visible momentum

At any moment, the teacher should be able to tell:

- whether the next lesson is planned
- when the next checkpoint is expected
- whether there is linked work before that checkpoint
- whether the learner is drifting without a plan

### 4. Reporting should still drive action

Phase 7 reporting should help answer:

- Who has no next lesson planned?
- Which private learners have overdue follow-up?
- Which plans have no linked assignment?
- Which learners are active but drifting without structure?

### 5. Keep planning inside the `Teaching` workspace

The teacher should not need a brand-new planning area.

Preferred placement:

- `Teaching > Setup`
- `Teaching > Private Learners`
- `Teaching > Reporting`

---

## Scope

### Included

- cadence defaults inside teacher setup
- per-private-learner next lesson/check-in record
- target date or target week
- short lesson focus note
- optional linked assignment
- optional linked template for the next lesson
- cadence reporting and “no next plan” / “overdue follow-up” signals

### Excluded

- real calendar sync
- public booking pages with time slots
- reminder delivery over email/SMS
- live lesson delivery
- teacher/learner chat
- private tutoring billing and payments

---

## Roles And Permissions

### Teacher can

- manage their own cadence defaults
- define the next planned lesson/check-in for their own private learners
- connect a plan to an assignment or template
- view cadence reporting for their own private learners

### Teacher cannot

- manage another teacher’s private lesson plans
- view another teacher’s cadence reporting

### Learner can

- view the current next lesson/check-in summary for their own private classroom
- see whether work is expected before the next lesson
- open the linked assignment if one exists

### Learner cannot

- edit cadence settings
- change next lesson planning state

### Recommended permission helpers

- `canManagePrivateLearnerPlan(userId, privateStudentId)`
- `canViewPrivateLearnerPlan(userId, privateStudentId)`
- `canManageTeacherTutoringSetup(userId, setupId)`

Recommendation:

- extend current private learner permission helpers before adding separate new policy layers unless that becomes too confusing

---

## Data Model

Phase 7 should extend the current private tutoring workflow instead of replacing it.

## Group 1: Teacher cadence defaults

Recommendation:

- extend `teacher_tutoring_settings`

Suggested additive fields:

- `cadence_type TEXT`
- `target_session_length_minutes INTEGER`
- `cadence_notes TEXT`

Suggested enum for `cadence_type`:

- `weekly`
- `twice_weekly`
- `flexible`
- `async_support`

Purpose:

- define the default rhythm a teacher wants for private learners

## Group 2: Per-private-learner lesson planning

### Table: `private_lesson_plans`

Purpose:

- store the teacher-managed next lesson/check-in plan for one private learner

Fields:

- `id TEXT PRIMARY KEY`
- `private_student_id TEXT NOT NULL UNIQUE`
- `teacher_user_id TEXT NOT NULL`
- `classroom_id TEXT NOT NULL`
- `next_assignment_id TEXT`
- `next_template_id TEXT`
- `plan_status TEXT NOT NULL`
- `target_date DATE`
- `focus_note TEXT`
- `before_lesson_expectation TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Recommended enum for `plan_status`:

- `planned`
- `awaiting_assignment`
- `awaiting_completion`
- `completed`
- `stale`

Recommended constraints:

- `private_student_id` should reference `private_students(id)` and be unique
- `classroom_id` should reference `classrooms(id)`
- `next_assignment_id` should reference `assignments(id)` and use `ON DELETE SET NULL`
- `next_template_id` should reference `assignment_templates(id)` and use `ON DELETE SET NULL`

Recommendation:

- one current plan per private learner is enough for V1
- do not build historical plan versioning yet

## Group 3: Derived cadence signals

Phase 7 should derive most operational reporting from:

- `private_lesson_plans.target_date`
- `private_lesson_plans.plan_status`
- `private_students.status`
- assignment and submission activity

Only persist the teacher-managed plan state that is not cleanly derivable.

Recommendation:

- persist the current plan
- derive “overdue”, “no linked assignment”, and “drifting” states from existing records plus the current plan

---

## Screen Map

## Teacher screens

### 1. Setup cadence defaults

Purpose:

- let teachers define their preferred private tutoring rhythm once

Contents:

- cadence type
- target session length
- cadence notes

Recommended location:

- `Teaching > Setup`

### 2. Private learner plan card

Purpose:

- show the next lesson/check-in directly inside the private learner workflow

Contents:

- current plan status
- target date
- lesson focus
- linked assignment/template

Recommended location:

- `Teaching > Private Learners > detail`
- optional small summary on the private classroom page

### 3. Private learner plan editor

Purpose:

- let the teacher create or update one next lesson/check-in plan

Contents:

- target date
- plan status
- focus note
- before-lesson expectation
- linked assignment
- linked template

Recommended location:

- inside the private learner detail page

### 4. Cadence reporting

Purpose:

- show which private learners have a next plan and which do not

Contents:

- no next plan
- overdue follow-up
- planned with linked work
- planned without linked work
- drifting active learners

Recommended location:

- `Teaching > Reporting`

## Learner-facing screens

### 5. Learner lesson/check-in summary

Purpose:

- make the next planned step visible to the learner

Contents:

- target date or upcoming check-in
- lesson focus
- expectation before the next lesson
- assignment link when present

Recommended location:

- private classroom detail
- learner inquiry / tutoring next-step card when relevant

---

## Flow Specs

## Flow 1: Teacher defines cadence defaults

1. Teacher opens `Teaching > Setup`
2. Teacher defines weekly/flexible rhythm defaults
3. Those defaults become the starting point for new private learner plans

## Flow 2: Teacher creates next lesson plan

1. Teacher opens a private learner detail page
2. Teacher sets:
   - target date
   - focus note
   - plan status
   - linked assignment or template
3. Private learner workflow now shows the plan
4. Learner-facing surfaces reflect the next step

## Flow 3: Reporting identifies drift

1. Teacher opens reporting
2. Reporting groups private learners by:
   - no next plan
   - overdue plan
   - plan exists but no work attached
   - healthy planned momentum
3. Teacher clicks directly into the private learner workflow

---

## API / Action Direction

Phase 7 can continue the current pattern:

- server actions for internal web workflows first
- route handlers later if mobile needs stable contracts

Recommended helpers:

- `ensurePrivateLessonPlan(...)`
- `getPrivateLessonPlan(privateStudentId)`
- `updatePrivateLessonPlan(...)`
- `derivePrivateLessonPlanSignals(...)`
- `getPrivateCadenceReporting(...)`

Recommended route additions later:

- `/api/mobile/private-students/:id/plan`
- `/api/mobile/private-cadence`

These should not be the first implementation step.

---

## Milestone Order

## Milestone 1: Cadence defaults foundation

Build:

- extend `teacher_tutoring_settings`
- cadence helper logic
- `Teaching > Setup` fields for cadence defaults

Success criteria:

- a teacher can define how private tutoring usually runs

Current web status:

- implemented
- `teacher_tutoring_settings` now stores cadence defaults
- `Teaching > Setup` now includes cadence type, target session length, and cadence notes
- the teacher overview now reflects cadence readiness

## Milestone 2: Private learner next lesson planning

Build:

- `private_lesson_plans` schema
- helper module
- plan card/editor in private learner detail
- learner-facing next plan summary

Success criteria:

- a teacher can define the next lesson/check-in for a private learner
- the learner can understand what is expected before that lesson

## Milestone 3: Cadence reporting

Build:

- reporting for no-plan / overdue-plan / drifting learners
- direct links into private learner workflow
- lightweight health signals for structured private tutoring

Success criteria:

- reporting can distinguish private learners with momentum from those who are drifting without a next plan

---

## Risks And Product Decisions To Lock Early

### 1. Avoid building scheduling by accident

If the model starts carrying:

- timeslots
- calendars
- confirmations
- reminder delivery

then the phase is expanding into a different product.

Recommendation:

- keep only one lightweight plan record per private learner
- allow date, note, and linked work, but not full booking logic

### 2. Avoid duplicating assignment state

Lesson planning should not become a second assignment system.

Recommendation:

- use linked assignments/templates whenever possible
- store only the planning state that is not already represented elsewhere

### 3. Keep learner-facing messaging simple

The learner should see:

- what is next
- when it matters
- what to open

They should not need to interpret teacher operations language.

### 4. Do not overfit the first cadence model

Different teachers will work differently.

Recommendation:

- keep cadence defaults broad
- allow flexible planning overrides per private learner

---

## Definition Of Ready

Phase 7 is ready to start when:

- cadence is clearly scoped as lightweight planning, not scheduling
- the additive schema direction is agreed
- the first teacher surfaces are chosen
- we are willing to put the first planning UI inside `Teaching > Setup` and `Teaching > Private Learners`

Recommended next step:

- start **Milestone 1**
