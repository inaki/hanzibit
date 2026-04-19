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
  getLevelReadiness,
  getCuratedGrammarPoints,
  markGrammarPointStudied,
  getCollocations,
  getCharacterBreakdowns,
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
  type LevelReadiness,
  type CuratedGrammarPoint,
  type HskCollocation,
  type CharacterBreakdown,
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
import {
  createAssignment as createAssignmentRecord,
  getAssignment,
  listAssignmentsForClassroom,
  type AssignmentType,
} from "./assignments";
import {
  canManageAssignmentTemplate,
  canApplyTeacherPlaybook,
  canApplyTeacherStrategy,
  canManageClassroom,
  canManagePrivateLearnerGoals,
  canManagePrivateLearnerHistory,
  canManagePrivateLearnerPlan,
  canManagePrivateLearnerReview,
  canManagePrivateLearnerAdaptation,
  canManageTeacherPlaybook,
  canManageTeacherStrategy,
  canRecordTeacherPlaybookOutcome,
  canRecordTeacherStrategyOutcome,
  canConvertInquiryToClassroom,
  canManagePrivateLearnerState,
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
import {
  createTeacherStrategy,
  getTeacherStrategy,
  updateTeacherStrategy,
} from "./teacher-strategies";
import {
  createTeacherPlaybook,
  getTeacherPlaybook,
  updateTeacherPlaybook,
} from "./teacher-playbooks";
import {
  createTeacherPayoutBatch,
  ensureReferralAttribution,
  overrideReferralAttribution,
} from "./referrals";
import { parseList, updateTeacherProfile } from "./teacher-profiles";
import {
  ensureTeacherTutoringSettings,
  updateTeacherTutoringSettings,
} from "./teacher-tutoring-settings";
import {
  convertInquiryToClassroom,
  createTeacherInquiry,
  respondToTeacherInquiry,
  setInquiryInitialAssignment,
} from "./teacher-inquiries";
import { getLearnerTeacherHubSummary } from "./learner-teacher-hub";
import {
  ensurePrivateStudent,
  getPrivateStudentDetail,
  updatePrivateStudentNextAssignment,
  updatePrivateStudentState,
} from "./private-students";
import {
  ensurePrivateLessonPlan,
  updatePrivateLessonPlan,
} from "./private-lesson-plans";
import {
  createPrivateStudentGoal,
  getPrivateStudentGoal,
  type PrivateStudentGoalProgressStatus,
  updatePrivateStudentGoal,
} from "./private-student-goals";
import {
  createPrivateLessonHistory,
  PRIVATE_LESSON_ISSUE_TAGS,
  type PrivateLessonIssueTag,
} from "./private-lesson-history";
import {
  createPrivateStudentReview,
  updatePrivateStudentReviewAdaptation,
} from "./private-student-reviews";
import { applyTeacherStrategyToPrivateStudent } from "./private-student-strategy-applications";
import { applyTeacherPlaybookToPrivateStudent } from "./private-student-playbook-applications";
import {
  upsertPrivateStudentPlaybookOutcome,
  type PrivateStudentPlaybookOutcomeStatus,
} from "./private-student-playbook-outcomes";
import {
  upsertPrivateStudentStrategyOutcome,
  type PrivateStudentStrategyOutcomeStatus,
} from "./private-student-strategy-outcomes";

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

export async function hasLearnerTeacherHubAction(): Promise<boolean> {
  const userId = await getAuthUserId();
  const teacher = await isTeacherUser(userId);

  if (teacher) {
    return false;
  }

  const summary = await getLearnerTeacherHubSummary(userId);
  return summary.hasContext;
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

export async function getLevelReadinessAction(level: number): Promise<LevelReadiness> {
  const userId = await getAuthUserId();
  return getLevelReadiness(userId, level);
}

export async function getCuratedGrammarPointsAction(
  level: number
): Promise<CuratedGrammarPoint[]> {
  const userId = await getAuthUserId();
  return getCuratedGrammarPoints(userId, level);
}

export async function markGrammarPointStudiedAction(
  grammarPointId: number
): Promise<void> {
  const userId = await getAuthUserId();
  await markGrammarPointStudied(userId, grammarPointId);
}

export async function getCollocationsAction(
  wordSimplified: string
): Promise<HskCollocation[]> {
  const userId = await getAuthUserId();
  return getCollocations(userId, wordSimplified);
}

export async function getCharacterBreakdownsAction(
  wordSimplified: string
): Promise<CharacterBreakdown[]> {
  return getCharacterBreakdowns(wordSimplified);
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

export async function createTeacherStrategyAction(formData: FormData) {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    return { error: "Only teachers can create strategies." };
  }

  const title = ((formData.get("title") as string) || "").trim();
  const summary = ((formData.get("summary") as string) || "").trim();
  const issueFocus = ((formData.get("issue_focus") as string) || "").trim();
  const goalFocus = ((formData.get("goal_focus") as string) || "").trim();
  const guidance = ((formData.get("guidance") as string) || "").trim();
  const refinementNote = ((formData.get("refinement_note") as string) || "").trim();
  const linkedTemplateId = ((formData.get("linked_template_id") as string) || "").trim();
  const linkedResourceId = ((formData.get("linked_resource_id") as string) || "").trim();

  if (!title) {
    return { error: "Strategy title is required." };
  }

  if (!summary) {
    return { error: "Strategy summary is required." };
  }

  if (linkedTemplateId) {
    const templates = await listAssignmentTemplatesForTeacher(userId);
    if (!templates.some((template) => template.id === linkedTemplateId)) {
      return { error: "Linked template not found." };
    }
  }

  if (linkedResourceId) {
    const resources = await listTeacherResourcesForUser(userId, { includeArchived: false });
    if (!resources.some((resource) => resource.id === linkedResourceId)) {
      return { error: "Linked resource not found." };
    }
  }

  const strategy = await createTeacherStrategy({
    teacherUserId: userId,
    title,
    summary,
    issueFocus: issueFocus || null,
    goalFocus: goalFocus || null,
    guidance: guidance || null,
    refinementNote: refinementNote || null,
    linkedTemplateId: linkedTemplateId || null,
    linkedResourceId: linkedResourceId || null,
  });

  revalidatePath("/notebook/teacher/library");
  return { id: strategy.id };
}

export async function createTeacherPlaybookAction(formData: FormData) {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    return { error: "Only teachers can create playbooks." };
  }

  const title = ((formData.get("title") as string) || "").trim();
  const summary = ((formData.get("summary") as string) || "").trim();
  const issueFocus = ((formData.get("issue_focus") as string) || "").trim();
  const goalFocus = ((formData.get("goal_focus") as string) || "").trim();
  const whenToUse = ((formData.get("when_to_use") as string) || "").trim();
  const guidance = ((formData.get("guidance") as string) || "").trim();
  const linkedTemplateId = ((formData.get("linked_template_id") as string) || "").trim();
  const linkedResourceId = ((formData.get("linked_resource_id") as string) || "").trim();
  const strategyIds = formData
    .getAll("strategy_ids")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!title) {
    return { error: "Playbook title is required." };
  }

  if (!summary) {
    return { error: "Playbook summary is required." };
  }

  if (linkedTemplateId) {
    const templates = await listAssignmentTemplatesForTeacher(userId, { includeArchived: true });
    if (!templates.some((template) => template.id === linkedTemplateId)) {
      return { error: "Linked template not found." };
    }
  }

  if (linkedResourceId) {
    const resources = await listTeacherResourcesForUser(userId, { includeArchived: true });
    if (!resources.some((resource) => resource.id === linkedResourceId)) {
      return { error: "Linked resource not found." };
    }
  }

  if (strategyIds.length > 0) {
    const strategies = await listTeacherStrategiesForTeacher(userId, { includeArchived: true });
    const validStrategyIds = new Set(strategies.map((strategy) => strategy.id));
    if (strategyIds.some((id) => !validStrategyIds.has(id))) {
      return { error: "One or more linked strategies were not found." };
    }
  }

  const playbook = await createTeacherPlaybook({
    teacherUserId: userId,
    title,
    summary,
    issueFocus: issueFocus || null,
    goalFocus: goalFocus || null,
    whenToUse: whenToUse || null,
    guidance: guidance || null,
    linkedTemplateId: linkedTemplateId || null,
    linkedResourceId: linkedResourceId || null,
    strategyIds,
  });

  revalidatePath("/notebook/teacher/library");
  return { id: playbook.id };
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

export async function updateTeacherStrategyAction(formData: FormData) {
  const userId = await getAuthUserId();
  const id = ((formData.get("id") as string) || "").trim();
  const title = ((formData.get("title") as string) || "").trim();
  const summary = ((formData.get("summary") as string) || "").trim();
  const issueFocus = ((formData.get("issue_focus") as string) || "").trim();
  const goalFocus = ((formData.get("goal_focus") as string) || "").trim();
  const guidance = ((formData.get("guidance") as string) || "").trim();
  const refinementNote = ((formData.get("refinement_note") as string) || "").trim();
  const linkedTemplateId = ((formData.get("linked_template_id") as string) || "").trim();
  const linkedResourceId = ((formData.get("linked_resource_id") as string) || "").trim();
  const archived = formData.get("archived") === "on";
  const markRefined = formData.get("mark_refined") === "1";

  if (!id || !title) {
    return { error: "Strategy id and title are required." };
  }

  if (!summary) {
    return { error: "Strategy summary is required." };
  }

  if (!(await canManageTeacherStrategy(userId, id))) {
    return { error: "You cannot update this strategy." };
  }

  if (linkedTemplateId) {
    const templates = await listAssignmentTemplatesForTeacher(userId, { includeArchived: true });
    if (!templates.some((template) => template.id === linkedTemplateId)) {
      return { error: "Linked template not found." };
    }
  }

  if (linkedResourceId) {
    const resources = await listTeacherResourcesForUser(userId, { includeArchived: true });
    if (!resources.some((resource) => resource.id === linkedResourceId)) {
      return { error: "Linked resource not found." };
    }
  }

  await updateTeacherStrategy({
    id,
    teacherUserId: userId,
    title,
    summary,
    issueFocus: issueFocus || null,
    goalFocus: goalFocus || null,
    guidance: guidance || null,
    refinementNote: refinementNote || null,
    linkedTemplateId: linkedTemplateId || null,
    linkedResourceId: linkedResourceId || null,
    archived,
    markRefined,
  });

  revalidatePath("/notebook/teacher/library");
  return { success: true };
}

export async function updateTeacherPlaybookAction(formData: FormData) {
  const userId = await getAuthUserId();
  const id = ((formData.get("id") as string) || "").trim();
  const title = ((formData.get("title") as string) || "").trim();
  const summary = ((formData.get("summary") as string) || "").trim();
  const issueFocus = ((formData.get("issue_focus") as string) || "").trim();
  const goalFocus = ((formData.get("goal_focus") as string) || "").trim();
  const whenToUse = ((formData.get("when_to_use") as string) || "").trim();
  const guidance = ((formData.get("guidance") as string) || "").trim();
  const refinementNote = ((formData.get("refinement_note") as string) || "").trim();
  const linkedTemplateId = ((formData.get("linked_template_id") as string) || "").trim();
  const linkedResourceId = ((formData.get("linked_resource_id") as string) || "").trim();
  const replacementPlaybookId = ((formData.get("replacement_playbook_id") as string) || "").trim();
  const strategyIds = formData
    .getAll("strategy_ids")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const archived = formData.get("archived") === "on";
  const markRefined = formData.get("mark_refined") === "1";

  if (!id || !title) {
    return { error: "Playbook id and title are required." };
  }

  if (!summary) {
    return { error: "Playbook summary is required." };
  }

  if (!(await canManageTeacherPlaybook(userId, id))) {
    return { error: "You cannot update this playbook." };
  }

  if (linkedTemplateId) {
    const templates = await listAssignmentTemplatesForTeacher(userId, { includeArchived: true });
    if (!templates.some((template) => template.id === linkedTemplateId)) {
      return { error: "Linked template not found." };
    }
  }

  if (linkedResourceId) {
    const resources = await listTeacherResourcesForUser(userId, { includeArchived: true });
    if (!resources.some((resource) => resource.id === linkedResourceId)) {
      return { error: "Linked resource not found." };
    }
  }

  if (strategyIds.length > 0) {
    const strategies = await listTeacherStrategiesForTeacher(userId, { includeArchived: true });
    const validStrategyIds = new Set(strategies.map((strategy) => strategy.id));
    if (strategyIds.some((linkedId) => !validStrategyIds.has(linkedId))) {
      return { error: "One or more linked strategies were not found." };
    }
  }

  if (replacementPlaybookId) {
    if (replacementPlaybookId === id) {
      return { error: "A playbook cannot replace itself." };
    }
    const playbooks = await listTeacherPlaybooksForTeacher(userId, { includeArchived: true });
    if (!playbooks.some((playbook) => playbook.id === replacementPlaybookId)) {
      return { error: "Replacement playbook not found." };
    }
  }

  await updateTeacherPlaybook({
    id,
    teacherUserId: userId,
    title,
    summary,
    issueFocus: issueFocus || null,
    goalFocus: goalFocus || null,
    whenToUse: whenToUse || null,
    guidance: guidance || null,
    refinementNote: refinementNote || null,
    linkedTemplateId: linkedTemplateId || null,
    linkedResourceId: linkedResourceId || null,
    replacementPlaybookId: replacementPlaybookId || null,
    archived,
    markRefined,
    strategyIds,
  });

  revalidatePath("/notebook/teacher/library");
  return { success: true };
}

export async function applyTeacherPlaybookAction(formData: FormData) {
  const userId = await getAuthUserId();
  const privateStudentId = ((formData.get("private_student_id") as string) || "").trim();
  const playbookId = ((formData.get("playbook_id") as string) || "").trim();
  const goalId = ((formData.get("goal_id") as string) || "").trim();
  const reviewId = ((formData.get("review_id") as string) || "").trim();
  const applicationNote = ((formData.get("application_note") as string) || "").trim();
  const planStatus = ((formData.get("plan_status") as string) || "").trim() as
    | "planned"
    | "awaiting_assignment"
    | "awaiting_completion"
    | "completed"
    | "stale";
  const targetDate = ((formData.get("target_date") as string) || "").trim();

  if (!privateStudentId || !playbookId) {
    return { error: "Private learner and playbook are required." };
  }

  if (!(await canApplyTeacherPlaybook(userId, privateStudentId, playbookId))) {
    return { error: "You cannot apply this playbook." };
  }

  const playbook = await getTeacherPlaybook(playbookId);
  if (!playbook) {
    return { error: "Playbook not found." };
  }

  const privateStudent = await getPrivateStudentDetail(privateStudentId);
  if (!privateStudent) {
    return { error: "Private learner not found." };
  }

  const lessonPlan = await ensurePrivateLessonPlan({
    privateStudentId,
    teacherUserId: userId,
    classroomId: privateStudent.classroom_id,
  });

  await updatePrivateLessonPlan({
    privateStudentId,
    teacherUserId: userId,
    planStatus: planStatus || lessonPlan.plan_status,
    targetDate: targetDate || lessonPlan.target_date,
    focusNote: lessonPlan.focus_note || playbook.summary,
    beforeLessonExpectation: lessonPlan.before_lesson_expectation,
    nextAssignmentId: lessonPlan.next_assignment_id,
    nextTemplateId: playbook.linked_template_id || lessonPlan.next_template_id,
  });

  await applyTeacherPlaybookToPrivateStudent({
    privateStudentId,
    playbookId,
    appliedByUserId: userId,
    applicationNote: applicationNote || null,
    linkedReviewId: reviewId || null,
    linkedLessonPlanId: lessonPlan.id,
    linkedGoalId: goalId || null,
  });

  revalidatePath("/notebook/teacher/private-students");
  revalidatePath(`/notebook/teacher/private-students/${privateStudentId}`);
  revalidatePath(`/notebook/classes/${privateStudent.classroom_id}`);
  revalidatePath("/notebook/teacher/reporting");
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
  const onboardingMessage = ((formData.get("onboarding_message") as string) || "").trim();
  const templateIdOverride = ((formData.get("template_id") as string) || "").trim();

  if (!inquiryId) {
    return { error: "Inquiry is required." };
  }

  if (!(await canConvertInquiryToClassroom(teacherUserId, inquiryId))) {
    return { error: "You cannot convert this inquiry yet." };
  }

  const tutoringSettings = await ensureTeacherTutoringSettings(teacherUserId);
  const selectedTemplateId = templateIdOverride || tutoringSettings.default_template_id || "";

  if (selectedTemplateId) {
    const selectedTemplate = await getAssignmentTemplate(selectedTemplateId);
    if (!selectedTemplate || selectedTemplate.teacher_user_id !== teacherUserId) {
      return { error: "Selected onboarding template was not found." };
    }
  }

  const inquiry = await convertInquiryToClassroom({
    inquiryId,
    teacherUserId,
    classroomName: classroomName || null,
    classroomPrefix: tutoringSettings.default_private_classroom_prefix,
    classroomDescription: onboardingMessage || tutoringSettings.intro_message,
    onboardingMessage: onboardingMessage || tutoringSettings.intro_message,
  });

  if (inquiry.created_classroom_id && selectedTemplateId) {
    const template = await getAssignmentTemplate(selectedTemplateId);
    if (template && template.teacher_user_id === teacherUserId) {
      const existingAssignment = await queryOne<{ id: string }>(
        `SELECT id
         FROM assignments
         WHERE classroom_id = $1
           AND template_id = $2
         LIMIT 1`,
        [inquiry.created_classroom_id, template.id]
      );

      if (!existingAssignment) {
        const assignment = await createAssignmentRecord({
          classroomId: inquiry.created_classroom_id,
          createdByUserId: teacherUserId,
          templateId: template.id,
          type: template.template_type,
          title: template.title,
          description: template.description,
          prompt: template.prompt,
          hskLevel: template.hsk_level,
          sourceRef: template.source_ref,
          allowResubmission: template.allow_resubmission === 1,
        });

        await markAssignmentCreatedFromTemplate({
          assignmentId: assignment.id,
          templateId: template.id,
        });
        await setInquiryInitialAssignment({
          inquiryId,
          teacherUserId,
          assignmentId: assignment.id,
        });
        await ensurePrivateStudent({
          teacherUserId,
          studentUserId: inquiry.student_user_id,
          classroomId: inquiry.created_classroom_id,
          inquiryId,
          nextAssignmentId: assignment.id,
        });
        await updatePrivateStudentNextAssignment({
          inquiryId,
          teacherUserId,
          nextAssignmentId: assignment.id,
        });

        revalidatePath("/notebook/assignments");
        revalidatePath(`/notebook/assignments/${assignment.id}`);
        revalidatePath(`/notebook/teacher/inquiries`);
        revalidatePath("/notebook/inquiries");
        return {
          id: inquiry.id,
          classroomId: inquiry.created_classroom_id,
          success: `converted:assignment:${assignment.id}`,
        };
      }
    }
  }

  revalidatePath("/notebook/teacher/inquiries");
  revalidatePath("/notebook/inquiries");
  revalidatePath("/notebook/teacher");
  revalidatePath("/notebook/teacher/setup");
  if (inquiry.created_classroom_id) {
    await ensurePrivateStudent({
      teacherUserId,
      studentUserId: inquiry.student_user_id,
      classroomId: inquiry.created_classroom_id,
      inquiryId,
      nextAssignmentId: null,
    });
    revalidatePath(`/notebook/classes/${inquiry.created_classroom_id}`);
    revalidatePath("/notebook/classes");
  }
  return {
    id: inquiry.id,
    classroomId: inquiry.created_classroom_id,
    success: "converted:no-assignment",
  };
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

export async function updateTeacherTutoringSettingsAction(formData: FormData) {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    return { error: "Only teachers can manage tutoring setup." };
  }

  const defaultTemplateId = ((formData.get("default_template_id") as string) || "").trim();
  const introMessage = ((formData.get("intro_message") as string) || "").trim();
  const defaultPrivateClassroomPrefix = ((formData.get("default_private_classroom_prefix") as string) || "").trim();
  const cadenceType = ((formData.get("cadence_type") as string) || "").trim();
  const targetSessionLengthRaw = ((formData.get("target_session_length_minutes") as string) || "").trim();
  const cadenceNotes = ((formData.get("cadence_notes") as string) || "").trim();
  const formatNotes = ((formData.get("format_notes") as string) || "").trim();

  if (cadenceType && !["weekly", "twice_weekly", "flexible", "async_support"].includes(cadenceType)) {
    return { error: "Invalid cadence type." };
  }

  const targetSessionLengthMinutes = targetSessionLengthRaw
    ? Number.parseInt(targetSessionLengthRaw, 10)
    : null;

  if (
    targetSessionLengthMinutes != null &&
    (!Number.isFinite(targetSessionLengthMinutes) ||
      targetSessionLengthMinutes < 15 ||
      targetSessionLengthMinutes > 180)
  ) {
    return { error: "Session length must be between 15 and 180 minutes." };
  }

  if (defaultTemplateId) {
    const template = await getAssignmentTemplate(defaultTemplateId);
    if (!template || template.teacher_user_id !== userId) {
      return { error: "Default template not found." };
    }
  }

  const settings = await updateTeacherTutoringSettings({
    teacherUserId: userId,
    defaultTemplateId: defaultTemplateId || null,
    introMessage: introMessage || null,
    defaultPrivateClassroomPrefix: defaultPrivateClassroomPrefix || null,
    cadenceType: cadenceType || null,
    targetSessionLengthMinutes,
    cadenceNotes: cadenceNotes || null,
    formatNotes: formatNotes || null,
  });

  revalidatePath("/notebook/teacher");
  revalidatePath("/notebook/teacher/setup");
  revalidatePath("/notebook/teacher/inquiries");
  return { id: settings.id };
}

export async function updatePrivateStudentStateAction(formData: FormData) {
  const teacherUserId = await getAuthUserId();
  const privateStudentId = ((formData.get("private_student_id") as string) || "").trim();
  const status = ((formData.get("status") as string) || "").trim();
  const nextStepType = ((formData.get("next_step_type") as string) || "").trim();
  const nextAssignmentId = ((formData.get("next_assignment_id") as string) || "").trim();
  const followUpNote = ((formData.get("follow_up_note") as string) || "").trim();

  if (!privateStudentId) {
    return { error: "Private learner is required." };
  }

  if (!(await canManagePrivateLearnerState(teacherUserId, privateStudentId))) {
    return { error: "You cannot manage this private learner." };
  }

  if (!["onboarding", "active", "awaiting_teacher", "awaiting_student", "inactive"].includes(status)) {
    return { error: "Invalid private learner status." };
  }

  if (
    nextStepType &&
    !["complete_assignment", "review_feedback", "await_teacher_assignment", "follow_up", "none"].includes(
      nextStepType
    )
  ) {
    return { error: "Invalid next step." };
  }

  const detail = await getPrivateStudentDetail(privateStudentId);
  if (!detail) {
    return { error: "Private learner not found." };
  }

  if (nextAssignmentId) {
    const assignments = await listAssignmentsForClassroom(detail.classroom_id);
    if (!assignments.some((assignment) => assignment.id === nextAssignmentId)) {
      return { error: "Selected assignment does not belong to this private classroom." };
    }
  }

  await updatePrivateStudentState({
    id: privateStudentId,
    teacherUserId,
    status: status as
      | "onboarding"
      | "active"
      | "awaiting_teacher"
      | "awaiting_student"
      | "inactive",
    nextStepType: (nextStepType || "none") as
      | "complete_assignment"
      | "review_feedback"
      | "await_teacher_assignment"
      | "follow_up"
      | "none",
    nextAssignmentId: nextAssignmentId || null,
    followUpNote: followUpNote || null,
  });

  revalidatePath("/notebook/teacher");
  revalidatePath("/notebook/teacher/private-students");
  revalidatePath(`/notebook/teacher/private-students/${privateStudentId}`);
  revalidatePath("/notebook/teacher/reporting");
  revalidatePath(`/notebook/classes/${detail.classroom_id}`);
  return { id: privateStudentId };
}

export async function updatePrivateLessonPlanAction(formData: FormData) {
  const teacherUserId = await getAuthUserId();
  const privateStudentId = ((formData.get("private_student_id") as string) || "").trim();
  const planStatus = ((formData.get("plan_status") as string) || "").trim();
  const targetDate = ((formData.get("target_date") as string) || "").trim();
  const focusNote = ((formData.get("focus_note") as string) || "").trim();
  const beforeLessonExpectation = ((formData.get("before_lesson_expectation") as string) || "").trim();
  const nextAssignmentId = ((formData.get("next_assignment_id") as string) || "").trim();
  const nextTemplateId = ((formData.get("next_template_id") as string) || "").trim();

  if (!privateStudentId) {
    return { error: "Private learner is required." };
  }

  if (!(await canManagePrivateLearnerPlan(teacherUserId, privateStudentId))) {
    return { error: "You cannot manage this lesson plan." };
  }

  if (!["planned", "awaiting_assignment", "awaiting_completion", "completed", "stale"].includes(planStatus)) {
    return { error: "Invalid plan status." };
  }

  const detail = await getPrivateStudentDetail(privateStudentId);
  if (!detail) {
    return { error: "Private learner not found." };
  }

  await ensurePrivateLessonPlan({
    privateStudentId,
    teacherUserId,
    classroomId: detail.classroom_id,
  });

  if (nextAssignmentId) {
    const assignments = await listAssignmentsForClassroom(detail.classroom_id);
    if (!assignments.some((assignment) => assignment.id === nextAssignmentId)) {
      return { error: "Selected assignment does not belong to this private classroom." };
    }
  }

  if (nextTemplateId) {
    if (!(await canManageAssignmentTemplate(teacherUserId, nextTemplateId))) {
      return { error: "Selected template does not belong to you." };
    }
  }

  await updatePrivateLessonPlan({
    privateStudentId,
    teacherUserId,
    planStatus: planStatus as
      | "planned"
      | "awaiting_assignment"
      | "awaiting_completion"
      | "completed"
      | "stale",
    targetDate: targetDate || null,
    focusNote: focusNote || null,
    beforeLessonExpectation: beforeLessonExpectation || null,
    nextAssignmentId: nextAssignmentId || null,
    nextTemplateId: nextTemplateId || null,
  });

  revalidatePath("/notebook/teacher/private-students");
  revalidatePath(`/notebook/teacher/private-students/${privateStudentId}`);
  revalidatePath("/notebook/teacher/reporting");
  revalidatePath(`/notebook/classes/${detail.classroom_id}`);
  return { id: privateStudentId };
}

export async function createPrivateStudentGoalAction(formData: FormData) {
  const teacherUserId = await getAuthUserId();
  const privateStudentId = ((formData.get("private_student_id") as string) || "").trim();
  const title = ((formData.get("title") as string) || "").trim();
  const detail = ((formData.get("detail") as string) || "").trim();
  const status = ((formData.get("status") as string) || "active").trim();
  const progressStatus = ((formData.get("progress_status") as string) || "").trim();
  const progressNote = ((formData.get("progress_note") as string) || "").trim();

  if (!privateStudentId) {
    return { error: "Private learner is required." };
  }
  if (!(await canManagePrivateLearnerGoals(teacherUserId, privateStudentId))) {
    return { error: "You cannot manage goals for this private learner." };
  }
  if (!title) {
    return { error: "Goal title is required." };
  }
  if (!["active", "completed", "paused"].includes(status)) {
    return { error: "Invalid goal status." };
  }
  if (
    progressStatus &&
    !["improving", "stable", "needs_reinforcement", "blocked"].includes(progressStatus)
  ) {
    return { error: "Invalid progress marker." };
  }

  const detailRecord = await getPrivateStudentDetail(privateStudentId);
  if (!detailRecord) {
    return { error: "Private learner not found." };
  }

  const goal = await createPrivateStudentGoal({
    privateStudentId,
    teacherUserId,
    title,
    detail: detail || null,
    status: status as "active" | "completed" | "paused",
    progressStatus: (progressStatus || null) as PrivateStudentGoalProgressStatus | null,
    progressNote: progressNote || null,
  });

  revalidatePath("/notebook/teacher/private-students");
  revalidatePath(`/notebook/teacher/private-students/${privateStudentId}`);
  revalidatePath(`/notebook/classes/${detailRecord.classroom_id}`);
  revalidatePath("/notebook/teacher/reporting");
  return { id: goal.id };
}

export async function updatePrivateStudentGoalAction(formData: FormData) {
  const teacherUserId = await getAuthUserId();
  const goalId = ((formData.get("goal_id") as string) || "").trim();
  const title = ((formData.get("title") as string) || "").trim();
  const detail = ((formData.get("detail") as string) || "").trim();
  const status = ((formData.get("status") as string) || "").trim();
  const progressStatus = ((formData.get("progress_status") as string) || "").trim();
  const progressNote = ((formData.get("progress_note") as string) || "").trim();

  if (!goalId) {
    return { error: "Goal is required." };
  }
  if (!title) {
    return { error: "Goal title is required." };
  }
  if (!["active", "completed", "paused"].includes(status)) {
    return { error: "Invalid goal status." };
  }
  if (
    progressStatus &&
    !["improving", "stable", "needs_reinforcement", "blocked"].includes(progressStatus)
  ) {
    return { error: "Invalid progress marker." };
  }

  const goal = await getPrivateStudentGoal(goalId);
  if (!goal) {
    return { error: "Goal not found." };
  }

  if (!(await canManagePrivateLearnerGoals(teacherUserId, goal.private_student_id))) {
    return { error: "You cannot update this goal." };
  }

  const detailRecord = await getPrivateStudentDetail(goal.private_student_id);
  if (!detailRecord) {
    return { error: "Private learner not found." };
  }

  await updatePrivateStudentGoal({
    goalId,
    teacherUserId,
    title,
    detail: detail || null,
    status: status as "active" | "completed" | "paused",
    progressStatus: (progressStatus || null) as PrivateStudentGoalProgressStatus | null,
    progressNote: progressNote || null,
  });

  revalidatePath("/notebook/teacher/private-students");
  revalidatePath(`/notebook/teacher/private-students/${goal.private_student_id}`);
  revalidatePath(`/notebook/classes/${detailRecord.classroom_id}`);
  revalidatePath("/notebook/teacher/reporting");
  return { id: goalId };
}

export async function createPrivateLessonHistoryAction(formData: FormData) {
  const teacherUserId = await getAuthUserId();
  const privateStudentId = ((formData.get("private_student_id") as string) || "").trim();
  const assignmentId = ((formData.get("assignment_id") as string) || "").trim();
  const lessonPlanId = ((formData.get("lesson_plan_id") as string) || "").trim();
  const summary = ((formData.get("summary") as string) || "").trim();
  const practiceFocus = ((formData.get("practice_focus") as string) || "").trim();
  const interventionNote = ((formData.get("intervention_note") as string) || "").trim();
  const issueTags = formData
    .getAll("issue_tags")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const recordedAt = ((formData.get("recorded_at") as string) || "").trim();

  if (!privateStudentId) {
    return { error: "Private learner is required." };
  }
  if (!(await canManagePrivateLearnerHistory(teacherUserId, privateStudentId))) {
    return { error: "You cannot add lesson history for this private learner." };
  }
  if (!summary) {
    return { error: "Lesson summary is required." };
  }
  if (issueTags.some((tag) => !(PRIVATE_LESSON_ISSUE_TAGS as readonly string[]).includes(tag))) {
    return { error: "Invalid repeated issue tag." };
  }

  const detailRecord = await getPrivateStudentDetail(privateStudentId);
  if (!detailRecord) {
    return { error: "Private learner not found." };
  }

  if (assignmentId) {
    const assignments = await listAssignmentsForClassroom(detailRecord.classroom_id);
    if (!assignments.some((assignment) => assignment.id === assignmentId)) {
      return { error: "Selected assignment does not belong to this private classroom." };
    }
  }

  await createPrivateLessonHistory({
    privateStudentId,
    teacherUserId,
    classroomId: detailRecord.classroom_id,
    lessonPlanId: lessonPlanId || null,
    assignmentId: assignmentId || null,
    summary,
    practiceFocus: practiceFocus || null,
    issueTags: issueTags as PrivateLessonIssueTag[],
    interventionNote: interventionNote || null,
    recordedAt: recordedAt || null,
  });

  revalidatePath("/notebook/teacher/private-students");
  revalidatePath(`/notebook/teacher/private-students/${privateStudentId}`);
  revalidatePath(`/notebook/classes/${detailRecord.classroom_id}`);
  revalidatePath("/notebook/teacher/reporting");
  return { id: privateStudentId };
}

export async function createPrivateStudentReviewAction(formData: FormData) {
  const teacherUserId = await getAuthUserId();
  const privateStudentId = ((formData.get("private_student_id") as string) || "").trim();
  const reviewedAt = ((formData.get("reviewed_at") as string) || "").trim();
  const summary = ((formData.get("summary") as string) || "").trim();
  const whatImproved = ((formData.get("what_improved") as string) || "").trim();
  const whatNeedsChange = ((formData.get("what_needs_change") as string) || "").trim();
  const adaptationNote = ((formData.get("adaptation_note") as string) || "").trim();

  if (!privateStudentId) {
    return { error: "Private learner is required." };
  }
  if (!(await canManagePrivateLearnerReview(teacherUserId, privateStudentId))) {
    return { error: "You cannot review this private learner." };
  }
  if (!summary) {
    return { error: "Review summary is required." };
  }

  const detailRecord = await getPrivateStudentDetail(privateStudentId);
  if (!detailRecord) {
    return { error: "Private learner not found." };
  }

  await createPrivateStudentReview({
    privateStudentId,
    teacherUserId,
    reviewedAt: reviewedAt || null,
    summary,
    whatImproved: whatImproved || null,
    whatNeedsChange: whatNeedsChange || null,
    adaptationNote: adaptationNote || null,
  });

  revalidatePath("/notebook/teacher");
  revalidatePath("/notebook/teacher/private-students");
  revalidatePath(`/notebook/teacher/private-students/${privateStudentId}`);
  revalidatePath("/notebook/teacher/reporting");
  revalidatePath(`/notebook/classes/${detailRecord.classroom_id}`);
  return { id: privateStudentId };
}

export async function adaptPrivateLearnerPlanAction(formData: FormData) {
  const teacherUserId = await getAuthUserId();
  const privateStudentId = ((formData.get("private_student_id") as string) || "").trim();
  const reviewId = ((formData.get("review_id") as string) || "").trim();
  const planStatus = ((formData.get("plan_status") as string) || "").trim();
  const targetDate = ((formData.get("target_date") as string) || "").trim();
  const focusNote = ((formData.get("focus_note") as string) || "").trim();
  const beforeLessonExpectation = ((formData.get("before_lesson_expectation") as string) || "").trim();
  const nextAssignmentId = ((formData.get("next_assignment_id") as string) || "").trim();
  const nextTemplateId = ((formData.get("next_template_id") as string) || "").trim();
  const goalId = ((formData.get("goal_id") as string) || "").trim();
  const goalProgressStatus = ((formData.get("goal_progress_status") as string) || "").trim();
  const goalProgressNote = ((formData.get("goal_progress_note") as string) || "").trim();
  const adaptationNote = ((formData.get("adaptation_note") as string) || "").trim();

  if (!privateStudentId) {
    return { error: "Private learner is required." };
  }

  if (!(await canManagePrivateLearnerAdaptation(teacherUserId, privateStudentId))) {
    return { error: "You cannot adapt this private learner plan." };
  }

  if (!["planned", "awaiting_assignment", "awaiting_completion", "completed", "stale"].includes(planStatus)) {
    return { error: "Invalid plan status." };
  }

  if (
    goalProgressStatus &&
    !["improving", "stable", "needs_reinforcement", "blocked"].includes(goalProgressStatus)
  ) {
    return { error: "Invalid goal progress marker." };
  }

  const detailRecord = await getPrivateStudentDetail(privateStudentId);
  if (!detailRecord) {
    return { error: "Private learner not found." };
  }

  await ensurePrivateLessonPlan({
    privateStudentId,
    teacherUserId,
    classroomId: detailRecord.classroom_id,
  });

  if (nextAssignmentId) {
    const assignments = await listAssignmentsForClassroom(detailRecord.classroom_id);
    if (!assignments.some((assignment) => assignment.id === nextAssignmentId)) {
      return { error: "Selected assignment does not belong to this private classroom." };
    }
  }

  if (nextTemplateId) {
    if (!(await canManageAssignmentTemplate(teacherUserId, nextTemplateId))) {
      return { error: "Selected template does not belong to you." };
    }
  }

  if (goalId) {
    const goal = await getPrivateStudentGoal(goalId);
    if (!goal || goal.private_student_id !== privateStudentId) {
      return { error: "Selected goal does not belong to this private learner." };
    }

    await updatePrivateStudentGoal({
      goalId,
      teacherUserId,
      title: goal.title,
      detail: goal.detail,
      status: goal.status,
      progressStatus: (goalProgressStatus || goal.progress_status || null) as PrivateStudentGoalProgressStatus | null,
      progressNote: goalProgressNote || goal.progress_note || null,
    });
  }

  await updatePrivateLessonPlan({
    privateStudentId,
    teacherUserId,
    planStatus: planStatus as
      | "planned"
      | "awaiting_assignment"
      | "awaiting_completion"
      | "completed"
      | "stale",
    targetDate: targetDate || null,
    focusNote: focusNote || null,
    beforeLessonExpectation: beforeLessonExpectation || null,
    nextAssignmentId: nextAssignmentId || null,
    nextTemplateId: nextTemplateId || null,
  });

  if (reviewId) {
    await updatePrivateStudentReviewAdaptation({
      reviewId,
      teacherUserId,
      adaptationNote: adaptationNote || null,
    });
  }

  await execute(
    `UPDATE private_students
     SET last_plan_adapted_at = NOW(),
         last_teacher_action_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
       AND teacher_user_id = $2`,
    [privateStudentId, teacherUserId]
  );

  revalidatePath("/notebook/teacher");
  revalidatePath("/notebook/teacher/private-students");
  revalidatePath(`/notebook/teacher/private-students/${privateStudentId}`);
  revalidatePath("/notebook/teacher/reporting");
  revalidatePath(`/notebook/classes/${detailRecord.classroom_id}`);
  return { id: privateStudentId };
}

export async function applyTeacherStrategyAction(formData: FormData) {
  const teacherUserId = await getAuthUserId();
  const privateStudentId = ((formData.get("private_student_id") as string) || "").trim();
  const strategyId = ((formData.get("strategy_id") as string) || "").trim();
  const reviewId = ((formData.get("review_id") as string) || "").trim();
  const goalId = ((formData.get("goal_id") as string) || "").trim();
  const applicationNote = ((formData.get("application_note") as string) || "").trim();
  const planStatus = ((formData.get("plan_status") as string) || "").trim();
  const targetDate = ((formData.get("target_date") as string) || "").trim();

  if (!privateStudentId) {
    return { error: "Private learner is required." };
  }
  if (!strategyId) {
    return { error: "Strategy is required." };
  }
  if (!(await canApplyTeacherStrategy(teacherUserId, privateStudentId, strategyId))) {
    return { error: "You cannot apply this strategy to this private learner." };
  }

  const detailRecord = await getPrivateStudentDetail(privateStudentId);
  if (!detailRecord) {
    return { error: "Private learner not found." };
  }

  const strategy = await getTeacherStrategy(strategyId);
  if (!strategy) {
    return { error: "Strategy not found." };
  }

  if (goalId) {
    const goal = await getPrivateStudentGoal(goalId);
    if (!goal || goal.private_student_id !== privateStudentId) {
      return { error: "Selected goal does not belong to this private learner." };
    }
  }

  const lessonPlan = await ensurePrivateLessonPlan({
    privateStudentId,
    teacherUserId,
    classroomId: detailRecord.classroom_id,
  });

  const resolvedPlanStatus = ["planned", "awaiting_assignment", "awaiting_completion", "completed", "stale"].includes(planStatus)
    ? (planStatus as "planned" | "awaiting_assignment" | "awaiting_completion" | "completed" | "stale")
    : lessonPlan.plan_status;

  await updatePrivateLessonPlan({
    privateStudentId,
    teacherUserId,
    planStatus: resolvedPlanStatus,
    targetDate: targetDate || lessonPlan.target_date || null,
    focusNote: strategy.summary,
    beforeLessonExpectation: strategy.guidance || applicationNote || lessonPlan.before_lesson_expectation || null,
    nextAssignmentId: lessonPlan.next_assignment_id,
    nextTemplateId: strategy.linked_template_id || lessonPlan.next_template_id,
  });

  const refreshedPlan = await ensurePrivateLessonPlan({
    privateStudentId,
    teacherUserId,
    classroomId: detailRecord.classroom_id,
  });

  await applyTeacherStrategyToPrivateStudent({
    privateStudentId,
    teacherStrategyId: strategyId,
    appliedByUserId: teacherUserId,
    applicationNote: applicationNote || null,
    linkedReviewId: reviewId || null,
    linkedLessonPlanId: refreshedPlan.id,
    linkedGoalId: goalId || null,
  });

  await execute(
    `UPDATE private_students
     SET last_plan_adapted_at = NOW(),
         last_teacher_action_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
       AND teacher_user_id = $2`,
    [privateStudentId, teacherUserId]
  );

  revalidatePath("/notebook/teacher");
  revalidatePath("/notebook/teacher/private-students");
  revalidatePath(`/notebook/teacher/private-students/${privateStudentId}`);
  revalidatePath("/notebook/teacher/reporting");
  revalidatePath(`/notebook/classes/${detailRecord.classroom_id}`);
  return { id: privateStudentId };
}

export async function recordTeacherStrategyOutcomeAction(formData: FormData) {
  const teacherUserId = await getAuthUserId();
  const strategyApplicationId = ((formData.get("strategy_application_id") as string) || "").trim();
  const outcomeStatus = ((formData.get("outcome_status") as string) || "").trim();
  const outcomeNote = ((formData.get("outcome_note") as string) || "").trim();
  const recordedAt = ((formData.get("recorded_at") as string) || "").trim();

  if (!strategyApplicationId) {
    return { error: "Strategy application is required." };
  }

  if (!["helped", "partial", "no_change", "replace"].includes(outcomeStatus)) {
    return { error: "Outcome status is required." };
  }

  if (!(await canRecordTeacherStrategyOutcome(teacherUserId, strategyApplicationId))) {
    return { error: "You cannot record an outcome for this strategy application." };
  }

  const application = await queryOne<{
    id: string;
    private_student_id: string;
    teacher_strategy_id: string;
    classroom_id: string;
  }>(
    `SELECT
       apps.id,
       apps.private_student_id,
       apps.teacher_strategy_id,
       private_students.classroom_id
     FROM private_student_strategy_applications apps
     INNER JOIN private_students
       ON private_students.id = apps.private_student_id
     WHERE apps.id = $1
     LIMIT 1`,
    [strategyApplicationId]
  );

  if (!application) {
    return { error: "Strategy application not found." };
  }

  await upsertPrivateStudentStrategyOutcome({
    strategyApplicationId,
    privateStudentId: application.private_student_id,
    teacherStrategyId: application.teacher_strategy_id,
    teacherUserId,
    outcomeStatus: outcomeStatus as PrivateStudentStrategyOutcomeStatus,
    outcomeNote: outcomeNote || null,
    recordedAt: recordedAt || null,
  });

  revalidatePath("/notebook/teacher");
  revalidatePath("/notebook/teacher/private-students");
  revalidatePath(`/notebook/teacher/private-students/${application.private_student_id}`);
  revalidatePath("/notebook/teacher/reporting");
  revalidatePath(`/notebook/classes/${application.classroom_id}`);
  revalidatePath("/notebook/teacher/library");
  return { id: strategyApplicationId };
}

export async function recordTeacherPlaybookOutcomeAction(formData: FormData) {
  const teacherUserId = await getAuthUserId();
  const playbookApplicationId = ((formData.get("playbook_application_id") as string) || "").trim();
  const outcomeStatus = ((formData.get("outcome_status") as string) || "").trim();
  const outcomeNote = ((formData.get("outcome_note") as string) || "").trim();
  const recordedAt = ((formData.get("recorded_at") as string) || "").trim();

  if (!playbookApplicationId) {
    return { error: "Playbook application is required." };
  }

  if (!["helped", "partial", "no_change", "replace"].includes(outcomeStatus)) {
    return { error: "Outcome status is required." };
  }

  if (!(await canRecordTeacherPlaybookOutcome(teacherUserId, playbookApplicationId))) {
    return { error: "You cannot record an outcome for this playbook application." };
  }

  const application = await queryOne<{
    id: string;
    private_student_id: string;
    playbook_id: string;
    classroom_id: string;
  }>(
    `SELECT
       apps.id,
       apps.private_student_id,
       apps.playbook_id,
       private_students.classroom_id
     FROM private_student_playbook_applications apps
     INNER JOIN private_students
       ON private_students.id = apps.private_student_id
     WHERE apps.id = $1
     LIMIT 1`,
    [playbookApplicationId]
  );

  if (!application) {
    return { error: "Playbook application not found." };
  }

  await upsertPrivateStudentPlaybookOutcome({
    playbookApplicationId,
    privateStudentId: application.private_student_id,
    teacherPlaybookId: application.playbook_id,
    teacherUserId,
    outcomeStatus: outcomeStatus as PrivateStudentPlaybookOutcomeStatus,
    outcomeNote: outcomeNote || null,
    recordedAt: recordedAt || null,
  });

  revalidatePath("/notebook/teacher");
  revalidatePath("/notebook/teacher/private-students");
  revalidatePath(`/notebook/teacher/private-students/${application.private_student_id}`);
  revalidatePath("/notebook/teacher/reporting");
  revalidatePath(`/notebook/classes/${application.classroom_id}`);
  revalidatePath("/notebook/teacher/library");
  return { id: playbookApplicationId };
}
