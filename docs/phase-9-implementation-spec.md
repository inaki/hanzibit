# Phase 9 Implementation Spec

## Purpose

This document turns Phase 9 into an implementation-ready specification.

It should answer:

- what Phase 9 builds first
- what schema changes are needed
- what permissions apply
- which screens and flows are required
- what order we should implement in

This doc is the bridge between the Phase 9 plan and actual code.

Current implementation status as of April 14, 2026:

- Phase 9 planning baseline is defined
- Milestone 1 is implemented on web
- Milestone 2 is implemented on web
- Milestone 3 is implemented on web
- the web app already has:
  - private learner lifecycle workflow
  - next lesson/check-in planning
  - private learner goals
  - lesson/check-in history
  - continuity reporting
  - continuity guidance inside `Teaching > Private Learners`, `Teaching > Reporting`, and private classroom views
  - goal progress markers on private learner goals
  - reporting visibility for blocked goals and reinforcement pressure
  - repeated issue tags on lesson/check-in history
  - intervention notes on lesson/check-in history and private classroom continuity context
  - intervention reporting for recurring issues and “intervention now” pressure
  - intervention guidance inside `Teaching > Private Learners`, private learner detail, and private classroom tutoring cards

It complements:

- `docs/phase-9-planning.md`
- `docs/phase-8-implementation-spec.md`
- `docs/product-evolution-strategy.md`
- `docs/implementation-roadmap.md`

---

## Phase 9 Objective

Phase 9 should help teachers interpret private learner continuity and turn it into lightweight intervention.

The practical goal is:

- a private learner already has goals, plans, and recent check-in history
- the teacher can mark whether goals look on track or blocked
- the teacher can capture repeated weak areas without writing long lesson notes
- reporting can distinguish healthy continuity from learners who need active intervention

Phase 9 should build on:

- private learners
- next lesson planning
- private learner goals
- lesson/check-in history
- continuity reporting

---

## Phase 9 Structure

Phase 9 should be implemented in three internal tracks:

1. **Phase 9A: goal progress and intervention markers**
2. **Phase 9B: repeated issue visibility**
3. **Phase 9C: intervention reporting**

Recommended order:

1. goal progress markers
2. repeated issue capture
3. intervention reporting

---

## Core Product Rules

### 1. Keep outcome signals lightweight

Teachers should not need to fill out a formal evaluation after every lesson.

The first version should prefer:

- short progress markers
- one short intervention note
- a small repeated-issue vocabulary

### 2. Keep intervention tied to existing workflow

Phase 9 should stay grounded in:

- active goals
- next lesson planning
- recent lesson/check-in history
- assignment follow-through

It should not create a separate assessment subsystem.

### 3. Optimize for “what should I do next?”

The main product value is operational:

- who needs reinforcement
- who is blocked
- which goals should continue or change
- which learners need teacher attention now

### 4. Reporting should surface action, not abstract metrics

Phase 9 reporting should help answer:

- Which learners are progressing?
- Which learners are stable but unclear?
- Which learners are blocked or repeatedly weak in one area?
- Which learners need the teacher to intervene now?

### 5. Keep it inside the `Teaching` workspace

Preferred placement:

- `Teaching > Private Learners`
- private learner detail
- private classroom tutoring card
- `Teaching > Reporting`

---

## Scope

### Included

- goal progress status markers
- lightweight teacher intervention note on private learner workflow
- repeated issue tags on lesson/check-in history
- intervention-oriented reporting

### Excluded

- grading
- formal rubrics
- assessment exports
- parent-facing reports
- public progress pages
- messaging
- scheduling

---

## Roles And Permissions

### Teacher can

- update goal progress markers for their own private learners
- add repeated issue tags to lesson/check-in history for their own private learners
- add a short intervention note for their own private learners
- view intervention reporting for their own private learners

### Teacher cannot

- modify another teacher’s intervention data
- view another teacher’s intervention reporting

### Learner can

- view simplified current intervention direction when appropriate in private classroom context

### Learner cannot

- edit progress markers
- edit repeated issue tags
- edit intervention notes

### Recommended permission helpers

- `canManagePrivateLearnerProgress(userId, privateStudentId)`
- `canManagePrivateLearnerHistory(userId, privateStudentId)`
- `canViewPrivateLearnerIntervention(userId, privateStudentId)`

Recommendation:

- extend the current private learner permission pattern instead of creating a separate admin system

---

## Data Model

Phase 9 should extend the current private learner continuity model rather than replacing it.

## Group 1: Goal progress

### Table: `private_student_goals`

Recommended additive fields:

- `progress_status TEXT`
- `progress_note TEXT`
- `last_progress_at TIMESTAMPTZ`

Recommended enum for `progress_status`:

- `improving`
- `stable`
- `needs_reinforcement`
- `blocked`

Purpose:

- give each active goal a lightweight current instructional state

Recommendation:

- keep goal `status` for lifecycle (`active`, `paused`, `completed`)
- use `progress_status` for current instructional momentum

## Group 2: Repeated issues on lesson history

### Table: `private_lesson_history`

Recommended additive fields:

- `issue_tags TEXT[]` or a normalized join table if arrays become awkward
- `intervention_note TEXT`

Recommended starting issue set:

- `tone_accuracy`
- `word_order`
- `vocabulary_recall`
- `reading_confidence`
- `speaking_confidence`
- `homework_follow_through`
- `consistency`

Purpose:

- let teachers mark recurring weak areas without writing large narrative notes

Recommendation:

- start with a small curated set plus optional free-text intervention note

## Group 3: Reporting derivations

Phase 9 can likely derive reporting from:

- current active goals
- `progress_status`
- recent lesson history
- issue tag frequency
- existing continuity signals

Avoid creating a separate stored reporting table in V1.

---

## Screen Map

### 1. `Teaching > Private Learners`

Should now show:

- progress pressure counts
- blocked learners
- learners needing reinforcement
- repeated issue presence

### 2. `Teaching > Private Learners > [Learner]`

Should now include:

- active goals with progress marker controls
- progress note
- lesson/check-in history tagging
- intervention guidance banner

### 3. Private classroom detail

Should now surface:

- simplified current direction
- maybe current focus issues
- maybe “teacher is reinforcing…” style copy

### 4. `Teaching > Reporting`

Should now include:

- intervention summary cards
- blocked goal counts
- repeated issue hot spots
- private learners needing intervention now

---

## Flow Specs

## Phase 9A: Goal progress and intervention markers

### Teacher flow

1. Teacher opens a private learner detail page
2. Teacher updates an active goal with a progress state:
   - improving
   - stable
   - needs reinforcement
   - blocked
3. Teacher optionally adds a short progress note
4. The goal now contributes to reporting and intervention visibility

### Output

- active goals become instructional signals, not only static intentions

## Phase 9B: Repeated issue visibility

### Teacher flow

1. Teacher records or edits a lesson/check-in history entry
2. Teacher selects one or more repeated issue tags
3. Teacher optionally leaves a short intervention note
4. Those issues accumulate into reporting patterns

### Output

- the app can identify repeated weak areas over time

## Phase 9C: Intervention reporting

### Reporting questions

Phase 9 reporting should answer:

- who has blocked goals
- who repeatedly needs reinforcement
- who has repeated issue tags in recent history
- who should be prioritized this week

### Reporting outputs

- top-line intervention cards
- learner rows with intervention badges
- repeated issue clusters

---

## API / Action Direction

Initial implementation can stay in server actions first.

Likely additions:

- `updatePrivateStudentGoalProgressAction(formData)`
- `updatePrivateLessonHistoryIssuesAction(formData)` or fold into create/update history
- derived reporting additions in `teacher-reporting.ts`

If mobile parity happens later, these can become API endpoints then.

---

## Milestones

## Milestone 1: Goal progress markers

Build:

- schema additions to `private_student_goals`
- helper support
- teacher controls in private learner detail
- lightweight progress badges in private learner list and classroom context

Exit criteria:

- active goals can express progress state
- blocked or weak goals are visible in the workflow

## Milestone 2: Repeated issue capture

Build:

- history issue tags
- intervention note
- UI for tagging lesson/check-in outcomes
- recent issue visibility on private learner detail

Exit criteria:

- teachers can capture recurring problems without writing long notes

## Milestone 3: Intervention reporting

Build:

- reporting cards for blocked/reinforcement pressure
- learner-level intervention badges
- repeated issue visibility in reporting

Exit criteria:

- reporting shows who needs action now, not only who has continuity gaps

---

## Risks And Decisions To Lock Early

### 1. Free-text vs curated issue tags

Recommendation:

- start with curated tags
- keep one free-text intervention note

### 2. Goal progress vs goal lifecycle

Recommendation:

- keep both
- lifecycle says whether the goal exists
- progress says whether it is moving

### 3. Reporting complexity

Recommendation:

- avoid scoring systems at first
- start with clear, interpretable badges and counts

### 4. Learner visibility

Recommendation:

- keep learner-facing intervention language supportive and minimal
- do not expose internal teacher labels like `blocked` too bluntly

---

## Definition Of Ready

Phase 9 is ready to implement when:

- schema direction is accepted
- progress marker vocabulary is accepted
- repeated issue vocabulary is accepted
- reporting scope is limited to operational intervention, not assessment

That should be enough to begin Milestone 1.
