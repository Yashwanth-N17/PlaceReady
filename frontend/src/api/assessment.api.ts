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
