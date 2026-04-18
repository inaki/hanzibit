import type { Meta, StoryObj } from "@storybook/react";

import {
  TeachingExplainerBlock,
  TeachingCollectionSection,
  TeachingEntityCard,
  TeachingPageHeader,
  TeachingToneMetricCard,
} from "./teaching";
import { BookCopy, FolderKanban, Sparkles } from "lucide-react";

const meta = {
  title: "Patterns/Teaching",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Header: Story = {
  render: () => (
    <div className="mx-auto max-w-5xl p-4">
      <TeachingPageHeader
        title="Teaching Workspace"
        description="Manage your public profile, incoming inquiries, reusable teaching assets, classroom reporting, and referral growth from one place."
        badge="Consolidated teacher hub"
      />
    </div>
  ),
};

export const ToneMetrics: Story = {
  render: () => (
    <div className="mx-auto grid max-w-5xl gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
      <TeachingToneMetricCard
        title="Load state"
        value="stretched"
        tone="orange"
        icon={Sparkles}
        note="The current learner mix needs attention."
      />
      <TeachingToneMetricCard title="Urgent learners" value={3} tone="rose" icon={BookCopy} />
      <TeachingToneMetricCard title="Overdue checkpoints" value={2} tone="amber" />
      <TeachingToneMetricCard title="Repeated pressure" value={4} tone="sky" />
      <TeachingToneMetricCard title="Weak support paths" value={1} tone="violet" />
      <TeachingToneMetricCard title="Your classrooms" value={5} tone="muted" icon={FolderKanban} />
    </div>
  ),
};

export const ExplainerBlock: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl p-4">
      <TeachingExplainerBlock
        title="Review rhythm"
        tone="sky"
        body="Review rhythm highlights what needs a fresh checkpoint. `Due now` means it should be revisited soon; `overdue` means the teacher has likely gone too long without a meaningful review, adaptation, or support recheck."
      />
      <TeachingExplainerBlock title="Plain muted variant" tone="muted">
        Use the muted variant for lower-pressure setup or explanatory content.
      </TeachingExplainerBlock>
    </div>
  ),
};

export const CollectionSection: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl p-4">
      <TeachingCollectionSection
        title="Checkpoint Rhythm"
        emptyMessage="No review checkpoints are surfacing yet."
        empty={false}
      >
        <div className="space-y-3">
          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold text-foreground">Marina Soto</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Review is due now because the learner still has open intervention pressure.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold text-foreground">Javier Ramos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Adaptation is overdue and the current support path still looks weak.
            </p>
          </div>
        </div>
      </TeachingCollectionSection>
    </div>
  ),
};

export const EmptyCollectionSection: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl p-4">
      <TeachingCollectionSection title="Teaching Playbooks" emptyMessage="No reusable playbooks yet." empty>
        <div />
      </TeachingCollectionSection>
    </div>
  ),
};

export const EntityCard: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl p-4">
      <TeachingEntityCard
        href="#"
        badges={
          <>
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
              Awaiting teacher
            </span>
            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300">
              Needs adaptation
            </span>
          </>
        }
        title="Marina Soto"
        subtitle="Private tutoring · HSK 1 foundations"
        meta={
          <>
            <div>
              <p className="font-semibold uppercase tracking-[0.16em]">Next assignment</p>
              <p className="mt-1 text-sm text-foreground/85">Describe your family in 4 sentences</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.16em]">Last review</p>
              <p className="mt-1 text-sm text-foreground/85">04/12/2026</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.16em]">Current strategy</p>
              <p className="mt-1 text-sm text-foreground/85">Confidence ladder</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.16em]">Current playbook</p>
              <p className="mt-1 text-sm text-foreground/85">Slow confidence rebuild</p>
            </div>
          </>
        }
      >
        <p className="mt-3 text-sm text-muted-foreground">
          Latest intervention: Keep the next lesson narrow and require one supported response before moving to free output.
        </p>
      </TeachingEntityCard>
    </div>
  ),
};
