import Link from "next/link";
import { BookOpenCheck, ClipboardList, Inbox, Users } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { getLearnerTeacherHubSummary } from "@/lib/learner-teacher-hub";

function SummaryCard({
  label,
  value,
  href,
  icon: Icon,
  description,
}: {
  label: string;
  value: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-card p-5 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-2xl bg-[var(--cn-orange)]/10 p-3 text-[var(--cn-orange)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}

export const dynamic = "force-dynamic";

export default async function LearnerTeacherOverviewPage() {
  const userId = await getAuthUserId();
  const summary = await getLearnerTeacherHubSummary(userId);

  return (
    <div
      data-testid="learner-teacher-overview-page"
      className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Classes"
            value={summary.classroomCount}
            href="/notebook/with-teacher/classes"
            icon={Users}
            description="Classrooms where a teacher is guiding your work."
          />
          <SummaryCard
            label="Assignments"
            value={summary.assignmentCount}
            href="/notebook/with-teacher/assignments"
            icon={ClipboardList}
            description={
              summary.pendingAssignmentCount > 0
                ? `${summary.pendingAssignmentCount} still need your attention.`
                : "No assignment pressure right now."
            }
          />
          <SummaryCard
            label="Inquiries"
            value={summary.inquiryCount}
            href="/notebook/with-teacher/inquiries"
            icon={Inbox}
            description={
              summary.convertedInquiryCount > 0
                ? `${summary.convertedInquiryCount} already turned into a classroom or tutoring relationship.`
                : "Track teacher outreach before it becomes a classroom."
            }
          />
        </div>

        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--cn-orange)]/10 p-3 text-[var(--cn-orange)]">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Keep teacher-guided work separate from solo study
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  Your notebook stays focused on learning. This area only appears when you actually have a teacher relationship, classroom work, or open inquiries.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link
                  href="/notebook/with-teacher/assignments"
                  className="font-medium text-[var(--cn-orange)] hover:underline"
                >
                  Open assignments
                </Link>
                <Link
                  href="/notebook/with-teacher/classes"
                  className="font-medium text-[var(--cn-orange)] hover:underline"
                >
                  Open classes
                </Link>
                <Link
                  href="/notebook/with-teacher/inquiries"
                  className="font-medium text-[var(--cn-orange)] hover:underline"
                >
                  Open inquiries
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
