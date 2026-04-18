import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Repeat2 } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { updateTeacherStrategyAction } from "@/lib/actions";
import { listAssignmentTemplatesForTeacher } from "@/lib/assignment-templates";
import { canManageTeacherStrategy } from "@/lib/classroom-permissions";
import { isTeacherUser } from "@/lib/classrooms";
import { listTeacherResourcesForUser } from "@/lib/teacher-resources";
import {
  getTeacherStrategy,
  getTeacherStrategyPatternSummary,
} from "@/lib/teacher-strategies";
import {
  getPrivateStudentStrategyOutcomeLabel,
  getTeacherStrategyOutcomeSummary,
} from "@/lib/private-student-strategy-outcomes";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";
import {
  TeachingCollectionSection,
  TeachingExplainerBlock,
  TeachingPageHeader,
} from "@/components/patterns/teaching";

export const dynamic = "force-dynamic";

function getRefinementGuidance(input: {
  total: number;
  helped: number;
  partial: number;
  noChange: number;
  replace: number;
  refinementNote: string | null;
}) {
  if (input.total === 0) {
    return "No outcomes are recorded yet. As this strategy gets used, capture lightweight outcomes so you can decide whether it deserves refinement or retirement.";
  }

  if (input.replace > 0 && input.replace >= input.helped) {
    return "This strategy is showing real replacement pressure. Tighten the guidance or archive it if teachers keep needing a different response.";
  }

  if (input.noChange > input.helped) {
    return "This strategy is being used, but the outcomes are not strong yet. Refine the guidance before it becomes a default habit.";
  }

  if (input.partial > 0 && input.helped === 0) {
    return "This strategy is helping only partially so far. Refine the note, issue focus, or linked template to make the response more repeatable.";
  }

  if (input.refinementNote) {
    return "A refinement note is already recorded. Keep updating it as more outcome evidence arrives.";
  }

  return "This strategy is producing usable signals. Add a short refinement note so future teachers know what makes it work best.";
}

export default async function TeacherStrategyDetailPage({
  params,
}: {
  params: Promise<{ strategyId: string }>;
}) {
  const userId = await getAuthUserId();
  const { strategyId } = await params;

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  if (!(await canManageTeacherStrategy(userId, strategyId))) {
    notFound();
  }

  const [strategy, templates, resources, outcomeSummary, patternSummary] = await Promise.all([
    getTeacherStrategy(strategyId),
    listAssignmentTemplatesForTeacher(userId, { includeArchived: true }),
    listTeacherResourcesForUser(userId, { includeArchived: true }),
    getTeacherStrategyOutcomeSummary(strategyId),
    getTeacherStrategyPatternSummary(strategyId),
  ]);

  if (!strategy) {
    notFound();
  }

  async function updateStrategyFormAction(formData: FormData) {
    "use server";
    await updateTeacherStrategyAction(formData);
  }

  return (
    <div data-testid="teacher-strategy-detail-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <TeachingPageHeader
          title={strategy.title}
          description={strategy.summary}
          badge={
            <Link href="/notebook/teacher/library" className="inline-flex items-center text-xs font-medium">
              Back to Library
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <TeachingCollectionSection title="Strategy Details" icon={Repeat2}>
            <form action={updateStrategyFormAction} className="space-y-3">
              <input type="hidden" name="id" value={strategy.id} />
              <input type="hidden" name="mark_refined" value="1" />
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Title</label>
                <input
                  name="title"
                  required
                  defaultValue={strategy.title}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Summary</label>
                <textarea
                  name="summary"
                  rows={3}
                  required
                  defaultValue={strategy.summary}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Issue focus</label>
                  <input
                    name="issue_focus"
                    defaultValue={strategy.issue_focus || ""}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Goal focus</label>
                  <input
                    name="goal_focus"
                    defaultValue={strategy.goal_focus || ""}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Guidance</label>
                <textarea
                  name="guidance"
                  rows={5}
                  defaultValue={strategy.guidance || ""}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                />
              </div>
              <TeachingExplainerBlock tone="sky">
                {getRefinementGuidance({
                  total: outcomeSummary.total,
                  helped: outcomeSummary.helped,
                  partial: outcomeSummary.partial,
                  noChange: outcomeSummary.no_change,
                  replace: outcomeSummary.replace,
                  refinementNote: strategy.refinement_note,
                })}
              </TeachingExplainerBlock>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Refinement note</label>
                <textarea
                  name="refinement_note"
                  rows={4}
                  defaultValue={strategy.refinement_note || ""}
                  placeholder="What should future-you keep, tighten, or replace when using this strategy?"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Save a short note when outcomes suggest how this strategy should evolve.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Linked template</label>
                  <select
                    name="linked_template_id"
                    defaultValue={strategy.linked_template_id || ""}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  >
                    <option value="">No linked template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Linked resource</label>
                  <select
                    name="linked_resource_id"
                    defaultValue={strategy.linked_resource_id || ""}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  >
                    <option value="">No linked resource</option>
                    {resources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground/80">
                <input type="checkbox" name="archived" defaultChecked={strategy.archived === 1} className="h-4 w-4" />
                Archive strategy
              </label>
              <PendingSubmitButton pendingLabel="Updating strategy..." className="bg-primary text-primary-foreground hover:opacity-90 w-full justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                Update Strategy
              </PendingSubmitButton>
            </form>
          </TeachingCollectionSection>

          <TeachingCollectionSection title="Metadata">
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {outcomeSummary.total === 0 ? (
                <span className="ui-tone-amber-panel ui-tone-amber-text rounded-full border px-2.5 py-1 font-medium">
                  Needs outcomes
                </span>
              ) : null}
              {outcomeSummary.replace > 0 ||
              (outcomeSummary.total > 0 && outcomeSummary.no_change >= outcomeSummary.helped) ||
              (outcomeSummary.total > 0 && outcomeSummary.partial > outcomeSummary.helped && outcomeSummary.helped === 0) ? (
                <span className="ui-tone-rose-panel ui-tone-rose-text rounded-full border px-2.5 py-1 font-medium">
                  Needs refinement
                </span>
              ) : null}
              {strategy.archived === 1 ? (
                <span className="rounded-full border bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                  Archived
                </span>
              ) : null}
              <span
                className={`rounded-full border px-2.5 py-1 font-medium ${
                  patternSummary.broad_status === "helping"
                    ? "ui-tone-emerald-panel ui-tone-emerald-text"
                    : patternSummary.broad_status === "mixed"
                      ? "ui-tone-amber-panel ui-tone-amber-text"
                      : patternSummary.broad_status === "weak"
                        ? "ui-tone-rose-panel ui-tone-rose-text"
                        : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {patternSummary.broad_status === "helping"
                  ? "Helping across learners"
                  : patternSummary.broad_status === "mixed"
                    ? "Mixed across learners"
                    : patternSummary.broad_status === "weak"
                      ? "Weak across learners"
                      : "Insufficient cross-learner data"}
              </span>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Uses</span>
                <span className="font-medium text-foreground">{strategy.usage_count}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Learners affected</span>
                <span className="font-medium text-foreground">{patternSummary.learner_count}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Active learners</span>
                <span className="font-medium text-foreground">{patternSummary.active_learner_count}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Issue overlap</span>
                <span className="font-medium text-foreground">
                  {patternSummary.recurring_issue_learner_count}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Issue focus</span>
                <span className="font-medium text-foreground">{strategy.issue_focus || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Goal focus</span>
                <span className="font-medium text-foreground">{strategy.goal_focus || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium text-foreground">{new Date(strategy.updated_at).toLocaleDateString("en-US")}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Last refined</span>
                <span className="font-medium text-foreground">
                  {strategy.last_refined_at
                    ? new Date(strategy.last_refined_at).toLocaleDateString("en-US")
                    : "Not refined yet"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Helped</span>
                <span className="font-medium text-foreground">{outcomeSummary.helped}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Partial</span>
                <span className="font-medium text-foreground">{outcomeSummary.partial}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">No change</span>
                <span className="font-medium text-foreground">{outcomeSummary.no_change}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Needs replacement</span>
                <span className="font-medium text-foreground">{outcomeSummary.replace}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Latest outcome</span>
                <span className="font-medium text-foreground">
                  {outcomeSummary.latest_outcome_status
                    ? getPrivateStudentStrategyOutcomeLabel(outcomeSummary.latest_outcome_status)
                    : "No outcome yet"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Latest applied</span>
                <span className="font-medium text-foreground">
                  {patternSummary.latest_applied_at
                    ? new Date(patternSummary.latest_applied_at).toLocaleDateString("en-US")
                    : "Not applied yet"}
                </span>
              </div>
            </div>
            {outcomeSummary.latest_outcome_note ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Latest outcome note: {outcomeSummary.latest_outcome_note}
              </p>
            ) : null}
            <p className="mt-3 text-sm text-muted-foreground">
              {patternSummary.broad_status === "helping"
                ? "This strategy is showing repeatable value across multiple learners."
                : patternSummary.broad_status === "mixed"
                  ? "This strategy is being reused across learners, but results are still mixed."
                  : patternSummary.broad_status === "weak"
                    ? "This strategy is being reused, but broader results are weak enough to justify refinement."
                    : "This strategy does not yet have enough cross-learner evidence to judge it broadly."}
            </p>
            {strategy.refinement_note ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Refinement note: {strategy.refinement_note}
              </p>
            ) : null}
          </TeachingCollectionSection>
        </div>
      </div>
    </div>
  );
}
