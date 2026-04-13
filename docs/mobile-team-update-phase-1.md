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
- `draftTargetPinyin`
- `draftTargetEnglish`
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
- when target-word pinyin/meaning exist, mobile can offer a one-tap target-word annotation insert in the composer

---

### 22. Guided drafts now carry enough context for one-tap target-word annotation

The journal annotation helper is no longer only generic/manual.

Current web behavior:
- guided draft links now carry:
  - target word
  - target pinyin when available
  - target English meaning when available
- the journal composer can use that context to offer:
  - `Insert target word`
- this inserts a ready-made `[汉字|pinyin|meaning]` block into the draft
- some guided-entry flows can now prefill `draftContentZh` with an annotation-ready block when the full word context is known

Mobile implication:
- Flutter guided journal drafts should preserve the richer target-word payload
- when `draftTargetWord`, `draftTargetPinyin`, and `draftTargetEnglish` are present, mobile should offer a quick insert for that exact annotation
- this is especially useful for:
  - Study Guide → Journal
  - Dashboard → guided writing
- when mobile already has all three parts, it can also prefill the initial content with the formatted annotation instead of only raw Hanzi

---

### 23. The Study Guide input block can now promote the focus phrase directly into writing

The input surface itself now has a phrase-to-output action.

Current web behavior:
- inside `Notice This Phrase`, the Study Guide now shows:
  - `Use this phrase in journal`
- that action opens the journal with:
  - the target word already annotation-ready
  - the focus phrase already present in the draft
  - a prompt that explicitly asks the learner to reuse the phrase in their own response

Mobile implication:
- Flutter Study Guide detail screens should support a direct phrase-to-journal handoff from the input block
- mobile should preserve both:
  - target-word annotation context
  - focus-phrase reuse context
- this makes the input surface more than reference content; it becomes a direct output launcher

---

### 24. The notebook gloss view can now promote a glossed word into a guided draft

The first in-notebook gloss-to-journal path now exists.

Current web behavior:
- in the interlinear gloss view, glossed words can show:
  - `Use in journal`
- that action opens a new guided journal draft while keeping the current notebook entry selected
- the draft starts with the clicked gloss token already annotation-ready
- the prompt asks the learner to reuse that word in original sentences based on what they just read

Mobile implication:
- when Flutter implements an interlinear or glossed reading surface, glossed words should be able to launch guided writing directly
- mobile should preserve reading continuity while opening a new output action for the selected gloss token
- this is the first concrete gloss-to-output bridge and should inform later mobile gloss UX

---

### 25. The journal annotation helper can now seed itself from the current text selection

The composer-side annotation flow is no longer only manual.

Current web behavior:
- in both desktop and mobile journal editors, the annotation helper can detect the current textarea selection
- when text is selected, the helper shows:
  - `Current selection`
  - `Use selection`
- using that action copies the selected span into the annotation builder’s Hanzi field
- if the selected span matches the guided target word, the helper also autofills:
  - pinyin
  - English meaning

Mobile implication:
- Flutter journal editors should support selection-aware annotation creation, not only manual typing
- the mobile composer should be able to lift the current selection into the annotation helper
- when the selection matches the guided target word payload, mobile should autofill the rest of the annotation too
- this reduces friction for turning exact spans into saved inline vocabulary

---

### 26. Reading surfaces can now send a draft-level annotation candidate into the journal

The journal no longer needs a live textarea selection to start a focused annotation flow.

Current web behavior:
- reading-originated journal links can now send:
  - `draftSelectedText`
- the journal composer uses that as the initial annotation candidate in the helper
- this is currently used by:
  - Study Guide `Use this phrase in journal`
  - gloss-to-journal links from the notebook reader
- once inside the composer, the learner can still replace that candidate with a new live selection

Mobile implication:
- Flutter should support a draft-level annotation candidate field in guided journal routes
- when `draftSelectedText` exists, mobile should show it in the annotation helper even before the user selects text in the editor
- this lets reading surfaces pass an exact phrase or token into output without forcing immediate manual re-selection

---

### 27. The Study Guide passage now exposes multiple phrase-level writing launches

The reading surface is no longer limited to a single predefined phrase CTA.

Current web behavior:
- the Study Guide input block now shows a `Try These Phrases` row
- each phrase chip launches the journal with:
  - `draftSelectedText`
  - the phrase already present in draft content
  - the same study-item source metadata
- this sits alongside the original `Use this phrase in journal` CTA

Mobile implication:
- Flutter Study Guide detail should support multiple phrase-level actions from the reading block
- these should behave like lightweight phrase chips, not only one large CTA
- each chip should open a guided writing flow with the selected phrase preserved as annotation context

---

### 28. The notebook gloss view now exposes short phrase chips, not only single-word launches

The gloss-to-output bridge is now richer inside the notebook reader.

Current web behavior:
- each gloss paragraph can now show a `Try a phrase` row
- the row contains short phrase chips derived from adjacent gloss tokens
- each chip opens the journal with:
  - the exact phrase in `draftContentZh`
  - the same phrase in `draftSelectedText`
  - a phrase-specific writing prompt
- single-token `Use in journal` links still exist alongside this

Mobile implication:
- when Flutter implements glossed reading, it should support both:
  - single-token launch actions
  - short phrase chips derived from nearby reading context
- phrase chips should preserve exact phrase text into the guided journal route, not only a generic target word

---

### 29. The Study Guide now includes a transcript-style listening block

The input surface now includes one more structured input mode besides reading.

Current web behavior:
- each Study Guide detail now includes a `Listening Echo` block
- the block contains:
  - a short transcript-style Chinese line
  - English gloss
  - a response prompt
- the CTA opens guided writing with:
  - the listening line in `draftContentZh`
  - the same line in `draftSelectedText`
  - the listening prompt as the writing task

Mobile implication:
- Flutter Study Guide detail should support a listening/transcript block even before real audio playback exists
- mobile can treat this as transcript-first listening practice in Phase 1
- the response CTA should preserve the full listening line as annotation context, not only the target word

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

### 11. Summary-level recovery actions now exist

The web dashboard summary now includes direct recovery actions tied to the current weakest step.

Current web behavior:
- the Today summary diagnosis can render a direct CTA
- desktop shows a summary CTA like:
  - `Focus on review`
  - `Focus on study`
  - `Focus on writing`
- mobile shows a more explicit top-level recovery CTA like:
  - `Focus on writing now`

These summary CTAs route directly into the correct workflow:
- review → due flashcards
- study → related study item or study guide
- writing → guided journal draft

Mobile implication:
- Flutter Home should support a top-level recovery CTA near the summary, not only inside the cards
- the CTA should route directly into the correct task
- mobile should prioritize “act now” behavior over requiring the learner to inspect the whole screen first

---

### 12. Recommended study word now drives dashboard recovery flows

The dashboard no longer depends only on “latest guided response today” to know what Study and Write should target.

Current web behavior:
- the daily plan now exposes a `recommendedStudyWord`
- this can come from:
  - the study item linked to the latest guided response
  - or the character/word of the day fallback when no guided response exists yet
- the dashboard uses that recommended study word to:
  - open an exact study-guide item
  - seed the guided journal draft
  - build more accurate writing prompts

Current recommended study word shape:
- `id`
- `simplified`
- `pinyin`
- `english`

Mobile implication:
- Flutter should treat `recommendedStudyWord` as the preferred context source for Study and Write
- mobile should not require an existing guided response before offering exact recovery actions
- mobile guided writing should include the target word and source reference when available
- mobile should use the English gloss too, not only Hanzi/pinyin

---

### 13. Review now participates in the same focus-word loop

The daily loop no longer treats flashcard review as a separate generic task.

Current web behavior:
- Review actions can open a due-review session with exact focus-word context
- the review route now carries:
  - `mode=due`
  - `focus=<recommendedStudyWord.simplified>`
  - `wordId=<recommendedStudyWord.id>`
  - `level=<current hsk level>`
- if the focus word has a matching flashcard, the review session starts on that card first
- the flashcard screen shows a `Focus word` chip
- when the learner lands on the focus card, the screen shows a `Today’s Focus` panel
- that panel can link back to the exact Study Guide item for the same word

Mobile implication:
- Flutter review flows should support a focused-entry mode, not only a generic review queue
- when a recommended study word exists, mobile should try to start review on that card first
- mobile review UI should visibly explain when the learner is on today’s focus word
- mobile should preserve continuity from review back to the related study item when context exists

---

### 14. The dashboard now tracks exact-word loop progress

The daily loop summary now distinguishes between:
- generic step completion for today
- completion with the exact recommended study word

Current web behavior:
- the backend returns focus-word activity for the current recommended word
- review is counted from today’s flashcard review labels
- study/write are counted from guided responses linked to the same `source_ref`
- the Today summary shows a compact line like:
  - `Today with 好: Review / Study / Write`
- each badge reflects whether that exact word has already moved through the loop today

Mobile implication:
- Flutter Home should be able to show word-specific loop progress, not only generic “done today” state
- if mobile already has a focus word, it should show whether the learner has:
  - reviewed that word
  - studied that word
  - written with that word
- mobile should preserve the distinction between:
  - `I reviewed something today`
  - `I reviewed today’s focus word today`

---

### 15. Recovery CTAs can now target the missing step for the exact focus word

The top recovery CTA is now more specific when the learner has partially completed the loop for the current focus word.

Current web behavior:
- if the learner has a recommended study word and exact-word progress exists, the dashboard prefers that context over the generic weakest-step diagnosis
- the CTA can now say things like:
  - `Finish reviewing 好`
  - `Finish studying 好`
  - `Finish writing with 好`
- these CTAs still route into the same direct workflows:
  - review → focused due-review flow
  - study → exact study item
  - write → guided journal draft

Mobile implication:
- Flutter should prefer exact-word recovery language when a focus word is active and only part of that word’s loop is complete
- mobile should not fall back to generic copy like `Focus on writing` if it can say `Finish writing with 好`
- mobile routing should stay direct even when the CTA copy becomes more specific

---

### 16. Step cards now acknowledge exact-word completion

The Review, Study, and Write cards now use exact-word completion language when that context exists.

Current web behavior:
- Review can say:
  - `You already reviewed 好 today.`
- Study can say:
  - `You already studied 好 in context today.`
- Write can say:
  - `You already wrote with 好 today.`
- if exact-word context is not available, the cards still fall back to generic daily status

Mobile implication:
- Flutter Home cards should prefer exact-word status copy when a current focus word exists
- mobile should not only show generic `Done` / `Pending`; it should explain completion with the actual word when possible
- this applies to the body copy of the three daily-practice cards, not only the top summary

---

### 17. Step cards now support a separate focus-word status badge

The daily-practice cards can now show two kinds of status at once:
- generic step status
- focus-word status

Current web behavior:
- each card still shows generic `Done` or `Pending`
- when a focus word exists, the card can also show a separate `Focus word` badge
- this lets the learner distinguish:
  - `I completed this step today`
  - `I completed this step with today’s target word`

Mobile implication:
- Flutter Home cards should support a second, focus-word-specific status treatment when a current focus word exists
- mobile does not need to copy the exact badge styling, but it should preserve the distinction between generic completion and focus-word completion
- the second badge should appear at the card level, not only in the top summary

---

### 18. The Study Guide can now show today’s loop progress for the active focus word

The Study Guide detail panel is no longer only static word information.

Current web behavior:
- the Study Guide now loads today’s daily-practice context
- if the selected word matches the current `recommendedStudyWord`, the detail panel shows:
  - a `Today’s focus` badge
  - a `Today’s Loop` panel
  - Review / Study / Write status pills for that exact word
- if the selected word is not the current focus word, the panel does not appear

Mobile implication:
- Flutter Study Guide detail screens should be able to show today’s loop context when the learner opens the active focus word
- mobile should not require the learner to go back to Home to understand progress on the current target word
- this loop panel should be conditional, not shown for every study item

---

### 19. The Study Guide loop panel is now actionable

The focus-word loop panel in the Study Guide is no longer just informational.

Current web behavior:
- if Review is still missing for the active focus word, the panel shows `Review now`
- if Write is still missing for the active focus word, the panel shows `Write now`
- these actions route directly into:
  - focused due-review flow
  - guided journal draft for the same study item

Mobile implication:
- Flutter Study Guide detail screens should support direct recovery actions inside the loop panel, not only status display
- if a focus-word step is still missing, mobile should let the learner act from the Study Guide immediately
- these actions should preserve exact word context

---

### 20. The Study Guide loop panel can reopen the latest response

The Study Guide can now act as a review surface for output the learner already completed.

Current web behavior:
- when the focus-word writing step is already complete
- and the latest guided response belongs to the current study item
- the loop panel shows `Open latest response`
- that link opens the existing journal entry directly

Mobile implication:
- Flutter Study Guide detail screens should support reopening the latest linked guided response when writing is already complete
- mobile should treat the Study Guide as both:
  - a place to start the loop
  - a place to revisit completed output for the same word

---

### 21. The focused review panel can reopen the latest response too

The flashcard review surface now has the same continuity as the Study Guide.

Current web behavior:
- when the learner is on today’s focus card
- and the latest guided response belongs to that same study item
- the `Today’s Focus` panel can show `Open latest response`
- this lives alongside:
  - `Back to study item`
  - `Write with this word`

Mobile implication:
- Flutter focused-review screens should support reopening the latest linked response when that context exists
- mobile review should preserve continuity in both directions:
  - review → study
  - review → write
  - review → existing response

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
- weakest-step diagnosis exposes a direct recovery CTA
- Review can start in focused mode for the current study word
- focused review can link back to the related Study Guide item
- Home can show exact-word loop progress for the current focus word
- recovery CTAs can target the missing step for the current focus word
- step cards can explain exact-word completion when context exists
- step cards can show separate generic and focus-word status
- Study Guide detail can show today’s loop progress for the current focus word
- Study Guide loop panel can trigger direct Review/Write recovery actions
- Study Guide loop panel can reopen the latest linked response
- focused review can reopen the latest linked response too
- guided drafts can support one-tap target-word annotation insertion
- Study Guide input blocks can launch phrase-specific guided writing
- glossed reading tokens can launch guided writing directly
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
- `recommendedStudyWord` now affects Review as well as Study/Write
- exact-word step completion can now be derived for the current focus word

On focused review/navigation:
- review can carry `focus`
- review can carry `wordId`
- review can carry `level`

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
11. Add a top-level mobile recovery CTA for the current weakest step
12. Add focused-review entry behavior for the recommended study word
13. Add review-to-study return link when word context exists
14. Add exact-word loop progress display for the current focus word
15. Prefer exact-word recovery CTAs over generic step CTAs when context exists
16. Use exact-word completion copy inside Review/Study/Write cards when context exists
17. Add a separate focus-word status badge to the daily-practice cards
18. Add a conditional today-loop panel to the Study Guide detail screen
19. Add direct Review/Write actions inside the Study Guide loop panel
20. Add an `Open latest response` action to the Study Guide loop panel when writing is already complete
21. Add an `Open latest response` action to the focused review panel when linked output exists
22. Support richer guided-draft target-word payload and one-tap target-word annotation insert
23. Add `Use this phrase in journal` from the Study Guide input block
24. Add `Use in journal` from glossed reading tokens

---

## Notes

- The web app is currently the source of truth for the learner-loop behavior.
- Mobile does not need to copy web layout exactly, but it should match the workflow.
- When new learner-loop changes ship on web, append them to this doc instead of starting a new handoff file each time.
