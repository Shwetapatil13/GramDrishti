import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120s — GEE calls can be slow
});

// ── Request Interceptor ────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {

  return config;
});

// ── Response Interceptor ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {

    return response.data;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export const apiService = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    api.get<unknown, T>(url, { params }),
  post: <T>(url: string, data?: unknown) =>
    api.post<unknown, T>(url, data),
  search: <T>(url: string, params?: Record<string, unknown>) =>
    api.get<unknown, T>(url, { params }),
};
