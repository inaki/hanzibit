import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, MessageSquareText } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { isTeacherUser } from "@/lib/classrooms";
import { listTeacherInquiries } from "@/lib/teacher-inquiries";
import {
  convertInquiryToClassroomAction,
  respondToTeacherInquiryAction,
} from "@/lib/actions";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";

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

export default async function TeacherInquiriesPage() {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  const inquiries = await listTeacherInquiries(userId);
  const pending = inquiries.filter((item) => item.status === "pending");
  const handled = inquiries.filter((item) => item.status !== "pending");

  async function respondFormAction(formData: FormData) {
    "use server";
    await respondToTeacherInquiryAction(formData);
  }

  async function convertFormAction(formData: FormData) {
    "use server";
    await convertInquiryToClassroomAction(formData);
  }

  return (
    <div data-testid="teacher-inquiries-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Phase 4
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Teacher Inquiries</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Review new learner requests before you decide whether to accept or decline them.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
            Inquiry inbox
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-[var(--cn-orange)]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Pending
            </h2>
          </div>
          {pending.length === 0 ? (
            <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
              No pending inquiries right now.
            </div>
          ) : (
            <div className="grid gap-4">
              {pending.map((inquiry) => (
                <article key={inquiry.id} className="rounded-2xl border bg-card p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusPill status={inquiry.status} />
                        <p className="text-sm font-semibold text-foreground">
                          {inquiry.student_name} <span className="text-muted-foreground">({inquiry.student_email})</span>
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sent {new Date(inquiry.created_at).toLocaleString()}
                      </p>
                      <div className="rounded-xl border bg-muted/30 p-4 text-sm text-foreground/85">
                        {inquiry.message || "No message included."}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {inquiry.status === "pending" ? (
                        <form action={respondFormAction}>
                          <input type="hidden" name="inquiry_id" value={inquiry.id} />
                          <input type="hidden" name="status" value="accepted" />
                          <PendingSubmitButton idleLabel="Accept inquiry" pendingLabel="Accepting..." />
                        </form>
                      ) : null}
                      <form action={respondFormAction}>
                        <input type="hidden" name="inquiry_id" value={inquiry.id} />
                        <input type="hidden" name="status" value="declined" />
                        <PendingSubmitButton idleLabel="Decline inquiry" pendingLabel="Declining..." />
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-[var(--cn-orange)]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Handled
            </h2>
          </div>
          {handled.length === 0 ? (
            <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
              Accepted or declined inquiries will appear here.
            </div>
          ) : (
            <div className="grid gap-4">
              {handled.map((inquiry) => (
                <article key={inquiry.id} className="rounded-2xl border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusPill status={inquiry.status} />
                        <p className="text-sm font-semibold text-foreground">
                          {inquiry.student_name}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {inquiry.message || "No message included."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {inquiry.status === "accepted" && !inquiry.created_classroom_id ? (
                        <form action={convertFormAction} className="flex flex-wrap items-center gap-3">
                          <input type="hidden" name="inquiry_id" value={inquiry.id} />
                          <input
                            type="text"
                            name="classroom_name"
                            placeholder={`${inquiry.student_name} Private Classroom`}
                            className="w-64 rounded-lg border bg-background px-3 py-2 text-sm"
                          />
                          <PendingSubmitButton
                            idleLabel="Create classroom"
                            pendingLabel="Creating classroom..."
                          />
                        </form>
                      ) : null}
                      {inquiry.created_classroom_id ? (
                        <Link
                          href={`/notebook/classes/${inquiry.created_classroom_id}`}
                          className="text-sm font-medium text-[var(--cn-orange)] hover:underline"
                        >
                          Open classroom
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
