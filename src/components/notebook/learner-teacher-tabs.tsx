"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const learnerTeacherTabs = [
  { label: "Overview", href: "/notebook/with-teacher" },
  { label: "Classes", href: "/notebook/with-teacher/classes" },
  { label: "Assignments", href: "/notebook/with-teacher/assignments" },
  { label: "Inquiries", href: "/notebook/with-teacher/inquiries" },
] as const;

export function LearnerTeacherTabs({
  badges,
}: {
  badges?: Partial<Record<(typeof learnerTeacherTabs)[number]["href"], number>>;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/notebook/with-teacher") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  }

  return (
    <nav
      data-testid="learner-teacher-tabs"
      className="flex flex-wrap gap-2 px-6 py-3 md:px-10"
    >
      {learnerTeacherTabs.map((tab) => {
        const active = isActive(tab.href);
        const badge = badges?.[tab.href] ?? 0;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              active
                ? "ui-tone-orange-panel ui-tone-orange-text font-medium"
                : "border-border bg-card text-muted-foreground hover:border-[var(--ui-tone-orange-border)] hover:text-foreground"
            }`}
          >
            {tab.label}
            {badge > 0 ? (
              <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
