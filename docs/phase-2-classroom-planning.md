# Phase 2 Classroom Planning

## Purpose

This document turns the high-level Phase 2 strategy into a concrete planning baseline.

Phase 2 is the point where HanziBit expands from a solo learner system into a teacher-and-student collaboration product.

The key constraint remains:

**The learner notebook stays primary. Classroom workflows extend it.**

Current implementation status as of April 13, 2026:

- classrooms are implemented
- classroom join by code is implemented
- assignments are implemented
- assignment submissions are implemented
- teacher feedback is implemented
- reviewed status is implemented
- teacher classroom visibility and inbox-style assignment status are implemented

The remaining work is now mostly workflow polish, richer teacher tooling, and later mobile parity for Phase 2.

---

## Phase 2 Goal

Add a lightweight classroom layer that lets teachers guide students inside the same product they already use for self-study.

This phase should solve:

- teacher can create a class
- student can join a class
- teacher can assign work
- student can complete work inside the notebook/study flow
- teacher can review submissions and leave feedback

It should not try to solve:

- tutor marketplace
- scheduling
- payments to teachers
- live chat
- full school administration
- advanced reusable curriculum systems

Those belong later.

---

## Product Principle

Phase 2 should feel like:

- the learner keeps a personal notebook
- a classroom adds structure, assignments, and feedback
- class work flows into the learner’s existing study surfaces when possible

Avoid:

- separate learner and teacher products
- duplicate content systems
- class-specific notebook models that replace personal ownership

---

## User Roles

Phase 2 needs three practical product roles.

### 1. Solo Learner

No classroom membership.

Uses Phase 1 as-is.

### 2. Student

Learner who joins one or more classrooms.

New capabilities:

- view assigned work
- complete journal/study tasks
- submit work
- view teacher feedback

### 3. Teacher

Creates and manages classrooms.

New capabilities:

- create classroom
- invite students
- create assignments
- review submissions
- leave feedback
- view classroom progress at a lightweight level

---

## Phase 2 MVP Scope

The MVP should stay narrow.

### In scope

- teacher role
- classroom create
- classroom join via code or link
- roster view
- assignment creation
- assignment types:
  - journal prompt
  - study-guide word or HSK-level study task
  - vocabulary set or short reading task
- submission status
- teacher written feedback
- student assignment list
- classroom-aware links into notebook/study flows
- teacher review queue
- classroom activity summary
- student submission detail with feedback

### Out of scope

- teacher referral program
- tutor discovery
- Stripe Connect
- in-app messaging
- live collaboration
- gradebook complexity
- attendance
- organization/school admin tools
- reusable assignment template library

### Current MVP assessment

This MVP is now functionally in place on web.

The shipped web classroom loop supports:

- teacher creates a classroom
- student joins with a code
- teacher creates an assignment
- student opens the assignment in notebook or Study Guide
- student submission is linked automatically when the journal entry is saved
- teacher opens the submission, leaves feedback, and marks it reviewed
- student sees feedback and reviewed status
- teacher sees classroom-level counts for submitted, reviewed, and missing work

---

## Best First Teacher Use Cases

These should drive the MVP.

### Use Case 1: Guided journal homework

Teacher assigns:

- prompt
- target HSK level
- optional target words

Student completes it in the journal flow.

Teacher reviews the result and leaves feedback.

### Use Case 2: Study then respond

Teacher assigns:

- a study-guide word or level
- a short reading task
- a journal response requirement

Student studies in the Study Guide, then writes a guided response.

### Use Case 3: Vocabulary review prep

Teacher shares:

- a focused word set
- a study or review objective

Student completes the work inside existing study/review surfaces.

---

## Product Surfaces To Add

Phase 2 should introduce a few new surfaces, not a second app.

### Shared surfaces

- classroom selector or membership entry point
- assignment detail page
- submission detail page

### Teacher surfaces

- teacher dashboard
- classrooms list
- classroom detail
- assignment creation/edit
- submissions/review view

Current status:

- classrooms list: shipped
- classroom detail: shipped
- assignment creation: shipped
- submissions/review view: shipped in a first useful form
- teacher dashboard: still implicit through class detail and assignment inbox, not a separate dedicated page

### Student surfaces

- student assignments list
- classroom detail
- assignment status
- feedback view

Current status:

- student assignments list: shipped
- classroom detail: shipped
- assignment status: shipped
- feedback view: shipped through submission detail

---

## UX Model

Do not fork the entire nav into a second product unless necessary.

Best Phase 2 direction:

- keep current learner nav
- add role-aware teacher/classroom entry points

Suggested nav additions:

- `Classes`
- `Assignments`

For teachers:

- `Classes`
- `Assignments`
- `Students` or roster inside classroom

For students:

- `Assignments`
- classroom links inside assignment pages

---

## Data Model Direction

Phase 2 should add collaboration tables instead of overloading learner tables with classroom-specific flags.

Suggested MVP schema:

- `classrooms`
  - `id`
  - `teacher_user_id`
  - `name`
  - `description`
  - `join_code`
  - `created_at`

- `classroom_members`
  - `id`
  - `classroom_id`
  - `user_id`
  - `role` (`teacher`, `student`)
  - `joined_at`

- `assignments`
  - `id`
  - `classroom_id`
  - `created_by_user_id`
  - `type`
  - `title`
  - `description`
  - `prompt`
  - `hsk_level`
  - `source_ref`
  - `due_at`
  - `created_at`

- `assignment_submissions`
  - `id`
  - `assignment_id`
  - `student_user_id`
  - `journal_entry_id` nullable
  - `submitted_at`
  - `status`

- `submission_feedback`
  - `id`

Current status:

These collaboration tables now exist in the application schema and are actively used by the web classroom flows:

- `user_roles`
- `classrooms`
- `classroom_members`
- `assignments`
- `assignment_submissions`
- `submission_feedback`
  - `submission_id`
  - `teacher_user_id`
  - `content`
  - `created_at`

Possible later table:

- `assignment_resources`
  - if assignments need multiple attached items

---

## Assignment Type Model

Keep types simple at first.

Suggested enum:

- `journal_prompt`
- `study_guide_word`
- `study_guide_level`
- `reading_response`

These can all map back into existing Phase 1 flows.

Examples:

- `journal_prompt`
  - freeform writing task

- `study_guide_word`
  - specific study word id in `source_ref`

- `study_guide_level`
  - HSK level target plus prompt

- `reading_response`
  - prompt plus source passage metadata

---

## How Phase 2 Should Reuse Phase 1

This is the main planning rule.

### Reuse the journal flow

Assignments that require writing should resolve into:

- guided draft launch
- journal entry creation
- submission linked to entry

### Reuse the Study Guide flow

Assignments that require study should resolve into:

- Study Guide detail or level
- same guided response path already used in Phase 1

### Reuse the dashboard concepts carefully

Do not replace the personal Today loop immediately.

Instead:

- allow classroom assignments to appear alongside or adjacent to personal work
- keep personal practice and assigned work distinct

---

## Main Product Decisions To Lock Early

These should be decided before implementation starts.

### 1. Can one student join multiple classrooms?

Recommended: **yes**

Reason:

- avoids a future rewrite
- keeps the model realistic

### 2. Does an assignment require a journal entry, or can it be “soft completed”?

Recommended:

- journal and reading-response assignments require a linked submission
- pure study tasks may support lighter completion later

For MVP, bias toward explicit submissions.

### 3. Is teacher feedback attached to the journal entry or to the submission?

Recommended: **submission**

Reason:

- preserves the learner’s notebook as personal content
- lets classroom feedback stay contextual to the assignment

### 4. Can students edit work after submission?

Recommended for MVP:

- yes until teacher marks reviewed, or
- no after submission, but allow resubmit

This needs one product decision before implementation.

### 5. Do assignments appear inside Today?

Recommended for MVP:

- not as a replacement
- maybe as a secondary card like `Class work due`

Keep the personal learner loop intact.

---

## Suggested Implementation Order

### Phase 2.1: Roles and classrooms

- add teacher role support
- add classroom schema
- add create/join classroom flows
- add classroom roster

### Phase 2.2: Assignment model

- add assignment schema
- add basic assignment creation UI
- add student assignment list

### Phase 2.3: Submission flow

- link assignments to journal/study flows
- create submission records
- show status to student

### Phase 2.4: Teacher feedback

- review submissions
- write feedback
- surface feedback to students

### Phase 2.5: Classroom progress summary

- lightweight per-assignment completion counts
- overdue/pending status

---

## Repo Touchpoints

Likely implementation areas:

- `src/lib/db.ts`
- `src/lib/data.ts`
- `src/lib/actions.ts`
- `src/app/notebook/**`
- `src/app/api/mobile/**`
- new teacher/classroom UI under:
  - `src/app/notebook/classes/**`
  - `src/app/notebook/assignments/**`

Potential new helpers:

- `src/lib/classrooms.ts`
- `src/lib/assignments.ts`
- `src/lib/submissions.ts`

---

## Phase 2 Success Criteria

Phase 2 is successful when:

- a teacher can run a small class inside HanziBit without external homework tracking
- a student can receive, complete, and review assigned work inside the same product they use for self-study
- classroom work extends the notebook and Study Guide instead of fragmenting them
- the data model is clean enough to support Phase 3 reusable teacher content later

---

## Recommended Next Planning Step

Before coding Phase 2, the next concrete planning artifact should be:

1. schema proposal
2. role/permissions model
3. MVP screen map
4. implementation backlog by milestone

That should become the Phase 2 execution doc.
