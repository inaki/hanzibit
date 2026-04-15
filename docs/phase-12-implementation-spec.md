# Phase 12 Implementation Spec

## Purpose

This document turns Phase 12 into an implementation-ready specification.

It should answer:

- what Phase 12 builds first
- what schema changes are needed
- what permissions apply
- which screens and flows are required
- what order we should implement in

This doc is the bridge between the Phase 12 plan and actual code.

Current implementation status as of April 14, 2026:

- Phase 12 planning baseline is defined
- Milestone 1 is implemented on web
- Milestone 2 is implemented on web
- Milestone 3 is implemented on web
- the web app already has:
  - reusable tutoring strategies
  - strategy application into live private learner workflow
  - strategy reuse reporting
  - private learner goals
  - lesson/check-in history
  - private learner review and adaptation workflow

It complements:

- `docs/phase-12-planning.md`
- `docs/phase-11-implementation-spec.md`
- `docs/implementation-roadmap.md`

---

## Phase 12 Objective

Phase 12 should help teachers understand whether a saved strategy is actually helping.

The practical goal is:

- a strategy gets applied to a private learner
- the teacher can capture a lightweight outcome afterward
- that outcome becomes visible in the learner workflow, strategy detail, and reporting
- later refinement decisions can be based on visible effectiveness, not only reuse count

---

## Phase 12 Structure

Phase 12 should be implemented in three internal tracks:

1. **Phase 12A: strategy outcome capture**
2. **Phase 12B: strategy refinement workflow**
3. **Phase 12C: strategy effectiveness reporting**

Recommended order:

1. capture outcomes
2. refine strategies in the library
3. report effectiveness and weak spots

Current implementation checkpoint:

- strategy outcome capture is now implemented on web
- `Teaching > Private Learners` now supports recording a lightweight outcome on strategy applications
- private learner workflow, private classroom views, strategy detail, and reporting now surface latest strategy outcome context
- strategy refinement workflow is now implemented on web
- `Teaching > Library > Strategy detail` now supports:
  - refinement note editing
  - last refined tracking
  - archive decisions informed by outcome history
  - stronger guidance when outcomes suggest a strategy should be adjusted or replaced
- strategy effectiveness reporting is now implemented on web
- `Teaching > Reporting` now supports:
  - strategy-level effectiveness rows
  - weak strategy visibility
  - no-outcome strategy visibility
  - stronger strategy outcome summary cards
- Phase 12 polish is now in progress on web
- strategy effectiveness context is being pushed into:
  - `Teaching > Overview`
  - `Teaching > Library`
  - `Teaching > Private Learners`
  - private classroom tutoring cards

---

## Core Product Rules

### 1. Keep outcome capture lightweight

Teachers should not need a full review form.

The first version should prefer:

- one compact outcome marker
- one short note
- one recorded date

### 2. Tie outcomes to actual strategy applications

Phase 12 should connect directly to:

- strategy application history
- private learner workflow
- reporting

It should not create free-floating strategy analytics.

### 3. Optimize for teacher judgment

The main value is:

- the teacher can decide whether a strategy helped
- the app preserves that judgment visibly
- later refinement decisions can use that history

### 4. Reporting should show outcome visibility

Phase 12 reporting should help answer:

- which strategy applications have outcomes recorded
- which strategies are helping
- which strategies still need follow-through

---

## Scope

### Included

- one lightweight outcome per strategy application
- latest outcome visibility in private learner workflow
- latest outcome visibility in strategy detail
- reporting summary for strategy outcome coverage

### Excluded

- multi-step strategy evaluation
- automatic effectiveness scoring
- learner-facing strategy outcome views
- recommendation or automation logic

---

## Roles And Permissions

### Teacher can

- record or update an outcome for a strategy application they made within their own private learner workflow
- view strategy outcome context on their own strategies and private learners

### Teacher cannot

- record outcomes for another teacher’s strategy applications
- view another teacher’s strategy effectiveness data

### Learner can

- indirectly benefit from a better-refined tutoring strategy

### Learner cannot

- see private teacher strategy outcomes directly
- edit strategy outcome records

### Recommended permission helpers

- `canRecordTeacherStrategyOutcome(userId, strategyApplicationId)`

---

## Data Model

## Group 1: Strategy outcome records

### Table: `private_student_strategy_outcomes`

Recommended fields:

- `id TEXT PRIMARY KEY`
- `strategy_application_id TEXT NOT NULL UNIQUE REFERENCES private_student_strategy_applications(id) ON DELETE CASCADE`
- `private_student_id TEXT NOT NULL REFERENCES private_students(id) ON DELETE CASCADE`
- `teacher_strategy_id TEXT NOT NULL REFERENCES teacher_strategies(id) ON DELETE CASCADE`
- `teacher_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE`
- `outcome_status TEXT NOT NULL CHECK(outcome_status IN ('helped', 'partial', 'no_change', 'replace'))`
- `outcome_note TEXT`
- `recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Purpose:

- capture one lightweight effectiveness judgment per strategy application

Recommendation:

- keep this one-to-one with the strategy application in V1
- allow updates instead of modeling multi-step revisions yet

---

## Screens And Flows

### 1. `Teaching > Private Learners > Detail`

Required:

- strategy application history
- per-application outcome capture form
- latest outcome visible in summary cards

### 2. Private classroom card

Required:

- latest strategy outcome context when a strategy has been applied

### 3. `Teaching > Reporting`

Required:

- top summary cards for strategy outcomes
- row-level latest outcome context in private learner activity

### 4. `Teaching > Library > Strategy detail`

Required:

- lightweight outcome rollup
- latest strategy outcome context

---

## Milestones

### Milestone 1: strategy outcome capture

Build:

- `private_student_strategy_outcomes`
- helper module
- permission check
- teacher action
- private learner UI
- latest outcome visibility in reporting and strategy detail

Status:

- implemented on web

### Milestone 2: strategy refinement workflow

Build:

- refinement notes or refinement history
- clearer strategy archive/replace flow
- stronger strategy detail editing around outcomes

Status:

- implemented on web

### Milestone 3: strategy effectiveness reporting

Build:

- stronger helped vs weak strategy rollups
- strategy-level reporting by outcome pattern
- identify overused strategies with weak outcomes

Status:

- implemented on web

---

## Ready To Implement

Phase 12 Milestone 1 is now implemented enough to serve as the base for the next step.

The next concrete move is:

1. Phase 12’s main implementation loop is now complete on web
2. the next step is a Phase 12 polish pass before planning Phase 13
