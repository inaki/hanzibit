# HanziBit Implementation Roadmap

## Purpose

This document turns the current strategy work into an implementation-ready roadmap.

It connects:

- `docs/product-evolution-strategy.md`
- `docs/language-learning-effectiveness-strategy.md`
- `docs/referral-program-strategy.md`
- `docs/phase-3-planning.md`

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
6. Phase 3 should start with reusable teacher content, not marketplace features
7. teacher-facing tools should consolidate into one workspace instead of multiplying notebook links

This means the immediate implementation focus is transitioning from **Phase 1 closeout** into **Phase 2 planning**.

Current status:

- web Phase 1 is stable
- the web Phase 2 classroom MVP is implemented
- the deeper teacher/tutoring phases are implemented far enough to stop expanding them for now
- the roadmap should now pivot from phase expansion to **production readiness and pilot preparation**

Current roadmap task:

- prepare HanziBit for real learner use
- use the founder as the first customer / Chinese-from-zero pilot learner

---

## Phase 1 Outcome

Phase 1 is complete only when HanziBit feels like a reliable and repeatable daily learning system for solo learners.

That requires more than backend hardening.

Phase 1 should produce:

- stable mobile and web learner flows
- strong journal annotation UX
- a clearer daily practice loop
- better support for input, output, retrieval, and feedback

Current assessment:

- the **web Phase 1 baseline is now effectively in place**
- the remaining work is mostly mobile parity, content depth, and non-core polish
- new work should be judged against whether it improves the learner loop without destabilizing the existing baseline

---

## Phase 1 Workstreams

## Workstream A: Platform Hardening

### Goal

Make the learner core reliable enough to support mobile usage and later classroom features.

### Status

Substantially complete for Phase 1 web.

### Already done

- core review/streak/access logic extracted into testable policy modules
- test harness added
- mobile API response normalization started

### Remaining work

- add route-level validation coverage where useful
- close any remaining auth and mobile-contract gaps
- update docs that still describe outdated mobile assumptions

Recently completed:
- weak-card ranking logic now has direct test coverage
- encountered-progress calculation now has direct test coverage
- core web/mobile mutation ownership checks were tightened and centralized
- shared mobile request validators now cover object, array, and review-quality parsing

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

Current assessment:

- functionally met for web Phase 1
- remaining work is parity verification and selective route polish, not foundational hardening

---

## Workstream B: Journal Annotation UX

### Status

Substantially shipped for Phase 1.

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

Current status:
- live markup validation is implemented
- invalid markup blocks submit
- server-side save also rejects malformed markup
- guided draft context now renders outside the textarea instead of being dumped into raw content

#### B2. Annotation helper UI

- insert annotation blocks without manual typing
- allow quick wrapping of selected text
- optionally suggest pinyin/meaning from dictionary data

Current status:
- substantially implemented for Phase 1
- composers now include a lightweight annotation builder
- guided drafts can carry enough context for one-tap target-word annotation insertion
- composers can seed the helper from live text selection
- inserting an annotation can now replace the selected span in-place
- guided drafts can carry `draftSelectedText` so reading surfaces can pre-seed annotation candidates
- Study Guide and gloss surfaces now have first-pass content-to-journal promotion actions for words and short phrases
- the main remaining opportunity is deeper dictionary-backed annotation assistance and richer phrase extraction, not the first pass of selection-aware annotation itself

#### B3. One-click promotion from gloss to notebook annotation

- let users move from interlinear gloss exploration into saved annotations or flashcards

Current status:
- substantially supported through guided study-to-journal, phrase-to-journal, review handoff, gloss-token-to-journal handoff, and gloss-phrase-to-journal handoff
- not yet implemented as a dedicated saved-annotation action inside the notebook reader

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

Current assessment:

- functionally met for Phase 1 web
- remaining work is deeper dictionary assistance and smarter content-derived suggestions

---

## Workstream C: Guided Daily Learning Loop

### Status

Shipped as a strong Phase 1 foundation.

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

Current status:
- implemented on the dashboard as `Today’s Practice`
- includes completion counts, loop summary, weekly count, 7-day history, and missing-step guidance

#### C2. Due review first

- reuse existing flashcard due queue
- show completion state clearly

Current status:
- implemented
- Review routes directly into due mode
- due mode can focus today’s recommended word
- focused review panel links back to study, writing, and latest response when available

#### C3. Prompted output

- generate one writing task tied to HSK level, study guide topic, or recent vocabulary

Current status:
- implemented
- dashboard opens a guided journal draft
- writing prompts are tied to the recommended study word and its gloss when available
- reading-originated drafts can now preserve exact phrase context through `draftSelectedText`

#### C4. Completion summary

- show what was done today
- show streak/progress effect

Current status:
- implemented
- includes loop completion, step pattern, weakest-step diagnosis, exact-word progress, and adaptive recovery CTAs

### Main repo touchpoints

- `src/app/notebook/dashboard/page.tsx`
- `src/components/notebook/dashboard-view.tsx`
- `src/lib/actions.ts`
- `src/lib/data.ts`
- possible new route such as `src/app/notebook/today/page.tsx`

### Exit criteria

- learner can open the app and start a useful session immediately
- the product makes the daily next step obvious

Current assessment:
- functionally met for Phase 1 V1
- remaining work is refinement, parity, and persistence polish rather than first-shipping the loop

---

## Workstream D: Comprehensible Input Surface

### Status

Shipped as a first Phase 1 version.

### Goal

Strengthen the weak point in the current product: level-appropriate input.

Current assessment:

- the first useful Study Guide input surface is now shipped
- remaining work is about richer content quality and audio depth, not first-pass structure

---

## Phase 1 Closeout Decision

The implementation priority should now be:

1. maintain the current web learner-loop baseline
2. support Flutter parity against the current contracts and behaviors
3. deepen content/input quality without destabilizing the loop
4. defer broader Phase 2 work until parity and product confidence are high enough

---

## Phase 2 Planning Decision

Phase 2 should start as a **classroom and assignment layer**, not as a marketplace or broad teacher operating system.

The immediate Phase 2 planning priority should be:

1. define the classroom data model
2. define teacher/student roles and permissions
3. define assignment and submission flows
4. map those flows back into the existing notebook and Study Guide

Reference:

- `docs/phase-2-classroom-planning.md`

### Why it matters

Right now HanziBit is stronger at output and review than at input. That limits how effective the app can become.

### Current shipped baseline

- Study Guide now includes level-shaped mini readings, quick checks, and response prompts
- Study Guide reading blocks can launch guided writing from the target word, the focus phrase, and additional phrase chips
- interlinear gloss view can now launch guided writing from single gloss tokens and short phrase chips derived from the glossed paragraph
- input surfaces can send exact phrase context into the composer through `draftSelectedText`

### Remaining work

- deepen the content system beyond lightweight generated input blocks
- add richer listening/audio-backed input
- improve phrase extraction quality and context sensitivity
- consider sentence/grammar mining directly into review

### Phase 1 target

Improve the study guide so it starts becoming a better input surface, even before a full content system exists.

### V1 features

#### D1. Short graded text blocks per level

- mini readings
- short dialogues
- small contextual examples

Current status:
- implemented in the Study Guide detail view as short input passages

#### D2. Integrated glossing and review extraction

- click text to inspect words
- save interesting items to review

Current status:
- partially implemented
- Study Guide links into flashcards and the learner loop cleanly
- richer extraction from input content remains open

#### D3. Input-to-output handoff

- after reading, prompt the learner to retell or respond in the journal

Current status:
- implemented
- Study Guide can open guided journal drafts
- Study Guide also shows linked guided responses back on the same word

### Main repo touchpoints

- `src/app/notebook/lessons/page.tsx`
- `src/components/notebook/study-guide.tsx`
- `src/lib/data.ts`
- content import or seed scripts later

### Exit criteria

- the study guide is no longer only a vocabulary browser
- learners can move from reading into writing without leaving the flow

Current assessment:
- met for Phase 1 V1
- the next step is richer content depth, not basic loop wiring

---

## Workstream E: Feedback Foundations

### Status

Started and partly shipped.

### Goal

Prepare the app to give useful feedback on learner output.

### Phase 1 target

Do not build a full teacher or AI feedback system yet. Build the product foundations first.

### V1 features

#### E1. Entry quality checks

- malformed annotation detection
- simple structural guidance
- prompts to revise unclear or incomplete entries

Current status:
- implemented
- guided drafts now show live revision guidance and journal feedback heuristics
- composer checks include target-word usage and simple output expectations

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
