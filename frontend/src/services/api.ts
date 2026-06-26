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
  console.log(`[API] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.params ?? '');
  return config;
});

// ── Response Interceptor ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✅ ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error: AxiosError) => {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error(
        `[API] ❌ Network Error — Cannot reach backend at ${API_BASE_URL}`,
        '\n  → Is the backend running? Start it with: cd backend && uvicorn main:app --reload',
        '\n  → Error code:', error.code,
        '\n  → URL:', error.config?.url,
      );
    } else {
      const status = error.response.status;
      const detail = (error.response.data as any)?.detail || error.message;
      console.error(
        `[API] ❌ HTTP ${status} ${error.config?.url}`,
        '\n  → Detail:', detail,
      );
    }
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
