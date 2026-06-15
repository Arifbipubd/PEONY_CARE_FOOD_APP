// Mock claim history — exact shape of the backend list_claim_history() response.

import { ApiClaimHistory } from '../types/api';

export const MOCK_CLAIM_HISTORY: ApiClaimHistory = {
  count: 24,
  results: [],
  grouped_by_week: [
    {
      week_start: '2026-06-10',
      claims: [
        {
          id: 'claim-001',
          food_name: 'Chicken Rice (1 pack)',
          restaurant_name: 'Tian Tian Hainanese',
          photo_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200',
          sponsor_display_name: null,
          status: 'CLAIMED',
          claimed_at: '2026-06-16T19:12:00+08:00',
          pickup_window: '6:00 PM – 8:00 PM',
        },
        {
          id: 'claim-002',
          food_name: 'Laksa',
          restaurant_name: '328 Katong Laksa',
          photo_url: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=200',
          sponsor_display_name: null,
          status: 'CLAIMED',
          claimed_at: '2026-06-15T14:30:00+08:00',
          pickup_window: '2:00 PM – 4:00 PM',
        },
        {
          id: 'claim-003',
          food_name: 'Kaya Toast Set',
          restaurant_name: 'Ya Kun Kaya Toast',
          photo_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
          sponsor_display_name: null,
          status: 'CLAIMED',
          claimed_at: '2026-06-14T17:45:00+08:00',
          pickup_window: '5:00 PM – 7:00 PM',
        },
      ],
    },
    {
      week_start: '2026-06-03',
      claims: [
        {
          id: 'claim-004',
          food_name: 'Margherita Pizza',
          restaurant_name: 'Pizza Express Orchard',
          photo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
          sponsor_display_name: 'John Tan',
          status: 'CLAIMED',
          claimed_at: '2026-06-09T19:00:00+08:00',
          pickup_window: '7:00 PM – 9:00 PM',
        },
        {
          id: 'claim-005',
          food_name: 'Mixed Veggie Bowl',
          restaurant_name: 'Greendot',
          photo_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200',
          sponsor_display_name: null,
          status: 'EXPIRED',
          claimed_at: '2026-06-05T18:20:00+08:00',
          pickup_window: '6:00 PM – 8:00 PM',
        },
        {
          id: 'claim-006',
          food_name: 'Chicken Rice x2',
          restaurant_name: 'Boon Tong Kee',
          photo_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200',
          sponsor_display_name: null,
          status: 'CLAIMED',
          claimed_at: '2026-06-03T17:30:00+08:00',
          pickup_window: '5:00 PM – 7:00 PM',
        },
      ],
    },
  ],
};

export const MOCK_RECEIVER_PROFILE = {
  id: 'receiver-profile-001',
  display_name: 'Sarah Mun',
  phone: '+6591234567',
  email: 'sarah.mun@email.com',
  is_verified: true,
  member_since: 'Jun 2026',
  days_active: 62,
  total_claims: 24,
  last_claim_date: '2026-06-16',
  stats: {
    lifetime_meals: 24,
    restaurants_count: 12,
  },
};
