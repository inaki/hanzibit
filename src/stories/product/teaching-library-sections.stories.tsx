import type { Meta, StoryObj } from "@storybook/react";
import { BookCopy, ClipboardList, FolderKanban, Layers3, Repeat2, Sparkles } from "lucide-react";

import {
  TeachingCollectionSection,
  TeachingEntityCard,
  TeachingPageHeader,
  TeachingToneMetricCard,
} from "@/components/patterns/teaching";

const meta = {
  title: "Product/Teaching Library Sections",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function TeachingLibraryStory() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4">
      <TeachingPageHeader
        title="Library"
        description="Save reusable teaching resources and assignment templates so classroom setup is no longer scratch-first."
        badge="Reusable content"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <TeachingToneMetricCard title="Resources" value={8} tone="sky" icon={FolderKanban} />
        <TeachingToneMetricCard title="Templates" value={5} tone="amber" icon={ClipboardList} />
        <TeachingToneMetricCard title="Strategies" value={6} tone="violet" icon={Repeat2} note="5 active" />
        <TeachingToneMetricCard title="Playbooks" value={3} tone="emerald" icon={Layers3} note="3 active" />
        <TeachingToneMetricCard title="Your Classrooms" value={4} tone="muted" icon={BookCopy} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <section className="space-y-6">
          <TeachingCollectionSection title="Saved Resources" icon={FolderKanban}>
            <div className="space-y-3">
              <TeachingEntityCard
                href="#"
                badges={<Badge label="journal prompt" />}
                title="Warm-up journal prompts"
                subtitle="Short journaling prompts for low-pressure output practice."
              >
                <MetaRow items={["HSK 1", "Updated 04/17/2026"]} />
              </TeachingEntityCard>
              <TeachingEntityCard
                href="#"
                badges={<Badge label="reading response" />}
                title="Mini reading follow-through"
                subtitle="Short reading-response prompts for early comprehension and retell work."
              >
                <MetaRow items={["HSK 2", "Updated 04/12/2026"]} />
              </TeachingEntityCard>
            </div>
          </TeachingCollectionSection>

          <TeachingCollectionSection title="Assignment Templates" icon={ClipboardList}>
            <div className="space-y-3">
              <TeachingEntityCard
                href="#"
                badges={<Badge label="journal prompt" />}
                title="Daily routine writing"
                subtitle="Write 4 to 6 sentences about a real daily routine using one support phrase."
              >
                <MetaRow items={["HSK 1", "Resubmission allowed"]} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <UseChip label="Use in HSK 1 Basics" />
                  <UseChip label="Use in Beginner Tutoring" />
                </div>
              </TeachingEntityCard>
              <TeachingEntityCard
                href="#"
                badges={<Badge label="study guide word" />}
                title="Word in context response"
                subtitle="Use the selected study-guide word in a short guided response."
              >
                <MetaRow items={["HSK 1", "Resubmission locked"]} />
              </TeachingEntityCard>
            </div>
          </TeachingCollectionSection>

          <TeachingCollectionSection title="Teaching Playbooks" icon={Layers3}>
            <div className="space-y-3">
              <TeachingEntityCard
                href="#"
                badges={<Badge label="Used 4" />}
                title="Slow confidence rebuild"
                subtitle="A steady path for learners who freeze when output becomes too open."
              >
                <MetaRow items={["Issue: confidence", "3 learners affected", "2 linked strategies"]} />
                <BadgeRow
                  items={[
                    { label: "In use", tone: "emerald" },
                    { label: "Helping across learners", tone: "sky" },
                  ]}
                />
              </TeachingEntityCard>
            </div>
          </TeachingCollectionSection>

          <TeachingCollectionSection title="Tutoring Strategies" icon={Repeat2}>
            <div className="space-y-3">
              <TeachingEntityCard
                href="#"
                badges={<Badge label="Used 7" />}
                title="Confidence ladder"
                subtitle="Reduce blank-page pressure by narrowing the response before expanding it."
              >
                <MetaRow items={["Goal: output confidence", "4 learners affected", "Last used 04/16/2026"]} />
                <BadgeRow
                  items={[
                    { label: "Helping across learners", tone: "emerald" },
                    { label: "Outcome-aware", tone: "sky" },
                  ]}
                />
              </TeachingEntityCard>
            </div>
          </TeachingCollectionSection>
        </section>

        <section className="space-y-6">
          <TeachingCollectionSection title="Create Resource" icon={Sparkles}>
            <LibraryForm
              fields={["Title", "Type", "Description", "Content"]}
              cta="Create resource"
            />
          </TeachingCollectionSection>

          <TeachingCollectionSection title="Create Strategy" icon={Repeat2}>
            <LibraryForm
              fields={["Title", "Issue focus", "Goal focus", "Guidance"]}
              cta="Create strategy"
            />
          </TeachingCollectionSection>

          <TeachingCollectionSection title="Create Playbook" icon={Layers3}>
            <LibraryForm
              fields={["Title", "When to use", "Guidance", "Linked strategies"]}
              cta="Create playbook"
            />
          </TeachingCollectionSection>

          <TeachingCollectionSection title="Create Template" icon={ClipboardList}>
            <LibraryForm
              fields={["Title", "Type", "Prompt", "HSK level"]}
              cta="Create template"
            />
          </TeachingCollectionSection>
        </section>
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      {label}
    </span>
  );
}

function BadgeRow({
  items,
}: {
  items: Array<{ label: string; tone: "emerald" | "sky" | "amber" | "rose" | "muted" }>;
}) {
  const toneMap = {
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    sky: "border-sky-500/20 bg-sky-500/10 text-sky-400",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-300",
    muted: "border-border bg-muted text-muted-foreground",
  } as const;

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs">
      {items.map((item) => (
        <span
          key={item.label}
          className={`rounded-full border px-2.5 py-1 font-medium ${toneMap[item.tone]}`}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function MetaRow({ items }: { items: string[] }) {
  return <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">{items.map((item) => <span key={item}>{item}</span>)}</div>;
}

function UseChip({ label }: { label: string }) {
  return (
    <a
      href="#"
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-2 text-xs font-medium text-[var(--cn-orange)] transition-colors hover:bg-[var(--cn-orange)]/15"
    >
      <Sparkles className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}

function LibraryForm({ fields, cta }: { fields: string[]; cta: string }) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field} className="space-y-1.5">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{field}</div>
          <div className="h-11 rounded-xl border bg-background" />
        </div>
      ))}
      <button className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--cn-orange)] px-4 text-sm font-semibold text-white">
        {cta}
      </button>
    </div>
  );
}

export const Default: Story = {
  render: () => <TeachingLibraryStory />,
};
