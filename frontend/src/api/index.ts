/**
 * Public API surface for the PlaceReady frontend.
 *
 * Each function performs an axios request to the real backend.
 * Fallbacks to mock data have been removed to ensure strict data binding with the database.
 */
import { apiClient, withFallback } from "./client";
import {
  type ScheduledTest, type StudentRecord, type Company, type PlacementDrive,
  type Notification, type TrainingModule, type FacultyMember, type QuizQuestion,
} from "@/data/mock";

// ============= STUDENT =============
export const StudentAPI = {
  me: () =>
    withFallback(() => apiClient.get("/student/me"), null),

  dashboard: () =>
    withFallback(() => apiClient.get("/student/dashboard"), {
      readiness: 0,
      skillsOverTime: [],
      skillRadar: [],
      weakAreas: [],
      readinessTrend: [],
    }),

  tests: () =>
    withFallback<ScheduledTest[]>(
      () => apiClient.get("/assessments").then(res => {
        const body = res.data;
        const data = body.data || (Array.isArray(body) ? body : []);
        return data.map((t: any) => ({
          id: t.id,
          title: t.title,
          subject: t.subject,
          type: t.type,
          durationMin: t.durationMin || t.duration,
          questionsCount: t.questionsCount || 0,
          date: t.date || t.scheduledAt,
          status: t.status,
          hasAttempted: t.hasAttempted
        }));
      }),
      []
    ),

  results: () =>
    withFallback(
      () => apiClient.get("/assessments/attempts").then(res => res.data.data.map((a: any) => ({
        id: a.id,
        title: a.assessment.title,
        subject: a.assessment.subject,
        score: a.score,
        correct: a.correctCount,
        total: a.totalCount,
        timeTakenMin: Math.round(a.timeTaken / 60),
        date: new Date(a.createdAt).toLocaleDateString(),
        percentile: a.percentile ?? 0,
        isReleased: a.isReleased,
        status: a.isReleased ? (a.score >= 80 ? "Excellent" : a.score >= 60 ? "Good" : "Needs Work") : "Pending Review",
      }))),
      []
    ),


  quiz: (id?: string) =>
    withFallback<QuizQuestion[]>(
      () => apiClient.get(`/assessments/${id}`).then(res => res.data.data.questions.map((q: any) => ({
        id: q.id,
        question: q.text,
        options: Array.isArray(q.options) ? q.options : [],
        correctIndex: Array.isArray(q.options) ? q.options.indexOf(q.answer) : -1,
        topic: q.topic || "General",
        difficulty: q.difficulty
      }))),
      []
    ),

  submitQuiz: (testId: string, payload: any) =>
    apiClient.post(`/assessments/${testId}/submit`, payload).then(res => res.data),

  refreshReadiness: () =>
    apiClient.post("/student/refresh-readiness").then(res => res.data.data),

  trainingModules: () =>
    withFallback<TrainingModule[]>(() => apiClient.get("/student/training"), []),

  updateModuleProgress: (moduleId: string, progress: number) =>
    apiClient.patch(`/student/training/${moduleId}`, { progress }).then(res => res.data),
};

// ============= FACULTY =============
export const FacultyAPI = {
  me: () =>
    withFallback<FacultyMember | null>(() => apiClient.get("/faculty/me"), null),

  students: (params?: { mentorId?: string; subject?: string }) =>
    withFallback<StudentRecord[]>(() => apiClient.get("/faculty/students"), []),

  studentById: (id: string) =>
    withFallback<StudentRecord | null>(() => apiClient.get(`/faculty/students/${id}`), null),

  batchPerformance: () =>
    withFallback(() => apiClient.get("/faculty/dash/batch-performance"), []),

  skillGaps: () =>
    withFallback(() => apiClient.get("/faculty/dash/skill-gaps"), []),

  scheduleTest: (payload: Partial<ScheduledTest>) =>
    apiClient.post("/assessments", payload).then(res => res.data),

  uploadMarks: (rows: Array<Record<string, unknown>>) =>
    apiClient.post("/faculty/marks", { rows }).then(res => res.data),

  saveMapping: (mapping: Record<string, string>) =>
    apiClient.post("/faculty/mapping", mapping).then(res => res.data),
};

// ============= PLACEMENT =============
export const PlacementAPI = {
  companies: () =>
    withFallback<Company[]>(() => apiClient.get("/placement/companies"), []),

  createCompany: (payload: Partial<Company>) =>
    apiClient.post("/placement/companies", payload).then(res => res.data),

  shortlist: (filters?: { minCgpa?: number; minReadiness?: number; branch?: string }) =>
    withFallback<any[]>(() => apiClient.get("/placement/shortlist", { params: filters }), []),

  drives: () =>
    withFallback<any[]>(() => apiClient.get("/placement/drives"), []),

  createDrive: (payload: any) =>
    apiClient.post("/placement/drives", payload).then(res => res.data),

  applyToDrive: (driveId: string) =>
    apiClient.post(`/placement/drives/${driveId}/apply`).then(res => res.data),

  driveApplicants: (driveId: string) =>
    withFallback<any>(() => apiClient.get(`/placement/drives/${driveId}/applicants`), { applicants: [], drive: null }),

  updateApplicantStatus: (driveId: string, studentId: string, status: string) =>
    apiClient.patch(`/placement/drives/${driveId}/applicants/${studentId}`, { status }).then(res => res.data),

  trends: () =>
    withFallback(() => apiClient.get("/placement/trends").then(res => res.data.data.placementTrends || res.data.data), []),
};

// ============= REPORTS =============
export const ReportsAPI = {
  monthlyReadiness: () =>
    withFallback(() => apiClient.get("/reports/monthly-readiness"), []),

  yearOverYear: () =>
    withFallback(() => apiClient.get("/reports/yoy"), []),

  skillHeatmap: () =>
    withFallback(() => apiClient.get("/reports/heatmap"), []),

  branchComparison: () =>
    withFallback(() => apiClient.get("/reports/branch-comparison"), []),

  companyTiers: () =>
    withFallback(() => apiClient.get("/reports/company-tiers"), []),
};

// ============= NOTIFICATIONS =============
export const NotificationsAPI = {
  list: (role: "student" | "faculty" | "placement") =>
    withFallback<Notification[]>(
      () => apiClient.get("/notifications", { params: { role } }),
      [],
    ),

  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).then(res => res.data),

  markAllRead: () =>
    apiClient.post("/notifications/mark-all-read").then(res => res.data),
};

// ============= QUESTIONS =============
export const QuestionAPI = {
  extract: (file: File) => apiClient.post("/questions/extract", { file }, { headers: { "Content-Type": "multipart/form-data" } }),
  save: (questions: any[]) => apiClient.post("/questions/save", { questions }),
  list: (params?: any) => apiClient.get("/questions", { params }),
};

import { createAssessment, getAssessments, getAssessmentById, submitAttempt, getAttempts, publishResults, gradeAttempt, getPendingReviews } from "./assessment.api.ts";
export const AssessmentAPI = {
  create: createAssessment,
  list: getAssessments,
  getById: getAssessmentById,
  submit: submitAttempt,
  history: getAttempts,
  publish: publishResults,
  grade: gradeAttempt,
  pendingReviews: getPendingReviews,
  assessmentAttempts: (assessmentId: string) =>
    withFallback<any[]>(() => apiClient.get(`/assessments/${assessmentId}/attempts/all`), []),
};

// ============= UTIL =============
export const facultyList: FacultyMember[] = [];
