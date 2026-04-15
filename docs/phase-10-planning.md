# Phase 10 Planning

## Objective

Phase 10 should help HanziBit move from private tutoring intervention into a lightweight **teacher-facing review and adaptation layer**.

By the end of Phase 9, HanziBit already supports:

- private learner lifecycle workflow
- next lesson/check-in planning
- active private learner goals
- short lesson/check-in history
- continuity reporting
- goal progress markers
- repeated issue capture
- intervention-oriented reporting

The next product question is:

**Can a teacher look back across recent private tutoring work, quickly adapt goals and next steps, and keep the learner plan coherent without falling into manual admin work?**

Phase 10 should answer that question.

---

## What Phase 10 Is

Phase 10 is the **teacher review and adaptation layer**.

It should help teachers:

- review the recent state of a private learner in one place
- identify what should change now
- carry those adjustments into goals, next lesson plans, and current assignments
- keep the tutoring workflow adaptive instead of static

It should build on:

- private learners
- next lesson planning
- goals
- lesson/check-in history
- intervention reporting

It should not replace those systems.

---

## What Phase 10 Is Not

Phase 10 should **not** become:

- a full scheduler
- a CRM
- a messaging layer
- a formal assessment/gradebook system
- automated curriculum generation
- billing or payroll

Those are still later, if needed.

---

## Product Outcome

By the end of Phase 10, HanziBit should support this tutoring loop:

1. the teacher can see recent learner continuity and intervention state
2. the teacher can review that state in one compact workflow
3. the teacher can update goals, issue focus, and next lesson direction from that same review context
4. the app can show whether the learner’s plan has been adapted recently or is going stale
5. reporting can distinguish not only who needs intervention, but whose plan has not yet been adapted

That would shift HanziBit from spotting problems to helping teachers act on them coherently.

---

## Suggested Structure

Phase 10 should be split into three internal tracks:

1. **Phase 10A: private learner review snapshots**
2. **Phase 10B: plan adaptation workflow**
3. **Phase 10C: adaptation reporting**

Recommended order:

1. learner review snapshot
2. adaptation workflow
3. reporting for stale or unadapted learners

Current starting point:

- Phase 9 web is effectively implemented
- teachers can already see goals, history, recurring issues, and intervention pressure
- the natural next layer is helping the teacher adapt the plan, not merely observe it

---

## Core Product Rules

### 1. Keep review lightweight

Teachers should not have to write long formal summaries.

The first version should favor:

- a short review note
- a visible “what changed” record
- simple carry-forward controls

### 2. Adaptation must change the live workflow

Phase 10 should tie directly into:

- goals
- next lesson planning
- current assignment direction
- intervention notes

It should not create a disconnected retrospective log.

### 3. Optimize for action

The main value is:

- the teacher can decide what to change
- the learner’s visible plan updates accordingly
- the app can show which private learners have stale plans

### 4. Reporting should show adaptation health

Phase 10 reporting should help answer:

- Which learners have intervention signals but no recent plan adjustment?
- Which learners were reviewed and adapted recently?
- Which learners have stale goals or stale lesson focus despite active tutoring?

---

## In Scope

- private learner review snapshot
- short adaptation note
- quick carry-forward updates into goals/lesson plan
- reporting for adaptation freshness

---

## Out Of Scope

- formal reviews or grading
- parent-facing summaries
- learner-facing change history feed
- scheduling/calendar sync
- messaging

---

## Likely Product Direction

### Phase 10A: Review snapshots

Add a compact teacher review record for a private learner.

Examples:

- what improved
- what remains weak
- what changes next

This should live primarily inside:

- `Teaching > Private Learners`
- private learner detail

### Phase 10B: Plan adaptation workflow

Let the teacher apply review outcomes into the live workflow:

- update goal progress
- adjust or replace the next lesson focus
- change linked assignment or template
- refresh intervention focus

### Phase 10C: Adaptation reporting

Extend reporting so teachers can distinguish:

- learners with current intervention signals and no recent adaptation
- learners whose plan was reviewed and updated recently
- learners with stale goals or stale next-step focus

---

## Why This Should Happen Before Scheduling Or Messaging

Because the next risk is not operational communication.

It is:

**Does the teacher have a lightweight way to translate observation into a changed tutoring plan?**

If HanziBit cannot support that, then more operational tooling would organize the relationship without making tutoring more adaptive.

---

## Recommended Next Step

Turn this into:

- `docs/phase-10-implementation-spec.md`

Then start with:

1. private learner review snapshots
2. adaptation workflow
3. adaptation reporting
