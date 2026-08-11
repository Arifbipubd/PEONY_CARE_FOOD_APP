// Notifications service — inbox list, unread filter, mark read, unread badge count.
// Backend shape: { data: { items: Notification[], unread_count: number } }

import { AppNotification } from '../types';
import { ApiNotification, ApiNotificationList } from '../types/api';
import { api, logApiCatch } from './api';

export type GetNotificationsParams = {
  unreadOnly?: boolean;
};

export type NotificationInbox = {
  items: AppNotification[];
  unreadCount: number;
};

function mapApiNotification(d: ApiNotification): AppNotification {
  // Prefer read_at; fall back to is_read from the backend serializer.
  let readAt: string | null = d.read_at ?? null;
  if (readAt == null && d.is_read === true) {
    readAt = new Date().toISOString();
  }
  if (d.is_read === false) {
    readAt = null;
  }
  return {
    id: String(d.id),
    type: d.type ?? 'SYSTEM',
    title: d.title ?? '',
    body: d.body ?? '',
    payload: (d.payload ?? {}) as Record<string, unknown>,
    readAt,
    createdAt: d.created_at ?? new Date().toISOString(),
  };
}

/** Backend uses `items`; keep fallbacks for older shapes. */
function extractRawItems(payload: unknown): ApiNotification[] {
  if (Array.isArray(payload)) {
    return payload as ApiNotification[];
  }
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.items)) {
    return obj.items as ApiNotification[];
  }
  if (Array.isArray(obj.results)) {
    return obj.results as ApiNotification[];
  }
  if (Array.isArray(obj.notifications)) {
    return obj.notifications as ApiNotification[];
  }
  if (obj.data !== undefined) {
    return extractRawItems(obj.data);
  }
  return [];
}

function unreadFromPayload(payload: unknown, items: AppNotification[]): number {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const count = (payload as { unread_count?: unknown }).unread_count;
    if (typeof count === 'number') return count;
    if (typeof count === 'string' && count.trim() !== '') {
      const n = Number(count);
      if (!Number.isNaN(n)) return n;
    }
  }
  return items.filter((n) => n.readAt === null).length;
}

/** GET /notifications/ — full inbox, or ?unread_only=true */
export const getNotifications = async (
  params?: GetNotificationsParams,
): Promise<NotificationInbox> => {
  try {
    const res = await api.get('/notifications/', {
      params: params?.unreadOnly ? { unread_only: true } : undefined,
    });
    const data = (res.data?.data ?? res.data) as ApiNotificationList | ApiNotification[] | unknown;
    const items = extractRawItems(data).map(mapApiNotification);
    return {
      items,
      unreadCount: unreadFromPayload(data, items),
    };
  } catch (err) {
    logApiCatch('getNotifications', err);
    // Fail soft so Alerts screen still opens.
    return { items: [], unreadCount: 0 };
  }
};

/** POST /notifications/<id>/read/ */
export const markRead = async (id: string): Promise<void> => {
  try {
    await api.post(`/notifications/${id}/read/`);
  } catch (err) {
    logApiCatch('markRead', err);
  }
};

/** POST /notifications/read-all/ */
export const markAllRead = async (): Promise<void> => {
  try {
    await api.post('/notifications/read-all/');
  } catch (err) {
    logApiCatch('markAllRead', err);
  }
};

/** GET /notifications/unread-count/ — badge source of truth */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const res = await api.get('/notifications/unread-count/');
    const raw = res.data?.data ?? res.data;
    const count =
      (typeof raw === 'object' && raw !== null
        ? (raw as { unread_count?: unknown }).unread_count
        : undefined) ?? res.data?.unread_count ?? 0;
    return typeof count === 'number' ? count : Number(count) || 0;
  } catch (err) {
    logApiCatch('getUnreadCount', err);
    return 0;
  }
};
