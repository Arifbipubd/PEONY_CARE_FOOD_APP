// Mock notifications — used by notification service until backend is ready.

import { AppNotification } from '../types';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    type: 'CLAIM_CONFIRMED',
    title: 'Meal claimed successfully!',
    body: 'You claimed Chicken Rice from Tian Tian Hainanese. Pick up by 8:00 PM today.',
    readAt: null,
    createdAt: '2026-06-14T18:05:00+08:00',
  },
  {
    id: 'notif-002',
    type: 'NEW_FOOD_NEARBY',
    title: 'New meals available near you',
    body: 'Ya Kun Kaya Toast just posted 15 Kaya Toast Sets — 2.1 km away.',
    readAt: null,
    createdAt: '2026-06-14T16:30:00+08:00',
  },
  {
    id: 'notif-003',
    type: 'FOOD_EXPIRING',
    title: 'Hurry — meals expiring soon!',
    body: 'Mixed Veggie Bowl at Greendot expires in 30 minutes.',
    readAt: '2026-06-14T15:00:00+08:00',
    createdAt: '2026-06-14T14:30:00+08:00',
  },
];
