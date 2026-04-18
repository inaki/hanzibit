import type { Meta, StoryObj } from "@storybook/react";
import { BarChart3, FolderKanban, LayoutDashboard, School, UserRoundCog } from "lucide-react";

const meta = {
  title: "Product/Product Screens Overview",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const screens = [
  {
    name: "Dashboard Cards",
    icon: LayoutDashboard,
    description:
      "Composed learner dashboard surfaces for daily practice, guided next steps, and progress framing.",
    storyPath: "Product/Dashboard Cards",
    highlights: [
      "Today’s Practice hierarchy",
      "Guided-response support",
      "Actionable review / study / write cards",
    ],
  },
  {
    name: "Teaching Overview Blocks",
    icon: School,
    description:
      "High-level teacher workspace blocks for workload, reuse, and cross-functional operational summaries.",
    storyPath: "Product/Teaching Overview Blocks",
    highlights: [
      "Workspace summary cards",
      "Workload snapshot",
      "Strategy and playbook reuse framing",
    ],
  },
  {
    name: "Reporting Sections",
    icon: BarChart3,
    description:
      "Denser reporting composition with grouped metrics, action panels, and compact decision-oriented summaries.",
    storyPath: "Product/Reporting Sections",
    highlights: [
      "Core portfolio overview",
      "Priority and rhythm grouping",
      "Urgent actions side rail",
    ],
  },
  {
    name: "Teaching Library Sections",
    icon: FolderKanban,
    description:
      "Composed teacher library layout with reusable collections, entity cards, and creation panels aligned to the live Teaching workspace.",
    storyPath: "Product/Teaching Library Sections",
    highlights: [
      "Reusable content metrics",
      "Library collection hierarchy",
      "Creation panel composition",
    ],
  },
  {
    name: "Teaching Private Learner Detail",
    icon: UserRoundCog,
    description:
      "Deep teacher workflow composition for review snapshots, strategy application, goals, and private tutoring context.",
    storyPath: "Product/Teaching Private Learner Detail",
    highlights: [
      "Shared teaching header and explainers",
      "Deep workflow section structure",
      "Private tutoring context rail",
    ],
  },
];

export const Overview: Story = {
  render: () => (
    <div className="mx-auto max-w-7xl space-y-10 p-8">
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
          Composed product stories
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Screen-level Storybook workspace</h1>
          <p className="max-w-3xl text-base text-muted-foreground">
            These stories sit above primitives and reusable patterns. They are the safe place to
            redesign learner and teacher screen sections before touching the live notebook pages.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-5">
        {screens.map(({ name, icon: Icon, description, storyPath, highlights }) => (
          <div key={name} className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[var(--cn-orange)]" />
                  <h2 className="text-lg font-semibold text-foreground">{name}</h2>
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <div className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                Story
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Open in Storybook
              </p>
              <p className="mt-2 font-mono text-sm text-foreground">{storyPath}</p>
            </div>

            <div className="mt-5 space-y-2">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm text-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
