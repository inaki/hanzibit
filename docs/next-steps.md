# Next Steps

A living doc. Update this whenever stopping work so the next session starts with full context.

---

## Last Session Summary (Session 2 — 2026-04-02)

Completed:

1. **Dashboard page** — new `/notebook/dashboard` route with `DashboardView` client component. Shows streak, journal entries, reviews, HSK progress bar, flashcard count, character of the day, and "Needs Attention" weak cards section. Pulled streak/weak cards out of the sidebar entirely.
2. **Sidebar refactor** — stripped to navigation + character of the day only. Added "Dashboard" as first nav item (`LayoutDashboard` icon). Removed all progress/streak state.
3. **Avatar dropdown** — clicking the nav avatar opens a dropdown with user name/email, dark mode toggle, and sign-out. Sign-out calls `signOut()` then redirects to `/`.
4. **Dark mode** — full implementation: CSS variables already in `globals.css`; added toggle via `.dark` class on `<html>` persisted to `localStorage`; replaced all hardcoded `bg-white`, `bg-gray-*`, `text-gray-*`, `border-gray-*` with semantic tokens (`bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`) across all 15 notebook components.
5. **Azure TTS** — `/api/tts/route.ts` using `zh-CN-XiaoxiaoNeural` with SSML at 0.85 rate, 24h cache. Requires `AZURE_TTS_KEY` + `AZURE_TTS_REGION` env vars.

Previous session (Session 1):

1. **Paywall** — `src/lib/gates.ts`, gated `reviewFlashcard` action (5/day free limit), gated HSK levels 2–6 in study guide, `UpgradePrompt` component
2. **Streaks** — `getUserStreak()` in `data.ts`, today-grace logic
3. **Weak item surfacing** — `getWeakFlashcards()` in `data.ts`, "struggling" badge in study guide, due queue ordered by ease_factor ASC
4. Sidebar scrolling fix, Dialog max-height fix

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

- [ ] **Journal annotation UX** — the inline markup `[汉字|pinyin|meaning]` is the app's core differentiator. Ideas to make it easier:
  - Auto-suggest CEDICT matches as the user types inside `[` brackets
  - One-click annotate from the interlinear gloss view
- [x] **Automated tests** — added lightweight test coverage for review gating, HSK access policy, streak logic, and `sm2`
- [x] **Mobile API normalization** — main mobile routes now share response/validation helpers and have more consistent error handling
- [ ] **Guided daily learning loop** — begin first `Today` flow:
  - due reviews
  - one suggested writing task
  - quick completion summary
- [ ] **Study guide as input surface** — start evolving `lessons/study-guide` beyond vocabulary browsing with short graded text and handoff into journal writing
- [ ] **HSK Skool comparison follow-up** — see `app-comparison.md` for the full breakdown. Main gap remaining: audio is still on-demand TTS, not pre-generated. Consider the Phase 2 audio script from `implementation-guide.md` once the `AZURE_TTS_KEY` is confirmed working
- [x] **Mobile handoff doc for Phase 1 learner-loop changes** — see `mobile-team-update-phase-1.md`. Keep this updated as web-side learner-loop behavior changes so the Flutter project can mirror the same workflows.

---

## Parking Lot (No Timeline)

- Admin/CMS for curriculum content — currently managed via seed scripts
- Native mobile / offline support
- Smarter spaced repetition (SM-2 is good but fixed; could adapt intervals based on historical fail rate per word)
- Social proof / activity feed for the landing page
