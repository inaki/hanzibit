# Phase 4 Implementation Spec

## Purpose

This document turns Phase 4 into an implementation-ready specification.

It should answer:

- what Phase 4 builds first
- what schema changes are needed
- what permissions apply
- which screens and flows are required
- what order we should implement in

This doc is the bridge between the Phase 4 plan and actual code.

Current implementation status as of April 14, 2026:

- Phase 4 planning baseline is defined
- implementation has not started yet
- Phase 4 should begin only after keeping discovery scope constrained

It complements:

- `docs/phase-4-planning.md`
- `docs/product-evolution-strategy.md`
- `docs/implementation-roadmap.md`

---

## Phase 4 Objective

Phase 4 should let learners discover teachers and convert that discovery into a real HanziBit workflow without turning the product into a full tutoring marketplace.

The first practical goal is:

- teachers publish public profiles
- learners discover relevant teachers
- learners send structured interest requests
- teachers accept or decline
- accepted requests convert into classrooms or a teacher-managed onboarding path

This phase should build on top of the existing classroom system, not replace it.

---

## Phase 4 Structure

Phase 4 should be implemented in three internal tracks:

1. **Phase 4A: public teacher profiles**
2. **Phase 4B: discovery and inquiry**
3. **Phase 4C: inquiry-to-classroom conversion**

Recommended order:

1. public teacher profiles
2. discovery/search
3. inquiry and conversion

Scheduling, in-app messaging, and marketplace payouts stay later.

---

## Core Product Rules

### 1. Discovery must end in a real HanziBit workflow

Profiles alone are not enough.

Discovery should lead into:

- classroom creation
- assignment-based learning
- notebook-centered study

### 2. Profiles must be trustworthy without heavy reputation systems

Use explicit profile fields instead of opaque marketplace scores:

- teaching focus
- levels taught
- languages spoken
- timezone
- specialties
- experience summary

### 3. Inquiry should stay lightweight

Start with request / accept / decline.

Do not start with:

- live chat
- scheduling
- trial-lesson booking

### 4. Marketplace complexity must remain constrained

Phase 4 should not absorb:

- Stripe Connect marketplace payouts
- disputes
- reviews
- live lesson delivery

---

## Scope

### Included

- teacher public profile creation/editing
- public teacher profile pages
- public teacher directory/search
- basic filters:
  - teaching focus
  - level range
  - timezone
  - specialties
  - language of instruction
- learner inquiry/request flow
- teacher inquiry inbox
- accept / decline flow
- create classroom from accepted inquiry
- optional onboarding assignment at conversion time

### Excluded

- lesson scheduling
- calendar integration
- live/video lessons
- in-app messaging
- public review/rating system
- marketplace payouts
- dispute handling workflows
- algorithmic ranking beyond simple ordering/filtering

---

## Roles And Permissions

### Teacher can

- create and edit their own public profile
- choose whether their profile is public
- view inquiries sent to them
- accept or decline inquiries
- create a classroom from an accepted inquiry

### Teacher cannot

- edit another teacher’s public profile
- view another teacher’s inquiries

### Learner can

- browse public teacher profiles
- send an inquiry to a public teacher
- view the status of their own inquiries

### Learner cannot

- browse non-public teacher profiles
- view other learners’ inquiries

### Recommended permission helpers

- `canManageTeacherProfile(userId, profileId)`
- `canViewTeacherInquiry(userId, inquiryId)`
- `canRespondToTeacherInquiry(userId, inquiryId)`
- `canViewOwnInquiry(userId, inquiryId)`
- `canConvertInquiryToClassroom(userId, inquiryId)`

---

## Data Model

Phase 4 should add two main groups of tables.

## Group 1: Teacher public profile

### Table: `teacher_profiles`

Purpose:

- teacher-owned public discovery profile

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL UNIQUE`
- `public_slug TEXT NOT NULL UNIQUE`
- `headline TEXT`
- `bio TEXT`
- `languages_json JSONB NOT NULL DEFAULT '[]'`
- `specialties_json JSONB NOT NULL DEFAULT '[]'`
- `levels_json JSONB NOT NULL DEFAULT '[]'`
- `timezone TEXT`
- `pricing_summary TEXT`
- `availability_summary TEXT`
- `years_experience INTEGER`
- `teaching_style TEXT`
- `is_public INTEGER NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### Optional later table: `teacher_profile_stats`

Purpose:

- lightweight derived search/ranking stats if needed later

Not required for Milestone 1.

## Group 2: Inquiry workflow

### Table: `teacher_inquiries`

Purpose:

- learner interest request to a teacher

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL`
- `student_user_id TEXT NOT NULL`
- `message TEXT`
- `status TEXT NOT NULL`
- `created_classroom_id TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Allowed `status` values:

- `pending`
- `accepted`
- `declined`
- `converted`

Recommended uniqueness:

- `UNIQUE(teacher_user_id, student_user_id, status)` is too strict
- better to allow multiple historical inquiries if needed later
- for V1, enforce a softer rule in helpers:
  - do not create a second `pending` inquiry for the same teacher/student pair

---

## Screen Map

## Teacher screens

### 1. Public Profile Editor

Purpose:

- create or edit the teacher’s public profile

Sections:

- basic profile
- teaching focus
- levels taught
- languages spoken
- timezone and availability summary
- pricing summary
- public toggle
- public profile preview link

### 2. Teacher Inquiry Inbox

Purpose:

- view pending learner requests

Actions:

- accept
- decline
- convert to classroom

## Learner-facing screens

### 3. Teacher Discovery Page

Purpose:

- browse and filter public teacher profiles

### 4. Public Teacher Profile Page

Purpose:

- evaluate one teacher and send inquiry

### 5. Learner Inquiry Status Page

Purpose:

- show sent requests and current status

---

## Flow Specs

## Flow 1: Teacher publishes profile

1. Teacher opens profile editor
2. Completes key fields
3. Enables public visibility
4. Profile becomes discoverable

## Flow 2: Learner discovers teacher

1. Learner opens discovery page
2. Searches or filters
3. Opens teacher profile
4. Sends inquiry

## Flow 3: Teacher handles inquiry

1. Teacher opens inquiry inbox
2. Reviews learner message
3. Accepts or declines
4. If accepted, teacher can create a classroom from the inquiry

## Flow 4: Inquiry converts to classroom

1. Teacher accepts inquiry
2. Teacher chooses `Create classroom`
3. App creates classroom
4. Learner is enrolled as student
5. Optional onboarding assignment is created

---

## API / Action Direction

Phase 4 can continue the current pattern:

- server actions for internal web management flows
- route handlers later if mobile/public clients need stable contracts

Recommended helpers:

- `createTeacherProfile(...)`
- `updateTeacherProfile(...)`
- `getTeacherProfileBySlug(...)`
- `listPublicTeacherProfiles(...)`
- `createTeacherInquiry(...)`
- `listTeacherInquiries(...)`
- `respondToTeacherInquiry(...)`
- `convertInquiryToClassroom(...)`

Recommended route additions later:

- `/api/mobile/teachers`
- `/api/mobile/teachers/:slug`
- `/api/mobile/teacher-inquiries`

These should not be the first implementation step.

---

## Milestones

## Milestone 1: Teacher Profile Foundation

Build:

- schema for `teacher_profiles`
- teacher profile helper module
- profile create/edit page
- public profile page

Exit criteria:

- a teacher can publish a public profile
- a public profile can be viewed by slug

## Milestone 2: Discovery Surface

Build:

- discovery/search page
- filter handling
- simple ordering and empty states

Exit criteria:

- learners can browse public teachers and open profile detail pages

## Milestone 3: Inquiry Workflow

Build:

- inquiry create action
- teacher inquiry inbox
- accept / decline actions
- learner inquiry status page

Exit criteria:

- a learner can send an inquiry
- a teacher can accept or decline it

## Milestone 4: Inquiry Conversion

Build:

- convert accepted inquiry to classroom
- enroll learner automatically
- optional onboarding assignment

Exit criteria:

- discovery can turn into an active HanziBit learning workflow

---

## Risks And Decisions To Lock Early

### 1. Public profile scope

Decision needed:

- which profile fields are required for public launch

Recommendation:

- require enough to feel trustworthy:
  - headline
  - bio
  - at least one specialty
  - at least one level
  - timezone

### 2. Inquiry conversion model

Decision needed:

- should accepted inquiry always create a classroom
- or can it remain accepted without conversion

Recommendation:

- allow accept without immediate conversion
- but optimize the UI toward `Create classroom`

### 3. Discovery ordering

Decision needed:

- how profiles are ordered initially

Recommendation:

- start with simple deterministic ordering:
  - public + complete profiles first
  - newest updated profiles next

Do not start with opaque ranking logic.

---

## Definition Of Ready

Phase 4 implementation is ready to begin when:

- the team agrees public profiles are opt-in
- the team agrees inquiry is the first connection model
- the team agrees accepted inquiry should naturally lead into classrooms
- the team agrees scheduling and payouts remain deferred

---

## Recommended Immediate Next Step

Start **Milestone 1**:

1. add `teacher_profiles` to `src/lib/db.ts`
2. add teacher profile helper module
3. add profile editor page
4. add public profile page by slug
