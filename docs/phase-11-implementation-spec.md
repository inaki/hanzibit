# Phase 11 Implementation Spec

## Purpose

This document turns Phase 11 into an implementation-ready specification.

It should answer:

- what Phase 11 builds first
- what schema changes are needed
- what permissions apply
- which screens and flows are required
- what order we should implement in

This doc is the bridge between the Phase 11 plan and actual code.

Current implementation status as of April 14, 2026:

- Phase 11 planning baseline is defined
- Milestone 1 is implemented on web
- Milestone 2 is implemented on web
- Milestone 3 is implemented on web
- a first polish pass is implemented on web
- the web app already has:
  - reusable teacher resources and assignment templates
  - private learner lifecycle workflow
  - next lesson/check-in planning
  - private learner goals
  - lesson/check-in history
  - continuity reporting
  - goal progress markers
  - repeated issue capture
  - intervention-oriented reporting
  - private learner review snapshots
  - plan adaptation workflow
  - adaptation reporting

It complements:

- `docs/phase-11-planning.md`
- `docs/phase-10-implementation-spec.md`
- `docs/product-evolution-strategy.md`
- `docs/implementation-roadmap.md`

---

## Phase 11 Objective

Phase 11 should help teachers reuse tutoring responses that already work.

The practical goal is:

- a teacher already has intervention and adaptation context for one private learner
- the teacher can save a lightweight strategy or playbook from that context
- the teacher can apply that strategy to another private learner without rebuilding the same response from scratch
- reporting can show whether tutoring strategy reuse is happening or whether the teacher is still working ad hoc

Phase 11 should build on:

- teacher library and templates
- private learner goals
- lesson/check-in history
- review snapshots
- adaptation workflow
- private learner reporting

---

## Phase 11 Structure

Phase 11 should be implemented in three internal tracks:

1. **Phase 11A: lightweight tutoring strategies**
2. **Phase 11B: strategy application into private learner workflow**
3. **Phase 11C: strategy reuse reporting**

Recommended order:

1. save strategies
2. apply strategies in live workflow
3. report reuse and gaps

Current implementation checkpoint:

- lightweight tutoring strategies are now implemented on web
- `Teaching > Library` now includes:
  - strategy list
  - strategy creation
  - strategy detail/edit flow
- strategies can optionally link to existing assignment templates and teacher resources
- strategy application into live private learner workflow is now implemented on web
- `Teaching > Private Learners` now supports:
  - applying a strategy to a private learner
  - recording the application
  - updating the live lesson plan from that strategy
- private learner lists and private classroom tutoring cards now show recent strategy context
- strategy reuse reporting is now implemented on web
- `Teaching > Reporting` now distinguishes:
  - strategies used
  - learners with no strategy applied yet
  - learners with active strategy gaps despite intervention pressure
- strategy polish is now implemented on web
- `Teaching > Overview` now includes strategy reuse/gap visibility
- `Teaching > Private Learners` now includes stronger strategy guidance on list and detail views
- private classroom tutoring cards now show clearer strategy continuity copy

---

## Core Product Rules

### 1. Keep strategies lightweight

Teachers should not have to author full lesson plans or formal intervention documents.

The first version should prefer:

- short strategy title
- issue or goal focus
- short guidance on what to do next
- optional linked assignment template
- optional linked teacher resource

### 2. Strategy must connect to live workflow

Phase 11 should tie directly into:

- private learner goals
- next lesson/check-in plan
- assignment and template selection
- review and adaptation context

It should not become a disconnected strategy shelf.

### 3. Optimize for reuse, not abstraction

The main value is:

- the teacher can reuse a known-good response pattern quickly
- the teacher can start from a strategy and still adapt it for one learner
- the app can show where strategies are in active use

### 4. Reporting should show reuse and gaps

Phase 11 reporting should help answer:

- Which strategies are used repeatedly?
- Which private learners are still managed ad hoc?
- Which recurring issues do not yet map to a saved strategy?

### 5. Keep it inside the `Teaching` workspace

Preferred placement:

- `Teaching > Library`
- `Teaching > Private Learners`
- `Teaching > Reporting`

The strategy layer should feel like part of the existing teacher workflow, not a new product area.

---

## Scope

### Included

- lightweight tutoring strategies / playbooks
- strategy application into private learner workflow
- reporting for strategy reuse visibility

### Excluded

- AI-generated strategies
- automatic learner-facing strategy feeds
- automated assignment generation
- messaging automations
- public marketplace strategy ranking

---

## Roles And Permissions

### Teacher can

- create and update their own tutoring strategies
- apply their own strategies to their own private learners
- view strategy reuse reporting for their own private learners

### Teacher cannot

- modify another teacher’s strategies
- view another teacher’s strategy reuse reporting

### Learner can

- indirectly benefit from strategy application through updated goals, plans, and assignments

### Learner cannot

- view private teacher strategy records directly
- edit strategy application state

### Recommended permission helpers

- `canManageTeacherStrategy(userId, strategyId)`
- `canApplyTeacherStrategy(userId, privateStudentId, strategyId)`
- `canViewTeacherStrategyReporting(userId)`

Recommendation:

- extend the current teacher/library/private-learner permission pattern instead of introducing a separate admin system

---

## Data Model

Phase 11 should add a lightweight strategy layer and a lightweight application record.

## Group 1: strategy records

### Table: `teacher_strategies`

Recommended fields:

- `id UUID PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE`
- `title TEXT NOT NULL`
- `summary TEXT NOT NULL`
- `issue_focus TEXT`
- `goal_focus TEXT`
- `guidance TEXT`
- `linked_template_id UUID REFERENCES assignment_templates(id) ON DELETE SET NULL`
- `linked_resource_id UUID REFERENCES teacher_resources(id) ON DELETE SET NULL`
- `usage_count INTEGER NOT NULL DEFAULT 0`
- `is_archived BOOLEAN NOT NULL DEFAULT FALSE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Purpose:

- capture a reusable tutoring response pattern in teacher-owned form

Recommendation:

- do not over-normalize issue types in V1
- keep issue and goal focus as flexible text

## Group 2: strategy application records

### Table: `private_student_strategy_applications`

Recommended fields:

- `id UUID PRIMARY KEY`
- `private_student_id UUID NOT NULL REFERENCES private_students(id) ON DELETE CASCADE`
- `teacher_strategy_id UUID NOT NULL REFERENCES teacher_strategies(id) ON DELETE CASCADE`
- `applied_by_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE`
- `applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `application_note TEXT`
- `linked_review_id UUID REFERENCES private_student_reviews(id) ON DELETE SET NULL`
- `linked_lesson_plan_id UUID REFERENCES private_lesson_plans(id) ON DELETE SET NULL`
- `linked_goal_id UUID REFERENCES private_student_goals(id) ON DELETE SET NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Purpose:

- record that a strategy was actually used in a live private learner workflow

Recommendation:

- keep this append-only in V1
- do not try to model every downstream side effect separately

## Group 3: lightweight lifecycle markers

### Table: `private_students`

Recommended additive fields:

- `last_strategy_applied_at TIMESTAMPTZ`
- `last_strategy_id UUID REFERENCES teacher_strategies(id) ON DELETE SET NULL`

Purpose:

- support fast reporting and visible recent strategy context on private learner surfaces

Recommendation:

- derive detail from application rows
- store only the latest markers on `private_students`

---

## Screen Map

### 1. `Teaching > Library`

Add a lightweight strategy section:

- list strategies
- create strategy
- edit/archive strategy
- show linked template/resource context

### 2. `Teaching > Private Learners`

On private learner detail:

- show available strategies
- let teacher apply one into the live learner workflow
- show recent strategy applications

### 3. `Teaching > Reporting`

Extend reporting with:

- strategies in use
- private learners with no strategy usage
- recurring issue pressure without a mapped strategy

### 4. Private classroom summary

Show only summary context:

- latest applied strategy
- date applied
- optional teacher-facing note if needed

Do not expose the full strategy library here.

---

## Flow Specs

## Flow 1: create a strategy

1. Teacher opens `Teaching > Library`.
2. Teacher creates a strategy with:
   - title
   - summary
   - issue or goal focus
   - optional linked template/resource
3. Strategy is saved to the teacher’s library.

Expected result:

- the teacher now has a reusable playbook that can be applied later

## Flow 2: apply a strategy to a private learner

1. Teacher opens `Teaching > Private Learners > [Learner]`.
2. Teacher selects a strategy.
3. App applies strategy into the current workflow:
   - prefill or update lesson focus
   - optionally set linked assignment/template
   - optionally update one goal note or progress context
4. App records a strategy application row.

Expected result:

- the learner’s live plan reflects a reusable strategy
- reporting can later see that reuse happened

## Flow 3: review strategy reuse

1. Teacher opens `Teaching > Reporting`.
2. Teacher sees:
   - strategies most in use
   - private learners with no strategy applied recently
   - recurring issue pressure with no mapped strategy

Expected result:

- the teacher can identify what is reusable and what is still ad hoc

---

## Action / Helper Direction

Likely helpers:

- `listTeacherStrategies(teacherUserId)`
- `getTeacherStrategy(strategyId)`
- `createTeacherStrategy(...)`
- `updateTeacherStrategy(...)`
- `archiveTeacherStrategy(...)`
- `listPrivateStudentStrategyApplications(privateStudentId)`
- `applyTeacherStrategyToPrivateStudent(...)`

Likely actions:

- `createTeacherStrategyAction(formData)`
- `updateTeacherStrategyAction(formData)`
- `applyTeacherStrategyAction(formData)`

Likely reporting helpers:

- `getTeacherStrategyReuseSummary(teacherUserId)`
- `getPrivateLearnersWithoutStrategy(teacherUserId)`
- `getRecurringIssueStrategyGapSummary(teacherUserId)`

Recommendation:

- build this on top of the current library/private-learner/reporting structure
- avoid creating a brand-new top-level teacher section for strategies

---

## Milestone Order

### Milestone 1: lightweight tutoring strategies

Build:

- `teacher_strategies`
- strategy create/edit/list inside `Teaching > Library`
- lightweight linking to template/resource

Goal:

- teachers can save reusable tutoring strategies

Current implementation status:

- implemented on web

### Milestone 2: strategy application into live workflow

Build:

- `private_student_strategy_applications`
- private learner detail apply flow
- recent strategy context on private learner and classroom surfaces

Goal:

- strategies are not just stored, they are actively applied

Current implementation status:

- implemented on web

### Milestone 3: strategy reuse reporting

Build:

- reporting summary and gaps
- strategies in use
- learners still managed ad hoc
- recurring issue pressure without strategy coverage

Goal:

- teacher can see whether reuse is actually happening

Current implementation status:

- implemented on web

---

## Suggested Milestone 1 Build Order

1. add `teacher_strategies` to `src/lib/db.ts`
2. add `src/lib/teacher-strategies.ts`
3. add create/update actions in `src/lib/actions.ts`
4. add strategy section to `Teaching > Library`
5. then move into application flow

---

## Risks

### Risk 1: strategy layer becomes too abstract

Mitigation:

- keep it lightweight and tied to current teacher workflow

### Risk 2: strategy library duplicates templates/resources

Mitigation:

- make strategy the “response pattern”
- keep template/resource as optional linked support artifacts

### Risk 3: strategy application becomes hard to trace

Mitigation:

- record explicit application rows and latest markers on `private_students`

### Risk 4: reporting becomes noisy

Mitigation:

- focus reporting on:
  - strategy reuse
  - no strategy usage
  - recurring issue gaps

---

## Definition Of Ready

Phase 11 is ready to implement when:

- strategy record shape is accepted
- strategy application shape is accepted
- we agree that strategies live inside `Teaching > Library`
- we agree that strategy application starts inside private learner detail
- we accept lightweight reuse reporting before any deeper automation

Current recommendation:

- Phase 11 is ready to start with **Milestone 1: lightweight tutoring strategies**
