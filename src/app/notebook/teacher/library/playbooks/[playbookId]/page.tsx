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
  getTeacherPlaybook,
  listTeacherPlaybookStrategies,
} from "@/lib/teacher-playbooks";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";

export const dynamic = "force-dynamic";

function getPlaybookGuidance(input: {
  linkedStrategyCount: number;
  whenToUse: string | null;
  usageCount: number;
}) {
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

  const [playbook, templates, resources, strategies, linkedStrategies] = await Promise.all([
    getTeacherPlaybook(playbookId),
    listAssignmentTemplatesForTeacher(userId, { includeArchived: true }),
    listTeacherResourcesForUser(userId, { includeArchived: true }),
    listTeacherStrategiesForTeacher(userId, { includeArchived: true }),
    listTeacherPlaybookStrategies(playbookId),
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
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Library playbook</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">{playbook.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{playbook.summary}</p>
          </div>
          <Link
            href="/notebook/teacher/library"
            className="inline-flex items-center rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Back to Library
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-[var(--cn-orange)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Details</h2>
            </div>
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
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-sm text-foreground/90">
                {getPlaybookGuidance({
                  linkedStrategyCount: linkedStrategies.length,
                  whenToUse: playbook.when_to_use,
                  usageCount: playbook.usage_count,
                })}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
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
          </section>

          <aside className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Metadata</h2>
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
              {playbook.archived === 1 ? (
                <span className="rounded-full border bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                  Archived
                </span>
              ) : null}
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Uses</span>
                <span className="font-medium text-foreground">{playbook.usage_count}</span>
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
            </div>
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
          </aside>
        </div>
      </div>
    </div>
  );
}
