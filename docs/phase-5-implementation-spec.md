# Phase 5 Implementation Spec

## Purpose

This document turns Phase 5 into an implementation-ready specification.

It should answer:

- what Phase 5 builds first
- what schema changes are needed
- what permissions apply
- which screens and flows are required
- what order we should implement in

This doc is the bridge between the Phase 5 plan and actual code.

Current implementation status as of April 14, 2026:

- Phase 5 planning baseline is defined
- Milestone 1 is implemented on web
- Milestone 2 learner-facing onboarding is implemented on web
- Milestone 3 conversion and relationship reporting is implemented on web
- the web app already has the Phase 4 discovery, inquiry, and inquiry-to-classroom foundation that Phase 5 builds on

It complements:

- `docs/phase-5-planning.md`
- `docs/phase-4-implementation-spec.md`
- `docs/product-evolution-strategy.md`
- `docs/implementation-roadmap.md`

---

## Phase 5 Objective

Phase 5 should make the new teacher discovery layer operationally useful after an inquiry is accepted.

The first practical goal is:

- a teacher accepts an inquiry
- a private classroom is created
- the teacher can define a lightweight tutoring setup
- the learner sees clear next steps
- the product can measure whether the relationship actually becomes active

Phase 5 should build on top of classrooms, assignments, notebooks, and the existing `Teaching` workspace.

---

## Phase 5 Structure

Phase 5 should be implemented in three internal tracks:

1. **Phase 5A: private teaching setup**
2. **Phase 5B: onboarding and private-classroom workflow**
3. **Phase 5C: conversion and relationship reporting**

Recommended order:

1. tutoring setup
2. onboarding defaults
3. conversion and relationship reporting

Scheduling, calendar integration, live lessons, and marketplace payouts still stay later.

---

## Core Product Rules

### 1. The classroom remains the real working surface

Discovery and conversion should continue to resolve into:

- classrooms
- assignments
- submissions
- notebook work

Phase 5 should not invent a separate tutoring engine disconnected from those systems.

### 2. Teacher operations should stay lightweight

Teachers need structure, but not a full business-ops product.

Phase 5 should prefer:

- setup summaries
- onboarding defaults
- first-step assignment flows
- private classroom conventions

Phase 5 should avoid:

- scheduling workflows
- calendar sync
- full messaging/inbox systems
- complicated tutoring contract state machines

### 3. The learner should always know the next step

After a private classroom is created, the learner should immediately understand:

- what this teacher relationship is
- what to do next
- whether an onboarding assignment exists
- where to continue working

### 4. Trust should come from structure and clarity

Phase 5 should increase trust through:

- complete public profiles
- visible onboarding
- clear private classroom setup
- teacher activity signals

Not through reviews or rankings yet.

### 5. Teacher setup should live inside `Teaching`

Any new teacher-side configuration should remain inside the existing `Teaching` workspace.

Preferred placement:

- `Teaching > Overview`
- `Teaching > Profile`
- `Teaching > Inquiries`
- `Teaching > Library`
- `Teaching > Reporting`
- `Teaching > Referrals`
- `Teaching > Setup` if a dedicated tutoring-setup section becomes necessary

---

## Scope

### Included

- teacher tutoring setup fields
- default private classroom naming rules
- default onboarding message
- default first assignment template for converted inquiries
- learner-facing next-step summary after classroom conversion
- private-classroom onboarding card
- conversion follow-through reporting
- inactive-converted-student visibility

### Excluded

- real-time lesson scheduling
- calendar integration
- live lesson delivery
- in-app chat
- Stripe Connect marketplace payouts
- public ratings and reviews
- dispute handling

---

## Roles And Permissions

### Teacher can

- manage their own tutoring setup
- define default onboarding rules for converted inquiries
- attach a default template to private inquiry conversion
- view conversion follow-through reporting for their own private classrooms

### Teacher cannot

- manage another teacher’s tutoring setup
- view another teacher’s conversion reporting

### Learner can

- view onboarding and next-step information for classrooms created from their own inquiry
- complete the onboarding assignment if one exists

### Learner cannot

- edit teacher tutoring setup
- view other learners’ conversion flows

### Recommended permission helpers

- `canManageTeacherTutoringSetup(userId, setupId)`
- `canViewConvertedInquiry(userId, inquiryId)`
- `canViewPrivateClassroomOnboarding(userId, classroomId)`
- `canManagePrivateClassroomOnboarding(userId, classroomId)`

---

## Data Model

Phase 5 should extend Phase 4 instead of replacing it.

## Group 1: Teacher tutoring setup

### Table: `teacher_tutoring_settings`

Purpose:

- teacher-owned defaults for private teaching relationships created from inquiries

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL UNIQUE`
- `intro_message TEXT`
- `default_private_classroom_prefix TEXT`
- `default_template_id TEXT`
- `format_notes TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Recommended constraints:

- `default_template_id` should reference `assignment_templates(id)` and use `ON DELETE SET NULL`

## Group 2: Inquiry conversion metadata

Two reasonable options:

### Option A: extend `teacher_inquiries`

Add:

- `onboarding_message TEXT`
- `initial_assignment_id TEXT`
- `conversion_completed_at TIMESTAMPTZ`

### Option B: add companion table `inquiry_conversions`

Fields:

- `id TEXT PRIMARY KEY`
- `inquiry_id TEXT NOT NULL UNIQUE`
- `classroom_id TEXT NOT NULL`
- `teacher_user_id TEXT NOT NULL`
- `student_user_id TEXT NOT NULL`
- `initial_assignment_id TEXT`
- `onboarding_message TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Recommendation:

- use **Option A** first unless the conversion model becomes significantly more complex

## Group 3: Private classroom flags

Phase 5 may also need a lightweight signal on classrooms:

- `classrooms.is_private_tutoring INTEGER NOT NULL DEFAULT 0`

This helps reporting and teacher UX distinguish:

- ordinary class/group classrooms
- inquiry-converted private classrooms

---

## Screen Map

## Teacher screens

### 1. Tutoring Setup Page

Purpose:

- let a teacher define how converted inquiries should start

Sections:

- intro message
- default private classroom prefix
- default onboarding assignment template
- private teaching notes / format notes

Recommended route:

- `/notebook/teacher/setup`

Current web status:

- implemented
- teachers can save tutoring defaults
- overview and inquiry inbox both point teachers toward the setup
- inquiry conversion uses the saved defaults

Milestone 1 delivered:

- `teacher_tutoring_settings` schema
- helper module
- `Teaching > Setup`
- default template selection
- inquiry conversion integration

### 2. Inquiry Conversion Panel

Purpose:

- let the teacher convert an accepted inquiry with clearer defaults

Sections:

- classroom name
- onboarding message
- optional first assignment template
- convert action

Recommended location:

- `Teaching > Inquiries`

### 3. Private Classroom Onboarding Summary

Purpose:

- show the teacher what the learner sees after conversion
- make it easy to verify the setup worked

Recommended location:

- classroom detail page

### 4. Conversion Reporting View

Purpose:

- show whether converted inquiries are becoming active working relationships

Suggested signals:

- accepted inquiries
- converted inquiries
- converted inquiries with first assignment created
- converted inquiries with first submission completed
- inactive converted learners

Recommended location:

- `Teaching > Reporting`

Current web status:

- implemented on the main reporting page
- reporting now includes:
  - converted inquiry count
  - active private relationships
  - inactive private relationships
  - per-learner conversion follow-through rows

## Learner-facing screens

### 5. Private Classroom Next Steps View

Purpose:

- show the learner what to do after a teacher converts their inquiry

Contents:

- onboarding message
- classroom context
- first assignment if present
- direct link into notebook/study flow

Recommended location:

- learner inquiry page and/or classroom detail page

Current web status:

- implemented on both learner inquiry page and private classroom detail
- converted inquiries now surface:
  - onboarding message
  - classroom link
  - first assignment link when present

---

## Flow Specs

## Flow 1: Teacher configures tutoring defaults

1. Teacher opens tutoring setup
2. Adds intro message
3. Defines classroom naming preference
4. Selects default onboarding template
5. Saves

## Flow 2: Teacher converts an accepted inquiry with defaults

1. Teacher opens `Teaching > Inquiries`
2. Accepts inquiry
3. Sees conversion form prefilled from tutoring setup
4. Optionally edits classroom name or onboarding message
5. Optionally attaches first assignment template
6. Converts inquiry

## Flow 3: Learner sees next steps

1. Learner opens `My Inquiries`
2. Converted inquiry now shows classroom access
3. Learner opens classroom
4. Learner sees onboarding message and first assignment if one exists

Current web status:

- implemented
- inquiry conversion now stores:
  - onboarding message
  - linked first assignment
  - conversion completion timestamp
- private classrooms are flagged in the classroom record

## Flow 4: Teacher measures follow-through

1. Teacher opens reporting
2. Views converted inquiry/private-classroom summary
3. Sees who has not started or completed onboarding

---

## API / Action Direction

Phase 5 can continue the current pattern:

- server actions for internal web management flows
- route handlers later if mobile/public clients need stable contracts

Recommended helpers:

- `ensureTeacherTutoringSettings(...)`
- `updateTeacherTutoringSettings(...)`
- `getTeacherTutoringSettings(...)`
- `convertInquiryToPrivateClassroom(...)`
- `getPrivateClassroomOnboarding(...)`
- `getTeacherConversionReporting(...)`

Recommended route additions later:

- `/api/mobile/teacher/setup`
- `/api/mobile/inquiries/:id/onboarding`
- `/api/mobile/private-classrooms/:id/next-steps`

These should not be the first implementation step.

---

## Milestones

## Milestone 1: Tutoring Setup Foundation

Build:

- `teacher_tutoring_settings`
- helper module
- teacher setup page
- default-template selection

Exit criteria:

- a teacher can define reusable private-teaching defaults

## Milestone 2: Conversion Defaulting

Build:

- use tutoring setup defaults when converting an inquiry
- attach optional onboarding template
- save onboarding message / conversion metadata

Exit criteria:

- converting an inquiry feels like a tutoring setup flow, not just a classroom creation event

## Milestone 3: Learner Next Steps

Build:

- learner-facing onboarding / next-step summary
- clearer post-conversion classroom handoff

Exit criteria:

- learners know exactly what to do after conversion

## Milestone 4: Conversion Reporting

Build:

- teacher reporting for converted inquiries and follow-through
- inactive converted learner visibility

Exit criteria:

- teachers can see whether inquiry conversions become active learning relationships

---

## Risks And Decisions To Lock Early

### 1. Where tutoring setup should live

Decision needed:

- should tutoring setup be a dedicated tab under `Teaching`
- or be folded into `Teaching > Profile`

Recommendation:

- start as a dedicated `Teaching > Setup` section if the form becomes more than 3-4 fields

### 2. Whether conversion should attach a first assignment by default

Decision needed:

- should conversion create a first assignment automatically if a default template exists

Recommendation:

- allow the teacher to opt into it during conversion
- do not force automatic assignment creation silently

### 3. How to represent learner next steps

Decision needed:

- should onboarding live in inquiry status, classroom detail, or both

Recommendation:

- show it in both places
- inquiry status should link into the classroom
- classroom should be the durable home

### 4. Private classroom semantics

Decision needed:

- should private tutoring classrooms be a special classroom type

Recommendation:

- yes, but only as a lightweight flag
- avoid separate classroom systems

---

## Definition Of Ready

Phase 5 implementation is ready to begin when:

- the team agrees private tutoring should still run through classrooms
- the team agrees Phase 5 is about onboarding and follow-through, not scheduling
- the team agrees teacher setup defaults belong inside the `Teaching` workspace
- the team agrees first-assignment defaulting should be optional, not automatic

---

## Recommended Immediate Next Step

Start **Milestone 1**:

1. add `teacher_tutoring_settings` to `src/lib/db.ts`
2. add teacher tutoring settings helper module
3. add `Teaching > Setup` page
4. allow selecting a default assignment template
