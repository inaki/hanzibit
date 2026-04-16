import { redirect } from "next/navigation";
import { LearnerTeacherTabs } from "@/components/notebook/learner-teacher-tabs";
import { getAuthUserId } from "@/lib/auth-utils";
import { isTeacherUser } from "@/lib/classrooms";
import { getLearnerTeacherHubSummary } from "@/lib/learner-teacher-hub";

export default async function LearnerTeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getAuthUserId();
  const [isTeacher, summary] = await Promise.all([
    isTeacherUser(userId),
    getLearnerTeacherHubSummary(userId),
  ]);

  if (isTeacher || !summary.hasContext) {
    redirect("/notebook/dashboard");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="px-6 pb-3 pt-6 md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Learning with a teacher
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Teacher</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Keep inquiries, classes, and assignments together in one place without cluttering the notebook for solo study.
          </p>
        </div>
        <LearnerTeacherTabs
          badges={{
            "/notebook/with-teacher/assignments":
              summary.pendingAssignmentCount,
            "/notebook/with-teacher/inquiries": summary.pendingInquiryCount,
          }}
        />
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
