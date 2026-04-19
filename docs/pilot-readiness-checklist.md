# Pilot Readiness Checklist

Use this before treating HanziBit as ready for real daily learner use.

## Product Focus

- [x] learner navigation is simplified enough for a solo beginner — sidebar hides advanced items for beginners; teacher nav is role-gated
- [x] teacher-only complexity stays out of the way unless relevant — Teaching/Teacher links are role-conditional
- [x] the dashboard clearly tells a new learner what to do next — first-run welcome panel, step cards, single CTA

## Onboarding

- [x] sign up works cleanly — email + social providers, redirects to dashboard
- [x] sign in works cleanly
- [x] first dashboard load is understandable for a beginner — isBeginnerFirstRun flow with welcome, 3-step cards, "Start with one word →" CTA
- [x] empty states give useful action guidance — notebook page and flashcard page now have CTAs pointing to Study Guide
- [x] first study action is obvious — beginner Study Guide mode shows word + tiny example + "Open tiny review →"

## Core Learner Loop

- [x] Study Guide works reliably — beginner mode tested, collocations/grammar seeding fixed
- [x] guided journal drafting works reliably — draft prefill, beginner mode
- [x] first journal save works reliably
- [x] flashcard review works reliably
- [x] dashboard reflects progress after those actions — daily loop tracks review/study/write completions

## Beginner Clarity

- [x] copy is understandable without prior HSK/app knowledge — first-run state avoids jargon; technical sections hidden until user has activity
- [x] no "phase/demo/internal" language leaks into learner surfaces
- [x] loading states feel intentional — skeleton loaders throughout dashboard
- [ ] error states are understandable — not yet audited

## Trust / Production Basics

- [ ] auth behavior is consistent — not yet fully audited
- [ ] billing/upgrade path is stable — not yet fully audited
- [x] teacher/referral/admin features do not interfere with the learner path — role-gated
- [ ] docs reflect the real app state — partially updated

## First-Week Habit

- [x] the learner can repeat the loop daily — daily loop (Review → Study → Write) with history bars
- [x] the app gives enough sense of momentum — streak, progress bar, beginner completion state
- [x] the app makes tomorrow's next step feel obvious — "Come back tomorrow and continue Today's Practice" messaging in beginner completion state
