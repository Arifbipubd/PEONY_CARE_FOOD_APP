// Receiver service — food browsing, search, claiming, profile.
// MOCK MODE ACTIVE — real API calls are commented out below each function.
// To connect the backend: delete the mock block, uncomment the api call.

import {
  FoodItem, DailyLimitStatus, Claim, ClaimHistory, ClaimHistoryItem,
  ReceiverProfile, LocationSettings, RecentPlace,
} from '../types';
import {
  ApiFoodItem, ApiFoodDetail, ApiDailyLimit, ApiClaimHistoryItem, ApiRecentPlace,
} from '../types/api';
import {
  MOCK_FOOD_ITEMS, MOCK_FOOD_DETAILS, MOCK_DAILY_LIMIT,
} from '../mock/foodItems';
import { MOCK_CLAIM_HISTORY, MOCK_RECEIVER_PROFILE } from '../mock/claimHistory';
import { MOCK_LOCATION_SETTINGS } from '../mock/locationSettings';
// import { api } from './api';

// ─── Mappers (snake_case API → camelCase app types) ───────────────────────────

function mapApiFoodItem(d: ApiFoodItem): FoodItem {
  return {
    id: d.id,
    restaurantId: d.restaurant.id,
    restaurantName: d.restaurant.name,
    restaurantAddress: d.restaurant.address,
    restaurantLatitude: d.restaurant.latitude,
    restaurantLongitude: d.restaurant.longitude,
    restaurantIsVerified: d.restaurant.is_verified,
    name: d.name,
    description: d.description,
    category: d.category as FoodItem['category'],
    unit: d.unit,
    photoUrl: d.photo_url,
    quantityOriginal: d.quantity_original,
    quantityAvailable: d.quantity_available,
    quantityClaimed: d.quantity_claimed,
    status: d.status as FoodItem['status'],
    pickupStart: d.pickup_start,
    pickupEnd: d.pickup_end,
    pickupWindow: d.pickup_window,
    distanceKm: d.distance_km,
    sponsorshipType: d.sponsorship_type as FoodItem['sponsorshipType'],
    sponsorDisplayName: d.sponsor_display_name,
  };
}

function mapApiFoodDetail(d: ApiFoodDetail): FoodItem {
  return {
    ...mapApiFoodItem(d),
    claimProgress: {
      claimed: d.claim_progress.claimed,
      total: d.claim_progress.total,
      remaining: d.claim_progress.remaining,
      percentClaimed: d.claim_progress.percent_claimed,
    },
  };
}

function mapApiDailyLimit(d: ApiDailyLimit): DailyLimitStatus {
  return {
    used: d.used,
    limit: d.limit,
    canClaim: d.can_claim,
    resetsAt: d.resets_at,
  };
}

function mapApiClaimHistoryItem(d: ApiClaimHistoryItem): ClaimHistoryItem {
  return {
    id: d.id,
    foodName: d.food_name,
    restaurantName: d.restaurant_name,
    photoUrl: d.photo_url,
    sponsorDisplayName: d.sponsor_display_name,
    status: d.status as ClaimHistoryItem['status'],
    claimedAt: d.claimed_at,
    pickupWindow: d.pickup_window,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

export const browseFood = async (
  _lat?: number,
  _lng?: number,
): Promise<FoodItem[]> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_FOOD_ITEMS.map(mapApiFoodItem);
  /* REAL API:
  const res = await api.get('/receiver/donations/browse/', {
    params: { lat: _lat, lng: _lng },
  });
  return (res.data.data as ApiFoodItem[]).map(mapApiFoodItem);
  */
};

export const searchFood = async (
  _query: string,
  _category?: string,
  _lat?: number,
  _lng?: number,
): Promise<FoodItem[]> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_FOOD_ITEMS
    .filter((f) => f.name.toLowerCase().includes(_query.toLowerCase()))
    .map(mapApiFoodItem);
  /* REAL API:
  const res = await api.get('/receiver/donations/search/', {
    params: { q: _query, category: _category, lat: _lat, lng: _lng },
  });
  return (res.data.data as ApiFoodItem[]).map(mapApiFoodItem);
  */
};

export const getFoodDetail = async (
  id: string,
  _lat?: number,
  _lng?: number,
): Promise<FoodItem> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 300));
  const item = MOCK_FOOD_DETAILS[id];
  if (!item) throw new Error('Food not found');
  return mapApiFoodDetail(item);
  /* REAL API:
  const res = await api.get(`/receiver/donations/${id}/`, {
    params: { lat: _lat, lng: _lng },
  });
  return mapApiFoodDetail(res.data.data as ApiFoodDetail);
  */
};

export const getDailyLimit = async (): Promise<DailyLimitStatus> => {
  // MOCK:
  return mapApiDailyLimit(MOCK_DAILY_LIMIT);
  /* REAL API:
  const res = await api.get('/receiver/claims/today/');
  return mapApiDailyLimit(res.data.data);
  */
};

export const claimFood = async (
  _foodId: string,
  _qrPayload: string,
  _lat?: number,
  _lng?: number,
): Promise<Claim> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 1000));
  return {
    claimId: 'mock-claim-001',
    status: 'CLAIMED',
    foodName: 'Chicken Rice (1 pack)',
    restaurantName: 'Tian Tian Hainanese',
    pickupAddress: '335 Smith St, #02-25, Singapore 050335',
    distanceKm: 0.8,
    pickupWindow: '6:00 PM – 8:00 PM',
    claimedAt: new Date().toISOString(),
    message: 'Show this confirmation at the counter to collect your complementary meal.',
    dailyLimit: { used: 1, limit: 1, canClaim: false, resetsAt: '2026-06-16T00:00:00+08:00' },
  };
  /* REAL API:
  const res = await api.post('/receiver/claims/', {
    food_id: _foodId,
    qr_payload: _qrPayload,
    lat: _lat,
    lng: _lng,
  });
  const d = res.data.data;
  return {
    claimId: d.claim_id,
    status: d.status,
    foodName: d.food_name,
    restaurantName: d.restaurant_name,
    pickupAddress: d.pickup_address,
    distanceKm: d.distance_km,
    pickupWindow: d.pickup_window,
    claimedAt: d.claimed_at,
    message: d.message,
    dailyLimit: mapApiDailyLimit(d.daily_limit),
  };
  */
};

export const getClaimHistory = async (): Promise<ClaimHistory> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 400));
  const h = MOCK_CLAIM_HISTORY;
  return {
    count: h.count,
    results: h.results.map(mapApiClaimHistoryItem),
    groupedByWeek: h.grouped_by_week.map((g) => ({
      weekStart: g.week_start,
      claims: g.claims.map(mapApiClaimHistoryItem),
    })),
  };
  /* REAL API:
  const res = await api.get('/receiver/claims/');
  const h = res.data.data;
  return {
    count: h.count,
    results: h.results.map(mapApiClaimHistoryItem),
    groupedByWeek: h.grouped_by_week.map((g: any) => ({
      weekStart: g.week_start,
      claims: g.claims.map(mapApiClaimHistoryItem),
    })),
  };
  */
};

export const getFoodByRestaurant = async (restaurantId: string): Promise<FoodItem[]> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_FOOD_ITEMS
    .filter((f) => f.restaurant.id === restaurantId)
    .map(mapApiFoodItem);
  /* REAL API:
  const res = await api.get('/receiver/donations/browse/', {
    params: { lat: 0, lng: 0, restaurant_id: restaurantId },
  });
  return (res.data.data as ApiFoodItem[]).map(mapApiFoodItem);
  */
};

function mapApiRecentPlace(d: ApiRecentPlace): RecentPlace {
  return {
    id: d.id,
    name: d.name,
    area: d.area,
    address: d.address,
    visitedAt: d.visited_at,
    iconColor: d.icon_color,
  };
}

export const getLocationSettings = async (): Promise<LocationSettings> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 300));
  const s = MOCK_LOCATION_SETTINGS;
  return {
    searchRadiusKm: s.search_radius_km,
    locationServicesEnabled: s.location_services_enabled,
    saveLocationHistory: s.save_location_history,
    recentPlaces: s.recent_places.map(mapApiRecentPlace),
  };
  /* REAL API:
  const res = await api.get('/receiver/location-settings/');
  const s = res.data.data;
  return {
    searchRadiusKm: s.search_radius_km,
    locationServicesEnabled: s.location_services_enabled,
    saveLocationHistory: s.save_location_history,
    recentPlaces: s.recent_places.map(mapApiRecentPlace),
  };
  */
};

export const getReceiverProfile = async (): Promise<ReceiverProfile> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 400));
  const p = MOCK_RECEIVER_PROFILE;
  return {
    id: p.id,
    displayName: p.display_name,
    phone: p.phone,
    email: p.email,
    isVerified: p.is_verified,
    memberSince: p.member_since,
    daysActive: p.days_active,
    totalClaims: p.total_claims,
    lastClaimDate: p.last_claim_date,
    lifetimeMeals: p.stats.lifetime_meals,
    restaurantsCount: p.stats.restaurants_count,
  };
  /* REAL API:
  const res = await api.get('/receiver/profile/');
  const p = res.data.data;
  return {
    id: p.id,
    displayName: p.display_name,
    phone: p.phone,
    totalClaims: p.total_claims,
    lastClaimDate: p.last_claim_date,
    lifetimeMeals: p.stats.lifetime_meals,
    restaurantsCount: p.stats.restaurants_count,
  };
  */
};
