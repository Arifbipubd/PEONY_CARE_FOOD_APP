import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api/v1';

export class ApiError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Track concurrent 401s so we only refresh once
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function drainQueue(err: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token!)));
  pendingQueue = [];
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ error?: { code: string; message: string } }>) => {
    const original = error.config as RetryConfig | undefined;

    // --- 401: try token refresh ---
    if (error.response?.status === 401 && original && !original._retry) {
      const { refreshToken, user, isApproved, clearAuth, setAuth } = useAuthStore.getState();

      if (!refreshToken || !user) {
        clearAuth();
        return Promise.reject(new ApiError('SESSION_EXPIRED', 'Session expired. Please log in again.'));
      }

      if (isRefreshing) {
        // Queue this request until the ongoing refresh finishes
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // Use plain axios (not `api`) to avoid triggering this interceptor again
        const res = await axios.post(
          `${BASE_URL}/auth/token/refresh/`,
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );
        const newAccessToken: string = res.data.data.access;

        setAuth(newAccessToken, refreshToken, user, isApproved);
        drainQueue(null, newAccessToken);

        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch (refreshError) {
        drainQueue(refreshError, null);
        clearAuth();
        return Promise.reject(new ApiError('SESSION_EXPIRED', 'Session expired. Please log in again.'));
      } finally {
        isRefreshing = false;
      }
    }

    // --- Other errors ---
    const apiErr = error.response?.data?.error;
    if (apiErr) {
      return Promise.reject(new ApiError(apiErr.code, apiErr.message));
    }
    if (!error.response) {
      return Promise.reject(new ApiError('NETWORK_ERROR', 'No connection. Please check your network.'));
    }
    return Promise.reject(new ApiError('SERVER_ERROR', 'Something went wrong. Please try again.'));
  },
);
