# Next Steps

A living doc. Update this whenever stopping work so the next session starts with full context.

---

## Last Session Summary (Phase 3 Referral MVP Checkpoint — 2026-04-14)

Completed:

1. **Phase 3A reusable content** — teacher library, templates, editing, and save-assignment-as-template flows are implemented on web.
2. **Phase 3B reporting** — reporting summary, classroom drill-down, and student drill-down pages are implemented on web.
3. **Phase 3C referral MVP** — referral codes, referral links, checkout attribution, webhook commission ledger, payout batches, and a teacher referral dashboard are implemented.
4. **Referral operations** — internal support override tools now exist so attribution can be corrected without manual database work.

---

## Immediate Follow-Up

- [x] Close the first Phase 3 implementation loop on web
- [x] Do one selective polish pass on the referral dashboard
- [x] Start Phase 4 planning baseline
- [x] Turn Phase 4 into an implementation-ready spec
- [ ] Start Phase 4 Milestone 1: teacher profile foundation

---

## Short-Term (Next Session)

- [ ] **Referral polish** — possible next pass:
  - payout threshold rules
  - refund/reversal handling
  - clearer support audit notes
- [ ] **Teacher workflow polish** — possible next pass:
  - richer reporting filters
  - referral/reporting linking
  - clearer empty-state coaching

---

## Medium-Term

- [ ] **Phase 2 and Phase 3 mobile parity planning** — once the Flutter team catches up, document the teacher/classroom/reporting/referral flows that should come over first
- [ ] **Phase 4 Milestone 1 implementation** — `teacher_profiles`, helper layer, profile editor, and public profile page
- [ ] **Phase 1 learner-loop improvements can continue later** — annotation/content/audio depth remains valuable, but it is no longer the current main branch

---

## Parking Lot (No Timeline)

- Admin/CMS for curriculum content — currently managed via seed scripts
- Native mobile / offline support
- Smarter spaced repetition (SM-2 is good but fixed; could adapt intervals based on historical fail rate per word)
- Social proof / activity feed for the landing page

---

## Status Call

As of April 14, 2026:

- **Web Phase 1**: stable enough to treat as the baseline
- **Web Phase 2**: classroom MVP is now working end-to-end
- **Web Phase 3**: reusable content, reporting, and referral MVP are now meaningfully implemented
- **Mobile Phase 1**: continue parity work against current docs and endpoints
- **Remaining work**: selective Phase 3 polish, mobile catch-up later, and Phase 4 implementation planning

---

## Phase 3 Status

Current status:

- [x] Create a concrete Phase 3 planning baseline
- [x] Turn Phase 3 into an implementation-ready spec
- [x] Milestone 1: reusable-content schema and helper layer
- [x] Milestone 2: teacher library UI and template creation flows
- [x] Milestone 3: reporting summary and drill-down reporting
- [x] Milestone 4: referral MVP
- [x] Milestone 5: referral operations
- [ ] Referral/business-rule polish
- [ ] Mobile catch-up later

Primary reference:

- `docs/phase-3-planning.md`
- `docs/phase-3-implementation-spec.md`
- `docs/referral-program-strategy.md`

---

## Phase 4 Status

Current status:

- [x] Create a concrete Phase 4 planning baseline
- [x] Turn Phase 4 into an implementation-ready spec
- [ ] Decide whether public teacher profiles are opt-in only in V1
- [ ] Decide whether inquiry conversion should always create a classroom
- [ ] Milestone 1: teacher profile foundation

Primary reference:

- `docs/phase-4-planning.md`
- `docs/phase-4-implementation-spec.md`

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
