// Restaurant service — dashboard, donation management, profile.
// MOCK MODE ACTIVE — real API calls are commented out below each function.
// To connect the backend: delete the mock block, uncomment the api call.

import {
  RestaurantDashboard, RestaurantDonation, RestaurantProfile, PublicRestaurant, FoodItem,
} from '../types';
import {
  ApiRestaurantDonation, ApiRestaurantDashboard, ApiPublicRestaurant,
  ApiRestaurantDetail, ApiRestaurantMealSummary,
} from '../types/api';
import {
  MOCK_RESTAURANT_DASHBOARD,
  MOCK_RESTAURANT_DONATIONS,
  MOCK_RESTAURANT_PROFILE,
  MOCK_PUBLIC_RESTAURANTS,
} from '../mock/restaurantData';
import { api } from './api';

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
    claims: d.claims?.map((c) => ({
      id: c.id,
      receiverName: c.receiver_name,
      claimedAt: c.claimed_at,
      status: c.status as 'CLAIMED',
    })),
  };
}

function mapApiDashboard(d: ApiRestaurantDashboard): RestaurantDashboard {
  return {
    livesImpacted: d.lives_impacted,
    donationsThisYear: d.donations_this_year,
    claimRatePct: d.claim_rate_pct,
    activeCount: d.active_count,
    claimedToday: d.claimed_today,
    todayListings: d.today_listings.map(mapApiDonation),
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

export const getDashboard = async (): Promise<RestaurantDashboard> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 500));
  return mapApiDashboard(MOCK_RESTAURANT_DASHBOARD);
  /* REAL API:
  const res = await api.get('/restaurant/dashboard/');
  return mapApiDashboard(res.data.data);
  */
};

export const getDonations = async (
  status: 'active' | 'past' | 'inactive',
): Promise<RestaurantDonation[]> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 400));
  const statusMap: Record<string, string> = { active: 'ACTIVE', past: 'PAST', inactive: 'INACTIVE' };
  return MOCK_RESTAURANT_DONATIONS
    .filter((d) => d.list_status === statusMap[status])
    .map(mapApiDonation);
  /* REAL API:
  const res = await api.get('/restaurant/donations/', { params: { status } });
  return (res.data.data as ApiRestaurantDonation[]).map(mapApiDonation);
  */
};

export const getDonationDetail = async (foodId: string): Promise<RestaurantDonation> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 300));
  const item = MOCK_RESTAURANT_DONATIONS.find((d) => d.id === foodId);
  if (!item) throw new Error('Donation not found');
  return mapApiDonation({ ...item, claims: [] });
  /* REAL API:
  const res = await api.get(`/restaurant/donations/${foodId}/`);
  return mapApiDonation(res.data.data);
  */
};

export const getTodaysClaims = async (): Promise<{ total: number; claims: RestaurantDonation[] }> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 400));
  return {
    total: MOCK_RESTAURANT_DASHBOARD.claimed_today,
    claims: MOCK_RESTAURANT_DASHBOARD.today_listings.map(mapApiDonation),
  };
  /* REAL API:
  const res = await api.get('/restaurant/claims/today/');
  return res.data.data;
  */
};

export const getRestaurantProfile = async (): Promise<RestaurantProfile> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 400));
  const p = MOCK_RESTAURANT_PROFILE;
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
    openingHours: p.opening_hours,
    about: p.about,
    photoUrl: p.photo_url,
    isApproved: p.is_approved,
    isVerified: p.is_verified,
    totalFoodShared: p.total_food_shared,
  };
  /* REAL API:
  const res = await api.get('/restaurant/profile/');
  const p = res.data.data;
  return { ...same mapping as above... };
  */
};

export const getNearbyRestaurants = async (
  lat?: number,
  lng?: number,
  radius_km: number = 5,
): Promise<PublicRestaurant[]> => {
  const res = await api.get('/receiver/restaurants/browse/', {
    params: { lat, lng, radius_km },
  });
  return (res.data.data as ApiPublicRestaurant[]).map(mapApiPublicRestaurant);
};

// Used by RestaurantPageScreen — one call returns restaurant info + available meals.
export const getPublicRestaurantDetail = async (
  restaurantId: string,
  lat?: number,
  lng?: number,
): Promise<{ restaurant: PublicRestaurant; foods: FoodItem[] }> => {
  const res = await api.get(`/receiver/restaurants/${restaurantId}/`, {
    params: { lat, lng },
  });
  const d: ApiRestaurantDetail = res.data.data;
  return {
    restaurant: mapApiRestaurantDetail(d),
    foods: d.available_meals.map((m) => mapApiMealSummary(m, d)),
  };
};
