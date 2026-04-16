# Phase 20 Planning

## Phase Focus

Phase 20 is the **teacher portfolio shaping and operating-mode layer** after stabilization and handoff.

By the end of Phase 19, HanziBit can help a teacher answer:
- what matters most right now
- what should be revisited on rhythm
- where pressure is clustering
- what can be simplified
- which learners look stable enough for lighter-touch support

What the product still does not do well is help a teacher decide:

- what mix of learners currently needs intensive vs light-touch support
- whether their private learner portfolio is drifting too far toward high-effort support
- which learners are a good fit for the teacher’s preferred teaching mode
- where current operating patterns are sustainable versus fragile over longer cycles

Phase 20 should fill that gap.

## Core Question

**Can HanziBit help a teacher understand the shape of their current learner portfolio and keep it aligned with a sustainable teaching mode instead of only reacting learner by learner?**

## What Phase 20 Is

Phase 20 should introduce a lightweight portfolio-level operating layer:
- learner portfolio mix summaries
- intensive vs steady vs light-touch distribution
- support-mode concentration signals
- teacher-facing cues about whether the current portfolio shape looks sustainable

This is still an operational support layer, not a marketplace or staffing layer.

## What Phase 20 Is Not

Phase 20 should **not** include:
- pricing optimization
- lead throttling
- marketplace ranking logic
- staffing / delegation
- scheduling systems
- notifications or automation
- financial planning

It should stay focused on **one teacher understanding whether their current learner mix matches the way they can sustainably teach inside HanziBit**.

## Product Goal

Make the teacher workspace answer:

**“Is my current private learner portfolio shaped in a way I can sustain, or am I carrying too much of one support mode at once?”**

## Proposed Scope

### 1. Portfolio Mix Signals

Add lightweight derived portfolio signals such as:
- learners needing active support
- learners in simplify-support state
- learners in light-touch / handoff-ready state
- ratio of active-pressure learners to stable learners

### 2. Support-Mode Concentration

Detect when too much of the portfolio is concentrated in one mode:
- too many learners needing active intervention
- too many learners stuck in repeated support cycles
- too few learners reaching stable / simplified support

### 3. Teacher Operating-Mode Framing

Provide simple teacher-facing states such as:
- balanced portfolio
- active-heavy
- stretched portfolio
- stabilization-heavy

These should remain explainable and derived.

### 4. Portfolio Shaping Guidance

Surface plain-language guidance like:
- current portfolio is balanced
- too much active intervention is clustering
- simplification opportunities exist but are not being used
- stable learners are present but not yet being transitioned to lighter-touch support

## Data Direction

Phase 20 should stay **derived-first**.

Use existing data from:
- private learner stabilization states
- workload and concentration signals
- priority and checkpoint layers
- strategy/playbook reuse and outcome signals

Avoid adding a new persistence layer in the first pass.

## Main Surfaces Affected

### `Teaching > Overview`
- portfolio mix snapshot
- operating-mode cue

### `Teaching > Reporting`
- portfolio distribution reporting
- concentration by support mode

### `Teaching > Private Learners`
- optional grouping and visibility by support mode

## Milestone Direction

### Milestone 1
Derived portfolio mix summary in `Teaching > Overview`

### Milestone 2
Portfolio-mode visibility in `Teaching > Private Learners`

### Milestone 3
Portfolio distribution reporting in `Teaching > Reporting`

### Polish
Clarify language so this feels like capacity awareness, not judgment:
- balanced
- active-heavy
- stretched
- stable
- simplify support

## Risks

### 1. Too much overlap with workload balancing

Phase 18 = where pressure is clustering  
Phase 20 = what the teacher’s overall learner mix looks like

### 2. Too much overlap with stabilization

Phase 19 = which learners can simplify  
Phase 20 = whether the whole portfolio is actually shifting that way

### 3. Weak mode labels

If the labels feel too abstract, the feature will sound managerial instead of useful. Keep them plain and teacher-readable.

## Success Criteria

Phase 20 is successful if a teacher can:
- see whether their learner mix is balanced or skewed
- spot when too much of the portfolio is still in high-effort support
- identify whether stabilization opportunities are actually changing the portfolio shape
- use that visibility to rebalance how they operate over time

## Recommended Next Step

Create:
- `docs/phase-20-implementation-spec.md`

Then start with:
- derived portfolio mix summary in `Teaching > Overview`
