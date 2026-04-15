# Phase 11 Planning

## Objective

Phase 11 should help HanziBit move from private tutoring review and adaptation into a lightweight **teacher strategy and reuse layer**.

By the end of Phase 10, HanziBit already supports:

- private learner lifecycle workflow
- next lesson/check-in planning
- active private learner goals
- short lesson/check-in history
- continuity reporting
- goal progress markers
- repeated issue capture
- intervention-oriented reporting
- private learner review snapshots
- plan adaptation workflow
- adaptation reporting

The next product question is:

**Can a teacher reuse what works across private learners without rebuilding the same response every time?**

Phase 11 should answer that question.

---

## What Phase 11 Is

Phase 11 is the **teacher strategy and reuse layer**.

It should help teachers:

- turn recurring tutoring adjustments into reusable patterns
- save lightweight intervention/adaptation playbooks
- reuse those playbooks across similar private learners
- reduce repetitive admin when the same goal or issue pattern appears again

It should build on:

- teacher library and templates
- private learner goals
- lesson/check-in history
- intervention reporting
- review snapshots
- plan adaptation workflow

It should not replace those systems.

---

## What Phase 11 Is Not

Phase 11 should **not** become:

- an AI-generated tutoring engine
- a full curriculum authoring platform
- a CRM or automation builder
- a messaging system
- a public marketplace ranking system
- a formal pedagogy analytics suite

Those are still later, if needed.

---

## Product Outcome

By the end of Phase 11, HanziBit should support this tutoring loop:

1. the teacher sees a recurring learner problem or adaptation pattern
2. the teacher can save that response as a reusable strategy
3. the teacher can apply that strategy to another private learner or next lesson plan
4. the app can show which strategies are being reused and where
5. the teacher workspace becomes faster and less repetitive over time

That would shift HanziBit from supporting adaptation per learner to supporting **reusable tutoring judgment**.

---

## Suggested Structure

Phase 11 should be split into three internal tracks:

1. **Phase 11A: tutoring strategies / playbooks**
2. **Phase 11B: apply strategy into live private learner workflow**
3. **Phase 11C: strategy reuse visibility**

Recommended order:

1. save lightweight strategies
2. apply them into goals / next lesson planning
3. report where reuse is happening

Current starting point:

- Phase 10 web is effectively implemented
- teachers can already review learners and adapt live plans
- the natural next layer is helping teachers reuse effective responses instead of retyping them
- Phase 11 Milestone 1 is now implemented on web:
  - lightweight tutoring strategies exist inside `Teaching > Library`
  - teachers can create, list, and edit strategy records
  - strategies can link to existing assignment templates and teacher resources
- Phase 11 Milestone 2 is now implemented on web:
  - teachers can apply saved strategies inside `Teaching > Private Learners`
  - strategy application stamps the live private learner and lesson-plan workflow
  - recent strategy context now appears in private learner and private classroom surfaces
- Phase 11 Milestone 3 is now implemented on web:
  - `Teaching > Reporting` now shows strategy reuse visibility
  - reporting can distinguish learners with no strategy use from learners with active strategy gaps
  - strategy context now appears directly inside private learner reporting rows
- Phase 11 polish is now implemented on web:
  - `Teaching > Overview` now surfaces strategy reuse and strategy-gap pressure
  - `Teaching > Private Learners` now explains when a strategy should be applied, not just whether one exists
  - private classroom tutoring cards now distinguish between strategy continuity and strategy opportunity more clearly

---

## Core Product Rules

### 1. Keep strategies lightweight

The first version should not require large lesson plans or formal pedagogy artifacts.

It should favor:

- short strategy titles
- issue or goal focus
- short “what to do next” guidance
- optional template / assignment linkage

### 2. Strategy must connect to live workflow

Phase 11 should tie directly into:

- private learner goals
- next lesson planning
- assignment/template selection
- intervention and review context

It should not become a disconnected resource shelf.

### 3. Optimize for reuse, not abstraction

The main value is:

- the teacher can reuse a response pattern quickly
- the teacher can adapt from a known starting point
- the app remembers what was applied where

### 4. Reporting should show strategic reuse

Phase 11 reporting should help answer:

- Which strategies are used repeatedly?
- Which private learners are still managed ad hoc?
- Which recurring issue patterns do not yet have a reusable strategy?

---

## In Scope

- teacher tutoring strategies / playbooks
- strategy application into private learner workflow
- basic reuse visibility

---

## Out Of Scope

- AI-generated strategies
- automatic assignment generation
- learner-facing strategy views
- messaging automations
- public teacher benchmarking

---

## Likely Product Direction

### Phase 11A: Tutoring strategies

Add a lightweight reusable teacher strategy record.

Examples:

- “Tone accuracy reset”
- “Homework consistency reset”
- “Confidence-first writing week”

This should live primarily inside:

- `Teaching > Library`
- possibly a new library subtype or strategy area

### Phase 11B: Apply strategy

Let the teacher apply a strategy directly into a private learner workflow:

- prefill next lesson focus
- prefill before-lesson expectation
- optionally point to an assignment template
- optionally update a goal note or adaptation note

This should live primarily inside:

- `Teaching > Private Learners`
- private learner detail

### Phase 11C: Reuse visibility

Extend reporting so teachers can distinguish:

- reusable patterns already saved
- strategies actively in use
- recurring issues that still do not map to a saved strategy

---

## Why This Should Happen Before Automation Or Scheduling

Because the next risk is not timing or communication.

It is:

**Does HanziBit help a teacher reuse effective tutoring decisions, or does every learner still require the same manual setup work again and again?**

If HanziBit cannot support that reuse, then more operational tooling would organize work without making the teacher more effective.

---

## Recommended Next Step

Turn this into:

- `docs/phase-11-implementation-spec.md`

Then start with:

1. lightweight tutoring strategies
2. strategy-to-private-learner application
3. reuse reporting
