import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth-utils";
import { isTeacherUser } from "@/lib/classrooms";
import { TeacherTabs } from "@/components/notebook/teacher-tabs";

export default async function TeacherLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-20 border-b bg-card/95 px-6 py-4 backdrop-blur md:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Teaching
          </p>
          <TeacherTabs />
        </div>
      </div>
      {children}
    </div>
  );
}
