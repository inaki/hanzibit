import Link from "next/link";
import { Inbox } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { listStudentInquiries } from "@/lib/teacher-inquiries";
import { HubFocusSection, HubPageHeader } from "@/components/patterns/hub";
import { SummaryStatCard } from "@/components/patterns/metrics";
import { MetricPill } from "@/components/patterns/status";

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
  const isLearnerHub = variant === "hub";
  const pendingInquiries = inquiries.filter((inquiry) => inquiry.status === "pending").length;
  const convertedInquiries = inquiries.filter((inquiry) => inquiry.status === "converted").length;
  const learnerInquiryMode =
    isLearnerHub && convertedInquiries > 0 && pendingInquiries === 0
      ? {
          badge: "Private tutoring active",
          tone: "emerald" as const,
          title: "Your inquiries already became guided learning",
          body: "Use this page mostly as relationship history. Your active classroom and assignments are now the main work surfaces.",
        }
      : isLearnerHub && convertedInquiries > 0
        ? {
            badge: "Inquiries and tutoring mixed",
            tone: "amber" as const,
            title: "One relationship is already active",
            body: "Keep inquiries here for pending outreach and history, but use classes and assignments as the main place for active teacher-guided work.",
          }
        : {
            badge: "Teacher outreach in progress",
            tone: "sky" as const,
            title: "Your first inquiry is still pending",
            body: "This space is mainly for tracking outreach. Once a teacher accepts and converts the relationship, classes and assignments become the active workspace.",
          };

  return (
    <div data-testid="learner-inquiries-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {showStandaloneHeader ? (
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Teacher Inquiries</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Track the teachers you contacted before they convert into a classroom or tutoring relationship.
              </p>
            </div>
          </div>
        ) : (
          <HubPageHeader
            title="Inquiries"
            description="Track outreach to teachers before it turns into a classroom or private tutoring relationship."
            badge={learnerInquiryMode.badge}
          />
        )}

        {!showStandaloneHeader ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <SummaryStatCard label="Total" value={inquiries.length} tone="sky" />
              <SummaryStatCard label="Pending" value={pendingInquiries} tone="amber" />
              <SummaryStatCard label="Converted" value={convertedInquiries} tone="emerald" />
            </div>

            <HubFocusSection
              title="Inquiry Focus"
              icon={Inbox}
              pills={
                <>
                <MetricPill label={`${pendingInquiries} pending`} tone="amber" />
                <MetricPill label={`${convertedInquiries} converted`} tone="emerald" />
                </>
              }
              tone={learnerInquiryMode.tone}
              guidanceTitle={learnerInquiryMode.title}
              guidanceBody={learnerInquiryMode.body}
            />
          </>
        ) : null}

        {inquiries.length === 0 ? (
          <div className="rounded-2xl bg-card card-ring p-6 text-sm text-muted-foreground">
            You have not sent any teacher inquiries yet.{" "}
            <Link href="/teachers" className="ui-tone-orange-text font-medium hover:underline">
              Browse teachers
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-4">
            {inquiries.map((inquiry) => (
              <article key={inquiry.id} className="rounded-2xl bg-card card-ring p-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill status={inquiry.status} />
                    {inquiry.status === "converted" ? (
                      <span className="ui-tone-sky-panel ui-tone-sky-text rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
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
                    <div className="ui-tone-sky-panel rounded-xl border p-4 text-sm">
                      <p className="font-semibold text-foreground">Private tutoring next steps</p>
                      <p className="mt-1 text-muted-foreground">
                        {getLearnerNextStepCopy(inquiry)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {inquiry.initial_assignment_id ? (
                          <Link
                            href={`/notebook/with-teacher/assignments/${inquiry.initial_assignment_id}`}
                            className="ui-tone-orange-text font-medium hover:underline"
                          >
                            Open first assignment
                            {inquiry.assignment_title ? `: ${inquiry.assignment_title}` : ""}
                          </Link>
                        ) : null}
                        {inquiry.created_classroom_id ? (
                          <Link
                            href={`/notebook/with-teacher/classes/${inquiry.created_classroom_id}`}
                            className="ui-tone-orange-text font-medium hover:underline"
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
                      className="ui-tone-orange-text inline-flex text-sm font-medium hover:underline"
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
