import Link from "next/link";
import { redirect } from "next/navigation";
import { BookCopy, ClipboardList, FolderKanban, Plus, Sparkles } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import {
  createAssignmentTemplateAction,
  createTeacherResourceAction,
} from "@/lib/actions";
import { listOwnedClassrooms, isTeacherUser } from "@/lib/classrooms";
import { listAssignmentTemplatesForTeacher } from "@/lib/assignment-templates";
import { listTeacherResourcesForUser } from "@/lib/teacher-resources";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";

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

  const [resources, templates, classrooms] = await Promise.all([
    listTeacherResourcesForUser(userId, {
      resourceType: typeof query.resourceType === "string" && query.resourceType !== "all"
        ? (query.resourceType as Parameters<typeof listTeacherResourcesForUser>[1]["resourceType"])
        : undefined,
    }),
    listAssignmentTemplatesForTeacher(userId),
    listOwnedClassrooms(userId),
  ]);

  async function createResourceFormAction(formData: FormData) {
    "use server";
    await createTeacherResourceAction(formData);
  }

  async function createTemplateFormAction(formData: FormData) {
    "use server";
    await createAssignmentTemplateAction(formData);
  }

  return (
    <div data-testid="teacher-library-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Phase 3
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Teacher Library</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Save reusable teaching resources and assignment templates so classroom setup is no longer scratch-first.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
            Teacher-only surface
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Resources</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{resources.length}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Templates</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{templates.length}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Your Classrooms</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{classrooms.length}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <section className="space-y-6">
            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Saved Resources
                </h2>
              </div>
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
                    <div key={resource.id} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{resource.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {resource.description || "No description"}
                          </p>
                        </div>
                        <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          {resource.resource_type.replaceAll("_", " ")}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {resource.hsk_level ? <span>HSK {resource.hsk_level}</span> : null}
                        <span>Updated {new Date(resource.updated_at).toLocaleDateString("en-US")}</span>
                      </div>
                      <div className="mt-4">
                        <Link
                          href={`/notebook/teacher/library/resources/${resource.id}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--cn-orange)] hover:underline"
                        >
                          Edit resource
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Assignment Templates
                </h2>
              </div>
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
                    <div key={template.id} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{template.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {template.description || template.prompt || "No template description"}
                          </p>
                        </div>
                        <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          {template.template_type.replaceAll("_", " ")}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {template.hsk_level ? <span>HSK {template.hsk_level}</span> : null}
                        <span>{template.allow_resubmission ? "Resubmission allowed" : "Resubmission locked"}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Link
                          href={`/notebook/teacher/library/templates/${template.id}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--cn-orange)] hover:underline"
                        >
                          Edit template
                        </Link>
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Create Resource
                </h2>
              </div>
              <form action={createResourceFormAction} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Type</label>
                  <select
                    name="resource_type"
                    defaultValue="journal_prompt"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
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
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="How will you reuse this resource?"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
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
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                  />
                </div>
                <PendingSubmitButton pendingLabel="Saving resource..." className="w-full justify-center rounded-lg bg-[var(--cn-orange)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--cn-orange-dark)]">
                  Save Resource
                </PendingSubmitButton>
              </form>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <BookCopy className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Create Template
                </h2>
              </div>
              <form action={createTemplateFormAction} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Template type</label>
                  <select
                    name="template_type"
                    defaultValue="journal_prompt"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
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
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Title</label>
                  <input
                    name="title"
                    required
                    placeholder="e.g. Use 爱 in 3 sentences"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Optional classroom-facing description"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Prompt</label>
                  <textarea
                    name="prompt"
                    rows={3}
                    placeholder="What should students do?"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
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
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Source ref</label>
                    <input
                      name="source_ref"
                      placeholder="Optional word id or source ref"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-foreground/80">
                  <input type="checkbox" name="allow_resubmission" defaultChecked className="h-4 w-4" />
                  Allow resubmission
                </label>
                <PendingSubmitButton pendingLabel="Saving template..." className="w-full justify-center rounded-lg bg-[var(--cn-orange)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--cn-orange-dark)]">
                  Save Template
                </PendingSubmitButton>
              </form>
            </section>

          </aside>
        </div>
      </div>
    </div>
  );
}
