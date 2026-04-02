# HSK Skool App Overview

## What The App Does

HSK Skool, branded in the UI as Mandarin Flow, is a Mandarin learning web app built around a guided HSK-style progression instead of a loose flashcard library.

The app currently has two product layers:

- a public marketing site at [src/app/page.tsx](/Users/inaki/my-repos/hsk-skool/src/app/page.tsx)
- a protected learner app under [src/app/app](/Users/inaki/my-repos/hsk-skool/src/app/app)

The learner experience is not just static UI. A signed-in user can:

1. create an account or sign in with Better Auth
2. enter a protected dashboard
3. browse a curriculum path made of standards, tracks, levels, units, and items
4. open lessons and submit lesson assessments
5. generate review items automatically from mistakes
6. practice due review items in a standard review queue
7. practice audio-capable items in a listening-first queue
8. accumulate XP, streaks, lesson progress, item mastery, and membership state

The product is therefore best described as an early-stage but real learning application, not just a design prototype.

## Main User Flow

The app is designed around a simple loop:

1. discover the product on the landing page
2. sign up or log in at [src/app/login/page.tsx](/Users/inaki/my-repos/hsk-skool/src/app/login/page.tsx) and [src/app/signup/page.tsx](/Users/inaki/my-repos/hsk-skool/src/app/signup/page.tsx)
3. enter the dashboard at [src/app/app/page.tsx](/Users/inaki/my-repos/hsk-skool/src/app/app/page.tsx)
4. continue the current lesson or browse the curriculum at [src/app/app/curriculum/page.tsx](/Users/inaki/my-repos/hsk-skool/src/app/app/curriculum/page.tsx)
5. study a lesson at [src/app/app/lessons/[slug]/page.tsx](/Users/inaki/my-repos/hsk-skool/src/app/app/lessons/[slug]/page.tsx)
6. submit a quiz, which updates lesson progress, item mastery, XP, and the review queue through [src/lib/lesson-progress.ts](/Users/inaki/my-repos/hsk-skool/src/lib/lesson-progress.ts)
7. clear due items in the review queue at [src/app/app/review/page.tsx](/Users/inaki/my-repos/hsk-skool/src/app/app/review/page.tsx)
8. repeat audio-capable items in the listening drill at [src/app/app/listen/page.tsx](/Users/inaki/my-repos/hsk-skool/src/app/app/listen/page.tsx)

That makes the app more structured than a typical vocabulary trainer. The learner is pushed through a path, then pulled back into review when performance drops.

## What Is Implemented Today

### Public product surface

- marketing landing page with feature sections, curriculum positioning, CTA flow, and testimonials
- login and signup pages
- Better Auth email/password authentication via [src/lib/auth.ts](/Users/inaki/my-repos/hsk-skool/src/lib/auth.ts)

### Protected learner product

- dashboard with current level, streak, XP, weak-item surfacing, and next-step CTAs
- curriculum view showing levels, unit states, locked content, and overall progress
- lesson pages with vocabulary, grammar, example sentences, audio playback, and assessment questions
- review queue for due items
- listening queue for audio-first recall
- settings area with curriculum selection, membership status, recent learning activity, and weak-item visibility

### Backend/data layer

- Postgres + Drizzle schema for auth, curriculum, progress, review, XP, subscriptions, and entitlements in [src/db/schema](/Users/inaki/my-repos/hsk-skool/src/db/schema)
- DB-backed curriculum loaders in [src/lib/curriculum.ts](/Users/inaki/my-repos/hsk-skool/src/lib/curriculum.ts)
- per-item mastery and lesson outcome tracking in [src/lib/lesson-progress.ts](/Users/inaki/my-repos/hsk-skool/src/lib/lesson-progress.ts)
- review and listening limits enforced server-side in [src/lib/membership.ts](/Users/inaki/my-repos/hsk-skool/src/lib/membership.ts)
- Stripe checkout, billing portal, and webhook plumbing in [src/lib/billing.ts](/Users/inaki/my-repos/hsk-skool/src/lib/billing.ts) and [src/app/api/stripe/webhook/route.ts](/Users/inaki/my-repos/hsk-skool/src/app/api/stripe/webhook/route.ts)
- local audio assets plus an audio generation script in [scripts/generate-audio.mjs](/Users/inaki/my-repos/hsk-skool/scripts/generate-audio.mjs)

## Strengths

### 1. The app has a real end-to-end product loop

This is the biggest strength.

The repo already connects:

- acquisition via the landing page
- authentication
- curriculum progression
- lesson assessment
- review generation
- listening practice
- gamification
- monetization

Many learning app prototypes stop at screens. This one already has the core learning loop wired into persistent data.

### 2. The curriculum model is stronger than the visible content depth

The schema separates:

- standards
- tracks
- levels
- units
- items
- grammar points
- example sentences

That is a good foundation for expansion. The code in [src/lib/curriculum.ts](/Users/inaki/my-repos/hsk-skool/src/lib/curriculum.ts) and [src/lib/settings.ts](/Users/inaki/my-repos/hsk-skool/src/lib/settings.ts) shows the app was designed to support multiple standards and tracks, even though only a limited seed set is active right now.

### 3. Progress is not cosmetic

XP, streaks, unit completion, item mastery, review state, and listening attempts are all stored and recalculated from the database.

That matters because the dashboard is not merely decorative. The learner state shown in the UI is tied to actual study actions handled by server code.

### 4. The review system is integrated into lessons

Lesson submission does more than record a score.

It also:

- marks units completed or mastered
- updates item mastery
- creates or reschedules review items
- advances levels when the current level is fully completed
- awards XP
- updates streaks

That makes the app feel like one system rather than disconnected screens.

### 5. Audio is already treated as a first-class learning mode

The product does not only attach audio to lesson cards. It has:

- audio playback inside lessons
- a listening-specific queue
- separate listening usage limits
- separate listening XP logic
- a generation pipeline for audio assets

That is a meaningful strength for a Mandarin product, where pronunciation and recognition matter early.

### 6. Monetization is connected to actual product constraints

The paywall is not superficial. Free-tier restrictions are enforced in server logic, not just hidden in the UI.

The app already supports:

- starter unit gating
- daily review caps
- daily listening caps
- Stripe checkout
- billing portal access
- entitlement-based membership checks

That makes the product commercially closer to launch than a typical side project.

## Weaknesses

### 1. Content depth is still the main bottleneck

The platform is ahead of the curriculum.

From the code and docs, the system is clearly set up for a broader HSK journey, but the currently seeded experience is still limited in authored scope. The learner model is stronger than the amount of content feeding it.

In practical terms, this means the app may feel polished at first but become shallow once a learner moves past the initial units.

### 2. The adaptive logic is still simple

The app does have adaptive behavior, but it is still rule-based and fairly light.

Examples in [src/lib/lesson-progress.ts](/Users/inaki/my-repos/hsk-skool/src/lib/lesson-progress.ts) and [src/app/app/review/actions.ts](/Users/inaki/my-repos/hsk-skool/src/app/app/review/actions.ts):

- mastery changes use fixed increments and penalties
- successful reviews are rescheduled with simple fixed intervals
- failed reviews return quickly with basic penalties
- quiz selection is prioritized, but from a relatively small heuristic set

This is enough for an MVP, but not yet a sophisticated spaced-repetition engine.

### 3. Some marketed ideas are broader than the implemented learning mechanics

The landing page sells a rich long-term HSK path and features like stroke practice, but the actual lesson implementation is still more limited:

- the stroke section is currently a visual guide, not a true interactive writing trainer
- the live curriculum is narrower than the six-level story shown on the landing page
- the visible social proof is marketing copy, not product-generated evidence

This is a normal startup-stage gap, but it is still a gap.

### 4. There is no visible authoring or admin system

The curriculum appears to be managed through schema design, seed scripts, and code-managed content structure rather than a dedicated internal CMS.

That is workable while content is small. It becomes a scaling problem once the team wants:

- many more lessons
- faster curriculum iteration
- non-engineers editing content
- richer QA on lesson quality

### 5. Automated testing is still weak or absent

The repo includes many `data-testid` hooks, but there is no visible automated test suite in the codebase.

That creates risk because the app now contains meaningful stateful logic:

- lesson scoring
- review queue scheduling
- paywall enforcement
- billing synchronization
- progress advancement

Those are exactly the kinds of flows that silently regress if they are not covered by tests.

### 6. The app is currently web-first, not a full multi-platform product

The product already thinks about mobile, audio sharing, and future native work, but the shipped implementation is still a Next.js web app.

That is fine for now, but it means:

- there is no native offline behavior
- mobile learning is browser-based
- in-app mobile billing is deferred

For a daily language-learning habit product, that may become a strategic limitation later.

### 7. Some route files are doing a lot of UI work inline

Several page files are large and contain both data orchestration and detailed view composition in the same file, especially under [src/app/app](/Users/inaki/my-repos/hsk-skool/src/app/app).

That is not a launch blocker, but it does make the product harder to maintain as:

- lesson variants grow
- more review modes are added
- the UI needs repeated changes across pages

## Bottom-Line Assessment

HSK Skool is already a real product foundation for a Mandarin learning SaaS.

Its strongest qualities are:

- clear product structure
- real DB-backed learner state
- integrated lesson to review loop
- audio-aware practice
- monetization and access control that are already wired into the product

Its weakest qualities are:

- limited curriculum depth relative to the platform ambition
- simple adaptive logic
- no visible content authoring system
- little or no automated test coverage
- a marketing promise that currently exceeds the live lesson depth

## Short Version

If someone asks, "What does this app do?", the simplest accurate answer is:

HSK Skool is a web-based Mandarin learning app that guides users through an HSK-style curriculum, tracks lesson and item mastery, generates review practice from mistakes, includes listening drills with audio, and monetizes deeper access through a Stripe-backed Plus plan.

If someone asks, "What is good about it?", the answer is:

It already behaves like a real learning product rather than a static demo.

If someone asks, "What is still weak?", the answer is:

The platform foundation is ahead of the content depth, testing maturity, and sophistication of the adaptive learning engine.
