# Next Steps

A living doc. Update this whenever stopping work so the next session starts with full context.

---

## Last Session Summary (Phase 1 Learner Loop Checkpoint — 2026-04-12)

Completed:

1. **Phase 1 learner loop** — dashboard now acts as a real `Today’s Practice` surface with adaptive Review/Study/Write ordering, weekly loop history, weakest-step diagnosis, direct recovery CTAs, and exact-word progress tracking.
2. **Guided writing flow** — Study Guide and dashboard can open prefilled guided journal drafts with source metadata, study prompts, and target-word context instead of blank composition.
3. **Journal UX hardening** — inline annotation markup is validated before save, blocked when malformed, and reinforced server-side; guided drafts now show revision guidance and lightweight journal feedback.
4. **Study Guide upgrade** — no longer only a word browser; now includes input passages, response prompts, guided-response history, and a conditional today-loop panel for the active focus word with direct Review/Write/Open-response actions.
5. **Focused review continuity** — flashcards due mode can open on today’s focus word and now links back to the related study item, guided writing flow, and latest linked response.
6. **Annotation helper UX** — journal composers now include a lightweight annotation builder, can seed from live text selection, can replace selected text in-place, and can receive draft-level annotation candidates from reading surfaces.
7. **Input-to-output promotion** — Study Guide and notebook gloss flows can now launch guided writing from exact words and short phrases, not only generic word-detail actions.
8. **Mobile alignment docs** — `docs/mobile-team-update-phase-1.md` now tracks the running behavior changes, and `docs/mobile-team-phase-1-handoff.md` + `docs/phase-1-readiness.md` define the stable Phase 1 implementation target.

---

## Immediate Before Shipping

- [ ] Add `AZURE_TTS_KEY=your_key` and `AZURE_TTS_REGION=eastus` to `.env` — TTS returns 503 without them
- [ ] Smoke test end to end:
  - Hit review limit as free user → see upgrade prompt
  - Switch to HSK 2 as free user → see locked state in study guide
  - Streak increments after journal write or flashcard review (check Dashboard)
  - "Needs attention" section shows on Dashboard after scoring cards "Again" multiple times
  - Dark mode toggle persists on page refresh
  - Sign-out from avatar dropdown redirects to landing page
  - Pronounce button in flashcards plays audio

---

## Short-Term (Next Session)

- [x] **Billing portal link** — already wired in `settings-dialog.tsx` via `handleManageBilling` (lines 95–106). Shows "Manage Billing" button for Pro users.
- [x] **Flashcard speaker button** — added "Pronounce" button on card front face in `flashcard-practice.tsx`
- [x] **Gate grammar and export** — grammar page gates non-Pro with `UpgradePrompt`; print button in `action-bar.tsx` shows upgrade dialog for free users (`isPro` passed from notebook page server component)

---

## Medium-Term

- [ ] **Journal annotation UX refinement** — the inline markup `[汉字|pinyin|meaning]` is the app's core differentiator. The first helper layer is now shipped. Next useful refinements:
  - Auto-suggest CEDICT matches as the user types inside `[` brackets
  - Add a dedicated “save as annotation” path from interlinear gloss, not only guided journal launch
  - Improve phrase extraction and phrase-level annotation suggestions from reading surfaces
- [x] **Automated tests** — added lightweight test coverage for review gating, HSK access policy, streak logic, and `sm2`
- [x] **Mobile API normalization** — main mobile routes now share response/validation helpers and have more consistent error handling
- [x] **Guided daily learning loop** — first V1 is now shipped:
  - due reviews
  - one suggested study item
  - one guided writing task
  - completion summary, weekly history, and adaptive recovery
- [x] **Study guide as input surface** — first V1 is now shipped:
  - short graded text
  - handoff into journal writing
  - guided-response history
  - focus-word loop visibility
- [ ] **Phase 1 checkpoint cleanup** — remaining standalone-learner gaps:
  - deeper dictionary-backed annotation assistance beyond the current helper
  - deeper input-content system beyond the current reading + transcript-first listening blocks
  - real audio-backed input beyond transcript-first listening
  - final route-level validation polish where useful
- [ ] **HSK Skool comparison follow-up** — see `app-comparison.md` for the full breakdown. Main gap remaining: audio is still on-demand TTS, not pre-generated. Consider the Phase 2 audio script from `implementation-guide.md` once the `AZURE_TTS_KEY` is confirmed working
- [x] **Mobile handoff docs for Phase 1 learner-loop changes** — see `mobile-team-update-phase-1.md`, `mobile-team-phase-1-handoff.md`, and `phase-1-readiness.md`.

---

## Parking Lot (No Timeline)

- Admin/CMS for curriculum content — currently managed via seed scripts
- Native mobile / offline support
- Smarter spaced repetition (SM-2 is good but fixed; could adapt intervals based on historical fail rate per word)
- Social proof / activity feed for the landing page
