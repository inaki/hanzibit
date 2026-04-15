# Phase 5 Planning

## Objective

Phase 5 should turn the first teacher discovery layer into a more usable teacher-learner working relationship without expanding HanziBit into a full tutoring marketplace too early.

The goal is not:

- build a Calendly replacement
- build a Zoom competitor
- build a full two-sided marketplace operations stack

The goal is:

- make accepted teacher inquiries easier to turn into a repeatable tutoring workflow
- add lightweight operational structure around private teaching relationships
- keep classrooms and the notebook as the real product surface underneath

Phase 5 should build on what now exists on web:

- stable learner loop
- classroom and assignment workflows
- reusable teacher content
- teacher reporting
- referrals
- public teacher profiles and directory
- inquiry flow
- inquiry-to-classroom conversion
- consolidated `Teaching` workspace
- teacher tutoring setup defaults

Current implementation status as of April 14, 2026:

- `Teaching > Setup` exists on web
- teachers can save:
  - intro message
  - default private classroom prefix
  - default onboarding template
  - format notes
- inquiry conversion now uses those defaults for:
  - classroom naming fallback
  - classroom description
  - automatic first assignment creation from the default template
- learners now see next-step onboarding on:
  - `My Teacher Inquiries`
  - private classroom detail
- `Teaching > Reporting` now includes converted inquiry follow-through:
  - converted count
  - active private relationships
  - inactive private relationships
  - per-learner follow-through rows

---

## What Phase 5 Is

Phase 5 is the first operational layer after discovery.

That means:

- private teacher-student relationships become easier to manage
- accepted inquiries can follow a clearer onboarding path
- teachers can define lightweight tutoring terms and next steps
- learners can understand how to begin working with a teacher after conversion

Phase 5 is **not** yet:

- full scheduling automation
- calendar sync
- live lesson delivery
- a Stripe Connect tutoring marketplace
- public review and ranking systems

---

## Product Outcome

By the end of Phase 5, HanziBit should be able to support this path:

1. learner discovers teacher
2. learner sends inquiry
3. teacher accepts and converts to private classroom
4. teacher defines a lightweight onboarding and tutoring setup
5. learner sees clear next steps inside HanziBit
6. teacher uses the classroom plus notebook plus assignments as the actual teaching workflow

This validates whether discovery is producing a real teaching relationship, not just inbound messages.

---

## Scope

### In Scope

1. Inquiry conversion polish and defaults
2. Private classroom onboarding templates
3. Teacher-managed tutoring setup fields
4. Lightweight private-classroom status management
5. Clear learner-facing next steps after inquiry conversion
6. Optional “request revision / next assignment” follow-through in private classrooms
7. Better teacher attention and conversion reporting

### Explicitly Out Of Scope

1. Real-time lesson scheduling
2. Calendar integration
3. Live video/audio lesson delivery
4. Marketplace payouts to tutors through Connect
5. Public ratings/reviews
6. General in-app messaging/threaded chat
7. Dispute management

---

## Core Product Rules

### 1. The classroom remains the working surface

Discovery and conversion should continue to end in classrooms, assignments, submissions, and notebook activity.

Phase 5 should not create a disconnected tutoring workflow outside the existing product.

### 2. Operations should remain lightweight

Teachers need structure, but not a full operations platform.

Use:

- setup summaries
- onboarding defaults
- private classroom conventions

Do not start with:

- scheduling engines
- teacher inbox/chat systems
- multi-step marketplace administration

### 3. Teacher configuration should clarify expectations

After an inquiry is accepted, both sides should understand:

- what the teacher offers
- how the learner starts
- what the first class/classroom workflow looks like

### 4. Trust should come from clarity, not marketplace mechanics

The product should keep improving trust through:

- complete profiles
- clear onboarding steps
- visible teacher activity
- structured classroom flow

Not through ratings or opaque algorithms yet.

---

## Suggested Phase 5 Structure

Phase 5 should be split into three internal tracks:

1. **Phase 5A: private teaching setup**
2. **Phase 5B: onboarding and private-classroom workflow**
3. **Phase 5C: conversion and relationship reporting**

Recommended order:

1. private teaching setup
2. onboarding defaults
3. conversion reporting

Scheduling and real marketplace operations still stay later.

---

## Phase 5A: Private Teaching Setup

### Goal

Let teachers define how a private teaching relationship should start once an inquiry is accepted.

### Features

- tutoring setup summary under `Teaching`
- optional intro / onboarding message
- default private classroom naming rules
- default first assignment template
- optional pricing/format notes for private students

### Success Criteria

- a teacher can convert a new inquiry without manually reinventing the same onboarding every time
- the learner gets a clearer first experience than “you were added to a classroom”

---

## Phase 5B: Onboarding And Private-Classroom Workflow

### Goal

Make converted inquiries feel like the start of a tutoring relationship rather than just a classroom creation event.

### Features

- private classroom onboarding card
- learner next-step summary
- teacher quick-start actions
- optional initial assignment attached at conversion time
- clearer private-classroom status cues

### Success Criteria

- learners know what to do immediately after conversion
- teachers can start a tutoring workflow quickly using existing assignment and notebook tools

---

## Phase 5C: Conversion And Relationship Reporting

### Goal

Help teachers understand whether discovery is turning into active student relationships.

### Features

- inquiry conversion counts
- converted inquiry follow-through
- private classroom activity summary
- pending onboarding / inactive converted learners

### Success Criteria

- teachers can see whether accepted inquiries are becoming active learners
- HanziBit can measure whether discovery is producing real usage

---

## Data Model Direction

Phase 5 should extend, not replace, the Phase 4 structures.

Suggested additions:

### Group 1: Teacher tutoring setup

Suggested table: `teacher_tutoring_settings`

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL UNIQUE`
- `intro_message TEXT`
- `default_private_classroom_prefix TEXT`
- `default_template_id TEXT`
- `format_notes TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### Group 2: Inquiry conversion metadata

Extend `teacher_inquiries` or add a companion table to track:

- converted classroom readiness
- onboarding completion state
- initial assignment linkage

This should stay lightweight.

---

## Why Phase 5 Should Happen Before A Full Marketplace

Because HanziBit still needs to answer a more important product question first:

**Do accepted teacher inquiries actually become active tutoring/classroom relationships inside the product?**

If that answer is weak, then scheduling, payouts, and marketplace mechanics would be premature.

Phase 5 should strengthen the real teacher-learner working loop before adding heavier marketplace infrastructure.

---

## Recommended Immediate Next Step

Turn this into an implementation-ready Phase 5 spec with:

1. schema proposal
2. tutoring setup screen map
3. inquiry conversion/onboarding flow spec
4. milestone order
