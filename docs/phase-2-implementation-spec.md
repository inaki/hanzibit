# Phase 2 Implementation Spec

## Purpose

This document turns Phase 2 into an implementation-ready specification.

It should answer:

- what we are building
- what data model we need
- what permissions apply
- which screens and flows are required
- what order we should implement in

This doc is the bridge between planning and code.

Current implementation status as of April 13, 2026:

- Milestone 1 is shipped
- Milestone 2 is shipped
- Milestone 3 is shipped
- Milestone 4 is shipped
- Milestone 5 is shipped
- a meaningful Milestone 6 polish pass is shipped on web

Phase 2 is no longer just a spec. The web MVP now supports the full teacher/student homework loop.

It complements:

- `docs/phase-2-classroom-planning.md`
- `docs/product-evolution-strategy.md`
- `docs/implementation-roadmap.md`

---

## Phase 2 Objective

Phase 2 adds a classroom collaboration layer on top of the existing solo learner app.

The MVP goal is:

- teacher creates classroom
- student joins classroom
- teacher assigns work
- student completes work using the existing notebook or Study Guide
- teacher reviews the submission and leaves feedback

The notebook remains the source of truth for personal study.

---

## Core Product Rules

These rules should guide implementation decisions.

### 1. Personal notebook first

Students still own their notebook entries.

Assignments may link to notebook work, but they do not replace notebook ownership.

### 2. Classroom work extends Phase 1 flows

Do not build separate “classroom versions” of journal writing or Study Guide if the Phase 1 flow can be reused.

### 3. Submission is classroom context, not notebook ownership

Teacher feedback belongs to assignment submissions, not directly to the journal entry model.

### 4. One product, role-aware views

Do not split HanziBit into separate apps for students and teachers.

---

## MVP Scope

### Included

- teacher role support
- classroom create
- classroom join by code
- student roster
- assignments
- submissions
- teacher feedback
- student assignment list
- assignment launch into notebook or Study Guide
- submission detail page
- teacher review queue
- classroom activity visibility
- reviewed status

### Excluded

- marketplace
- teacher referral program
- reusable assignment templates
- messaging/chat
- organization/school admin
- advanced analytics
- payments to teachers

### Current shipped MVP

The current web implementation already supports:

1. teacher creates classroom
2. student joins classroom
3. teacher creates assignment
4. student launches assignment into notebook or Study Guide
5. student saves journal work and submission record is linked automatically
6. teacher reviews submission
7. teacher leaves feedback
8. teacher marks reviewed
9. student sees feedback and reviewed state

---

## MVP Roles And Permissions

We should treat roles as capability-based, not purely label-based.

### Solo learner

Can:

- use all Phase 1 learner flows

Cannot:

- create classrooms
- create assignments
- review submissions

### Student

Can:

- join classrooms
- view their classrooms
- view assignments assigned through classroom membership
- submit work
- view teacher feedback on their submissions

Cannot:

- create classrooms
- create assignments
- view other students’ submissions
- review submissions

### Teacher

Can:

- create classroom
- edit classroom they own
- view roster
- create/edit assignments in classrooms they own
- review student submissions in classrooms they own
- leave feedback

Cannot:

- modify another teacher’s classroom
- view private student data outside assignment/classroom scope

---

## Permissions Model

Suggested helper checks:

- `isTeacherUser(userId)`
- `canManageClassroom(userId, classroomId)`
- `canViewClassroom(userId, classroomId)`
- `canViewAssignment(userId, assignmentId)`
- `canSubmitAssignment(userId, assignmentId)`
- `canReviewSubmission(userId, submissionId)`

Recommended rules:

### Classroom visibility

- teacher who owns classroom: yes
- student who is a member: yes
- everyone else: no

### Assignment visibility

- classroom teacher: yes
- classroom students: yes
- everyone else: no

### Submission visibility

- submitting student: yes
- classroom teacher: yes
- other students: no

### Feedback creation

- teacher in classroom only

Current status:

These checks are now implemented in code:

- `isTeacherUser(userId)`
- `canManageClassroom(userId, classroomId)`
- `canViewClassroom(userId, classroomId)`
- `canViewAssignment(userId, assignmentId)`
- `canSubmitAssignment(userId, assignmentId)`
- `canReviewSubmission(userId, submissionId)`
- `canViewSubmission(userId, submissionId)`

---

## Data Model

The current schema is learner-first. Phase 2 should add collaboration tables instead of mutating learner tables into classroom ownership models.

### Table: `classrooms`

Purpose:

- teacher-owned class container

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL`
- `name TEXT NOT NULL`
- `description TEXT`
- `join_code TEXT NOT NULL UNIQUE`
- `archived INTEGER NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Indexes:

- `(teacher_user_id)`
- `(join_code)`

### Table: `classroom_members`

Purpose:

- classroom membership

Fields:

- `id TEXT PRIMARY KEY`
- `classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE`
- `user_id TEXT NOT NULL`
- `role TEXT NOT NULL CHECK(role IN ('teacher', 'student'))`
- `joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints:

- unique `(classroom_id, user_id)`

Indexes:

- `(user_id)`
- `(classroom_id)`

Note:

- for MVP, teacher can also be inserted as a classroom member with role `teacher`
- that keeps membership lookups consistent

### Table: `assignments`

Purpose:

- teacher-created work item

Fields:

- `id TEXT PRIMARY KEY`
- `classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE`
- `created_by_user_id TEXT NOT NULL`
- `type TEXT NOT NULL CHECK(type IN ('journal_prompt', 'study_guide_word', 'study_guide_level', 'reading_response'))`
- `title TEXT NOT NULL`
- `description TEXT`
- `prompt TEXT`
- `hsk_level INTEGER`
- `source_ref TEXT`
- `allow_resubmission INTEGER NOT NULL DEFAULT 1`
- `due_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Indexes:

- `(classroom_id, created_at DESC)`
- `(classroom_id, due_at)`

### Table: `assignment_submissions`

Purpose:

- student submission state for an assignment

Fields:

- `id TEXT PRIMARY KEY`
- `assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE`
- `student_user_id TEXT NOT NULL`
- `journal_entry_id TEXT REFERENCES journal_entries(id) ON DELETE SET NULL`
- `status TEXT NOT NULL CHECK(status IN ('not_started', 'draft', 'submitted', 'reviewed'))`
- `submitted_at TIMESTAMPTZ`
- `reviewed_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints:

- unique `(assignment_id, student_user_id)`

Indexes:

- `(student_user_id, status)`
- `(assignment_id, status)`

### Table: `submission_feedback`

Purpose:

- teacher feedback attached to a submission

Fields:

- `id TEXT PRIMARY KEY`
- `submission_id TEXT NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE`
- `teacher_user_id TEXT NOT NULL`
- `content TEXT NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Indexes:

- `(submission_id, created_at DESC)`

---

## Type Model

These TypeScript models should likely exist in a new Phase 2 module, not be mixed into current Phase 1 models blindly.

Suggested new interfaces:

- `Classroom`
- `ClassroomMember`
- `Assignment`
- `AssignmentSubmission`
- `SubmissionFeedback`
- `StudentAssignmentSummary`
- `TeacherAssignmentSummary`

Likely file targets:

- `src/lib/classrooms.ts`
- `src/lib/assignments.ts`
- `src/lib/submissions.ts`

Current status:

These modules now exist and are active:

- `src/lib/classrooms.ts`
- `src/lib/assignments.ts`
- `src/lib/submissions.ts`
- `src/lib/classroom-permissions.ts`

---

## Assignment Semantics

### `journal_prompt`

Launches:

- notebook guided draft

Uses:

- `prompt`
- optional `hsk_level`

Current status:

- shipped
- student launch path into guided notebook flow is working

### `study_guide_word`

Launches:

- Study Guide detail for one word
- optional guided response from that word

Uses:

- `source_ref` = `hsk_words.id`
- optional `prompt`

Current status:

- shipped in first pass
- assignment context is preserved when moving into Study Guide and then into the notebook flow

### `study_guide_level`

Launches:

- Study Guide at one HSK level

Uses:

- `hsk_level`
- optional `prompt`

### `reading_response`

MVP behavior:

- can still reuse guided journal flow
- treated like journal prompt with stronger prompt/source context

Uses:

- `prompt`
- optional `hsk_level`
- optional `source_ref`

---

## Screen Map

Phase 2 should add a few targeted screens.

### Shared

#### `/notebook/classes`

Purpose:

- list classrooms relevant to current user

Teacher view:

- owned classrooms
- create classroom CTA

Student view:

- enrolled classrooms
- join classroom CTA

#### `/notebook/classes/[classroomId]`

Purpose:

- classroom detail

Teacher view:

- roster
- active assignments
- create assignment CTA

Student view:

- classroom assignments
- feedback summary if useful later

#### `/notebook/assignments`

Purpose:

- assignment inbox

Student view:

- assigned work, due dates, status

Teacher view:

- assignments they created
- quick links to review

#### `/notebook/assignments/[assignmentId]`

Purpose:

- assignment detail

Student view:

- assignment instructions
- launch CTA into notebook or Study Guide
- submission status
- teacher feedback

Teacher view:

- assignment metadata
- class completion snapshot
- links to student submissions

### Teacher-specific

#### `/notebook/classes/new`

- create classroom form

#### `/notebook/classes/[classroomId]/assignments/new`

- assignment creation form

#### `/notebook/submissions/[submissionId]`

- teacher review view
- student feedback view

---

## Launch Behavior Into Phase 1 Flows

This is where Phase 2 should stay disciplined.

### Assignment → Journal

The system should build a guided draft payload similar to current Phase 1 draft query params, but with assignment context.

Recommended query additions:

- `draftAssignmentId`
- `draftClassroomId`

Current Phase 1 fields can still be reused:

- `draftTitleZh`
- `draftTitleEn`
- `draftUnit`
- `draftLevel`
- `draftContentZh`
- `draftSelectedText`
- `draftPrompt`
- `draftSourceZh`
- `draftSourceEn`
- `draftTargetWord`
- `draftTargetPinyin`
- `draftTargetEnglish`
- `draftSourceType`
- `draftSourceRef`

### Assignment → Study Guide

For `study_guide_word`:

- open `/notebook/lessons?wordId=<id>`

For `study_guide_level`:

- open `/notebook/lessons?level=<level>`

### Submission creation rule

Recommended MVP rule:

- creating the journal entry does **not automatically complete** the assignment unless the student launches from assignment context
- when launched from assignment context, the entry can be linked to an `assignment_submission`

---

## Submission Lifecycle

Recommended MVP lifecycle:

1. assignment exists
2. student opens assignment
3. student launches into notebook/study flow
4. student creates linked journal entry
5. submission status becomes `submitted`
6. teacher reviews
7. teacher leaves feedback
8. submission status becomes `reviewed`

Optional later:

- `draft` state if we want save-before-submit behavior

For MVP, we can simplify:

- create submission on first linked entry
- mark immediately `submitted`

---

## Teacher Feedback Model

Feedback should be attached to `submission_feedback`, not merged into `journal_entries`.

Reason:

- journal entry remains the learner’s personal object
- multiple pieces of feedback can exist over time
- feedback stays contextual to assignment workflow

Recommended MVP behavior:

- one feedback thread per submission
- teacher adds plain text feedback
- most recent feedback displayed first

---

## API / Action Direction

Phase 2 can start with server actions for web, but should avoid creating a classroom system that is impossible to expose via mobile later.

Recommended split:

### First pass

- server actions for web UI speed

### In parallel or soon after

- add mobile-compatible API routes for:
  - classroom list
  - classroom join
  - assignments list/detail
  - submissions
  - feedback

Suggested future endpoints:

- `GET /api/mobile/classes`
- `POST /api/mobile/classes/join`
- `GET /api/mobile/assignments`
- `GET /api/mobile/assignments/:id`
- `POST /api/mobile/assignments/:id/submit`
- `GET /api/mobile/submissions/:id`
- `POST /api/mobile/submissions/:id/feedback`

---

## Implementation Milestones

### Milestone 1: Schema and permission helpers

Deliverables:

- DB schema additions
- Type models
- permission helpers
- data access helpers

Files likely touched:

- `src/lib/db.ts`
- `src/lib/data.ts`
- new:
  - `src/lib/classrooms.ts`
  - `src/lib/assignments.ts`
  - `src/lib/submissions.ts`

Exit criteria:

- classrooms and assignments can exist in DB
- permission checks are explicit

### Milestone 2: Classroom membership flows

Deliverables:

- teacher create classroom
- student join by code
- classes list
- classroom detail
- roster

Exit criteria:

- teacher can create a classroom
- student can join it
- both can view classroom page with correct permissions

### Milestone 3: Assignment creation and student inbox

Deliverables:

- assignment creation UI
- assignment list for teacher
- assignment inbox for student
- assignment detail page

Exit criteria:

- teacher can create an assignment
- student can see it

### Milestone 4: Submission linking into notebook/study flows

Deliverables:

- assignment launch into guided journal flow
- assignment launch into Study Guide
- submission record creation
- linked journal entry handling

Exit criteria:

- student can complete and submit work through existing learning surfaces

### Milestone 5: Teacher review and feedback

Deliverables:

- teacher review screen
- feedback creation
- reviewed status
- student feedback visibility

Exit criteria:

- teacher can review a student submission and leave feedback

### Milestone 6: Lightweight classroom progress

Deliverables:

- assignment counts
- submitted / reviewed / pending summary
- overdue visibility

Exit criteria:

- teacher can understand classroom progress without external tracking

---

## Recommended Code Order

If we start implementation immediately, the best order is:

1. schema + helpers
2. classroom create/join/list/detail
3. assignment create/list/detail
4. submission linkage into notebook/study flows
5. feedback
6. progress summaries

---

## Main Risks

### Risk 1: Overloading notebook tables

Avoid adding many assignment-specific flags to `journal_entries`.

Recommended response:

- keep assignment context in submission tables

### Risk 2: Teacher workflow drift from learner workflow

If assignments create separate writing/study systems, the product will fragment.

Recommended response:

- route assignments back into existing guided flows whenever possible

### Risk 3: Permissions getting implicit

Classroom products become dangerous quickly if ownership/membership checks are scattered.

Recommended response:

- centralize permission helpers early

### Risk 4: Trying to solve reusable content too early

That belongs in Phase 3.

Recommended response:

- keep assignment creation simple in Phase 2

---

## Definition Of Ready

Phase 2 is ready to implement once:

- schema proposal is accepted
- permissions model is accepted
- screen map is accepted
- milestone order is accepted

This document is intended to satisfy that condition.
