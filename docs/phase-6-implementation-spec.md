# Phase 6 Implementation Spec

## Purpose

This document turns Phase 6 into an implementation-ready specification.

It should answer:

- what Phase 6 builds first
- what schema changes are needed
- what permissions apply
- which screens and flows are required
- what order we should implement in

This doc is the bridge between the Phase 6 plan and actual code.

Current implementation status as of April 14, 2026:

- Phase 6 planning baseline is defined
- Milestones 1 through 3 are implemented on web
- the web app already has:
  - private classroom conversion
  - tutoring setup defaults
  - learner onboarding and next steps
  - converted learner reporting
  - `Teaching > Private Learners` list/detail workflow
  - lifecycle update and next-step controls for private learners
  - private learner reporting state groupings and stalled-activity signals
  - learner-facing and classroom-level private tutoring status cues

It complements:

- `docs/phase-6-planning.md`
- `docs/phase-5-implementation-spec.md`
- `docs/product-evolution-strategy.md`
- `docs/implementation-roadmap.md`

---

## Phase 6 Objective

Phase 6 should make ongoing private tutoring relationships easier to manage after onboarding.

The first practical goal is:

- a learner is converted into a private classroom
- onboarding exists and the learner starts working
- the teacher can see the learner’s current private status
- the teacher can set the next step for that learner
- reporting can distinguish active, stalled, and waiting relationships

Phase 6 should build on:

- classrooms
- assignments
- submissions
- tutoring setup
- inquiry conversion
- teacher reporting

---

## Phase 6 Structure

Phase 6 should be implemented in three internal tracks:

1. **Phase 6A: private learner lifecycle**
2. **Phase 6B: next-step and follow-up workflow**
3. **Phase 6C: private tutoring activity reporting**

Recommended order:

1. lifecycle state
2. next-step workflow
3. reporting

---

## Core Product Rules

### 1. The classroom remains the working surface

Private tutoring should still happen through:

- classroom membership
- assignments
- notebook work
- review and feedback

Phase 6 should not create a separate tutoring engine.

### 2. The lifecycle model should stay lightweight

This should not become a complex CRM or pipeline system.

The lifecycle should simply help teachers understand what is happening now.

### 3. Every private learner should have a visible next step

At any moment, the teacher should be able to tell:

- what the learner is waiting on
- what the teacher is waiting on
- whether a new assignment or revision is needed
- whether the learner is inactive

### 4. Reporting should drive action

Phase 6 reporting should help the teacher decide:

- who needs follow-up
- who needs a new assignment
- who is awaiting review
- who has gone inactive

---

## Scope

### Included

- private learner lifecycle status
- teacher-managed private learner next step
- lightweight follow-up note or status
- private learner summary cards
- reporting for active / awaiting / inactive private learners
- private classroom and reporting integration

### Excluded

- scheduling
- calendar sync
- live lessons
- in-app chat
- public ratings
- tutoring payment operations

---

## Roles And Permissions

### Teacher can

- manage lifecycle state for their own private learners
- set a next-step status for their own private learners
- view private learner operational reporting for their own classrooms

### Teacher cannot

- manage another teacher’s private learners
- view another teacher’s private tutoring operations

### Learner can

- view their own current next-step state
- see whether they are waiting on feedback or expected to complete the next assignment

### Learner cannot

- edit their own private learner lifecycle state
- edit teacher-managed follow-up state

### Recommended permission helpers

- `canManagePrivateLearnerState(userId, privateStudentId)`
- `canViewPrivateLearnerState(userId, privateStudentId)`
- `canManagePrivateClassroomWorkflow(userId, classroomId)`

---

## Data Model

Phase 6 should extend the current private tutoring flow instead of replacing it.

## Group 1: Private learner state

### Table: `private_students`

Purpose:

- teacher-owned operational record for learners who entered through private inquiry conversion

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL`
- `student_user_id TEXT NOT NULL`
- `classroom_id TEXT NOT NULL UNIQUE`
- `inquiry_id TEXT NOT NULL UNIQUE`
- `status TEXT NOT NULL`
- `next_step_type TEXT`
- `next_assignment_id TEXT`
- `follow_up_note TEXT`
- `last_teacher_action_at TIMESTAMPTZ`
- `last_student_activity_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Recommended enums:

- `status`
  - `onboarding`
  - `active`
  - `awaiting_teacher`
  - `awaiting_student`
  - `inactive`
- `next_step_type`
  - `complete_assignment`
  - `review_feedback`
  - `await_teacher_assignment`
  - `follow_up`
  - `none`

Recommended constraints:

- `classroom_id` should reference `classrooms(id)` and be unique
- `inquiry_id` should reference `teacher_inquiries(id)` and be unique
- `next_assignment_id` should reference `assignments(id)` and use `ON DELETE SET NULL`

## Group 2: Derived activity support

Phase 6 should prefer deriving activity from existing records when possible:

- `assignment_submissions`
- `reviewed_at`
- `submitted_at`
- `journal_entries`
- `teacher_inquiries.conversion_completed_at`

Only store lifecycle state that is operationally useful and not cleanly derivable.

Recommendation:

- persist the teacher-managed lifecycle state
- derive most activity signals from existing classroom/submission data

---

## Screen Map

## Teacher screens

### 1. Private Learner Overview

Purpose:

- give the teacher an operational list of private learners

Contents:

- learner name
- current private status
- next step
- last activity
- classroom link
- flags for inactive / waiting

Recommended location:

- `Teaching > Reporting`
- and optionally `Teaching > Overview`

### 2. Private Learner Detail

Purpose:

- let the teacher inspect one private learner’s current state and update it

Contents:

- classroom link
- current status
- next-step selector
- current assignment link
- latest submission/review activity
- follow-up note

Recommended location:

- `Teaching > Reporting > Private learner detail`

### 3. Private Classroom Workflow Card

Purpose:

- show the teacher the current operational state from inside the private classroom

Contents:

- lifecycle status
- next step
- quick action links
- follow-up note

Recommended location:

- classroom detail page for private tutoring classrooms

## Learner-facing screens

### 4. Learner Next-Step Card

Purpose:

- make the current private relationship state clearer for the learner

Contents:

- next step summary
- whether the learner is waiting on the teacher or has work to do
- direct assignment or classroom links

Recommended location:

- learner inquiry page
- private classroom detail

---

## Flow Specs

## Flow 1: Teacher sees private learner lifecycle

1. Teacher opens reporting
2. Teacher sees all converted private learners
3. Teacher can identify:
   - onboarding
   - active
   - awaiting teacher
   - awaiting student
   - inactive

## Flow 2: Teacher updates next step

1. Teacher opens a private learner detail or private classroom
2. Teacher selects a lifecycle status
3. Teacher optionally attaches a next assignment
4. Teacher optionally leaves a follow-up note
5. Learner-facing surfaces reflect that state

## Flow 3: Reporting reflects private learner momentum

1. Teacher opens reporting
2. Teacher sees private learners grouped by action need
3. Reporting surfaces inactive or stalled learners
4. Teacher can click directly into the relevant classroom or learner detail

---

## API / Action Direction

Phase 6 can continue the current pattern:

- server actions for internal web flows
- route handlers later if mobile needs stable contracts

Recommended helpers:

- `getPrivateStudentByClassroomId(...)`
- `listPrivateStudentsForTeacher(...)`
- `updatePrivateStudentState(...)`
- `derivePrivateStudentActivity(...)`
- `getPrivateStudentReporting(...)`

Recommended route additions later:

- `/api/mobile/private-students`
- `/api/mobile/private-students/:id`
- `/api/mobile/private-classrooms/:id/status`

These should not be the first implementation step.

---

## Milestone Order

## Milestone 1: Private learner lifecycle foundation

Build:

- `private_students` schema
- helper module
- lifecycle status helpers
- lifecycle record creation during inquiry conversion

Success criteria:

- every converted inquiry/private classroom can have a private learner record
- teacher lifecycle state is persisted cleanly

Current web status:

- implemented
- `private_students` lifecycle records are created during inquiry conversion
- default lifecycle state is now persisted for private tutoring relationships
- reporting includes a first private learner count sourced from the lifecycle layer

## Milestone 2: Teacher private learner workflow

Build:

- teacher private learner summary list
- teacher private learner detail
- state update action
- next-step and follow-up controls

Success criteria:

- teachers can manage ongoing private learner state without leaving HanziBit

Current web status:

- implemented
- `Teaching > Private Learners` now exists as a dedicated operational screen
- teachers can open a private learner detail page
- teachers can update lifecycle status, next step, linked assignment, and follow-up note
- private classroom pages now link directly into the workflow

## Milestone 3: Reporting integration

Build:

- reporting groupings by private learner state
- active / stalled / awaiting summaries
- direct links into classrooms and assignments

Success criteria:

- reporting clearly distinguishes onboarding from ongoing private tutoring operations

Current web status:

- implemented
- reporting now includes private learner state counts
- reporting now surfaces private learners awaiting teacher action, awaiting learner action, inactive learners, and stalled learners
- reporting links directly into the private learner workflow pages

## Polish / Closeout

Current web status:

- implemented
- private learner cards now include clearer teacher-facing workflow guidance
- private learner detail now includes a workflow guidance banner instead of only raw state fields
- learner inquiry cards now use clearer private tutoring next-step language
- private classroom detail now shows learner-facing private tutoring status with direct assignment access when appropriate

Phase 6 assessment:

- the main implementation loop is complete on web
- remaining work is optional polish, mobile catch-up later, and deciding what Phase 7 should be

---

## Risks And Product Decisions To Lock Early

### 1. Avoid over-modeling the lifecycle

The lifecycle should stay small and operational.

If too many statuses are added early, teachers will not keep them current.

Recommendation:

- start with 5 statuses max

### 2. Keep next-step workflow tied to assignments where possible

If next steps become too abstract, the workflow loses product coherence.

Recommendation:

- prefer linking next steps to actual assignments, submissions, and reviews

### 3. Derive activity when possible

Do not duplicate classroom activity state unless it adds clear operational value.

Recommendation:

- store teacher intent
- derive learner activity

---

## Definition Of Ready

Phase 6 is ready to start when:

- schema direction is agreed
- lifecycle statuses are agreed
- the first teacher surfaces are chosen
- we are willing to create a `private_students` record at inquiry conversion time

Recommended next step:

- start **Milestone 1**
