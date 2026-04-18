/**
 * Public API surface for the PlaceReady frontend.
 *
 * Each function performs an axios request and falls back to mock data when
 * no backend responds. See `client.ts` for the fallback wrapper.
 *
 * Endpoint contracts are documented in README.md.
 */
import { apiClient, withFallback } from "./client";
import {
  scheduledTests, recentResults, sampleQuiz, trainingModules,
  students, faculty, companies, drives, notifications,
  skillsOverTime, skillRadar, weakAreas, batchPerformance, skillGaps,
  placementHistory, monthlyReadiness, yearOverYear, readinessTrend,
  currentUser, currentFaculty, readinessScore, skillHeatmap,
  type ScheduledTest, type StudentRecord, type Company, type PlacementDrive,
  type Notification, type TrainingModule, type FacultyMember, type QuizQuestion,
} from "@/data/mock";

// ============= STUDENT =============
export const StudentAPI = {
  me: () =>
    withFallback(() => apiClient.get("/student/me"), { ...currentUser, readiness: readinessScore }),

  dashboard: () =>
    withFallback(() => apiClient.get("/student/dashboard"), {
      readiness: readinessScore,
      skillsOverTime,
      skillRadar,
      weakAreas,
      readinessTrend,
    }),

  tests: () =>
    withFallback<ScheduledTest[]>(() => apiClient.get("/student/tests"), scheduledTests),

  results: () =>
    withFallback(() => apiClient.get("/student/results"), recentResults),

  quiz: (_topic?: string) =>
    withFallback<QuizQuestion[]>(() => apiClient.get("/student/quiz"), sampleQuiz),

  submitQuiz: (testId: string, answers: Record<string, number>) =>
    withFallback(() => apiClient.post(`/student/tests/${testId}/submit`, { answers }), {
      ok: true,
      score: 0,
      submittedAt: new Date().toISOString(),
    }),

  trainingModules: () =>
    withFallback<TrainingModule[]>(() => apiClient.get("/student/training"), trainingModules),

  updateModuleProgress: (moduleId: string, progress: number) =>
    withFallback(() => apiClient.patch(`/student/training/${moduleId}`, { progress }), {
      ok: true, moduleId, progress,
    }),
};

// ============= FACULTY =============
export const FacultyAPI = {
  me: () =>
    withFallback<FacultyMember>(() => apiClient.get("/faculty/me"), currentFaculty),

  students: (params?: { mentorId?: string; subject?: string }) =>
    withFallback<StudentRecord[]>(() => apiClient.get("/faculty/students", { params }), students),

  studentById: (id: string) =>
    withFallback<StudentRecord | null>(
      () => apiClient.get(`/faculty/students/${id}`),
      students.find((s) => s.id === id) || null,
    ),

  batchPerformance: () =>
    withFallback(() => apiClient.get("/faculty/batches"), batchPerformance),

  skillGaps: () =>
    withFallback(() => apiClient.get("/faculty/skill-gaps"), skillGaps),

  scheduleTest: (payload: Partial<ScheduledTest>) =>
    withFallback(() => apiClient.post("/faculty/tests", payload), { ok: true, id: `t-${Date.now()}` }),

  uploadMarks: (rows: Array<Record<string, unknown>>) =>
    withFallback(() => apiClient.post("/faculty/marks", { rows }), { ok: true, count: rows.length }),

  saveMapping: (mapping: Record<string, string>) =>
    withFallback(() => apiClient.post("/faculty/mapping", mapping), { ok: true }),
};

// ============= PLACEMENT =============
export const PlacementAPI = {
  companies: () =>
    withFallback<Company[]>(() => apiClient.get("/placement/companies"), companies),

  createCompany: (payload: Partial<Company>) =>
    withFallback(() => apiClient.post("/placement/companies", payload), {
      ok: true,
      id: `co-${Date.now()}`,
      ...payload,
    }),

  shortlist: (companyId: string) =>
    withFallback<StudentRecord[]>(() => apiClient.get(`/placement/shortlist/${companyId}`), students),

  drives: () =>
    withFallback<PlacementDrive[]>(() => apiClient.get("/placement/drives"), drives),

  createDrive: (payload: Partial<PlacementDrive>) =>
    withFallback(() => apiClient.post("/placement/drives", payload), {
      ok: true, id: `dr-${Date.now()}`, ...payload,
    }),

  updateApplicantStatus: (driveId: string, studentId: string, status: string) =>
    withFallback(
      () => apiClient.patch(`/placement/drives/${driveId}/applicants/${studentId}`, { status }),
      { ok: true },
    ),

  trends: () =>
    withFallback(() => apiClient.get("/placement/trends"), placementHistory),
};

// ============= REPORTS =============
export const ReportsAPI = {
  monthlyReadiness: () =>
    withFallback(() => apiClient.get("/reports/monthly-readiness"), monthlyReadiness),

  yearOverYear: () =>
    withFallback(() => apiClient.get("/reports/yoy"), yearOverYear),

  skillHeatmap: () =>
    withFallback(() => apiClient.get("/reports/heatmap"), skillHeatmap),
};

// ============= NOTIFICATIONS =============
export const NotificationsAPI = {
  list: (role: "student" | "faculty" | "placement") =>
    withFallback<Notification[]>(
      () => apiClient.get("/notifications", { params: { role } }),
      notifications.filter((n) => n.forRole.includes(role)),
    ),

  markRead: (id: string) =>
    withFallback(() => apiClient.patch(`/notifications/${id}/read`), { ok: true, id }),

  markAllRead: (role: "student" | "faculty" | "placement") =>
    withFallback(() => apiClient.post("/notifications/mark-all-read", { role }), { ok: true }),
};

// ============= UTIL =============
export { faculty as facultyList };
