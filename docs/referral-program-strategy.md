# HanziBit Teacher Referral Program Strategy

## Purpose

This document outlines a practical way to implement a referral program where teachers bring students to HanziBit and receive a percentage of subscription revenue.

It also explains **when** this should be implemented relative to the broader product evolution strategy in `docs/product-evolution-strategy.md`.

---

## Short Answer

Yes, HanziBit can support a teacher referral program.

The cleanest version is:

- HanziBit owns the customer relationship and subscription
- teachers receive a referral code or referral link
- students sign up through that referral path
- if a referred student becomes a paid subscriber, HanziBit records a commission for the referring teacher
- teachers are paid out on a schedule

This should be treated as an **affiliate/referral program**, not as a teacher-owned subscription system.

Current implementation status as of April 14, 2026:

- teacher referral codes are implemented
- teacher referral links are implemented through `/r/<code>`
- referral attribution is stored locally
- Stripe checkout metadata carries referral attribution
- Stripe webhooks create internal commission ledger rows
- teacher payout batches are tracked internally
- a support override path exists for attribution fixes

Still intentionally not implemented:

- student discount/coupon flow
- automated refund reversal workflow
- Stripe Connect or automated external payouts

---

## Why This Fits The Current App

The current billing flow is already platform-owned:

- HanziBit creates Stripe Checkout sessions
- HanziBit receives Stripe webhooks
- HanziBit stores subscription state locally

That means referrals can be added without redesigning billing ownership.

The current architecture already supports the right basic model:

- a platform-controlled checkout flow
- local subscription records
- webhook-based billing state sync
- authenticated users and user IDs that can be used for attribution

This makes referral attribution much easier than trying to split subscription ownership between HanziBit and teachers.

---

## Recommended Referral Model

## V1 Model

The first version should be simple.

### Teacher gets:

- a unique referral code
- a shareable referral link
- a basic referral dashboard
- monthly payout once commissions pass a minimum threshold

### Student gets:

- optional discount on first payment, or no discount at all
- normal HanziBit subscription under HanziBit billing

### HanziBit does:

- track which teacher referred which student
- attribute paid subscriptions to the teacher
- calculate commissions internally
- pay teachers on a regular payout cycle

---

## Recommended Business Rules

To avoid complexity early, HanziBit should adopt strict rules in V1.

### Attribution Rules

- one referring teacher per student
- first-touch or last-touch attribution, but choose one and keep it consistent
- attribution window, for example 30 days from referral click to signup
- no changing the referrer after the first paid conversion unless support manually overrides it

### Commission Rules

- commission applies only to successful collected payments
- commission does not apply when a payment fails
- commission is reversed or voided if payment is refunded
- commission should apply for a limited period, for example first 6 or 12 paid months
- minimum payout threshold, for example `$25`

### Abuse Prevention Rules

- teacher cannot refer themselves
- duplicate referrals are rejected
- suspicious referral patterns are flagged for review
- payouts can be held during an initial fraud-review window

---

## What Not To Do First

The first version should **not** include:

- teacher-owned subscriptions
- direct percentage splitting at checkout
- a full marketplace payout system
- complex multi-touch attribution
- automatic recurring lifetime commission forever

These add accounting, payout, legal, and abuse complexity too early.

---

## Suggested Product Options

## Option A: Referral Only

The student pays standard price.

The teacher earns a commission when the student becomes a paid subscriber.

### Pros

- simplest to explain internally
- lowest implementation complexity
- best for preserving margin

### Cons

- less compelling for students than a discounted offer

---

## Option B: Referral Plus Student Discount

The teacher shares a referral code that also gives the student a discount, such as:

- first month discount
- first year discount
- free trial extension

The teacher still earns commission on the collected amount.

### Pros

- better conversion
- easier for teachers to promote

### Cons

- lower margin
- more moving parts in pricing and analytics

---

## Recommended Starting Policy

For HanziBit, a good V1 policy would be:

- each teacher gets a unique referral code
- optional first-month student discount
- teacher earns `20%` to `30%` of collected subscription revenue
- commission applies only for the first `6` to `12` paid months
- monthly payout cycle
- minimum payout threshold

This is easier to manage than unlimited recurring revenue share.

---

## Recommended Technical Design

The implementation should be split into three layers.

## 1. Referral Attribution

HanziBit needs to know who referred whom.

### New tables to add

- `referral_codes`
- `referral_attributions`
- `referral_commissions`
- `teacher_payout_accounts`
- `teacher_payouts`

### Example responsibilities

#### `referral_codes`

- code string
- teacher user ID
- active/inactive state
- optional campaign metadata

#### `referral_attributions`

- student user ID
- teacher user ID
- referral code
- attribution source
- referral timestamp
- conversion timestamp

#### `referral_commissions`

- linked subscription or invoice event
- student user ID
- teacher user ID
- gross amount
- eligible amount
- commission percentage
- commission amount
- status such as pending, approved, paid, reversed

#### `teacher_payout_accounts`

- payout method state
- Stripe Connect account reference later if needed
- tax/compliance status fields if needed later

#### `teacher_payouts`

- payout period
- total amount
- payout date
- payout status

---

## 2. Checkout And Subscription Attribution

When a student goes from free to paid:

- preserve the teacher attribution
- attach referral metadata to checkout
- carry metadata into subscription records and webhook processing

### Recommended implementation direction

When a referred student starts checkout:

- look up existing attribution
- include teacher or attribution IDs in checkout metadata
- include the same metadata in subscription metadata

This keeps attribution stable when Stripe webhooks arrive later.

---

## 3. Commission Calculation

Do not create commissions when checkout starts.

Create commissions only when payment is actually collected and accepted.

### Good V1 logic

- student subscription is created
- payment succeeds
- webhook confirms paid status
- HanziBit creates a pending commission record
- after refund-risk window passes, mark as approved
- include in next payout batch

This avoids paying on failed or reversed revenue.

---

## Payout Strategy

## Recommended V1

Use internal commission tracking and pay teachers manually or semi-manually on a monthly cycle.

### Why

- fastest to launch
- easiest to audit
- avoids early payout complexity
- lets the team validate whether teacher referrals are meaningful

## Recommended V2

Once referral volume is proven, add more automation for payouts.

Possible later direction:

- Stripe Connect onboarding
- automated payout batching
- compliance and tax handling improvements

V2 should only happen after V1 proves there is enough teacher-driven revenue to justify the operational cost.

---

## UX Recommendations

The teacher experience should stay lightweight.

### Teacher dashboard should show

- referral code
- referral link
- number of referred students
- number of converted paid students
- pending commissions
- paid commissions
- payout history

### Student flow should be simple

- teacher shares link
- student lands on marketing/signup flow
- referral code is captured automatically
- signup and checkout proceed normally

Avoid building a heavy affiliate portal at the start.

---

## Risks And Constraints

The biggest risks are not technical. They are operational and financial.

### Main risks

- fraud or self-referrals
- disputed attribution
- refunds after commission approval
- margin erosion if discounts and commission are too generous
- payout administration burden

### Mitigation

- start with conservative commission terms
- use a payout threshold
- hold commissions until payment is stable
- define clear attribution rules
- keep support overrides manual at first

---

## When Should HanziBit Build This?

Based on `docs/product-evolution-strategy.md`, the referral program should **not** be the immediate next build.

### It should come after:

- the standalone learner app is more solid
- the mobile/backend contract is stable
- the teacher/classroom model is defined enough that “teacher” is a real role in the system

### It should come before:

- a full tutoring marketplace
- complex teacher monetization systems

---

## Recommended Timing Relative To The Previous Strategy

## Best timing: late Phase 2 or early Phase 3

From the previous product strategy:

- **Phase 1** is strengthening the standalone learner app
- **Phase 2** is adding classroom mode for teachers and students
- **Phase 3** is adding teacher content and instructional tools
- **Phase 4** is exploring a tutor marketplace

The referral program fits best in **late Phase 2 or early Phase 3**.

### Why not in Phase 1

During Phase 1, HanziBit should focus on:

- making the learner product reliable
- improving onboarding
- stabilizing billing and mobile architecture

Adding referrals too early would introduce payout logic before the product and conversion funnel are mature enough.

### Why not before classroom work exists

A referral program aimed at teachers works better when:

- teachers have a clear role in the product
- teachers already see value in the platform
- there is a reason for them to recommend HanziBit to students

Without teacher-facing workflows, the referral offer is weaker and more artificial.

### Why before the marketplace

The referral program is a lighter, safer monetization bridge than a full tutor marketplace.

It helps HanziBit:

- test teacher acquisition channels
- learn how teachers drive paid growth
- build payout and attribution discipline

That creates useful groundwork before moving into marketplace territory.

---

## Recommended Rollout Order

### Step 1

Finish the core learner hardening work from Phase 1.

### Step 2

Define teacher role and basic classroom model in Phase 2.

### Step 3

After teachers can actually use HanziBit with students, launch a simple referral MVP:

- referral code
- attribution
- internal commission ledger
- manual monthly payouts

### Step 4

If referrals perform well, expand into:

- teacher dashboard improvements
- automated payout workflows
- student discount campaigns

### Step 5

Only later evaluate whether marketplace discovery should be added.

---

## Clear Recommendation

HanziBit should implement a teacher referral program, but not immediately.

The right timing is:

**after the learner app is hardened and after the first teacher/classroom workflows exist, but before investing in a full tutoring marketplace.**

In practical terms, that means:

- not now as the next immediate feature
- likely after classroom MVP
- ideally as a late Phase 2 or early Phase 3 initiative

---

## Summary

The best referral design for HanziBit is a simple teacher affiliate model:

- HanziBit owns billing
- teachers bring students through referral links or codes
- commissions are tracked internally
- payouts happen on a schedule

This should be launched only once the teacher role is real enough to support it.

That makes the referral program a growth layer on top of the product, not a distraction from building the product itself.
