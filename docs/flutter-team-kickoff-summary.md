# Flutter Team Kickoff Summary

Use this as the compact kickoff note for the mobile project.

---

## Goal

Phase 1 is ready for parallel Flutter implementation.

The stable solo-learner product model is now:

1. Review
2. Study
3. Write

Mobile should implement that loop as the main app experience, not as disconnected screens.

---

## What Is Stable Enough To Build Now

### 1. Home / Today

Build a Home screen that:
- shows Review, Study, Write
- shows completion state
- shows the weakest step
- provides direct recovery CTAs
- uses the current focus word when one exists

### 2. Guided Journal Composer

Build a composer that supports:
- blank entry
- guided draft entry
- inline markup validation for `[汉字|pinyin|english]`
- annotation helper
- target-word quick insert
- selection-aware annotation seeding
- in-place replacement when annotating selected text
- draft-level annotation candidates via `draftSelectedText`

### 3. Study Guide Detail

Per word, support:
- word detail
- reading/input passage
- `Try These Phrases`
- `Notice This Phrase`
- `Quick Check`
- `Listening Echo`
- `Journal Response`
- guided response history
- today-loop status for the focus word

Backend support now available:
- `GET /api/mobile/lessons/:wordId?level=<n>`

### 4. Focused Review

Review should:
- open in due mode
- focus the recommended word when possible
- link back to Study, Write, and latest response

Backend support now available:
- `GET /api/mobile/flashcards/focus?level=<n>`

### 5. Gloss To Writing

Glossed reading should be able to launch guided writing from:
- a single gloss token
- short phrase chips

---

## Important Draft Fields

Flutter guided journal routes should preserve:

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

---

## Important Persisted Fields

Guided responses should preserve on journal creation:

- `source_type`
- `source_ref`
- `source_prompt`

---

## Recommended Build Order

1. Home / Today parity
2. Guided journal composer parity
3. Study Guide detail parity
4. Focused review parity
5. Gloss-to-writing parity

---

## What Can Wait

Do not block Phase 1 mobile delivery on:

- richer audio playback
- smarter phrase extraction
- dictionary-backed annotation autocomplete
- teacher/classroom workflows

---

## Source Docs

Use these docs as the source of truth:

- `docs/phase-1-readiness.md`
- `docs/mobile-team-phase-1-handoff.md`
- `docs/mobile-team-update-phase-1.md`
