import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle specific errors like 404, 500, etc.
    return Promise.reject(error);
  }
);

export const apiService = {
  get: <T>(url: string, params?: Record<string, unknown>) => api.get<unknown, T>(url, { params }),
  post: <T>(url: string, data?: unknown) => api.post<unknown, T>(url, data),
};
