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
import {
  ensureTeacherProfile,
  getTeacherProfileCompleteness,
} from "@/lib/teacher-profiles";
import {
  ensureTeacherTutoringSettings,
  getCadenceLabel,
} from "@/lib/teacher-tutoring-settings";
import { listPrivateStudentsForTeacher } from "@/lib/private-students";

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

function getSetupCompletenessScore(input: {
  introMessage: string | null;
  defaultPrivateClassroomPrefix: string | null;
  defaultTemplateId: string | null;
  cadenceType: string | null;
  targetSessionLengthMinutes: number | null;
  formatNotes: string | null;
}) {
  const checks = [
    Boolean(input.introMessage?.trim()),
    Boolean(input.defaultPrivateClassroomPrefix?.trim()),
    Boolean(input.defaultTemplateId),
    Boolean(input.cadenceType?.trim()),
    Boolean(input.targetSessionLengthMinutes),
    Boolean(input.formatNotes?.trim()),
  ];
  const complete = checks.filter(Boolean).length;
  return {
    complete,
    total: checks.length,
    percent: Math.round((complete / checks.length) * 100),
  };
}

export default async function TeacherOverviewPage() {
  const userId = await getAuthUserId();

  const [profile, setup, inquiries, resources, templates, reporting, referrals, privateStudents] = await Promise.all([
    ensureTeacherProfile(userId),
    ensureTeacherTutoringSettings(userId),
    listTeacherInquiries(userId),
    listTeacherResourcesForUser(userId),
    listAssignmentTemplatesForTeacher(userId),
    getTeacherReportingDashboard(userId),
    getTeacherReferralDashboard(userId),
    listPrivateStudentsForTeacher(userId),
  ]);

  const pendingInquiries = inquiries.filter((item) => item.status === "pending").length;
  const activeClassrooms = reporting.totalClassrooms;
  const profileCompleteness = getTeacherProfileCompleteness(profile);
  const setupCompleteness = getSetupCompletenessScore({
    introMessage: setup.intro_message,
    defaultPrivateClassroomPrefix: setup.default_private_classroom_prefix,
    defaultTemplateId: setup.default_template_id,
    cadenceType: setup.cadence_type,
    targetSessionLengthMinutes: setup.target_session_length_minutes,
    formatNotes: setup.format_notes,
  });

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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <SummaryCard label="Public profile" value={profile.is_public === 1 ? "Live" : "Draft"} href="/notebook/teacher/profile" icon={IdCard} />
          <SummaryCard label="Pending inquiries" value={pendingInquiries} href="/notebook/teacher/inquiries" icon={Inbox} />
          <SummaryCard label="Private learners" value={privateStudents.length} href="/notebook/teacher/private-students" icon={Users} />
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
                  href="/notebook/teacher/profile"
                  className="rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                >
                  <p className="text-sm font-semibold text-foreground">Profile readiness</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {profileCompleteness.isReadyForDiscovery
                      ? `Profile is ${profileCompleteness.percent}% complete and ready for discovery`
                      : `Profile is ${profileCompleteness.percent}% complete. Add more detail before promoting it.`}
                  </p>
                </Link>
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
                  href="/notebook/teacher/setup"
                  className="rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                >
                  <p className="text-sm font-semibold text-foreground">Tutoring setup</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {setupCompleteness.complete === setupCompleteness.total
                      ? "Private teaching defaults are fully configured"
                      : `Setup is ${setupCompleteness.percent}% complete. Add defaults before converting more inquiries.`}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Cadence: {getCadenceLabel(setup.cadence_type)}
                    {setup.target_session_length_minutes
                      ? ` · ${setup.target_session_length_minutes} min target`
                      : ""}
                  </p>
                </Link>
                <Link
                  href="/notebook/teacher/private-students"
                  className="rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                >
                  <p className="text-sm font-semibold text-foreground">Private learners</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {privateStudents.length > 0
                      ? `${privateStudents.filter((item) => item.status === "awaiting_teacher" || item.status === "inactive").length} need direct teacher follow-through`
                      : "No private learners yet"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {reporting.totalPrivateNoPlan} without a next plan · {reporting.totalPrivateOverduePlan} overdue plans · {reporting.totalPrivateNoRecentAdaptation} need adaptation
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {reporting.totalPrivateNoPlaybook} without a playbook · {reporting.totalPrivatePlaybookGap} with a playbook gap
                  </p>
                </Link>
                <Link
                  href="/notebook/teacher/library"
                  className="rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                >
                  <p className="text-sm font-semibold text-foreground">Strategy and playbook reuse</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {reporting.totalStrategiesUsed > 0
                      ? `${reporting.totalStrategiesUsed} strategy application${reporting.totalStrategiesUsed === 1 ? "" : "s"} are now shaping private learner plans`
                      : "No strategies have been applied yet"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {reporting.totalPlaybooksUsed > 0
                      ? `${reporting.totalPlaybooksUsed} playbook application${reporting.totalPlaybooksUsed === 1 ? "" : "s"} are now guiding structured support`
                      : "No playbooks have been applied yet"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {reporting.totalPrivatePlaybookGap > 0
                      ? `${reporting.totalPrivatePlaybookGap} learners show escalation pressure without a playbook`
                      : reporting.totalStrategyWeak > 0
                      ? `${reporting.totalStrategyWeak} saved ${reporting.totalStrategyWeak === 1 ? "strategy looks" : "strategies look"} weak or need refinement`
                      : reporting.totalStrategyNoOutcome > 0
                        ? `${reporting.totalStrategyNoOutcome} ${reporting.totalStrategyNoOutcome === 1 ? "strategy still needs" : "strategies still need"} outcome evidence`
                        : "Saved strategies and playbooks have either useful evidence or no active warning signal right now"}
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
                <Link href="/notebook/teacher/setup" className="font-medium text-[var(--cn-orange)] hover:underline">
                  Configure tutoring setup
                </Link>
                <Link href="/notebook/teacher/inquiries" className="font-medium text-[var(--cn-orange)] hover:underline">
                  Open inquiry inbox
                </Link>
                <Link href="/notebook/teacher/private-students" className="font-medium text-[var(--cn-orange)] hover:underline">
                  Open private learners
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
                {templates.length} templates and {resources.length} resources are currently available in your library. Public profile completeness is {profileCompleteness.percent}%. Current cadence default: {getCadenceLabel(setup.cadence_type)}. {reporting.totalPrivateNoPlan} private learners still need a next lesson plan.
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
