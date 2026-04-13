# Next Steps

A living doc. Update this whenever stopping work so the next session starts with full context.

---

## Last Session Summary (Phase 2 Classroom MVP Checkpoint — 2026-04-13)

Completed:

1. **Phase 2 schema and permission layer** — classrooms, assignments, submissions, feedback, and role-aware permission helpers are now implemented.
2. **Classroom flows** — teachers can create classrooms, students can join via code, and both roles can open classroom detail with roster and assignment context.
3. **Assignment flows** — teachers can create assignments, students can see them in the assignments page, and assignment launch reuses the notebook / Study Guide flows.
4. **Submission linking** — assignment context now flows into journal creation and automatically creates or updates `assignment_submissions`.
5. **Teacher review** — teachers can open submission detail pages, leave feedback, and mark submissions reviewed.
6. **Student feedback visibility** — students can open their own submission page and see feedback plus reviewed state.
7. **Teacher visibility** — classroom detail now shows submitted/reviewed/missing counts, and the assignment inbox now surfaces statuses like `Needs Review`, `To Do`, and `Reviewed`.
8. **Teacher dev account** — `pnpm seed` now creates a local teacher account and the README documents both learner and teacher credentials.

---

## Immediate Follow-Up

- [x] Run one more manual teacher/student smoke pass:
  - teacher creates classroom
  - student joins classroom
  - teacher creates assignment
  - student submits through notebook flow
  - teacher reviews and marks reviewed
  - student sees feedback and reviewed state
  - classroom `Needs Attention` updates correctly
- [x] Start Phase 3 planning in parallel
- [ ] Lock the first Phase 3 build scope:
  - reusable teacher content first
  - reporting second
  - referral MVP after teacher reuse is real

---

## Short-Term (Next Session)

- [x] **Phase 3 implementation spec** — turn `docs/phase-3-planning.md` into a schema + milestones spec once scope is approved
- [ ] **Resubmission lifecycle decision** — keep the current simple revise-and-resubmit model, or add an explicit `returned for revision` / reopen state
- [ ] **Teacher review queue polish** — possible next pass:
  - filters by classroom
  - sort by due date / newest submission
  - clearer overdue treatment

---

## Medium-Term

- [ ] **Phase 2 mobile parity planning** — once the Flutter team is ready to catch up, document which classroom flows should be brought over first:
  - classes list
  - class detail
  - assignments inbox
  - submission detail
- [ ] **Teacher workflow polish** — richer classroom filtering, overdue logic, and stronger review batching
- [ ] **Phase 3A implementation** — teacher content/reusability systems
- [ ] **Phase 3B planning follow-up** — reporting and intervention layer
- [ ] **Phase 3C planning follow-up** — referral MVP timing and billing details
- [ ] **Phase 1 learner-loop improvements can continue later** — annotation/content/audio depth remains valuable, but it is no longer the current main branch

---

## Parking Lot (No Timeline)

- Admin/CMS for curriculum content — currently managed via seed scripts
- Native mobile / offline support
- Smarter spaced repetition (SM-2 is good but fixed; could adapt intervals based on historical fail rate per word)
- Social proof / activity feed for the landing page

---

## Status Call

As of April 13, 2026:

- **Web Phase 1**: stable enough to treat as the baseline
- **Web Phase 2**: classroom MVP is now working end-to-end
- **Mobile Phase 1**: continue parity work against current docs and endpoints
- **Remaining work**: Phase 2 selective polish, mobile catch-up, and Phase 3 scope locking

---

## Phase 3 Status

Current status:

- [x] Create a concrete Phase 3 planning baseline
- [x] Turn Phase 3 into an implementation-ready spec
- [x] Start Milestone 1: reusable-content schema and helper layer
- [ ] Decide whether referral MVP is part of the first Phase 3 milestone or deferred until after reusable teacher content
- [ ] Build Milestone 2: teacher library UI and template creation flows

Primary reference:

- `docs/phase-3-planning.md`
- `docs/phase-3-implementation-spec.md`

---

## Phase 2 Implementation Status

Current status:

- [x] Create a concrete Phase 2 classroom planning baseline
- [x] Define Phase 2 schema proposal
- [x] Define role/permissions model
- [x] Define MVP screen map for teacher and student flows
- [x] Turn Phase 2 into an implementation backlog by milestone
- [x] Milestone 1: schema and permission helpers
- [x] Milestone 2: classroom create/join/list/detail
- [x] Milestone 3: assignment creation and assignment detail
- [x] Milestone 4: submission linking from notebook/study flows
- [x] Milestone 5: teacher review and feedback
- [x] Milestone 6: classroom and assignment visibility polish

Primary reference:

- `docs/phase-2-classroom-planning.md`
- `docs/phase-2-implementation-spec.md`
