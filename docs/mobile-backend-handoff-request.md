# Mobile Backend Handoff Request

We have started the Phase 1 mobile implementation in the Flutter app using the web app as source of truth. The mobile client now supports the Review / Study / Write loop structure, guided draft routing, Study Guide derived content, focused review continuity, and gloss-to-writing handoff.

To reach full parity cleanly, we need the backend/mobile contracts below.

---

## Status

The required backend parity items in this request have now been implemented in this repo.

Completed:

- `POST /api/mobile/journal` now persists `source_type`, `source_ref`, and `source_prompt`
- `GET /api/mobile/dashboard` now returns `characterOfTheDay.id`
- `GET /api/mobile/today?level=1` now exposes the web-style `DailyPracticePlan`

The remaining sections below are kept as implementation notes and follow-up context.

---

## Priority 1: Journal Create Parity

### Request

Update `POST /api/mobile/journal` so it accepts and persists:

- `source_type`
- `source_ref`
- `source_prompt`

### Why

The mobile app now sends guided-response source metadata when creating entries. This is required for:

- focus-word continuity
- linking guided responses back to Study Guide words
- recovering the origin prompt
- matching web guided journal behavior

### Current gap

Web server action path already persists these fields.  
Mobile API create path does not yet persist them.

### Expected request shape

```json
{
  "title_zh": "练习：爱",
  "title_en": "Practice: love",
  "unit": "HSK 1 Study Guide",
  "hsk_level": 1,
  "content_zh": "[爱|ai4|love] 老师说“爱”很重要。",
  "source_type": "study_guide",
  "source_ref": "12",
  "source_prompt": "Use the phrase \"老师说“爱”很重要\" in your own response and keep 爱 annotated."
}
```

### Expected behavior

- persist all 3 fields on create
- return either the created entry or `{ "id": "<entry-id>" }`
- preserve existing validation behavior

---

## Priority 2: Dashboard Focus Word Id

### Request

Update `GET /api/mobile/dashboard` so `characterOfTheDay` includes:

- `id`

### Why

The mobile app needs the study-word id to route from Home and focused review back into the correct Study Guide word detail.

### Current gap

Current mobile dashboard returns:

- `simplified`
- `traditional`
- `pinyin`
- `english`
- `hsk_level`

But not `id`.

### Expected shape

```json
{
  "characterOfTheDay": {
    "id": 12,
    "simplified": "爱",
    "traditional": "愛",
    "pinyin": "ai4",
    "english": "love",
    "hsk_level": 1
  }
}
```

---

## Priority 3: Dedicated Today / Daily Practice Endpoint

### Request

Add a dedicated mobile endpoint that returns the web-style `DailyPracticePlan`.

Suggested endpoint:

- `GET /api/mobile/today?level=1`

### Why

Right now mobile is deriving Today/Home behavior client-side from multiple endpoints. That works as a temporary bridge, but the real source of truth already exists in web via `buildDailyPracticePlan(...)`.

A dedicated mobile endpoint would make Home consistent, simpler, and less fragile.

### We need this response to include

- `dueCount`
- `reviewsCompletedToday`
- `entriesCreatedToday`
- `guidedResponsesToday`
- `reviewCompleted`
- `studyCompleted`
- `writeCompleted`
- `completedSteps`
- `totalSteps`
- `loopCompleted`
- `weeklyCompletedLoops`
- `recentLoopHistory`
- `stepPattern`
- `stepPatternInsight`
- `missingSteps`
- `suggestedStudyLevel`
- `writingPromptTitle`
- `writingPromptBody`
- `studyFocus`
- `recommendedStudyWord`
- `focusWordProgress`
- `latestGuidedResponseToday`

### Best implementation path

Reuse the existing web logic:

- `buildDailyPracticePlan(...)`
- same focus-word selection
- same completion rules
- same weakest-step logic
- same CTA/missing-step semantics

---

## Nice To Have: Study Guide Presentation Endpoint

### Request

Consider adding a dedicated Study Guide presentation contract, or enrich the mobile lessons endpoint to include precomputed reading/listening/prompt blocks.

### Why

Mobile currently mirrors the web derivation logic client-side using the same content rules. That is fine for now, but backend-owned presentation would reduce drift.

### Current client-derived sections

- reading title
- reading passage
- English gloss
- Try These Phrases
- Notice This Phrase
- Quick Check
- Listening Echo
- Journal Response

This is not blocking, but it would improve parity maintenance.

---

## Optional Future Endpoint

### Focused review continuity endpoint

Not urgent, but if you want mobile/web parity to be cleaner later, a dedicated review continuity payload could expose:

- focus word
- study link target
- guided write launch payload
- latest guided response for that word

Right now mobile composes this client-side.

---

## Summary

### Required now

1. Persist `source_type`, `source_ref`, `source_prompt` in `POST /api/mobile/journal`
2. Include `characterOfTheDay.id` in `GET /api/mobile/dashboard`
3. Add a dedicated `DailyPracticePlan` mobile endpoint

### Helpful but not blocking

4. Study Guide presentation endpoint
5. Focused review continuity endpoint

### Source of truth to reuse

- `src/lib/actions.ts`
- `src/lib/daily-practice.ts`
- `src/lib/study-guide-content.ts`

Short version:

> Please add mobile parity for guided journal metadata persistence, include `characterOfTheDay.id` in the mobile dashboard response, and expose a dedicated mobile Today/DailyPracticePlan endpoint using the existing web logic.
