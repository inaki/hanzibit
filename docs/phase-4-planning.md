# Phase 4 Planning

## Objective

Phase 4 should explore tutor discovery and matching without collapsing HanziBit into a full marketplace product too early.

The goal is not "build everything a tutoring platform could need."

The goal is:

- let learners discover relevant teachers
- let teachers present a trustworthy public profile
- let discovery convert into a real HanziBit workflow
- keep the notebook and classroom system as the core product underneath

Phase 4 should be built on top of the now-existing Phase 1, Phase 2, and Phase 3 layers:

- stable learner loop
- classroom and assignment workflows
- reusable teacher content
- teacher reporting
- referral and growth groundwork

---

## What Phase 4 Is

Phase 4 is the first public-facing teacher discovery layer.

That means:

- teacher profiles become browsable
- learners can search or filter teachers
- a learner can express interest in working with a teacher
- that relationship converts into a classroom, private class, or tutoring-specific workflow

Phase 4 is **not** yet:

- a scheduling product
- a live lesson platform
- a full payments marketplace
- an open review/reputation system

---

## Product Outcome

By the end of Phase 4, HanziBit should be able to support this path:

1. learner discovers a teacher
2. learner reviews the teacher profile
3. learner sends an interest request
4. teacher accepts or declines
5. HanziBit opens the next working relationship:
   - a private classroom
   - a tutoring classroom
   - or a teacher-managed onboarding flow

This is enough to validate marketplace demand without taking on the full operational burden of bookings, disputes, and payout automation.

---

## Scope

### In Scope

1. Public teacher profiles
2. Teacher discovery/search
3. Filter by language focus, level, timezone, and availability summary
4. Teacher profile pages
5. Teacher interest / contact request flow
6. Teacher-side inquiry inbox
7. Conversion from inquiry into a classroom or private teaching space
8. Minimal trust signals:
   - profile completeness
   - years teaching
   - languages spoken
   - specialties
   - optional teaching approach

### Explicitly Out Of Scope

1. Real-time lesson scheduling
2. Calendar sync
3. Stripe Connect marketplace payouts
4. Public review marketplace
5. Ranking/reputation algorithms beyond simple search/filter ordering
6. In-app chat system
7. Dispute handling workflows
8. Video/live lesson delivery

---

## Core Product Rules

### 1. Discovery must end in a real HanziBit workflow

Profiles are not the product by themselves.

The point of Phase 4 is not profile browsing. It is teacher-student connection that leads into:

- classroom creation
- assignment-based work
- notebook-centered study

### 2. Teacher quality must be represented simply

Do not invent a heavy reputation system first.

Use clear, explainable profile fields:

- teaching focus
- levels taught
- languages spoken
- timezone
- short bio
- specialties

### 3. Matching should stay operationally light

Start with request/accept flows, not full marketplace automation.

### 4. Marketplace complexity stays constrained

Avoid scheduling, payouts, and disputes until discovery demand is proven.

### 5. Teacher tools should stay consolidated

Teacher-facing features should not keep expanding as separate top-level notebook links.

Phase 4 should treat teacher operations as one workspace:

- `Teaching`

Inside that workspace, teachers move between:

- overview
- profile
- inquiries
- library
- reporting
- referrals

---

## Why Phase 4 Should Happen Now

Phase 4 becomes reasonable only after the previous phases are real.

That is now true on web:

- learners have a stable solo-study experience
- classrooms exist
- teachers can reuse content
- reporting exists
- referrals exist

This means HanziBit now has an actual teacher role worth discovering.

Without that foundation, Phase 4 would have been premature.

---

## Suggested Phase 4 Structure

Phase 4 should be split into three internal tracks:

1. **Phase 4A: public teacher profiles**
2. **Phase 4B: teacher discovery and inquiry**
3. **Phase 4C: inquiry-to-classroom conversion**

Recommended order:

1. public teacher profiles
2. discovery/search
3. inquiry + conversion flow

Scheduling and full marketplace monetization stay later.

Teacher-facing information architecture during Phase 4:

- one notebook entry point: `Teaching`
- shared teacher shell
- internal tabs for:
  - overview
  - profile
  - inquiries
  - library
  - reporting
  - referrals

---

## Phase 4A: Public Teacher Profiles

### Goal

Let teachers opt into public discovery with a profile that is strong enough to evaluate.

### Features

- teacher public profile toggle
- public slug/URL
- profile photo
- headline
- bio
- languages spoken
- specialties
- levels taught
- timezone
- optional pricing display
- optional availability summary text
- profile management should live under `Teaching > Profile`

### Success Criteria

- a teacher can publish a profile that feels trustworthy and complete
- a learner can understand whether this teacher is relevant before sending a request

---

## Phase 4B: Teacher Discovery And Inquiry

### Goal

Let learners find relevant teachers and signal interest.

### Features

- browse/search teachers
- filter by:
  - target language
  - HSK/level focus
  - timezone
  - specialties
  - language of instruction
- teacher profile detail page
- `Request to study` or `Contact teacher` flow
- inquiry flow should connect back into the `Teaching` workspace cleanly

### Success Criteria

- learners can find a relevant teacher without external directories
- teachers receive structured interest requests instead of raw support/manual coordination

---

## Phase 4C: Inquiry To Classroom Conversion

### Goal

Turn discovery into an actual working relationship inside HanziBit.

### Features

- teacher inquiry inbox
- accept / decline request
- create private classroom from inquiry
- attach learner to that classroom
- optional default onboarding assignment
- conversion should remain visible from both the teacher workspace and learner inquiry status

### Success Criteria

- teacher discovery leads into a classroom workflow cleanly
- the product does not end at "profile viewed"

---

## Data Model Direction

### Group 1: Teacher public profile

Suggested table: `teacher_profiles`

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL UNIQUE`
- `public_slug TEXT NOT NULL UNIQUE`
- `headline TEXT`
- `bio TEXT`
- `languages_json JSONB NOT NULL DEFAULT '[]'`
- `specialties_json JSONB NOT NULL DEFAULT '[]'`
- `levels_json JSONB NOT NULL DEFAULT '[]'`
- `timezone TEXT`
- `pricing_summary TEXT`
- `availability_summary TEXT`
- `is_public INTEGER NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### Group 2: Teacher discovery metadata

This may remain derived from `teacher_profiles` at first.

Optional later:

- `teacher_profile_tags`
- `teacher_profile_languages`

Do not normalize too early unless search complexity forces it.

### Group 3: Student inquiry workflow

Suggested table: `teacher_inquiries`

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL`
- `student_user_id TEXT NOT NULL`
- `message TEXT`
- `status TEXT NOT NULL`
- `created_classroom_id TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Allowed `status` values:

- `pending`
- `accepted`
- `declined`
- `converted`

---

## Roles And Permissions

### Teacher can

- create and edit their public profile
- choose whether profile is public
- view inquiries addressed to them
- accept or decline inquiries
- create a classroom from an inquiry

### Teacher cannot

- edit another teacher’s public profile
- view another teacher’s inquiries

### Learner can

- browse public teacher profiles
- send inquiry to a teacher
- view the status of their own inquiries

### Learner cannot

- view private teacher profiles
- see another student’s inquiries

---

## Recommended Milestone Order

## Milestone 1: Teacher Profile Foundation

- `teacher_profiles` table
- create/edit profile flow
- public profile page

## Milestone 2: Discovery Surface

- search/browse page
- filters
- ordering

## Milestone 3: Inquiry Workflow

- inquiry create
- teacher inbox
- accept / decline

## Milestone 4: Inquiry Conversion

- create classroom from inquiry
- attach student
- optional onboarding assignment

---

## Risks

### 1. Marketplace scope explosion

The biggest risk is accidentally taking on:

- scheduling
- messaging
- payouts
- disputes
- reviews

all at once.

### 2. Weak teacher profiles

If public profiles are too thin, discovery will feel low-trust.

### 3. Search without quality control

Search should be simple and explainable before it becomes "smart."

---

## Definition Of Ready

Phase 4 implementation is ready to begin when:

- the team agrees Phase 4 starts with public profiles, not booking
- the team agrees inquiries convert into classrooms, not chat
- the team agrees monetization and scheduling remain deferred

---

## Recommended Immediate Next Step

Start with a **Phase 4 implementation spec** that turns this into:

1. schema proposal
2. role/permission model
3. screen map
4. milestone-by-milestone implementation backlog
