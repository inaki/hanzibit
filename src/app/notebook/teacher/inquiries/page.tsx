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
import {
  TeachingCollectionSection,
  TeachingEntityCard,
  TeachingExplainerBlock,
  TeachingPageHeader,
  TeachingToneMetricCard,
} from "@/components/patterns/teaching";

export const dynamic = "force-dynamic";

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "pending"
      ? "ui-tone-amber-panel ui-tone-amber-text"
      : status === "accepted"
        ? "ui-tone-emerald-panel ui-tone-emerald-text"
        : status === "converted"
          ? "ui-tone-sky-panel ui-tone-sky-text"
          : "ui-tone-rose-panel ui-tone-rose-text";

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
        <TeachingPageHeader
          title="Inquiries"
          description="Review new learner requests before you decide whether to accept or decline them."
          badge="Inquiry inbox"
        />

        <div className="grid gap-4 md:grid-cols-3">
          <TeachingToneMetricCard
            title="Pending"
            value={pending.length}
            tone={pending.length > 0 ? "amber" : "muted"}
            note={pending.length > 0 ? "New learner requests waiting for a decision." : "No new requests right now."}
          />
          <TeachingToneMetricCard
            title="Accepted"
            value={handled.filter((item) => item.status === "accepted").length}
            tone="sky"
            note="Accepted requests that may still need classroom conversion."
          />
          <TeachingToneMetricCard
            title="Converted"
            value={handled.filter((item) => item.status === "converted").length}
            tone="emerald"
            note="Private tutoring inquiries already converted into classrooms."
          />
        </div>

        <TeachingExplainerBlock
          title="Conversion defaults"
          tone="muted"
          body={
            <>
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
            </>
          }
        />

        {query.success ? (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              query.success.startsWith("error:")
                ? "ui-tone-rose-panel ui-tone-rose-text border"
                : "ui-tone-emerald-panel ui-tone-emerald-text border"
            }`}
          >
            {query.success.startsWith("error:")
              ? decodeURIComponent(query.success.slice(6))
              : query.success.startsWith("converted:assignment:")
                ? "Private classroom created and the onboarding assignment was attached."
                : "Private classroom created without an onboarding assignment."}
          </div>
        ) : null}

        <TeachingCollectionSection
          icon={Inbox}
          title="Pending"
          empty={pending.length === 0}
          emptyMessage="No pending inquiries right now."
        >
          <div className="grid gap-4">
            {pending.map((inquiry) => (
              <TeachingEntityCard
                key={inquiry.id}
                href={`/teachers/${inquiry.teacher_slug ?? ""}`}
                badges={
                  <>
                    <StatusPill status={inquiry.status} />
                    <span className="rounded-full border border-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {inquiry.student_email}
                    </span>
                  </>
                }
                title={inquiry.student_name}
                subtitle={`Sent ${new Date(inquiry.created_at).toLocaleString()}`}
              >
                <div className="space-y-4">
                  <div className="rounded-xl border bg-muted/30 p-4 text-sm text-foreground/85">
                    {inquiry.message || "No message included."}
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
              </TeachingEntityCard>
            ))}
          </div>
        </TeachingCollectionSection>

        <TeachingCollectionSection
          icon={MessageSquareText}
          title="Handled"
          empty={handled.length === 0}
          emptyMessage="Accepted or declined inquiries will appear here."
        >
          <div className="grid gap-4">
            {handled.map((inquiry) => (
              <TeachingEntityCard
                key={inquiry.id}
                href={
                  inquiry.created_classroom_id
                    ? `/notebook/classes/${inquiry.created_classroom_id}`
                    : `/teachers/${inquiry.teacher_slug ?? ""}`
                }
                badges={
                  <>
                    <StatusPill status={inquiry.status} />
                    <span className="ui-tone-sky-panel ui-tone-sky-text rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Private tutoring
                    </span>
                  </>
                }
                title={inquiry.student_name}
                subtitle={inquiry.message || "No message included."}
              >
                <div className="space-y-4">
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
                          className="ui-tone-orange-text text-sm font-medium hover:underline"
                        >
                          Open onboarding assignment
                        </Link>
                      ) : null}
                      <Link
                        href={`/notebook/classes/${inquiry.created_classroom_id}`}
                        className="ui-tone-orange-text text-sm font-medium hover:underline"
                      >
                        Open classroom
                      </Link>
                    </div>
                  ) : null}
                </div>
              </TeachingEntityCard>
            ))}
          </div>
        </TeachingCollectionSection>
      </div>
    </div>
  );
}
