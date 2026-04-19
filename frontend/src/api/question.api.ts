import { apiClient as client } from "./client";

export interface Question {
  id?: string;
  text: string;
  answer: string;
  options?: string[] | null;
  type?: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  tags?: string[];
  isVisible?: boolean;
}

export const extractQuestions = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await client.post<{ success: boolean; data: Question[]; message: string }>(
    "/questions/extract",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const saveQuestions = async (questions: Question[]) => {
  const response = await client.post<{ success: boolean; data: any[]; message: string }>(
    "/questions/save",
    { questions }
  );
  return response.data;
};

export const getQuestions = async (params?: { 
  subject?: string; 
  topic?: string; 
  difficulty?: string; 
  tag?: string;
}) => {
  const response = await client.get<{ success: boolean; data: (Question & { tags: { name: string }[] })[] }>(
    "/questions",
    { params }
  );
  return response.data;
};
