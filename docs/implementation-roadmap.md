# HanziBit Implementation Roadmap

## Purpose

This document turns the current strategy work into an implementation-ready roadmap.

It connects:

- `docs/product-evolution-strategy.md`
- `docs/language-learning-effectiveness-strategy.md`
- `docs/referral-program-strategy.md`

The goal is to answer:

**What should we build next, in what order, and where in the codebase should the work land?**

---

## Current Planning Decision

The product should now optimize for this order:

1. strengthen the standalone learner loop
2. make that loop easier to repeat daily
3. add classroom workflows on top of that loop
4. add teacher content systems
5. only later add referral growth layers and marketplace ideas

This means the immediate implementation focus remains **Phase 1**.

---

## Phase 1 Outcome

Phase 1 is complete only when HanziBit feels like a reliable and repeatable daily learning system for solo learners.

That requires more than backend hardening.

Phase 1 should produce:

- stable mobile and web learner flows
- strong journal annotation UX
- a clearer daily practice loop
- better support for input, output, retrieval, and feedback

---

## Phase 1 Workstreams

## Workstream A: Platform Hardening

### Goal

Make the learner core reliable enough to support mobile usage and later classroom features.

### Status

Partially started.

### Already done

- core review/streak/access logic extracted into testable policy modules
- test harness added
- mobile API response normalization started

### Remaining work

- add tests for weak-card and progress logic
- add route-level validation coverage where useful
- audit mutation ownership checks
- close obvious auth and mobile-contract gaps
- update docs that still describe outdated mobile assumptions

### Main repo touchpoints

- `src/lib/data.ts`
- `src/lib/gates.ts`
- `src/lib/mobile-api.ts`
- `src/app/api/mobile/**`
- `tests/*.test.ts`

### Exit criteria

- main learner logic has lightweight automated coverage
- mobile routes have consistent validation and error shapes
- no obvious ownership or auth gaps remain in core learner mutations

---

## Workstream B: Journal Annotation UX

### Goal

Reduce friction around the app’s most distinctive learning mechanic:

`[汉字|pinyin|meaning]`

### Why it matters

The current annotation model is powerful, but still fragile. If users find it tedious or error-prone, the notebook loses much of its advantage.

### Features

#### B1. Markup validation

When creating or editing an entry:

- detect malformed markup
- highlight likely errors before save
- give plain-language guidance

#### B2. Annotation helper UI

- insert annotation blocks without manual typing
- allow quick wrapping of selected text
- optionally suggest pinyin/meaning from dictionary data

#### B3. One-click promotion from gloss to notebook annotation

- let users move from interlinear gloss exploration into saved annotations or flashcards

### Main repo touchpoints

- `src/components/notebook/journal-entry.tsx`
- `src/components/notebook/action-bar.tsx`
- `src/components/notebook/interlinear-gloss-view.tsx`
- `src/lib/parse-tokens.ts`
- `src/lib/gloss.ts`
- relevant mobile editor flow later

### Exit criteria

- users can detect bad markup before saving
- annotation is faster than raw manual typing
- annotation creation feels like part of the study loop, not formatting work

---

## Workstream C: Guided Daily Learning Loop

### Goal

Turn HanziBit from a set of pages into a system that tells the learner what to do next.

### Why it matters

This is the most important product move for learning effectiveness.

### Phase 1 target

Ship a first version of a **Today** or **Daily Practice** experience.

### V1 daily loop

1. due flashcards
2. one short reading or study item
3. one short writing prompt
4. quick progress summary

### Features

#### C1. Daily task container

- a single entry point for today’s work
- simple checklist or sequence UI

#### C2. Due review first

- reuse existing flashcard due queue
- show completion state clearly

#### C3. Prompted output

- generate one writing task tied to HSK level, study guide topic, or recent vocabulary

#### C4. Completion summary

- show what was done today
- show streak/progress effect

### Main repo touchpoints

- `src/app/notebook/dashboard/page.tsx`
- `src/components/notebook/dashboard-view.tsx`
- `src/lib/actions.ts`
- `src/lib/data.ts`
- possible new route such as `src/app/notebook/today/page.tsx`

### Exit criteria

- learner can open the app and start a useful session immediately
- the product makes the daily next step obvious

---

## Workstream D: Comprehensible Input Surface

### Goal

Strengthen the weak point in the current product: level-appropriate input.

### Why it matters

Right now HanziBit is stronger at output and review than at input. That limits how effective the app can become.

### Phase 1 target

Improve the study guide so it starts becoming a better input surface, even before a full content system exists.

### V1 features

#### D1. Short graded text blocks per level

- mini readings
- short dialogues
- small contextual examples

#### D2. Integrated glossing and review extraction

- click text to inspect words
- save interesting items to review

#### D3. Input-to-output handoff

- after reading, prompt the learner to retell or respond in the journal

### Main repo touchpoints

- `src/app/notebook/lessons/page.tsx`
- `src/components/notebook/study-guide.tsx`
- `src/lib/data.ts`
- content import or seed scripts later

### Exit criteria

- the study guide is no longer only a vocabulary browser
- learners can move from reading into writing without leaving the flow

---

## Workstream E: Feedback Foundations

### Goal

Prepare the app to give useful feedback on learner output.

### Phase 1 target

Do not build a full teacher or AI feedback system yet. Build the product foundations first.

### V1 features

#### E1. Entry quality checks

- malformed annotation detection
- simple structural guidance
- prompts to revise unclear or incomplete entries

#### E2. Correction-ready data model direction

Decide how future feedback will attach to:

- journal entries
- sentences
- highlighted spans

#### E3. UX space for future feedback

- reserve a clear place in the journal UI for suggestions, comments, or corrections

### Main repo touchpoints

- `src/components/notebook/journal-entry.tsx`
- `src/components/notebook/action-bar.tsx`
- `src/lib/db.ts`
- future schema work

### Exit criteria

- journal UX is ready to accept AI or teacher correction later without redesigning the product

---

## Recommended Build Order

This is the order to implement the remaining planning-approved work.

## Sprint 1

- finish Phase 1 platform hardening
- complete journal annotation validation

## Sprint 2

- ship first guided daily learning loop
- connect dashboard to daily tasks

## Sprint 3

- improve the study guide into an early comprehensible input surface
- connect readings to journal prompts and review creation

## Sprint 4

- add feedback foundations
- refine metrics and progress tracking for the new learner loop

After these four sprints, the app should be in a much stronger position to begin classroom features.

---

## First Build Candidates

If implementation starts immediately, these are the best first concrete tasks.

## Candidate 1: Journal Annotation Validation

### Why first

- small enough to ship
- central to the product’s differentiator
- directly improves learner output quality

### Deliverables

- parser-based validation helper
- UI warnings before save
- clear error messages for malformed markup

### Files likely involved

- `src/lib/parse-tokens.ts`
- `src/components/notebook/journal-entry.tsx`
- entry create/edit flows in notebook components

---

## Candidate 2: Today Screen Skeleton

### Why second

- highest product-leverage feature
- turns existing parts into a daily routine

### Deliverables

- `Today` route or dashboard section
- due reviews module
- one suggested writing task
- simple session summary

### Files likely involved

- `src/app/notebook/dashboard/page.tsx`
- `src/components/notebook/dashboard-view.tsx`
- `src/lib/actions.ts`
- `src/lib/data.ts`

---

## Candidate 3: Study Guide Input Upgrade

### Why third

- starts fixing the comprehensible input gap
- makes the study guide more pedagogically valuable

### Deliverables

- short graded content blocks
- gloss-enabled reading segment
- call-to-action into journal response

### Files likely involved

- `src/components/notebook/study-guide.tsx`
- `src/app/notebook/lessons/page.tsx`
- content loading helpers

---

## Metrics To Watch

The next product changes should be evaluated against learning behavior, not just clicks.

### Core learner metrics

- daily active learners who complete at least one meaningful task
- due review completion rate
- journal entries created per active learner
- flashcards created from real content
- study-guide-to-journal conversion rate
- repeat daily usage over 7 and 30 days

### Later metrics

- correction acceptance rate
- assignment completion rate
- teacher feedback turnaround

---

## Definition Of “Ready To Start Coding”

Planning should be considered complete enough to begin implementation when:

- the first workstream is chosen
- the first user-visible deliverable is defined
- the key files to touch are known
- the exit criteria for that slice are clear

That threshold is now met.

The best immediate coding target is:

**Journal annotation validation and save-time feedback.**

---

## Summary

The roadmap from here is:

1. finish Phase 1 hardening
2. improve journal annotation UX
3. ship a first daily learning loop
4. upgrade the study guide into a better input surface
5. prepare the journal for future feedback systems

After that, HanziBit will be in a much better position to support classroom workflows without losing its learner-first identity.
