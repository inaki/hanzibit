# Next Steps

A living doc. Update this whenever stopping work so the next session starts with full context.

---

## Roadmap Reset (Pilot Prep — 2026-04-17)

Current planning decision:

- stop expanding deeper phase layers for now
- treat the product as feature-rich enough for an alpha / pilot
- shift focus to **production readiness and real learner usability**

Reference user:

- the founder as first real customer
- learning Chinese from zero

Primary docs for this reset:

- `docs/production-readiness-plan.md`
- `docs/first-user-journey.md`
- `docs/pilot-readiness-checklist.md`
- `docs/learner-navigation-audit.md`
- `docs/beginner-onboarding-plan.md`

Immediate priority is now:

1. beginner-first usability
2. navigation simplification
3. first-session and first-week learner journey
4. auth/billing/core-loop reliability
5. bug and empty-state cleanup

Completed on this branch so far:

- [x] learner navigation simplification audit
- [x] beginner onboarding plan

References:

- `docs/learner-navigation-audit.md`
- `docs/beginner-onboarding-plan.md`

---

## Last Session Summary (Phase 5 Milestone 3 Checkpoint — 2026-04-14)

Completed:

1. **Phase 3A reusable content** — teacher library, templates, editing, and save-assignment-as-template flows are implemented on web.
2. **Phase 3B reporting** — reporting summary, classroom drill-down, and student drill-down pages are implemented on web.
3. **Phase 3C referral MVP** — referral codes, referral links, checkout attribution, webhook commission ledger, payout batches, and a teacher referral dashboard are implemented.
4. **Phase 4 discovery layer** — public teacher profiles, teacher directory, learner inquiries, teacher inquiry inbox, and inquiry-to-classroom conversion are implemented on web.
5. **Teacher workspace IA** — teacher pages are now consolidated under one `Teaching` workspace with tabs, role-aware nav visibility, and attention badges.
6. **Phase 5 Milestone 1** — `Teaching > Setup` is implemented, and inquiry conversion now uses saved tutoring defaults plus an optional default onboarding template.
7. **Phase 5 Milestone 2** — converted inquiries now have learner-facing onboarding and private-classroom next-step visibility on web.
8. **Phase 5 Milestone 3** — `Teaching > Reporting` now includes private tutoring conversion follow-through and inactive converted learner visibility.
9. **Phase 6 Milestone 1** — `private_students` lifecycle records now exist and are created during inquiry conversion.
10. **Phase 6 Milestone 2** — `Teaching > Private Learners` is implemented with teacher list/detail workflow, lifecycle updates, assignment linking, and classroom workflow entry points.
11. **Phase 6 Milestone 3** — reporting now includes private learner state groupings, stalled signals, and direct workflow links into private learner operations.
12. **Phase 6 polish** — teacher/private learner copy, classroom workflow cues, and learner-facing next-step messaging are now cleaned up on web.

---

## Immediate Follow-Up

- [x] Close the first Phase 3 implementation loop on web
- [x] Start Phase 4 planning baseline
- [x] Turn Phase 4 into an implementation-ready spec
- [x] Implement Phase 4 Milestones 1 through 4 on web
- [x] Consolidate teacher UX into one `Teaching` workspace
- [x] Create a Phase 5 planning baseline
- [x] Turn Phase 5 into an implementation-ready spec
- [x] Create a Phase 6 planning baseline

---

## Short-Term (Next Session)

- [ ] **Referral polish** — possible next pass:
  - payout threshold rules
  - refund/reversal handling
  - clearer support audit notes
- [ ] **Phase 4 polish** — possible next pass:
  - teacher overview refinement
  - stronger directory/profile trust signals
  - inquiry conversion defaults
- [x] **Phase 5 planning baseline** — define the post-discovery operating layer before adding scheduling or marketplace automation
- [x] **Phase 5 Milestone 1** — tutoring setup foundation
- [x] **Phase 5 Milestone 2** — learner-facing onboarding and private-classroom next steps
- [x] **Phase 5 Milestone 3** — conversion and relationship reporting
- [ ] **Phase 5 polish** — refine private tutoring onboarding/teacher workflow before moving on
- [x] **Phase 6 implementation spec** — define the post-onboarding private tutoring operations layer
- [x] **Phase 6 Milestone 1** — private learner lifecycle foundation
- [x] **Phase 6 Milestone 2** — teacher private learner workflow
- [x] **Phase 6 Milestone 3** — reporting integration for private learner states and deeper activity signals
- [x] **Phase 6 polish** — refine private learner copy, classroom workflow cues, and learner-facing next-step clarity
- [x] **Phase 7 planning baseline** — define the next product layer after private tutoring operations
- [x] **Phase 7 implementation spec** — define the cadence/session-planning layer before coding
- [x] **Phase 7 Milestone 1** — cadence defaults foundation
- [x] **Phase 7 Milestone 2** — private learner next-lesson planning
- [x] **Phase 7 Milestone 3** — cadence reporting
- [x] **Phase 7 closeout** — doc closeout is done; only optional polish/mobile parity remains
- [x] **Phase 8 planning baseline** — define the next layer after cadence and lesson planning
- [x] **Phase 8 implementation spec** — define the continuity/lesson-history layer before coding
- [x] **Phase 8 Milestone 1** — private learner goals foundation
- [x] **Phase 8 Milestone 2** — lesson/check-in history
- [x] **Phase 8 Milestone 3** — continuity reporting
- [x] **Phase 8 polish** — continuity guidance across `Private Learners`, classroom cards, and reporting
- [x] **Phase 9 planning baseline** — define the next tutoring outcomes/intervention layer after continuity
- [x] **Phase 9 implementation spec** — define the outcomes/intervention layer before coding
- [x] **Phase 9 Milestone 1** — goal progress markers
- [x] **Phase 9 Milestone 2** — repeated issue capture
- [x] **Phase 9 Milestone 3** — intervention reporting
- [x] **Phase 9 polish** — clearer intervention guidance across workflow, detail, and classroom context
- [x] **Phase 10 planning baseline** — define the teacher review/adaptation layer after intervention
- [x] **Phase 10 implementation spec** — define the review/adaptation layer before coding
- [x] **Phase 10 Milestone 1** — private learner review snapshots
- [x] **Phase 10 Milestone 2** — plan adaptation workflow
- [x] **Phase 10 Milestone 3** — adaptation reporting
- [x] **Phase 10 polish / closeout** — adaptation pressure, guidance, and reporting context are cleaned up on web
- [x] **Phase 11 planning baseline** — define the teacher strategy/reuse layer after review and adaptation
- [x] **Phase 11 implementation spec** — define the strategy/reuse layer before coding
- [x] **Phase 11 Milestone 1** — lightweight tutoring strategies in `Teaching > Library`
- [x] **Phase 11 Milestone 2** — apply saved strategies inside private learner workflow
- [x] **Phase 11 Milestone 3** — strategy reuse reporting in `Teaching > Reporting`
- [x] **Phase 11 polish** — stronger strategy guidance across `Teaching > Overview`, `Private Learners`, and private classroom workflow cards
- [x] **Phase 12 planning baseline** — define the strategy effectiveness/refinement layer after strategy reuse
- [x] **Phase 12 implementation spec** — define the strategy effectiveness/refinement layer before coding
- [x] **Phase 12 Milestone 1** — lightweight strategy outcome capture in private learner workflow
- [x] **Phase 12 Milestone 2** — strategy refinement workflow in `Teaching > Library`
- [x] **Phase 12 Milestone 3** — strategy effectiveness reporting in `Teaching > Reporting`
- [x] **Phase 12 polish** — strategy quality signals are now visible in `Teaching > Overview`, `Library`, `Private Learners`, and private classroom tutoring cards
- [x] **Phase 13 planning baseline** — define the playbook/escalation layer after strategy effectiveness
- [x] **Phase 13 implementation spec** — define the playbook/escalation layer before coding
- [x] **Phase 13 Milestone 1** — playbook library foundation in `Teaching > Library`
- [x] **Phase 13 Milestone 2** — apply playbooks inside private learner workflow
- [x] **Phase 13 Milestone 3** — playbook escalation reporting in `Teaching > Reporting`
- [x] **Phase 13 polish** — stronger playbook visibility across `Overview`, `Private Learners`, and `Library`
- [x] **Phase 14 planning baseline** — define the playbook effectiveness/evolution layer after playbook escalation
- [x] **Phase 14 implementation spec** — define the playbook effectiveness/evolution layer before coding
- [x] **Phase 14 Milestone 1** — playbook outcome capture in private learner workflow
- [x] **Phase 14 Milestone 2** — playbook refinement / replacement workflow in `Teaching > Library`
- [x] **Phase 14 Milestone 3** — playbook effectiveness reporting in `Teaching > Reporting`
- [x] **Phase 14 polish / closeout** — playbook quality signals are visible across `Overview`, `Private Learners`, classroom tutoring cards, and reporting
- [x] **Phase 15 planning baseline** — define the cross-learner teaching pattern layer after playbook effectiveness
- [x] **Phase 15 implementation spec** — define the cross-learner teaching pattern layer before coding
- [x] **Phase 15 Milestone 1** — cross-learner pattern reporting in `Teaching > Reporting`
- [x] **Phase 15 Milestone 2** — broader strategy and playbook pattern signals in `Teaching > Reporting`
- [x] **Phase 15 Milestone 3** — pattern-aware library context for strategy/playbook detail pages
- [x] **Phase 15 polish / closeout** — cross-learner pattern signals are now visible in `Overview`, `Library`, `Reporting`, and detail pages
- [x] **Phase 16 planning baseline** — define the teacher prioritization and sequencing layer after cross-learner patterns
- [x] **Phase 16 implementation spec** — define the prioritization/sequencing layer before coding
- [x] **Phase 16 Milestone 1** — teacher priority queue in `Teaching > Overview`
- [x] **Phase 16 Milestone 2** — private learner priority ranking
- [x] **Phase 16 Milestone 3** — ranked pattern follow-through in `Teaching > Reporting`
- [x] **Phase 16 polish / closeout** — priority visibility is now aligned across `Overview`, `Private Learners`, and `Reporting`
- [x] **Phase 17 planning baseline** — define the teacher review rhythm and operational checkpoint layer
- [x] **Phase 17 implementation spec** — define the teacher checkpoint model before coding
- [x] **Phase 17 Milestone 1** — derived review window in `Teaching > Overview`
- [x] **Phase 17 Milestone 2** — checkpoint visibility in `Teaching > Private Learners`
- [x] **Phase 17 Milestone 3** — checkpoint rhythm reporting in `Teaching > Reporting`
- [x] **Phase 17 polish / closeout** — checkpoint-rhythm guidance is now aligned across `Overview`, `Private Learners`, and `Reporting`
- [x] **Phase 18 planning baseline** — define the teacher workload balancing and operating-capacity layer after review rhythm
- [x] **Phase 18 implementation spec** — define the workload balancing layer before coding
- [x] **Phase 18 Milestone 1** — derived workload summary in `Teaching > Overview`
- [x] **Phase 18 Milestone 2** — workload concentration reporting
- [x] **Phase 18 Milestone 3** — learner-level repeated pressure visibility
- [x] **Phase 18 polish / closeout** — workload language and concentration signals are now aligned across `Overview`, `Private Learners`, and `Reporting`
- [x] **Phase 19 planning baseline** — define the stabilization and handoff layer after workload balancing
- [x] **Phase 19 implementation spec** — define the stabilization/handoff layer before coding

---

## Medium-Term

- [ ] **Phase 2 and Phase 3 mobile parity planning** — once the Flutter team catches up, document the teacher/classroom/reporting/referral flows that should come over first
- [ ] **Phase 4 mobile parity planning** — once discovery/inquiry stabilizes on web, define what should come over to mobile first
- [ ] **Phase 1 learner-loop improvements can continue later** — annotation/content/audio depth remains valuable, but it is no longer the current main branch
- [ ] **Pilot readiness branch**
  - beginner onboarding
  - first-user dashboard clarity
  - first 7-day learner journey
  - production reliability audit

---

## Parking Lot (No Timeline)

- Admin/CMS for curriculum content — currently managed via seed scripts
- Native mobile / offline support
- Smarter spaced repetition (SM-2 is good but fixed; could adapt intervals based on historical fail rate per word)
- Social proof / activity feed for the landing page

---

## Status Call

As of April 17, 2026:

- **Web Phase 1**: stable enough to treat as the baseline
- **Web Phase 2**: classroom MVP is now working end-to-end
- **Web Phase 3**: reusable content, reporting, and referral MVP are now meaningfully implemented
- **Web Phase 4**: discovery, inquiry, inquiry-to-classroom conversion, and the `Teaching` workspace are now implemented on web
- **Mobile Phase 1**: continue parity work against current docs and endpoints
- **Remaining work**: selective Phase 4 polish, mobile catch-up later, and later teacher-layer parity work
- **Remaining work**: optional Phase 7/8/9/10/11/12/13/14/15/16 mobile catch-up later, and Phase 17 continuation
- **Current roadmap reset**: stop phase expansion for now and prepare the app for real-user pilot use

---

## Phase 6 Status

Current status:

- [x] Create a concrete Phase 6 planning baseline
- [x] Turn Phase 6 into an implementation-ready spec
- [x] Milestone 1: private learner lifecycle foundation
- [x] Milestone 2: teacher private learner workflow
- [x] Milestone 3: reporting integration
- [x] Phase 6 polish / closeout on web
- [ ] Mobile catch-up later

Primary reference:

- `docs/phase-6-planning.md`
- `docs/phase-6-implementation-spec.md`

---

## Phase 7 Status

Current status:

- [x] Create a concrete Phase 7 planning baseline
- [x] Turn Phase 7 into an implementation-ready spec
- [x] Milestone 1: cadence defaults
- [x] Milestone 2: private learner next-lesson planning
- [x] Milestone 3: cadence reporting
- [x] Phase 7 polish / closeout on web
- [ ] Mobile catch-up later

Primary reference:

- `docs/phase-7-planning.md`
- `docs/phase-7-implementation-spec.md`

---

## Phase 8 Status

Current status:

- [x] Create a concrete Phase 8 planning baseline
- [x] Turn Phase 8 into an implementation-ready spec
- [x] Milestone 1: private learner goals
- [x] Milestone 2: lesson/check-in history
- [x] Milestone 3: continuity reporting
- [x] Phase 8 polish / closeout on web

Primary reference:

- `docs/phase-8-planning.md`
- `docs/phase-8-implementation-spec.md`

---

## Phase 9 Status

Current status:

- [x] Create a concrete Phase 9 planning baseline
- [x] Turn Phase 9 into an implementation-ready spec
- [x] Milestone 1: goal progress markers
- [x] Milestone 2: repeated issue capture
- [x] Milestone 3: intervention reporting
- [x] Phase 9 polish / closeout on web

Primary reference:

- `docs/phase-9-planning.md`
- `docs/phase-9-implementation-spec.md`

---

## Phase 10 Status

Current status:

- [x] Create a concrete Phase 10 planning baseline
- [x] Turn Phase 10 into an implementation-ready spec
- [x] Milestone 1: private learner review snapshots
- [x] Milestone 2: plan adaptation workflow
- [x] Milestone 3: adaptation reporting
- [x] Phase 10 polish / closeout on web

Primary reference:

- `docs/phase-10-planning.md`
- `docs/phase-10-implementation-spec.md`

---

## Phase 11 Status

Current status:

- [x] Create a concrete Phase 11 planning baseline
- [x] Turn Phase 11 into an implementation-ready spec
- [x] Milestone 1: lightweight tutoring strategies
- [x] Milestone 2: strategy application in private learner workflow
- [x] Milestone 3: strategy reuse reporting
- [x] Phase 11 polish / closeout on web

Primary reference:

- `docs/phase-11-planning.md`
- `docs/phase-11-implementation-spec.md`

---

## Phase 12 Status

Current status:

- [x] Create a concrete Phase 12 planning baseline
- [x] Turn Phase 12 into an implementation-ready spec
- [x] Milestone 1: strategy outcome capture
- [x] Milestone 2: strategy refinement workflow
- [x] Milestone 3: strategy effectiveness reporting
- [x] Phase 12 polish / closeout on web

Primary reference:

- `docs/phase-12-planning.md`
- `docs/phase-12-implementation-spec.md`

---

## Phase 13 Status

Current status:

- [x] Create a concrete Phase 13 planning baseline
- [x] Turn Phase 13 into an implementation-ready spec
- [x] Milestone 1: playbook library foundation
- [x] Milestone 2: playbook application in private learner workflow
- [x] Milestone 3: playbook escalation reporting
- [x] Phase 13 polish / closeout on web

Primary reference:

- `docs/phase-13-planning.md`
- `docs/phase-13-implementation-spec.md`

---

## Phase 14 Status

Current status:

- [x] Create a concrete Phase 14 planning baseline
- [x] Turn Phase 14 into an implementation-ready spec
- [x] Milestone 1: playbook outcome capture
- [x] Milestone 2: playbook refinement / replacement workflow
- [x] Milestone 3: playbook effectiveness reporting
- [x] Phase 14 polish / closeout on web

Primary reference:

- `docs/phase-14-planning.md`
- `docs/phase-14-implementation-spec.md`

---

## Phase 15 Status

Current status:

- [x] Create a concrete Phase 15 planning baseline
- [x] Turn Phase 15 into an implementation-ready spec
- [x] Milestone 1: cross-learner pattern reporting
- [x] Milestone 2: strategy and playbook pattern signals
- [x] Milestone 3: pattern-aware library context
- [x] Phase 15 polish / closeout on web

Primary reference:

- `docs/phase-15-planning.md`
- `docs/phase-15-implementation-spec.md`

---

## Phase 16 Status

Current status:

- [x] Create a concrete Phase 16 planning baseline
- [x] Turn Phase 16 into an implementation-ready spec
- [x] Milestone 1: teacher priority queue
- [x] Milestone 2: private learner priority ranking
- [x] Milestone 3: ranked pattern follow-through
- [x] Phase 16 polish / closeout on web

Primary reference:

- `docs/phase-16-planning.md`
- `docs/phase-16-implementation-spec.md`

---

## Phase 17 Status

Current status:

- [x] Create a concrete Phase 17 planning baseline
- [x] Turn Phase 17 into an implementation-ready spec
- [x] Milestone 1: derived review checkpoint model
- [x] Milestone 2: checkpoint visibility in `Private Learners`
- [x] Milestone 3: checkpoint rhythm reporting
- [x] Phase 17 polish / closeout on web

Primary reference:

- `docs/phase-17-planning.md`
- `docs/phase-17-implementation-spec.md`

---

## Phase 18 Status

Current status:

- [x] Create a concrete Phase 18 planning baseline
- [x] Turn Phase 18 into an implementation-ready spec
- [x] Milestone 1: derived workload summary
- [x] Milestone 2: workload concentration reporting
- [x] Milestone 3: learner-level repeated pressure visibility
- [x] Phase 18 polish / closeout on web

Primary reference:

- `docs/phase-18-planning.md`
- `docs/phase-18-implementation-spec.md`

---

## Phase 19 Status

Current status:

- [x] Create a concrete Phase 19 planning baseline
- [x] Turn Phase 19 into an implementation-ready spec
- [x] Milestone 1: derived stabilization summary
- [x] Milestone 2: learner-level stabilization visibility
- [x] Milestone 3: stabilization reporting
- [x] Phase 19 polish / closeout on web

Primary reference:

- `docs/phase-19-planning.md`
- `docs/phase-19-implementation-spec.md`

---

## Phase 20 Status

Current status:

- [x] Create a concrete Phase 20 planning baseline
- [x] Turn Phase 20 into an implementation-ready spec
- [x] Milestone 1: derived portfolio mix summary
- [x] Milestone 2: learner-level portfolio-mode visibility
- [x] Milestone 3: portfolio distribution reporting
- [x] Phase 20 polish / closeout on web

Primary reference:

- `docs/phase-20-planning.md`
- `docs/phase-20-implementation-spec.md`

## Phase 21 Status

Current status:

- [x] Create a concrete Phase 21 planning baseline
- [x] Turn Phase 21 into an implementation-ready spec
- [x] Milestone 1: operating review summary
- [x] Milestone 2: learner-level reset / rebalance visibility
- [x] Milestone 3: operating review reporting
- [x] Phase 21 polish / closeout on web

Primary reference:

- `docs/phase-21-planning.md`
- `docs/phase-21-implementation-spec.md`

## Phase 22 Status

Current status:

- [x] Create a concrete Phase 22 planning baseline
- [x] Turn Phase 22 into an implementation-ready spec
- [x] Milestone 1: intake-readiness summary
- [ ] Milestone 2: learner-level capacity-pressure visibility
- [ ] Milestone 3: capacity / intake reporting
- [ ] Phase 22 polish / closeout on web

Primary reference:

- `docs/phase-22-planning.md`
- `docs/phase-22-implementation-spec.md`

## Phase 11 Status

Current status:

- [x] Create a concrete Phase 11 planning baseline
- [x] Turn Phase 11 into an implementation-ready spec
- [x] Milestone 1: lightweight tutoring strategies
- [x] Milestone 2: strategy application into private learner workflow
- [x] Milestone 3: strategy reuse reporting
- [x] Phase 11 polish / closeout on web

Primary reference:

- `docs/phase-11-planning.md`
- `docs/phase-11-implementation-spec.md`

---

## Phase 12 Status

Current status:

- [x] Create a concrete Phase 12 planning baseline
- [x] Turn Phase 12 into an implementation-ready spec
- [x] Milestone 1: strategy outcome capture
- [x] Milestone 2: strategy refinement workflow
- [x] Milestone 3: strategy effectiveness reporting
- [x] Phase 12 polish on web

Primary reference:

- `docs/phase-12-planning.md`
- `docs/phase-12-implementation-spec.md`

---

## Phase 13 Status

Current status:

- [x] Create a concrete Phase 13 planning baseline
- [x] Turn Phase 13 into an implementation-ready spec
- [x] Milestone 1: teacher playbook records
- [x] Milestone 2: playbook application into private learner workflow
- [x] Milestone 3: playbook escalation reporting

Primary reference:

- `docs/phase-13-planning.md`
- `docs/phase-13-implementation-spec.md`

---

## Phase 14 Status

Current status:

- [x] Create a concrete Phase 14 planning baseline
- [x] Turn Phase 14 into an implementation-ready spec
- [x] Milestone 1: playbook outcome capture
- [x] Milestone 2: playbook refinement / replacement workflow
- [x] Milestone 3: playbook effectiveness reporting
- [x] Phase 14 polish / closeout on web

Primary reference:

- `docs/phase-14-planning.md`
- `docs/phase-14-implementation-spec.md`

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
- [x] Milestone 1: teacher profile foundation
- [x] Milestone 2: teacher discovery directory
- [x] Milestone 3: inquiry workflow
- [x] Milestone 4: inquiry-to-classroom conversion
- [x] Consolidate teacher UX into one `Teaching` workspace
- [ ] Decide whether public teacher profiles are opt-in only in V1
- [ ] Decide whether inquiry conversion should always create a classroom
- [ ] Optional Phase 4 polish

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
