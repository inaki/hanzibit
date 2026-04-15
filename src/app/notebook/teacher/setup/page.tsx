import { redirect } from "next/navigation";
import { Settings2 } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { isTeacherUser } from "@/lib/classrooms";
import { listAssignmentTemplatesForTeacher } from "@/lib/assignment-templates";
import {
  ensureTeacherTutoringSettings,
  getCadenceLabel,
} from "@/lib/teacher-tutoring-settings";
import { updateTeacherTutoringSettingsAction } from "@/lib/actions";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";

export const dynamic = "force-dynamic";

export default async function TeacherSetupPage() {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  const [settings, templates] = await Promise.all([
    ensureTeacherTutoringSettings(userId),
    listAssignmentTemplatesForTeacher(userId),
  ]);

  async function updateSetupFormAction(formData: FormData) {
    "use server";
    await updateTeacherTutoringSettingsAction(formData);
  }

  return (
    <div data-testid="teacher-setup-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Setup</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Define the defaults that should shape private teacher-student relationships after an inquiry is converted.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
            Private teaching defaults
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-2xl border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-[var(--cn-orange)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Tutoring Setup
              </h2>
            </div>

            <form action={updateSetupFormAction} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Intro message</label>
                <textarea
                  name="intro_message"
                  rows={4}
                  defaultValue={settings.intro_message ?? ""}
                  placeholder="Welcome. We’ll use HanziBit as the shared notebook and homework space for this tutoring relationship."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Default private classroom prefix</label>
                <input
                  type="text"
                  name="default_private_classroom_prefix"
                  defaultValue={settings.default_private_classroom_prefix ?? ""}
                  placeholder="Private Mandarin with"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Cadence type</label>
                  <select
                    name="cadence_type"
                    defaultValue={settings.cadence_type ?? ""}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">No default cadence</option>
                    <option value="weekly">Weekly</option>
                    <option value="twice_weekly">Twice weekly</option>
                    <option value="flexible">Flexible</option>
                    <option value="async_support">Async support</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Target session length (minutes)</label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    step={15}
                    name="target_session_length_minutes"
                    defaultValue={settings.target_session_length_minutes ?? ""}
                    placeholder="60"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Cadence notes</label>
                <textarea
                  name="cadence_notes"
                  rows={3}
                  defaultValue={settings.cadence_notes ?? ""}
                  placeholder="Short note about how often you usually check in, what a normal lesson rhythm looks like, or how async support works."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Default onboarding template</label>
                <select
                  name="default_template_id"
                  defaultValue={settings.default_template_id ?? ""}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="">No default template</option>
                  {templates
                    .filter((template) => template.archived === 0)
                    .map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  This template can later be attached during inquiry conversion as the first assignment.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Format notes</label>
                <textarea
                  name="format_notes"
                  rows={4}
                  defaultValue={settings.format_notes ?? ""}
                  placeholder="Short note about how you typically structure tutoring: homework style, journaling expectations, class rhythm, or HSK focus."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <PendingSubmitButton idleLabel="Save tutoring setup" pendingLabel="Saving setup..." />
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                What this controls
              </h2>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Your setup defines the defaults you want to reuse when a learner becomes a private student.</p>
                <p>Cadence defaults describe how private tutoring usually runs without turning HanziBit into a calendar tool.</p>
                <p>These defaults do not schedule lessons automatically. They establish the rhythm and expectations that later private learner planning can reuse.</p>
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Current Defaults
              </h2>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Cadence:</span>{" "}
                  {getCadenceLabel(settings.cadence_type)}
                </p>
                <p>
                  <span className="font-medium text-foreground">Target session length:</span>{" "}
                  {settings.target_session_length_minutes
                    ? `${settings.target_session_length_minutes} minutes`
                    : "Not set"}
                </p>
                <p>
                  <span className="font-medium text-foreground">Onboarding template:</span>{" "}
                  {settings.default_template_id
                    ? templates.find((template) => template.id === settings.default_template_id)?.title ?? "Saved template"
                    : "Not set"}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
