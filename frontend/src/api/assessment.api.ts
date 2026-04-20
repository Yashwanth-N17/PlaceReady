import { apiClient as client } from "./client";

export interface Assessment {
  id?: string;
  title: string;
  description?: string;
  type: string;
  subject?: string;
  topic?: string;
  scheduledAt: string;
  duration: number;
  questions: any[];
  studentIds?: string[];
}

export const createAssessment = async (payload: Assessment) => {
  const response = await client.post<{ success: boolean; data: any; message: string }>(
    "/assessments",
    payload
  );
  return response.data;
};

export const getAssessments = async () => {
  const response = await client.get<{ success: boolean; data: any[] }>(
    "/assessments"
  );
  return response.data;
};

export const getAssessmentById = async (id: string) => {
  const response = await client.get<{ success: boolean; data: any }>(`/assessments/${id}`);
  return response.data;
};

export const submitAttempt = async (assessmentId: string, payload: any) => {
  const response = await client.post<{ success: boolean; data: any }>(`/assessments/${assessmentId}/submit`, payload);
  return response.data;
};

export const getAttempts = async () => {
  const response = await client.get<{ success: boolean; data: any[] }>("/assessments/attempts");
  return response.data;
};

export const publishResults = async (id: string) => {
  const response = await client.post<{ success: boolean; data: any }>(`/assessments/${id}/release`);
  return response.data;
};

export const gradeAttempt = async (attemptId: string, payload: { score: number; correctCount: number }) => {
  const response = await client.post<{ success: boolean; data: any }>(`/assessments/attempts/${attemptId}/grade`, payload);
  return response.data;
};

export const getPendingReviews = async () => {
  const response = await client.get<{ success: boolean; data: any[] }>("/assessments/attempts/pending");
  return response.data;
};
