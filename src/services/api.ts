import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

if (__DEV__) {
  console.log(
    '[API] baseURL =',
    BASE_URL || '(EMPTY — set EXPO_PUBLIC_API_URL in .env and restart with npx expo start --clear)',
  );
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** First string message for a field key in Django-style API error details. */
export function firstDetailMessage(
  details: Record<string, unknown> | undefined,
  key: string,
): string {
  const value = details?.[key];
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string');
    return typeof first === 'string' ? first : '';
  }
  return typeof value === 'string' ? value : '';
}

/** Dev-only: log structured API failures from screen catch blocks. */
export function logApiCatch(context: string, err: unknown): void {
  if (!__DEV__) return;
  if (err instanceof ApiError) {
    console.error(`[API] catch @ ${context}`, {
      code: err.code,
      message: err.message,
      details: err.details ?? null,
    });
    return;
  }
  console.error(`[API] catch @ ${context}`, err);
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token + log every outgoing request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (__DEV__) {
    const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
    console.log(`[API] --> ${config.method?.toUpperCase()} ${fullUrl}`, {
      params: config.params ?? null,
      data: config.data ?? null,
    });
    if (!config.baseURL) {
      console.warn('[API] baseURL is empty — request will fail with NETWORK_ERROR');
    }
  }
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
  (res) => {
    if (__DEV__) {
      console.log(`[API] <-- ${res.status} ${res.config.url}`, res.data);
    }
    return res;
  },
  async (error: AxiosError<{ error?: { code: string; message: string; details?: Record<string, unknown> } }>) => {
    if (__DEV__) {
      const fullUrl = `${error.config?.baseURL ?? BASE_URL}${error.config?.url ?? ''}`;
      console.error('[API] ERR', {
        status: error.response?.status ?? null,
        url: fullUrl,
        axiosCode: error.code ?? null,
        axiosMessage: error.message,
        responseBody: error.response?.data ?? null,
        baseURL: BASE_URL || '(empty)',
      });
    }
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
      return Promise.reject(new ApiError(apiErr.code, apiErr.message, apiErr.details));
    }
    if (!error.response) {
      return Promise.reject(new ApiError('NETWORK_ERROR', 'No connection. Please check your network.'));
    }
    return Promise.reject(new ApiError('SERVER_ERROR', 'Something went wrong. Please try again.'));
  },
);
