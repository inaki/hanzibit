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

export const dynamic = "force-dynamic";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
}) {
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
      redirect(`/notebook/classes?error=${encodeURIComponent(result.error)}`);
    }
    redirect(`/notebook/classes/${result.id}?success=created`);
  }

  async function joinClassroomFormAction(formData: FormData) {
    "use server";
    const result = await joinClassroomAction(formData);
    if ("error" in result) {
      redirect(`/notebook/classes?error=${encodeURIComponent(result.error)}`);
    }
    redirect(`/notebook/classes/${result.id}?success=joined`);
  }

  return (
    <div data-testid="classes-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Phase 2
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Classes</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Create classrooms, join by code, and keep teacher-guided work inside the same notebook flow.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {teacher ? "Teacher role active" : "Learner role active"}
          </div>
        </div>

        {params.error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {params.error}
          </div>
        )}

        {params.success && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {params.success === "created"
              ? "Classroom created."
              : params.success === "joined"
                ? "Joined classroom."
                : "Success."}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--cn-orange)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Your Classrooms
              </h2>
            </div>

            {classrooms.length === 0 ? (
              <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
                You are not in any classrooms yet. Create one if you want to teach, or join one with a classroom code.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {classrooms.map((classroom) => (
                  <Link
                    key={classroom.id}
                    href={`/notebook/classes/${classroom.id}`}
                    className="rounded-2xl border bg-card p-5 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{classroom.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          classroom.membership_role === "teacher"
                            ? "border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 text-[var(--cn-orange)]"
                            : "border border-sky-500/20 bg-sky-500/10 text-sky-400"
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
            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Create Classroom
                </h2>
              </div>
              <form action={createClassroomFormAction} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Name</label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Tuesday HSK 1 Group"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Short classroom note"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--cn-orange)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--cn-orange-dark)]"
                >
                  Create classroom
                </button>
              </form>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <LogIn className="h-4 w-4 text-[var(--cn-orange)]" />
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
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm uppercase tracking-[0.2em] text-foreground outline-none focus:border-[var(--cn-orange)]"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--cn-orange)]/25 bg-[var(--cn-orange)]/10 px-4 py-2 text-sm font-medium text-[var(--cn-orange)] transition-colors hover:bg-[var(--cn-orange)]/15"
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
