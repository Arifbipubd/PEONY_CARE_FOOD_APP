// Mock notifications — exact shape of the backend API response (snake_case).

import { ApiNotificationList } from '../types/api';

export const MOCK_NOTIFICATIONS: ApiNotificationList = {
  count: 6,
  results: [
    {
      id: 'notif-001',
      type: 'NEW_FOOD_NEARBY',
      title: 'Chicken Rice near you',
      body: 'Tian Tian Hainanese · 2 left',
      payload: { food_id: 'food-001', restaurant_id: 'rest-001' },
      read_at: null,
      created_at: '2026-06-21T08:00:00+08:00',
    },
    {
      id: 'notif-002',
      type: 'FOOD_EXPIRING',
      title: 'Kaya Toast Set available',
      body: 'Ya Kun · pickup 5-7 PM',
      payload: { food_id: 'food-003', restaurant_id: 'rest-003' },
      read_at: null,
      created_at: '2026-06-21T07:00:00+08:00',
    },
    {
      id: 'notif-003',
      type: 'CLAIM_CONFIRMED',
      title: 'Claim collected',
      body: 'You picked up Laksa at 328 Katong',
      payload: { claim_id: 'claim-001', food_id: 'food-002' },
      read_at: '2026-06-21T06:00:00+08:00',
      created_at: '2026-06-21T05:05:00+08:00',
    },
    {
      id: 'notif-004',
      type: 'RESTAURANT_UPDATE',
      title: 'BreadTalk donated 3 sets',
      body: 'Bread & pastries available',
      payload: { restaurant_id: 'rest-005' },
      read_at: '2026-06-20T14:00:00+08:00',
      created_at: '2026-06-20T12:00:00+08:00',
    },
    {
      id: 'notif-005',
      type: 'SPONSOR_RECEIVED',
      title: 'John Tan sponsored a meal',
      body: 'Pizza Express · 3 portions',
      payload: { donor_id: 'donor-001', restaurant_id: 'rest-006' },
      read_at: '2026-06-20T12:00:00+08:00',
      created_at: '2026-06-20T10:00:00+08:00',
    },
    {
      id: 'notif-006',
      type: 'SYSTEM',
      title: 'Privacy policy updated',
      body: 'Review the changes',
      payload: {},
      read_at: '2026-06-15T10:00:00+08:00',
      created_at: '2026-06-15T09:00:00+08:00',
    },
  ],
};
