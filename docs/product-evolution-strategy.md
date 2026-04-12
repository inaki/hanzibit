# HanziBit Product Evolution Strategy

## Purpose

This document captures a practical strategy for evolving HanziBit from a learner-first Mandarin study app into:

- a strong standalone learning product
- a classroom support tool for language teachers
- a future platform where learners may discover and work with tutors

The goal is to expand the product without losing the strength of the current app: a personal notebook-centered learning workflow.

---

## Current Product Position

HanziBit already has a real learner product, not just a static prototype.

Today the app includes:

- personal journal writing in Mandarin
- inline annotation markup for vocabulary and meaning
- interlinear gloss support
- HSK-based study guide
- flashcards with spaced repetition
- review history
- dashboard and progress tracking
- authentication
- subscriptions
- a mobile-oriented API layer under `src/app/api/mobile/`

This means the core learner loop is already in place:

1. write in Chinese
2. inspect and study words in context
3. turn useful words into flashcards
4. review over time
5. track progress against HSK content

This is the product foundation and should remain the center of the app.

---

## Strategic Conclusion

The correct path is not to split HanziBit into separate products right now.

The right path is:

1. strengthen HanziBit as a standalone learner app
2. add a collaboration layer for teachers and students
3. later consider a tutoring discovery marketplace

The key product rule should be:

**Each learner owns a personal notebook. Teacher and classroom features should extend that notebook, not replace it.**

This keeps the product coherent for both self-learners and students studying with a teacher.

---

## What The Current Architecture Suggests

The current codebase is favorable for this evolution because:

- the app already has a clear learner-facing structure
- the database model is simple and understandable
- the mobile API direction is already documented and partially implemented
- the notebook model is a strong anchor for future collaborative workflows

Current data is mostly user-scoped:

- `journal_entries`
- `entry_annotations`
- `vocabulary`
- `grammar_points`
- `flashcards`
- `review_history`
- `subscriptions`

This is good for self-study, but it also reveals the main gap:

**there is not yet a collaboration model for teachers, classes, assignments, or shared content.**

That should be added as a new layer instead of forcing teacher behavior into personal-study tables.

---

## Product Vision

HanziBit should evolve into a product with four progressive usage modes.

### 1. Solo Learner

The user studies independently:

- writes journal entries
- studies HSK vocabulary and grammar
- reviews flashcards
- tracks progress

This is the current core product.

### 2. Student In A Class

The same learner account can join a teacher’s classroom and receive:

- journal prompts
- assignments
- shared vocabulary lists
- teacher feedback
- class-specific resources

The learner should still have their own personal notebook outside class work.

### 3. Teacher

Teachers should be able to:

- create classrooms
- invite students
- assign homework
- share learning material
- review student submissions
- monitor progress

This should be the first major expansion after the learner app is hardened.

### 4. Tutor Marketplace User

In the future, HanziBit may support:

- teacher discovery
- tutor profiles
- matching by level, timezone, language, and pricing
- trial lesson requests
- conversion from discovery into classroom or private tutoring workflows

This should come later, after teacher and classroom workflows are proven.

---

## Recommended Product Phases

## Phase 1: Strengthen The Standalone Learner App

### Objective

Make HanziBit excellent as a solo learning tool before expanding into teacher workflows.

### Why This Comes First

If the learner experience is weak, teacher workflows will also be weak. Teachers do not want to manage students inside an unstable or shallow product.

### Focus Areas

- stabilize and complete the mobile/API contract
- improve testing for streaks, review scheduling, and access gates
- improve journal annotation UX
- continue strengthening the notebook as the source of truth
- reduce friction for daily study and review
- begin shaping a guided learner loop around input, output, retrieval, and feedback
- strengthen the study guide so it can evolve into a better comprehensible input surface

### Success Criteria

- a self-learner can use the app daily without needing a teacher
- the mobile app can be built on a stable backend contract
- the product loop is reliable enough to support classroom use later
- the learner experience is moving beyond reference + review toward a repeatable daily practice system

---

## Phase 2: Add Classroom Mode For Teachers And Students

### Objective

Add teacher support as a collaboration layer on top of the learner product.

### Main Principle

Do not create a separate disconnected “teacher app” first.

Instead:

- keep one account system
- keep one learner notebook
- add teacher-facing workflows and views
- let classroom activity feed into the learner’s normal study environment

### MVP Teacher Features

- teacher role
- classroom creation
- classroom invite code or join link
- student roster
- assignment creation
- journal prompt assignments
- vocabulary/grammar resource sharing
- student submission tracking
- teacher feedback on submitted work

### First Good Teacher Use Cases

- “Write a journal entry using this week’s HSK words.”
- “Study this vocabulary set before class.”
- “Read these grammar notes and complete the prompt.”
- “Teacher leaves written feedback on a submission.”

### Success Criteria

- a teacher can manage a small class without using external tools for core homework flow
- a student can complete class work inside the same product they use for personal study
- classroom features feel like an extension of the notebook, not a separate system

---

## Phase 3: Add Teacher Content And Instructional Tools

### Objective

Make HanziBit more useful for repeat teaching and reusable curriculum delivery.

### Features To Add

- reusable assignment templates
- teacher content library
- shared vocabulary sets
- shared grammar notes
- reusable journal prompts
- class-level progress summaries
- lightweight reporting for completion and review activity
- early Phase 3: teacher referral program so teachers can bring students and earn commission on paid subscriptions

### Why This Matters

Without reusable content, teachers will create too much from scratch. That makes the product harder to retain in real teaching practice.

The referral program also fits well here because, by early Phase 3, the teacher role should already be real enough to support promotion, attribution, and commission payouts without distracting from the core learner build.

### Success Criteria

- teachers can reuse and adapt content across classes
- students receive structured material without losing the personal notebook experience
- teachers can quickly see who is progressing and who is falling behind

---

## Phase 4: Explore Tutor Discovery Marketplace

### Objective

Allow learners to find and connect with language teachers or tutors.

### Important Constraint

This should only be built after classroom workflows are proven useful.

### Why This Comes Later

A marketplace introduces operational complexity:

- identity and trust
- search quality
- scheduling
- pricing
- payments and payouts
- moderation
- disputes
- profile quality control

That is a different business layer from the core learning product.

### Future Marketplace Features

- public teacher profiles
- filters by language taught, level, timezone, price, and availability
- trial lesson request flow
- teacher reviews and trust signals
- conversion from profile discovery into a private class or tutoring space

### Success Criteria

- teachers already succeed on the platform before discovery is added
- marketplace demand is validated by existing classroom usage

---

## Product Design Principles

These principles should guide future implementation decisions.

### 1. Notebook First

The personal notebook remains the center of the product.

Even when a learner joins a class:

- their journal stays theirs
- their vocabulary and flashcards stay theirs
- teacher assignments should connect to their personal study flow

### 2. One Product, Multiple Roles

Avoid maintaining two disconnected products unless scale eventually forces it.

Preferred model:

- learner navigation
- teacher navigation
- shared account/billing/navigation shell

The app should be role-aware, not split too early.

### 3. Shared Data Should Be Explicit

Do not overload current learner tables with too many teacher-specific flags.

Instead, introduce explicit collaboration data models for:

- classrooms
- memberships
- assignments
- submissions
- teacher feedback
- shared resources

### 4. Mobile Should Be A First-Class Client

The mobile app should use stable API contracts and not depend on web-only assumptions.

This matters because HanziBit as a standalone daily-use language app will likely need strong mobile usage over time.

---

## Recommended Data Model Direction

The next schema expansion should separate personal learning data from collaborative instructional data.

### Existing Personal Data

- user
- journal entries
- entry annotations
- vocabulary
- flashcards
- grammar points
- review history
- subscriptions

### New Collaborative Data To Add

- `organizations` or `schools`
- `memberships`
- `classrooms`
- `classroom_members`
- `assignments`
- `assignment_submissions`
- `teacher_feedback`
- `shared_resources`

### Conceptual Ownership Model

- personal notebook content belongs to the learner
- classroom objects belong to a teacher or organization
- assignment submissions connect classroom work to learner-owned study data

This preserves the learner’s autonomy while enabling teacher workflows.

---

## Suggested UX Model

HanziBit should stay as one product with role-aware navigation.

### Learner Navigation

- Dashboard
- Notebook
- Study Guide
- Flashcards
- Reviews

### Teacher Navigation

- Classes
- Assignments
- Students
- Library

### Shared Navigation

- Account
- Billing
- Settings

This approach is simpler and more maintainable than spinning up separate products too early.

---

## Recommended 8 To 12 Week Execution Plan

### 1. Harden The Learner Platform

- add tests for streak logic, review logic, and paywall gates
- normalize mobile API responses
- finish obvious CRUD and validation gaps
- improve journal annotation usability
- define the first version of a guided daily learning loop
- prioritize features that improve input, output, feedback, and retention rather than adding disconnected surfaces

### 2. Introduce Roles And Classrooms

- add teacher role support
- add classroom creation and joining
- add basic class roster views

### 3. Ship Assignment MVP

- teacher creates a journal prompt or vocabulary assignment
- student completes it inside existing notebook flow
- teacher reviews and comments on the submission

### 4. Add Teacher Resource Library

- reusable prompts
- vocabulary sets
- grammar notes

### 5. Add Reporting

- assignment status
- student progress summaries
- review activity visibility

### 6. Reassess Marketplace Timing

Only after teachers actively use classrooms and assignments should the team consider tutor discovery and matching.

---

## Clear Recommendation

The next product move should **not** be “find a tutor.”

The next product move should be:

**make HanziBit excellent for self-learners, then add classroom workflows so teachers can guide students inside the notebook.**

This path is:

- most aligned with the current codebase
- lowest risk technically
- strongest product fit with what already exists
- the best foundation for a future tutor marketplace

---

## Summary

HanziBit already has the base of a strong standalone Mandarin learning app.

The best evolution path is:

1. strengthen the solo learner experience
2. add teacher and classroom workflows as a second layer
3. later explore tutoring discovery and marketplace features

The notebook should remain the center of the experience throughout all phases.

For the execution-oriented version of this strategy, see `docs/implementation-roadmap.md`.
