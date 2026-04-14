import Link from "next/link";
import {
  BarChart3,
  FolderKanban,
  IdCard,
  Inbox,
  Share2,
  Users,
} from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { listTeacherInquiries } from "@/lib/teacher-inquiries";
import { listTeacherResourcesForUser } from "@/lib/teacher-resources";
import { listAssignmentTemplatesForTeacher } from "@/lib/assignment-templates";
import { getTeacherReportingDashboard } from "@/lib/teacher-reporting";
import { getTeacherReferralDashboard } from "@/lib/referrals";
import { ensureTeacherProfile } from "@/lib/teacher-profiles";

export const dynamic = "force-dynamic";

function SummaryCard({
  label,
  value,
  href,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  href: string;
  icon: typeof Users;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-card p-5 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 text-[var(--cn-orange)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
    </Link>
  );
}

export default async function TeacherOverviewPage() {
  const userId = await getAuthUserId();

  const [profile, inquiries, resources, templates, reporting, referrals] = await Promise.all([
    ensureTeacherProfile(userId),
    listTeacherInquiries(userId),
    listTeacherResourcesForUser(userId),
    listAssignmentTemplatesForTeacher(userId),
    getTeacherReportingDashboard(userId),
    getTeacherReferralDashboard(userId),
  ]);

  const pendingInquiries = inquiries.filter((item) => item.status === "pending").length;
  const activeClassrooms = reporting.totalClassrooms;

  return (
    <div data-testid="teacher-overview-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teaching Workspace</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Manage your public profile, incoming inquiries, reusable teaching assets, classroom reporting, and referral growth from one place.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
            Consolidated teacher hub
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Public profile" value={profile.is_public === 1 ? "Live" : "Draft"} href="/notebook/teacher/profile" icon={IdCard} />
          <SummaryCard label="Pending inquiries" value={pendingInquiries} href="/notebook/teacher/inquiries" icon={Inbox} />
          <SummaryCard label="Resources" value={resources.length} href="/notebook/teacher/library" icon={FolderKanban} />
          <SummaryCard label="Classrooms" value={activeClassrooms} href="/notebook/teacher/reporting" icon={BarChart3} />
          <SummaryCard label="Referred students" value={referrals.referredStudents} href="/notebook/teacher/referrals" icon={Share2} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <section className="space-y-6">
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Needs Attention
              </h2>
              <div className="mt-4 grid gap-3">
                <Link
                  href="/notebook/teacher/inquiries"
                  className="rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                >
                  <p className="text-sm font-semibold text-foreground">Inquiries</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pendingInquiries > 0
                      ? `${pendingInquiries} pending learner ${pendingInquiries === 1 ? "request" : "requests"}`
                      : "No pending inquiries right now"}
                  </p>
                </Link>
                <Link
                  href="/notebook/teacher/reporting"
                  className="rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                >
                  <p className="text-sm font-semibold text-foreground">Classroom reporting</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {reporting.totalWaitingReview > 0 || reporting.totalMissingSubmissions > 0
                      ? `${reporting.totalWaitingReview} waiting review, ${reporting.totalMissingSubmissions} missing submissions`
                      : "No urgent classroom interventions"}
                  </p>
                </Link>
                <Link
                  href="/notebook/teacher/referrals"
                  className="rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                >
                  <p className="text-sm font-semibold text-foreground">Referral performance</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {referrals.pendingCommissionCents > 0
                      ? `${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(referrals.pendingCommissionCents / 100)} pending`
                      : "No pending commissions"}
                  </p>
                </Link>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Quick Access
              </h2>
              <div className="mt-4 grid gap-3 text-sm">
                <Link href="/notebook/teacher/profile" className="font-medium text-[var(--cn-orange)] hover:underline">
                  Edit public profile
                </Link>
                <Link href="/notebook/teacher/inquiries" className="font-medium text-[var(--cn-orange)] hover:underline">
                  Open inquiry inbox
                </Link>
                <Link href="/notebook/teacher/library" className="font-medium text-[var(--cn-orange)] hover:underline">
                  Manage library and templates
                </Link>
                <Link href="/notebook/teacher/reporting" className="font-medium text-[var(--cn-orange)] hover:underline">
                  Open reporting
                </Link>
                <Link href="/notebook/teacher/referrals" className="font-medium text-[var(--cn-orange)] hover:underline">
                  Open referrals
                </Link>
              </div>
              <div className="mt-5 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                {templates.length} templates and {resources.length} resources are currently available in your library.
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
