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

export default async function LearnerInquiriesPage() {
  const userId = await getAuthUserId();
  const inquiries = await listStudentInquiries(userId);

  return (
    <div data-testid="learner-inquiries-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Phase 4
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">My Teacher Inquiries</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Track the teachers you contacted before they convert into a classroom or tutoring relationship.
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
                    <p className="text-sm font-semibold text-foreground">{inquiry.teacher_name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sent {new Date(inquiry.created_at).toLocaleString()}
                  </p>
                  <div className="rounded-xl border bg-muted/30 p-4 text-sm text-foreground/85">
                    {inquiry.message || "No message included."}
                  </div>
                  {inquiry.created_classroom_id ? (
                    <Link
                      href={`/notebook/classes/${inquiry.created_classroom_id}`}
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
