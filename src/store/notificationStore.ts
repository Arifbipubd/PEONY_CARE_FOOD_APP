// Notification store — grouped inbox, pagination cursor, unread badge.

import { create } from 'zustand';
import { AppNotification, NotificationGroup, NotificationInbox } from '../types';

function flattenIds(groups: NotificationGroup[]): Set<string> {
  const ids = new Set<string>();
  for (const g of groups) {
    for (const item of g.items) ids.add(item.id);
  }
  return ids;
}

/** Merge page groups into existing (same day key → append unique items). */
export function mergeNotificationGroups(
  existing: NotificationGroup[],
  incoming: NotificationGroup[],
): NotificationGroup[] {
  const map = new Map<string, NotificationGroup>();

  for (const g of existing) {
    map.set(g.key, { ...g, items: [...g.items] });
  }

  for (const g of incoming) {
    const prev = map.get(g.key);
    if (!prev) {
      map.set(g.key, { ...g, items: [...g.items] });
      continue;
    }
    const seen = new Set(prev.items.map((i) => i.id));
    const items = [...prev.items];
    for (const item of g.items) {
      if (!seen.has(item.id)) items.push(item);
    }
    map.set(g.key, { ...prev, items, count: items.length });
  }

  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
}

interface NotificationStore {
  groups: NotificationGroup[];
  unreadCount: number;
  page: number;
  hasNext: boolean;
  totalCount: number;

  /** Replace inbox with page 1 (or any full replace). */
  setInbox: (inbox: NotificationInbox) => void;
  /** Append a later page into existing groups. */
  appendInbox: (inbox: NotificationInbox) => void;
  setUnreadCount: (count: number) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  groups: [],
  unreadCount: 0,
  page: 0,
  hasNext: false,
  totalCount: 0,

  setInbox: (inbox) =>
    set({
      groups: inbox.groups,
      unreadCount: Math.max(0, inbox.unreadCount),
      page: inbox.pagination.page,
      hasNext: inbox.pagination.hasNext,
      totalCount: inbox.pagination.totalCount,
    }),

  appendInbox: (inbox) =>
    set((state) => {
      const existingIds = flattenIds(state.groups);
      const dedupedIncoming = inbox.groups.map((g) => ({
        ...g,
        items: g.items.filter((i) => !existingIds.has(i.id)),
      })).filter((g) => g.items.length > 0);

      return {
        groups: mergeNotificationGroups(state.groups, dedupedIncoming),
        unreadCount: Math.max(0, inbox.unreadCount),
        page: inbox.pagination.page,
        hasNext: inbox.pagination.hasNext,
        totalCount: inbox.pagination.totalCount,
      };
    }),

  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

  markRead: (id) =>
    set((state) => {
      let wasUnread = false;
      const groups = state.groups.map((g) => ({
        ...g,
        items: g.items.map((n: AppNotification) => {
          if (n.id !== id || n.readAt !== null) return n;
          wasUnread = true;
          return { ...n, readAt: new Date().toISOString() };
        }),
      }));
      return {
        groups,
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }),

  markAllRead: () =>
    set((state) => ({
      groups: state.groups.map((g) => ({
        ...g,
        items: g.items.map((n) => ({
          ...n,
          readAt: n.readAt ?? new Date().toISOString(),
        })),
      })),
      unreadCount: 0,
    })),

  clearNotifications: () =>
    set({
      groups: [],
      unreadCount: 0,
      page: 0,
      hasNext: false,
      totalCount: 0,
    }),
}));
