// Restaurant service — dashboard, donation management, profile.

import {
  RestaurantDashboard, RestaurantDonation, RestaurantProfile, PublicRestaurant, FoodItem,
  DonationSummary, CreateDonationPayload,
} from '../types';
import {
  ApiRestaurantDonation, ApiRestaurantDashboard, ApiPublicRestaurant,
  ApiRestaurantDetail, ApiRestaurantMealSummary, ApiDonationSummary,
  ApiRestaurantProfile,
} from '../types/api';
import { MOCK_RESTAURANT_DASHBOARD } from '../mock/restaurantData';
import { api, logApiCatch } from './api';

function logRestaurant(step: string, info?: unknown): void {
  if (__DEV__) console.log(`[RESTAURANT] ${step}`, info ?? '');
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapApiDonation(d: ApiRestaurantDonation): RestaurantDonation {
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    category: d.category as RestaurantDonation['category'],
    unit: d.unit,
    photoUrl: d.photo_url,
    quantityOriginal: d.quantity_original,
    quantityAvailable: d.quantity_available,
    quantityClaimed: d.quantity_claimed,
    status: d.status as RestaurantDonation['status'],
    listStatus: d.list_status as RestaurantDonation['listStatus'],
    pickupStart: d.pickup_start,
    pickupEnd: d.pickup_end,
    pickupWindow: d.pickup_window,
    foodQrData: d.food_qr_data,
    foodQrImageUrl: d.food_qr_image_url,
    claimsCount: d.claims_count,
    createdAt: d.created_at,
    sponsorDisplayName: d.sponsor_display_name ?? null,
    sponsorInitials: d.sponsor_initials ?? null,
    noShowCount: d.no_show_count,
    expiredCount: d.expired_count,
    claims: d.claims?.map((c) => ({
      id: c.id,
      receiverName: c.receiver_name,
      claimedAt: c.claimed_at,
      status: c.status as 'CLAIMED',
    })),
  };
}

function mapApiDashboard(d: ApiRestaurantDashboard): RestaurantDashboard {
  const todayListings = d.today_listings.map(mapApiDonation);
  const todayPortions = d.today_portions
    ?? todayListings.reduce((sum, item) => sum + item.quantityOriginal, 0);
  return {
    restaurantName:    d.restaurant_name ?? '',
    livesImpacted:     d.lives_impacted,
    donationsThisYear: d.donations_this_year,
    growthPctThisWeek: d.growth_pct_this_week ?? 0,
    claimRatePct:      d.claim_rate_pct,
    activeCount:       d.active_count,
    claimedToday:      d.claimed_today,
    thisWeekDonations: d.this_week_donations ?? 0,
    thisWeekMeals:     d.this_week_meals ?? 0,
    thisWeekInactive:  d.this_week_inactive ?? 0,
    todayPortions,
    todayListings,
    yesterdayListings: (d.yesterday_listings ?? []).map(mapApiDonation),
    yesterdayFed:      d.yesterday_fed ?? 0,
  };
}

function mapApiPublicRestaurant(d: ApiPublicRestaurant): PublicRestaurant {
  return {
    id: d.id,
    name: d.name,
    address: d.address,
    postalCode: d.postal_code,
    latitude: d.latitude,
    longitude: d.longitude,
    photoUrl: d.photo_url ?? null,
    isVerified: d.is_verified,
    distanceKm: d.distance_km,
    mealCount: d.active_meal_count ?? d.meal_count ?? 0,
    cuisineType: d.cuisine_type,
    closesAt: d.closes_at,
    openingHours: d.opening_hours,
    about: d.about,
    totalFoodShared: d.total_food_shared,
  };
}

function mapApiMealSummary(m: ApiRestaurantMealSummary, d: ApiRestaurantDetail): FoodItem {
  return {
    id: m.id,
    restaurantId: d.id,
    restaurantName: d.name,
    restaurantAddress: d.address,
    restaurantLatitude: d.latitude,
    restaurantLongitude: d.longitude,
    restaurantIsVerified: d.is_verified,
    name: m.name,
    description: m.description,
    category: m.category as FoodItem['category'],
    unit: '',
    photoUrl: m.photo_url || '',
    quantityOriginal: m.quantity_available,
    quantityAvailable: m.quantity_available,
    quantityClaimed: 0,
    status: 'AVAILABLE',
    pickupStart: m.pickup_start,
    pickupEnd: m.pickup_end,
    pickupWindow: m.pickup_window,
    distanceKm: d.distance_km,
    sponsorshipType: m.sponsorship_type as FoodItem['sponsorshipType'],
    sponsorDisplayName: m.sponsor_display_name,
    isHalal: false,
    isVegetarian: false,
  };
}

function mapApiRestaurantDetail(d: ApiRestaurantDetail): PublicRestaurant {
  return {
    id: d.id,
    name: d.name,
    address: d.address,
    postalCode: d.postal_code,
    latitude: d.latitude,
    longitude: d.longitude,
    photoUrl: d.photo_url ?? null,
    isVerified: d.is_verified,
    distanceKm: d.distance_km,
    mealCount: d.active_meal_count,
    openingHours: d.opening_hours,
    about: d.about,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

export const getApprovalStatus = async (): Promise<{
  isApproved: boolean;
  isVerified: boolean;
  submittedAt: string;
  approvedAt: string | null;
}> => {
  logRestaurant('getApprovalStatus → request');
  try {
    const res = await api.get('/restaurant/approval-status/');
    logRestaurant('getApprovalStatus ← response', { status: res.status, data: res.data });
    const d = res.data.data;
    return {
      isApproved:  d.is_approved,
      isVerified:  d.is_verified,
      submittedAt: d.submitted_at,
      approvedAt:  d.approved_at ?? null,
    };
  } catch (err) {
    logApiCatch('restaurant.getApprovalStatus', err);
    throw err;
  }
};

export const getDonationSummary = async (): Promise<DonationSummary> => {
  logRestaurant('getDonationSummary → request');
  try {
    const res = await api.get('/restaurant/donations/summary/');
    logRestaurant('getDonationSummary ← response', { status: res.status, data: res.data });
    const s: ApiDonationSummary = res.data.data;
    return {
      activeCount:   s.active_count,
      pastCount:     s.past_count,
      inactiveCount: s.inactive_count,
      weeklyMeals:   s.weekly_meals,
    };
  } catch (err) {
    logApiCatch('restaurant.getDonationSummary', err);
    throw err;
  }
};

export const getDashboard = async (): Promise<RestaurantDashboard> => {
  logRestaurant('getDashboard → request (dashboard + profile)');
  try {
    const [dashRes, profileRes] = await Promise.all([
      api.get('/restaurant/dashboard/'),
      api.get('/restaurant/profile/'),
    ]);
    logRestaurant('getDashboard ← response', {
      dashboardStatus: dashRes.status,
      dashboardData: dashRes.data,
      profileStatus: profileRes.status,
      profileData: profileRes.data,
    });
    const d: ApiRestaurantDashboard = {
      ...dashRes.data.data,
      restaurant_name: profileRes.data.data.name as string,
    };
    return mapApiDashboard(d);
  } catch (err) {
    logApiCatch('restaurant.getDashboard', err);
    throw err;
  }
};

export const getDonations = async (
  status: 'active' | 'past' | 'inactive',
): Promise<RestaurantDonation[]> => {
  logRestaurant('getDonations → request', { status });
  try {
    const res = await api.get('/restaurant/donations/', { params: { status } });
    logRestaurant('getDonations ← response', { status: res.status, data: res.data });
    return (res.data.data as ApiRestaurantDonation[]).map(mapApiDonation);
  } catch (err) {
    logApiCatch('restaurant.getDonations', err);
    throw err;
  }
};

export const getDonationDetail = async (foodId: string): Promise<RestaurantDonation> => {
  logRestaurant('getDonationDetail → request', { foodId });
  try {
    const res = await api.get(`/restaurant/donations/${foodId}/`);
    logRestaurant('getDonationDetail ← response', { status: res.status, data: res.data });
    return mapApiDonation(res.data.data);
  } catch (err) {
    logApiCatch('restaurant.getDonationDetail', err);
    throw err;
  }
};

export const reactivateDonation = async (foodId: string): Promise<RestaurantDonation> => {
  logRestaurant('reactivateDonation → request', { foodId });
  try {
    const res = await api.patch(`/restaurant/donations/${foodId}/reactivate/`);
    logRestaurant('reactivateDonation ← response', { status: res.status, data: res.data });
    return mapApiDonation(res.data.data);
  } catch (err) {
    logApiCatch('restaurant.reactivateDonation', err);
    throw err;
  }
};

export const deleteDonation = async (foodId: string): Promise<void> => {
  logRestaurant('deleteDonation → request', { foodId });
  try {
    const res = await api.delete(`/restaurant/donations/${foodId}/`);
    logRestaurant('deleteDonation ← response', { status: res.status, data: res.data });
  } catch (err) {
    logApiCatch('restaurant.deleteDonation', err);
    throw err;
  }
};

export const createDonation = async (payload: CreateDonationPayload): Promise<RestaurantDonation> => {
  const body = {
    name:              payload.name,
    description:       payload.description,
    category:          payload.category,
    unit:              payload.unit,
    quantity:          payload.quantityOriginal,
    pickup_start:      payload.pickupStart,
    pickup_end:        payload.pickupEnd,
    photo_url:         payload.photoUrl ?? null,
  };
  logRestaurant('createDonation → request', { payload: body });
  try {
    const res = await api.post('/restaurant/donations/', body);
    logRestaurant('createDonation ← response', { status: res.status, data: res.data });
    return mapApiDonation(res.data.data);
  } catch (err) {
    logApiCatch('restaurant.createDonation', err);
    throw err;
  }
};

export const getTodaysClaims = async (): Promise<{ total: number; claims: RestaurantDonation[] }> => {
  // Still mock — log clearly so it isn't mistaken for a live API call.
  logRestaurant('getTodaysClaims → MOCK (API not wired yet)');
  await new Promise((r) => setTimeout(r, 400));
  const result = {
    total: MOCK_RESTAURANT_DASHBOARD.claimed_today,
    claims: MOCK_RESTAURANT_DASHBOARD.today_listings.map(mapApiDonation),
  };
  logRestaurant('getTodaysClaims ← MOCK response', {
    total: result.total,
    claimsCount: result.claims.length,
  });
  return result;
  /* REAL API:
  const res = await api.get('/restaurant/claims/today/');
  return res.data.data;
  */
};

export interface UpdateRestaurantProfilePayload {
  name?:          string;
  address?:       string;
  latitude?:      number;
  longitude?:     number;
  contactPhone?:  string;
  contactEmail?:  string;
  openingHours?:  string;
  about?:         string;
}

export const updateRestaurantProfile = async (
  payload: UpdateRestaurantProfilePayload,
): Promise<RestaurantProfile> => {
  const body: Record<string, unknown> = {};
  if (payload.name         != null) body.name          = payload.name;
  if (payload.address      != null) body.address        = payload.address;
  if (payload.latitude     != null) body.latitude       = payload.latitude;
  if (payload.longitude    != null) body.longitude      = payload.longitude;
  if (payload.contactPhone != null) body.contact_phone  = payload.contactPhone;
  if (payload.contactEmail != null) body.contact_email  = payload.contactEmail;
  if (payload.openingHours != null) body.opening_hours  = payload.openingHours;
  if (payload.about        != null) body.about          = payload.about;

  logRestaurant('updateRestaurantProfile → request', { payload: body });
  try {
    const res = await api.patch('/restaurant/profile/', body);
    logRestaurant('updateRestaurantProfile ← response', { status: res.status, data: res.data });
    const p: ApiRestaurantProfile = res.data.data;
    return {
      id:             p.id,
      name:           p.name,
      address:        p.address,
      postalCode:     p.postal_code,
      latitude:       p.latitude,
      longitude:      p.longitude,
      uen:            p.uen,
      contactName:    p.contact_name,
      contactEmail:   p.contact_email,
      contactPhone:   p.contact_phone,
      openingHours:   p.opening_hours ?? '',
      about:          p.about ?? '',
      photoUrl:       p.photo_url,
      isApproved:     p.is_approved,
      isVerified:     p.is_verified,
      totalFoodShared: p.total_food_shared ?? 0,
      peopleFed:      p.people_fed ?? 0,
      claimRatePct:   p.claim_rate_pct ?? 0,
      rating:         p.rating ?? 0,
      reviewCount:    p.review_count ?? 0,
    };
  } catch (err) {
    logApiCatch('restaurant.updateRestaurantProfile', err);
    throw err;
  }
};

export const getRestaurantProfile = async (): Promise<RestaurantProfile> => {
  logRestaurant('getRestaurantProfile → request');
  try {
    const res = await api.get('/restaurant/profile/');
    logRestaurant('getRestaurantProfile ← response', { status: res.status, data: res.data });
    const p: ApiRestaurantProfile = res.data.data;
    return {
      id: p.id,
      name: p.name,
      address: p.address,
      postalCode: p.postal_code,
      latitude: p.latitude,
      longitude: p.longitude,
      uen: p.uen,
      contactName: p.contact_name,
      contactEmail: p.contact_email,
      contactPhone: p.contact_phone,
      openingHours: p.opening_hours ?? '',
      about: p.about ?? '',
      photoUrl: p.photo_url,
      isApproved: p.is_approved,
      isVerified: p.is_verified,
      totalFoodShared: p.total_food_shared ?? 0,
      peopleFed: p.people_fed ?? 0,
      claimRatePct: p.claim_rate_pct ?? 0,
      rating: p.rating ?? 0,
      reviewCount: p.review_count ?? 0,
    };
  } catch (err) {
    logApiCatch('restaurant.getRestaurantProfile', err);
    throw err;
  }
};

export const getNearbyRestaurants = async (
  lat?: number,
  lng?: number,
  radius_km: number = 5,
): Promise<PublicRestaurant[]> => {
  const params = { lat, lng, radius_km };
  logRestaurant('getNearbyRestaurants → request', { params });
  try {
    const res = await api.get('/receiver/restaurants/browse/', { params });
    logRestaurant('getNearbyRestaurants ← response', { status: res.status, data: res.data });
    return (res.data.data as ApiPublicRestaurant[]).map(mapApiPublicRestaurant);
  } catch (err) {
    logApiCatch('restaurant.getNearbyRestaurants', err);
    throw err;
  }
};

// Used by RestaurantPageScreen — one call returns restaurant info + available meals.
export const getPublicRestaurantDetail = async (
  restaurantId: string,
  lat?: number,
  lng?: number,
): Promise<{ restaurant: PublicRestaurant; foods: FoodItem[] }> => {
  const params = { lat, lng };
  logRestaurant('getPublicRestaurantDetail → request', { restaurantId, params });
  try {
    const res = await api.get(`/receiver/restaurants/${restaurantId}/`, { params });
    logRestaurant('getPublicRestaurantDetail ← response', { status: res.status, data: res.data });
    const d: ApiRestaurantDetail = res.data.data;
    return {
      restaurant: mapApiRestaurantDetail(d),
      foods: d.available_meals.map((m) => mapApiMealSummary(m, d)),
    };
  } catch (err) {
    logApiCatch('restaurant.getPublicRestaurantDetail', err);
    throw err;
  }
};
