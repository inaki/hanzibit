import Link from "next/link";
import { redirect } from "next/navigation";
import { BookCopy, ClipboardList, FolderKanban, Layers3, Plus, Sparkles, Repeat2 } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import {
  createAssignmentTemplateAction,
  createTeacherPlaybookAction,
  createTeacherResourceAction,
  createTeacherStrategyAction,
} from "@/lib/actions";
import { listOwnedClassrooms, isTeacherUser } from "@/lib/classrooms";
import { listAssignmentTemplatesForTeacher } from "@/lib/assignment-templates";
import { listTeacherResourcesForUser } from "@/lib/teacher-resources";
import {
  getTeacherStrategyPatternSummary,
  listTeacherStrategiesForTeacher,
} from "@/lib/teacher-strategies";
import {
  getTeacherPlaybookPatternSummary,
  listTeacherPlaybooksForTeacher,
} from "@/lib/teacher-playbooks";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";
import {
  TeachingCollectionSection,
  TeachingEntityCard,
  TeachingPageHeader,
  TeachingToneMetricCard,
} from "@/components/patterns/teaching";

export const dynamic = "force-dynamic";

export default async function TeacherLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ resourceId?: string; templateId?: string; resourceType?: string; templateType?: string }>;
}) {
  const query = await searchParams;
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  const [resources, templates, classrooms, strategies, playbooks] = await Promise.all([
    listTeacherResourcesForUser(userId, {
      resourceType: typeof query.resourceType === "string" && query.resourceType !== "all"
        ? (query.resourceType as Parameters<typeof listTeacherResourcesForUser>[1]["resourceType"])
        : undefined,
    }),
    listAssignmentTemplatesForTeacher(userId),
    listOwnedClassrooms(userId),
    listTeacherStrategiesForTeacher(userId),
    listTeacherPlaybooksForTeacher(userId),
  ]);

  const [strategyPatterns, playbookPatterns] = await Promise.all([
    Promise.all(
      strategies.map(async (strategy) => [strategy.id, await getTeacherStrategyPatternSummary(strategy.id)] as const)
    ),
    Promise.all(
      playbooks.map(async (playbook) => [playbook.id, await getTeacherPlaybookPatternSummary(playbook.id)] as const)
    ),
  ]);

  const strategyPatternById = new Map(strategyPatterns);
  const playbookPatternById = new Map(playbookPatterns);

  async function createResourceFormAction(formData: FormData) {
    "use server";
    await createTeacherResourceAction(formData);
  }

  async function createTemplateFormAction(formData: FormData) {
    "use server";
    await createAssignmentTemplateAction(formData);
  }

  async function createStrategyFormAction(formData: FormData) {
    "use server";
    await createTeacherStrategyAction(formData);
  }

  async function createPlaybookFormAction(formData: FormData) {
    "use server";
    await createTeacherPlaybookAction(formData);
  }

  return (
    <div data-testid="teacher-library-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <TeachingPageHeader
          title="Library"
          description="Save reusable teaching resources and assignment templates so classroom setup is no longer scratch-first."
          badge="Reusable content"
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <TeachingToneMetricCard title="Resources" value={resources.length} tone="sky" />
          <TeachingToneMetricCard title="Templates" value={templates.length} tone="amber" />
          <TeachingToneMetricCard
            title="Strategies"
            value={strategies.length}
            tone="violet"
            note={`${strategies.filter((strategy) => strategy.archived !== 1).length} active`}
          />
          <TeachingToneMetricCard
            title="Playbooks"
            value={playbooks.length}
            tone="emerald"
            note={`${playbooks.filter((playbook) => playbook.archived !== 1).length} active`}
          />
          <TeachingToneMetricCard title="Your Classrooms" value={classrooms.length} tone="muted" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <section className="space-y-6">
            <TeachingCollectionSection icon={FolderKanban} title="Saved Resources">
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { label: "All", value: "all" },
                  { label: "Prompts", value: "journal_prompt" },
                  { label: "Word sets", value: "study_word_set" },
                  { label: "Reading", value: "reading_response" },
                  { label: "Grammar", value: "grammar_note" },
                ].map((filter) => {
                  const active = (query.resourceType || "all") === filter.value;
                  return (
                    <Link
                      key={filter.value}
                      href={`/notebook/teacher/library?resourceType=${encodeURIComponent(filter.value)}`}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 text-[var(--cn-orange)]"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {filter.label}
                    </Link>
                  );
                })}
              </div>

              {resources.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No reusable resources yet. Start by saving prompts, word sets, or reading-response resources.
                </div>
              ) : (
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <TeachingEntityCard
                      key={resource.id}
                      href={`/notebook/teacher/library/resources/${resource.id}`}
                      badges={
                        <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          {resource.resource_type.replaceAll("_", " ")}
                        </span>
                      }
                      title={resource.title}
                      subtitle={resource.description || "No description"}
                    >
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {resource.hsk_level ? <span>HSK {resource.hsk_level}</span> : null}
                        <span>Updated {new Date(resource.updated_at).toLocaleDateString("en-US")}</span>
                      </div>
                    </TeachingEntityCard>
                  ))}
                </div>
              )}
            </TeachingCollectionSection>

            <TeachingCollectionSection icon={ClipboardList} title="Assignment Templates">
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { label: "All", value: "all" },
                  { label: "Journal", value: "journal_prompt" },
                  { label: "Word", value: "study_guide_word" },
                  { label: "Level", value: "study_guide_level" },
                  { label: "Reading", value: "reading_response" },
                ].map((filter) => {
                  const active = (query.templateType || "all") === filter.value;
                  const visible =
                    filter.value === "all"
                      ? templates
                      : templates.filter((template) => template.template_type === filter.value);
                  return (
                    <Link
                      key={filter.value}
                      href={`/notebook/teacher/library?templateType=${encodeURIComponent(filter.value)}`}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 text-[var(--cn-orange)]"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {filter.label} ({visible.length})
                    </Link>
                  );
                })}
              </div>

              {templates.filter((template) => {
                if (!query.templateType || query.templateType === "all") return true;
                return template.template_type === query.templateType;
              }).length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No templates yet. Create one from your common classroom prompts so assignment creation becomes faster.
                </div>
              ) : (
                <div className="space-y-3">
                  {templates
                    .filter((template) => {
                      if (!query.templateType || query.templateType === "all") return true;
                      return template.template_type === query.templateType;
                    })
                    .map((template) => (
                    <TeachingEntityCard
                      key={template.id}
                      href={`/notebook/teacher/library/templates/${template.id}`}
                      badges={
                        <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          {template.template_type.replaceAll("_", " ")}
                        </span>
                      }
                      title={template.title}
                      subtitle={template.description || template.prompt || "No template description"}
                    >
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {template.hsk_level ? <span>HSK {template.hsk_level}</span> : null}
                        <span>{template.allow_resubmission ? "Resubmission allowed" : "Resubmission locked"}</span>
                      </div>
                      {classrooms.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {classrooms.slice(0, 3).map((classroom) => (
                            <Link
                              key={classroom.id}
                              href={`/notebook/classes/${classroom.id}?templateId=${encodeURIComponent(template.id)}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-2 text-xs font-medium text-[var(--cn-orange)] transition-colors hover:bg-[var(--cn-orange)]/15"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              Use in {classroom.name}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </TeachingEntityCard>
                  ))}
                </div>
              )}
            </TeachingCollectionSection>

            <TeachingCollectionSection icon={Layers3} title="Teaching Playbooks">

              {playbooks.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No playbooks yet. Group strong strategies into a repeatable support pattern when a learner needs more than a one-off response.
                </div>
              ) : (
                <div className="space-y-3">
                  {playbooks.map((playbook) => (
                    <TeachingEntityCard
                      key={playbook.id}
                      href={`/notebook/teacher/library/playbooks/${playbook.id}`}
                      badges={
                        <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          Used {playbook.usage_count}
                        </span>
                      }
                      title={playbook.title}
                      subtitle={playbook.summary}
                    >
                      {(() => {
                        const pattern = playbookPatternById.get(playbook.id);
                        return (
                          <>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {playbook.issue_focus ? <span>Issue: {playbook.issue_focus}</span> : null}
                        {playbook.goal_focus ? <span>Goal: {playbook.goal_focus}</span> : null}
                        <span>{pattern?.learner_count ?? 0} learners affected</span>
                        <span>{playbook.linked_strategy_count ?? 0} linked strategies</span>
                        <span>Updated {new Date(playbook.updated_at).toLocaleDateString("en-US")}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {playbook.archived === 1 ? (
                          <span className="rounded-full border bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                            Archived
                          </span>
                        ) : null}
                        {playbook.usage_count === 0 ? (
                          <span className="ui-tone-sky-panel ui-tone-sky-text rounded-full border px-2.5 py-1 font-medium">
                            Not used yet
                          </span>
                        ) : (
                          <span className="ui-tone-emerald-panel ui-tone-emerald-text rounded-full border px-2.5 py-1 font-medium">
                            In use
                          </span>
                        )}
                        {(playbook.linked_strategy_count ?? 0) === 0 ? (
                          <span className="ui-tone-amber-panel ui-tone-amber-text rounded-full border px-2.5 py-1 font-medium">
                            No strategies linked yet
                          </span>
                        ) : null}
                        {!playbook.when_to_use ? (
                          <span className="ui-tone-amber-panel ui-tone-amber-text rounded-full border px-2.5 py-1 font-medium">
                            Needs escalation rule
                          </span>
                        ) : null}
                        {playbook.replacement_playbook_title ? (
                          <span className="ui-tone-violet-panel ui-tone-violet-text rounded-full border px-2.5 py-1 font-medium">
                            Replaced by {playbook.replacement_playbook_title}
                          </span>
                        ) : null}
                        {playbook.usage_count > 0 && !playbook.last_refined_at ? (
                          <span className="ui-tone-sky-panel ui-tone-sky-text rounded-full border px-2.5 py-1 font-medium">
                            Refinement pending
                          </span>
                        ) : null}
                        <span className="rounded-full border bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                          {pattern?.broad_status === "helping"
                            ? "Helping across learners"
                            : pattern?.broad_status === "mixed"
                              ? "Mixed across learners"
                              : pattern?.broad_status === "weak"
                                ? "Weak across learners"
                                : "Insufficient cross-learner data"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {playbook.replacement_playbook_title
                          ? `This playbook has a replacement path: ${playbook.replacement_playbook_title}.`
                          : playbook.refinement_note
                            ? `Refinement note: ${playbook.refinement_note}`
                            : pattern?.broad_status === "weak"
                              ? "This playbook is active across learners, but broader results still look weak. Refine or replace it before it becomes the default escalation path."
                              : playbook.when_to_use || "No explicit escalation rule recorded yet. Add when-to-use guidance so this playbook becomes operational, not just descriptive."}
                      </p>
                          </>
                        );
                      })()}
                    </TeachingEntityCard>
                  ))}
                </div>
              )}
            </TeachingCollectionSection>

            <TeachingCollectionSection icon={Repeat2} title="Tutoring Strategies">

              {strategies.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No tutoring strategies yet. Save repeatable intervention patterns so private learner adaptation stops being scratch-first.
                </div>
              ) : (
                <div className="space-y-3">
                  {strategies.map((strategy) => (
                    <TeachingEntityCard
                      key={strategy.id}
                      href={`/notebook/teacher/library/strategies/${strategy.id}`}
                      badges={
                        <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          Used {strategy.usage_count}
                        </span>
                      }
                      title={strategy.title}
                      subtitle={strategy.summary}
                    >
                      {(() => {
                        const pattern = strategyPatternById.get(strategy.id);
                        return (
                          <>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {strategy.issue_focus ? <span>Issue: {strategy.issue_focus}</span> : null}
                        {strategy.goal_focus ? <span>Goal: {strategy.goal_focus}</span> : null}
                        <span>{pattern?.learner_count ?? 0} learners affected</span>
                        {strategy.last_refined_at ? (
                          <span>Refined {new Date(strategy.last_refined_at).toLocaleDateString("en-US")}</span>
                        ) : null}
                        <span>Updated {new Date(strategy.updated_at).toLocaleDateString("en-US")}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {strategy.archived === 1 ? (
                          <span className="rounded-full border bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                            Archived
                          </span>
                        ) : null}
                        {strategy.usage_count === 0 ? (
                          <span className="ui-tone-amber-panel ui-tone-amber-text rounded-full border px-2.5 py-1 font-medium">
                            Not used yet
                          </span>
                        ) : null}
                        {strategy.usage_count > 0 && !strategy.last_refined_at ? (
                          <span className="ui-tone-sky-panel ui-tone-sky-text rounded-full border px-2.5 py-1 font-medium">
                            Outcome-aware refinement pending
                          </span>
                        ) : null}
                        <span className="rounded-full border bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                          {pattern?.broad_status === "helping"
                            ? "Helping across learners"
                            : pattern?.broad_status === "mixed"
                              ? "Mixed across learners"
                              : pattern?.broad_status === "weak"
                                ? "Weak across learners"
                                : "Insufficient cross-learner data"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {strategy.usage_count === 0
                          ? "This strategy exists in the library, but it has not shaped any private learner plan yet."
                          : pattern?.broad_status === "weak"
                            ? "This strategy is being reused, but broader outcomes still look weak enough to justify refinement."
                          : strategy.last_refined_at
                            ? "This strategy has already been used and refined. Keep checking outcomes before it becomes the default response."
                            : "This strategy is in use, but it still needs enough outcome evidence or refinement to prove it is genuinely helping."}
                      </p>
                          </>
                        );
                      })()}
                    </TeachingEntityCard>
                  ))}
                </div>
              )}
            </TeachingCollectionSection>
          </section>

          <aside className="space-y-6">
            <TeachingCollectionSection icon={Plus} title="Create Resource">
              <form action={createResourceFormAction} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Type</label>
                  <select
                    name="resource_type"
                    defaultValue="journal_prompt"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  >
                    <option value="journal_prompt">Journal prompt</option>
                    <option value="study_word_set">Study word set</option>
                    <option value="study_level_set">Study level set</option>
                    <option value="reading_response">Reading response</option>
                    <option value="grammar_note">Grammar note</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Title</label>
                  <input
                    name="title"
                    required
                    placeholder="e.g. HSK 1 family prompts"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="How will you reuse this resource?"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">HSK level</label>
                  <input
                    name="hsk_level"
                    type="number"
                    min={1}
                    max={6}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <PendingSubmitButton pendingLabel="Saving resource..." className="bg-primary text-primary-foreground w-full justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90">
                  Save Resource
                </PendingSubmitButton>
              </form>
            </TeachingCollectionSection>

            <TeachingCollectionSection icon={Repeat2} title="Create Strategy">
              <form action={createStrategyFormAction} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Title</label>
                  <input
                    name="title"
                    required
                    placeholder="e.g. Tone accuracy reset"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Summary</label>
                  <textarea
                    name="summary"
                    rows={2}
                    required
                    placeholder="Short reusable strategy summary"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Issue focus</label>
                    <input
                      name="issue_focus"
                      placeholder="e.g. tone accuracy"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Goal focus</label>
                    <input
                      name="goal_focus"
                      placeholder="e.g. confidence in speaking"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Guidance</label>
                  <textarea
                    name="guidance"
                    rows={3}
                    placeholder="What should the teacher do next when applying this strategy?"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Linked template</label>
                    <select
                      name="linked_template_id"
                      defaultValue=""
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
                      defaultValue=""
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
                <PendingSubmitButton pendingLabel="Saving strategy..." className="bg-primary text-primary-foreground w-full justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90">
                  Save Strategy
                </PendingSubmitButton>
              </form>
            </TeachingCollectionSection>

            <TeachingCollectionSection icon={Layers3} title="Create Playbook">
              <form action={createPlaybookFormAction} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Title</label>
                  <input
                    name="title"
                    required
                    placeholder="e.g. Confidence rebuild playbook"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Summary</label>
                  <textarea
                    name="summary"
                    rows={2}
                    required
                    placeholder="Short repeatable support pattern summary"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Issue focus</label>
                    <input
                      name="issue_focus"
                      placeholder="e.g. homework follow-through"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Goal focus</label>
                    <input
                      name="goal_focus"
                      placeholder="e.g. speaking confidence"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">When to use</label>
                  <textarea
                    name="when_to_use"
                    rows={2}
                    placeholder="What recurring pattern or escalation signal should trigger this playbook?"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Guidance</label>
                  <textarea
                    name="guidance"
                    rows={3}
                    placeholder="How should the teacher respond once this playbook is in use?"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Linked template</label>
                    <select
                      name="linked_template_id"
                      defaultValue=""
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
                      defaultValue=""
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
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground/80">Linked strategies</label>
                  <div className="max-h-48 space-y-2 overflow-auto rounded-lg border border-border bg-background p-3">
                    {strategies.filter((strategy) => strategy.archived !== 1).length === 0 ? (
                      <p className="text-sm text-muted-foreground">Create a strategy first, then group it into a playbook.</p>
                    ) : (
                      strategies.filter((strategy) => strategy.archived !== 1).map((strategy) => (
                        <label key={strategy.id} className="flex items-start gap-2 text-sm text-foreground/85">
                          <input type="checkbox" name="strategy_ids" value={strategy.id} className="mt-0.5 h-4 w-4" />
                          <span>
                            <span className="font-medium text-foreground">{strategy.title}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{strategy.summary}</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <PendingSubmitButton pendingLabel="Saving playbook..." className="bg-primary text-primary-foreground w-full justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90">
                  Save Playbook
                </PendingSubmitButton>
              </form>
            </TeachingCollectionSection>

            <TeachingCollectionSection icon={BookCopy} title="Create Template">
              <form action={createTemplateFormAction} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Template type</label>
                  <select
                    name="template_type"
                    defaultValue="journal_prompt"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  >
                    <option value="journal_prompt">Journal prompt</option>
                    <option value="study_guide_word">Study guide word</option>
                    <option value="study_guide_level">Study guide level</option>
                    <option value="reading_response">Reading response</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Linked resource</label>
                  <select
                    name="resource_id"
                    defaultValue=""
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
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Title</label>
                  <input
                    name="title"
                    required
                    placeholder="e.g. Use 爱 in 3 sentences"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Optional classroom-facing description"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Prompt</label>
                  <textarea
                    name="prompt"
                    rows={3}
                    placeholder="What should students do?"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">HSK level</label>
                    <input
                      name="hsk_level"
                      type="number"
                      min={1}
                      max={6}
                      placeholder="Optional"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Source ref</label>
                    <input
                      name="source_ref"
                      placeholder="Optional word id or source ref"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-foreground/80">
                  <input type="checkbox" name="allow_resubmission" defaultChecked className="h-4 w-4" />
                  Allow resubmission
                </label>
                <PendingSubmitButton pendingLabel="Saving template..." className="bg-primary text-primary-foreground w-full justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90">
                  Save Template
                </PendingSubmitButton>
              </form>
            </TeachingCollectionSection>

          </aside>
        </div>
      </div>
    </div>
  );
}
