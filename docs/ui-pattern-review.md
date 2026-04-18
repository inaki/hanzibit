## UI Pattern Review

This is a checkpoint review of the current reusable UI extraction work after:

- adding Storybook for `ui`, `patterns`, and `product` stories
- extracting a real middle layer into `src/components/patterns`
- back-porting Storybook-driven hierarchy changes into live learner and teacher screens
- consolidating most of the `Teaching` workspace onto shared pattern components

The goal of this review is to answer:

1. what is now genuinely reusable
2. what is already well covered
3. what still justifies extraction
4. what should stay feature-local for now

### Current layers

#### `src/components/ui`

Primitive design-system layer:

- `avatar`
- `badge`
- `button`
- `card`
- `dialog`
- `dropdown-menu`
- `input`
- `progress`
- `scroll-area`
- `separator`
- `sheet`
- `tabs`
- `tooltip`

This layer is still relatively small and stable.

#### `src/components/patterns`

Reusable product-pattern layer:

- `action-rail`
- `forms`
- `guidance`
- `hub`
- `metrics`
- `reporting`
- `status`
- `surfaces`
- `teaching-header`
- `teaching-metrics`
- `teaching-sections`
- `teaching-entity-card`
- `teaching` (barrel)

This is now the real middle layer between primitives and full feature pages.

#### Feature pages

Feature pages should now mostly compose:

- `ui`
- `patterns`
- feature-specific data mapping and workflow logic

### What is already well extracted

#### Learner-connected hub patterns

Shared and in use:

- `HubPageHeader`
- `HubFocusSection`

Used in:

- `with-teacher`
- learner `Classes`
- learner `Assignments`
- learner `Inquiries`

These are stable enough to keep as product patterns.

#### Teacher workspace patterns

Shared and in use:

- `TeachingPageHeader`
- `TeachingToneMetricCard`
- `TeachingExplainerBlock`
- `TeachingCollectionSection`
- `TeachingEntityCard`

Used across:

- `Teaching > Overview`
- `Teaching > Reporting`
- `Teaching > Private Learners`
- `Teaching > Inquiries`
- `Teaching > Referrals`
- `Teaching > Setup`
- `Teaching > Library`
- library detail pages
- reporting drill-down pages
- private learner detail page

This is now a real, meaningful teacher workspace pattern system.

#### General reusable notebook/product patterns

Shared and in use:

- `SummaryStatCard`
- `OverviewMetric`
- `GuidanceBanner`
- `EmptyStateNotice`
- `SectionCard`
- `InfoPanel`
- `DialogFormActions`
- `FormErrorNotice`
- `ActionRailButton`

These are being used across dashboard, notebook helpers, study guide, reporting, dialogs, and some workspace surfaces.

### Storybook coverage status

#### Foundations coverage exists for

- `ui` primitives
- `metrics`
- `status`
- `guidance`
- `surfaces`
- `forms`
- `action-rail`
- `hub`
- `teaching`

#### Product coverage exists for

- learner dashboard states
- learner teacher hub
- learner teacher classes
- learner teacher assignments
- learner teacher inquiries
- teaching overview blocks
- teaching reporting sections
- teaching library sections
- teaching private learner detail
- product overview

### Main conclusion

The extraction effort has reached a meaningful plateau:

- the app now has a real middle layer
- Storybook is no longer just a primitive catalog
- live pages are already benefiting from the extracted structure
- most of the highest-value repeated teacher/learner workspace scaffolding is already centralized

This means the next work should be **more selective**.

We should stop extracting by default and only continue when:

- a repeated UI block is clearly reused in 3+ places
- the extraction reduces real maintenance cost
- the extracted API remains simple

### Remaining screens that still justify extraction

These still have meaningful feature-local UI that may be worth reducing:

#### 1. `study-guide.tsx`

Why it still matters:

- uses repeated teaching/notebook information panels
- has multiple nested “learning content” surfaces
- still mixes reusable presentation with feature logic

What may be worth extracting:

- grouped content-callout stacks
- word-detail metadata rows
- study response / response-launch clusters

Risk:

- medium
- this file is logic-heavy, so extraction should be careful

#### 2. `action-bar.tsx`

Why it still matters:

- still a very large feature-local file
- has repeated dialog help structure
- has multiple modal states and action surfaces

What may be worth extracting:

- notebook dialog section blocks
- helper footer/help clusters
- repeated inline form sections

Risk:

- high
- this file is workflow-dense and easy to over-abstract

#### 3. `mobile-journal-page.tsx`

Why it still matters:

- duplicates some action-bar composition ideas
- likely benefits from shared dialog/help/form substructures

Risk:

- medium

### Screens that should probably stay feature-local for now

#### `dashboard-view.tsx`

Reason:

- the broad learner framing is already in better shape
- remaining complexity is mostly domain-specific daily-practice logic
- over-extraction here may blur real workflow logic

#### `teacher/private-students/[privateStudentId]/page.tsx`

Reason:

- it now uses shared header/explainer/section structure
- what remains is mostly deep workflow logic and form content
- most remaining duplication is not generic enough yet

#### `teacher/reporting/page.tsx`

Reason:

- section shells and row shells are already much better
- what remains is mostly reporting-specific data composition
- extracting more could create reporting-only abstractions with low reuse

### Recommended next extraction priority

If more extraction work continues, the best order is:

1. `study-guide.tsx`
2. `mobile-journal-page.tsx`
3. careful, selective pass on `action-bar.tsx`

### Recommended stop line

If the goal is product readiness rather than UI-system expansion, this is a good stopping point:

- keep `ui`
- keep `patterns`
- keep Storybook current
- only extract when a new repetition is clearly painful

At this stage, more value is likely to come from:

- production-readiness cleanup
- usability simplification
- beginner onboarding
- polishing real flows

not from continuing to factor every remaining local component into the pattern layer.
