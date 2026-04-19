import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, PlusCircle, LogIn } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import {
  createClassroomAction,
  joinClassroomAction,
} from "@/lib/actions";
import {
  isTeacherUser,
  listClassroomsForUser,
} from "@/lib/classrooms";
import { HubFocusSection, HubPageHeader } from "@/components/patterns/hub";
import { SummaryStatCard } from "@/components/patterns/metrics";
import { MetricPill } from "@/components/patterns/status";

export const dynamic = "force-dynamic";

type ClassesPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
  variant?: "default" | "hub";
  basePath?: string;
};

export async function ClassesPageContent({
  searchParams,
  variant = "default",
  basePath = "/notebook/classes",
}: ClassesPageProps) {
  const userId = await getAuthUserId();
  const [params, classrooms, teacher] = await Promise.all([
    searchParams,
    listClassroomsForUser(userId),
    isTeacherUser(userId),
  ]);

  async function createClassroomFormAction(formData: FormData) {
    "use server";
    const result = await createClassroomAction(formData);
    if ("error" in result) {
      redirect(`${basePath}?error=${encodeURIComponent(result.error)}`);
    }
    redirect(`${basePath}/${result.id}?success=created`);
  }

  async function joinClassroomFormAction(formData: FormData) {
    "use server";
    const result = await joinClassroomAction(formData);
    if ("error" in result) {
      redirect(`${basePath}?error=${encodeURIComponent(result.error)}`);
    }
    redirect(`${basePath}/${result.id}?success=joined`);
  }

  const showStandaloneHeader = variant === "default";
  const title = teacher ? "Classes" : "Your Classes";
  const description = teacher
    ? "Create classrooms, join by code, and keep teacher-guided work inside the same notebook flow."
    : "See the classes where a teacher is guiding your work, and join a new one when you receive a classroom code.";
  const isLearnerHub = variant === "hub" && !teacher;
  const privateTutoringClasses = classrooms.filter((classroom) => {
    const haystack = `${classroom.name} ${classroom.description ?? ""}`.toLowerCase();
    return haystack.includes("private");
  }).length;
  const learnerHubMode =
    classrooms.length === 0
      ? {
          badge: "Waiting for a class code",
          tone: "sky" as const,
          title: "You are not in any teacher-guided classes yet",
          body:
            "This space stays quiet until a teacher shares a classroom code or converts an inquiry into an active tutoring relationship.",
        }
      : privateTutoringClasses > 0
        ? {
            badge: "Private tutoring active",
            tone: "emerald" as const,
            title: "One class is now your private tutoring space",
            body:
              "Use your private classroom as the main place for tutoring follow-through, and keep other classes for broader guided support.",
          }
        : {
            badge: "Guided classes active",
            tone: "amber" as const,
            title: "Your guided classes are active",
            body:
              "Use classes for teacher context and shared expectations, then move into assignments when you need to do the actual work.",
          };

  return (
    <div data-testid="classes-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {showStandaloneHeader ? (
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Phase 2
              </p>
              <h1 className="mt-2 text-3xl font-bold text-foreground">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="inline-flex items-center rounded-full bg-card card-ring px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {teacher ? "Teacher role active" : "Learner role active"}
            </div>
          </div>
        ) : (
          <HubPageHeader title={title} description={description} badge={learnerHubMode.badge} />
        )}

        {params.error && (
          <div className="ui-tone-rose-panel ui-tone-rose-text rounded-xl border px-4 py-3 text-sm">
            {params.error}
          </div>
        )}

        {params.success && (
          <div className="ui-tone-emerald-panel ui-tone-emerald-text rounded-xl border px-4 py-3 text-sm">
            {params.success === "created"
              ? "Classroom created."
              : params.success === "joined"
                ? "Joined classroom."
                : "Success."}
          </div>
        )}

        {isLearnerHub ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <SummaryStatCard label="Total classes" value={classrooms.length} tone="sky" />
              <SummaryStatCard label="Active classes" value={classrooms.length} tone="amber" />
              <SummaryStatCard label="Private tutoring" value={privateTutoringClasses} tone="emerald" />
            </div>

            <HubFocusSection
              title="Classroom Focus"
              icon={Users}
              pills={
                <>
                <MetricPill label={`${classrooms.length} active`} tone="amber" />
                <MetricPill label={`${privateTutoringClasses} private`} tone="sky" />
                <MetricPill label="Join by code when invited" tone="muted" />
                </>
              }
              tone={learnerHubMode.tone}
              guidanceTitle={learnerHubMode.title}
              guidanceBody={learnerHubMode.body}
            />
          </>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="ui-tone-orange-text h-4 w-4" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Your Classrooms
              </h2>
            </div>

            {classrooms.length === 0 ? (
              <div className="rounded-2xl bg-card card-ring p-6 text-sm text-muted-foreground">
                {teacher
                  ? "You are not in any classrooms yet. Create one if you want to teach, or join one with a classroom code."
                  : "You are not in any classes yet. Once a teacher shares a code, it will appear here after you join."}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {classrooms.map((classroom) => (
                  <Link
                    key={classroom.id}
                    href={`${basePath}/${classroom.id}`}
                    className="rounded-2xl bg-card card-ring p-5 transition-colors hover:border-[var(--ui-tone-orange-border)] hover:bg-muted/20"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{classroom.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          classroom.membership_role === "teacher"
                            ? "ui-tone-orange-panel ui-tone-orange-text border"
                            : "ui-tone-sky-panel ui-tone-sky-text border"
                        }`}
                      >
                        {classroom.membership_role}
                      </span>
                    </div>
                    {classroom.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{classroom.description}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Join code: {classroom.join_code}</span>
                      <span>Open class</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-card card-ring p-5">
              <div className="mb-4 flex items-center gap-2">
                <PlusCircle className="ui-tone-orange-text h-4 w-4" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Create Classroom
                </h2>
              </div>
              {teacher ? <form action={createClassroomFormAction} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Name</label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Tuesday HSK 1 Group"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Short classroom note"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
                >
                  Create classroom
                </button>
              </form> : (
                <p className="text-sm text-muted-foreground">
                  Teachers create classrooms. If you are learning with a teacher, use the join code they shared with you.
                </p>
              )}
            </section>

            <section className="rounded-2xl bg-card card-ring p-5">
              <div className="mb-4 flex items-center gap-2">
                <LogIn className="ui-tone-orange-text h-4 w-4" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Join Classroom
                </h2>
              </div>
              <form action={joinClassroomFormAction} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Join code</label>
                  <input
                    name="join_code"
                    required
                    placeholder="e.g. AB12CD"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm uppercase tracking-[0.2em] text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <button
                  type="submit"
                  className="ui-tone-orange-panel ui-tone-orange-text inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
                >
                  Join with code
                </button>
              </form>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default async function ClassesPage(props: ClassesPageProps) {
  return <ClassesPageContent {...props} />;
}
