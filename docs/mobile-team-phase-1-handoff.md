# Mobile Team Handoff — Phase 1 Solo Learner Loop

This is the stable handoff doc for the Flutter team. It compresses the current web behavior into the product and implementation expectations mobile should mirror first.

Use this together with `docs/mobile-team-update-phase-1.md`.
For readiness status, also see `docs/phase-1-readiness.md`.

---

## Goal

Phase 1 is no longer a loose notebook experience. The app now behaves like a guided solo-learner loop:

1. Review
2. Study
3. Write

Mobile should implement that loop as the main experience, not as three disconnected screens.

---

## Core Product Surfaces

### 1. Home / Today

Expected behavior:
- show Review, Study, Write as the main daily loop
- show completion state for each step
- show weekly history and recent consistency
- show the current weakest step
- provide direct recovery CTAs into the exact missing action

Important:
- if a recommended focus word exists, Home should use that word across Review, Study, and Write
- urgency indicators should reflect the weakest step

### 2. Guided Journal Composer

Expected behavior:
- support blank entry and guided draft entry
- render prompt/source context outside the textarea
- validate `[汉字|pinyin|english]` inline markup before submit
- include the annotation helper

Important draft fields:
- `draftTitleZh`
- `draftTitleEn`
- `draftUnit`
- `draftLevel`
- `draftContentZh`
- `draftSelectedText`
- `draftPrompt`
- `draftSourceZh`
- `draftSourceEn`
- `draftTargetWord`
- `draftTargetPinyin`
- `draftTargetEnglish`
- `draftSourceType`
- `draftSourceRef`

Expected annotation-helper behavior:
- manual annotation builder
- `Insert target word` when full target-word context exists
- show `Current selection`
- `Use selection` to seed the helper
- if text is selected, inserting an annotation should replace that span in-place
- when `draftSelectedText` exists, show it as the initial helper candidate even before live selection

### 3. Study Guide

Expected behavior per word:
- word detail
- reading/input passage
- `Try These Phrases`
- `Notice This Phrase`
- `Quick Check`
- `Listening Echo`
- `Journal Response`
- guided response history
- today-loop status when the selected word is today’s focus word

Important:
- Study Guide is now an input surface, not only a vocabulary browser
- each phrase chip or CTA should be able to open guided writing directly
- mobile now has a dedicated detail endpoint available:
  - `GET /api/mobile/lessons/:wordId?level=<n>`
  - this returns the selected word, focus context, review target, and precomputed presentation blocks/draft payloads

### 4. Focused Review

Expected behavior:
- Review should open due cards directly
- if a focus word exists, review should open on that word when possible
- the focused review panel should link back to:
  - Study
  - Write
  - latest linked response

Important:
- mobile now has a dedicated continuity endpoint available:
  - `GET /api/mobile/flashcards/focus?level=<n>`
  - this returns the current focus word, focus progress, study target, latest guided response, and guided write draft payload

### 5. Gloss / Reading Continuity

Expected behavior:
- glossed reading can launch writing from:
  - a single gloss token
  - short phrase chips
- these launches should preserve exact phrase context into the guided draft

---

## Data / Metadata Expectations

### Journal source metadata

Guided responses should preserve:
- `source_type`
- `source_ref`
- `source_prompt`

### Draft metadata

Reading and dashboard surfaces should be able to send:
- target-word context
- source text / gloss
- exact phrase candidate via `draftSelectedText`

---

## Mobile Build Order

1. Home / Today screen parity
2. Guided journal composer parity
3. Study Guide detail parity
4. Focused review parity
5. Gloss-to-writing parity

---

## What Can Wait

These should not block Phase 1 mobile delivery:

- richer audio playback
- smarter phrase extraction
- dictionary-backed annotation autocomplete
- deeper teacher/classroom features

Phase 1 mobile should target the stable learner loop first.

---

## Phase 1 Definition Of Done For Mobile

Mobile is aligned with Phase 1 when a learner can:

1. open Home and see the exact next step
2. enter Study and launch guided writing from a word or phrase
3. annotate writing without raw markup friction
4. open Review on the focus word
5. move from reading/gloss into output without losing context

That is the minimum product parity target.
