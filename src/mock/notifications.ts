// Mock notifications — exact shape of the backend API response (snake_case).

import { ApiNotificationList } from '../types/api';

export const MOCK_NOTIFICATIONS: ApiNotificationList = {
  count: 3,
  results: [
    {
      id: 'notif-001',
      type: 'CLAIM_CONFIRMED',
      title: 'Meal claimed successfully!',
      body: 'You claimed Chicken Rice from Tian Tian Hainanese. Pick up by 8:00 PM today.',
      payload: { claim_id: 'claim-001', food_id: 'food-001' },
      read_at: null,
      created_at: '2026-06-15T18:05:00+08:00',
    },
    {
      id: 'notif-002',
      type: 'NEW_FOOD_NEARBY',
      title: 'New meals available near you',
      body: 'Ya Kun Kaya Toast just posted 15 Kaya Toast Sets — 2.1 km away.',
      payload: { food_id: 'food-003', restaurant_id: 'rest-003' },
      read_at: null,
      created_at: '2026-06-15T16:30:00+08:00',
    },
    {
      id: 'notif-003',
      type: 'FOOD_EXPIRING',
      title: 'Hurry — meals expiring soon!',
      body: 'Mixed Veggie Bowl at Greendot expires in 30 minutes.',
      payload: { food_id: 'food-004', restaurant_id: 'rest-004' },
      read_at: '2026-06-15T15:00:00+08:00',
      created_at: '2026-06-15T14:30:00+08:00',
    },
  ],
};
