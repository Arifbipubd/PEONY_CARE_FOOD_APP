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

const FILE_SIZE_HINT =
  /file size|too large|too big|maximum size|max size|entity too large|payload too large|request entity/i;

const FILE_TOO_LARGE_MSG =
  'This photo is too large. Please choose a smaller image and try again.';
const UPLOAD_TIMEOUT_MSG =
  'The upload took too long. Please try again with a smaller photo or a stronger connection.';
const REQUEST_TIMEOUT_MSG = 'The request took too long. Please try again.';
const NETWORK_MSG = 'No connection. Please check your network.';
const GENERIC_MSG = 'Something went wrong. Please try again.';

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

function flattenDetailMessages(details?: Record<string, unknown>): string[] {
  if (!details) return [];
  const out: string[] = [];
  for (const value of Object.values(details)) {
    if (typeof value === 'string') {
      out.push(value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') out.push(item);
      }
    } else if (value && typeof value === 'object') {
      out.push(...flattenDetailMessages(value as Record<string, unknown>));
    }
  }
  return out;
}

/** User-facing copy for alerts — never dumps error codes or raw JSON. */
export function getUserFacingErrorMessage(
  err: unknown,
  fallback = GENERIC_MSG,
): string {
  if (err instanceof ApiError) {
    if (err.code === 'FILE_TOO_LARGE') return FILE_TOO_LARGE_MSG;
    if (err.code === 'UPLOAD_TIMEOUT') {
      return err.message.includes('upload') ? UPLOAD_TIMEOUT_MSG : REQUEST_TIMEOUT_MSG;
    }
    if (err.code === 'NETWORK_ERROR' || err.code === 'SESSION_EXPIRED') {
      return err.message;
    }

    const fieldMsg =
      firstDetailMessage(err.details, 'photo') ||
      firstDetailMessage(err.details, 'photos') ||
      firstDetailMessage(err.details, 'image') ||
      firstDetailMessage(err.details, 'category') ||
      firstDetailMessage(err.details, 'non_field_errors');
    const nested = flattenDetailMessages(err.details);
    const haystack = `${err.message} ${fieldMsg} ${nested.join(' ')}`;
    if (FILE_SIZE_HINT.test(haystack)) return FILE_TOO_LARGE_MSG;
    if (err.code === 'VALIDATION_ERROR') {
      if (/not a valid choice/i.test(haystack)) {
        return 'Please choose a valid food category.';
      }
      if (/integer is required/i.test(haystack)) {
        return 'Please select the days this listing should repeat.';
      }
      if (fieldMsg && !/request could not be processed/i.test(fieldMsg)) return fieldMsg;
      if (nested.length > 0 && !/request could not be processed/i.test(nested[0] ?? '')) {
        return nested[0] ?? fallback;
      }
    }
    if (fieldMsg) return fieldMsg;
    if (err.message.trim() && !/request could not be processed/i.test(err.message)) {
      return err.message;
    }
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
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

const DEFAULT_TIMEOUT_MS = 15_000;
/** Photo uploads need more time than JSON calls, even after compression. */
const MULTIPART_TIMEOUT_MS = 45_000;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token + log every outgoing request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.timeout = MULTIPART_TIMEOUT_MS;
  }
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
    // Some endpoints return HTTP 200 with { status: "error", error: { code, message } }.
    const body = res.data as {
      status?: string;
      error?: { code?: string; message?: string; details?: Record<string, unknown> };
    } | null;
    if (
      body &&
      typeof body === 'object' &&
      body.status === 'error' &&
      body.error?.code &&
      body.error?.message
    ) {
      return Promise.reject(
        new ApiError(body.error.code, body.error.message, body.error.details),
      );
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
    if (error.response?.status === 413) {
      return Promise.reject(new ApiError('FILE_TOO_LARGE', FILE_TOO_LARGE_MSG));
    }

    const apiErr = error.response?.data?.error;
    if (apiErr) {
      const details = apiErr.details;
      const photoHint =
        firstDetailMessage(details, 'photo') ||
        firstDetailMessage(details, 'photos') ||
        firstDetailMessage(details, 'image');
      if (FILE_SIZE_HINT.test(`${apiErr.message} ${photoHint}`)) {
        return Promise.reject(new ApiError('FILE_TOO_LARGE', FILE_TOO_LARGE_MSG, details));
      }
      return Promise.reject(new ApiError(apiErr.code, apiErr.message, details));
    }

    const rawBody = error.response?.data;
    if (rawBody && typeof rawBody === 'object') {
      const record = rawBody as Record<string, unknown>;
      const photoMsg =
        firstDetailMessage(record, 'photo') ||
        firstDetailMessage(record, 'photos');
      if (photoMsg) {
        const code = FILE_SIZE_HINT.test(photoMsg) ? 'FILE_TOO_LARGE' : 'VALIDATION_ERROR';
        const message = code === 'FILE_TOO_LARGE' ? FILE_TOO_LARGE_MSG : photoMsg;
        return Promise.reject(new ApiError(code, message, record));
      }
    }
    if (typeof rawBody === 'string' && FILE_SIZE_HINT.test(rawBody)) {
      return Promise.reject(new ApiError('FILE_TOO_LARGE', FILE_TOO_LARGE_MSG));
    }

    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED' || /timeout/i.test(error.message);
      if (isTimeout) {
        const wasUpload = typeof FormData !== 'undefined' && original?.data instanceof FormData;
        return Promise.reject(new ApiError(
          'UPLOAD_TIMEOUT',
          wasUpload ? UPLOAD_TIMEOUT_MSG : REQUEST_TIMEOUT_MSG,
        ));
      }
      return Promise.reject(new ApiError('NETWORK_ERROR', NETWORK_MSG));
    }
    return Promise.reject(new ApiError('SERVER_ERROR', GENERIC_MSG));
  },
);
