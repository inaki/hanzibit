import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, BarChart3, UserRoundSearch, Users } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { isTeacherUser } from "@/lib/classrooms";
import { getTeacherReportingDashboard } from "@/lib/teacher-reporting";

export const dynamic = "force-dynamic";

export default async function TeacherReportingPage() {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  const reporting = await getTeacherReportingDashboard(userId);

  return (
    <div data-testid="teacher-reporting-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reporting</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Track classroom health, missing work, and submissions that still need review without opening each assignment one by one.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
            Lightweight intervention layer
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <SummaryCard label="Classrooms" value={reporting.totalClassrooms} />
          <SummaryCard label="Students" value={reporting.totalStudents} />
          <SummaryCard label="Private learners" value={reporting.privateLearnerCount} />
          <SummaryCard label="Assignments" value={reporting.totalAssignments} />
          <SummaryCard label="Converted" value={reporting.totalConvertedInquiries} tone="sky" />
          <SummaryCard label="Inactive private" value={reporting.totalConvertedInactive} tone="rose" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="Waiting review" value={reporting.totalWaitingReview} tone="sky" />
          <SummaryCard label="Missing work" value={reporting.totalMissingSubmissions} tone="rose" />
          <SummaryCard label="Active private" value={reporting.totalConvertedActive} tone="emerald" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Private awaiting teacher" value={reporting.totalPrivateAwaitingTeacher} tone="amber" />
          <SummaryCard label="Private awaiting student" value={reporting.totalPrivateAwaitingStudent} tone="sky" />
          <SummaryCard label="Private inactive" value={reporting.totalPrivateInactive} tone="rose" />
          <SummaryCard label="Private stalled" value={reporting.totalPrivateStalled} tone="amber" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="No next plan" value={reporting.totalPrivateNoPlan} tone="rose" />
          <SummaryCard label="Overdue plans" value={reporting.totalPrivateOverduePlan} tone="amber" />
          <SummaryCard label="Plan without support" value={reporting.totalPrivateUnsupportedPlan} tone="sky" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="No active goals" value={reporting.totalPrivateNoActiveGoal} tone="rose" />
          <SummaryCard label="No recent history" value={reporting.totalPrivateNoRecentHistory} tone="amber" />
          <SummaryCard label="Weak continuity" value={reporting.totalPrivateWeakContinuity} tone="sky" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          <SummaryCard label="Blocked goals" value={reporting.totalPrivateBlockedGoals} tone="rose" />
          <SummaryCard
            label="Needs reinforcement"
            value={reporting.totalPrivateNeedsReinforcement}
            tone="amber"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          <SummaryCard label="Recurring issues" value={reporting.totalPrivateRecurringIssues} tone="amber" />
          <SummaryCard label="Intervention now" value={reporting.totalPrivateInterventionNow} tone="rose" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <SummaryCard label="No recent review" value={reporting.totalPrivateNoRecentReview} tone="rose" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          <SummaryCard label="No recent adaptation" value={reporting.totalPrivateNoRecentAdaptation} tone="rose" />
          <SummaryCard label="Reviewed, not adapted" value={reporting.totalPrivateReviewedNotAdapted} tone="amber" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="Strategies used" value={reporting.totalStrategiesUsed} tone="sky" />
          <SummaryCard label="Strategy helped" value={reporting.totalStrategyHelped} tone="emerald" />
          <SummaryCard label="Needs outcome" value={reporting.totalStrategyNeedsReview} tone="amber" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="Playbooks used" value={reporting.totalPlaybooksUsed} tone="sky" />
          <SummaryCard label="No playbook yet" value={reporting.totalPrivateNoPlaybook} tone="amber" />
          <SummaryCard label="Playbook gap" value={reporting.totalPrivatePlaybookGap} tone="rose" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="No strategy yet" value={reporting.totalPrivateNoStrategy} tone="amber" />
          <SummaryCard label="Strategy gap" value={reporting.totalPrivateStrategyGap} tone="rose" />
          <SummaryCard label="Weak strategies" value={reporting.totalStrategyWeak} tone="rose" />
          <SummaryCard label="No strategy outcomes" value={reporting.totalStrategyNoOutcome} tone="amber" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <section className="space-y-6">
            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Classroom Health
                </h2>
              </div>

              {reporting.classroomSummaries.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No classrooms yet. Reporting will appear as soon as you create at least one class.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.classroomSummaries.map((summary) => (
                    <Link
                      key={summary.classroom.id}
                      href={`/notebook/teacher/reporting/classrooms/${summary.classroom.id}`}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{summary.classroom.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {summary.classroom.description || "No classroom description"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <MetricPill label={`${summary.student_count} students`} tone="muted" />
                          <MetricPill label={`${summary.assignment_count} assignments`} tone="muted" />
                          {summary.needs_review_count > 0 ? (
                            <MetricPill label={`${summary.needs_review_count} waiting review`} tone="sky" />
                          ) : null}
                          {summary.missing_submission_count > 0 ? (
                            <MetricPill label={`${summary.missing_submission_count} missing`} tone="rose" />
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Strategy Effectiveness
                </h2>
                <Link
                  href="/notebook/teacher/library"
                  className="ml-auto text-xs font-medium text-[var(--cn-orange)] hover:underline"
                >
                  Open library
                </Link>
              </div>

              {reporting.strategyItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No saved strategies yet. Effectiveness reporting will appear once teachers start using the strategy layer.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.strategyItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/notebook/teacher/library/strategies/${item.id}`}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <MetricPill label={`Used ${item.usage_count}`} tone="muted" />
                          {item.needs_refinement ? (
                            <MetricPill label="needs refinement" tone="rose" />
                          ) : null}
                          {item.needs_more_outcomes ? (
                            <MetricPill label="needs outcomes" tone="amber" />
                          ) : null}
                          {item.archived === 1 ? (
                            <MetricPill label="archived" tone="muted" />
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{item.helped_count} helped</span>
                        <span>{item.partial_count} partial</span>
                        <span>{item.no_change_count} no change</span>
                        <span>{item.replace_count} replace</span>
                        <span>
                          {item.latest_outcome_status
                            ? `Latest outcome: ${item.latest_outcome_status.replaceAll("_", " ")}`
                            : "No outcome yet"}
                        </span>
                        <span>
                          {item.last_refined_at
                            ? `Last refined ${new Date(item.last_refined_at).toLocaleDateString("en-US")}`
                            : "Not refined yet"}
                        </span>
                      </div>
                      {item.latest_outcome_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Latest outcome: {item.latest_outcome_note}
                        </p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Private Learner Activity
                </h2>
                <Link
                  href="/notebook/teacher/private-students"
                  className="ml-auto text-xs font-medium text-[var(--cn-orange)] hover:underline"
                >
                  Open workflow
                </Link>
              </div>

              {reporting.privateLearnerItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No active private learner workflow records yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.privateLearnerItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/notebook/teacher/private-students/${item.id}`}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{item.student_name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.classroom_name}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <MetricPill
                            label={item.status.replaceAll("_", " ")}
                            tone={
                              item.status === "active"
                                ? "emerald"
                                : item.status === "awaiting_student"
                                  ? "sky"
                                  : item.status === "inactive"
                                    ? "rose"
                                    : "amber"
                            }
                          />
                          {item.is_stalled ? <MetricPill label="stalled" tone="rose" /> : null}
                          {!item.has_lesson_plan ? <MetricPill label="no next plan" tone="rose" /> : null}
                          {item.plan_is_overdue ? <MetricPill label="plan overdue" tone="amber" /> : null}
                          {item.has_lesson_plan && !item.has_supported_plan ? (
                            <MetricPill label="no assignment or template" tone="sky" />
                          ) : null}
                          {item.active_goal_count === 0 ? (
                            <MetricPill label="no active goal" tone="rose" />
                          ) : null}
                          {!item.has_recent_history && item.status !== "onboarding" ? (
                            <MetricPill label="no recent history" tone="amber" />
                          ) : null}
                          {item.needs_continuity_attention ? (
                            <MetricPill label="weak continuity" tone="sky" />
                          ) : null}
                          {item.blocked_goal_count > 0 ? (
                            <MetricPill label={`${item.blocked_goal_count} blocked`} tone="rose" />
                          ) : null}
                          {item.reinforcement_goal_count > 0 ? (
                            <MetricPill
                              label={`${item.reinforcement_goal_count} needs reinforcement`}
                              tone="amber"
                            />
                          ) : null}
                          {item.recurring_issue_tags.length > 0 ? (
                            <MetricPill
                              label={`${item.recurring_issue_tags.length} recurring issue${item.recurring_issue_tags.length === 1 ? "" : "s"}`}
                              tone="amber"
                            />
                          ) : null}
                          {item.needs_review_snapshot ? (
                            <MetricPill label="needs review" tone="rose" />
                          ) : null}
                          {item.needs_adaptation ? (
                            <MetricPill label="needs adaptation" tone="rose" />
                          ) : null}
                          {item.review_without_adaptation ? (
                            <MetricPill label="reviewed, not adapted" tone="amber" />
                          ) : null}
                          {!item.has_strategy_application ? (
                            <MetricPill label="no strategy" tone="amber" />
                          ) : null}
                          {item.needs_strategy_attention ? (
                            <MetricPill label="strategy gap" tone="rose" />
                          ) : null}
                          {!item.has_playbook_application ? (
                            <MetricPill label="no playbook" tone="amber" />
                          ) : null}
                          {item.needs_playbook_attention ? (
                            <MetricPill label="playbook gap" tone="rose" />
                          ) : null}
                          {item.awaiting_review_count > 0 ? (
                            <MetricPill label={`${item.awaiting_review_count} awaiting review`} tone="sky" />
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>
                          {item.active_goal_count > 0
                            ? `${item.active_goal_count} active goal${item.active_goal_count === 1 ? "" : "s"}`
                            : "No active goals"}
                        </span>
                        <span>
                          {item.blocked_goal_count > 0
                            ? `${item.blocked_goal_count} blocked goal${item.blocked_goal_count === 1 ? "" : "s"}`
                            : item.reinforcement_goal_count > 0
                              ? `${item.reinforcement_goal_count} reinforcement goal${item.reinforcement_goal_count === 1 ? "" : "s"}`
                              : "No active intervention marker"}
                        </span>
                        <span>
                          {item.recurring_issue_tags.length > 0
                            ? `Recurring issues: ${item.recurring_issue_tags.join(", ").replaceAll("_", " ")}`
                            : item.latest_issue_tags.length > 0
                              ? `Latest issue tags: ${item.latest_issue_tags.join(", ").replaceAll("_", " ")}`
                              : "No issue tags yet"}
                        </span>
                        <span>
                          {item.next_assignment_title
                            ? `Next assignment: ${item.next_assignment_title}`
                            : "No linked assignment"}
                        </span>
                        <span>
                          {item.lesson_plan_status
                            ? `Plan: ${item.lesson_plan_status.replaceAll("_", " ")}`
                            : "No next lesson plan"}
                        </span>
                        <span>
                          {item.latest_strategy_title
                            ? `Strategy: ${item.latest_strategy_title}`
                            : "No strategy applied yet"}
                        </span>
                        <span>
                          {item.latest_playbook_title
                            ? `Playbook: ${item.latest_playbook_title}`
                            : "No playbook applied yet"}
                        </span>
                        <span>
                          {item.latest_strategy_outcome_status
                            ? `Outcome: ${item.latest_strategy_outcome_status.replaceAll("_", " ")}`
                            : item.has_strategy_application
                              ? "No strategy outcome yet"
                              : "No strategy outcome"}
                        </span>
                        {item.lesson_plan_target_date ? (
                          <span>
                            Target {new Date(item.lesson_plan_target_date).toLocaleDateString("en-US")}
                          </span>
                        ) : null}
                        <span>
                          {item.days_since_activity != null
                            ? `${item.days_since_activity} days since activity`
                            : "No activity yet"}
                        </span>
                        <span>
                          {item.latest_review_at
                            ? `Last review ${new Date(item.latest_review_at).toLocaleDateString("en-US")}`
                            : "No review snapshot yet"}
                        </span>
                        <span>
                          {item.latest_adapted_at
                            ? `Last adapted ${new Date(item.latest_adapted_at).toLocaleDateString("en-US")}`
                            : "No adaptation yet"}
                        </span>
                        <span>
                          {item.latest_playbook_applied_at
                            ? `Last playbook ${new Date(item.latest_playbook_applied_at).toLocaleDateString("en-US")}`
                            : "No playbook application yet"}
                        </span>
                        <span>
                          {item.latest_history_at
                            ? `Last check-in ${new Date(item.latest_history_at).toLocaleDateString("en-US")}`
                            : "No lesson history yet"}
                        </span>
                        {item.needs_teacher_attention ? <span>Needs teacher follow-through</span> : null}
                        {item.needs_student_attention ? <span>Waiting on learner action</span> : null}
                      </div>
                      {item.latest_history_summary ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Latest check-in: {item.latest_history_summary}
                        </p>
                      ) : null}
                      {item.latest_review_summary ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Latest review: {item.latest_review_summary}
                        </p>
                      ) : null}
                      {item.latest_strategy_summary ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Latest strategy: {item.latest_strategy_summary}
                        </p>
                      ) : null}
                      {item.latest_playbook_title ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Current playbook: {item.latest_playbook_title}
                          {item.latest_playbook_applied_at
                            ? ` · applied ${new Date(item.latest_playbook_applied_at).toLocaleDateString("en-US")}`
                            : ""}
                        </p>
                      ) : null}
                      {item.latest_strategy_outcome_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Strategy outcome: {item.latest_strategy_outcome_note}
                        </p>
                      ) : null}
                      {item.latest_adaptation_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Adaptation: {item.latest_adaptation_note}
                        </p>
                      ) : null}
                      {item.latest_intervention_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Intervention: {item.latest_intervention_note}
                        </p>
                      ) : null}
                      {item.lesson_plan_focus_note ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Focus: {item.lesson_plan_focus_note}
                        </p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Private Tutoring Follow-Through
                </h2>
                <Link
                  href="/notebook/teacher/private-students"
                  className="ml-auto text-xs font-medium text-[var(--cn-orange)] hover:underline"
                >
                  Open private learners
                </Link>
              </div>

              {reporting.conversionItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No converted inquiries yet. Private tutoring follow-through will appear here after inquiry conversion.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.conversionItems.map((item) => (
                    <Link
                      key={item.inquiry_id}
                      href={`/notebook/classes/${item.classroom_id}`}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{item.student_name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.classroom_name}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {item.onboarding_completed ? (
                            <MetricPill label="onboarding completed" tone="emerald" />
                          ) : item.onboarding_started ? (
                            <MetricPill label="onboarding started" tone="sky" />
                          ) : (
                            <MetricPill label="not started" tone="muted" />
                          )}
                          {item.is_inactive ? (
                            <MetricPill label="inactive" tone="rose" />
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>
                          {item.converted_at
                            ? `Converted ${new Date(item.converted_at).toLocaleDateString("en-US")}`
                            : "Converted recently"}
                        </span>
                        <span>
                          {item.days_since_conversion != null
                            ? `${item.days_since_conversion} days since conversion`
                            : "New conversion"}
                        </span>
                        {item.initial_assignment_title ? (
                          <span>First assignment: {item.initial_assignment_title}</span>
                        ) : (
                          <span>No onboarding assignment</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <UserRoundSearch className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Student Intervention List
                </h2>
              </div>

              {reporting.studentAttention.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No student-level intervention signals right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.studentAttention.map((student) => (
                    <Link
                      key={`${student.classroom_id}:${student.student_user_id}`}
                      href={`/notebook/teacher/reporting/classrooms/${student.classroom_id}/students/${student.student_user_id}`}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{student.student_name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{student.classroom_name}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {student.missing_count > 0 ? (
                            <MetricPill label={`${student.missing_count} missing`} tone="rose" />
                          ) : null}
                          {student.awaiting_review_count > 0 ? (
                            <MetricPill label={`${student.awaiting_review_count} awaiting review`} tone="sky" />
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{student.submitted_count} submitted</span>
                        <span>{student.reviewed_count} reviewed</span>
                        <span>{student.assignment_count} assignments</span>
                        <span>
                          {student.last_submitted_at
                            ? `Last submitted ${new Date(student.last_submitted_at).toLocaleDateString("en-US")}`
                            : "No submissions yet"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Needs Attention
                </h2>
              </div>

              {reporting.attentionItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  Nothing urgent right now. Your classrooms do not currently have missing work or pending review items.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.attentionItems.map((item) => (
                    <Link
                      key={`${item.classroom_id}:${item.assignment_id}`}
                      href={`/notebook/assignments/${item.assignment_id}`}
                      className="block rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 transition-colors hover:bg-amber-500/15"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {item.classroom_name}
                      </p>
                      <h3 className="mt-1 font-semibold text-foreground">{item.assignment_title}</h3>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {item.waiting_review_count > 0 ? (
                          <MetricPill label={`${item.waiting_review_count} waiting review`} tone="sky" />
                        ) : null}
                        {item.missing_submission_count > 0 ? (
                          <MetricPill label={`${item.missing_submission_count} missing`} tone="rose" />
                        ) : null}
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        {item.due_at
                          ? `Due ${new Date(item.due_at).toLocaleDateString("en-US")}`
                          : "No due date"}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Reporting Notes
                </h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>This reporting layer stays intentionally operational rather than analytical.</p>
                <p>Cadence health is now derived from live private learner workflow plus the next lesson plan, not from a separate planner.</p>
                <p>Continuity now also checks whether each private learner has an active goal and a recent check-in record, so drifting relationships surface earlier.</p>
                <p>Goal progress markers now add early intervention signals on top of continuity, so blocked learners and learners needing reinforcement are visible before they fully stall.</p>
                <p>Repeated issue tags and intervention notes now make it possible to see when a learner is not just drifting, but repeating the same weak areas over time.</p>
                <p>Review snapshots now add a lightweight adaptation checkpoint, so intervention pressure without recent review becomes visible before the plan goes stale.</p>
                <p>Adaptation reporting now distinguishes learners who were reviewed from learners whose live plan was actually updated, so “observed but not changed” pressure is visible too.</p>
                <p>Use `Private Learners` to update goals, progress markers, review snapshots, lesson plans, and check-ins, and use `Reporting` to spot who has no plan, an overdue plan, weak continuity, blocked goals, recurring issues, or a plan with no supporting work.</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "sky" | "rose" | "emerald" | "amber";
}) {
  const toneClass =
    tone === "sky"
      ? "border-sky-500/20 bg-sky-500/10"
      : tone === "emerald"
        ? "border-emerald-500/20 bg-emerald-500/10"
      : tone === "amber"
        ? "border-amber-500/20 bg-amber-500/10"
      : tone === "rose"
        ? "border-rose-500/20 bg-rose-500/10"
        : "border-border bg-card";

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function MetricPill({
  label,
  tone,
}: {
  label: string;
  tone: "muted" | "sky" | "rose" | "emerald" | "amber";
}) {
  const toneClass =
    tone === "sky"
      ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
      : tone === "emerald"
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : tone === "amber"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
      : tone === "rose"
        ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
        : "bg-muted text-muted-foreground";

  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClass}`}>{label}</span>;
}
