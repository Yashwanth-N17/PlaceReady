import axios from "axios";

/**
 * Global axios instance for communicating with the backend.
 * Uses VITE_API_URL or defaults to localhost:5000.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * High-level wrapper that executes an API call and gracefully falls back
 * to provided mock data if the network request fails or the backend is offline.
 *
 * @param request Function that executes the axios call
 * @param fallbackData Static mock data to return on failure
 */
export async function withFallback<T>(
  request: () => Promise<{ data: T }>,
  fallbackData: T
): Promise<T> {
  try {
    const response = await request();
    // In a real app, maybe we'd validate response.status here
    return response.data;
  } catch (error) {
    // Only log warning if not in production to keep console clean for users
    if (import.meta.env.DEV) {
      console.warn("Backend unreachable or request failed. Falling back to mock data.", error);
    }
    return fallbackData;
  }
}
