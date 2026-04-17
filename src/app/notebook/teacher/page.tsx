import Link from "next/link";
import {
  AlertTriangle,
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
  const urgentPriorityCount = reporting.priorityItems.filter(
    (item) => item.priority_level === "urgent"
  ).length;
  const highPriorityCount = reporting.priorityItems.filter(
    (item) => item.priority_level === "high"
  ).length;
  const watchPriorityCount = reporting.priorityItems.filter(
    (item) => item.priority_level === "watch"
  ).length;
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

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Urgent follow-through
            </p>
            <p className="mt-3 text-3xl font-bold text-foreground">{urgentPriorityCount}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              High follow-through
            </p>
            <p className="mt-3 text-3xl font-bold text-foreground">{highPriorityCount}</p>
          </div>
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Watch list
            </p>
            <p className="mt-3 text-3xl font-bold text-foreground">{watchPriorityCount}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Review due now
            </p>
            <p className="mt-3 text-3xl font-bold text-foreground">{reporting.totalCheckpointsDueNow}</p>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Review overdue
            </p>
            <p className="mt-3 text-3xl font-bold text-foreground">{reporting.totalCheckpointsOverdue}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Recently checked
            </p>
            <p className="mt-3 text-3xl font-bold text-foreground">{reporting.totalCheckpointsRecentlyChecked}</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Workload Snapshot
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-xl border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Load state
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.workloadSummary.load_state}
              </p>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Urgent learners
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.workloadSummary.urgent_private_learners}
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Overdue checkpoints
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.workloadSummary.overdue_checkpoints}
              </p>
            </div>
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Repeated pressure
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.workloadSummary.repeated_pressure_learners}
              </p>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Weak support paths
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.workloadSummary.weak_support_paths}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{reporting.workloadSummary.summary_note}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              High concentration
            </p>
            <p className="mt-3 text-3xl font-bold text-foreground">{reporting.totalLoadConcentrationHigh}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Repeated-pressure learners
            </p>
            <p className="mt-3 text-3xl font-bold text-foreground">{reporting.totalRepeatedPressureLearners}</p>
          </div>
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Weak support concentration
            </p>
            <p className="mt-3 text-3xl font-bold text-foreground">{reporting.totalWeakSupportConcentration}</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Load Balancing
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Priority tells you what to handle first. Review rhythm tells you what should be revisited now. Workload balancing shows whether that pressure is clustering too heavily around the same learners or weak support paths.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Stabilization Snapshot
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Stable learners
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.stabilizationSummary.stable_private_learners}
              </p>
            </div>
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Simplify support
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.stabilizationSummary.simplify_support_candidates}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Handoff-ready
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.stabilizationSummary.handoff_ready_private_learners}
              </p>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Still active pressure
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.stabilizationSummary.still_active_pressure}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {reporting.stabilizationSummary.summary_note}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            `Keep active` means current pressure still needs active teacher follow-through. `Simplify support` means the support path may now be heavier than necessary. `Handoff-ready` means the learner looks stable enough for lighter-touch monitoring.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Portfolio Mix
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Keep active
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.portfolioMixSummary.keep_active_count}
              </p>
            </div>
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Simplify support
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.portfolioMixSummary.simplify_support_count}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Light-touch
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.portfolioMixSummary.light_touch_count}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Handoff-ready
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.portfolioMixSummary.handoff_ready_count}
              </p>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Operating mode
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.portfolioMixSummary.operating_mode.replaceAll("_", " ")}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {reporting.portfolioMixSummary.summary_note}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            `Portfolio mix` is different from stabilization alone: it helps you see whether your current learner base is mostly active-management work or increasingly shifting toward lighter-touch support.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Current operating mode: {reporting.portfolioMixSummary.operating_mode.replaceAll("_", " ")}.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Operating Review
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Reset now
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.operatingReviewSummary.reset_now_count}
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Rebalance
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.operatingReviewSummary.rebalance_count}
              </p>
            </div>
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Simplify now
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.operatingReviewSummary.simplify_now_count}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Stable to maintain
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.operatingReviewSummary.stable_to_maintain_count}
              </p>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Review state
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.operatingReviewSummary.review_state}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {reporting.operatingReviewSummary.summary_note}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Operating review is different from pure workload: it helps you judge whether the current portfolio should keep expanding, rebalance, simplify, or pause before taking on more active support.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Read the states conservatively: `Reset now` means the current support path is no longer safe to keep running unchanged, `Rebalance` means support should shift but not necessarily restart, and `Simplify now` means the learner may be ready for a lighter structure.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Intake Readiness
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Pause intake
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.intakeReadinessSummary.pause_intake_count}
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Hold steady
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.intakeReadinessSummary.hold_steady_count}
              </p>
            </div>
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Cautious capacity
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.intakeReadinessSummary.cautious_capacity_count}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Ready to expand
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.intakeReadinessSummary.ready_to_expand_count}
              </p>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Intake state
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {reporting.intakeReadinessSummary.intake_state}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {reporting.intakeReadinessSummary.summary_note}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Intake readiness is stricter than portfolio balance alone. It asks whether the current portfolio is actually stable enough to absorb more active learners without degrading follow-through quality.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Review Rhythm
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Priority tells you what matters most right now. Review rhythm tells you what has gone too long without a fresh check-in, review, or plan update.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <section className="space-y-6">
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Review Window
                </h2>
              </div>
              {reporting.checkpointItems.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No derived review checkpoints yet. As review, adaptation, and support pressure starts to drift, the current review window will appear here.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {reporting.checkpointItems.slice(0, 6).map((item) => (
                    <Link
                      key={`${item.kind}:${item.private_student_id}:${item.days_open ?? "recent"}`}
                      href={item.href}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {item.kind.replaceAll("_", " ")}
                          </p>
                          <h3 className="mt-1 font-semibold text-foreground">{item.student_name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            item.due_state === "overdue"
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
                              : item.due_state === "due_now"
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {item.due_state === "overdue"
                            ? "overdue"
                            : item.due_state === "due_now"
                              ? "due now"
                              : "recently checked"}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{item.classroom_name}</p>
                      {item.supporting_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">{item.supporting_note}</p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Priority Queue
                </h2>
              </div>
              {reporting.priorityItems.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No clear high-priority items right now. The teaching workspace is not showing stacked pressure that needs immediate follow-through.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {reporting.priorityItems.map((item) => (
                    <Link
                      key={`${item.kind}:${item.id}`}
                      href={item.href}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {item.kind.replaceAll("_", " ")}
                          </p>
                          <h3 className="mt-1 font-semibold text-foreground">{item.title}</h3>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            item.priority_level === "urgent"
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
                              : item.priority_level === "high"
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                                : "border-sky-500/20 bg-sky-500/10 text-sky-400"
                          }`}
                        >
                          {item.priority_level}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
                      {item.supporting_note ? (
                        <p className="mt-1 text-xs text-muted-foreground">{item.supporting_note}</p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>

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
                  <p className="mt-1 text-xs text-muted-foreground">
                    {reporting.totalCheckpointsDueNow} due now · {reporting.totalCheckpointsOverdue} overdue checkpoints
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {reporting.stabilizationSummary.simplify_support_candidates} simplify support · {reporting.stabilizationSummary.handoff_ready_private_learners} handoff-ready
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Portfolio mode: {reporting.portfolioMixSummary.operating_mode.replaceAll("_", " ")} · {reporting.portfolioMixSummary.keep_active_count} keep active
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
                      : reporting.totalPlaybookWeak > 0
                        ? `${reporting.totalPlaybookWeak} saved ${reporting.totalPlaybookWeak === 1 ? "playbook looks" : "playbooks look"} weak or need refinement`
                        : reporting.totalPlaybookNoOutcome > 0
                          ? `${reporting.totalPlaybookNoOutcome} ${reporting.totalPlaybookNoOutcome === 1 ? "playbook still needs" : "playbooks still need"} outcome evidence`
                          : reporting.totalStrategyWeak > 0
                            ? `${reporting.totalStrategyWeak} saved ${reporting.totalStrategyWeak === 1 ? "strategy looks" : "strategies look"} weak or need refinement`
                            : reporting.totalStrategyNoOutcome > 0
                              ? `${reporting.totalStrategyNoOutcome} ${reporting.totalStrategyNoOutcome === 1 ? "strategy still needs" : "strategies still need"} outcome evidence`
                              : "Saved strategies and playbooks have either useful evidence or no active warning signal right now"}
                  </p>
                </Link>
                <Link
                  href="/notebook/teacher/reporting"
                  className="rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                >
                  <p className="text-sm font-semibold text-foreground">Teaching patterns</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {reporting.totalIssueClusters > 0
                      ? `${reporting.totalIssueClusters} recurring issue ${reporting.totalIssueClusters === 1 ? "cluster is" : "clusters are"} now visible across private learners`
                      : "No cross-learner issue patterns are visible yet"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {reporting.totalIssueLearnersWithoutSupportPath > 0
                      ? `${reporting.totalIssueLearnersWithoutSupportPath} learner${reporting.totalIssueLearnersWithoutSupportPath === 1 ? "" : "s"} still show recurring pressure without a clear support path`
                      : reporting.totalIssueSupportGaps > 0
                        ? `${reporting.totalIssueSupportGaps} issue ${reporting.totalIssueSupportGaps === 1 ? "cluster still has" : "clusters still have"} strategy or playbook gaps`
                        : "Cross-learner patterns are visible, but no major support gaps are standing out right now"}
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
