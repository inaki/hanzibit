# Phase 18 Planning

## Phase Focus

Phase 18 is the **teacher workload balancing and operating-capacity layer** after review rhythm.

By the end of Phase 17, HanziBit can help a teacher answer:
- what matters most right now
- what needs follow-through first
- what should be revisited this week
- what is overdue vs recently checked

What the product still does not do well is help a teacher understand:

- whether their workload is becoming too spread across learners
- whether follow-through pressure is clustering around a few learners or support paths
- whether their current operating load is healthy, stretched, or overloaded

Phase 18 should fill that gap.

## Core Question

**Can HanziBit help a teacher understand and rebalance their current teaching load before quality starts slipping across private learners?**

## What Phase 18 Is

Phase 18 should introduce a lightweight operational workload layer:
- teacher workload summaries
- learner concentration signals
- support-load concentration signals
- healthy vs stretched vs overloaded operating cues

This is still a teacher workflow layer, not workforce planning.

## What Phase 18 Is Not

Phase 18 should **not** include:
- staffing / multi-teacher coordination
- staffing forecasts
- scheduling or calendar optimization
- financial forecasting
- automated resource allocation
- notifications or reminders

It should stay focused on **one teacher managing their own teaching load inside HanziBit**.

## Product Goal

Make the teacher workspace answer:

**“Is my current teaching load balanced enough to keep support quality steady, or am I letting too much pressure concentrate in the wrong places?”**

## Proposed Scope

### 1. Workload Summary Signals

Add lightweight derived load signals such as:
- number of urgent learners
- number of overdue checkpoints
- number of weak support paths
- number of active private learners under pressure

### 2. Learner Concentration Signals

Detect when too much pressure is clustering around a few learners:
- repeated urgent status
- repeated checkpoint pressure
- repeated intervention load

### 3. Support Concentration Signals

Detect when weak strategies/playbooks are carrying too much burden:
- one support path reused heavily while weak/mixed
- repeated issue clusters without broad success

### 4. Operational Load Framing

Provide simple teacher-facing states:
- healthy
- stretched
- overloaded

These should be derived and explainable, not opaque scores.

## Data Direction

Phase 18 should stay **derived-first**.

Use existing data from:
- priorities
- checkpoints
- private learner pressure
- strategy/playbook effectiveness
- issue clusters

No new required persistence layer should be added in the first pass.

## Main Surfaces Affected

### `Teaching > Overview`
- workload snapshot
- healthy / stretched / overloaded summary

### `Teaching > Reporting`
- workload concentration reporting
- repeated-pressure groupings

### `Teaching > Private Learners`
- optional concentration visibility for learners carrying repeated urgent load

## Milestone Direction

### Milestone 1
Derived workload summary in `Teaching > Overview`

### Milestone 2
Concentration reporting in `Teaching > Reporting`

### Milestone 3
Learner-level repeated pressure visibility in `Private Learners`

### Polish
Clarify language so this feels like teacher support, not judgment:
- healthy load
- stretched
- overloaded
- concentrated pressure
- repeated follow-through burden

## Risks

### 1. Too much judgmental language

This should help teachers prioritize and rebalance, not make them feel graded.

### 2. Too much overlap with priority/rhythm

Phase 16 = what matters most now  
Phase 17 = what must be revisited on rhythm  
Phase 18 = whether the overall load is becoming unbalanced

### 3. Weak thresholds

If load states feel arbitrary, the layer will feel fake. Keep thresholds simple and explainable.

## Success Criteria

Phase 18 is successful if a teacher can:
- see whether their current load looks healthy or stretched
- spot learners carrying repeated pressure
- spot support paths that are overloaded and weak
- use that visibility to rebalance their follow-through

## Recommended Next Step

Create:
- `docs/phase-18-implementation-spec.md`

Then start with:
- derived workload summaries in `Teaching > Overview`
