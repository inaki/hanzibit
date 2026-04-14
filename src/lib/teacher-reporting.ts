import { listAssignmentsForClassroom } from "./assignments";
import {
  getClassroom,
  listOwnedClassrooms,
  getClassroomRoster,
  type Classroom,
} from "./classrooms";
import {
  listClassroomAssignmentSummaries,
  listClassroomSubmissionStudentRows,
} from "./submissions";

export interface TeacherReportingClassroomSummary {
  classroom: Classroom;
  student_count: number;
  assignment_count: number;
  submitted_count: number;
  reviewed_count: number;
  needs_review_count: number;
  missing_submission_count: number;
}

export interface TeacherReportingAttentionItem {
  classroom_id: string;
  classroom_name: string;
  assignment_id: string;
  assignment_title: string;
  due_at: string | null;
  waiting_review_count: number;
  missing_submission_count: number;
}

export interface TeacherReportingDashboard {
  classroomSummaries: TeacherReportingClassroomSummary[];
  attentionItems: TeacherReportingAttentionItem[];
  studentAttention: TeacherReportingStudentAttention[];
  totalClassrooms: number;
  totalStudents: number;
  totalAssignments: number;
  totalWaitingReview: number;
  totalMissingSubmissions: number;
}

export interface TeacherReportingStudentAttention {
  classroom_id: string;
  classroom_name: string;
  student_user_id: string;
  student_name: string;
  student_email: string;
  assignment_count: number;
  submitted_count: number;
  reviewed_count: number;
  missing_count: number;
  awaiting_review_count: number;
  last_submitted_at: string | null;
}

export interface TeacherReportingClassroomDetail {
  classroom: Classroom;
  summary: TeacherReportingClassroomSummary;
  assignmentAttention: TeacherReportingAttentionItem[];
  students: TeacherReportingStudentAttention[];
}

export interface TeacherReportingStudentDetail {
  classroom: Classroom;
  student: TeacherReportingStudentAttention;
  assignmentRows: Array<{
    assignment_id: string;
    assignment_title: string;
    due_at: string | null;
    status: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
  }>;
}

export async function getTeacherReportingDashboard(
  teacherUserId: string
): Promise<TeacherReportingDashboard> {
  const classrooms = await listOwnedClassrooms(teacherUserId);

  const perClassroom = await Promise.all(
    classrooms.map(async (classroom) => {
      const [roster, assignments, summaries, submissionRows] = await Promise.all([
        getClassroomRoster(classroom.id),
        listAssignmentsForClassroom(classroom.id),
        listClassroomAssignmentSummaries(classroom.id),
        listClassroomSubmissionStudentRows(classroom.id),
      ]);

      const studentCount = roster.filter((member) => member.role === "student").length;
      const summaryByAssignmentId = new Map(
        summaries.map((summary) => [summary.assignment_id, summary])
      );

      const assignmentCount = assignments.length;
      const submittedCount = summaries.reduce((sum, item) => sum + item.submitted_count, 0);
      const reviewedCount = summaries.reduce((sum, item) => sum + item.reviewed_count, 0);
      const needsReviewCount = summaries.reduce((sum, item) => sum + item.needs_review_count, 0);

      const attentionItems = assignments
        .map((assignment) => {
          const summary = summaryByAssignmentId.get(assignment.id);
          const totalSubmissions = summary?.total_submissions ?? 0;
          const missingSubmissionCount = Math.max(studentCount - totalSubmissions, 0);
          const waitingReviewCount = summary?.needs_review_count ?? 0;

          return {
            classroom_id: classroom.id,
            classroom_name: classroom.name,
            assignment_id: assignment.id,
            assignment_title: assignment.title,
            due_at: assignment.due_at,
            waiting_review_count: waitingReviewCount,
            missing_submission_count: missingSubmissionCount,
          } satisfies TeacherReportingAttentionItem;
        })
        .filter((item) => item.waiting_review_count > 0 || item.missing_submission_count > 0);

      const studentAttention = Array.from(
        submissionRows.reduce((map, row) => {
          const existing = map.get(row.student_user_id) ?? {
            classroom_id: classroom.id,
            classroom_name: classroom.name,
            student_user_id: row.student_user_id,
            student_name: row.student_name,
            student_email: row.student_email,
            assignment_count: assignments.length,
            submitted_count: 0,
            reviewed_count: 0,
            missing_count: 0,
            awaiting_review_count: 0,
            last_submitted_at: null,
          };

          if (!row.status) {
            existing.missing_count += 1;
          } else if (row.status === "reviewed") {
            existing.reviewed_count += 1;
          } else if (row.status === "submitted") {
            existing.submitted_count += 1;
            existing.awaiting_review_count += 1;
          } else {
            existing.submitted_count += 1;
          }

          if (row.submitted_at && (!existing.last_submitted_at || row.submitted_at > existing.last_submitted_at)) {
            existing.last_submitted_at = row.submitted_at;
          }

          map.set(row.student_user_id, existing);
          return map;
        }, new Map<string, TeacherReportingStudentAttention>())
      )
        .map(([, value]) => value)
        .filter((student) => student.missing_count > 0 || student.awaiting_review_count > 0)
        .sort((a, b) => {
          if (b.missing_count !== a.missing_count) return b.missing_count - a.missing_count;
          if (b.awaiting_review_count !== a.awaiting_review_count) return b.awaiting_review_count - a.awaiting_review_count;
          return a.student_name.localeCompare(b.student_name);
        });

      return {
        classroomSummary: {
          classroom,
          student_count: studentCount,
          assignment_count: assignmentCount,
          submitted_count: submittedCount,
          reviewed_count: reviewedCount,
          needs_review_count: needsReviewCount,
          missing_submission_count: attentionItems.reduce(
            (sum, item) => sum + item.missing_submission_count,
            0
          ),
        } satisfies TeacherReportingClassroomSummary,
        attentionItems,
        studentAttention,
      };
    })
  );

  const classroomSummaries = perClassroom.map((item) => item.classroomSummary);
  const attentionItems = perClassroom
    .flatMap((item) => item.attentionItems)
    .sort((a, b) => {
      const aDue = a.due_at ? new Date(a.due_at).getTime() : Number.POSITIVE_INFINITY;
      const bDue = b.due_at ? new Date(b.due_at).getTime() : Number.POSITIVE_INFINITY;
      return aDue - bDue;
    });
  const studentAttention = perClassroom
    .flatMap((item) => item.studentAttention)
    .sort((a, b) => {
      if (b.missing_count !== a.missing_count) return b.missing_count - a.missing_count;
      if (b.awaiting_review_count !== a.awaiting_review_count) return b.awaiting_review_count - a.awaiting_review_count;
      return a.student_name.localeCompare(b.student_name);
    });

  return {
    classroomSummaries,
    attentionItems,
    studentAttention,
    totalClassrooms: classroomSummaries.length,
    totalStudents: classroomSummaries.reduce((sum, item) => sum + item.student_count, 0),
    totalAssignments: classroomSummaries.reduce((sum, item) => sum + item.assignment_count, 0),
    totalWaitingReview: classroomSummaries.reduce((sum, item) => sum + item.needs_review_count, 0),
    totalMissingSubmissions: classroomSummaries.reduce(
      (sum, item) => sum + item.missing_submission_count,
      0
    ),
  };
}

export async function getTeacherClassroomReporting(
  teacherUserId: string,
  classroomId: string
): Promise<TeacherReportingClassroomDetail | null> {
  const classroom = await getClassroom(classroomId);
  if (!classroom || classroom.teacher_user_id !== teacherUserId) {
    return null;
  }

  const [roster, assignments, summaries, submissionRows] = await Promise.all([
    getClassroomRoster(classroom.id),
    listAssignmentsForClassroom(classroom.id),
    listClassroomAssignmentSummaries(classroom.id),
    listClassroomSubmissionStudentRows(classroom.id),
  ]);

  const studentCount = roster.filter((member) => member.role === "student").length;
  const summaryByAssignmentId = new Map(
    summaries.map((summary) => [summary.assignment_id, summary])
  );

  const assignmentAttention = assignments
    .map((assignment) => {
      const summary = summaryByAssignmentId.get(assignment.id);
      const totalSubmissions = summary?.total_submissions ?? 0;
      const missingSubmissionCount = Math.max(studentCount - totalSubmissions, 0);
      const waitingReviewCount = summary?.needs_review_count ?? 0;

      return {
        classroom_id: classroom.id,
        classroom_name: classroom.name,
        assignment_id: assignment.id,
        assignment_title: assignment.title,
        due_at: assignment.due_at,
        waiting_review_count: waitingReviewCount,
        missing_submission_count: missingSubmissionCount,
      } satisfies TeacherReportingAttentionItem;
    })
    .sort((a, b) => {
      const aDue = a.due_at ? new Date(a.due_at).getTime() : Number.POSITIVE_INFINITY;
      const bDue = b.due_at ? new Date(b.due_at).getTime() : Number.POSITIVE_INFINITY;
      return aDue - bDue;
    });

  const students = Array.from(
    submissionRows.reduce((map, row) => {
      const existing = map.get(row.student_user_id) ?? {
        classroom_id: classroom.id,
        classroom_name: classroom.name,
        student_user_id: row.student_user_id,
        student_name: row.student_name,
        student_email: row.student_email,
        assignment_count: assignments.length,
        submitted_count: 0,
        reviewed_count: 0,
        missing_count: 0,
        awaiting_review_count: 0,
        last_submitted_at: null,
      };

      if (!row.status) {
        existing.missing_count += 1;
      } else if (row.status === "reviewed") {
        existing.reviewed_count += 1;
      } else if (row.status === "submitted") {
        existing.submitted_count += 1;
        existing.awaiting_review_count += 1;
      } else {
        existing.submitted_count += 1;
      }

      if (row.submitted_at && (!existing.last_submitted_at || row.submitted_at > existing.last_submitted_at)) {
        existing.last_submitted_at = row.submitted_at;
      }

      map.set(row.student_user_id, existing);
      return map;
    }, new Map<string, TeacherReportingStudentAttention>())
  )
    .map(([, value]) => value)
    .sort((a, b) => {
      if (b.missing_count !== a.missing_count) return b.missing_count - a.missing_count;
      if (b.awaiting_review_count !== a.awaiting_review_count) return b.awaiting_review_count - a.awaiting_review_count;
      return a.student_name.localeCompare(b.student_name);
    });

  return {
    classroom,
    summary: {
      classroom,
      student_count: studentCount,
      assignment_count: assignments.length,
      submitted_count: summaries.reduce((sum, item) => sum + item.submitted_count, 0),
      reviewed_count: summaries.reduce((sum, item) => sum + item.reviewed_count, 0),
      needs_review_count: summaries.reduce((sum, item) => sum + item.needs_review_count, 0),
      missing_submission_count: assignmentAttention.reduce(
        (sum, item) => sum + item.missing_submission_count,
        0
      ),
    },
    assignmentAttention,
    students,
  };
}

export async function getTeacherStudentReporting(
  teacherUserId: string,
  classroomId: string,
  studentUserId: string
): Promise<TeacherReportingStudentDetail | null> {
  const classroomDetail = await getTeacherClassroomReporting(teacherUserId, classroomId);
  if (!classroomDetail) {
    return null;
  }

  const student = classroomDetail.students.find((item) => item.student_user_id === studentUserId);
  if (!student) {
    return null;
  }

  const [assignments, submissionRows] = await Promise.all([
    listAssignmentsForClassroom(classroomId),
    listClassroomSubmissionStudentRows(classroomId),
  ]);

  const rowByAssignmentId = new Map(
    submissionRows
      .filter((row) => row.student_user_id === studentUserId)
      .map((row) => [row.assignment_id, row])
  );

  const assignmentRows = assignments.map((assignment) => {
    const row = rowByAssignmentId.get(assignment.id);
    return {
      assignment_id: assignment.id,
      assignment_title: assignment.title,
      due_at: assignment.due_at,
      status: row?.status ?? null,
      submitted_at: row?.submitted_at ?? null,
      reviewed_at: row?.reviewed_at ?? null,
    };
  });

  return {
    classroom: classroomDetail.classroom,
    student,
    assignmentRows,
  };
}
