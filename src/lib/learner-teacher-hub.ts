import { listAssignmentInboxForUser } from "./assignments";
import { listClassroomsForUser } from "./classrooms";
import { listStudentInquiries } from "./teacher-inquiries";

export type LearnerTeacherHubSummary = {
  classroomCount: number;
  assignmentCount: number;
  pendingAssignmentCount: number;
  inquiryCount: number;
  pendingInquiryCount: number;
  convertedInquiryCount: number;
  hasContext: boolean;
};

export async function getLearnerTeacherHubSummary(
  userId: string
): Promise<LearnerTeacherHubSummary> {
  const [classrooms, assignments, inquiries] = await Promise.all([
    listClassroomsForUser(userId),
    listAssignmentInboxForUser(userId),
    listStudentInquiries(userId),
  ]);

  const learnerClassrooms = classrooms.filter(
    (classroom) => classroom.membership_role === "student"
  );
  const pendingAssignments = assignments.filter(
    (assignment) =>
      !assignment.submission_status ||
      assignment.submission_status === "not_started" ||
      assignment.submission_status === "draft" ||
      assignment.submission_status === "submitted"
  );
  const pendingInquiries = inquiries.filter(
    (inquiry) => inquiry.status === "pending" || inquiry.status === "accepted"
  );
  const convertedInquiries = inquiries.filter(
    (inquiry) => inquiry.status === "converted"
  );

  return {
    classroomCount: learnerClassrooms.length,
    assignmentCount: assignments.length,
    pendingAssignmentCount: pendingAssignments.length,
    inquiryCount: inquiries.length,
    pendingInquiryCount: pendingInquiries.length,
    convertedInquiryCount: convertedInquiries.length,
    hasContext:
      learnerClassrooms.length > 0 ||
      assignments.length > 0 ||
      inquiries.length > 0,
  };
}
