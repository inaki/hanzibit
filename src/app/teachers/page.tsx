import Link from "next/link";
import { Globe2, GraduationCap, Search, Sparkles } from "lucide-react";
import {
  getTeacherProfileCompleteness,
  listPublicTeacherProfiles,
} from "@/lib/teacher-profiles";

export const dynamic = "force-dynamic";

function matchesText(haystack: string | null | undefined, needle: string) {
  return (haystack || "").toLowerCase().includes(needle.toLowerCase());
}

export default async function TeachersDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    specialty?: string;
    level?: string;
    timezone?: string;
    language?: string;
  }>;
}) {
  const query = await searchParams;
  const profiles = await listPublicTeacherProfiles();

  const q = (query.q || "").trim();
  const specialty = (query.specialty || "").trim();
  const level = (query.level || "").trim();
  const timezone = (query.timezone || "").trim();
  const language = (query.language || "").trim();

  const filtered = profiles.filter((profile) => {
    if (q) {
      const searchable = [
        profile.teacher_name,
        profile.headline,
        profile.bio,
        profile.teaching_style,
        profile.pricing_summary,
        profile.availability_summary,
        profile.specialties_json.join(" "),
        profile.languages_json.join(" "),
        profile.levels_json.join(" "),
      ].join(" ");

      if (!matchesText(searchable, q)) {
        return false;
      }
    }

    if (specialty && !profile.specialties_json.some((value) => matchesText(value, specialty))) {
      return false;
    }

    if (level && !profile.levels_json.some((value) => matchesText(value, level))) {
      return false;
    }

    if (timezone && !matchesText(profile.timezone, timezone)) {
      return false;
    }

    if (language && !profile.languages_json.some((value) => matchesText(value, language))) {
      return false;
    }

    return true;
  });

  const specialties = Array.from(
    new Set(profiles.flatMap((profile) => profile.specialties_json))
  ).slice(0, 8);
  const levels = Array.from(new Set(profiles.flatMap((profile) => profile.levels_json))).slice(0, 8);

  return (
    <div data-testid="teachers-directory-page" className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Phase 4
          </p>
          <h1 className="mt-2 text-4xl font-bold text-foreground">Find a Teacher</h1>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground">
            Browse public HanziBit teachers by specialty, level, language, and timezone. This first version is profile-first and intentionally lightweight.
          </p>
        </div>

        <section className="rounded-2xl border bg-card p-5">
          <form className="grid gap-3 md:grid-cols-5">
            <label className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search teachers, styles, specialties..."
                className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm"
              />
            </label>
            <input
              type="text"
              name="language"
              defaultValue={language}
              placeholder="Language"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="level"
              defaultValue={level}
              placeholder="Level"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="timezone"
              defaultValue={timezone}
              placeholder="Timezone"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-[var(--cn-orange)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--cn-orange-dark)] md:col-span-5 md:w-fit"
            >
              Apply filters
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {specialties.map((item) => (
              <Link
                key={item}
                href={`/teachers?specialty=${encodeURIComponent(item)}`}
                className="rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]"
              >
                {item}
              </Link>
            ))}
            {levels.map((item) => (
              <Link
                key={item}
                href={`/teachers?level=${encodeURIComponent(item)}`}
                className="rounded-full border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {item}
              </Link>
            ))}
          </div>
        </section>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-8 text-sm text-muted-foreground">
            No teachers matched these filters yet.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((profile) => (
              (() => {
                const completeness = getTeacherProfileCompleteness(profile);
                return (
                  <Link
                    key={profile.id}
                    href={`/teachers/${profile.public_slug}`}
                    className="block rounded-2xl border bg-card p-6 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">{profile.teacher_name}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {profile.headline || "Mandarin teacher on HanziBit"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {profile.years_experience ? (
                          <span className="rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1 text-xs font-medium text-[var(--cn-orange)]">
                            {profile.years_experience}+ yrs
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            completeness.isReadyForDiscovery
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {completeness.percent}% complete
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 text-sm text-foreground/85">
                      <InfoRow icon={Globe2} label="Specialties" value={profile.specialties_json.join(", ") || "Not specified"} />
                      <InfoRow icon={GraduationCap} label="Levels" value={profile.levels_json.join(", ") || "Not specified"} />
                      <InfoRow icon={Sparkles} label="Languages" value={profile.languages_json.join(", ") || "Not specified"} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {profile.timezone ? <span>{profile.timezone}</span> : null}
                      {profile.pricing_summary ? <span>{profile.pricing_summary}</span> : null}
                      {profile.availability_summary ? <span>{profile.availability_summary}</span> : null}
                    </div>
                  </Link>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-start gap-2">
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--cn-orange)]" />
        <p>{value}</p>
      </div>
    </div>
  );
}
