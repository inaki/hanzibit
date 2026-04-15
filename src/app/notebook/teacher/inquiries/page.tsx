import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, MessageSquareText } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { isTeacherUser } from "@/lib/classrooms";
import { getAssignmentTemplate, listAssignmentTemplatesForTeacher } from "@/lib/assignment-templates";
import { listTeacherInquiries } from "@/lib/teacher-inquiries";
import { ensureTeacherTutoringSettings } from "@/lib/teacher-tutoring-settings";
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

export default async function TeacherInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const userId = await getAuthUserId();
  const query = await searchParams;

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  const [inquiries, tutoringSettings, templates] = await Promise.all([
    listTeacherInquiries(userId),
    ensureTeacherTutoringSettings(userId),
    listAssignmentTemplatesForTeacher(userId),
  ]);
  const pending = inquiries.filter((item) => item.status === "pending");
  const handled = inquiries.filter((item) => item.status !== "pending");
  const defaultTemplate = tutoringSettings.default_template_id
    ? templates.find((template) => template.id === tutoringSettings.default_template_id) ??
      (await getAssignmentTemplate(tutoringSettings.default_template_id))
    : null;
  const defaultPrefix =
    tutoringSettings.default_private_classroom_prefix?.trim() || "Private Mandarin with";

  async function respondFormAction(formData: FormData) {
    "use server";
    await respondToTeacherInquiryAction(formData);
  }

  async function convertFormAction(formData: FormData) {
    "use server";
    const result = await convertInquiryToClassroomAction(formData);
    if ("error" in result) {
      redirect(`/notebook/teacher/inquiries?success=${encodeURIComponent(`error:${result.error}`)}`);
    }
    redirect(`/notebook/teacher/inquiries?success=${encodeURIComponent(result.success || "converted")}`);
  }

  return (
    <div data-testid="teacher-inquiries-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inquiries</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Review new learner requests before you decide whether to accept or decline them.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Accepted inquiries will use your current tutoring setup: prefix{" "}
              <span className="font-medium text-foreground">{defaultPrefix}</span>
              {defaultTemplate ? (
                <>
                  {" "}
                  and onboarding template{" "}
                  <span className="font-medium text-foreground">{defaultTemplate.title}</span>
                </>
              ) : (
                " and no default onboarding template yet"
              )}
              .
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
            Inquiry inbox
          </div>
        </div>

        {query.success ? (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              query.success.startsWith("error:")
                ? "border border-rose-500/20 bg-rose-500/10 text-rose-300"
                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {query.success.startsWith("error:")
              ? decodeURIComponent(query.success.slice(6))
              : query.success.startsWith("converted:assignment:")
                ? "Private classroom created and the onboarding assignment was attached."
                : "Private classroom created without an onboarding assignment."}
          </div>
        ) : null}

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
                        <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">
                          Private tutoring
                        </span>
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
                        <form action={convertFormAction} className="w-full max-w-2xl space-y-3 rounded-xl border bg-muted/20 p-4">
                          <input type="hidden" name="inquiry_id" value={inquiry.id} />
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Classroom name
                              </label>
                              <input
                                type="text"
                                name="classroom_name"
                                placeholder={`${defaultPrefix} ${inquiry.student_name}`}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Onboarding template
                              </label>
                              <select
                                name="template_id"
                                defaultValue={defaultTemplate?.id || ""}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                              >
                                <option value="">No onboarding template</option>
                                {templates
                                  .filter((template) => template.archived === 0)
                                  .map((template) => (
                                    <option key={template.id} value={template.id}>
                                      {template.title}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Onboarding message
                            </label>
                            <textarea
                              name="onboarding_message"
                              rows={3}
                              defaultValue={tutoringSettings.intro_message ?? ""}
                              placeholder="Welcome message for the learner after conversion."
                              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground">
                              This will create a private classroom and optionally attach the first onboarding assignment.
                            </p>
                            <PendingSubmitButton
                              idleLabel="Create classroom"
                              pendingLabel="Creating classroom..."
                            />
                          </div>
                        </form>
                      ) : null}
                      {inquiry.created_classroom_id ? (
                        <div className="flex flex-wrap items-center gap-3">
                          {inquiry.initial_assignment_id ? (
                            <Link
                              href={`/notebook/assignments/${inquiry.initial_assignment_id}`}
                              className="text-sm font-medium text-[var(--cn-orange)] hover:underline"
                            >
                              Open onboarding assignment
                            </Link>
                          ) : null}
                          <Link
                            href={`/notebook/classes/${inquiry.created_classroom_id}`}
                            className="text-sm font-medium text-[var(--cn-orange)] hover:underline"
                          >
                            Open classroom
                          </Link>
                        </div>
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
