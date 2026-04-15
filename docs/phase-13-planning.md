# Phase 13 Planning

## Objective

Phase 13 should help HanziBit move from individual **strategy effectiveness** into a lightweight **teacher playbook and escalation layer**.

By the end of Phase 12, HanziBit already supports:

- reusable tutoring strategies
- strategy application inside private learner workflow
- strategy reuse reporting
- lightweight strategy outcome capture
- strategy refinement notes and archive flow
- strategy effectiveness reporting
- weak strategy visibility across reporting and workflow surfaces

The next product question is:

**Can a teacher turn what works repeatedly into a more stable operating playbook, and can the app make it obvious when a learner needs that playbook-level response instead of another isolated tactic?**

Phase 13 should answer that question.

---

## What Phase 13 Is

Phase 13 is the **teacher playbook and escalation layer**.

It should help teachers:

- group effective strategies into lightweight repeatable playbooks
- define when a playbook should be used
- recognize when a learner has moved beyond one-off intervention and needs a more structured response
- see which learners are being handled ad hoc versus through a deliberate support pattern

It should build on:

- teacher strategies
- strategy outcomes
- strategy refinement
- private learner workflow
- intervention reporting

It should not replace those systems.

---

## What Phase 13 Is Not

Phase 13 should **not** become:

- a full curriculum engine
- automatic tutoring automation
- a rigid clinical intervention framework
- learner-visible support plans
- AI-generated pedagogy prescriptions
- a scheduling or notification system

Those still belong later, if needed.

---

## Product Outcome

By the end of Phase 13, HanziBit should support this loop:

1. the teacher notices a recurring pattern across learners or repeated strategy usage
2. the teacher groups one or more strategies into a lightweight playbook
3. the teacher can apply that playbook to a private learner when the learner shows the matching pressure
4. reporting can show which learners are still unmanaged, which are on a playbook, and which playbooks seem overused or underperforming
5. the teacher library becomes more operational, not just descriptive

That would shift HanziBit from supporting **better strategies** to supporting **repeatable teaching responses**.

---

## Suggested Structure

Phase 13 should be split into three internal tracks:

1. **Phase 13A: teacher playbook records**
2. **Phase 13B: playbook application inside private learner workflow**
3. **Phase 13C: playbook escalation reporting**

Recommended order:

1. create lightweight playbooks
2. apply them to private learners
3. report unmanaged pressure, playbook usage, and escalation gaps

Current starting point:

- Phase 12 web is effectively implemented
- teachers can already see strategy quality, weak strategies, and no-outcome strategies
- the natural next layer is helping them combine good strategy judgment into stable teaching patterns
- Phase 13 Milestone 1 is now implemented on web:
  - `Teaching > Library` now includes lightweight playbook records
  - playbooks can link existing strategies
  - playbooks have their own detail/edit flow
- Phase 13 Milestone 2 is now implemented on web:
  - playbooks can be applied inside `Teaching > Private Learners`
  - private learner workflow now shows current playbook context and playbook history
  - private classroom tutoring cards now show structured playbook support when present
- Phase 13 Milestone 3 is now implemented on web:
  - `Teaching > Reporting` now distinguishes no-playbook learners from playbook-guided learners
  - reporting now shows playbook gaps where learner pressure exists without structured support
  - playbook usage is now visible alongside the existing strategy layer

---

## Core Product Rules

### 1. Keep playbooks lightweight

The first version should not try to model full lesson sequences.

The playbook should stay compact:

- title
- summary
- issue focus
- optional linked strategies
- “when to use this” guidance

### 2. Playbooks should sit above strategies, not replace them

Strategies remain the atomic response unit.

Playbooks should:

- reference strategies
- suggest a reusable response pattern
- give the teacher a stable frame for repeated support

### 3. Escalation should stay teacher-driven

The app can highlight:

- repeated blocked goals
- recurring issue pressure
- weak strategy evidence

But the teacher should still decide:

- whether to apply a playbook
- whether to change the learner’s support direction

### 4. Reporting should distinguish ad hoc vs structured support

Phase 13 reporting should help answer:

- Which private learners are still being managed ad hoc?
- Which playbooks are actually being used?
- Which playbooks are attached to learners with persistent pressure?

---

## In Scope

- lightweight teacher playbooks in the library
- playbook application to private learners
- playbook-aware reporting and escalation visibility

---

## Out Of Scope

- multi-week curriculum plans
- automation of learner messaging
- teacher notifications
- learner-facing playbook views
- AI-generated playbooks
- public marketplace exposure of teaching methods

---

## Likely Product Direction

### Phase 13A: Playbooks

Add a playbook layer in `Teaching > Library`.

Examples:

- tone recovery playbook
- homework follow-through playbook
- confidence rebuild playbook
- reading support playbook

This should stay close to the current strategy system and reuse the same mental model.

### Phase 13B: Private learner application

Allow a teacher to attach a playbook to a private learner when:

- recurring issue pressure persists
- goals are blocked repeatedly
- one-off strategies are no longer enough

This should live primarily inside:

- `Teaching > Private Learners`
- private learner detail
- private classroom support cards

### Phase 13C: Reporting

Extend reporting so it can distinguish:

- pressure with no playbook
- playbook in use
- playbook in use but still weak
- overused or stale playbooks

---

## Why This Should Happen Before Automation Or Scheduling

HanziBit still benefits more from **better teacher operating structure** than from new delivery mechanics.

Before adding:

- notifications
- scheduling
- nudges
- automated workflows

the app should first help teachers create **repeatable support patterns** they actually trust.

Phase 13 does that.
