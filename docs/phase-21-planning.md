# Phase 21 Planning

## Phase Goal

Phase 21 adds a **teacher operating review and portfolio reset layer** on top of:
- Phase 18 workload balancing
- Phase 19 stabilization and handoff
- Phase 20 portfolio shaping and operating mode

By the end of Phase 20, HanziBit can help a teacher answer:
- what is still urgent
- what rhythm is overdue
- where support is clustering
- how the current learner mix is distributed

Phase 21 should add the next operating question:

**When should a teacher pause, rebalance, simplify, or reset parts of the current private learner portfolio instead of continuing in the same mode?**

## Scope

Phase 21 should remain:
- derived-first
- teacher-facing
- lightweight
- operational, not financial

It should add:
- periodic operating-review signals
- reset / rebalance / simplify cues
- sustainable-growth guidance
- clearer “hold or expand” language in `Teaching`

It should not add:
- scheduling
- billing
- automation
- lead throttling
- hard caps on learner count

## Core Model

### Definition of Operating Review

An **operating review** is a teacher-facing summary of whether the current learner portfolio should:
- keep running as-is
- be rebalanced
- be simplified
- be partially reset before taking on more pressure

### Definition of Reset Pressure

Reset pressure means the current portfolio is carrying too much active follow-through, too many overdue checkpoints, or too much unsupported learner pressure to keep expanding safely.

### Definition of Rebalance Pressure

Rebalance pressure means the current portfolio is still workable, but too much support is clustering in the same mode or around the same learners.

## Data Direction

Phase 21 should be implemented without a new persistence layer.

It should derive from:
- `teacher-reporting` signals
- priority
- checkpoint rhythm
- workload concentration
- stabilization
- portfolio mix

## Proposed Milestones

### Milestone 1: Operating Review Summary
- derived summary in `teacher-reporting`
- new overview block in `Teaching > Overview`

### Milestone 2: Learner-Level Reset / Rebalance Visibility
- clearer operating-review cues in `Teaching > Private Learners`

### Milestone 3: Operating Review Reporting
- reporting section for reset / rebalance / simplify follow-through

## Primary References

- `docs/phase-20-planning.md`
- `docs/phase-20-implementation-spec.md`
