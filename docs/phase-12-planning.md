# Phase 12 Planning

## Objective

Phase 12 should help HanziBit move from private tutoring strategy reuse into a lightweight **strategy effectiveness and refinement layer**.

By the end of Phase 11, HanziBit already supports:

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
- reusable tutoring strategies
- strategy application into live private learner workflow
- strategy reuse reporting

The next product question is:

**Can a teacher tell whether a saved strategy is actually helping private learners, and refine that strategy over time instead of reusing it blindly?**

Phase 12 should answer that question.

---

## What Phase 12 Is

Phase 12 is the **strategy effectiveness and refinement layer**.

It should help teachers:

- see whether a strategy is being reused successfully
- identify strategies that keep being applied without improving learner momentum
- capture lightweight outcomes from strategy use
- refine, retire, or replace strategies based on real tutoring results

It should build on:

- teacher strategies
- strategy application history
- private learner goals
- lesson/check-in history
- review snapshots
- adaptation workflow
- reporting

It should not replace those systems.

---

## What Phase 12 Is Not

Phase 12 should **not** become:

- an AI recommendation engine
- a formal experiment or A/B testing system
- automated pedagogy scoring
- a certification or grading layer
- a generic analytics warehouse
- public teacher ranking based on hidden effectiveness metrics

Those are still later, if needed.

---

## Product Outcome

By the end of Phase 12, HanziBit should support this strategy loop:

1. the teacher applies a saved strategy to a private learner
2. the app preserves enough outcome context to see what happened afterward
3. the teacher can mark whether the strategy helped, needs adjustment, or should be retired
4. reporting can show which strategies are proving useful and which learners still need a different response
5. the strategy library becomes more trustworthy over time

That would shift HanziBit from supporting **strategy reuse** to supporting **strategy refinement**.

---

## Suggested Structure

Phase 12 should be split into three internal tracks:

1. **Phase 12A: lightweight strategy outcome capture**
2. **Phase 12B: strategy refinement inside the library**
3. **Phase 12C: strategy effectiveness reporting**

Recommended order:

1. capture outcome markers after strategy use
2. allow the teacher to refine/archive strategies
3. report strategy effectiveness and weak spots

Current starting point:

- Phase 11 web is effectively implemented
- teachers can already create strategies, apply them, and see reuse/gap signals
- the natural next layer is helping the teacher decide whether the strategy itself is working
- Phase 12 Milestone 1 is now implemented on web:
  - strategy applications support lightweight outcome capture
  - latest strategy outcome context appears in private learner workflow, classroom cards, reporting, and strategy detail
- Phase 12 Milestone 2 is now implemented on web:
  - strategy detail now supports refinement notes and last-refined tracking
  - archive/refine decisions are now informed by visible outcome history
  - strategy detail gives clearer guidance when a strategy should be tightened or replaced
- Phase 12 Milestone 3 is now implemented on web:
  - `Teaching > Reporting` now includes strategy-level effectiveness visibility
  - reporting can distinguish weak strategies from strategies that simply need more outcome capture
  - teachers can now see which strategies are being reused without strong evidence that they help
- Phase 12 polish is now in progress on web:
  - strategy quality signals are being surfaced outside reporting too
  - `Teaching > Overview`, `Teaching > Library`, `Private Learners`, and private classroom tutoring cards are being tightened so weak or evidence-thin strategies are visible where teachers already work

---

## Core Product Rules

### 1. Keep outcome capture lightweight

Teachers should not have to fill out long evaluation forms after each strategy use.

The first version should favor:

- a short outcome marker
- a short refinement note
- optional link to the latest learner review or history context

### 2. Effectiveness must be tied to real learner workflow

Phase 12 should connect to:

- strategy applications
- goal momentum
- lesson/check-in history
- review/adaptation timing

It should not become detached analytics on top of the tutoring workflow.

### 3. Optimize for teacher judgment, not automation

The main value is:

- the teacher can decide whether a strategy helped
- the strategy library becomes easier to trust and improve
- reporting highlights which strategies deserve more attention

### 4. Reporting should show strategy health, not just usage

Phase 12 reporting should help answer:

- Which strategies are repeatedly helping?
- Which strategies are repeatedly followed by blocked or reinforcement pressure?
- Which strategies are being reused without enough evidence that they work?

---

## In Scope

- lightweight outcome markers after strategy application
- teacher refinement notes and archive decisions
- strategy effectiveness reporting

---

## Out Of Scope

- automatic strategy scoring by AI
- learner-facing strategy ratings
- public teacher effectiveness rankings
- auto-retiring or auto-recommending strategies
- messaging or notification automation

---

## Likely Product Direction

### Phase 12A: Strategy outcomes

Add a compact outcome record after strategy use.

Examples:

- helped
- partial help
- no clear change
- replace strategy

This should live primarily inside:

- `Teaching > Private Learners`
- strategy application history

### Phase 12B: Strategy refinement

Let the teacher refine the saved strategy after using it:

- update summary/guidance
- add a refinement note
- archive strategies that no longer fit

This should live primarily inside:

- `Teaching > Library`
- strategy detail

### Phase 12C: Effectiveness reporting

Extend reporting so teachers can distinguish:

- strategies that are being reused with positive momentum
- strategies that appear to stall or misfit learners
- private learners still missing a strong effective strategy path

---

## Why This Should Happen Before Automation Or Recommendation

Because the next risk is not lack of saved strategies.

It is:

**Does the teacher actually know whether a reused strategy is helping, or is HanziBit just preserving reusable habits without feedback on quality?**

If HanziBit cannot support that reflection loop, then later automation would scale patterns before proving they are useful.

---

## Recommended Next Step

Turn this into:

- `docs/phase-12-implementation-spec.md`

Then continue with:

1. strategy outcome capture
2. strategy refinement workflow
3. effectiveness reporting

Turn this into:

- `docs/phase-12-implementation-spec.md`

Then start with:

1. strategy outcome capture
2. strategy refinement flow
3. effectiveness reporting
