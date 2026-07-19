// Restaurant service — dashboard, donation management, profile.

import {
  RestaurantDashboard, RestaurantDonation, RestaurantProfile, PublicRestaurant, FoodItem,
  DonationSummary, CreateDonationPayload, RestaurantAnalytics,
} from '../types';
import {
  ApiRestaurantDonation, ApiRestaurantDashboard, ApiPublicRestaurant,
  ApiRestaurantDetail, ApiRestaurantMealSummary, ApiDonationSummary,
  ApiRestaurantProfile,
} from '../types/api';
import { MOCK_RESTAURANT_DASHBOARD } from '../mock/restaurantData';
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
  const res = await api.get('/restaurant/approval-status/');
  const d = res.data.data;
  return {
    isApproved:  d.is_approved,
    isVerified:  d.is_verified,
    submittedAt: d.submitted_at,
    approvedAt:  d.approved_at ?? null,
  };
};

export const getDonationSummary = async (): Promise<DonationSummary> => {
  const res = await api.get('/restaurant/donations/summary/');
  const s: ApiDonationSummary = res.data.data;
  return {
    activeCount:   s.active_count,
    pastCount:     s.past_count,
    inactiveCount: s.inactive_count,
    weeklyMeals:   s.weekly_meals,
  };
};

export const getDashboard = async (): Promise<RestaurantDashboard> => {
  const [dashRes, profileRes] = await Promise.all([
    api.get('/restaurant/dashboard/'),
    api.get('/restaurant/profile/'),
  ]);
  const d: ApiRestaurantDashboard = {
    ...dashRes.data.data,
    restaurant_name: profileRes.data.data.name as string,
  };
  return mapApiDashboard(d);
};

export const getDonations = async (
  status: 'active' | 'past' | 'inactive',
): Promise<RestaurantDonation[]> => {
  const res = await api.get('/restaurant/donations/', { params: { status } });
  return (res.data.data as ApiRestaurantDonation[]).map(mapApiDonation);
};

export const getDonationDetail = async (foodId: string): Promise<RestaurantDonation> => {
  const res = await api.get(`/restaurant/donations/${foodId}/`);
  return mapApiDonation(res.data.data);
};

export const reactivateDonation = async (foodId: string): Promise<RestaurantDonation> => {
  const res = await api.patch(`/restaurant/donations/${foodId}/reactivate/`);
  return mapApiDonation(res.data.data);
};

export const deleteDonation = async (foodId: string): Promise<void> => {
  await api.delete(`/restaurant/donations/${foodId}/`);
};

export const createDonation = async (payload: CreateDonationPayload): Promise<RestaurantDonation> => {
  const res = await api.post('/restaurant/donations/', {
    name:              payload.name,
    description:       payload.description,
    category:          payload.category,
    unit:              payload.unit,
    quantity:          payload.quantityOriginal,
    pickup_start:      payload.pickupStart,
    pickup_end:        payload.pickupEnd,
    photo_url:         payload.photoUrl ?? null,
  });
  _hasDonations = true;
  return mapApiDonation(res.data.data);
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

export const getAnalytics = async (): Promise<RestaurantAnalytics> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 400));
  return {
    livesFed: 1248,
    totalDonations: 156,
    claimRatePct: 96,
    growthPctThisWeek: 24,
    directCount: 96,
    sponsoredCount: 60,
    weeklyMeals: [
      { week: 'W1', meals: 22 },
      { week: 'W2', meals: 28 },
      { week: 'W3', meals: 35 },
      { week: 'W4', meals: 42 },
      { week: 'W5', meals: 54 },
      { week: 'W6', meals: 62 },
      { week: 'W7', meals: 186 },
    ],
    claimRateTrend: [
      { week: 'W1', ratePct: 72 },
      { week: 'W2', ratePct: 75 },
      { week: 'W3', ratePct: 80 },
      { week: 'W4', ratePct: 82 },
      { week: 'W5', ratePct: 88 },
      { week: 'W6', ratePct: 92 },
      { week: 'W7', ratePct: 96 },
    ],
    heatmap: [
      [1, 2, 1, 2, 3, 2, 3],
      [2, 1, 3, 2, 3, 3, 3],
      [1, 2, 2, 3, 2, 3, 3],
      [2, 3, 2, 3, 3, 3, 3],
    ],
    topDishes: [
      { id: '1', name: 'Chicken Rice', photoUrl: 'https://picsum.photos/seed/chicken/44', mealCount: 428, claimRatePct: 100 },
      { id: '2', name: 'Laksa', photoUrl: 'https://picsum.photos/seed/laksa/44', mealCount: 312, claimRatePct: 94 },
      { id: '3', name: 'Kaya Toast Set', photoUrl: 'https://picsum.photos/seed/kaya/44', mealCount: 218, claimRatePct: 88 },
    ],
    topSponsors: [
      { id: '1', displayName: 'John Tan', initials: 'JT', sponsoredCount: 28, totalAmountSGD: 420, isAnonymous: false },
      { id: '2', displayName: 'Camila R.', initials: 'CR', sponsoredCount: 14, totalAmountSGD: 280, isAnonymous: false },
      { id: '3', displayName: 'Anonymous donors', initials: null, sponsoredCount: 18, totalAmountSGD: 0, isAnonymous: true },
    ],
  };
  /* REAL API:
  const res = await api.get('/restaurant/analytics/');
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

  const res = await api.patch('/restaurant/profile/', body);
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
};

let _menuPhotos: string[] = [];
let _hasDonations = false;

export const menuPhotosExist  = (): boolean => _menuPhotos.length > 0;
export const donationsExist   = (): boolean => _hasDonations;

export const getMenuPhotos = async (): Promise<string[]> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 300));
  return [..._menuPhotos];
  /* REAL API:
  const res = await api.get('/restaurant/menu-photos/');
  return res.data.data.photo_urls as string[];
  */
};

export const saveMenuPhotos = async (uris: string[]): Promise<void> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 600));
  _menuPhotos = [...uris];
  /* REAL API:
  await api.patch('/restaurant/menu-photos/', { photo_urls: uris });
  */
};

export const getRestaurantProfile = async (): Promise<RestaurantProfile> => {
  const res = await api.get('/restaurant/profile/');
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
