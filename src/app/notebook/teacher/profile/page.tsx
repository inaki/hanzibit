import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Globe2, UserRound } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { isTeacherUser } from "@/lib/classrooms";
import { ensureTeacherProfile } from "@/lib/teacher-profiles";
import { updateTeacherProfileAction } from "@/lib/actions";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";

export const dynamic = "force-dynamic";

export default async function TeacherProfilePage() {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  const profile = await ensureTeacherProfile(userId);

  async function updateProfileFormAction(formData: FormData) {
    "use server";
    await updateTeacherProfileAction(formData);
  }

  return (
    <div data-testid="teacher-profile-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Phase 4
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Public Teacher Profile</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Publish the first public-facing profile learners can discover later in the teacher directory.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
            Discovery foundation
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-2xl border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="h-4 w-4 text-[var(--cn-orange)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Profile Editor
              </h2>
            </div>

            <form action={updateProfileFormAction} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Public slug</label>
                <input
                  type="text"
                  name="public_slug"
                  defaultValue={profile.public_slug}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Public URL: <span className="font-medium text-foreground">/teachers/{profile.public_slug}</span>
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Headline</label>
                <input
                  type="text"
                  name="headline"
                  defaultValue={profile.headline ?? ""}
                  placeholder="Mandarin tutor focused on beginner conversation and writing"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Bio</label>
                <textarea
                  name="bio"
                  defaultValue={profile.bio ?? ""}
                  rows={5}
                  placeholder="Tell learners how you teach, who you help most, and what kind of progress they should expect."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Languages spoken</label>
                  <input
                    type="text"
                    name="languages"
                    defaultValue={profile.languages_json.join(", ")}
                    placeholder="English, Spanish, Mandarin"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Specialties</label>
                  <input
                    type="text"
                    name="specialties"
                    defaultValue={profile.specialties_json.join(", ")}
                    placeholder="HSK prep, journaling, conversation"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Levels taught</label>
                  <input
                    type="text"
                    name="levels"
                    defaultValue={profile.levels_json.join(", ")}
                    placeholder="HSK 1, HSK 2, Beginner"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Timezone</label>
                  <input
                    type="text"
                    name="timezone"
                    defaultValue={profile.timezone ?? ""}
                    placeholder="America/Puerto_Rico"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Pricing summary</label>
                  <input
                    type="text"
                    name="pricing_summary"
                    defaultValue={profile.pricing_summary ?? ""}
                    placeholder="$20-$35 / hour"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Years teaching</label>
                  <input
                    type="number"
                    min="0"
                    name="years_experience"
                    defaultValue={profile.years_experience ?? ""}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Availability summary</label>
                <input
                  type="text"
                  name="availability_summary"
                  defaultValue={profile.availability_summary ?? ""}
                  placeholder="Weeknights and weekend mornings"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Teaching style</label>
                <textarea
                  name="teaching_style"
                  defaultValue={profile.teaching_style ?? ""}
                  rows={3}
                  placeholder="Input-heavy, notebook-centered, with short feedback loops and homework."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-4 py-3 text-sm text-foreground">
                <input type="checkbox" name="is_public" defaultChecked={profile.is_public === 1} />
                Make this profile public
              </label>

              <PendingSubmitButton idleLabel="Save public profile" pendingLabel="Saving profile..." />
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Public Preview
                </h2>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current status</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {profile.is_public === 1 ? "Public" : "Private"}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {profile.is_public === 1
                    ? "This profile can be used as the basis for the future teacher discovery directory."
                    : "Save and enable the public toggle when you want learners to see this profile."}
                </p>
              </div>

              <Link
                href={`/teachers/${profile.public_slug}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--cn-orange)] hover:underline"
              >
                Open public profile
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
