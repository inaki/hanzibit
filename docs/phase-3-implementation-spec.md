# Phase 3 Implementation Spec

## Purpose

This document turns Phase 3 into an implementation-ready specification.

It should answer:

- what Phase 3 builds first
- what schema changes are needed
- what permissions apply
- which screens and flows are required
- what order we should implement in

This doc is the bridge between the Phase 3 plan and actual code.

Current implementation status as of April 13, 2026:

- Milestone 1 is started
- schema and helper foundations for reusable teacher content are in place
- UI work has not started yet

It complements:

- `docs/phase-3-planning.md`
- `docs/referral-program-strategy.md`
- `docs/product-evolution-strategy.md`
- `docs/implementation-roadmap.md`

---

## Phase 3 Objective

Phase 3 should make HanziBit useful for repeat teaching and teacher growth without turning the app into a public tutor marketplace.

The first practical goal is:

- teacher creates reusable resources once
- teacher reuses them across classrooms
- teacher sees lightweight performance and intervention signals
- teacher can later bring students into HanziBit through referrals

This phase should build on top of the existing Phase 2 classroom system, not replace it.

---

## Phase 3 Structure

Phase 3 should be implemented in three internal tracks:

1. **Phase 3A: reusable teacher content**
2. **Phase 3B: reporting and intervention**
3. **Phase 3C: teacher referral program**

Recommended order:

1. reusable content
2. reporting
3. referral MVP

Marketplace work remains Phase 4.

---

## Core Product Rules

### 1. The notebook stays primary

Teacher content should feed:

- notebook
- Study Guide
- classroom assignment flows

It should not create a parallel teacher-only learning product.

### 2. Reuse should start from existing classroom objects

The simplest path is:

- current assignments can become templates
- templates can create future assignments

This is better than building a broad CMS first.

### 3. Reporting should be action-oriented

Teachers do not need enterprise dashboards in Phase 3.

They need:

- who is behind
- which assignments need attention
- which classes are active

### 4. Referrals are a growth layer, not a billing rewrite

Han ziBit keeps customer billing ownership.

Teacher commissions should be recorded internally first.

---

## Scope

### Included

- reusable assignment templates
- teacher library
- saved prompt resources
- saved study word sets
- saved study level sets
- saved reading-response resources
- class-level reporting
- student-level progress summaries
- needs-attention views
- teacher referral code generation
- referral attribution
- commission ledger
- payout tracking

### Excluded

- public teacher profiles
- tutor search
- lesson booking
- calendar/scheduling
- live teaching tools
- full Stripe Connect automation in V1
- public marketplace trust/review systems

---

## Roles And Permissions

Phase 2 roles still apply:

- solo learner
- student
- teacher

Phase 3 adds new teacher capabilities, not new public roles.

### Teacher can

- create and edit reusable content they own
- use templates across classrooms they manage
- view reporting for classrooms they manage
- generate and view referral codes
- view their own referral dashboard and payout status

### Teacher cannot

- edit another teacher’s library
- see referral data for another teacher
- view student data outside classroom/assignment scope

### Student can

- consume teacher resources through assignments and study flows
- see structured resources assigned into their existing learner flow

### Student cannot

- access teacher library management
- view referral data

---

## Permissions Helpers

Recommended helpers:

- `canManageTeacherResource(userId, resourceId)`
- `canViewTeacherResource(userId, resourceId)`
- `canUseTemplateInClassroom(userId, templateId, classroomId)`
- `canViewTeacherReporting(userId, classroomId)`
- `canManageReferralCode(userId, referralCodeId)`
- `canViewReferralDashboard(userId)`

Recommended rule:

- all Phase 3 teacher objects remain teacher-owned
- classroom linkage should be explicit and optional
- student-facing access comes through assignment use, not direct teacher-library browsing

---

## Data Model

Phase 3 should add three groups of tables.

## Group 1: Reusable teacher content

### Table: `teacher_resources`

Purpose:

- teacher-owned reusable library items

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL`
- `resource_type TEXT NOT NULL`
- `title TEXT NOT NULL`
- `description TEXT`
- `hsk_level INTEGER`
- `source_assignment_id TEXT`
- `archived INTEGER NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Allowed `resource_type` values:

- `journal_prompt`
- `study_word_set`
- `study_level_set`
- `reading_response`
- `grammar_note`

### Table: `teacher_resource_items`

Purpose:

- store item payload for multi-part resources

Examples:

- list of word ids
- list of phrases
- reading prompt metadata
- grammar notes

Fields:

- `id TEXT PRIMARY KEY`
- `resource_id TEXT NOT NULL`
- `item_type TEXT NOT NULL`
- `sort_order INTEGER NOT NULL DEFAULT 0`
- `content_json JSONB NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### Table: `assignment_templates`

Purpose:

- normalized reusable assignment shell for teachers

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL`
- `resource_id TEXT`
- `template_type TEXT NOT NULL`
- `title TEXT NOT NULL`
- `description TEXT`
- `prompt TEXT`
- `hsk_level INTEGER`
- `source_ref TEXT`
- `allow_resubmission INTEGER NOT NULL DEFAULT 1`
- `archived INTEGER NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### Optional Table: `assignment_template_links`

Purpose:

- record which assignments were created from which template

Fields:

- `template_id TEXT NOT NULL`
- `assignment_id TEXT NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

This can also be handled by a nullable `template_id` on `assignments` if preferred.

Recommended simplification:

- add nullable `template_id` to `assignments`
- only add `assignment_template_links` if multi-template provenance becomes necessary

## Group 2: Reporting

Phase 3 reporting should avoid a large analytics schema initially.

Start by deriving from:

- `assignments`
- `assignment_submissions`
- `submission_feedback`
- `journal_entries`
- `flashcard_reviews`
- `daily_loop_completions`

Add summary/materialized tables only if queries become slow or logic becomes too duplicated.

Optional future tables if needed:

- `classroom_reporting_snapshots`
- `student_reporting_snapshots`

These should not be Milestone 1 defaults.

## Group 3: Referrals

### Table: `referral_codes`

Purpose:

- teacher-owned referral code and share link metadata

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL`
- `code TEXT NOT NULL UNIQUE`
- `active INTEGER NOT NULL DEFAULT 1`
- `campaign_name TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### Table: `referral_attributions`

Purpose:

- connect referred student to teacher attribution

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL`
- `student_user_id TEXT NOT NULL`
- `referral_code_id TEXT NOT NULL`
- `attributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `attribution_status TEXT NOT NULL DEFAULT 'active'`

Allowed `attribution_status` values:

- `active`
- `expired`
- `rejected`
- `reversed`

### Table: `referral_commissions`

Purpose:

- internal ledger of commission events

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL`
- `student_user_id TEXT NOT NULL`
- `referral_attribution_id TEXT NOT NULL`
- `subscription_id TEXT`
- `invoice_id TEXT`
- `gross_amount_cents INTEGER NOT NULL`
- `commission_rate_bps INTEGER NOT NULL`
- `commission_amount_cents INTEGER NOT NULL`
- `currency TEXT NOT NULL`
- `status TEXT NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Allowed `status` values:

- `pending`
- `approved`
- `held`
- `paid`
- `voided`

### Table: `teacher_payout_accounts`

Purpose:

- teacher payout preferences and status

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL UNIQUE`
- `provider TEXT NOT NULL DEFAULT 'manual'`
- `account_ref TEXT`
- `status TEXT NOT NULL DEFAULT 'not_configured'`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### Table: `teacher_payouts`

Purpose:

- track batch payouts

Fields:

- `id TEXT PRIMARY KEY`
- `teacher_user_id TEXT NOT NULL`
- `amount_cents INTEGER NOT NULL`
- `currency TEXT NOT NULL`
- `status TEXT NOT NULL`
- `paid_at TIMESTAMPTZ`
- `notes TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Allowed `status` values:

- `pending`
- `scheduled`
- `paid`
- `cancelled`

---

## Screen Map

## Teacher screens

### 1. Teacher Library

Purpose:

- list reusable resources and templates

Sections:

- templates
- prompts
- study sets
- reading resources
- grammar notes

### 2. Teacher Resource Detail

Purpose:

- inspect and edit one resource

Actions:

- edit
- duplicate
- create assignment from resource
- archive

### 3. Assignment Template Create/Edit

Purpose:

- create reusable assignment shell

Should support:

- build from scratch
- convert existing assignment into template

### 4. Teacher Reporting Dashboard

Purpose:

- show classes, intervention signals, assignment completion, and student attention

### 5. Referral Dashboard

Purpose:

- show referral code
- show referred students
- show commission totals
- show payout status

## Student-facing impacts

Students should not see a new Phase 3 library product.

They should only see:

- better structured assignments
- more reusable teacher content inside classroom work
- clearer assigned resource context

---

## Flow Specs

## Flow 1: Create template from assignment

1. Teacher opens existing assignment
2. Teacher clicks `Save as template`
3. App creates:
   - teacher resource or template record
   - optional resource items
4. Teacher can later create a new assignment from that template

## Flow 2: Create assignment from template

1. Teacher opens classroom
2. Teacher clicks `Create from template`
3. Teacher selects saved template
4. Teacher can edit due date / prompt adjustments
5. App creates a normal assignment with template provenance

## Flow 3: View teacher reporting

1. Teacher opens reporting dashboard
2. Sees class cards
3. Opens one classroom summary
4. Sees:
   - missing submissions
   - awaiting review
   - low-activity students
   - recent completions

## Flow 4: Referral attribution

1. Teacher copies referral link/code
2. Student signs up through that path
3. Attribution is recorded
4. Student subscribes
5. Commission ledger entry is created after paid invoice event
6. Teacher sees it in dashboard

---

## API / Action Direction

Phase 3 can continue the current pattern:

- server actions for internal web management flows
- route handlers where mobile or future external clients need stable contracts

Recommended helpers:

- `createTeacherResource(...)`
- `updateTeacherResource(...)`
- `listTeacherResourcesForUser(...)`
- `createAssignmentTemplate(...)`
- `createAssignmentFromTemplate(...)`
- `getTeacherReportingSummary(...)`
- `getTeacherClassroomReporting(...)`
- `createReferralCode(...)`
- `getTeacherReferralDashboard(...)`
- `recordReferralAttribution(...)`
- `recordReferralCommission(...)`

Recommended route additions once the web flow is stable:

- `/api/mobile/teacher/library`
- `/api/mobile/teacher/reporting`
- `/api/mobile/teacher/referrals`

These should not be the first implementation step.

---

## Milestones

## Milestone 1: Reusable Content Schema And Helpers

Build:

- schema for `teacher_resources`
- schema for `teacher_resource_items`
- schema for `assignment_templates`
- teacher resource helper module
- template helper module
- permission helpers

Exit criteria:

- a teacher can create and list reusable content in the data layer
- templates can be linked to future assignments

Current status:

- reusable-content tables are added
- assignment template provenance support is added to `assignments`
- helper modules exist for teacher resources and assignment templates
- permission helpers exist for Phase 3 teacher-owned objects

## Milestone 2: Teacher Library UI

Build:

- `/notebook/teacher/library`
- create/edit resource flow
- template list
- create assignment from template action

Exit criteria:

- teacher can save reusable content and use it to create new assignments

## Milestone 3: Assignment Template Adoption

Build:

- save current assignment as template
- duplicate across classrooms
- template provenance on assignments

Exit criteria:

- teacher assignment creation is no longer scratch-only

## Milestone 4: Reporting Layer

Build:

- reporting summary page
- classroom intervention page
- student attention lists
- low-activity / missing-work views

Exit criteria:

- teacher can identify who needs attention from one screen

## Milestone 5: Referral MVP

Build:

- referral code generation
- attribution write path
- checkout metadata integration
- referral dashboard
- commission ledger

Exit criteria:

- teacher can see referral code, referred students, and commission totals

## Milestone 6: Referral Operations

Build:

- payout status UI
- manual payout tracking
- commission hold/approve workflow
- fraud review notes

Exit criteria:

- the team can operate referral payouts manually without external spreadsheets

---

## Risks And Decisions To Lock Early

### 1. Template object model

Decision needed:

- should templates and resources be separate objects
- or should one resource model cover both

Recommendation:

- start with both only if assignment-shell reuse and content reuse diverge quickly
- otherwise merge them into one simpler teacher-library model

### 2. Reporting complexity

Decision needed:

- derive live from current tables
- or create snapshots early

Recommendation:

- derive live first
- snapshot only if performance requires it

### 3. Referral timing

Decision needed:

- include referral MVP in the first coding pass of Phase 3
- or ship reusable content first and referral second

Recommendation:

- reusable content first
- referral MVP second

---

## Definition Of Ready

Phase 3 implementation is ready to begin when:

- the first object model decision for templates/resources is made
- the team agrees reporting starts lightweight
- the team agrees referral MVP is internal-ledger-first
- the team agrees marketplace work remains deferred

---

## Recommended Immediate Next Step

Start **Milestone 1**:

1. add Phase 3 reusable-content tables in `src/lib/db.ts`
2. add teacher library helper modules
3. add permission helpers
4. add template provenance support on `assignments`
