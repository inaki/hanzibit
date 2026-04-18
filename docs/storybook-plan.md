## Storybook Plan

Current state summary:

- see `docs/storybook-closeout.md` for the current Storybook inventory, runtime notes, and remaining gaps

This repo now has a Storybook workspace that covers both:

- the reusable component library
- the composed product-story layer used to redesign real notebook screens safely

### Purpose

- document the design system in one place
- iterate on UI primitives before touching full notebook screens
- make dark mode and token-level changes easier to verify
- give the team a stable dev environment for UI work

### Current scope

- `src/components/ui`
- `src/components/patterns`
- `src/stories/product`
- light / dark theme preview using the same global tokens from `src/app/globals.css`
- primitive stories for:
  - `Button`
  - `Card`
  - `Input`
  - `Badge`
  - `Progress`
  - `Tabs`
- pattern stories for:
  - metrics
  - status
  - guidance
  - surfaces
  - action rail
  - forms
  - hub
  - teaching
- overview stories for:
  - `Foundations / Design System Overview`
  - `Foundations / Patterns Overview`
  - `Product / Product Screens Overview`
- composed product stories for:
  - dashboard cards
  - teaching overview blocks
  - reporting sections
  - teaching library sections
  - teaching private learner detail
  - learner teacher hub
  - learner teacher assignments
  - learner teacher inquiries
  - learner teacher classes

### Scripts

- `npm run storybook`
- `npm run build-storybook`

### Important note

The Storybook config and stories are committed, and the local package state now includes the Storybook binary. Runtime should still be verified in a normal dev session with:

```bash
npm run storybook
```

If the team prefers `pnpm`, use:

```bash
pnpm storybook
```

### Recommended next stories

- `Dialog`
- `Sheet`
- `Tooltip`
- `DropdownMenu`
- more composed product stories only when the underlying screen pattern is stable enough to reuse

### Story structure

- `Foundations/*`
  - design tokens, primitives, and reusable product patterns
- `Product/*`
  - composed screen sections and realistic UI states for iteration before live page refactors

See [storybook-workflow.md](/Users/inaki/my-repos/hanzibit/docs/storybook-workflow.md) for the day-to-day usage model.
