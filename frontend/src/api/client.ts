import axios from "axios";
import { toast } from "sonner";

const API_URL = "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.get(`${API_URL}/auth/refresh`, { withCredentials: true });
        const { token } = res.data;

        localStorage.setItem("accessToken", token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const withFallback = async <T>(apiCall: () => Promise<T>, fallbackData: T): Promise<T> => {
  try {
    const response = await apiCall();
    return (response as any).data || response;
  } catch (error) {
    console.warn("Backend route not found or error occurred. Using mock/fallback data.");
    return fallbackData;
  }
};
