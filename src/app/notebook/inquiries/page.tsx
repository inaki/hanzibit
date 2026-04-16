import Link from "next/link";
import { getAuthUserId } from "@/lib/auth-utils";
import { listStudentInquiries } from "@/lib/teacher-inquiries";

export const dynamic = "force-dynamic";

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "pending"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
      : status === "accepted"
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
        : status === "converted"
          ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
          : "border-rose-500/20 bg-rose-500/10 text-rose-500";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${styles}`}>
      {status}
    </span>
  );
}

function getLearnerNextStepCopy(inquiry: {
  onboarding_message: string | null;
  initial_assignment_id: string | null;
  assignment_title: string | null;
}) {
  if (inquiry.onboarding_message) {
    return inquiry.onboarding_message;
  }

  if (inquiry.initial_assignment_id) {
    return inquiry.assignment_title
      ? `Your teacher has opened a private classroom and the first assignment is ready: ${inquiry.assignment_title}.`
      : "Your teacher has opened a private classroom and your first assignment is ready.";
  }

  return "Your teacher has created a private classroom for you. Open it to continue working together in HanziBit.";
}

type LearnerInquiriesPageProps = {
  variant?: "default" | "hub";
};

export async function LearnerInquiriesPageContent({
  variant = "default",
}: LearnerInquiriesPageProps) {
  const userId = await getAuthUserId();
  const inquiries = await listStudentInquiries(userId);
  const showStandaloneHeader = variant === "default";

  return (
    <div data-testid="learner-inquiries-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {showStandaloneHeader ? "My Teacher Inquiries" : "Inquiries"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {showStandaloneHeader
              ? "Track the teachers you contacted before they convert into a classroom or tutoring relationship."
              : "Track outreach to teachers before it turns into a classroom or private tutoring relationship."}
          </p>
        </div>

        {inquiries.length === 0 ? (
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            You have not sent any teacher inquiries yet.{" "}
            <Link href="/teachers" className="font-medium text-[var(--cn-orange)] hover:underline">
              Browse teachers
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-4">
            {inquiries.map((inquiry) => (
              <article key={inquiry.id} className="rounded-2xl border bg-card p-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill status={inquiry.status} />
                    {inquiry.status === "converted" ? (
                      <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">
                        Private tutoring
                      </span>
                    ) : null}
                    <p className="text-sm font-semibold text-foreground">{inquiry.teacher_name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sent {new Date(inquiry.created_at).toLocaleString()}
                  </p>
                  <div className="rounded-xl border bg-muted/30 p-4 text-sm text-foreground/85">
                    {inquiry.message || "No message included."}
                  </div>
                  {inquiry.status === "converted" ? (
                    <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm">
                      <p className="font-semibold text-foreground">Private tutoring next steps</p>
                      <p className="mt-1 text-muted-foreground">
                        {getLearnerNextStepCopy(inquiry)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {inquiry.initial_assignment_id ? (
                          <Link
                            href={`/notebook/with-teacher/assignments/${inquiry.initial_assignment_id}`}
                            className="font-medium text-[var(--cn-orange)] hover:underline"
                          >
                            Open first assignment
                            {inquiry.assignment_title ? `: ${inquiry.assignment_title}` : ""}
                          </Link>
                        ) : null}
                        {inquiry.created_classroom_id ? (
                          <Link
                            href={`/notebook/with-teacher/classes/${inquiry.created_classroom_id}`}
                            className="font-medium text-[var(--cn-orange)] hover:underline"
                          >
                            Open classroom
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  {inquiry.created_classroom_id ? (
                    <Link
                      href={`/notebook/with-teacher/classes/${inquiry.created_classroom_id}`}
                      className="inline-flex text-sm font-medium text-[var(--cn-orange)] hover:underline"
                    >
                      Open classroom
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function LearnerInquiriesPage(
  props: LearnerInquiriesPageProps
) {
  return <LearnerInquiriesPageContent {...props} />;
}
