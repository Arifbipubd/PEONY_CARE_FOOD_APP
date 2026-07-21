// Restaurant service — dashboard, donation management, profile.

import {
  RestaurantDashboard, RestaurantDonation, RestaurantProfile, PublicRestaurant, FoodItem,
  DonationSummary, CreateDonationPayload, RestaurantAnalytics,
} from '../types';
import {
  ApiRestaurantDonation, ApiRestaurantDashboard, ApiPublicRestaurant,
  ApiRestaurantDetail, ApiRestaurantMealSummary,
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
  const groups = d.active_donations?.groups ?? [];
  const todayGroup     = groups.find((g) => g.label === 'Today');
  const yesterdayGroup = groups.find((g) => g.label === 'Yesterday');

  const todayListings = (todayGroup?.items ?? d.today_listings ?? []).map(mapApiDonation);
  const todayPortions = todayGroup?.portions
    ?? d.today_portions
    ?? todayListings.reduce((sum, item) => sum + item.quantityOriginal, 0);

  return {
    restaurantName:    d.restaurant_name ?? '',
    livesImpacted:     d.impact?.lives_impacted    ?? d.lives_impacted,
    donationsThisYear: d.impact?.donations_this_year ?? d.donations_this_year,
    growthPctThisWeek: d.impact?.week_over_week_pct  ?? d.growth_pct_this_week ?? 0,
    claimRatePct:      d.claim_rate_pct,
    activeCount:       d.active_count,
    claimedToday:      d.claimed_today,
    thisWeekDonations: d.this_week?.donations    ?? d.this_week_donations ?? 0,
    thisWeekMeals:     d.this_week?.meals         ?? d.this_week_meals     ?? 0,
    thisWeekInactive:  d.this_week?.inactive_count ?? d.this_week_inactive  ?? 0,
    todayPortions,
    todayListings,
    yesterdayListings: (yesterdayGroup?.items ?? d.yesterday_listings ?? []).map(mapApiDonation),
    yesterdayFed:      yesterdayGroup?.fed ?? d.yesterday_fed ?? 0,
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


export const getDashboard = async (): Promise<RestaurantDashboard> => {
  const [dashRes, profileRes] = await Promise.all([
    api.get('/restaurant/dashboard/'),
    api.get('/restaurant/profile/'),
  ]);
  const raw: ApiRestaurantDashboard = dashRes.data.data;
  if ((raw.active_count ?? 0) > 0 || (raw.donations_this_year ?? 0) > 0) {
    _hasDonations = true;
  }
  const d: ApiRestaurantDashboard = {
    ...raw,
    restaurant_name: profileRes.data.data.name as string,
  };
  return mapApiDashboard(d);
};

export const getDonations = async (): Promise<{
  active: RestaurantDonation[];
  past: RestaurantDonation[];
  inactive: RestaurantDonation[];
  summary: DonationSummary;
}> => {
  const [activeRes, pastRes, inactiveRes] = await Promise.all([
    api.get('/restaurant/donations/', { params: { status: 'active' } }),
    api.get('/restaurant/donations/', { params: { status: 'past' } }),
    api.get('/restaurant/donations/', { params: { status: 'inactive' } }),
  ]);

  const flatGroups = (d: Record<string, unknown>): RestaurantDonation[] => {
    if (!d) return [];
    // groups structure: { groups: [{ items: [...] }] }
    const groups = d.groups as Array<{ items: ApiRestaurantDonation[] }> | undefined;
    if (Array.isArray(groups)) {
      return groups.flatMap((g) => g.items ?? []).map(mapApiDonation);
    }
    // flat array fallback: { donations: [...] } or { items: [...] }
    const flat = (d.donations ?? d.items ?? d.results) as ApiRestaurantDonation[] | undefined;
    if (Array.isArray(flat)) return flat.map(mapApiDonation);
    return [];
  };

  const activeData   = activeRes.data.data   as Record<string, unknown>;
  const pastData     = pastRes.data.data     as Record<string, unknown>;
  const inactiveData = inactiveRes.data.data as Record<string, unknown>;

  const activeSummary   = (activeData.summary   ?? {}) as Record<string, unknown>;
  const pastSummary     = (pastData.summary     ?? {}) as Record<string, unknown>;

  const activeCount   = (activeSummary.active_count   as number | undefined) ?? 0;
  const pastCount     = (activeSummary.past_count     as number | undefined) ?? 0;
  const inactiveCount = (activeSummary.inactive_count as number | undefined) ?? 0;

  _hasDonations = activeCount > 0 || pastCount > 0 || inactiveCount > 0;

  return {
    active:   flatGroups(activeData),
    past:     flatGroups(pastData),
    inactive: flatGroups(inactiveData),
    summary: {
      activeCount,
      pastCount,
      inactiveCount,
      weeklyMeals: (pastSummary.meals_this_week as number | null) ?? 0,
    },
  };
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
  let res;
  if (payload.localPhotoUri) {
    const filename = payload.localPhotoUri.split('/').pop() ?? 'photo.jpg';
    const ext      = filename.split('.').pop()?.toLowerCase() ?? 'jpeg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const formData = new FormData();
    formData.append('name',         payload.name);
    formData.append('description',  payload.description ?? '');
    formData.append('category',     payload.category);
    formData.append('unit',         payload.unit);
    formData.append('quantity',     String(payload.quantityOriginal));
    formData.append('pickup_start', payload.pickupStart);
    formData.append('pickup_end',   payload.pickupEnd);
    formData.append('photo', { uri: payload.localPhotoUri, name: filename, type: mimeType } as unknown as Blob);
    res = await api.post('/restaurant/donations/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } else {
    res = await api.post('/restaurant/donations/', {
      name:         payload.name,
      description:  payload.description,
      category:     payload.category,
      unit:         payload.unit,
      quantity:     payload.quantityOriginal,
      pickup_start: payload.pickupStart,
      pickup_end:   payload.pickupEnd,
    });
  }
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

export const getAnalytics = async (range: string = '30D'): Promise<RestaurantAnalytics> => {
  const apiRange = range === 'All' ? 'ALL' : range;
  const res = await api.get('/restaurant/analytics/', { params: { range: apiRange } });
  const d = res.data.data;

  type ApiWeek       = { week: string; meals: number };
  type ApiRateWeek   = { week: string; claim_rate_pct: number };
  type ApiHeatDay    = { intensity: number };
  type ApiHeatWeek   = { days: ApiHeatDay[] };
  type ApiDish       = { name: string; photo_url: string | null; meals: number; claim_rate_pct: number };
  type ApiSponsor    = { display_name: string; initials: string; is_anonymous: boolean; sponsored_count: number; amount_sgd: string };

  return {
    livesFed:          d.total_impact.lives_fed         as number,
    totalDonations:    d.total_impact.donations          as number,
    claimRatePct:      d.total_impact.claim_rate_pct    as number,
    growthPctThisWeek: d.total_impact.week_over_week_pct as number,
    directCount:       d.donation_source.direct.count   as number,
    sponsoredCount:    d.donation_source.sponsored.count as number,
    weeklyMeals: (d.meals_donated.weeks as ApiWeek[]).map((w) => ({
      week: w.week, meals: w.meals,
    })),
    claimRateTrend: (d.claim_rate_trend.weeks as ApiRateWeek[]).map((w) => ({
      week: w.week, ratePct: w.claim_rate_pct,
    })),
    heatmap: (d.claim_activity_heatmap.weeks as ApiHeatWeek[])
      .slice(0, 4)
      .map((w) => w.days.map((day) => Math.min(3, Math.max(0, day.intensity ?? 0)))),
    topDishes: (d.most_claimed_dishes as ApiDish[]).map((dish) => ({
      id:           dish.name,
      name:         dish.name,
      photoUrl:     dish.photo_url,
      mealCount:    dish.meals,
      claimRatePct: dish.claim_rate_pct,
    })),
    topSponsors: (d.sponsors as ApiSponsor[]).map((s) => ({
      id:             s.display_name,
      displayName:    s.display_name,
      initials:       s.initials || null,
      isAnonymous:    s.is_anonymous,
      sponsoredCount: s.sponsored_count,
      totalAmountSGD: parseFloat(s.amount_sgd),
    })),
  };
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

export const uploadRestaurantProfilePhoto = async (localUri: string): Promise<string> => {
  const filename = localUri.split('/').pop() ?? 'photo.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpeg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  const formData = new FormData();
  formData.append('photo', { uri: localUri, name: filename, type: mimeType } as unknown as Blob);

  const res = await api.patch('/restaurant/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const p: ApiRestaurantProfile = res.data.data;
  return p.photo_url ?? '';
};

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

let _menuPhotoCount = 0;
let _hasDonations   = false;

export const menuPhotosExist = (): boolean => _menuPhotoCount > 0;
export const donationsExist  = (): boolean => _hasDonations;

export interface MenuPhoto { id: string; url: string; }

function mapMenuPhotos(data: { photos: Array<{ id: string; photo_url: string }> }): MenuPhoto[] {
  return data.photos.map((p) => ({ id: p.id, url: p.photo_url }));
}

export const getMenuPhotos = async (): Promise<MenuPhoto[]> => {
  const res = await api.get('/restaurant/menu-photos/');
  const photos = mapMenuPhotos(res.data.data);
  _menuPhotoCount = photos.length;
  return photos;
};

export const uploadMenuPhotos = async (
  assets: Array<{ uri: string; type?: string; name?: string }>,
): Promise<MenuPhoto[]> => {
  const formData = new FormData();
  assets.forEach((asset) => {
    formData.append('photos', {
      uri:  asset.uri,
      type: asset.type ?? 'image/jpeg',
      name: asset.name ?? 'photo.jpg',
    } as unknown as Blob);
  });
  const res = await api.post('/restaurant/menu-photos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const photos = mapMenuPhotos(res.data.data);
  _menuPhotoCount = photos.length;
  return photos;
};

export const deleteMenuPhoto = async (photoId: string): Promise<MenuPhoto[]> => {
  const res = await api.delete(`/restaurant/menu-photos/${photoId}/`);
  const photos = mapMenuPhotos(res.data.data);
  _menuPhotoCount = photos.length;
  return photos;
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
