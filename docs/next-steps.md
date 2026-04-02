# Next Steps

A living doc. Update this whenever stopping work so the next session starts with full context.

---

## Last Session Summary

Implemented all four priorities from `implementation-guide.md`:

1. **Paywall** — `src/lib/gates.ts`, gated `reviewFlashcard` action (5/day free limit), gated HSK levels 2–6 in study guide, `UpgradePrompt` component
2. **Streaks** — `getUserStreak()` in `data.ts`, streak widget in sidebar with flame icon and today-grace logic
3. **Weak item surfacing** — `getWeakFlashcards()` in `data.ts`, "Needs attention" sidebar section, "struggling" badge in study guide word list, due flashcard queue ordered by ease_factor ASC
4. **Audio** — `/api/api/tts/route.ts` server-side Google Cloud TTS, replaced browser `SpeechSynthesisUtterance` in `action-bar.tsx` and `mobile-journal-page.tsx`

Also fixed:
- Sidebar scrolling (`overflow-y-auto h-full` on the `aside`)
- Dialog max height (`max-h-[90dvh] overflow-y-auto` on `DialogContent`)

---

## Immediate Before Shipping

- [ ] Add `AZURE_TTS_KEY=your_key` and `AZURE_TTS_REGION=eastus` to `.env` — TTS returns 503 without them
- [ ] Smoke test the four new features end to end:
  - Hit review limit as free user → see upgrade prompt
  - Switch to HSK 2 as free user → see locked state
  - Streak appears in sidebar after journal write or flashcard review
  - "Needs attention" appears after scoring cards "Again" multiple times

---

## Short-Term (Next Session)

- [x] **Billing portal link** — already wired in `settings-dialog.tsx` via `handleManageBilling` (lines 95–106). Shows "Manage Billing" button for Pro users.
- [x] **Flashcard speaker button** — added "Pronounce" button on card front face in `flashcard-practice.tsx`
- [x] **Gate grammar and export** — grammar page gates non-Pro with `UpgradePrompt`; print button in `action-bar.tsx` shows upgrade dialog for free users (`isPro` passed from notebook page server component)

---

## Medium-Term

- [ ] **Journal annotation UX** — the inline markup `[汉字|pinyin|meaning]` is the app's core differentiator. Ideas to make it easier:
  - Auto-suggest CEDICT matches as the user types inside `[` brackets
  - One-click annotate from the interlinear gloss view
- [ ] **Automated tests** — the stateful logic we just added is untested. Priority functions to cover:
  - `canReviewFlashcard` (count boundary, pro bypass)
  - `getUserStreak` (0 case, today-grace, reset after gap)
  - `getWeakFlashcards` (ease threshold, review_count filter)
- [ ] **HSK Skool comparison follow-up** — see `app-comparison.md` for the full breakdown. Main gap remaining: audio is still on-demand TTS, not pre-generated. Consider the Phase 2 audio script from `implementation-guide.md` once the `AZURE_TTS_KEY` is confirmed working

---

## Parking Lot (No Timeline)

- Admin/CMS for curriculum content — currently managed via seed scripts
- Native mobile / offline support
- Smarter spaced repetition (SM-2 is good but fixed; could adapt intervals based on historical fail rate per word)
- Social proof / activity feed for the landing page
