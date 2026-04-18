import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, LogIn, Users } from "lucide-react";

import { GuidanceBanner } from "@/components/patterns/guidance";
import { SummaryStatCard } from "@/components/patterns/metrics";
import { MetricPill } from "@/components/patterns/status";
import { SectionCard } from "@/components/patterns/surfaces";

type ClassroomItem = {
  id: string;
  name: string;
  description?: string;
  role: "student" | "private";
  joinCode: string;
  signal: string;
};

type LearnerClassesScenario = {
  badge: string;
  summary: {
    total: number;
    active: number;
    privateTutoring: number;
  };
  guidanceTone: "sky" | "amber" | "violet" | "emerald";
  guidanceTitle: string;
  guidanceBody: string;
  classrooms: ClassroomItem[];
};

const meta = {
  title: "Product/Learner Teacher Classes",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ClassroomCard({ classroom }: { classroom: ClassroomItem }) {
  return (
    <article className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--cn-orange)]" />
            <h3 className="truncate text-lg font-semibold text-foreground">{classroom.name}</h3>
          </div>
          {classroom.description ? (
            <p className="mt-2 text-sm text-muted-foreground">{classroom.description}</p>
          ) : null}
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
            classroom.role === "private"
              ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {classroom.role === "private" ? "private tutoring" : "guided class"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>Join code: {classroom.joinCode}</span>
        <span>{classroom.signal}</span>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--cn-orange)]">
        Open class
        <ArrowRight className="h-4 w-4" />
      </div>
    </article>
  );
}

function LearnerClassesStory({ scenario }: { scenario: LearnerClassesScenario }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teacher Classes</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            See the classrooms where a teacher is guiding your work and join new ones when you receive a class code.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
          {scenario.badge}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryStatCard label="Total classes" value={scenario.summary.total} tone="sky" />
        <SummaryStatCard label="Active classes" value={scenario.summary.active} tone="amber" />
        <SummaryStatCard label="Private tutoring" value={scenario.summary.privateTutoring} tone="emerald" />
      </div>

      <SectionCard title="Classroom Focus" icon={Users}>
        <div className="flex flex-wrap gap-2">
          <MetricPill label={`${scenario.summary.active} active`} tone="amber" />
          <MetricPill label={`${scenario.summary.privateTutoring} private`} tone="sky" />
          <MetricPill label="Join by code when invited" tone="muted" />
        </div>

        <GuidanceBanner tone={scenario.guidanceTone} className="mt-4">
          <p className="text-sm font-medium text-foreground">{scenario.guidanceTitle}</p>
          <p className="mt-2 text-sm">{scenario.guidanceBody}</p>
        </GuidanceBanner>
      </SectionCard>

      {scenario.classrooms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {scenario.classrooms.map((classroom) => (
            <ClassroomCard key={classroom.id} classroom={classroom} />
          ))}
        </div>
      ) : (
        <SectionCard title="Join a classroom" icon={LogIn}>
          <GuidanceBanner tone="sky">
            <p className="text-sm text-foreground">
              Once a teacher shares a classroom code, this space becomes your home for guided classes and private tutoring.
            </p>
          </GuidanceBanner>
        </SectionCard>
      )}
    </div>
  );
}

const noClassesScenario: LearnerClassesScenario = {
  badge: "Waiting for a class code",
  summary: {
    total: 0,
    active: 0,
    privateTutoring: 0,
  },
  guidanceTone: "sky",
  guidanceTitle: "You are not in any teacher-guided classes yet",
  guidanceBody:
    "This space stays quiet until a teacher shares a classroom code or converts an inquiry into an active tutoring relationship.",
  classrooms: [],
};

const joinedClassesScenario: LearnerClassesScenario = {
  badge: "Guided classes active",
  summary: {
    total: 2,
    active: 2,
    privateTutoring: 0,
  },
  guidanceTone: "amber",
  guidanceTitle: "Your guided classes are active",
  guidanceBody:
    "Use classes for context and announcements, then move into assignments when you need to do the actual guided work.",
  classrooms: [
    {
      id: "c1",
      name: "HSK 1 Foundations",
      description: "Core beginner work and weekly teacher prompts.",
      role: "student",
      joinCode: "HSK101",
      signal: "2 assignments active",
    },
    {
      id: "c2",
      name: "Writing Support Lab",
      description: "Short guided responses and teacher review.",
      role: "student",
      joinCode: "WRITE6",
      signal: "Awaiting review",
    },
  ],
};

const privateTutoringScenario: LearnerClassesScenario = {
  badge: "Private tutoring active",
  summary: {
    total: 2,
    active: 2,
    privateTutoring: 1,
  },
  guidanceTone: "emerald",
  guidanceTitle: "One class is now your private tutoring space",
  guidanceBody:
    "Your private classroom is where ongoing tutoring work lives. Use the other classes for lighter guided support when needed.",
  classrooms: [
    {
      id: "c3",
      name: "Private Tutoring with Liu Mei",
      description: "Weekly guided writing and speaking confidence support.",
      role: "private",
      joinCode: "PRIV88",
      signal: "Private tutoring active",
    },
    {
      id: "c4",
      name: "HSK 1 Foundations",
      description: "Core beginner work and weekly teacher prompts.",
      role: "student",
      joinCode: "HSK101",
      signal: "1 assignment active",
    },
  ],
};

export const NoClassesYet: Story = {
  render: () => <LearnerClassesStory scenario={noClassesScenario} />,
};

export const JoinedClasses: Story = {
  render: () => <LearnerClassesStory scenario={joinedClassesScenario} />,
};

export const PrivateTutoringClassroom: Story = {
  render: () => <LearnerClassesStory scenario={privateTutoringScenario} />,
};
