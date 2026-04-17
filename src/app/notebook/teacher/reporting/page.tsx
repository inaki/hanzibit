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
  const patternPriorityItems = reporting.priorityItems.filter(
    (item) => item.kind === "issue_cluster" || item.kind === "strategy" || item.kind === "playbook"
  );
  const issuePriorityMap = new Map(
    patternPriorityItems
      .filter((item) => item.kind === "issue_cluster")
      .map((item) => [item.id, item])
  );
  const strategyPriorityMap = new Map(
    patternPriorityItems.filter((item) => item.kind === "strategy").map((item) => [item.id, item])
  );
  const playbookPriorityMap = new Map(
    patternPriorityItems.filter((item) => item.kind === "playbook").map((item) => [item.id, item])
  );
  const operatingReviewItems = reporting.privateLearnerItems
    .map((item) => {
      const stabilizationState = getStabilizationState({
        status: item.status,
        hasLessonPlan: item.has_lesson_plan,
        hasSupportedPlan: item.has_supported_plan,
        activeGoalCount: item.active_goal_count,
        blockedGoalCount: item.blocked_goal_count,
        needsReinforcementCount: item.reinforcement_goal_count,
        recurringIssueTags: item.recurring_issue_tags,
        hasRecentHistory: item.has_recent_history,
        hasRecentReview: item.has_recent_review,
        hasRecentAdaptation: item.has_recent_adaptation,
        needsReviewSnapshot: item.needs_review_snapshot,
        needsAdaptation: item.needs_adaptation,
        reviewWithoutAdaptation: item.review_without_adaptation,
        planOverdue: item.plan_is_overdue,
        hasStrategyApplication: item.has_strategy_application,
        hasPlaybookApplication: item.has_playbook_application,
        latestStrategyOutcomeStatus: item.latest_strategy_outcome_status,
        latestPlaybookOutcomeStatus: item.latest_playbook_outcome_status,
      });
      const operatingReview = getOperatingReviewState({
        blockedGoalCount: item.blocked_goal_count,
        needsAdaptation: item.needs_adaptation,
        reviewWithoutAdaptation: item.review_without_adaptation,
        planOverdue: item.plan_is_overdue,
        recurringIssueTags: item.recurring_issue_tags,
        hasStrategy: item.has_strategy_application,
        hasPlaybook: item.has_playbook_application,
        stabilizationState,
      });

      return {
        id: item.id,
        href: `/notebook/teacher/private-students/${item.id}`,
        studentName: item.student_name,
        classroomName: item.classroom_name,
        state: operatingReview.state,
        label: operatingReview.label,
        note: operatingReview.note,
        reason:
          operatingReview.state === "reset_now"
            ? "Current support pressure is high enough that this learner should not keep moving on the same path without a reset."
            : operatingReview.state === "rebalance"
              ? "This learner still belongs in active support, but the current path likely needs rebalancing."
              : operatingReview.state === "simplify_now"
                ? "This learner looks ready for a simpler support path instead of the current heavier mode."
                : "This learner looks steady enough to maintain without a near-term reset or rebalance.",
        sortWeight:
          operatingReview.state === "reset_now"
            ? 3
            : operatingReview.state === "rebalance"
              ? 2
              : operatingReview.state === "simplify_now"
                ? 1
                : 0,
        supportingNote:
          item.latest_adaptation_note ??
          item.latest_review_summary ??
          item.latest_history_summary ??
          item.lesson_plan_focus_note ??
          null,
      };
    })
    .sort((a, b) => b.sortWeight - a.sortWeight || a.studentName.localeCompare(b.studentName));

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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="Issue clusters" value={reporting.totalIssueClusters} tone="amber" />
          <SummaryCard label="Issue support gaps" value={reporting.totalIssueSupportGaps} tone="rose" />
          <SummaryCard
            label="Learners with no support path"
            value={reporting.totalIssueLearnersWithoutSupportPath}
            tone="rose"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <SummaryCard label="No recent review" value={reporting.totalPrivateNoRecentReview} tone="rose" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          <SummaryCard label="No recent adaptation" value={reporting.totalPrivateNoRecentAdaptation} tone="rose" />
          <SummaryCard label="Reviewed, not adapted" value={reporting.totalPrivateReviewedNotAdapted} tone="amber" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="Review due now" value={reporting.totalCheckpointsDueNow} tone="amber" />
          <SummaryCard label="Review overdue" value={reporting.totalCheckpointsOverdue} tone="rose" />
          <SummaryCard
            label="Recently checked"
            value={reporting.totalCheckpointsRecentlyChecked}
            tone="emerald"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="High concentration" value={reporting.totalLoadConcentrationHigh} tone="rose" />
          <SummaryCard
            label="Repeated-pressure learners"
            value={reporting.totalRepeatedPressureLearners}
            tone="amber"
          />
          <SummaryCard
            label="Weak support concentration"
            value={reporting.totalWeakSupportConcentration}
            tone="sky"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Stable learners"
            value={reporting.stabilizationSummary.stable_private_learners}
            tone="emerald"
          />
          <SummaryCard
            label="Simplify support"
            value={reporting.stabilizationSummary.simplify_support_candidates}
            tone="amber"
          />
          <SummaryCard
            label="Handoff-ready"
            value={reporting.stabilizationSummary.handoff_ready_private_learners}
            tone="sky"
          />
          <SummaryCard
            label="Still active pressure"
            value={reporting.stabilizationSummary.still_active_pressure}
            tone="rose"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            label="Keep active"
            value={reporting.portfolioMixSummary.keep_active_count}
            tone="rose"
          />
          <SummaryCard
            label="Simplify support"
            value={reporting.portfolioMixSummary.simplify_support_count}
            tone="amber"
          />
          <SummaryCard
            label="Light-touch"
            value={reporting.portfolioMixSummary.light_touch_count}
            tone="sky"
          />
          <SummaryCard
            label="Handoff-ready"
            value={reporting.portfolioMixSummary.handoff_ready_count}
            tone="emerald"
          />
          <SummaryCard
            label="Operating mode"
            value={reporting.portfolioMixSummary.operating_mode.replaceAll("_", " ")}
            tone="muted"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Reset now"
            value={reporting.operatingReviewSummary.reset_now_count}
            tone="rose"
          />
          <SummaryCard
            label="Rebalance"
            value={reporting.operatingReviewSummary.rebalance_count}
            tone="amber"
          />
          <SummaryCard
            label="Simplify now"
            value={reporting.operatingReviewSummary.simplify_now_count}
            tone="sky"
          />
          <SummaryCard
            label="Stable to maintain"
            value={reporting.operatingReviewSummary.stable_to_maintain_count}
            tone="emerald"
          />
        </div>

        <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          Review rhythm is separate from priority. Priority tells you what matters first; checkpoint rhythm tells you what has gone too long without a fresh review, adaptation, or support recheck.
        </div>

        <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          Workload balancing is separate from both priority and rhythm. It highlights where pressure is clustering too heavily around the same learners, issue patterns, or weak support paths so the teacher can rebalance before follow-through quality starts slipping.
        </div>

        <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          Stabilization highlights where support can stay active, where it may be safe to simplify, and where learners look steady enough for lighter-touch monitoring. It is intentionally conservative and should support teacher judgment, not replace it.
        </div>

        <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          Read these states conservatively: `keep active` means pressure is still real, `simplify` means the support path may now be heavier than necessary, and `handoff-ready` means the learner may be stable enough for lower-intensity monitoring instead of the same active intervention load.
        </div>

        <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          Portfolio distribution is separate from stabilization alone. It shows whether the overall learner mix is still active-heavy or whether more of the portfolio is shifting into lighter-touch and handoff-ready support.
        </div>

        <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          Use portfolio distribution to judge sustainability, not urgency. A portfolio can be healthy even with some active learners, but an active-heavy mix should make you cautious about taking on more high-pressure support before current learners stabilize.
        </div>

        <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          Operating review is the teacher-level “should I keep going like this?” layer. It helps distinguish learners who need a real reset from those who simply need rebalancing, simplification, or steady maintenance.
        </div>

        <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          Treat these states as operating cues, not automation. `Reset now` means the current support path looks structurally wrong, `Rebalance` means the learner still needs active support on a different path, and `Simplify now` means the current structure may be heavier than necessary.
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="Strategies used" value={reporting.totalStrategiesUsed} tone="sky" />
          <SummaryCard label="Helping broadly" value={reporting.totalStrategyHelping} tone="emerald" />
          <SummaryCard label="Mixed strategies" value={reporting.totalStrategyMixed} tone="amber" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="Playbooks used" value={reporting.totalPlaybooksUsed} tone="sky" />
          <SummaryCard label="Helping broadly" value={reporting.totalPlaybookHelping} tone="emerald" />
          <SummaryCard label="Mixed playbooks" value={reporting.totalPlaybookMixed} tone="amber" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="No playbook yet" value={reporting.totalPrivateNoPlaybook} tone="amber" />
          <SummaryCard label="Playbook gap" value={reporting.totalPrivatePlaybookGap} tone="rose" />
          <SummaryCard label="Weak playbooks" value={reporting.totalPlaybookWeak} tone="rose" />
          <SummaryCard label="No playbook outcomes" value={reporting.totalPlaybookNoOutcome} tone="amber" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="No strategy yet" value={reporting.totalPrivateNoStrategy} tone="amber" />
          <SummaryCard label="Strategy gap" value={reporting.totalPrivateStrategyGap} tone="rose" />
          <SummaryCard label="Weak strategies" value={reporting.totalStrategyWeak} tone="rose" />
          <SummaryCard label="No strategy outcomes" value={reporting.totalStrategyNoOutcome} tone="amber" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          <SummaryCard label="Needs strategy outcome" value={reporting.totalStrategyNeedsReview} tone="amber" />
          <SummaryCard label="Needs playbook outcome" value={reporting.totalPlaybookNeedsReview} tone="amber" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <section className="space-y-6">
            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Operating Review
                </h2>
              </div>

              {operatingReviewItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No operating-review signals yet. As private learner pressure settles, this section will show who should be reset, rebalanced, simplified, or simply maintained.
                </div>
              ) : (
                <div className="space-y-3">
                  {operatingReviewItems.slice(0, 8).map((item) => (
                    <Link
                      key={`operating-review:${item.id}`}
                      href={item.href}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <MetricPill label="Learner" tone="muted" />
                            <MetricPill
                              label={item.label}
                              tone={
                                item.state === "reset_now"
                                  ? "rose"
                                  : item.state === "rebalance"
                                    ? "amber"
                                    : item.state === "simplify_now"
                                      ? "sky"
                                      : "emerald"
                              }
                            />
                          </div>
                          <h3 className="mt-2 font-semibold text-foreground">{item.studentName}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                        </div>
                        <div className="text-xs font-medium text-[var(--cn-orange)]">Open →</div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{item.classroomName}</span>
                        <span>{item.note}</span>
                      </div>
                      {item.supportingNote ? (
                        <p className="mt-2 text-sm text-muted-foreground">{item.supportingNote}</p>
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
                  Portfolio Distribution
                </h2>
              </div>

              {reporting.stabilizationItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No portfolio distribution signals yet. As private learners settle into active support, simplification, and handoff-ready states, the portfolio mix will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.stabilizationItems.slice(0, 8).map((item) => (
                    <Link
                      key={`portfolio:${item.kind}:${item.id}`}
                      href={item.href}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <MetricPill label={item.kind === "learner" ? "Learner" : item.kind} tone="muted" />
                            <MetricPill
                              label={item.stabilization_state.replaceAll("_", " ")}
                              tone={
                                item.stabilization_state === "keep_active"
                                  ? "rose"
                                  : item.stabilization_state === "simplify"
                                    ? "amber"
                                    : item.stabilization_state === "light_touch"
                                      ? "sky"
                                      : "emerald"
                              }
                            />
                          </div>
                          <h3 className="mt-2 font-semibold text-foreground">{item.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                        </div>
                        <div className="text-xs font-medium text-[var(--cn-orange)]">Open →</div>
                      </div>
                      {item.supporting_note ? (
                        <p className="mt-3 text-sm text-muted-foreground">{item.supporting_note}</p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Stabilization
                </h2>
              </div>

              {reporting.stabilizationItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No stabilization signals yet. This section will surface learners who still need active support and those now looking stable enough for simplification.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.stabilizationItems.slice(0, 8).map((item) => (
                    <Link
                      key={`${item.kind}:${item.id}`}
                      href={item.href}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <MetricPill label={item.kind === "learner" ? "Learner" : item.kind} tone="muted" />
                            <MetricPill
                              label={item.stabilization_state.replaceAll("_", " ")}
                              tone={
                                item.stabilization_state === "keep_active"
                                  ? "rose"
                                  : item.stabilization_state === "simplify"
                                    ? "amber"
                                    : item.stabilization_state === "light_touch"
                                      ? "sky"
                                      : "emerald"
                              }
                            />
                          </div>
                          <h3 className="mt-2 font-semibold text-foreground">{item.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                        </div>
                        <div className="text-xs font-medium text-[var(--cn-orange)]">Open →</div>
                      </div>
                      {item.supporting_note ? (
                        <p className="mt-3 text-sm text-muted-foreground">{item.supporting_note}</p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Checkpoint Rhythm
                </h2>
              </div>

              {reporting.checkpointItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No review checkpoints are surfacing yet. This section will show what is due now, overdue, or recently checked once private learner follow-through starts to drift.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.checkpointItems.slice(0, 8).map((item) => (
                    <Link
                      key={`${item.kind}:${item.private_student_id}:${item.days_open ?? "recent"}`}
                      href={item.href}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <MetricPill
                              label={item.kind.replaceAll("_", " ")}
                              tone="muted"
                            />
                            <MetricPill
                              label={
                                item.due_state === "overdue"
                                  ? "overdue"
                                  : item.due_state === "due_now"
                                    ? "due now"
                                    : "recently checked"
                              }
                              tone={
                                item.due_state === "overdue"
                                  ? "rose"
                                  : item.due_state === "due_now"
                                    ? "amber"
                                    : "emerald"
                              }
                            />
                          </div>
                          <h3 className="mt-2 font-semibold text-foreground">{item.student_name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>{item.classroom_name}</div>
                          <div className="mt-1">
                            {item.days_open === null
                              ? "checked recently"
                              : `${item.days_open} day${item.days_open === 1 ? "" : "s"} open`}
                          </div>
                        </div>
                      </div>
                      {item.supporting_note ? (
                        <p className="mt-3 text-sm text-muted-foreground">{item.supporting_note}</p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Load Concentration
                </h2>
              </div>

              {reporting.loadConcentrationItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No strong concentration signals yet. This section will surface repeated-pressure learners and weak support paths once load starts clustering.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.loadConcentrationItems.slice(0, 8).map((item) => (
                    <Link
                      key={`${item.kind}:${item.id}`}
                      href={item.href}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <MetricPill label={getConcentrationKindLabel(item.kind)} tone="muted" />
                            <MetricPill
                              label={item.concentration_level}
                              tone={
                                item.concentration_level === "high"
                                  ? "rose"
                                  : item.concentration_level === "medium"
                                    ? "amber"
                                    : "sky"
                              }
                            />
                          </div>
                          <h3 className="mt-2 font-semibold text-foreground">{item.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                        </div>
                        <div className="text-xs font-medium text-[var(--cn-orange)]">Open →</div>
                      </div>
                      {item.supporting_note ? (
                        <p className="mt-3 text-sm text-muted-foreground">{item.supporting_note}</p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Priority Follow-Through
                </h2>
              </div>

              {patternPriorityItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No ranked pattern follow-through items yet. Once pressure builds across issues, strategies, or playbooks, the highest-value actions will surface here first.
                </div>
              ) : (
                <div className="space-y-3">
                  {patternPriorityItems.map((item) => (
                    <Link
                      key={`${item.kind}:${item.id}`}
                      href={item.href}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <MetricPill label={getPatternKindLabel(item.kind)} tone="muted" />
                            <PriorityPill level={item.priority_level} />
                          </div>
                          <h3 className="mt-2 font-semibold text-foreground">{item.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                        </div>
                        <div className="text-xs font-medium text-[var(--cn-orange)]">Open →</div>
                      </div>
                      {item.supporting_note ? (
                        <p className="mt-3 text-sm text-muted-foreground">{item.supporting_note}</p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Teaching Patterns
                </h2>
              </div>

              {reporting.issuePatternItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No recurring cross-learner issue patterns yet. Pattern reporting starts once the same issue repeats across multiple private learner histories.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.issuePatternItems.map((item) => (
                    <div key={item.issue_tag} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {item.issue_tag.replaceAll("_", " ")}
                            </h3>
                            {issuePriorityMap.has(item.issue_tag) ? (
                              <PriorityPill
                                level={issuePriorityMap.get(item.issue_tag)!.priority_level}
                              />
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Affecting {item.learner_count} learner{item.learner_count === 1 ? "" : "s"}:{" "}
                            {item.learner_names.join(", ")}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <MetricPill label={`${item.learner_count} learners`} tone="amber" />
                          {item.learners_without_support_path > 0 ? (
                            <MetricPill
                              label={`${item.learners_without_support_path} no support path`}
                              tone="rose"
                            />
                          ) : null}
                          {item.learners_without_strategy > 0 ? (
                            <MetricPill
                              label={`${item.learners_without_strategy} no strategy`}
                              tone="amber"
                            />
                          ) : null}
                          {item.learners_without_playbook > 0 ? (
                            <MetricPill
                              label={`${item.learners_without_playbook} no playbook`}
                              tone="sky"
                            />
                          ) : null}
                          {item.learners_without_recent_outcome > 0 ? (
                            <MetricPill
                              label={`${item.learners_without_recent_outcome} no recent outcome`}
                              tone="amber"
                            />
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>
                          {item.learners_without_support_path > 0
                            ? `${item.learners_without_support_path} learner${item.learners_without_support_path === 1 ? "" : "s"} still being handled ad hoc`
                            : "Each affected learner has at least one support path"}
                        </span>
                        <span>
                          {item.latest_history_at
                            ? `Latest seen ${new Date(item.latest_history_at).toLocaleDateString("en-US")}`
                            : "No recent history timestamp"}
                        </span>
                      </div>
                      {item.latest_intervention_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Latest intervention: {item.latest_intervention_note}
                        </p>
                      ) : null}
                      {issuePriorityMap.has(item.issue_tag) ? (
                        <p className="mt-2 text-sm text-[var(--cn-orange)]">
                          Follow-through reason: {issuePriorityMap.get(item.issue_tag)!.reason}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                            {strategyPriorityMap.has(item.id) ? (
                              <PriorityPill level={strategyPriorityMap.get(item.id)!.priority_level} />
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <MetricPill label={`Used ${item.usage_count}`} tone="muted" />
                          <MetricPill label={`${item.learner_count} learners`} tone="sky" />
                          <MetricPill
                            label={
                              item.broad_status === "helping"
                                ? "helping broadly"
                                : item.broad_status === "mixed"
                                  ? "mixed across learners"
                                  : item.broad_status === "weak"
                                    ? "weak across learners"
                                    : "insufficient data"
                            }
                            tone={
                              item.broad_status === "helping"
                                ? "emerald"
                                : item.broad_status === "mixed"
                                  ? "amber"
                                  : item.broad_status === "weak"
                                    ? "rose"
                                    : "muted"
                            }
                          />
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
                        <span>{item.learner_count} learners affected</span>
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
                      {strategyPriorityMap.has(item.id) ? (
                        <p className="mt-2 text-sm text-[var(--cn-orange)]">
                          Follow-through reason: {strategyPriorityMap.get(item.id)!.reason}
                        </p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Playbook Effectiveness
                </h2>
                <Link
                  href="/notebook/teacher/library"
                  className="ml-auto text-xs font-medium text-[var(--cn-orange)] hover:underline"
                >
                  Open library
                </Link>
              </div>

              {reporting.playbookItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No saved playbooks yet. Playbook effectiveness will appear once structured support paths are being reused.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.playbookItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/notebook/teacher/library/playbooks/${item.id}`}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                            {playbookPriorityMap.has(item.id) ? (
                              <PriorityPill level={playbookPriorityMap.get(item.id)!.priority_level} />
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <MetricPill label={`Used ${item.usage_count}`} tone="muted" />
                          <MetricPill label={`${item.learner_count} learners`} tone="sky" />
                          <MetricPill
                            label={
                              item.broad_status === "helping"
                                ? "helping broadly"
                                : item.broad_status === "mixed"
                                  ? "mixed across learners"
                                  : item.broad_status === "weak"
                                    ? "weak across learners"
                                    : "insufficient data"
                            }
                            tone={
                              item.broad_status === "helping"
                                ? "emerald"
                                : item.broad_status === "mixed"
                                  ? "amber"
                                  : item.broad_status === "weak"
                                    ? "rose"
                                    : "muted"
                            }
                          />
                          {item.needs_refinement ? (
                            <MetricPill label="needs refinement" tone="rose" />
                          ) : null}
                          {item.needs_more_outcomes ? (
                            <MetricPill label="needs outcomes" tone="amber" />
                          ) : null}
                          {item.replacement_playbook_title ? (
                            <MetricPill label={`replaced by ${item.replacement_playbook_title}`} tone="sky" />
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
                        <span>{item.learner_count} learners affected</span>
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
                      {playbookPriorityMap.has(item.id) ? (
                        <p className="mt-2 text-sm text-[var(--cn-orange)]">
                          Follow-through reason: {playbookPriorityMap.get(item.id)!.reason}
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
                          {item.latest_playbook_outcome_status
                            ? `Playbook outcome: ${item.latest_playbook_outcome_status.replaceAll("_", " ")}`
                            : item.has_playbook_application
                              ? "No playbook outcome yet"
                              : "No playbook outcome"}
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
                      {item.latest_playbook_outcome_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Playbook outcome: {item.latest_playbook_outcome_note}
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
                <p>Checkpoint rhythm now adds a second operational lens: not just what is most important, but what is due now or overdue because it has not been revisited recently enough.</p>
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
  value: number | string;
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

function PriorityPill({
  level,
}: {
  level: "urgent" | "high" | "watch";
}) {
  return (
    <MetricPill
      label={level}
      tone={level === "urgent" ? "rose" : level === "high" ? "amber" : "sky"}
    />
  );
}

function getPatternKindLabel(kind: "issue_cluster" | "strategy" | "playbook") {
  if (kind === "issue_cluster") return "Issue cluster";
  if (kind === "strategy") return "Strategy";
  return "Playbook";
}

function getConcentrationKindLabel(kind: "learner" | "issue_cluster" | "strategy" | "playbook") {
  if (kind === "learner") return "Learner";
  if (kind === "issue_cluster") return "Issue cluster";
  if (kind === "strategy") return "Strategy";
  return "Playbook";
}

function getStabilizationState(input: {
  status: string;
  hasLessonPlan: boolean;
  hasSupportedPlan: boolean;
  activeGoalCount: number;
  blockedGoalCount: number;
  needsReinforcementCount: number;
  recurringIssueTags: string[];
  hasRecentHistory: boolean;
  hasRecentReview: boolean;
  hasRecentAdaptation: boolean;
  needsReviewSnapshot: boolean;
  needsAdaptation: boolean;
  reviewWithoutAdaptation: boolean;
  planOverdue: boolean;
  hasStrategyApplication: boolean;
  hasPlaybookApplication: boolean;
  latestStrategyOutcomeStatus: string | null;
  latestPlaybookOutcomeStatus: string | null;
}) {
  const hasWeakOutcome =
    input.latestStrategyOutcomeStatus === "no_change" ||
    input.latestStrategyOutcomeStatus === "replace" ||
    input.latestPlaybookOutcomeStatus === "no_change" ||
    input.latestPlaybookOutcomeStatus === "replace";

  const isStable =
    input.status === "active" &&
    input.blockedGoalCount === 0 &&
    input.needsReinforcementCount === 0 &&
    input.recurringIssueTags.length === 0 &&
    !input.needsReviewSnapshot &&
    !input.needsAdaptation &&
    !input.reviewWithoutAdaptation &&
    !input.planOverdue &&
    input.hasRecentHistory &&
    (input.hasRecentReview || input.hasRecentAdaptation) &&
    !hasWeakOutcome;

  if (!isStable) return "keep_active" as const;

  if (
    input.hasLessonPlan &&
    (input.hasStrategyApplication || input.hasPlaybookApplication) &&
    ((input.latestStrategyOutcomeStatus === "helped" && !input.hasPlaybookApplication) ||
      input.latestPlaybookOutcomeStatus === "helped")
  ) {
    if (
      input.hasSupportedPlan &&
      input.activeGoalCount > 0 &&
      input.hasRecentHistory &&
      input.hasRecentReview &&
      input.hasRecentAdaptation
    ) {
      return "handoff_ready" as const;
    }

    return "simplify" as const;
  }

  return "light_touch" as const;
}

function getOperatingReviewState(input: {
  blockedGoalCount: number;
  needsAdaptation: boolean;
  reviewWithoutAdaptation: boolean;
  planOverdue: boolean;
  recurringIssueTags: string[];
  hasStrategy: boolean;
  hasPlaybook: boolean;
  stabilizationState: "keep_active" | "simplify" | "light_touch" | "handoff_ready";
}) {
  const resetNow =
    (input.blockedGoalCount > 0 && (!input.hasPlaybook || !input.hasStrategy)) ||
    (input.reviewWithoutAdaptation &&
      (input.recurringIssueTags.length > 0 || input.needsAdaptation)) ||
    (input.planOverdue &&
      (input.blockedGoalCount > 0 || input.recurringIssueTags.length > 0));

  if (resetNow) {
    return {
      state: "reset_now" as const,
      label: "Reset now",
      note: "This learner is carrying enough unresolved pressure that the support path should be reset before simply continuing as-is.",
    };
  }

  if (
    input.stabilizationState === "keep_active" ||
    input.needsAdaptation ||
    input.reviewWithoutAdaptation
  ) {
    return {
      state: "rebalance" as const,
      label: "Rebalance",
      note: "This learner still belongs in active support, but the current path likely needs rebalancing instead of more of the same.",
    };
  }

  if (input.stabilizationState === "simplify") {
    return {
      state: "simplify_now" as const,
      label: "Simplify now",
      note: "This learner looks ready for a lighter and simpler support path instead of the current heavier mode.",
    };
  }

  return {
    state: "steady" as const,
    label: "Stable to maintain",
    note: "This learner looks steady enough to maintain without a near-term reset or rebalance.",
  };
}
