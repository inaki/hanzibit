# Phase 9 Planning

## Objective

Phase 9 should help HanziBit move from private tutoring continuity into a lightweight **teaching outcomes and intervention loop**.

By the end of Phase 8, HanziBit already supports:

- private learner lifecycle management
- next lesson/check-in planning
- active private learner goals
- short lesson/check-in history
- continuity reporting across plans, goals, and recent history

The next product question is:

**Can a teacher quickly recognize when a private learner is improving, plateauing, or slipping, and adjust the tutoring workflow inside HanziBit without needing a separate tracking tool?**

Phase 9 should answer that question.

---

## What Phase 9 Is

Phase 9 is the **lightweight tutoring outcomes and intervention layer**.

It should help teachers see:

- whether goals are moving forward or getting stuck
- whether repeated lesson issues are recurring
- whether a learner needs reinforcement, adjustment, or escalation
- which private learners need active intervention instead of passive monitoring

It should build on:

- private learner workflow
- next lesson planning
- private learner goals
- lesson/check-in history
- continuity reporting

It should not replace those systems.

---

## What Phase 9 Is Not

Phase 9 should **not** become:

- a formal assessment system
- a gradebook
- a rubric engine
- live messaging or live lesson tooling
- billing or payroll
- a full CRM

Those are still later, if needed.

---

## Product Outcome

By the end of Phase 9, HanziBit should support this teacher loop:

1. a private learner has goals, plans, and recent lesson history
2. the teacher can mark short lesson outcomes or progress signals against those goals
3. the app can surface stuck learners and repeated weak areas
4. reporting can separate:
   - healthy momentum
   - drifting continuity
   - repeated intervention needs
5. the teacher can adapt the next step from within the existing workflow

That would shift HanziBit from continuity tracking into early instructional decision support.

---

## Suggested Structure

Phase 9 should be split into three internal tracks:

1. **Phase 9A: goal progress and intervention markers**
2. **Phase 9B: repeated issue visibility**
3. **Phase 9C: intervention-oriented reporting**

Recommended order:

1. lightweight goal progress markers
2. repeated-issue capture
3. intervention reporting

Current starting point:

- Phase 8 web is effectively implemented
- private learner goals, lesson history, and continuity reporting are in place
- the natural next layer is interpretation and intervention, not more raw history

Current web status:

- Phase 9 planning baseline is defined
- goal progress markers are implemented on web
- repeated issue capture is implemented on web
- intervention-oriented reporting is implemented on web
- teachers can mark active goals as improving, stable, needing reinforcement, or blocked
- teachers can tag lesson/check-in history with repeated issues and a short intervention note
- private learner workflow, private classroom context, and reporting now surface those progress markers
- `Teaching > Reporting` now highlights recurring issues and which private learners need intervention now
- `Teaching > Private Learners` and private classroom tutoring cards now give clearer intervention guidance based on blocked goals, reinforcement pressure, and repeated issues

---

## Core Product Rules

### 1. Keep outcome signals lightweight

Teachers should not have to fill out full evaluations after each lesson.

The first version should favor:

- simple progress markers
- short intervention notes
- a small set of repeated issue categories

### 2. Keep it tied to goals and plans

Phase 9 should stay grounded in:

- current goals
- next lesson planning
- recent lesson/check-in history

It should not create a disconnected analysis layer.

### 3. Optimize for intervention, not record-keeping

The main product value is helping teachers know:

- who needs help now
- what kind of follow-up is needed
- whether a goal should continue, pause, or change

### 4. Reporting should surface action

Phase 9 reporting should help answer:

- Which learners are repeatedly getting stuck?
- Which goals show visible progress?
- Which learners need teacher intervention now?
- Which learners are active but not improving clearly?

---

## In Scope

- lightweight goal progress signals
- simple intervention markers
- repeated issue visibility from lesson/check-in history
- reporting for intervention priority

---

## Out Of Scope

- formal test scores
- grading frameworks
- certification or transcript features
- parent reporting
- public learner progress pages

---

## Likely Product Direction

### Phase 9A: Goal progress and intervention markers

Add small teacher-owned outcome markers for private learner goals.

Examples:

- improving
- stable
- needs reinforcement
- blocked

This should live primarily inside:

- `Teaching > Private Learners`
- private learner detail

### Phase 9B: Repeated issue visibility

Add lightweight issue tags or recurring issue notes to lesson/check-in history.

Examples:

- word order
- tone accuracy
- confidence/speaking hesitation
- incomplete homework follow-through

This should help the teacher notice patterns across check-ins.

### Phase 9C: Intervention reporting

Extend reporting so teachers can distinguish:

- healthy private learners
- drifting private learners
- learners with weak continuity but not yet urgent
- learners who need active intervention now

---

## Why This Should Happen Before Scheduling Or Messaging

Because the next risk is not operational communication.

It is:

**Does the teacher know when a private learner is actually progressing versus merely staying active?**

If HanziBit cannot make that visible, then more operations tooling would organize the relationship without improving instructional clarity.

---

## Recommended Next Step

Turn this into:

- `docs/phase-9-implementation-spec.md`

Then start with:

1. goal progress markers
2. repeated issue capture
3. intervention reporting
