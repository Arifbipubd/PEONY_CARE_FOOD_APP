// Notifications service — list, mark read, mark all read.

import { AppNotification } from '../types';
import { MOCK_NOTIFICATIONS } from '../mock/notifications';

export const getNotifications = async (): Promise<AppNotification[]> => {
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_NOTIFICATIONS;
};

export const markRead = async (_id: string): Promise<void> => {
  // no-op in mock mode
};

export const markAllRead = async (): Promise<void> => {
  // no-op in mock mode
};
