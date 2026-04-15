import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth-utils";
import { isTeacherUser } from "@/lib/classrooms";
import { TeacherTabs } from "@/components/notebook/teacher-tabs";
import { listTeacherInquiries } from "@/lib/teacher-inquiries";
import { getTeacherReportingDashboard } from "@/lib/teacher-reporting";
import { getTeacherReferralDashboard } from "@/lib/referrals";
import { listPrivateStudentsForTeacher } from "@/lib/private-students";

export default async function TeacherLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  const [inquiries, reporting, referrals, privateStudents] = await Promise.all([
    listTeacherInquiries(userId),
    getTeacherReportingDashboard(userId),
    getTeacherReferralDashboard(userId),
    listPrivateStudentsForTeacher(userId),
  ]);

  const pendingInquiryCount = inquiries.filter((item) => item.status === "pending").length;
  const reportingAttentionCount =
    reporting.totalWaitingReview + reporting.totalMissingSubmissions;
  const referralAttentionCount = referrals.pendingCommissionCents > 0 ? 1 : 0;
  const privateLearnerAttentionCount = privateStudents.filter(
    (item) =>
      item.status === "awaiting_teacher" ||
      item.status === "inactive" ||
      item.awaiting_review_count > 0
  ).length;

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-20 border-b bg-card/95 px-6 py-4 backdrop-blur md:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Teaching
          </p>
          <TeacherTabs
            badges={{
              "/notebook/teacher/inquiries": pendingInquiryCount,
              "/notebook/teacher/private-students": privateLearnerAttentionCount,
              "/notebook/teacher/reporting": reportingAttentionCount,
              "/notebook/teacher/referrals": referralAttentionCount,
            }}
          />
        </div>
      </div>
      {children}
    </div>
  );
}
