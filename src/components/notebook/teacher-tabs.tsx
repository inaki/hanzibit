"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const teacherTabs = [
  { label: "Overview", href: "/notebook/teacher" },
  { label: "Profile", href: "/notebook/teacher/profile" },
  { label: "Inquiries", href: "/notebook/teacher/inquiries" },
  { label: "Library", href: "/notebook/teacher/library" },
  { label: "Reporting", href: "/notebook/teacher/reporting" },
  { label: "Referrals", href: "/notebook/teacher/referrals" },
];

export function TeacherTabs() {
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
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
