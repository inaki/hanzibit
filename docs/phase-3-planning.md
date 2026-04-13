# Phase 3 Planning

## Objective

Phase 3 should make HanziBit useful for repeat teaching, teacher growth, and cross-class reuse without turning the product into a full tutor marketplace yet.

The product move is:

- strengthen the teacher operating layer
- add reusable teacher-owned content
- add lightweight reporting
- add the teacher referral program

The product move is **not**:

- public tutor discovery
- scheduling and lesson booking
- teacher search and profile marketplace
- full automated payout infrastructure on day one

---

## Phase 3 Outcome

By the end of Phase 3, a teacher should be able to:

- reuse prompts, assignments, and study resources across classes
- see which students and classes need intervention
- invite or refer students into HanziBit with attribution
- understand whether their classes are driving paid usage

By the end of Phase 3, a student should be able to:

- receive more structured and reusable teacher material
- keep using the personal notebook as the center of learning
- move between solo study and teacher-guided study without account switching

---

## Scope

### In Scope

1. Reusable assignment templates
2. Teacher content library
3. Shared vocabulary sets
4. Shared grammar notes
5. Reusable journal prompts
6. Class-level reporting
7. Student-level progress summaries
8. Teacher referral codes and attribution
9. Internal commission ledger and basic payout workflow

### Explicitly Out Of Scope

1. Public teacher profiles
2. Tutor marketplace search
3. Booking and scheduling
4. Live lesson management
5. Full automated marketplace payouts
6. Trust/reputation marketplace systems

---

## Product Principles

### 1. Notebook First

Teacher content should feed the learner notebook and Study Guide flows, not replace them.

### 2. Reuse Before Expansion

Phase 3 should reduce repeated teacher setup work before introducing any new external growth surface.

### 3. Referral Before Marketplace

The referral program is the correct growth bridge before public discovery because it builds on an already real teacher role.

### 4. Reporting Should Be Lightweight

Teachers need action-oriented visibility, not enterprise analytics.

---

## Sub-Phases

## Phase 3A: Reusable Teacher Content

### Goal

Reduce repeated teacher setup and make classroom use more scalable.

### Features

- assignment templates
- teacher library
- saved study-guide word bundles
- saved prompts
- saved reading-response prompts
- copy template into new assignment
- duplicate assignment into another classroom

### Suggested Data Model

- `teacher_resources`
- `teacher_resource_items`
- `assignment_templates`
- `assignment_template_links`

Minimal resource types:

- `journal_prompt`
- `study_word_set`
- `study_level_set`
- `reading_response`
- `grammar_note`

### Success Criteria

- teachers can create once and reuse across multiple classes
- assignment creation becomes template-based instead of scratch-first
- classroom setup time drops meaningfully

---

## Phase 3B: Reporting And Intervention

### Goal

Help teachers identify who needs help without building a heavy admin system.

### Features

- class completion summary
- assignment completion summary
- review activity summary
- student streak / recent activity summary
- “needs attention” student list
- “missing work” and “awaiting review” rollups

### Suggested Data Direction

Start from existing data:

- `assignment_submissions`
- `submission_feedback`
- `journal_entries`
- `flashcard_reviews`
- daily loop completion data

Avoid separate analytics infrastructure in Phase 3.

### Success Criteria

- a teacher can identify at-risk students from one screen
- a teacher can tell whether class engagement is healthy without opening every submission

---

## Phase 3C: Teacher Referral Program

### Goal

Let teachers bring students to HanziBit and earn a commission on paid subscriptions.

### Features

- teacher referral code
- teacher referral link
- referral attribution
- commission ledger
- payout status tracking
- simple teacher referral dashboard

### Recommended Business Rules

- one referring teacher per student
- attribution window, for example 30 days
- commission only on paid invoices
- commission limited to first 6 or 12 paid months
- payout threshold, for example $25
- manual monthly payout first

### Suggested Data Model

- `referral_codes`
- `referral_attributions`
- `referral_commissions`
- `teacher_payout_accounts`
- `teacher_payouts`

### Billing Model

Han ziBit keeps platform-owned billing.

Teacher commissions should be tracked internally first, not split at checkout in V1.

### Success Criteria

- referral attribution works reliably
- teachers can see what they referred
- the team can compute commissions and payout status without spreadsheet chaos

---

## Recommended Milestone Order

## Milestone 1: Shared Teacher Content Foundation

- add reusable resource tables
- create teacher library helpers
- add template creation from current assignments
- add “create assignment from template”

## Milestone 2: Teacher Library UI

- teacher library list page
- create/edit resource flow
- resource detail page
- duplicate into assignment flow

## Milestone 3: Reporting Layer

- class summary cards
- student attention lists
- assignment progress summary
- lightweight student progress page

## Milestone 4: Referral MVP

- referral code generation
- referral attribution
- checkout metadata integration
- commission records
- teacher referral dashboard

## Milestone 5: Referral Operations

- payout status
- admin/manual payout workflow
- fraud checks and support override path

---

## Dependencies

Phase 3 assumes:

- Phase 1 learner loop is stable
- Phase 2 classroom MVP is real and usable
- the teacher role already exists in production behavior
- Stripe subscription ownership stays on the platform

---

## Risks

### 1. Phase 3 Becomes Too Broad

The main risk is mixing reusable teaching tools, analytics, growth, and marketplace ideas into one release.

Mitigation:

- keep marketplace work explicitly deferred
- ship content reuse first
- add referrals only after teacher workflows are still simple and stable

### 2. Teacher Library Becomes A Second CMS

Mitigation:

- keep resource types narrow
- prefer assignment templates over general content management

### 3. Referral Logic Creates Operational Overhead Too Early

Mitigation:

- manual payouts first
- no full Connect build in V1
- clear attribution and fraud rules

---

## Definition Of Ready

Phase 3 is ready to start when:

- the team agrees Phase 2 is stable enough to stop major schema churn
- the product decision is explicit that Phase 3 starts with reusable teacher content, not referral payouts first
- the team is aligned that marketplace discovery remains Phase 4

---

## Recommended Next Step

Start with **Phase 3A: reusable teacher content**.

That is the cleanest continuation of the shipped classroom MVP and the strongest prerequisite for both reporting and the referral program.
