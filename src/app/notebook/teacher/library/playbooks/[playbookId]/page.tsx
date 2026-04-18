import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Layers3 } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { updateTeacherPlaybookAction } from "@/lib/actions";
import { listAssignmentTemplatesForTeacher } from "@/lib/assignment-templates";
import { canManageTeacherPlaybook } from "@/lib/classroom-permissions";
import { isTeacherUser } from "@/lib/classrooms";
import { listTeacherResourcesForUser } from "@/lib/teacher-resources";
import { listTeacherStrategiesForTeacher } from "@/lib/teacher-strategies";
import {
  getPrivateStudentPlaybookOutcomeLabel,
  getTeacherPlaybookOutcomeSummary,
} from "@/lib/private-student-playbook-outcomes";
import {
  getTeacherPlaybook,
  getTeacherPlaybookPatternSummary,
  listTeacherPlaybooksForTeacher,
  listTeacherPlaybookStrategies,
} from "@/lib/teacher-playbooks";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";
import {
  TeachingCollectionSection,
  TeachingExplainerBlock,
  TeachingPageHeader,
} from "@/components/patterns/teaching";

export const dynamic = "force-dynamic";

function getPlaybookGuidance(input: {
  linkedStrategyCount: number;
  whenToUse: string | null;
  usageCount: number;
  replacementTitle: string | null;
}) {
  if (input.replacementTitle) {
    return `This playbook is marked for replacement by ${input.replacementTitle}. Keep it archived or low-use unless older learner plans still rely on it.`;
  }

  if (input.linkedStrategyCount === 0) {
    return "This playbook still has no linked strategies. Add at least one so it becomes operational instead of purely descriptive.";
  }

  if (!input.whenToUse) {
    return "The playbook has strategy content, but no escalation rule yet. Add a short “when to use this” note so teachers know when to switch from ad hoc support.";
  }

  if (input.usageCount === 0) {
    return "This playbook is structured enough to use, but it has not been applied yet. Apply it from Private Learners when support pressure starts repeating.";
  }

  return "This playbook already has a reusable structure. Keep its linked strategies and escalation note aligned as usage evidence grows.";
}

export default async function TeacherPlaybookDetailPage({
  params,
}: {
  params: Promise<{ playbookId: string }>;
}) {
  const userId = await getAuthUserId();
  const { playbookId } = await params;

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  if (!(await canManageTeacherPlaybook(userId, playbookId))) {
    notFound();
  }

  const [playbook, templates, resources, strategies, linkedStrategies, outcomeSummary, playbookOptions, patternSummary] = await Promise.all([
    getTeacherPlaybook(playbookId),
    listAssignmentTemplatesForTeacher(userId, { includeArchived: true }),
    listTeacherResourcesForUser(userId, { includeArchived: true }),
    listTeacherStrategiesForTeacher(userId, { includeArchived: true }),
    listTeacherPlaybookStrategies(playbookId),
    getTeacherPlaybookOutcomeSummary(playbookId),
    listTeacherPlaybooksForTeacher(userId, { includeArchived: true }),
    getTeacherPlaybookPatternSummary(playbookId),
  ]);

  if (!playbook) {
    notFound();
  }

  async function updatePlaybookFormAction(formData: FormData) {
    "use server";
    await updateTeacherPlaybookAction(formData);
  }

  const linkedStrategyIds = new Set(linkedStrategies.map((strategy) => strategy.strategy_id));

  return (
    <div data-testid="teacher-playbook-detail-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <TeachingPageHeader
          title={playbook.title}
          description={playbook.summary}
          badge={
            <Link href="/notebook/teacher/library" className="inline-flex items-center text-xs font-medium">
              Back to Library
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <TeachingCollectionSection title="Playbook Details" icon={Layers3}>
            <form action={updatePlaybookFormAction} className="space-y-3">
              <input type="hidden" name="id" value={playbook.id} />
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Title</label>
                <input
                  name="title"
                  required
                  defaultValue={playbook.title}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Summary</label>
                <textarea
                  name="summary"
                  rows={3}
                  required
                  defaultValue={playbook.summary}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Issue focus</label>
                  <input
                    name="issue_focus"
                    defaultValue={playbook.issue_focus || ""}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Goal focus</label>
                  <input
                    name="goal_focus"
                    defaultValue={playbook.goal_focus || ""}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">When to use</label>
                <textarea
                  name="when_to_use"
                  rows={3}
                  defaultValue={playbook.when_to_use || ""}
                  placeholder="What recurring pattern or escalation signal should trigger this playbook?"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Guidance</label>
                <textarea
                  name="guidance"
                  rows={5}
                  defaultValue={playbook.guidance || ""}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                />
              </div>
              <TeachingExplainerBlock tone="sky">
                {getPlaybookGuidance({
                  linkedStrategyCount: linkedStrategies.length,
                  whenToUse: playbook.when_to_use,
                  usageCount: playbook.usage_count,
                  replacementTitle: playbook.replacement_playbook_title ?? null,
                })}
              </TeachingExplainerBlock>
              <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Refinement note</label>
                <textarea
                  name="refinement_note"
                  rows={3}
                  defaultValue={playbook.refinement_note || ""}
                  placeholder="What changed in this playbook after seeing outcome evidence?"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Replacement playbook</label>
                  <select
                    name="replacement_playbook_id"
                    defaultValue={playbook.replacement_playbook_id || ""}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                  >
                    <option value="">No replacement</option>
                    {playbookOptions
                      .filter((candidate) => candidate.id !== playbook.id)
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.title}
                        </option>
                      ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-foreground/80 pt-7">
                  <input type="checkbox" name="mark_refined" value="1" className="h-4 w-4" />
                  Mark this playbook as refined now
                </label>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Linked template</label>
                <select
                  name="linked_template_id"
                    defaultValue={playbook.linked_template_id || ""}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
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
                    defaultValue={playbook.linked_resource_id || ""}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
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
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground/80">Linked strategies</label>
                <div className="max-h-56 space-y-2 overflow-auto rounded-lg border border-border bg-background p-3">
                  {strategies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Create a strategy first, then connect it to a playbook.</p>
                  ) : (
                    strategies.map((strategy) => (
                      <label key={strategy.id} className="flex items-start gap-2 text-sm text-foreground/85">
                        <input
                          type="checkbox"
                          name="strategy_ids"
                          value={strategy.id}
                          defaultChecked={linkedStrategyIds.has(strategy.id)}
                          className="mt-0.5 h-4 w-4"
                        />
                        <span>
                          <span className="font-medium text-foreground">{strategy.title}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">{strategy.summary}</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground/80">
                <input type="checkbox" name="archived" defaultChecked={playbook.archived === 1} className="h-4 w-4" />
                Archive playbook
              </label>
              <PendingSubmitButton pendingLabel="Updating playbook..." className="w-full justify-center rounded-lg bg-[var(--cn-orange)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--cn-orange-dark)]">
                Update Playbook
              </PendingSubmitButton>
            </form>
          </TeachingCollectionSection>

          <TeachingCollectionSection title="Metadata">
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {playbook.usage_count === 0 ? (
                <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 font-medium text-sky-400">
                  Not used yet
                </span>
              ) : (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-400">
                  In use
                </span>
              )}
              {linkedStrategies.length === 0 ? (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-medium text-amber-300">
                  Needs linked strategies
                </span>
              ) : null}
              {!playbook.when_to_use ? (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-medium text-amber-300">
                  Needs escalation rule
                </span>
              ) : null}
              {playbook.usage_count > 0 && outcomeSummary.total === 0 ? (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-medium text-amber-300">
                  Needs outcomes
                </span>
              ) : null}
              {outcomeSummary.replace > 0 ||
              (outcomeSummary.total > 0 && outcomeSummary.no_change >= outcomeSummary.helped) ? (
                <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 font-medium text-rose-300">
                  Needs refinement
                </span>
              ) : null}
              {playbook.replacement_playbook_title ? (
                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 font-medium text-violet-300">
                  Replaced by {playbook.replacement_playbook_title}
                </span>
              ) : null}
              {playbook.archived === 1 ? (
                <span className="rounded-full border bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                  Archived
                </span>
              ) : null}
              <span
                className={`rounded-full border px-2.5 py-1 font-medium ${
                  patternSummary.broad_status === "helping"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : patternSummary.broad_status === "mixed"
                      ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                      : patternSummary.broad_status === "weak"
                        ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
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
                <span className="font-medium text-foreground">{playbook.usage_count}</span>
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
                <span className="font-medium text-foreground">{playbook.issue_focus || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Goal focus</span>
                <span className="font-medium text-foreground">{playbook.goal_focus || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Linked strategies</span>
                <span className="font-medium text-foreground">{linkedStrategies.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium text-foreground">{new Date(playbook.updated_at).toLocaleDateString("en-US")}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Outcome records</span>
                <span className="font-medium text-foreground">{outcomeSummary.total}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Latest outcome</span>
                <span className="font-medium text-foreground">
                  {outcomeSummary.latest_outcome_status
                    ? getPrivateStudentPlaybookOutcomeLabel(outcomeSummary.latest_outcome_status)
                    : "Not recorded"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Last outcome date</span>
                <span className="font-medium text-foreground">
                  {outcomeSummary.latest_recorded_at
                    ? new Date(outcomeSummary.latest_recorded_at).toLocaleDateString("en-US")
                    : "Not recorded"}
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
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Last refined</span>
                <span className="font-medium text-foreground">
                  {playbook.last_refined_at
                    ? new Date(playbook.last_refined_at).toLocaleDateString("en-US")
                    : "Not refined"}
                </span>
              </div>
            </div>
            {outcomeSummary.total > 0 ? (
              <div className="mt-5 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-sm text-foreground/90">
                <p>
                  Outcomes: {outcomeSummary.helped} helped, {outcomeSummary.partial} partial,{" "}
                  {outcomeSummary.no_change} no change, {outcomeSummary.replace} replace.
                </p>
                {outcomeSummary.latest_outcome_note ? (
                  <p className="mt-2 text-muted-foreground">
                    Latest outcome note: {outcomeSummary.latest_outcome_note}
                  </p>
                ) : null}
              </div>
            ) : null}
            <p className="mt-3 text-sm text-muted-foreground">
              {patternSummary.broad_status === "helping"
                ? "This playbook is showing repeatable value across multiple learners."
                : patternSummary.broad_status === "mixed"
                  ? "This playbook is being reused across learners, but broader results are still mixed."
                  : patternSummary.broad_status === "weak"
                    ? "This playbook is active across learners, but broader results point toward refinement or replacement."
                    : "This playbook does not yet have enough cross-learner evidence to judge it broadly."}
            </p>
            {playbook.refinement_note ? (
              <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-sm text-foreground/90">
                Refinement note: {playbook.refinement_note}
              </div>
            ) : null}
            {linkedStrategies.length > 0 ? (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Linked strategies
                </p>
                {linkedStrategies.map((strategy) => (
                  <div key={strategy.id} className="rounded-xl border p-3">
                    <p className="text-sm font-medium text-foreground">{strategy.strategy_title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{strategy.strategy_summary}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </TeachingCollectionSection>
        </div>
      </div>
    </div>
  );
}
