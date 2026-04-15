# Phase 6 Planning

## Objective

Phase 6 should make HanziBit’s teacher-learner relationships more operationally useful without turning the product into a full scheduling or communications platform too early.

By the end of Phase 5, HanziBit already supports:

- public teacher profiles and discovery
- learner inquiries
- inquiry-to-private-classroom conversion
- reusable teacher templates and resources
- tutoring setup defaults
- learner onboarding and next steps after conversion
- reporting on converted private learners and follow-through

The next product question is:

**How do private teaching relationships stay active and structured after the first conversion and onboarding step?**

Phase 6 should answer that question.

---

## What Phase 6 Is

Phase 6 is the **private teaching operations layer after onboarding**.

It should help teachers manage ongoing private learners by making the post-conversion relationship easier to maintain.

That means:

- clearer private student status
- recurring follow-through structure
- simple next-step management for active private learners
- better teacher visibility into who is active, stalled, or drifting

It should still rely on:

- classrooms
- assignments
- notebook work
- teacher reporting

It should not replace those systems.

---

## What Phase 6 Is Not

Phase 6 should **not** become:

- a scheduling engine
- a calendar sync product
- in-app chat
- video lesson infrastructure
- a full marketplace operations system
- tutoring payroll or Connect payouts

Those are still later.

---

## Product Outcome

By the end of Phase 6, HanziBit should support this private tutoring path:

1. learner discovers teacher
2. learner sends inquiry
3. teacher converts inquiry into a private classroom
4. learner completes onboarding
5. teacher can manage the ongoing private relationship with lightweight structure
6. the app can identify:
   - active private learners
   - learners who need follow-up
   - learners who are inactive or stalled

That would turn the current “discovery + conversion” layer into a more durable private tutoring workflow.

---

## Suggested Structure

Phase 6 should be split into three internal tracks:

1. **Phase 6A: private learner lifecycle**
2. **Phase 6B: next-step and follow-up workflow**
3. **Phase 6C: private tutoring activity reporting**

Recommended order:

1. private learner lifecycle state
2. teacher next-step workflow
3. deeper activity reporting

---

## Core Product Rules

### 1. Keep the classroom as the working surface

Private tutoring should still happen through:

- classroom membership
- assignments
- notebook work
- review and feedback

Phase 6 should not invent a separate tutoring system outside those surfaces.

### 2. Optimize for continuity, not complexity

The main job of Phase 6 is to help the teacher maintain momentum after onboarding.

That means adding:

- lightweight learner states
- next-step prompts
- follow-up structure

Not:

- a complicated CRM
- multi-stage pipelines
- open-ended communications tooling

### 3. Every private learner should have a visible “what next?”

At any moment, a teacher should be able to tell:

- what this learner is working on
- whether they are waiting for feedback
- whether they need a next assignment
- whether they have gone inactive

### 4. Reporting should stay action-oriented

Phase 6 reporting should not just count relationships.

It should help answer:

- Who needs my attention?
- Who needs a new next step?
- Who has not responded after onboarding?
- Which private learners are active versus stalled?

---

## In Scope

- private learner status model
- lightweight follow-up states
- teacher-side “next step” workflow for private learners
- clearer active / stalled / inactive signals
- private learner summary cards
- follow-up reporting

---

## Out Of Scope

- lesson scheduling
- calendar sync
- live video lessons
- in-app messaging
- public ratings and reviews
- payment operations for tutoring sessions

---

## Likely Product Direction

### Phase 6A: Private learner lifecycle

Add a lightweight model for private learners created from inquiry conversion.

Possible states:

- `onboarding`
- `active`
- `awaiting_teacher`
- `awaiting_student`
- `inactive`

This does not need to be a complex workflow engine. It should be a simple operational status layer that helps teachers organize private students.

### Phase 6B: Next-step workflow

Teachers should be able to set or update the learner’s next step from inside the private classroom or reporting views.

Examples:

- assign the next journal prompt
- ask for revision
- assign a study guide task
- mark “waiting on student”

This should integrate with the existing assignment and classroom system instead of creating parallel flows.

### Phase 6C: Private tutoring activity reporting

Extend reporting so teachers can distinguish:

- newly converted learners
- onboarded but inactive learners
- active learners with current momentum
- learners waiting for teacher attention
- learners waiting on a new assignment

---

## Why This Should Happen Before Scheduling

Because the bigger product risk is still not “can we book lessons?”

It is:

**Do teacher-student relationships remain active inside HanziBit after the first inquiry and onboarding?**

If that relationship layer is weak, then scheduling and live-lesson infrastructure would add operational complexity before the core retention loop is strong enough.

---

## Recommended Next Step

Turn this into:

- `docs/phase-6-implementation-spec.md`

Then start with:

1. schema for private learner lifecycle
2. teacher-side private learner summary view
3. lightweight next-step controls

Current web status as of April 14, 2026:

- Milestone 1 is implemented
- Milestone 2 is implemented
- Milestone 3 is implemented
- a practical polish pass is implemented
- learner-facing and teacher-facing private tutoring status cues are now clearer on web
- Phase 6 web is now in a good place to pause
- `Teaching > Private Learners` now gives teachers a dedicated lifecycle workflow
- reporting now distinguishes private learners who are awaiting teacher action, awaiting student action, inactive, or stalled
- the next recommended step is Phase 6 polish and closeout
