// Notifications service — list, mark read, mark all read, unread count.

import { AppNotification } from '../types';
import { ApiNotification } from '../types/api';
import { api } from './api';

function mapApiNotification(d: ApiNotification): AppNotification {
  return {
    id: d.id,
    type: d.type,
    title: d.title,
    body: d.body,
    payload: d.payload,
    readAt: d.read_at,
    createdAt: d.created_at,
  };
}

export const getNotifications = async (): Promise<AppNotification[]> => {
  try {
    const res = await api.get('/notifications/');
    const results = (res.data?.data?.results ?? res.data?.results ?? []) as ApiNotification[];
    return results.map(mapApiNotification);
  } catch {
    // Endpoint may not be fully live yet — fail soft so Alerts screen still opens.
    return [];
  }
};

export const markRead = async (id: string): Promise<void> => {
  try {
    await api.patch(`/notifications/${id}/read/`);
  } catch {
    // no-op if backend route is unavailable
  }
};

export const markAllRead = async (): Promise<void> => {
  try {
    await api.post('/notifications/read-all/');
  } catch {
    // no-op if backend route is unavailable
  }
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const res = await api.get('/notifications/unread-count/');
    return (res.data.data.unread_count as number) ?? 0;
  } catch {
    return 0;
  }
};
