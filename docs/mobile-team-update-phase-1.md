# Mobile Team Update — Phase 1 Learner Loop Changes

This document is the current handoff for the mobile app team. It captures the learner-loop changes already implemented in the web app so the Flutter app can mirror the same product behavior.

It should be updated whenever the web app changes the learner workflow in a way that affects mobile UX, navigation, API needs, or daily-practice behavior.

---

## Goal

The app is no longer only a notebook + flashcards product. Phase 1 has been moving HanziBit toward a tighter daily learning loop:

1. Review
2. Study
3. Write

The web app now treats this as the main solo-learner flow. Mobile should align with that model.

---

## What Changed

### 1. Journal annotation validation

The journal composer now validates inline markup before save.

Supported format:

```text
[汉字|pinyin|english]
```

Current web behavior:
- live validation in the composer
- invalid markup blocks submit
- server also rejects malformed markup

Mobile implication:
- mobile journal composer should validate markup before submit
- mobile should not rely only on server rejection
- mobile should surface parser errors inline, not as a generic failure after save

---

### 2. Guided draft flow

The web app now supports opening the journal with a prefilled guided draft.

Used in:
- Study Guide → Respond in journal
- Dashboard → Start guided draft

Draft payload currently includes:
- `draftTitleZh`
- `draftTitleEn`
- `draftUnit`
- `draftLevel`
- `draftContentZh`
- `draftPrompt`
- `draftSourceZh`
- `draftSourceEn`
- `draftTargetWord`
- `draftSourceType`
- `draftSourceRef`

Current web behavior:
- the notebook opens directly into the create-entry flow
- the learner sees a guided-response panel above the textarea
- prompt/source context is shown outside the main text field

Mobile implication:
- Flutter should support a guided journal compose mode, not only a blank create-entry screen
- guided prompt/source context should render as structured UI, not pasted text
- draft metadata should travel through navigation cleanly

---

### 3. Study Guide is now an input surface

The Study Guide is no longer just a vocabulary browser.

Per selected word, the web UI now shows:
- mini reading/input passage
- English gloss
- Notice This Phrase
- Quick Check
- Journal Response CTA
- Guided Responses history for that word

Current web behavior:
- study item can send the learner straight into guided writing
- study item also receives notebook activity back via guided-response history

Mobile implication:
- mobile Study Guide should show richer per-word detail, not only list + flashcard CTA
- the response loop should be two-way:
  - Study Guide → Journal
  - Journal response visible back in Study Guide

---

### 4. Guided response metadata is now persisted

Journal entries can now be linked to their source study item.

Persisted fields on `journal_entries`:
- `source_type`
- `source_ref`
- `source_prompt`

Current web use:
- entries created from Study Guide store source metadata
- Study Guide can query entries by `source_type = 'study_guide'` and `source_ref`
- notebook entries show that they are guided responses

Mobile implication:
- mobile should preserve and send these fields when creating guided responses
- mobile should display source-aware journal context where useful

---

### 5. Daily practice is now a first-class feature

The dashboard now includes a real `Today’s Practice` flow.

It currently includes:
- Review step
- Study step
- Write step

Current web behavior:
- each step shows `Done` or `Pending`
- dashboard shows `X of 3 steps completed`
- dashboard shows `Daily loop completed` when all steps are done
- dashboard persists loop completion history

Mobile implication:
- mobile should add a dedicated Today/Home screen
- this should not be just stats; it should be action-first
- mobile Home should expose the same three-step learner loop

---

### 6. Daily loop history exists now

The backend now tracks:
- full daily-loop completion
- step-level completion for review/study/write

Current web behavior:
- weekly completed loop count
- 7-day completion strip
- 7-day step pattern:
  - review `X/7`
  - study `Y/7`
  - write `Z/7`
- strongest step / weakest step diagnosis

Mobile implication:
- mobile Home/Dashboard should surface at least:
  - weekly loop count
  - 7-day strip
  - weakest-step diagnosis

---

### 7. Adaptive prioritization

The web dashboard no longer keeps Review/Study/Write fixed in the same order.

Current web behavior:
- incomplete steps appear before completed steps
- weakest incomplete step is promoted to the first card
- first priority card gets:
  - stronger highlight styling
  - `Priority` badge

Mobile implication:
- mobile should also prioritize the weakest incomplete step first
- this is product behavior, not only presentation

---

### 8. Direct action links are now contextual

The web app now routes users directly into the relevant workflow:

Review:
- opens `/notebook/flashcards?mode=due`

Study:
- opens the related study item when known

Write:
- opens the journal with a guided draft instead of a blank composer

Mobile implication:
- mobile should avoid generic landing-page navigation where a direct action is possible
- each step should open directly into the relevant task

---

### 9. Mobile nav now needs a Home entry

The web mobile nav now includes a Home tab pointing to the dashboard.

Current web mobile behavior:
- Home tab links to `/notebook/dashboard`
- Home tab shows an urgency badge when today’s loop is incomplete
- the badge now reflects the actual weakest step:
  - `R` = review
  - `S` = study
  - `W` = writing

Mobile implication:
- Flutter bottom navigation should include Home
- Home should support an urgency indicator when the learner still has an unfinished priority step
- the urgency indicator should ideally reflect the actual weak-point type, not only generic pending state

---

### 10. Adaptive daily-practice cards are now stronger

The web dashboard now does more than show three static task cards.

Current web behavior:
- incomplete steps render before completed steps
- weakest incomplete step is promoted to the first position
- the first priority card gets stronger visual emphasis
- the first priority card shows a `Priority` badge
- the summary area explains the current weakest step in plain language

Mobile implication:
- Flutter Home should not render three fixed cards in a hardcoded order
- the weakest incomplete step should appear first
- mobile should visually emphasize that step
- mobile should show a short diagnostic line like:
  - `Writing is the current gap`
  - `Study is the current gap`
  - `Review is the current gap`

---

## Product Behaviors Mobile Should Match

The mobile app should now aim to match these behaviors:

- Journal create supports guided-draft mode
- Journal validates inline annotation markup before submit
- Study Guide supports input → output handoff
- Study Guide shows linked guided responses
- Home screen shows:
  - 3-step daily loop
  - completion count
  - weekly loop progress
  - 7-day history
  - weakest-step guidance
- Home tab reflects loop urgency from the nav itself
- weakest incomplete step is prioritized
- weakest incomplete step is emphasized visually
- action buttons jump directly into the relevant task

---

## Backend/Data Assumptions Mobile Should Know

These fields now matter for guided workflows:

On `journal_entries`:
- `source_type`
- `source_ref`
- `source_prompt`

On daily practice:
- step completion is tracked historically
- review/study/write can be analyzed separately

If the Flutter app is using older assumptions where a journal entry is only freeform content, those assumptions are now incomplete.

---

## Recommended Mobile Work Order

1. Add Home tab and Today screen
2. Mirror the 3-step daily loop
3. Support guided journal drafts
4. Add journal annotation validation UI
5. Enrich Study Guide detail screen
6. Show guided response history in Study Guide
7. Add weekly/7-day habit signals
8. Add weakest-step prioritization and urgency indicator
9. Add nav-level urgency badge for Home
10. Make weakest step visually emphasized in the mobile Home UI

---

## Notes

- The web app is currently the source of truth for the learner-loop behavior.
- Mobile does not need to copy web layout exactly, but it should match the workflow.
- When new learner-loop changes ship on web, append them to this doc instead of starting a new handoff file each time.
