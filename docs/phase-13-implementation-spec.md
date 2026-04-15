# Phase 13 Implementation Spec

## Purpose

This document turns Phase 13 into an implementation-ready specification.

It should answer:

- what Phase 13 builds first
- what schema changes are needed
- what permissions apply
- which screens and flows are required
- what order we should implement in

This doc is the bridge between the Phase 13 plan and actual code.

Current implementation status as of April 14, 2026:

- Phase 13 planning baseline is defined
- Milestone 1 is implemented on web
- Milestone 2 is implemented on web
- the web app already has:
  - reusable tutoring strategies
  - strategy application into live private learner workflow
  - strategy outcome capture
  - strategy refinement notes and archive flow
  - strategy effectiveness reporting
  - private learner goals, reviews, adaptation, and continuity workflow

It complements:

- `docs/phase-13-planning.md`
- `docs/phase-12-implementation-spec.md`
- `docs/implementation-roadmap.md`

---

## Phase 13 Objective

Phase 13 should help teachers move from individual reusable strategies into lightweight **playbooks**.

The practical goal is:

- a teacher already has strategies that seem useful
- the teacher can group one or more strategies into a more stable support pattern
- that playbook can be applied to a private learner when pressure persists
- reporting can show which learners are still ad hoc versus managed through a structured response

Phase 13 should build on:

- teacher strategies
- strategy outcomes
- strategy refinement
- private learner workflow
- intervention and adaptation reporting

---

## Phase 13 Structure

Phase 13 should be implemented in three internal tracks:

1. **Phase 13A: teacher playbook records**
2. **Phase 13B: playbook application into private learner workflow**
3. **Phase 13C: playbook escalation reporting**

Recommended order:

1. add playbooks to the library
2. apply playbooks in the private learner workflow
3. report playbook usage and escalation gaps

Current implementation checkpoint:

- Phase 13 planning baseline is defined
- teacher playbook records are now implemented on web
- playbook application into private learner workflow is now implemented on web
- `Teaching > Library` now includes:
  - playbook list
  - playbook creation
  - playbook detail/edit flow
  - linked strategy selection
- `Teaching > Private Learners` now includes:
  - apply playbook flow
  - playbook application history
  - current playbook context
- private classrooms now show current playbook support when available
- `Teaching > Reporting` now includes:
  - playbook usage rollups
  - no-playbook and playbook-gap signals
  - row-level playbook context inside private learner activity
- the main Phase 13 implementation loop is now complete on web

---

## Core Product Rules

### 1. Keep playbooks lightweight

Teachers should not have to author a full intervention plan.

The first version should prefer:

- title
- summary
- issue focus
- optional goal focus
- when-to-use guidance
- linked strategies

### 2. Playbooks must stay connected to strategy evidence

Phase 13 should build on:

- existing strategy outcomes
- recurring issue pressure
- blocked or reinforcement-heavy goals

It should not create a disconnected library object with no operational meaning.

### 3. Escalation stays teacher-driven

The app can highlight:

- repeated pressure
- no strategy outcome clarity
- recurring issues without structured support

But the teacher should still decide:

- whether to apply a playbook
- whether to adapt or replace it

### 4. Reporting must distinguish ad hoc vs structured support

Phase 13 reporting should help answer:

- which private learners still have no playbook
- which learners are on a playbook
- which playbooks are attached to learners with continued pressure

### 5. Keep it inside the `Teaching` workspace

Preferred placement:

- `Teaching > Library`
- `Teaching > Private Learners`
- `Teaching > Reporting`

The playbook layer should feel like a natural extension of the strategy system, not a separate product.

---

## Scope

### Included

- lightweight teacher playbooks
- linking strategies into playbooks
- playbook application into private learner workflow
- reporting for playbook usage and escalation gaps

### Excluded

- learner-visible playbooks
- AI-generated playbooks
- multi-week curriculum engines
- notifications or nudges
- automatic playbook assignment

---

## Roles And Permissions

### Teacher can

- create and update their own playbooks
- link their own strategies into those playbooks
- apply their own playbooks to their own private learners
- view playbook usage and escalation reporting for their own tutoring workflow

### Teacher cannot

- modify another teacher’s playbooks
- view another teacher’s playbook reporting

### Learner can

- indirectly benefit from playbook-guided private tutoring support

### Learner cannot

- view private teacher playbooks directly
- edit playbook state

### Recommended permission helpers

- `canManageTeacherPlaybook(userId, playbookId)`
- `canApplyTeacherPlaybook(userId, privateStudentId, playbookId)`
- `canViewTeacherPlaybookReporting(userId)`

Recommendation:

- extend the current teacher library / private learner permission model instead of introducing a separate admin layer

---

## Data Model

Phase 13 should add a lightweight playbook layer and a lightweight playbook application layer.

## Group 1: playbook records

### Table: `teacher_playbooks`

Recommended fields:

- `id UUID PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE`
- `title TEXT NOT NULL`
- `summary TEXT NOT NULL`
- `issue_focus TEXT`
- `goal_focus TEXT`
- `when_to_use TEXT`
- `guidance TEXT`
- `linked_template_id UUID REFERENCES assignment_templates(id) ON DELETE SET NULL`
- `linked_resource_id UUID REFERENCES teacher_resources(id) ON DELETE SET NULL`
- `usage_count INTEGER NOT NULL DEFAULT 0`
- `archived BOOLEAN NOT NULL DEFAULT FALSE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Purpose:

- capture a reusable support pattern above the strategy layer

Recommendation:

- keep issue and goal focus as flexible text in V1

## Group 2: playbook strategy links

### Table: `teacher_playbook_strategies`

Recommended fields:

- `id UUID PRIMARY KEY`
- `playbook_id UUID NOT NULL REFERENCES teacher_playbooks(id) ON DELETE CASCADE`
- `strategy_id UUID NOT NULL REFERENCES teacher_strategies(id) ON DELETE CASCADE`
- `sort_order INTEGER NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Constraints:

- unique `(playbook_id, strategy_id)`

Purpose:

- allow one playbook to reference multiple saved strategies without copying them

## Group 3: private learner playbook applications

### Table: `private_student_playbook_applications`

Recommended fields:

- `id UUID PRIMARY KEY`
- `private_student_id UUID NOT NULL REFERENCES private_students(id) ON DELETE CASCADE`
- `playbook_id UUID NOT NULL REFERENCES teacher_playbooks(id) ON DELETE CASCADE`
- `applied_by_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE`
- `applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `application_note TEXT`
- `linked_review_id UUID REFERENCES private_student_reviews(id) ON DELETE SET NULL`
- `linked_lesson_plan_id UUID REFERENCES private_lesson_plans(id) ON DELETE SET NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Purpose:

- preserve when a playbook was actually brought into live tutoring workflow

## Group 4: private learner playbook markers

### Add to `private_students`

Recommended fields:

- `last_playbook_id UUID REFERENCES teacher_playbooks(id) ON DELETE SET NULL`
- `last_playbook_applied_at TIMESTAMPTZ`

Purpose:

- make current playbook context easy to show in list/detail/classroom/reporting views

---

## Screens And Flows

### 1. `Teaching > Library`

Required:

- playbook list
- playbook creation
- edit/detail page
- ability to link strategies into a playbook

### 2. `Teaching > Private Learners > Detail`

Required:

- apply playbook form
- optional goal or note linkage
- playbook application history
- current playbook visibility

### 3. Private classroom tutoring card

Required:

- current playbook context
- playbook-aware support summary

### 4. `Teaching > Reporting`

Required:

- summary cards for:
  - learners with no playbook
  - learners with playbook in use
  - playbook gap / escalation pressure
- row-level latest playbook context in private learner activity

---

## Milestones

### Milestone 1: teacher playbook records

Build:

- `teacher_playbooks`
- `teacher_playbook_strategies`
- helper module
- permission coverage
- `Teaching > Library` playbook UI

Exit criteria:

- teacher can create/edit/archive a playbook
- teacher can attach strategies to it
- playbook lives in the library naturally

Status:

- implemented on web

### Milestone 2: playbook application into private learner workflow

Build:

- `private_student_playbook_applications`
- `private_students.last_playbook_id`
- apply-playbook action
- current playbook visibility in private learner and classroom views

Exit criteria:

- teacher can apply a playbook to a private learner
- app records the application
- current playbook context is visible outside the library

### Milestone 3: playbook escalation reporting

Build:

- playbook-aware reporting aggregates
- playbook-gap reporting
- playbook-in-use reporting

Exit criteria:

- teachers can distinguish ad hoc vs structured support in reporting
- playbook usage is visible beyond raw library records

---

## Suggested First Build Order

1. add `teacher_playbooks`
2. add `teacher_playbook_strategies`
3. add helper module
4. extend `Teaching > Library`
5. then add application records and reporting

That is the safest sequence because it makes the playbook layer usable before it starts shaping live private learner workflow.

---

## Risks

### 1. Strategy/playbook overlap could get muddy

Mitigation:

- keep strategy = atomic response
- keep playbook = structured pattern of responses

### 2. Playbooks could become over-modeled too early

Mitigation:

- keep fields lightweight
- avoid lesson sequences or scheduling in V1

### 3. Reporting could become noisy

Mitigation:

- focus on a few clear signals:
  - no playbook
  - playbook in use
  - playbook gap

---

## Ready To Implement When

Phase 13 is ready to start when:

- playbook schema is agreed
- the product rule “playbooks sit above strategies” is accepted
- the team agrees that the first build is library-first, then workflow, then reporting

That threshold is now met.
