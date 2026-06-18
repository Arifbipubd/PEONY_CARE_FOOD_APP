// Notifications service — list, mark read, mark all read.
// MOCK MODE ACTIVE — real API calls are commented out below each function.

import { AppNotification } from '../types';
import { ApiNotification } from '../types/api';
import { MOCK_NOTIFICATIONS } from '../mock/notifications';
// import { api } from './api';

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
  // MOCK:
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_NOTIFICATIONS.results.map(mapApiNotification);
  /* REAL API:
  const res = await api.get('/notifications/');
  return (res.data.data.results as ApiNotification[]).map(mapApiNotification);
  */
};

export const markRead = async (_id: string): Promise<void> => {
  // MOCK: no-op
  /* REAL API:
  await api.patch(`/notifications/${_id}/read/`);
  */
};

export const markAllRead = async (): Promise<void> => {
  // MOCK: no-op
  /* REAL API:
  await api.post('/notifications/read-all/');
  */
};
