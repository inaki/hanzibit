"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const teacherTabs = [
  { label: "Overview", href: "/notebook/teacher" },
  { label: "Profile", href: "/notebook/teacher/profile" },
  { label: "Setup", href: "/notebook/teacher/setup" },
  { label: "Inquiries", href: "/notebook/teacher/inquiries" },
  { label: "Private Learners", href: "/notebook/teacher/private-students" },
  { label: "Library", href: "/notebook/teacher/library" },
  { label: "Reporting", href: "/notebook/teacher/reporting" },
  { label: "Referrals", href: "/notebook/teacher/referrals" },
];

export function TeacherTabs({
  badges,
}: {
  badges?: Partial<Record<(typeof teacherTabs)[number]["href"], number>>;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/notebook/teacher") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {teacherTabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            isActive(tab.href)
              ? "border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 text-[var(--cn-orange)]"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {tab.label}
            {(badges?.[tab.href] ?? 0) > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--cn-orange)] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {badges?.[tab.href]}
              </span>
            ) : null}
          </span>
        </Link>
      ))}
    </div>
  );
}
