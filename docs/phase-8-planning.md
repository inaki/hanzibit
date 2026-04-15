# Phase 8 Planning

## Objective

Phase 8 should help HanziBit support private tutoring relationships across multiple lessons instead of only helping the teacher manage the next step.

By the end of Phase 7, HanziBit already supports:

- public teacher profiles and discovery
- learner inquiries
- inquiry-to-private-classroom conversion
- tutoring setup defaults
- learner onboarding and first next steps
- private learner lifecycle tracking
- teacher-managed next-step workflow
- private learner reporting and stalled-relationship visibility
- cadence defaults
- next lesson/check-in planning
- cadence-aware reporting for missing and drifting plans

The next product question is:

**Can a private teacher-learner relationship build visible continuity over time inside HanziBit, not just one next lesson at a time?**

Phase 8 should answer that question.

---

## What Phase 8 Is

Phase 8 is the **private tutoring continuity and lesson-history layer**.

It should help teachers manage multi-lesson momentum by making it easier to see:

- what the learner is currently working toward
- what happened in the last few lessons/check-ins
- what the teacher wants to reinforce next
- whether the tutoring relationship is producing visible progress over time

It should still rely on:

- private classrooms
- assignments
- notebook work
- private learner workflow
- cadence and next lesson planning
- reporting

It should not replace those systems.

---

## What Phase 8 Is Not

Phase 8 should **not** become:

- a full CRM
- a complete lesson-notes product
- scheduling/calendar sync
- live lesson delivery
- chat/messaging
- a formal gradebook
- tutoring billing or payroll

Those are still later, if they are needed at all.

---

## Product Outcome

By the end of Phase 8, HanziBit should support this private tutoring path:

1. learner discovers teacher
2. learner becomes a private classroom
3. onboarding happens
4. teacher manages active private learner workflow
5. teacher defines the next lesson/check-in
6. completed lessons/check-ins leave behind lightweight history
7. the teacher can see goals, recent lesson focus, and recurring issues
8. reporting can show whether the relationship is moving forward over time, not only whether it has a next plan

That would turn the current “next lesson” layer into a more durable teaching continuity system.

---

## Suggested Structure

Phase 8 should be split into three internal tracks:

1. **Phase 8A: private learner goals**
2. **Phase 8B: lightweight lesson history**
3. **Phase 8C: continuity reporting**

Recommended order:

1. learner goals and teacher focus
2. lesson/check-in history
3. reporting on continuity and recurring issues

Current web status:

- Phase 8 planning baseline is defined
- private learner goals are implemented on web
- lightweight lesson/check-in history is implemented on web
- continuity reporting is implemented on web
- teachers can manage goals from `Teaching > Private Learners`
- teachers can record short lesson outcomes from `Teaching > Private Learners`
- private classrooms now surface active tutoring goals alongside next lesson context
- private classrooms now surface the latest lesson/check-in summary
- `Teaching > Reporting` now flags private learners with no active goals, no recent history, and weak continuity
- `Teaching > Private Learners` and private classroom workflow cards now surface continuity guidance more clearly

---

## Core Product Rules

### 1. Keep history lightweight and actionable

The first version does not need full teaching notes.

Teachers mostly need:

- a small goal set for the learner
- a short lesson outcome note
- a visible thread of recent check-ins
- enough context to decide what comes next

### 2. History should connect to real work

Phase 8 should tie continuity back into:

- assignments
- notebook work
- review and feedback
- next lesson plans

It should not become a separate notes silo.

### 3. Goals should stay simple

The first version should avoid a giant taxonomy of learning goals.

Instead, it should support:

- short teacher-defined focus goals
- maybe level or exam emphasis
- active vs completed goals

### 4. Reporting should show continuity, not analytics theater

Phase 8 reporting should help answer:

- Which private learners have no active goal?
- Which learners have no recent lesson outcome history?
- Which recurring issues keep showing up?
- Which learners are active week to week versus only drifting from assignment to assignment?

---

## In Scope

- private learner active goals
- short lesson/check-in outcome records
- last lesson summary on private learner detail
- recent lesson history on private classroom / private learner workflow
- continuity reporting for active goals and recent lesson coverage

---

## Out Of Scope

- long-form teacher journals
- multi-teacher collaboration
- formal assessment rubrics
- certificates or grading systems
- scheduling and calendar booking
- messaging threads

---

## Likely Product Direction

### Phase 8A: Private learner goals

Add a lightweight goal model for private learners.

Examples:

- build confidence in journal writing
- improve HSK 2 reading
- fix repeated tone and word-order mistakes
- prepare for an upcoming exam milestone

This should live primarily inside:

- `Teaching > Private Learners`
- private learner detail

### Phase 8B: Lesson history

Add a small record for completed lesson/check-in outcomes.

Examples:

- lesson date or check-in date
- what was covered
- what the learner should keep practicing
- optional linked assignment or notebook focus

This should feel like lightweight continuity, not a heavy lesson-notes tool.

### Phase 8C: Continuity reporting

Extend reporting so teachers can distinguish:

- private learners with active goals and recent lesson outcomes
- private learners with active plans but no recent continuity
- private learners with repeated follow-up issues
- private learners whose goals are stale or unclear

---

## Why This Should Happen Before Scheduling

Because the next risk is still not “can we book lessons on a calendar?”

It is:

**Does the teacher have enough continuity context to keep a private learner relationship coherent across multiple lessons?**

If HanziBit cannot capture goals and recent lesson outcomes, then scheduling would organize time without organizing teaching.

---

## Recommended Next Step

Turn this into:

- `docs/phase-8-implementation-spec.md`

Then start with:

1. private learner goals
2. lesson/check-in outcome history
3. continuity reporting
