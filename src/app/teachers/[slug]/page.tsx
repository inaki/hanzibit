import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Clock3, Globe2, GraduationCap, Languages, Sparkles } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getTeacherPublicProfileView } from "@/lib/teacher-profiles";
import { createTeacherInquiryAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

function Badge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1 text-xs font-medium text-[var(--cn-orange)]">
      {children}
    </span>
  );
}

export default async function PublicTeacherProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getTeacherPublicProfileView(slug);

  if (!data) {
    notFound();
  }

  const { profile, teacher } = data;
  const session = await auth.api.getSession({ headers: await headers() });

  async function createInquiryFormAction(formData: FormData) {
    "use server";
    await createTeacherInquiryAction(formData);
  }

  return (
    <div data-testid="public-teacher-profile-page" className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border bg-card p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            HanziBit Teacher
          </p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">{teacher.name}</h1>
              <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
                {profile.headline || "Mandarin teacher on HanziBit"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.years_experience ? <Badge>{profile.years_experience}+ years teaching</Badge> : null}
              {profile.timezone ? <Badge>{profile.timezone}</Badge> : null}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <section className="space-y-6">
            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  About This Teacher
                </h2>
              </div>
              <p className="text-sm leading-7 text-foreground/85">
                {profile.bio || "This teacher has not added a public bio yet."}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Teaching Style
                </h2>
              </div>
              <p className="text-sm leading-7 text-foreground/85">
                {profile.teaching_style || "No teaching style summary yet."}
              </p>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border bg-card p-6">
              <div className="space-y-4 text-sm">
                <InfoRow icon={Languages} label="Languages" value={profile.languages_json.join(", ") || "Not specified"} />
                <InfoRow icon={GraduationCap} label="Levels taught" value={profile.levels_json.join(", ") || "Not specified"} />
                <InfoRow icon={Globe2} label="Specialties" value={profile.specialties_json.join(", ") || "Not specified"} />
                <InfoRow icon={Clock3} label="Availability" value={profile.availability_summary || "Not specified"} />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Study With This Teacher
              </h2>
              <p className="mt-3 text-sm text-foreground/85">
                Send a lightweight inquiry first. This keeps the first teacher discovery flow simple before scheduling and marketplace automation.
              </p>
              <div className="mt-4 rounded-xl border bg-card/70 p-4 text-sm text-muted-foreground">
                Pricing: {profile.pricing_summary || "Not specified yet"}
              </div>
              <div className="mt-4 rounded-xl border bg-card p-4">
                {session?.user ? (
                  <form action={createInquiryFormAction} className="space-y-3">
                    <input type="hidden" name="teacher_user_id" value={profile.teacher_user_id} />
                    <input type="hidden" name="public_slug" value={profile.public_slug} />
                    <label className="block text-sm font-medium text-foreground/80">
                      Inquiry message
                      <textarea
                        name="message"
                        rows={4}
                        placeholder="I’m interested in beginner Mandarin support focused on journaling and homework."
                        className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </label>
                    <button
                      type="submit"
                      className="inline-flex rounded-lg bg-[var(--cn-orange)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      Send inquiry
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3 text-sm">
                    <p className="text-foreground/85">
                      Sign in first to send an inquiry and keep the conversation attached to your learner account.
                    </p>
                    <Link
                      href={`/auth/signin?next=/teachers/${profile.public_slug}`}
                      className="inline-flex rounded-lg bg-[var(--cn-orange)] px-4 py-2 font-medium text-white transition hover:opacity-90"
                    >
                      Sign in to inquire
                    </Link>
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link href="/teachers" className="inline-flex text-sm font-medium text-[var(--cn-orange)] hover:underline">
                  Browse teachers
                </Link>
                <Link href="/" className="inline-flex text-sm font-medium text-[var(--cn-orange)] hover:underline">
                  Back to HanziBit
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Languages;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-[var(--cn-orange)]" />
        {label}
      </div>
      <p className="mt-2 text-foreground/85">{value}</p>
    </div>
  );
}
