# Phase 1 Readiness

This document marks the current standalone-learner scope that is stable enough for parallel mobile implementation.

It complements:

- `docs/implementation-roadmap.md`
- `docs/mobile-team-phase-1-handoff.md`
- `docs/mobile-team-update-phase-1.md`

---

## Current Readiness Decision

Phase 1 is now **stable on web and feature-complete enough for mobile implementation to proceed in parallel**.

That does not mean Phase 1 is perfect or frozen. It means the core learner loop is coherent enough that:

- web can be treated as the current source of truth
- the Flutter team can implement against a stable product model
- remaining changes should bias toward polish, parity, and content depth rather than reworking the learner loop

---

## Stable Phase 1 Product Model

The stable solo-learner loop is:

1. Review
2. Study
3. Write

The app now supports that loop through:

- a dashboard/Home surface that prioritizes the next action
- a Study Guide that acts as an input surface
- a guided journal composer that preserves reading context
- a focused review flow tied back to the same study target
- gloss and phrase promotion into guided writing

---

## Stable Phase 1 Surfaces

These surfaces should be treated as stable enough for parity work:

### Dashboard / Today

- adaptive Review / Study / Write ordering
- weakest-step diagnosis
- exact-word continuity when a focus word exists
- direct recovery actions
- weekly loop history and recent consistency

### Journal Composer

- guided drafts
- markup validation
- annotation helper
- selection-aware annotation seeding
- in-place selected-text replacement
- draft-level annotation candidates via `draftSelectedText`

### Study Guide

- reading/input passage
- phrase chips
- focus phrase CTA
- quick check
- listening/transcript block
- guided response history
- today-loop status for the focus word

### Review

- due-mode entry point
- focus-word review targeting
- return path to study / write / latest response

### Gloss Flow

- single-token promotion into guided writing
- short phrase-chip promotion into guided writing

### Web UX Baseline

- journal create/edit dialogs now use reliable native scrolling with themed scrollbars
- dashboard, Study Guide, flashcards, gloss view, and guided journal surfaces have had a dark-mode cleanup pass
- the current web UI should be treated as stable enough for parity reference, even if later content-depth work continues

---

## What Is Still Moving

These areas are still improving and should not block mobile implementation:

- deeper dictionary-backed annotation assistance
- richer phrase extraction quality
- larger input-content system
- real listening/audio playback beyond transcript-first input
- optional polish in route validation and error states
- broader non-core theme cleanup outside the main learner loop
- settings and secondary utility surface cleanup

These are refinements, not blockers for Phase 1 parity.

---

## Mobile Start Recommendation

The Flutter team should start now, in this order:

1. Home / Today
2. Guided journal composer
3. Study Guide detail
4. Focused review
5. Gloss-to-writing continuity

They should use `docs/mobile-team-phase-1-handoff.md` as the stable reference and `docs/mobile-team-update-phase-1.md` as the change log.

---

## Web Priority After This Point

Web should now bias toward:

- parity support for mobile
- content-depth improvements
- targeted polish

Web should not reopen the basic solo-learner loop architecture unless a real product issue appears.

---

## Practical Closeout Note

As of April 13, 2026, the recommended interpretation is:

- **Phase 1 web**: stable enough to treat as the implementation baseline
- **Phase 1 mobile**: should continue catching up to the current web behavior
- **Remaining Phase 1 work**: mostly polish and depth, not foundational flow changes
