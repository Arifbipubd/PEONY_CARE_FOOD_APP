// Notification store — holds the list of in-app notifications and the unread count.
// The bell icon badge in the tab bar reads unreadCount from here.

import { create } from 'zustand';
import { AppNotification } from '../types';

interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: number;

  setNotifications: (items: AppNotification[]) => void;
  setUnreadCount: (count: number) => void;
  /** Set inbox + badge together so list/badge cannot drift after a fetch. */
  setInbox: (items: AppNotification[], unreadCount: number) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (items) =>
    set({
      notifications: items,
      unreadCount: items.filter((n) => n.readAt === null).length,
    }),

  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

  setInbox: (items, unreadCount) =>
    set({
      notifications: items,
      unreadCount: Math.max(0, unreadCount),
    }),

  markRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => n.readAt === null).length,
      };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
