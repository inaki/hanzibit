## Storybook Workflow

Current state summary:

- see `docs/storybook-closeout.md` for the current inventory, runtime notes, and remaining gaps

Use Storybook as a UI dev environment, not only as a component catalog.

### Story layers

#### `Foundations/*`

Use this layer for:

- `src/components/ui`
- `src/components/patterns`
- light/dark verification
- token and spacing cleanup
- reusable building blocks

Examples:

- `Foundations / Design System Overview`
- `Foundations / Patterns Overview`
- `components/ui/*.stories.tsx`
- `components/patterns/*.stories.tsx`
- `Patterns / Hub`
- `Patterns / Teaching`

#### `Product/*`

Use this layer for:

- composed screen sections
- realistic learner / teacher states
- layout and hierarchy experiments
- UI iterations before touching the live page

Examples:

- `Product / Dashboard Cards`
- `Product / Teaching Overview Blocks`
- `Product / Reporting Sections`
- `Product / Teaching Library Sections`
- `Product / Teaching Private Learner Detail`
- `Product / Product Screens Overview`
- `Product / Learner Teacher Hub`
- `Product / Learner Teacher Assignments`
- `Product / Learner Teacher Inquiries`
- `Product / Learner Teacher Classes`

### Recommended workflow

1. Start in `Foundations/*` when:
- the change is about primitives
- the change is about reusable patterns
- you are cleaning spacing, status styling, or dark mode

2. Start in `Product/*` when:
- the change is about hierarchy
- the change is about grouped sections
- the screen needs multiple realistic states
- you want to redesign safely before refactoring a live route

3. Back-port only after the product story feels right

This keeps feature pages from becoming the first place where layout experiments happen.

### Current product stories

- `Dashboard Cards`
  - `NewLearner`
  - `ActiveLearner`
  - `StuckLearner`

- `Teaching Overview Blocks`
  - `Healthy`
  - `Stretched`
  - `Overloaded`

- `Reporting Sections`
  - `Healthy`
  - `Stretched`
  - `Overloaded`

- `Teaching Library Sections`
  - `Default`

- `Teaching Private Learner Detail`
  - `Default`

- `Learner Teacher Hub`
  - `NewConnection`
  - `ActiveStudent`
  - `ConvertedPrivateTutoring`

- `Learner Teacher Assignments`
  - `FirstAssignments`
  - `ActiveAssignments`
  - `OverloadedAssignments`

- `Learner Teacher Inquiries`
  - `PendingOutreach`
  - `MixedState`
  - `ConvertedRelationships`

- `Learner Teacher Classes`
  - `NoClassesYet`
  - `JoinedClasses`
  - `PrivateTutoringClassroom`

### What belongs in `patterns`

Good candidates:

- summary metrics
- status pills
- guidance banners
- empty states
- hub headers
- hub focus sections
- teacher workspace headers
- teacher tinted metric cards
- compact reporting rows
- section/surface wrappers
- dialog action footers

Do not extract too early:

- one-off full-page layouts
- workflow-specific data mapping
- unstable feature-only compositions

### Current rule of thumb

If a UI block is reused across:

- dashboard
- teaching
- reporting
- study guide
- notebook dialogs

it probably belongs in `src/components/patterns`.

If it only makes sense with one route’s data model, keep it in the feature for now.

### Suggested next Storybook usage

- redesign more live screens in `Product/*` first
- extract the repeated parts into `patterns`
- then back-port the result into the app

That is the safest cycle for continuing UI cleanup without making feature pages harder to maintain.
