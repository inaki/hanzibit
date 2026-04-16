# Phase 15 Planning

## Purpose

Phase 15 should help HanziBit move from **per-learner teaching support** into **cross-learner teaching pattern awareness**.

By Phase 14, the app already supports:

- strategies
- playbooks
- strategy and playbook outcomes
- refinement / replacement workflows
- effectiveness reporting

The next useful question is no longer:

**Did this help one learner?**

It is:

**What patterns are emerging across this teacher’s learners, and what should the teacher do with that information?**

Phase 15 should answer that without turning HanziBit into a BI tool or an admin-heavy analytics product.

---

## Phase 15 Goal

Give teachers a lightweight way to see:

- recurring issue clusters across private learners
- strategies that appear broadly useful
- playbooks that are repeatedly helping or repeatedly weak
- where their current teaching approach is too fragmented or too reactive

The product goal is not raw analytics depth.

The goal is:

**help the teacher recognize patterns they can act on across their learner base.**

---

## Product Principle

Phase 15 should stay teacher-operational, not dashboard-theoretical.

That means:

- summarize patterns in plain language
- connect every signal to an action path already in the product
- avoid introducing open-ended analytics exploration
- favor “what needs attention” and “what is working repeatedly” over charts for their own sake

---

## What Phase 15 Is

Phase 15 is the **cross-learner pattern and teaching insight layer**.

It should include:

- teacher-level pattern summaries
- repeated issue clusters across private learners
- repeated strategy success / failure signals
- repeated playbook success / failure signals
- lightweight teacher insight summaries in `Teaching > Reporting`

It can also include:

- “most common recurring issues this month”
- “most effective strategy recently”
- “playbooks needing replacement across multiple learners”
- “learners affected by the same recurring issue cluster”

---

## What Phase 15 Is Not

Phase 15 should not become:

- advanced analytics
- cohort reporting by arbitrary dimensions
- chart-heavy business intelligence
- automated recommendations that silently change teacher workflow
- AI-generated pedagogy decisions
- benchmarking teachers against one another

It should also not add:

- learner-to-learner comparisons shown publicly
- grading systems
- scheduling
- messaging
- billing or payouts

---

## Why This Phase Now

Phase 15 makes sense now because the foundation already exists:

- private learner lifecycle
- next-step planning
- goals
- lesson/check-in history
- intervention signals
- review snapshots
- plan adaptation
- strategy reuse
- playbook escalation
- strategy/playbook outcome and refinement data

Without those layers, Phase 15 would just be shallow reporting.

With them, HanziBit can now surface real cross-learner teaching patterns.

---

## Main Product Questions

Phase 15 should help answer:

1. What issues are showing up across multiple private learners?
2. Which strategies are repeatedly helping, and which ones are not?
3. Which playbooks are broadly useful, weak, or stale?
4. Which learners are affected by the same recurring pattern?
5. Where is the teacher still responding ad hoc instead of using a repeatable approach?

---

## Proposed Scope

### 1. Cross-Learner Issue Pattern Summary

In `Teaching > Reporting`, show:

- most common recurring issue tags
- how many learners are affected
- whether those learners have:
  - a strategy
  - a playbook
  - a recent outcome

This gives the teacher a concrete view of where repeated friction exists.

### 2. Strategy Pattern Summary

Extend existing strategy effectiveness reporting so the teacher can see:

- which strategies are helping across multiple learners
- which strategies are often marked `partial`
- which strategies are often marked `no_change` or `needs replacement`
- which strategies are being reused broadly but still underperforming

### 3. Playbook Pattern Summary

Extend playbook effectiveness reporting so the teacher can see:

- which playbooks are repeatedly helping
- which playbooks often lead to replacement outcomes
- which playbooks are used a lot but still weak
- which playbooks are unused and possibly obsolete

### 4. Pattern-to-Action Links

Every pattern summary should link back into:

- private learners affected
- the relevant strategy
- the relevant playbook
- the refinement surface already in the library

This keeps Phase 15 practical.

---

## Information Architecture Direction

Phase 15 should not create a new top-level workspace.

It should extend existing teacher surfaces:

- `Teaching > Reporting`
- `Teaching > Library`
- `Teaching > Private Learners`
- `Teaching > Overview`

Recommended additions:

- a new **Teaching Patterns** section inside `Reporting`
- stronger aggregate badges inside `Library`
- optional affected-learner lists inside strategy/playbook detail pages

---

## Suggested Data Direction

Phase 15 may not need many brand-new core tables if it can derive enough from:

- `private_lesson_history`
- `private_student_strategy_applications`
- `private_student_strategy_outcomes`
- `private_student_playbook_applications`
- `private_student_playbook_outcomes`
- `private_student_goals`
- `private_student_reviews`

Possible additions only if needed:

- `teacher_pattern_snapshots`
- `teacher_pattern_notes`

But Phase 15 should prefer derived summaries first.

---

## Milestone Order

### Milestone 1: Cross-Learner Pattern Reporting

Add issue-cluster and repeated-pressure summaries to `Teaching > Reporting`.

### Milestone 2: Strategy and Playbook Pattern Signals

Deepen effectiveness reporting to show repeated broad outcomes instead of only per-record outcomes.

### Milestone 3: Pattern-Aware Library Context

Show broader usage/effectiveness context directly inside strategy and playbook detail pages.

### Milestone 4: Phase 15 Polish

Tighten plain-language summaries, linkouts, and teacher guidance.

---

## Success Criteria

Phase 15 is successful if a teacher can:

- see what issue patterns are appearing across learners
- tell which strategies/playbooks are broadly helping or weak
- identify repeated teaching pressure early
- move from a pattern signal directly into refinement or learner action

It is not successful if it merely adds more metrics without changing teacher decisions.

---

## Recommendation

The right next implementation step after this planning doc is:

1. create a concrete Phase 15 implementation spec
2. start with **cross-learner pattern reporting**
3. keep the first pass heavily derived from existing data

That keeps the phase useful without creating a new data-heavy subsystem too early.
