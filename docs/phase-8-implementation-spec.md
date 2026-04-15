# Phase 8 Implementation Spec

## Purpose

This document turns Phase 8 into an implementation-ready specification.

It should answer:

- what Phase 8 builds first
- what schema changes are needed
- what permissions apply
- which screens and flows are required
- what order we should implement in

This doc is the bridge between the Phase 8 plan and actual code.

Current implementation status as of April 14, 2026:

- Phase 8 planning baseline is defined
- Milestone 1 is implemented on web
- Milestone 2 is implemented on web
- Milestone 3 is implemented on web
- the web app already has:
  - private classroom conversion
  - tutoring setup defaults
  - learner onboarding and next steps
  - private learner lifecycle workflow
  - cadence defaults inside `Teaching > Setup`
  - next lesson/check-in planning inside `Teaching > Private Learners`
  - cadence-aware reporting for missing plans, overdue plans, and unsupported plans
  - private learner goals inside `Teaching > Private Learners`
  - current goal context in private classroom views
  - lightweight lesson/check-in history inside `Teaching > Private Learners`
  - latest lesson/check-in summaries in private classroom views
  - continuity reporting inside `Teaching > Reporting`
  - continuity signals for no active goals, no recent history, and weak continuity
  - continuity guidance inside `Teaching > Private Learners` and private classroom tutoring cards

It complements:

- `docs/phase-8-planning.md`
- `docs/phase-7-implementation-spec.md`
- `docs/product-evolution-strategy.md`
- `docs/implementation-roadmap.md`

---

## Phase 8 Objective

Phase 8 should make private tutoring relationships easier to sustain across multiple lessons by adding a lightweight continuity layer.

The practical goal is:

- a teacher already has an active private learner
- the teacher can define a small active goal set
- the teacher can leave behind a lightweight lesson/check-in outcome
- the teacher can see recent continuity, not only the next plan
- the learner can see current focus and recent direction without needing a separate messaging tool

Phase 8 should build on:

- private classrooms
- assignments
- tutoring setup
- private learner workflow
- next lesson planning
- teacher reporting

---

## Phase 8 Structure

Phase 8 should be implemented in three internal tracks:

1. **Phase 8A: private learner goals**
2. **Phase 8B: lightweight lesson history**
3. **Phase 8C: continuity reporting**

Recommended order:

1. private learner goals
2. lesson/check-in history
3. continuity reporting

---

## Core Product Rules

### 1. Goals should remain lightweight

The first version should not build a huge goal taxonomy.

The teacher mostly needs:

- a short title
- an optional detail note
- a status
- maybe a priority or active/completed state

### 2. Lesson history should be short and useful

The first version should not become a long-form notes system.

Each entry should capture only enough to preserve continuity:

- when the check-in happened
- what was covered
- what the learner should continue practicing
- optionally which assignment or plan it connected to

### 3. Continuity must stay connected to work

Goals and lesson history should tie back into:

- assignments
- notebook work
- private learner state
- next lesson planning

Phase 8 should not create a disconnected teacher-only notes silo.

### 4. Reporting should answer operational questions

Phase 8 reporting should help answer:

- Which private learners have no active goal?
- Which learners have no recent lesson history?
- Which learners keep repeating the same issue?
- Which learners have continuity context versus only future planning?

### 5. Keep it inside the `Teaching` workspace

Preferred placement:

- `Teaching > Private Learners`
- private learner detail
- private classroom private-tutoring card
- `Teaching > Reporting`

---

## Scope

### Included

- private learner active goals
- goal status and teacher-defined focus notes
- short lesson/check-in outcome records
- recent lesson history list on private learner detail
- learner-facing current goal / recent direction summary in private classrooms
- continuity reporting on active goals and recent lesson coverage

### Excluded

- full teacher journals
- public progress sharing
- formal grading/rubrics
- scheduling/calendar sync
- messaging/chat
- billing/payroll

---

## Roles And Permissions

### Teacher can

- create and update goals for their own private learners
- create lesson/check-in outcome records for their own private learners
- view continuity reporting for their own private learners

### Teacher cannot

- manage another teacher’s private learner goals or lesson history
- see another teacher’s continuity reporting

### Learner can

- view current goal context in their own private classroom
- view a lightweight recent-direction summary when appropriate

### Learner cannot

- edit teacher goals
- edit lesson/check-in outcome history

### Recommended permission helpers

- `canManagePrivateLearnerGoals(userId, privateStudentId)`
- `canManagePrivateLearnerHistory(userId, privateStudentId)`
- `canViewPrivateLearnerContinuity(userId, privateStudentId)`

Recommendation:

- extend existing private learner permission helpers unless they become too overloaded

---

## Data Model

Phase 8 should extend the existing private learner workflow instead of replacing it.

## Group 1: Private learner goals

### Table: `private_student_goals`

Purpose:

- store active and completed tutoring goals for one private learner

Fields:

- `id TEXT PRIMARY KEY`
- `private_student_id TEXT NOT NULL REFERENCES private_students(id) ON DELETE CASCADE`
- `teacher_user_id TEXT NOT NULL`
- `title TEXT NOT NULL`
- `detail TEXT`
- `status TEXT NOT NULL`
- `sort_order INTEGER NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `completed_at TIMESTAMPTZ`

Recommended enum for `status`:

- `active`
- `completed`
- `paused`

Recommended constraints:

- index on `(private_student_id, status, sort_order, updated_at DESC)`
- keep goals teacher-owned through `teacher_user_id`

Recommendation:

- support multiple goals
- but emphasize a small active set in the UI

## Group 2: Lesson/check-in history

### Table: `private_lesson_history`

Purpose:

- store short continuity notes after a lesson or check-in

Fields:

- `id TEXT PRIMARY KEY`
- `private_student_id TEXT NOT NULL REFERENCES private_students(id) ON DELETE CASCADE`
- `teacher_user_id TEXT NOT NULL`
- `classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE`
- `lesson_plan_id TEXT REFERENCES private_lesson_plans(id) ON DELETE SET NULL`
- `assignment_id TEXT REFERENCES assignments(id) ON DELETE SET NULL`
- `summary TEXT NOT NULL`
- `practice_focus TEXT`
- `recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Recommended constraints:

- index on `(private_student_id, recorded_at DESC)`
- optional index on `(teacher_user_id, recorded_at DESC)`

Recommendation:

- keep entries short and teacher-authored
- no editing history complexity in V1 beyond simple update/delete if needed later

## Group 3: Derived continuity signals

Phase 8 should derive most reporting from:

- active goals
- recent lesson history dates
- private learner status
- current lesson plan
- assignment/submission activity

Recommendation:

- persist goals and short history
- derive “missing recent continuity”, “no active goal”, and “recurring drift” from the combined state

---

## Screen Map

## Teacher screens

### 1. Private learner goals panel

Purpose:

- let teachers define current learning goals for a private learner

Recommended location:

- `Teaching > Private Learners > [privateStudentId]`

Contents:

- active goals list
- completed/paused goals list
- add goal form
- goal status update controls

### 2. Lesson history panel

Purpose:

- let teachers record a short outcome after a lesson or check-in

Recommended location:

- same private learner detail page

Contents:

- recent history entries
- add outcome form
- optional assignment link
- optional lesson-plan link

### 3. Continuity reporting section

Purpose:

- show which private learners have continuity context and which do not

Recommended location:

- `Teaching > Reporting`

Contents:

- no active goal
- no recent history
- stale continuity
- recent history present

## Learner screens

### 1. Private classroom continuity summary

Purpose:

- help the learner understand current teacher focus and recent direction

Recommended location:

- private classroom detail page

Contents:

- current active goal summary
- latest lesson/check-in summary
- current assignment link when available

Recommendation:

- keep the learner-facing version concise
- avoid exposing internal teacher workflow jargon

---

## Flow Specs

## Flow A: Teacher sets goals

1. teacher opens a private learner detail page
2. teacher adds one or more goals
3. goals are shown in active/completed groups
4. current classroom/private tutoring surfaces can use those goals as continuity context

Expected outcome:

- each private learner can have visible medium-term direction

## Flow B: Teacher records a lesson/check-in outcome

1. teacher completes or reviews a lesson/check-in
2. teacher records a short outcome note
3. teacher optionally links it to an assignment or current lesson plan
4. that outcome becomes the newest continuity record

Expected outcome:

- private tutoring relationships now preserve a lightweight teaching history

## Flow C: Reporting highlights weak continuity

1. teacher opens `Teaching > Reporting`
2. reporting shows which private learners:
   - have no active goal
   - have no recent lesson history
   - are drifting despite plans
3. teacher clicks through to the private learner detail to fix that

Expected outcome:

- continuity gaps become visible and actionable

---

## API / Action Direction

Web-first server actions are fine for V1.

Likely additions:

- `createPrivateStudentGoalAction(formData)`
- `updatePrivateStudentGoalAction(formData)`
- `createPrivateLessonHistoryAction(formData)`

Likely helper modules:

- `src/lib/private-student-goals.ts`
- `src/lib/private-lesson-history.ts`

Likely query additions:

- list goals for one private learner
- list recent lesson history for one private learner
- derive continuity stats for reporting

Revalidation targets will likely include:

- `/notebook/teacher/private-students`
- `/notebook/teacher/private-students/[privateStudentId]`
- `/notebook/classes/[classroomId]`
- `/notebook/teacher/reporting`

---

## Milestone Order

## Milestone 1: Private learner goals foundation

Build:

- `private_student_goals` schema
- helper module
- add/list/update goals on private learner detail
- lightweight current goal summary in classroom/private learner surfaces

Success criteria:

- teachers can define current goals for a private learner
- learner workflow surfaces can show that there is an active tutoring focus

## Milestone 2: Lesson/check-in history

Build:

- `private_lesson_history` schema
- helper module
- recent history list on private learner detail
- add short outcome entry flow
- latest history summary in private classroom view

Success criteria:

- teachers can leave a lightweight continuity trail after each lesson/check-in
- the product no longer loses all context between one planned lesson and the next

## Milestone 3: Continuity reporting

Build:

- active goal counts
- recent history coverage signals
- stale continuity indicators
- reporting UI updates

Success criteria:

- `Teaching > Reporting` can identify private learners who have cadence but weak continuity

---

## Risks

### 1. Building too much note-taking complexity

Mitigation:

- keep history short
- avoid rich text, attachments, and long-form journals in V1

### 2. Goal sprawl

Mitigation:

- emphasize a small active set
- separate active vs completed clearly

### 3. Duplicate meaning with next lesson plans

Mitigation:

- next lesson plan = future check-in
- lesson history = past check-in outcome
- goals = medium-term direction

### 4. Reporting gets noisy

Mitigation:

- only surface continuity signals that clearly imply action

---

## Ready To Implement When

Phase 8 can start when:

- we agree goals stay lightweight
- we agree lesson history stays short-form
- we agree reporting should focus on continuity gaps, not analytics breadth

At that point the best next move is:

1. add `private_student_goals`
2. wire goals into private learner detail
3. add `private_lesson_history`
4. then extend reporting
