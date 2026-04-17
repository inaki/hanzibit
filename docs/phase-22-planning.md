# Phase 22 Planning

## Phase Goal

Phase 22 adds a **teacher capacity expansion and intake-readiness layer** after operating review.

By the end of Phase 21, HanziBit can help a teacher answer:
- what needs attention first
- what review rhythm is due
- where support is clustering
- how stable the learner portfolio is
- whether the current operating mix should be reset, rebalanced, simplified, or maintained

Phase 22 should add the next operating question:

**Is this teacher actually ready to take on more active learners, or should they hold intake until the current portfolio settles further?**

## Scope

Phase 22 should remain:
- derived-first
- teacher-facing
- lightweight
- operational, not financial

It should add:
- intake-readiness signals
- capacity-to-expand cues
- hold / cautious / ready operating language
- clearer guidance about whether the current portfolio can safely absorb more active support

It should not add:
- booking
- waitlists
- pricing changes
- automatic inquiry throttling
- lead routing or sales automation

## Core Model

### Definition of Intake Readiness

An **intake-readiness** view is a teacher-facing summary of whether the current portfolio can:
- safely expand active support
- only absorb limited new pressure
- hold steady without expansion
- pause intake until pressure is reduced

### Definition of Capacity Pressure

Capacity pressure means the teacher is already carrying enough:
- urgent learners
- overdue review / adaptation checkpoints
- concentrated pressure
- weak support paths
- reset / rebalance signals

that expanding active support would likely reduce follow-through quality.

### Definition of Expansion Readiness

Expansion readiness means the portfolio is not only balanced, but also sufficiently stable and well-supported that the teacher can realistically add new active learners without immediately overloading the current system.

## Data Direction

Phase 22 should be implemented without a new persistence layer.

It should derive from:
- priority signals
- checkpoint rhythm
- workload balancing
- stabilization
- portfolio mix
- operating review

## Proposed Milestones

### Milestone 1: Intake Readiness Summary
- derived summary in `teacher-reporting`
- new overview block in `Teaching > Overview`

### Milestone 2: Learner-Level Capacity Pressure Visibility
- clearer “why the portfolio is not ready yet” cues in `Teaching > Private Learners`

### Milestone 3: Capacity / Intake Reporting
- reporting section for hold / cautious / ready portfolio states
- grouped reasons that are currently blocking safe expansion

## Primary References

- `docs/phase-21-planning.md`
- `docs/phase-21-implementation-spec.md`
