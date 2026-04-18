import Link from "next/link";
import { BookOpenCheck, ClipboardList, Inbox, Users } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { getLearnerTeacherHubSummary } from "@/lib/learner-teacher-hub";
import { HubFocusSection, HubPageHeader } from "@/components/patterns/hub";
import { SummaryStatCard } from "@/components/patterns/metrics";
import { MetricPill } from "@/components/patterns/status";
import { SectionCard } from "@/components/patterns/surfaces";

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
  const teacherHubMode =
    summary.convertedInquiryCount > 0
      ? {
          badge: "Private tutoring active",
          tone: "emerald" as const,
          title: "Private tutoring is already established",
          body: "At least one inquiry has already become a private classroom. Use this space to keep guided work organized without crowding your solo-study navigation.",
        }
      : summary.classroomCount > 0 || summary.assignmentCount > 0
        ? {
            badge: "Guided learner",
            tone: "amber" as const,
            title: "Teacher-guided work is active",
            body: "You have live classroom work. Focus on assignments first, then use classes for shared context and teacher guidance.",
          }
        : {
            badge: "Exploring teacher support",
            tone: "sky" as const,
            title: "Your first teacher connection is in progress",
            body: "You do not have classroom work yet. Use this space to track inquiry status before it becomes active guided learning.",
          };

  return (
    <div
      data-testid="learner-teacher-overview-page"
      className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <HubPageHeader
          title="Teacher"
          description="Keep teacher-guided work separate from solo study, while still making assignments, classes, and outreach easy to manage."
          badge={teacherHubMode.badge}
        />

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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="space-y-6">
            <HubFocusSection
              title="Guided Learning"
              icon={BookOpenCheck}
              pills={
                <>
                  <MetricPill label={`${summary.pendingAssignmentCount} assignments to do`} tone="amber" />
                  <MetricPill label={`${summary.pendingInquiryCount} live inquiries`} tone="sky" />
                  <MetricPill label={`${summary.convertedInquiryCount} converted`} tone="emerald" />
                </>
              }
              tone={teacherHubMode.tone}
              guidanceTitle={teacherHubMode.title}
              guidanceBody={teacherHubMode.body}
            />

            <SectionCard title="Guided Learning Actions" icon={BookOpenCheck}>
              <div className="grid gap-3">
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">Open your assignments</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {summary.pendingAssignmentCount > 0
                        ? `${summary.pendingAssignmentCount} assignments still need your attention.`
                        : "Assignments are quiet right now, but this stays the main place for guided work."}
                    </p>
                  </div>
                  <Link
                    href="/notebook/with-teacher/assignments"
                    className="text-sm font-medium text-[var(--cn-orange)] hover:underline"
                  >
                    Open assignments →
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">Review class context</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Use classes when you need roster visibility, private tutoring onboarding details, or assignment context tied to a specific teacher space.
                    </p>
                  </div>
                  <Link
                    href="/notebook/with-teacher/classes"
                    className="text-sm font-medium text-[var(--cn-orange)] hover:underline"
                  >
                    Open classes →
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">Track inquiry history</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Keep outreach visible here, especially while requests are still pending or when you want to see which inquiries already converted.
                    </p>
                  </div>
                  <Link
                    href="/notebook/with-teacher/inquiries"
                    className="text-sm font-medium text-[var(--cn-orange)] hover:underline"
                  >
                    Open inquiries →
                  </Link>
                </div>
              </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Current Signals" icon={Users}>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <SummaryStatCard label="Pending assignments" value={summary.pendingAssignmentCount} tone="amber" />
              <SummaryStatCard label="Pending inquiries" value={summary.pendingInquiryCount} tone="sky" />
              <SummaryStatCard label="Converted inquiries" value={summary.convertedInquiryCount} tone="emerald" />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
