// Mock claim history — exact shape of the backend list_claim_history() response.

import { ApiClaimHistory } from '../types/api';

export const MOCK_CLAIM_HISTORY: ApiClaimHistory = {
  count: 4,
  results: [
    {
      id: 'claim-001',
      food_name: 'Chicken Rice (1 pack)',
      restaurant_name: 'Tian Tian Hainanese',
      status: 'CLAIMED',
      claimed_at: '2026-06-15T18:32:00+08:00',
      pickup_window: '6:00 PM – 8:00 PM',
    },
    {
      id: 'claim-002',
      food_name: 'Kaya Toast Set',
      restaurant_name: 'Ya Kun Kaya Toast',
      status: 'CLAIMED',
      claimed_at: '2026-06-14T17:15:00+08:00',
      pickup_window: '5:00 PM – 7:00 PM',
    },
    {
      id: 'claim-003',
      food_name: 'Katong Laksa',
      restaurant_name: '328 Katong Laksa',
      status: 'CLAIMED',
      claimed_at: '2026-06-13T17:44:00+08:00',
      pickup_window: '5:00 PM – 7:00 PM',
    },
    {
      id: 'claim-004',
      food_name: 'Mixed Veggie Bowl',
      restaurant_name: 'Greendot',
      status: 'CLAIMED',
      claimed_at: '2026-06-09T18:20:00+08:00',
      pickup_window: '6:00 PM – 8:00 PM',
    },
  ],
  grouped_by_week: [
    {
      week_start: '2026-06-15',
      claims: [
        {
          id: 'claim-001',
          food_name: 'Chicken Rice (1 pack)',
          restaurant_name: 'Tian Tian Hainanese',
          status: 'CLAIMED',
          claimed_at: '2026-06-15T18:32:00+08:00',
          pickup_window: '6:00 PM – 8:00 PM',
        },
        {
          id: 'claim-002',
          food_name: 'Kaya Toast Set',
          restaurant_name: 'Ya Kun Kaya Toast',
          status: 'CLAIMED',
          claimed_at: '2026-06-14T17:15:00+08:00',
          pickup_window: '5:00 PM – 7:00 PM',
        },
        {
          id: 'claim-003',
          food_name: 'Katong Laksa',
          restaurant_name: '328 Katong Laksa',
          status: 'CLAIMED',
          claimed_at: '2026-06-13T17:44:00+08:00',
          pickup_window: '5:00 PM – 7:00 PM',
        },
      ],
    },
    {
      week_start: '2026-06-08',
      claims: [
        {
          id: 'claim-004',
          food_name: 'Mixed Veggie Bowl',
          restaurant_name: 'Greendot',
          status: 'CLAIMED',
          claimed_at: '2026-06-09T18:20:00+08:00',
          pickup_window: '6:00 PM – 8:00 PM',
        },
      ],
    },
  ],
};

export const MOCK_RECEIVER_PROFILE = {
  id: 'receiver-profile-001',
  display_name: 'Sarah Lim',
  phone: '+6591234567',
  total_claims: 4,
  last_claim_date: '2026-06-15',
  stats: {
    lifetime_meals: 4,
    restaurants_count: 3,
  },
};
