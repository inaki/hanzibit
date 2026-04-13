# Phase 1 Mobile Implementation Spec

This is the single handoff package for the other team.

It consolidates:

- Phase 1 scope
- stable vs changing decisions
- mobile screen requirements
- current API contracts
- guided draft contract
- persisted guided-response contract
- Study Guide / Home / focused review / gloss-to-writing behavior
- design references

Use this as the primary source of truth for Phase 1 mobile implementation.

Related docs:

- `docs/phase-1-readiness.md`
- `docs/mobile-team-phase-1-handoff.md`
- `docs/mobile-team-update-phase-1.md`
- `docs/flutter-team-kickoff-summary.md`

---

## 1. Final Phase 1 Scope

### Goal

Phase 1 turns HanziBit into a stable solo-learner loop:

1. Review
2. Study
3. Write

The product is no longer only a notebook + flashcards app. The intended Phase 1 experience is a guided daily learning system.

### Stable Phase 1 flows

- Home / Today loop
- guided journal drafts
- Study Guide as an input surface
- focused review
- gloss-to-writing continuity
- inline annotation validation and helper UX

### Explicitly out of Phase 1

- teacher/classroom workflows
- tutor marketplace
- real audio lesson system
- richer listening playback beyond transcript-style input
- dictionary-backed annotation autocomplete
- deep CMS/content-authoring system

### Acceptance criteria for “done” on web

Phase 1 is functionally “done enough” for parallel mobile work when:

- the learner can open the app and see the next recommended action
- Review, Study, and Write work as a coherent loop
- guided writing preserves reading context
- annotation is faster and safer than raw manual markup typing
- Study Guide and gloss both promote input directly into output
- the backend/mobile contract is stable enough to start parity work, even if not every future endpoint exists yet

### Known edge cases / unresolved decisions

- Guided drafts are still defined by navigation/query contract, not a server response contract.
- The mobile dashboard endpoint is still **legacy-oriented** (`streak`, `progress`, `stats`, `weakCards`, `characterOfTheDay`); mobile should use the dedicated Today endpoint for full Phase 1 Home behavior.
- Design screenshots/recordings are **not yet packaged in-repo**. Current design source of truth is the web implementation itself.

---

## 2. Stable vs Changing

### Stable enough to implement now

- Home / Today product model
- Review / Study / Write loop
- guided draft field names
- inline annotation markup format
- Study Guide section ordering
- focus-word continuity concept
- gloss token and gloss phrase launches

### Still changing

- exact mobile API shape for Today/Home
- dedicated mobile endpoint support for guided draft creation
- richer content depth
- audio/listening beyond transcript-first input
- smarter phrase extraction and annotation assistance

---

## 3. Mobile Screens And Navigation

### Navigation model

Recommended mobile top-level structure:

1. Home / Today
2. Journal
3. Study
4. Flashcards
5. Settings / account

Current web mobile nav also exposes:

- Home → `/notebook/dashboard`
- Study → `/notebook/lessons`
- Flashcards → `/notebook/flashcards`

### Entry points

- Home drives the learner to the current missing step
- Study Guide launches guided writing from multiple points
- Review launches due-mode first
- Glossed reading can launch writing directly

### Mobile-specific deviations from web

None by product intent. Mobile should mirror the web learner loop closely.

Practical difference:

- web currently uses route/query-driven guided drafts and server actions heavily
- mobile should preserve the same behavior, but will likely implement it as in-app navigation state plus API calls

---

## 4. Guided Journal Draft Contract

This is the current guided draft payload contract used by web navigation.

### Fields

| Field | Required | Meaning |
|---|---:|---|
| `draftTitleZh` | no | prefilled Chinese title |
| `draftTitleEn` | no | prefilled English title |
| `draftUnit` | no | unit/context label |
| `draftLevel` | no | HSK level for the draft |
| `draftContentZh` | no | initial textarea content |
| `draftSelectedText` | no | initial annotation candidate shown by the helper |
| `draftPrompt` | no | guided writing prompt |
| `draftSourceZh` | no | source Chinese text shown above the composer |
| `draftSourceEn` | no | source English gloss shown above the composer |
| `draftTargetWord` | no | primary target word for the task |
| `draftTargetPinyin` | no | target word pinyin |
| `draftTargetEnglish` | no | target word English gloss |
| `draftSourceType` | no | logical source system, currently `study_guide` when present |
| `draftSourceRef` | no | logical source identifier, currently usually HSK word id as string |

### Required vs optional

Strictly speaking, all draft fields are optional. The composer can still work as a blank entry flow.

For **guided** flows, the minimum useful fields are usually:

- `draftPrompt`
- `draftContentZh`

For **guided + source-aware** flows:

- `draftPrompt`
- `draftContentZh`
- `draftSourceType`
- `draftSourceRef`

For **guided + annotation-aware** flows:

- `draftPrompt`
- `draftContentZh`
- `draftSelectedText`

For **full target-word** flows:

- `draftTargetWord`
- `draftTargetPinyin`
- `draftTargetEnglish`

### Set / preserve / clear rules

- set these fields when launching a guided write flow from Home, Study Guide, focused review, or gloss
- preserve them while the user stays inside the current guided compose session
- clear them when the user exits the guided draft and starts a fresh blank entry
- do not persist these as draft-only fields in the database; only source metadata is persisted on create

### `draftSelectedText` rules

`draftSelectedText` means:

- this is the initial phrase/token the annotation helper should show before the user makes a live selection
- it does **not** mean the text must already be annotated
- it does **not** force insertion by itself

When the user inserts an annotation:

- if there is a current live selection in the textarea, the inserted annotation should replace that selected span in-place
- if there is no live selection, the helper can use `draftSelectedText` only as a seed for the annotation form, not as an automatic replacement target

### Valid payload examples

#### Example: Home → Write

```json
{
  "draftTitleZh": "今日练习",
  "draftTitleEn": "Daily practice",
  "draftUnit": "HSK 1 Daily Practice",
  "draftLevel": 1,
  "draftContentZh": "[爱|ai4|love]",
  "draftPrompt": "Write 3 to 5 sentences about your day or plans. Try to include 爱 (love) and at least one HSK 1 pattern you know.",
  "draftTargetWord": "爱",
  "draftTargetPinyin": "ai4",
  "draftTargetEnglish": "love",
  "draftSourceType": "study_guide",
  "draftSourceRef": "12"
}
```

#### Example: Study Guide phrase chip → Write

```json
{
  "draftTitleZh": "练习：爱",
  "draftTitleEn": "Practice: love",
  "draftUnit": "HSK 1 Study Guide",
  "draftLevel": 1,
  "draftContentZh": "[爱|ai4|love] 老师说“爱”很重要",
  "draftSelectedText": "老师说“爱”很重要",
  "draftPrompt": "Use the phrase \"老师说“爱”很重要\" in your own response and keep 爱 annotated.",
  "draftSourceZh": "今天我学习爱。老师说“爱”很重要。我回家以后用爱写一个短句。",
  "draftSourceEn": "Today I studied \"love.\" My teacher said \"love\" is important. After going home, I used it in a short sentence.",
  "draftTargetWord": "爱",
  "draftTargetPinyin": "ai4",
  "draftTargetEnglish": "love",
  "draftSourceType": "study_guide",
  "draftSourceRef": "12"
}
```

#### Example: Gloss phrase chip → Write

```json
{
  "draftTitleZh": "练习：我学习",
  "draftTitleEn": "Practice: I study",
  "draftUnit": "Notebook Gloss",
  "draftLevel": 1,
  "draftContentZh": "我学习",
  "draftSelectedText": "我学习",
  "draftPrompt": "Reuse the phrase \"我学习\" in 2-3 original sentences based on what you just read."
}
```

---

## 5. Persisted Guided Response Contract

These are the source-aware fields stored on `journal_entries`.

### Persisted fields

| Field | Type | Meaning |
|---|---|---|
| `source_type` | `string \| null` | logical source system |
| `source_ref` | `string \| null` | source object identifier |
| `source_prompt` | `string \| null` | prompt shown when the entry was created |

### Current semantics

- `source_type`
  - currently used value: `study_guide`
  - indicates the entry came from a guided Study Guide flow
- `source_ref`
  - currently usually the HSK word id as a string
  - allows the app to associate a journal entry back to a specific Study Guide word
- `source_prompt`
  - the prompt used when the entry was created
  - helps explain and recover the origin task

### Allowed enums

Currently only `study_guide` is used in shipped behavior.

Treat `source_type` as an open string field for future expansion, but for Phase 1 mobile parity the only expected non-null value is:

```text
study_guide
```

### When written

These fields are written on journal creation in the web server action path:

- `createJournalEntry` in `src/lib/actions.ts`

They are **not written on update**.

### Editable later?

Current behavior:

- not editable through normal journal update flow
- update only changes title, content, unit, HSK level

### Example stored record

```json
{
  "id": "f4fb3d5e-1b18-4d37-a2a9-3d17b7d17c01",
  "title_zh": "练习：爱",
  "title_en": "Practice: love",
  "unit": "HSK 1 Study Guide",
  "hsk_level": 1,
  "content_zh": "[爱|ai4|love] 老师说“爱”很重要。我今天也想用爱写一句话。",
  "source_type": "study_guide",
  "source_ref": "12",
  "source_prompt": "Use the phrase \"老师说“爱”很重要\" in your own response and keep 爱 annotated."
}
```

### Mobile parity status

Current mobile `POST /api/mobile/journal` now accepts and persists these fields.

---

## 6. Study Guide Detail Spec

### Canonical content order

For a selected word, the current intended order is:

1. word header
2. status badges
3. today-loop panel (conditional)
4. appeared-in journal list (conditional)
5. guided responses
6. input practice block:
   - reading title
   - reading passage
   - English gloss
   - `Try These Phrases`
   - `Notice This Phrase`
   - `Quick Check`
   - `Listening Echo`
   - `Journal Response`
7. flashcard status / create flashcard

### Mandatory vs conditional

Mandatory:

- word header
- input practice block
- guided responses section
- flashcard status/create button area

Conditional:

- today-loop panel: only when selected word matches current focus word
- appeared-in journal list: only when the word already appears in entries
- flashcard summary instead of create button: only when flashcard exists

### Example Study Guide response shape

This is the **current mobile API** shape from `GET /api/mobile/lessons?level=1`:

```json
{
  "level": 1,
  "locked": false,
  "summary": {
    "total": 148,
    "encountered": 4,
    "withFlashcard": 4,
    "dueForReview": 4
  },
  "grammarPoints": [],
  "words": [
    {
      "word": {
        "id": 12,
        "simplified": "爱",
        "traditional": "愛",
        "pinyin": "ai4",
        "english": "love",
        "hsk_level": 1
      },
      "encountered": true,
      "journalEntries": [
        {
          "id": "entry-1",
          "title_zh": "我的一天",
          "title_en": "My Day"
        }
      ],
      "guidedResponses": [
        {
          "id": "entry-2",
          "title_zh": "练习：爱",
          "title_en": "Practice: love",
          "created_at": "2026-04-12T15:20:00.000Z"
        }
      ],
      "flashcard": {
        "id": "card-1",
        "nextReview": "2026-04-13T00:00:00.000Z",
        "intervalDays": 1,
        "easeFactor": 2.5,
        "reviewCount": 2
      }
    }
  ]
}
```

### Important note

The extra reading/listening/prompt sections are currently **derived client-side**, not returned by the API. Web derives them via `buildStudyGuideReading(...)`.

So for mobile there are two options:

1. mirror the same derivation logic client-side for Phase 1 parity, or
2. add a new backend contract later

Current stable reality: **the mobile lessons API does not yet return the full Study Guide presentation model**.

---

## 7. Home / Today Behavior

### Product source of truth

Web computes this through `buildDailyPracticePlan(...)` in `src/lib/daily-practice.ts`.

Mobile now has a dedicated parity endpoint:

- `GET /api/mobile/today?level=1`

### Completion rules

Review complete:

- `dueCount === 0` OR `reviewsCompletedToday > 0`

Study complete:

- `guidedResponsesToday > 0`

Write complete:

- `guidedResponsesToday > 0` OR `entriesCreatedToday > 0`

### Weakest-step determination

The app compares the 7-day step completion counts:

- `reviewCompletedDays`
- `studyCompletedDays`
- `writeCompletedDays`

Weakest step = the step with the lowest completed-day count in the last 7 days.

### Current focus word selection

Current logic:

1. if there is a latest guided response today with `source_ref` + linked study word, use that word
2. otherwise fall back to `characterOfTheDay`

### CTA priority rules

Priority order:

1. incomplete focus-word step, if focus-word progress exists
2. first missing generic step
3. weakest step, if loop not complete

### Current API note

The mobile dashboard API is still legacy:

`GET /api/mobile/dashboard?level=1`

returns:

```json
{
  "streak": 4,
  "progress": {
    "encountered": 4,
    "total": 148,
    "percent": 3
  },
  "stats": {
    "entryCount": 12,
    "vocabCount": 34,
    "reviewCount": 50,
    "avgMastery": 68
  },
  "weakCards": [],
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

That is **not** the source of truth for full Phase 1 Home behavior.

For parity, mobile should use:

- `GET /api/mobile/today?level=1`

Example:

```json
{
  "dueCount": 4,
  "reviewsCompletedToday": 2,
  "entriesCreatedToday": 1,
  "guidedResponsesToday": 1,
  "reviewCompleted": true,
  "studyCompleted": true,
  "writeCompleted": true,
  "completedSteps": 3,
  "totalSteps": 3,
  "loopCompleted": true,
  "weeklyCompletedLoops": 5,
  "recentLoopHistory": [
    { "date": "2026-04-06", "label": "Mon", "completed": true, "isToday": false },
    { "date": "2026-04-07", "label": "Tue", "completed": false, "isToday": false },
    { "date": "2026-04-08", "label": "Wed", "completed": true, "isToday": false },
    { "date": "2026-04-09", "label": "Thu", "completed": true, "isToday": false },
    { "date": "2026-04-10", "label": "Fri", "completed": true, "isToday": false },
    { "date": "2026-04-11", "label": "Sat", "completed": false, "isToday": false },
    { "date": "2026-04-12", "label": "Sun", "completed": true, "isToday": true }
  ],
  "stepPattern": {
    "reviewCompletedDays": 5,
    "studyCompletedDays": 4,
    "writeCompletedDays": 3,
    "strongestStep": "review",
    "weakestStep": "write"
  },
  "stepPatternInsight": {
    "strongestLabel": "Review",
    "weakestLabel": "Writing",
    "weakestMessage": "Writing is the current gap. Turn one study item into a short guided response."
  },
  "missingSteps": [],
  "suggestedStudyLevel": 1,
  "writingPromptTitle": "Write one more variation",
  "writingPromptBody": "Reuse 爱 in a new sentence. Change the setting, time, or person so you practice flexible output.",
  "studyFocus": "Return to 爱 (ai4) and review it again in context.",
  "recommendedStudyWord": {
    "id": 12,
    "simplified": "爱",
    "pinyin": "ai4",
    "english": "love"
  },
  "focusWordProgress": {
    "reviewedToday": true,
    "studiedToday": true,
    "wroteToday": true,
    "completedSteps": 3,
    "totalSteps": 3
  },
  "latestGuidedResponseToday": {
    "id": "entry-2",
    "titleZh": "练习：爱",
    "titleEn": "Practice: love",
    "createdAt": "2026-04-12T15:20:00.000Z",
    "sourceRef": "12",
    "sourceWordSimplified": "爱",
    "sourceWordPinyin": "ai4"
  }
}
```

---

## 8. Focused Review Rules

### Recommended word selection

Same current focus-word logic as Home:

1. latest guided response today with study-guide linkage
2. otherwise character of the day

### Due mode

Current due mode means:

- load flashcards where `next_review <= now`
- review queue starts from due cards

Mobile endpoint:

- `GET /api/mobile/flashcards/due`

Example:

```json
[
  {
    "id": "card-1",
    "front": "爱",
    "back": "love",
    "deck": "journal",
    "next_review": "2026-04-12T00:00:00.000Z",
    "interval_days": 1,
    "ease_factor": 2.5,
    "review_count": 2,
    "source_entry_id": "entry-2",
    "created_at": "2026-04-10T12:00:00.000Z",
    "user_id": "user-1"
  }
]
```

### Review submission

Endpoint:

- `POST /api/mobile/flashcards/:id/review`

Request:

```json
{
  "quality": 4
}
```

Success response:

```json
{
  "interval": 6,
  "ease_factor": 2.5
}
```

Error responses:

- `401` → `{"error":"Unauthorized"}`
- `403` → `{"error":"DAILY_LIMIT_REACHED"}`
- `400` → `{"error":"quality must be between 1 and 5"}`
- `404` → `{"error":"Not found"}`

### Link-back behavior

On web, focused review can link back to:

- Study Guide for the same focus word
- guided writing draft for the same focus word
- latest guided response if one exists for that word today

This is currently driven by UI/state composition, not a dedicated API object.

### Behavior when no recommended word exists

- still open due mode
- no focus chip
- no focus-word-specific continuity required

---

## 9. Gloss-To-Writing Handoff Spec

### Supported launch contexts

Currently shipped:

- single gloss token
- gloss phrase chip

Not yet shipped:

- whole-passage launch

### Token launch payload

Example:

```json
{
  "draftTitleZh": "练习：爱",
  "draftTitleEn": "Practice: love",
  "draftUnit": "Notebook Gloss",
  "draftLevel": 1,
  "draftContentZh": "[爱|ai4|love]",
  "draftSelectedText": "爱",
  "draftPrompt": "Use 爱 in 2-3 original sentences based on what you just read.",
  "draftTargetWord": "爱",
  "draftTargetPinyin": "ai4",
  "draftTargetEnglish": "love"
}
```

### Phrase chip payload

Example:

```json
{
  "draftTitleZh": "练习：我学习",
  "draftTitleEn": "Practice: I study",
  "draftUnit": "Notebook Gloss",
  "draftLevel": 1,
  "draftContentZh": "我学习",
  "draftSelectedText": "我学习",
  "draftPrompt": "Reuse the phrase \"我学习\" in 2-3 original sentences based on what you just read."
}
```

### Gloss API

Mobile gloss endpoint:

- `POST /api/mobile/gloss`

Request:

```json
{
  "content": "今天我学习爱。"
}
```

Response:

```json
{
  "paragraphs": [
    [
      {
        "type": "gloss",
        "hanzi": "今天",
        "pinyin": "jin1 tian1",
        "english": "today",
        "userAnnotated": false
      },
      {
        "type": "gloss",
        "hanzi": "我",
        "pinyin": "wo3",
        "english": "I",
        "userAnnotated": false
      },
      {
        "type": "gloss",
        "hanzi": "学习",
        "pinyin": "xue2 xi2",
        "english": "study",
        "userAnnotated": false
      },
      {
        "type": "gloss",
        "hanzi": "爱",
        "pinyin": "ai4",
        "english": "love",
        "userAnnotated": false
      },
      {
        "type": "punctuation",
        "char": "。"
      }
    ]
  ]
}
```

### Expected UX when gloss data is partial

- unknown words may still appear with placeholder pinyin/English (`?`)
- token/phrase launch should still work with best available text
- if gloss metadata is incomplete, preserve the phrase/token text and degrade gracefully rather than blocking the write handoff

---

## 10. API Source Of Truth

### Auth behavior

Current mobile auth source:

- `getMobileUserId(req)` in `src/lib/mobile-auth.ts`

Behavior:

- accepts cookie-based sessions and Bearer-token-compatible session headers through `auth.api.getSession({ headers: req.headers })`
- unauthenticated requests return `401 {"error":"Unauthorized"}`

### Shared response helpers

- success: raw JSON via `mobileOk(data, status?)`
- error: `{ "error": "<message>" }` via `mobileError(error, status)`

### Current Phase 1 mobile endpoints

| Flow | Endpoint | Status |
|---|---|---|
| Today / daily practice | `GET /api/mobile/today?level=1` | stable |
| Dashboard legacy data | `GET /api/mobile/dashboard?level=1` | stable but legacy |
| Journal list | `GET /api/mobile/journal` | stable |
| Journal create | `POST /api/mobile/journal` | stable |
| Journal detail | `GET /api/mobile/journal/:id` | stable |
| Journal update | `PUT /api/mobile/journal/:id` | stable |
| Journal delete | `DELETE /api/mobile/journal/:id` | stable |
| Bookmark | `POST /api/mobile/journal/:id/bookmark` | stable |
| Study Guide data | `GET /api/mobile/lessons?level=1` | stable base data, incomplete presentation model |
| Study Guide detail presentation | `GET /api/mobile/lessons/:wordId?level=1` | stable |
| All flashcards | `GET /api/mobile/flashcards` | stable |
| Create flashcards | `POST /api/mobile/flashcards` | stable |
| Due flashcards | `GET /api/mobile/flashcards/due` | stable |
| Focused review continuity | `GET /api/mobile/flashcards/focus?level=1` | stable |
| Review flashcard | `POST /api/mobile/flashcards/:id/review` | stable |
| Delete flashcard | `DELETE /api/mobile/flashcards/:id` | stable |
| Gloss content | `POST /api/mobile/gloss` | stable |
| Review history | `GET /api/mobile/reviews` | stable |
| Subscription | `GET /api/mobile/subscription` | stable |

### Unstable / missing endpoints for mobile parity

These do **not** yet exist as dedicated mobile contracts:

- guided draft generation endpoint
- gloss-to-writing endpoint (this is currently a client-side navigation contract, not a backend response)

---

## 11. Concrete Request/Response Examples

### Journal create

Request:

```json
{
  "title_zh": "我的一天",
  "title_en": "My Day",
  "unit": "HSK 1 Daily Practice",
  "hsk_level": 1,
  "content_zh": "今天我学习[爱|ai4|love]。",
  "source_type": "study_guide",
  "source_ref": "12",
  "source_prompt": "Write 2 to 4 sentences about how you can use 爱 in daily life."
}
```

Response:

```json
{
  "id": "b1c2d3e4-f5a6-7890-1234-56789abcde01"
}
```

### Journal detail

Response:

```json
{
  "id": "b1c2d3e4-f5a6-7890-1234-56789abcde01",
  "user_id": "user-1",
  "title_zh": "我的一天",
  "title_en": "My Day",
  "unit": "HSK 1 Daily Practice",
  "hsk_level": 1,
  "content_zh": "今天我学习[爱|ai4|love]。",
  "bookmarked": 0,
  "source_type": "study_guide",
  "source_ref": "12",
  "source_prompt": "Write 2 to 4 sentences about how you can use 爱 in daily life.",
  "created_at": "2026-04-12T18:00:00.000Z",
  "updated_at": "2026-04-12T18:00:00.000Z"
}
```

### Flashcards create

Request:

```json
{
  "source_entry_id": "b1c2d3e4-f5a6-7890-1234-56789abcde01",
  "cards": [
    {
      "front": "爱",
      "back": "love",
      "deck": "journal"
    }
  ]
}
```

Response:

```json
{
  "saved": 1,
  "duplicates": 0,
  "invalid": 0
}
```

### Lessons locked response

Response:

```json
{
  "level": 2,
  "locked": true,
  "words": [],
  "grammarPoints": [],
  "summary": {
    "total": 0,
    "encountered": 0,
    "withFlashcard": 0,
    "dueForReview": 0
  }
}
```

### Study Guide detail presentation

Endpoint:

- `GET /api/mobile/lessons/12?level=1`

Response shape:

```json
{
  "level": 1,
  "locked": false,
  "item": {
    "word": {
      "id": 12,
      "simplified": "爱",
      "traditional": "愛",
      "pinyin": "ai4",
      "english": "love",
      "hsk_level": 1
    },
    "encountered": true,
    "journalEntries": [],
    "guidedResponses": [],
    "flashcard": null
  },
  "focusContext": {
    "isFocusWord": true,
    "focusWordProgress": {
      "reviewedToday": true,
      "studiedToday": false,
      "wroteToday": false,
      "completedSteps": 1,
      "totalSteps": 3
    },
    "latestResponse": null
  },
  "reviewTarget": {
    "mode": "due",
    "level": 1,
    "focusWord": "爱",
    "wordId": 12
  },
  "presentation": {
    "readingTitle": "Mini Reading with 爱",
    "readingPassageZh": "今天我学习爱。老师说“爱”很重要。我回家以后用爱写一个短句。",
    "readingPassageEn": "Today I studied \"love.\" My teacher said \"love\" is important. After going home, I used it in a short sentence.",
    "tryThesePhrases": [],
    "noticeThisPhrase": {
      "zh": "用爱写一个短句",
      "en": "use love in a short sentence",
      "draft": {}
    },
    "quickCheck": {
      "prompt": "Where did the learner use 爱 after class?"
    },
    "listeningEcho": {
      "zh": "老师问：“你今天怎么用爱？” 我说：“我想先用爱写一句话。”",
      "en": "The teacher asked, \"How will you use love today?\" I said, \"I want to use love in one sentence first.\"",
      "prompt": "Repeat the listening line in your own words and answer the same question with 爱.",
      "draft": {}
    },
    "journalResponse": {
      "prompt": "Write 2 to 4 sentences about how you can use 爱 in daily life.",
      "draft": {}
    }
  }
}
```

### Focused review continuity

Endpoint:

- `GET /api/mobile/flashcards/focus?level=1`

Response shape:

```json
{
  "dueCount": 4,
  "recommendedStudyWord": {
    "id": 12,
    "simplified": "爱",
    "pinyin": "ai4",
    "english": "love"
  },
  "focusWordProgress": {
    "reviewedToday": true,
    "studiedToday": false,
    "wroteToday": false,
    "completedSteps": 1,
    "totalSteps": 3
  },
  "latestGuidedResponseToday": null,
  "studyTarget": {
    "level": 1,
    "wordId": 12,
    "focusWord": "爱"
  },
  "writeDraft": {
    "draftTitleZh": "今日练习",
    "draftTitleEn": "Daily practice",
    "draftUnit": "HSK 1 Daily Practice",
    "draftLevel": 1,
    "draftContentZh": "[爱|ai4|love]",
    "draftPrompt": "Write 3 to 5 sentences about your day or plans. Try to include 爱 (love) and at least one HSK 1 pattern you know.",
    "draftTargetWord": "爱",
    "draftTargetPinyin": "ai4",
    "draftTargetEnglish": "love",
    "draftSourceType": "study_guide",
    "draftSourceRef": "12"
  }
}
```

---

## 12. Error / Loading / Empty-State Expectations

### Auth errors

- always handle `401 Unauthorized`

### Validation errors

Examples:

- `{"error":"title_zh is required"}`
- `{"error":"content_zh is required"}`
- `{"error":"hsk_level must be between 1 and 6"}`
- `{"error":"quality must be between 1 and 5"}`
- markup validator errors such as:
  - `{"error":"Opening [ is missing a closing ]."}`

### Not found

- `404 {"error":"Not found"}`

### Review limit

- `403 {"error":"DAILY_LIMIT_REACHED"}`

### Empty states

Recommended mobile behavior should match web intent:

- no journal entries → prompt to create first entry
- no due flashcards → treat review as complete / show success empty state
- locked HSK level → show locked Study Guide state, not a generic error
- no guided responses for a Study Guide word → show “No guided response yet”

### Loading states

Recommended to mirror web behavior:

- Home/Today loading skeleton or lightweight loading text
- Study Guide detail loading when level/word changes
- gloss loading state before interlinear data resolves

---

## 13. Design References

### Current design source of truth

These files are the real reference for completed Phase 1 web behavior:

- Home / Today: `src/components/notebook/dashboard-view.tsx`
- Guided journal composer: `src/components/notebook/action-bar.tsx`
- Mobile journal composer: `src/components/notebook/mobile-journal-page.tsx`
- Study Guide detail: `src/components/notebook/study-guide.tsx`
- Focused review: `src/components/notebook/flashcard-practice.tsx`
- Gloss UI: `src/components/notebook/interlinear-gloss-view.tsx`
- Journal display: `src/components/notebook/journal-entry.tsx`

### What should match web closely

- overall loop structure
- CTA priority
- section ordering in Study Guide
- guided draft field behavior
- annotation helper semantics
- focus-word continuity

### What can adapt for mobile

- screen layout
- spacing density
- tab/navigation presentation
- card stacking and section collapse behavior

### Screenshot / recording status

There is **not yet** a packaged screenshot set in this repo.

If screenshots are required before implementation starts, they still need to be captured separately from the current web app.

---

## 14. Recommended Next Steps For The Other Team

1. Build against the stable product model in this doc
2. Treat current API parity gaps as known backend follow-ups, not hidden assumptions
3. Start with:
   - Home / Today
   - guided journal composer
   - Study Guide detail
   - focused review
4. Flag any need for:
   - dedicated Today endpoint
   - guided source metadata support in mobile journal create
   - precomputed Study Guide presentation API

That is the current minimum implementation package.
