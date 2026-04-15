# Phase 7 Planning

## Objective

Phase 7 should make HanziBit’s private tutoring relationships easier to sustain over time by adding a lightweight recurring lesson and cadence layer.

By the end of Phase 6, HanziBit already supports:

- public teacher profiles and discovery
- learner inquiries
- inquiry-to-private-classroom conversion
- tutoring setup defaults
- learner onboarding and first next steps
- private learner lifecycle tracking
- teacher-managed next-step workflow
- private learner reporting and stalled-relationship visibility

The next product question is:

**Can ongoing private tutoring relationships stay organized week after week without forcing teachers to leave HanziBit for basic planning?**

Phase 7 should answer that question.

---

## What Phase 7 Is

Phase 7 is the **lightweight tutoring cadence and session-planning layer**.

It should help teachers manage recurring private work by making it easier to define:

- the expected teaching rhythm
- the next planned lesson or check-in
- the intended focus for the next session
- session follow-through after work is reviewed

It should still rely on:

- private classrooms
- assignments
- notebook work
- teacher setup
- private learner workflow
- reporting

It should not replace those systems.

---

## What Phase 7 Is Not

Phase 7 should **not** become:

- a full scheduling engine
- Google Calendar sync
- Zoom or live video delivery
- in-app messaging/chat
- payments for private sessions
- an availability marketplace with time-slot booking

Those still come later, if they are needed at all.

---

## Product Outcome

By the end of Phase 7, HanziBit should support this private tutoring path:

1. learner discovers teacher
2. learner becomes a private classroom
3. onboarding happens
4. teacher manages ongoing private learner state
5. teacher can define the next planned lesson/check-in
6. teacher can connect assignments and notebook work to that planned cadence
7. reporting can show whether the relationship has an upcoming plan, is in motion, or is drifting

That would turn the current “operations after onboarding” layer into a more durable ongoing teaching workflow.

---

## Suggested Structure

Phase 7 should be split into three internal tracks:

1. **Phase 7A: tutoring cadence settings**
2. **Phase 7B: session planning and follow-through**
3. **Phase 7C: cadence reporting**

Recommended order:

1. cadence defaults
2. lightweight session planning
3. reporting on planned vs drifting private learners

Current web status:

- cadence defaults are implemented in `Teaching > Setup`
- each private learner can now carry a dedicated next lesson/check-in plan
- teachers can manage those plans from `Teaching > Private Learners`
- learners can see the next lesson summary inside their private classroom
- `Teaching > Reporting` now distinguishes missing next plans, overdue plans, and unsupported plans
- the `Teaching` overview and private learner list now surface cadence health directly, not only the reporting page

---

## Core Product Rules

### 1. Planning should stay tied to classroom work

Session planning should lead back into:

- assignments
- notebook prompts
- review and feedback

Phase 7 should not create a separate lesson-planning product detached from actual work inside HanziBit.

### 2. The first version should be lightweight

Teachers mostly need:

- a next lesson focus
- a target date or timeframe
- a short plan note
- an optional linked assignment/template

They do not need:

- a full weekly calendar
- recurring event automation
- student messaging threads

### 3. Every private learner should have visible momentum

At any moment, a teacher should be able to tell:

- whether a next lesson is planned
- what the next focus is
- whether the learner has work before that lesson
- whether the relationship has gone quiet

### 4. Reporting should remain action-oriented

Phase 7 reporting should help answer:

- Which private learners have no next plan?
- Which learners have an overdue follow-up?
- Which lessons are planned but unsupported by assignments?
- Which private learners are active but drifting?

---

## In Scope

- teacher-level tutoring cadence defaults
- per-private-learner next lesson / next check-in planning
- optional planned date or target week
- lesson focus notes
- optional link from lesson plan to assignment/template
- cadence reporting for planned vs drifting learners

---

## Out Of Scope

- live calendar integrations
- public booking pages with time slots
- session reminders by email/SMS
- live lesson delivery
- real-time messaging
- tutoring billing / session payments

---

## Likely Product Direction

### Phase 7A: Tutoring cadence settings

Add teacher defaults for how private tutoring usually runs.

Examples:

- weekly
- twice weekly
- flexible / async support
- target session length
- preferred lesson structure notes

This should extend `Teaching > Setup`, not create a totally separate area.

### Phase 7B: Session planning and follow-through

Teachers should be able to define the next planned lesson or check-in for a private learner.

Examples:

- target date
- lesson focus note
- linked assignment or template
- “before next lesson” expectation

This should work from:

- `Teaching > Private Learners`
- the private learner detail page
- optionally the private classroom page

### Phase 7C: Cadence reporting

Extend reporting so teachers can distinguish:

- private learners with a clear next lesson plan
- private learners with no next plan
- private learners with overdue follow-up
- private learners whose plan exists but no assignment/work is attached

---

## Why This Should Happen Before Full Scheduling

Because the bigger product risk is still not “can users book time slots?”

It is:

**Do private teacher-learner relationships have enough structure to continue inside HanziBit week after week?**

If the product cannot support recurring rhythm and simple planning, then full calendar integrations would add complexity before the underlying workflow is strong enough.

---

## Recommended Next Step

Turn this into:

- `docs/phase-7-implementation-spec.md`

Then start with:

1. cadence defaults in teacher setup
2. per-private-learner next lesson planning
3. cadence reporting

Current web status as of April 14, 2026:

- Phase 7 planning baseline is defined
- Milestone 1 is implemented
- Milestone 2 is implemented
- Milestone 3 is implemented
- cadence defaults are intentionally lightweight and do not introduce scheduling or booking
- Phase 7 web is now functionally complete enough to pause and treat as the baseline for future polish/mobile parity
- the next recommended step is Phase 8 planning
