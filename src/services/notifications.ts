// Notifications service — grouped inbox, pagination, mark read, unread badge.

import {
  AppNotification,
  NotificationGroup,
  NotificationInbox,
  NotificationPagination,
} from '../types';
import {
  ApiNotification,
  ApiNotificationGroup,
  ApiNotificationList,
  ApiNotificationPagination,
  ApiNotificationReadAll,
} from '../types/api';
import { api, logApiCatch } from './api';

export type GetNotificationsParams = {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 20;

function mapApiNotification(d: ApiNotification): AppNotification {
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

function mapPagination(p: ApiNotificationPagination): NotificationPagination {
  return {
    page: p.page,
    pageSize: p.page_size,
    totalCount: p.total_count,
    totalPages: p.total_pages,
    hasNext: p.has_next,
    hasPrevious: p.has_previous,
  };
}

function mapGroup(g: ApiNotificationGroup): NotificationGroup {
  const items = (g.items ?? []).map(mapApiNotification);
  return {
    key: g.key,
    label: g.label,
    date: g.date,
    count: typeof g.count === 'number' ? g.count : items.length,
    items,
  };
}

function emptyInbox(): NotificationInbox {
  return {
    groups: [],
    unreadCount: 0,
    pagination: {
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalCount: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    },
  };
}

/** GET /notifications/?page=&page_size=&unread_only= */
export const getNotifications = async (
  params?: GetNotificationsParams,
): Promise<NotificationInbox> => {
  try {
    const res = await api.get('/notifications/', {
      params: {
        page: params?.page ?? 1,
        page_size: params?.pageSize ?? DEFAULT_PAGE_SIZE,
        ...(params?.unreadOnly ? { unread_only: true } : {}),
      },
    });
    const data = (res.data?.data ?? res.data) as ApiNotificationList;
    const groups = Array.isArray(data?.groups) ? data.groups.map(mapGroup) : [];
    const unreadCount =
      typeof data?.unread_count === 'number'
        ? data.unread_count
        : groups.reduce(
            (sum, g) => sum + g.items.filter((n) => n.readAt === null).length,
            0,
          );

    return {
      groups,
      unreadCount,
      pagination: data?.pagination
        ? mapPagination(data.pagination)
        : {
            page: params?.page ?? 1,
            pageSize: params?.pageSize ?? DEFAULT_PAGE_SIZE,
            totalCount: groups.reduce((sum, g) => sum + g.items.length, 0),
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
    };
  } catch (err) {
    logApiCatch('getNotifications', err);
    return emptyInbox();
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

export type MarkAllReadResult = {
  markedRead: number;
  unreadCount: number;
};

/** POST /notifications/read-all/ */
export const markAllRead = async (): Promise<MarkAllReadResult> => {
  try {
    const res = await api.post('/notifications/read-all/');
    const data = (res.data?.data ?? res.data) as ApiNotificationReadAll;
    return {
      markedRead: typeof data?.marked_read === 'number' ? data.marked_read : 0,
      unreadCount: typeof data?.unread_count === 'number' ? data.unread_count : 0,
    };
  } catch (err) {
    logApiCatch('markAllRead', err);
    throw err;
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
