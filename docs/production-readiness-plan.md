# Production Readiness Plan

This document resets the current roadmap from:

- expanding more internal teacher phases

to:

- making HanziBit usable, clear, and trustworthy for a real learner in production

The immediate pilot assumption is:

- the first real customer is the founder
- the learner is starting Chinese from zero
- the goal is not “more features”
- the goal is “daily use without confusion”

## Why this reset is necessary

The product now has a large amount of capability:

- solo learner loop
- classroom workflows
- teacher workspace
- referrals
- discovery
- private tutoring operations
- deep teacher reporting

That is enough system surface for an alpha.

The main risk is no longer missing another teacher phase.

The main risks are now:

- unclear first-time learner experience
- too much navigation noise
- empty states that do not guide a beginner
- rough production edges in auth, billing, or onboarding
- weak “what do I do next?” clarity for a real learner

## Current product principle

For the next cycle, every change should be judged against this question:

**Does this make HanziBit better for a real beginner learner using it daily?**

If not, it is probably lower priority than production readiness.

## Production-readiness workstreams

### 1. Learner Navigation Simplification

Goal:

- reduce cognitive load for a solo learner

Priorities:

- keep learner nav focused on:
  - Dashboard
  - Daily Journal
  - Study Guide
  - Flashcards
  - Vocabulary
  - Grammar
  - Reviews
- keep teacher-connected flows conditional
- review whether any low-value links should be hidden or deprioritized in the pilot

### 2. Beginner Onboarding

Goal:

- make “starting from zero” feel guided, not open-ended

Priorities:

- define a true first-run experience
- explain the app in beginner language
- make the first action obvious
- avoid showing too much advanced terminology too early

Likely onboarding outputs:

- first-session guidance
- what Study Guide is
- what Daily Journal is
- why flashcards matter
- what “Today’s Practice” means

### 3. First 7-Day Learner Journey

Goal:

- make the first week feel structured and motivating

Priorities:

- define what the learner should do on:
  - day 1
  - day 2
  - day 3
  - day 7
- keep each day short and repeatable
- tie progress back to real visible wins

### 4. Core Flow Reliability Audit

Goal:

- ensure the core learner path works every time

Must-audit flows:

- sign up
- sign in
- dashboard load
- study guide selection
- create first journal entry
- review flashcards
- save/edit/delete journal entry
- upgrade/paywall path
- teacher links hidden when not relevant

### 5. Empty-State and Copy Audit

Goal:

- remove “internal tool” feeling from the product

Priorities:

- replace unclear empty states
- rewrite copy for beginners
- reduce “phase/system/demo” language in the live app
- prefer action-oriented wording over reporting wording for learner surfaces

### 6. Production/Billing/Auth Readiness

Goal:

- avoid trust-breaking errors in the pilot

Priorities:

- auth schema sanity
- seed/dev-only paths not leaking into real user assumptions
- checkout reliability
- referral and teacher-only paths not interfering with learner flow
- environment/docs cleanup for a real deployment path

## First user profile

The first real-user profile is:

- adult beginner
- zero Chinese
- wants a clear daily path
- wants to feel progress quickly
- does not want academic overload
- does not yet need teacher complexity

That means the first-user product experience should optimize for:

- confidence
- clarity
- small wins
- repetition

not:

- flexibility
- advanced configuration
- high information density

## First-session target

A successful first session should let the learner:

1. land on the dashboard
2. understand what Today’s Practice means
3. open one Study Guide item
4. write one tiny guided response
5. review one or more flashcards
6. leave feeling:
   - “I know what this app is for”
   - “I know what to do tomorrow”

## First-week target

By the end of the first week, the learner should:

- have multiple journal entries
- understand the Study Guide / Journal / Flashcard loop
- have a visible streak or completion rhythm
- feel that the app is helping them build beginner momentum

## What to defer during this cycle

These are not the immediate priority for pilot readiness:

- more teacher phase expansion
- more deep operational teacher reporting
- more marketplace layers
- more new tutor-system abstractions
- broad new admin layers

Those can continue later, but they are not the highest-value next branch.

## Recommended next implementation order

1. create a beginner-first pilot checklist
2. simplify learner nav and visibility rules where needed
3. build or tighten onboarding / first-run guidance
4. define and implement the first 7-day journey
5. run a strict bug audit on the solo learner loop
6. do a production readiness pass on auth/billing/docs

## Exit criteria

This cycle is successful when:

- a brand-new beginner can sign up and use the app without explanation
- the next step is always obvious on the learner side
- the product feels focused, not noisy
- the founder can genuinely use HanziBit daily to learn Chinese from zero

## Primary follow-up docs

- `docs/first-user-journey.md`
- `docs/pilot-readiness-checklist.md`

