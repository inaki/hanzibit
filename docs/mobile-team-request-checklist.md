# Mobile Team Request Checklist

Use this when asking the other team for the remaining Phase 1 handoff materials.

---

## Requested Deliverables

### 1. `phase-1-readiness.md`

What we need:

- final Phase 1 scope definition
- confirmed user flows for Review, Study, Write
- acceptance criteria for “done” on web
- anything explicitly cut from Phase 1
- known edge cases or unresolved product decisions

### 2. `mobile-team-phase-1-handoff.md`

What we need:

- screen-by-screen mobile requirements
- navigation model and entry points
- exact API endpoints the mobile app should use
- request/response shapes for each Phase 1 flow
- required auth behavior for mobile
- error/loading/empty-state expectations
- any mobile-specific deviations from web

### 3. Guided journal draft contract

What we need:

- which fields are required vs optional
- the exact meaning of each draft field
- when each field should be set, preserved, or cleared
- examples of valid guided draft payloads
- rules for `draftSelectedText` and annotation replacement behavior

### 4. Persisted guided response contract

What we need:

- exact semantics for `source_type`, `source_ref`, `source_prompt`
- required values and allowed enums
- when those fields should be written on journal creation
- whether they are editable later
- example stored records

### 5. Study Guide detail spec

What we need:

- canonical structure of the Study Guide page
- content order for `Try These Phrases`, `Notice This Phrase`, `Quick Check`, `Listening Echo`, `Journal Response`
- which sections are mandatory vs conditional
- example response data for one full word

### 6. Home / Today behavior

What we need:

- how completion is computed for Review, Study, Write
- how the “weakest step” is determined
- how the “current focus word” is selected
- CTA priority rules when multiple recovery actions exist

### 7. Focused review rules

What we need:

- how the recommended word is chosen
- what “due mode” means in data terms
- how review links back to Study, Write, and latest response
- expected behavior when there is no recommended word

### 8. Gloss-to-writing handoff spec

What we need:

- supported launch contexts: token, phrase chip, passage
- exact payload passed into the guided writer
- how gloss selections map to draft fields
- expected UX when gloss data is partial

### 9. API source of truth

What we need:

- OpenAPI/spec docs or equivalent
- example JSON for all Phase 1 endpoints
- auth requirements for each endpoint
- error codes the app must handle
- any endpoint still unstable

### 10. Design references

What we need:

- current web screenshots or recordings for the completed Phase 1 flows
- any design tokens, spacing, typography, or interaction rules mobile should follow
- which parts should match web exactly versus adapt for mobile

---

## Preferred Format

Best format is:

- markdown docs in this repo, or
- a single handoff package with links to specs, examples, and screenshots

---

## Short Version

Please provide the final Phase 1 readiness doc, the mobile handoff doc, the API contract/examples, and the exact behavior specs for Home/Today, guided journal drafts, study guide detail, focused review, and gloss-to-writing.
