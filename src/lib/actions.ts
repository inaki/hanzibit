"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { execute, queryOne } from "./db";
import { getAuthUserId } from "./auth-utils";
import {
  getCharacterOfTheDay,
  getDueFlashcardCount,
  getOwnedFlashcard,
  getOwnedJournalEntry,
  getUserProgress,
  getStudyGuideData,
  getUserStreak,
  getUserStats,
  getWeakFlashcards,
  updateFlashcardReview,
  addReviewRecord,
  searchHskWords,
  searchCedictWords,
  type Flashcard,
  type HskWord,
  type StudyGuideData,
} from "./data";
import type { AnnotationLookupEntry } from "./annotation-suggestions";
import { canReviewFlashcard, canAccessHskLevel } from "./gates";
import { sm2 } from "./sm2";
import { validateInlineMarkup } from "./parse-tokens";
import type { DailyPracticePlan } from "./daily-practice";
import { getDailyPracticePlanForUser } from "./daily-practice-service";
import {
  createClassroom as createClassroomRecord,
  joinClassroom as joinClassroomRecord,
  isTeacherUser,
} from "./classrooms";
import { createAssignment as createAssignmentRecord, type AssignmentType } from "./assignments";
import {
  canManageAssignmentTemplate,
  canManageClassroom,
  canConvertInquiryToClassroom,
  canRespondToTeacherInquiry,
  canSubmitAssignment,
  canUseTemplateInClassroom,
  canReviewSubmission,
  canViewReferralDashboard,
} from "./classroom-permissions";
import { addSubmissionFeedback, markSubmissionReviewed, upsertSubmission } from "./submissions";
import {
  createTeacherResource,
  listTeacherResourcesForUser,
  type TeacherResourceType,
  updateTeacherResource,
} from "./teacher-resources";
import {
  createAssignmentTemplate,
  getAssignmentTemplate,
  markAssignmentCreatedFromTemplate,
  updateAssignmentTemplate,
} from "./assignment-templates";
import { getAssignment } from "./assignments";
import {
  createTeacherPayoutBatch,
  ensureReferralAttribution,
  overrideReferralAttribution,
} from "./referrals";
import { parseList, updateTeacherProfile } from "./teacher-profiles";
import {
  convertInquiryToClassroom,
  createTeacherInquiry,
  respondToTeacherInquiry,
} from "./teacher-inquiries";

export async function toggleBookmarkAction(entryId: string) {
  const userId = await getAuthUserId();
  const entry = await getOwnedJournalEntry(userId, entryId);
  if (!entry) return;

  const newValue = entry.bookmarked ? 0 : 1;
  await execute(
    "UPDATE journal_entries SET bookmarked = $1 WHERE id = $2",
    [newValue, entryId]
  );

  revalidatePath("/notebook");
  return { bookmarked: newValue === 1 };
}

export async function createJournalEntry(formData: FormData) {
  const userId = await getAuthUserId();
  const id = randomUUID();
  const titleZh = formData.get("title_zh") as string;
  const titleEn = formData.get("title_en") as string;
  const contentZh = formData.get("content_zh") as string;
  const unit = (formData.get("unit") as string) || null;
  const hskLevel = parseInt((formData.get("hsk_level") as string) || "1", 10);
  const sourceType = (formData.get("source_type") as string) || null;
  const sourceRef = (formData.get("source_ref") as string) || null;
  const sourcePrompt = (formData.get("source_prompt") as string) || null;
  const assignmentId = ((formData.get("assignment_id") as string) || "").trim();

  if (!titleZh || !titleEn || !contentZh) {
    return { error: "Title and content are required." };
  }

  const markupIssues = validateInlineMarkup(contentZh);
  if (markupIssues.length > 0) {
    return { error: markupIssues[0].message };
  }

  await execute(
    `INSERT INTO journal_entries (
       id,
       user_id,
       title_zh,
       title_en,
       unit,
       hsk_level,
       content_zh,
       source_type,
       source_ref,
       source_prompt
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, userId, titleZh, titleEn, unit, hskLevel, contentZh, sourceType, sourceRef, sourcePrompt]
  );

  if (assignmentId && (await canSubmitAssignment(userId, assignmentId))) {
    await upsertSubmission({
      assignmentId,
      studentUserId: userId,
      journalEntryId: id,
      status: "submitted",
    });
    revalidatePath("/notebook/assignments");
    revalidatePath(`/notebook/assignments/${assignmentId}`);
  }

  revalidatePath("/notebook");
  return { id };
}

export async function updateJournalEntry(formData: FormData) {
  const userId = await getAuthUserId();
  const id = formData.get("id") as string;
  const titleZh = formData.get("title_zh") as string;
  const titleEn = formData.get("title_en") as string;
  const contentZh = formData.get("content_zh") as string;
  const unit = (formData.get("unit") as string) || null;
  const hskLevel = parseInt((formData.get("hsk_level") as string) || "1", 10);

  if (!id || !titleZh || !titleEn || !contentZh) {
    return { error: "All fields are required." };
  }

  const markupIssues = validateInlineMarkup(contentZh);
  if (markupIssues.length > 0) {
    return { error: markupIssues[0].message };
  }

  const existing = await getOwnedJournalEntry(userId, id);
  if (!existing) {
    return { error: "Entry not found." };
  }

  await execute(
    `UPDATE journal_entries
     SET title_zh = $1,
         title_en = $2,
         content_zh = $3,
         unit = $4,
         hsk_level = $5,
         updated_at = NOW()
     WHERE id = $6`,
    [titleZh, titleEn, contentZh, unit, hskLevel, id]
  );

  revalidatePath("/notebook");
  return { id };
}

export async function deleteJournalEntry(entryId: string): Promise<{ success: true } | { error: string }> {
  if (!entryId) {
    return { error: "Entry ID is required." };
  }

  const userId = await getAuthUserId();
  const existing = await getOwnedJournalEntry(userId, entryId);
  if (!existing) {
    return { error: "Entry not found." };
  }

  await execute("DELETE FROM journal_entries WHERE id = $1", [entryId]);
  revalidatePath("/notebook");
  revalidatePath("/notebook/dashboard");
  return { success: true };
}

export async function getCharacterOfTheDayAction(
  level: number
): Promise<HskWord | null> {
  return getCharacterOfTheDay(level);
}

export async function saveFlashcardsFromEntry(
  entryId: string,
  cards: { front: string; back: string }[]
): Promise<{ saved: number; duplicates: number }> {
  const userId = await getAuthUserId();
  const sourceEntry = await getOwnedJournalEntry(userId, entryId);
  if (!sourceEntry) {
    throw new Error("Entry not found");
  }

  let saved = 0;
  let duplicates = 0;

  for (const card of cards) {
    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM flashcards WHERE user_id = $1 AND front = $2",
      [userId, card.front]
    );

    if (existing) {
      duplicates++;
      continue;
    }

    await execute(
      `INSERT INTO flashcards (id, user_id, front, back, deck, source_entry_id)
       VALUES ($1, $2, $3, $4, 'journal', $5)`,
      [randomUUID(), userId, card.front, card.back, entryId]
    );
    saved++;
  }

  revalidatePath("/notebook/flashcards");
  return { saved, duplicates };
}

export async function reviewFlashcard(
  cardId: string,
  quality: number
): Promise<{ interval: number; easeFactor: number } | { error: "DAILY_LIMIT_REACHED" }> {
  const userId = await getAuthUserId();

  if (!(await canReviewFlashcard(userId))) {
    return { error: "DAILY_LIMIT_REACHED" };
  }

  const card = await getOwnedFlashcard(userId, cardId);
  if (!card) throw new Error("Card not found");

  const { interval, easeFactor } = sm2(
    quality,
    card.interval_days,
    card.ease_factor,
    card.review_count
  );

  await updateFlashcardReview(card.id, interval, easeFactor);
  await addReviewRecord(userId, "flashcard", card.id, card.front, quality);

  revalidatePath("/notebook/flashcards");
  return { interval, easeFactor };
}

export async function getDueCountAction(): Promise<number> {
  const userId = await getAuthUserId();
  return getDueFlashcardCount(userId);
}

export async function isTeacherUserAction(): Promise<boolean> {
  const userId = await getAuthUserId();
  return isTeacherUser(userId);
}

export async function getDailyPracticeAction(level: number): Promise<DailyPracticePlan> {
  const userId = await getAuthUserId();
  return getDailyPracticePlanForUser(userId, level);
}

export async function getProgressAction(
  level: number
): Promise<{ encountered: number; total: number; percent: number }> {
  const userId = await getAuthUserId();
  return getUserProgress(userId, level);
}

export async function getStudyGuideDataAction(
  level: number
): Promise<StudyGuideData> {
  const userId = await getAuthUserId();
  if (!(await canAccessHskLevel(userId, level))) {
    return {
      level,
      locked: true,
      words: [],
      grammarPoints: [],
      summary: { total: 0, encountered: 0, withFlashcard: 0, dueForReview: 0 },
    };
  }
  return getStudyGuideData(userId, level);
}

export async function getStreakAction(): Promise<number> {
  const userId = await getAuthUserId();
  return getUserStreak(userId);
}

export async function getWeakFlashcardsAction(limit = 3): Promise<Flashcard[]> {
  const userId = await getAuthUserId();
  return getWeakFlashcards(userId, limit);
}

export async function getUserStatsAction() {
  const userId = await getAuthUserId();
  return getUserStats(userId);
}

export async function createClassroomAction(formData: FormData) {
  const userId = await getAuthUserId();
  const name = (formData.get("name") as string)?.trim();
  const description = ((formData.get("description") as string) || "").trim();

  if (!name) {
    return { error: "Classroom name is required." };
  }

  const classroom = await createClassroomRecord({
    teacherUserId: userId,
    name,
    description: description || null,
  });

  revalidatePath("/notebook/classes");
  revalidatePath(`/notebook/classes/${classroom.id}`);
  return { id: classroom.id };
}

export async function joinClassroomAction(formData: FormData) {
  const userId = await getAuthUserId();
  const joinCode = (formData.get("join_code") as string)?.trim().toUpperCase();

  if (!joinCode) {
    return { error: "Join code is required." };
  }

  const classroom = await joinClassroomRecord({
    userId,
    joinCode,
  });

  if (!classroom) {
    return { error: "Classroom not found." };
  }

  revalidatePath("/notebook/classes");
  revalidatePath(`/notebook/classes/${classroom.id}`);
  return { id: classroom.id };
}

export async function createAssignmentAction(formData: FormData) {
  const userId = await getAuthUserId();
  const classroomId = (formData.get("classroom_id") as string) || "";
  const title = (formData.get("title") as string)?.trim();
  const description = ((formData.get("description") as string) || "").trim();
  const prompt = ((formData.get("prompt") as string) || "").trim();
  const type = (formData.get("type") as AssignmentType) || "journal_prompt";
  const hskLevelRaw = (formData.get("hsk_level") as string) || "";
  const sourceRef = ((formData.get("source_ref") as string) || "").trim();
  const dueAtRaw = ((formData.get("due_at") as string) || "").trim();
  const dueDate = ((formData.get("due_date") as string) || "").trim();
  const dueTime = ((formData.get("due_time") as string) || "").trim();
  const dueAt = dueAtRaw || (dueDate ? `${dueDate}T${dueTime || "23:59"}` : "");

  if (!classroomId) {
    return { error: "Classroom is required." };
  }

  if (!(await canManageClassroom(userId, classroomId))) {
    return { error: "You cannot manage this classroom." };
  }

  if (!title) {
    return { error: "Assignment title is required." };
  }

  const assignment = await createAssignmentRecord({
    classroomId,
    createdByUserId: userId,
    type,
    title,
    description: description || null,
    prompt: prompt || null,
    hskLevel: hskLevelRaw ? Number.parseInt(hskLevelRaw, 10) : null,
    sourceRef: sourceRef || null,
    dueAt: dueAt || null,
  });

  revalidatePath(`/notebook/classes/${classroomId}`);
  revalidatePath("/notebook/assignments");
  revalidatePath(`/notebook/assignments/${assignment.id}`);
  return { id: assignment.id, classroomId };
}

export async function createTeacherResourceAction(formData: FormData) {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    return { error: "Only teachers can create resources." };
  }

  const title = ((formData.get("title") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const resourceType = ((formData.get("resource_type") as string) || "journal_prompt") as TeacherResourceType;
  const hskLevelRaw = ((formData.get("hsk_level") as string) || "").trim();

  if (!title) {
    return { error: "Resource title is required." };
  }

  const resource = await createTeacherResource({
    teacherUserId: userId,
    resourceType,
    title,
    description: description || null,
    hskLevel: hskLevelRaw ? Number.parseInt(hskLevelRaw, 10) : null,
  });

  revalidatePath("/notebook/teacher/library");
  return { id: resource.id };
}

export async function createAssignmentTemplateAction(formData: FormData) {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    return { error: "Only teachers can create templates." };
  }

  const title = ((formData.get("title") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const prompt = ((formData.get("prompt") as string) || "").trim();
  const templateType = ((formData.get("template_type") as string) || "journal_prompt") as AssignmentType;
  const resourceId = ((formData.get("resource_id") as string) || "").trim();
  const sourceRef = ((formData.get("source_ref") as string) || "").trim();
  const hskLevelRaw = ((formData.get("hsk_level") as string) || "").trim();
  const allowResubmission = formData.get("allow_resubmission") === "on";

  if (!title) {
    return { error: "Template title is required." };
  }

  if (resourceId) {
    const resources = await listTeacherResourcesForUser(userId, { includeArchived: false });
    if (!resources.some((resource) => resource.id === resourceId)) {
      return { error: "Resource not found." };
    }
  }

  const template = await createAssignmentTemplate({
    teacherUserId: userId,
    resourceId: resourceId || null,
    templateType,
    title,
    description: description || null,
    prompt: prompt || null,
    hskLevel: hskLevelRaw ? Number.parseInt(hskLevelRaw, 10) : null,
    sourceRef: sourceRef || null,
    allowResubmission,
  });

  revalidatePath("/notebook/teacher/library");
  return { id: template.id };
}

export async function createAssignmentFromTemplateAction(formData: FormData) {
  const userId = await getAuthUserId();
  const templateId = ((formData.get("template_id") as string) || "").trim();
  const classroomId = ((formData.get("classroom_id") as string) || "").trim();
  const title = ((formData.get("title") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const prompt = ((formData.get("prompt") as string) || "").trim();
  const dueDate = ((formData.get("due_date") as string) || "").trim();
  const dueTime = ((formData.get("due_time") as string) || "").trim();
  const dueAt = dueDate ? `${dueDate}T${dueTime || "23:59"}` : "";

  if (!templateId || !classroomId) {
    return { error: "Template and classroom are required." };
  }

  if (!(await canManageAssignmentTemplate(userId, templateId))) {
    return { error: "You cannot use this template." };
  }

  if (!(await canUseTemplateInClassroom(userId, templateId, classroomId))) {
    return { error: "You cannot use this template in this classroom." };
  }

  const template = await getAssignmentTemplate(templateId);
  if (!template) {
    return { error: "Template not found." };
  }

  const assignment = await createAssignmentRecord({
    classroomId,
    createdByUserId: userId,
    templateId,
    type: template.template_type,
    title: title || template.title,
    description: description || template.description,
    prompt: prompt || template.prompt,
    hskLevel: template.hsk_level,
    sourceRef: template.source_ref,
    dueAt: dueAt || null,
    allowResubmission: template.allow_resubmission === 1,
  });

  await markAssignmentCreatedFromTemplate({
    assignmentId: assignment.id,
    templateId,
  });

  revalidatePath("/notebook/teacher/library");
  revalidatePath(`/notebook/classes/${classroomId}`);
  revalidatePath("/notebook/assignments");
  revalidatePath(`/notebook/assignments/${assignment.id}`);
  return { id: assignment.id };
}

export async function updateTeacherResourceAction(formData: FormData) {
  const userId = await getAuthUserId();
  const id = ((formData.get("id") as string) || "").trim();
  const title = ((formData.get("title") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const hskLevelRaw = ((formData.get("hsk_level") as string) || "").trim();
  const archived = formData.get("archived") === "on";

  if (!id || !title) {
    return { error: "Resource id and title are required." };
  }

  await updateTeacherResource({
    id,
    teacherUserId: userId,
    title,
    description: description || null,
    hskLevel: hskLevelRaw ? Number.parseInt(hskLevelRaw, 10) : null,
    archived,
  });

  revalidatePath("/notebook/teacher/library");
  return { success: true };
}

export async function updateAssignmentTemplateAction(formData: FormData) {
  const userId = await getAuthUserId();
  const id = ((formData.get("id") as string) || "").trim();
  const title = ((formData.get("title") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const prompt = ((formData.get("prompt") as string) || "").trim();
  const sourceRef = ((formData.get("source_ref") as string) || "").trim();
  const hskLevelRaw = ((formData.get("hsk_level") as string) || "").trim();
  const allowResubmission = formData.get("allow_resubmission") === "on";
  const archived = formData.get("archived") === "on";

  if (!id || !title) {
    return { error: "Template id and title are required." };
  }

  await updateAssignmentTemplate({
    id,
    teacherUserId: userId,
    title,
    description: description || null,
    prompt: prompt || null,
    sourceRef: sourceRef || null,
    hskLevel: hskLevelRaw ? Number.parseInt(hskLevelRaw, 10) : null,
    allowResubmission,
    archived,
  });

  revalidatePath("/notebook/teacher/library");
  return { success: true };
}

export async function saveAssignmentAsTemplateAction(formData: FormData) {
  const userId = await getAuthUserId();
  const assignmentId = ((formData.get("assignment_id") as string) || "").trim();
  const classroomId = ((formData.get("classroom_id") as string) || "").trim();
  const title = ((formData.get("title") as string) || "").trim();

  if (!assignmentId || !classroomId) {
    return { error: "Assignment context is required." };
  }

  if (!(await canManageClassroom(userId, classroomId))) {
    return { error: "You cannot save this assignment as a template." };
  }

  const assignment = await getAssignment(assignmentId);
  if (!assignment) {
    return { error: "Assignment not found." };
  }

  const template = await createAssignmentTemplate({
    teacherUserId: userId,
    templateType: assignment.type,
    title: title || assignment.title,
    description: assignment.description,
    prompt: assignment.prompt,
    hskLevel: assignment.hsk_level,
    sourceRef: assignment.source_ref,
    allowResubmission: assignment.allow_resubmission === 1,
  });

  await markAssignmentCreatedFromTemplate({
    assignmentId: assignment.id,
    templateId: template.id,
  });

  revalidatePath("/notebook/teacher/library");
  revalidatePath(`/notebook/assignments/${assignment.id}`);
  return { id: template.id };
}

export async function searchHskWordsAction(
  query: string
): Promise<HskWord[]> {
  if (!query || query.trim().length === 0) return [];
  return searchHskWords(query.trim());
}

export async function searchAnnotationSuggestionsAction(
  query: string
): Promise<AnnotationLookupEntry[]> {
  const normalized = query.trim();
  if (!normalized) return [];

  const [hskWords, cedictWords] = await Promise.all([
    searchHskWords(normalized),
    searchCedictWords(normalized),
  ]);

  const deduped = new Map<string, AnnotationLookupEntry>();

  for (const word of hskWords) {
    const entry: AnnotationLookupEntry = {
      hanzi: word.simplified,
      pinyin: word.pinyin,
      english: word.english,
      source: "hsk",
      hskLevel: word.hsk_level,
    };
    deduped.set(`${entry.hanzi}|${entry.pinyin}|${entry.english}`, entry);
  }

  for (const word of cedictWords) {
    const entry: AnnotationLookupEntry = {
      hanzi: word.simplified,
      pinyin: word.pinyin_display,
      english: word.english.split("; ")[0] ?? word.english,
      source: "cedict",
      hskLevel: null,
    };
    const key = `${entry.hanzi}|${entry.pinyin}|${entry.english}`;
    if (!deduped.has(key)) {
      deduped.set(key, entry);
    }
  }

  return Array.from(deduped.values());
}

export async function createFlashcardForWord(
  simplified: string,
  pinyin: string,
  english: string
): Promise<{ id: string } | { duplicate: true }> {
  const userId = await getAuthUserId();
  const existing = await queryOne<{ id: string }>(
    "SELECT id FROM flashcards WHERE user_id = $1 AND front = $2",
    [userId, simplified]
  );

  if (existing) return { duplicate: true };

  const id = randomUUID();
  await execute(
    `INSERT INTO flashcards (id, user_id, front, back, deck)
     VALUES ($1, $2, $3, $4, 'study-guide')`,
    [id, userId, simplified, `${pinyin} — ${english}`]
  );

  revalidatePath("/notebook/flashcards");
  return { id };
}

export async function addSubmissionFeedbackAction(formData: FormData) {
  const userId = await getAuthUserId();
  const submissionId = ((formData.get("submission_id") as string) || "").trim();
  const content = ((formData.get("content") as string) || "").trim();

  if (!submissionId) {
    return { error: "Submission is required." };
  }

  if (!(await canReviewSubmission(userId, submissionId))) {
    return { error: "You cannot review this submission." };
  }

  if (!content) {
    return { error: "Feedback is required." };
  }

  await addSubmissionFeedback({
    submissionId,
    teacherUserId: userId,
    content,
  });

  revalidatePath(`/notebook/submissions/${submissionId}`);
  revalidatePath("/notebook/assignments");
  return { success: true };
}

export async function markSubmissionReviewedAction(formData: FormData) {
  const userId = await getAuthUserId();
  const submissionId = ((formData.get("submission_id") as string) || "").trim();
  const assignmentId = ((formData.get("assignment_id") as string) || "").trim();

  if (!submissionId) {
    return { error: "Submission is required." };
  }

  if (!(await canReviewSubmission(userId, submissionId))) {
    return { error: "You cannot review this submission." };
  }

  await markSubmissionReviewed(submissionId);

  revalidatePath(`/notebook/submissions/${submissionId}`);
  revalidatePath("/notebook/assignments");
  if (assignmentId) {
    revalidatePath(`/notebook/assignments/${assignmentId}`);
  }
  return { success: true };
}

export async function createReferralPayoutAction(formData: FormData) {
  const userId = await getAuthUserId();

  if (!(await canViewReferralDashboard(userId))) {
    return { error: "You cannot manage referral payouts." };
  }

  const periodLabel = ((formData.get("period_label") as string) || "").trim();
  const payout = await createTeacherPayoutBatch({
    teacherUserId: userId,
    periodLabel: periodLabel || undefined,
  });

  if (!payout) {
    return { error: "No pending commissions to pay." };
  }

  revalidatePath("/notebook/teacher/referrals");
  return { id: payout.id };
}

export async function overrideReferralAttributionAction(formData: FormData) {
  const userId = await getAuthUserId();
  const studentEmail = ((formData.get("student_email") as string) || "").trim();
  const referralCode = ((formData.get("referral_code") as string) || "").trim();

  if (userId !== "dev-user-001") {
    return { error: "Only internal support can override referral attributions." };
  }

  if (!studentEmail || !referralCode) {
    return { error: "Student email and referral code are required." };
  }

  const result = await overrideReferralAttribution({
    studentEmail,
    referralCode,
  });

  if (!result) {
    return { error: "Referral override could not be applied." };
  }

  revalidatePath("/notebook/admin/referrals");
  revalidatePath("/notebook/teacher/referrals");
  return result;
}

export async function applyReferralCodeForCurrentUserAction(formData: FormData) {
  const userId = await getAuthUserId();
  const code = ((formData.get("referral_code") as string) || "").trim();

  if (!code) {
    return { error: "Referral code is required." };
  }

  const attribution = await ensureReferralAttribution({
    studentUserId: userId,
    code,
    attributionSource: "manual_apply",
  });

  if (!attribution) {
    return { error: "Referral code not found." };
  }

  revalidatePath("/notebook/teacher/referrals");
  return { id: attribution.id };
}

export async function createTeacherInquiryAction(formData: FormData) {
  const studentUserId = await getAuthUserId();
  const teacherUserId = ((formData.get("teacher_user_id") as string) || "").trim();
  const publicSlug = ((formData.get("public_slug") as string) || "").trim();
  const message = ((formData.get("message") as string) || "").trim();

  if (!teacherUserId) {
    return { error: "Teacher is required." };
  }

  if (teacherUserId === studentUserId) {
    return { error: "You cannot send an inquiry to yourself." };
  }

  const inquiry = await createTeacherInquiry({
    teacherUserId,
    studentUserId,
    message: message || null,
  });

  revalidatePath("/notebook/inquiries");
  revalidatePath("/notebook/teacher/inquiries");
  if (publicSlug) {
    revalidatePath(`/teachers/${publicSlug}`);
  }
  return { id: inquiry.id };
}

export async function respondToTeacherInquiryAction(formData: FormData) {
  const teacherUserId = await getAuthUserId();
  const inquiryId = ((formData.get("inquiry_id") as string) || "").trim();
  const status = ((formData.get("status") as string) || "").trim() as
    | "accepted"
    | "declined"
    | "converted";

  if (!inquiryId || !status) {
    return { error: "Inquiry and status are required." };
  }

  if (!["accepted", "declined", "converted"].includes(status)) {
    return { error: "Invalid inquiry status." };
  }

  if (!(await canRespondToTeacherInquiry(teacherUserId, inquiryId))) {
    return { error: "You cannot respond to this inquiry." };
  }

  const inquiry = await respondToTeacherInquiry({
    inquiryId,
    teacherUserId,
    status,
  });

  revalidatePath("/notebook/teacher/inquiries");
  revalidatePath("/notebook/inquiries");
  return { id: inquiry.id };
}

export async function convertInquiryToClassroomAction(formData: FormData) {
  const teacherUserId = await getAuthUserId();
  const inquiryId = ((formData.get("inquiry_id") as string) || "").trim();
  const classroomName = ((formData.get("classroom_name") as string) || "").trim();

  if (!inquiryId) {
    return { error: "Inquiry is required." };
  }

  if (!(await canConvertInquiryToClassroom(teacherUserId, inquiryId))) {
    return { error: "You cannot convert this inquiry yet." };
  }

  const inquiry = await convertInquiryToClassroom({
    inquiryId,
    teacherUserId,
    classroomName: classroomName || null,
  });

  revalidatePath("/notebook/teacher/inquiries");
  revalidatePath("/notebook/inquiries");
  if (inquiry.created_classroom_id) {
    revalidatePath(`/notebook/classes/${inquiry.created_classroom_id}`);
    revalidatePath("/notebook/classes");
  }
  return { id: inquiry.id, classroomId: inquiry.created_classroom_id };
}

export async function updateTeacherProfileAction(formData: FormData) {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    return { error: "Only teachers can manage public profiles." };
  }

  const publicSlug = ((formData.get("public_slug") as string) || "").trim();
  const headline = ((formData.get("headline") as string) || "").trim();
  const bio = ((formData.get("bio") as string) || "").trim();
  const languages = parseList((formData.get("languages") as string) || "");
  const specialties = parseList((formData.get("specialties") as string) || "");
  const levels = parseList((formData.get("levels") as string) || "");
  const timezone = ((formData.get("timezone") as string) || "").trim();
  const pricingSummary = ((formData.get("pricing_summary") as string) || "").trim();
  const availabilitySummary = ((formData.get("availability_summary") as string) || "").trim();
  const yearsExperienceRaw = ((formData.get("years_experience") as string) || "").trim();
  const teachingStyle = ((formData.get("teaching_style") as string) || "").trim();
  const isPublic = formData.get("is_public") === "on";

  try {
    const profile = await updateTeacherProfile({
      teacherUserId: userId,
      publicSlug,
      headline: headline || null,
      bio: bio || null,
      languages,
      specialties,
      levels,
      timezone: timezone || null,
      pricingSummary: pricingSummary || null,
      availabilitySummary: availabilitySummary || null,
      yearsExperience: yearsExperienceRaw ? Number.parseInt(yearsExperienceRaw, 10) : null,
      teachingStyle: teachingStyle || null,
      isPublic,
    });

    revalidatePath("/notebook/teacher/profile");
    revalidatePath(`/teachers/${profile.public_slug}`);
    revalidatePath("/teachers");
    return { id: profile.id, slug: profile.public_slug };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to update teacher profile.",
    };
  }
}
