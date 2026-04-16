# Phase 19 Planning

## Phase Focus

Phase 19 is the **teacher stabilization and handoff layer** after workload balancing.

By the end of Phase 18, HanziBit can help a teacher answer:
- what matters most right now
- what must be revisited on rhythm
- where pressure is clustering
- whether overall load is healthy, stretched, or overloaded

What the product still does not do well is help a teacher decide:

- what should stay stable instead of being changed again
- what support path is no longer worth carrying forward
- which learners need a lighter-touch handoff rather than more intervention
- which parts of the current load should be simplified before they become operational drag

Phase 19 should fill that gap.

## Core Question

**Can HanziBit help a teacher stabilize their current teaching system by making handoff, simplification, and steady-state decisions visible before workload becomes chronic drag?**

## What Phase 19 Is

Phase 19 should introduce a lightweight stabilization layer:
- stability signals for private learners
- support-path simplification cues
- handoff / light-touch readiness visibility
- “continue / simplify / hand off” framing across the teacher workspace

This is still an operational layer, not a staffing or marketplace layer.

## What Phase 19 Is Not

Phase 19 should **not** include:
- staff routing
- external handoff tooling
- marketplace reassignment
- automated learner transfers
- messaging systems
- scheduling systems
- payroll or compensation logic

It should stay focused on **helping one teacher understand where to maintain, simplify, or step back inside HanziBit**.

## Product Goal

Make the teacher workspace answer:

**“Which learners and support paths should I keep actively shaping, and which ones are stable enough to simplify or handle with a lighter touch?”**

## Proposed Scope

### 1. Stability Signals

Add lightweight derived signals such as:
- learner currently stable
- support path stable
- low-pressure / low-change learner
- learner staying steady without repeated intervention

### 2. Simplification Signals

Detect when the current support structure looks heavier than needed:
- playbook / strategy still attached but pressure is low
- repeated positive outcomes without fresh adaptation
- active support path that may be safe to simplify

### 3. Handoff / Light-Touch Signals

Detect when a learner may be ready for:
- lighter monitoring
- simpler follow-through
- reduced intervention frequency

This is not a transfer workflow. It is a teacher-facing operating cue.

### 4. Teacher Decision Framing

Provide simple, explainable framing such as:
- keep active
- simplify support
- light-touch monitor
- handoff-ready

These should stay lightweight and derived.

## Data Direction

Phase 19 should stay **derived-first**.

Use existing data from:
- private learner goals
- lesson history
- reviews
- adaptations
- strategies
- playbooks
- checkpoint rhythm
- workload concentration

Avoid adding a new persistence layer in the first pass.

## Main Surfaces Affected

### `Teaching > Overview`
- stabilization snapshot
- keep active vs simplify vs handoff-ready cues

### `Teaching > Private Learners`
- learner-level stabilization / handoff-ready visibility

### `Teaching > Reporting`
- stabilization and simplification reporting
- support paths that look heavier than necessary

## Milestone Direction

### Milestone 1
Derived stabilization summary in `Teaching > Overview`

### Milestone 2
Learner-level stabilization / light-touch visibility in `Teaching > Private Learners`

### Milestone 3
Stabilization and simplification reporting in `Teaching > Reporting`

### Polish
Clarify language so this feels like operational support, not disengagement:
- stable
- simplify support
- light-touch
- handoff-ready

## Risks

### 1. Premature handoff language

If the app suggests stepping back too early, it can undermine real support quality. Keep “handoff-ready” conservative and clearly framed.

### 2. Too much overlap with workload balancing

Phase 18 = where load is clustering  
Phase 19 = where support is stable enough to reduce friction

### 3. Weak thresholds

If stabilization signals are too optimistic, the feature will feel unsafe. Keep the first pass explainable and conservative.

## Success Criteria

Phase 19 is successful if a teacher can:
- identify learners that are stable enough for lighter-touch support
- spot support paths that can be simplified
- distinguish active pressure from stable continuity
- reduce unnecessary operational effort without losing visibility

## Recommended Next Step

Create:
- `docs/phase-19-implementation-spec.md`

Then start with:
- derived stabilization summary in `Teaching > Overview`
