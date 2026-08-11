// Receiver service — food browsing, search, claiming, profile.
// MOCK MODE ACTIVE — real API calls are commented out below each function.
// To connect the backend: delete the mock block, uncomment the api call.

import {
  FoodItem, DailyLimitStatus, Claim, ClaimHistory, ClaimHistoryItem,
  ReceiverProfile, LocationSettings, RecentPlace, ReviewPayload,
  ReviewForm, Review, ReviewTag, ReportReason,
} from '../types';
import {
  ApiFoodItem, ApiFoodDetail, ApiDailyLimit, ApiClaimHistoryItem, ApiRecentPlace,
  ApiReviewForm, ApiReview, ApiReviewTag, ApiReportReason,
} from '../types/api';
import { api } from './api';

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
    restaurantRating: d.restaurant.rating,
    restaurantReviewCount: d.restaurant.review_count,
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
    isHalal: d.is_halal ?? false,
    isVegetarian: d.is_vegetarian ?? false,
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
    restaurantId: d.restaurant_id,
    restaurantPhotoUrl: d.restaurant_photo_url ?? null,
    photoUrl: d.photo_url || undefined,
    sponsorDisplayName: d.sponsor_display_name ?? undefined,
    status: (d.status === 'CLAIMED' || d.status === 'COLLECTED') ? 'CLAIMED' : 'EXPIRED',
    claimedAt: d.claimed_at,
    pickupWindow: d.pickup_window,
    hasReview: d.has_review ?? false,
    canReview: d.can_review ?? false,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

export const updateReceiverLocation = async (lat: number, lng: number): Promise<void> => {
  await api.patch('/receiver/profile/', { latitude: lat, longitude: lng });
};

export const browseFood = async (
  lat?: number,
  lng?: number,
  radius_km: number = 5,
): Promise<FoodItem[]> => {
  const res = await api.get('/receiver/donations/browse/', {
    params: { lat, lng, radius_km },
  });
  return (res.data.data as ApiFoodItem[]).map(mapApiFoodItem);
};

export const searchFood = async (
  query: string,
  category?: string,
  lat?: number,
  lng?: number,
  radius_km?: number,
): Promise<FoodItem[]> => {
  const res = await api.get('/receiver/donations/search/', {
    params: {
      q: query || undefined,
      category: category || undefined,
      lat,
      lng,
      radius_km,
    },
  });
  return (res.data.data as ApiFoodItem[]).map(mapApiFoodItem);
};

export const getFoodDetail = async (
  id: string,
  lat?: number,
  lng?: number,
): Promise<FoodItem> => {
  const res = await api.get(`/receiver/donations/${id}/`, {
    params: { lat, lng },
  });
  return mapApiFoodDetail(res.data.data as ApiFoodDetail);
};

export const getDailyLimit = async (): Promise<DailyLimitStatus> => {
  const res = await api.get('/receiver/claims/today/');
  return mapApiDailyLimit(res.data.data);
};

export const claimFood = async (
  foodId: string,
  qrPayload: string,
  lat: number,
  lng: number,
): Promise<Claim> => {
  const res = await api.post('/receiver/claims/', {
    food_id: foodId,
    qr_payload: qrPayload,
    lat,
    lng,
  });
  const d = res.data.data;
  return {
    claimId: d.claim_id,
    status: d.status,
    foodName: d.food_name,
    restaurantId: d.restaurant_id ?? '',
    restaurantName: d.restaurant_name,
    restaurantPhotoUrl: d.restaurant_photo_url ?? null,
    pickupAddress: d.pickup_address,
    distanceKm: d.distance_km,
    pickupWindow: d.pickup_window,
    claimedAt: d.claimed_at,
    message: d.message,
    dailyLimit: mapApiDailyLimit(d.daily_limit),
  };
};

export const getClaimHistory = async (): Promise<ClaimHistory> => {
  const res = await api.get('/receiver/claims/');
  const h = res.data.data;
  return {
    count: h.count,
    results: h.results.map(mapApiClaimHistoryItem),
    groupedByWeek: h.grouped_by_week.map((g: { week_start: string; claims: ApiClaimHistoryItem[] }) => ({
      weekStart: g.week_start,
      claims: g.claims.map(mapApiClaimHistoryItem),
    })),
  };
};

function mapApiRecentPlace(d: ApiRecentPlace): RecentPlace {
  return {
    id: d.id,
    name: d.place_name,
    area: d.area_label,
    placeType: d.place_type,
    latitude: d.latitude,
    longitude: d.longitude,
    visitedAt: d.visited_at,
  };
}

export const getLocationSettings = async (): Promise<LocationSettings> => {
  const res = await api.get('/receiver/settings/location/');
  const s = res.data.data;
  return {
    searchRadiusKm: s.browse_radius_km,
    radiusOptionsKm: s.radius_options_km,
    locationServicesEnabled: s.location_services_enabled,
    saveLocationHistory: s.save_location_history,
    latitude: s.latitude,
    longitude: s.longitude,
    recentPlacesCount: s.recent_places_count,
    recentPlaces: (s.recent_places as ApiRecentPlace[]).map(mapApiRecentPlace),
  };
};

function mapApiReviewTag(t: ApiReviewTag): ReviewTag {
  return { id: t.id, code: t.code, label: t.label };
}

function mapApiReview(r: ApiReview): Review {
  return {
    id: r.id,
    restaurantId: r.restaurant_id,
    rating: r.rating,
    ratingLabel: r.rating_label,
    tagCodes: r.tag_codes,
    tags: r.tags.map(mapApiReviewTag),
    comment: r.comment,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapApiReviewForm(d: ApiReviewForm): ReviewForm {
  return {
    restaurantId: d.restaurant_id,
    restaurantName: d.restaurant_name,
    latestFoodName: d.latest_food_name,
    collectedAt: d.collected_at,
    collectedLabel: d.collected_label,
    contextSubtitle: d.context_subtitle,
    canReview: d.can_review,
    hasReview: d.has_review,
    tags: d.tags.map(mapApiReviewTag),
    review: d.review ? mapApiReview(d.review) : null,
  };
}

export const submitReview = async (payload: ReviewPayload): Promise<void> => {
  await api.post(`/receiver/restaurants/${payload.restaurantId}/review/`, {
    rating: payload.rating,
    tag_codes: payload.tagCodes,
    comment: payload.comment || undefined,
  });
};

export const getReview = async (restaurantId: string): Promise<ReviewForm> => {
  const res = await api.get(`/receiver/restaurants/${restaurantId}/review/`);
  return mapApiReviewForm(res.data.data as ApiReviewForm);
};

export const updateReview = async (
  restaurantId: string,
  payload: ReviewPayload,
): Promise<Review> => {
  const res = await api.patch(`/receiver/restaurants/${restaurantId}/review/`, {
    rating: payload.rating,
    tag_codes: payload.tagCodes,
    comment: payload.comment || undefined,
  });
  return mapApiReview(res.data.data as ApiReview);
};

export const deleteReview = async (restaurantId: string): Promise<void> => {
  await api.delete(`/receiver/restaurants/${restaurantId}/review/`);
};

export const updateLocationSettings = async (settings: {
  searchRadiusKm?: number;
  locationServicesEnabled?: boolean;
  saveLocationHistory?: boolean;
  latitude?: number;
  longitude?: number;
}): Promise<LocationSettings> => {
  const body: Record<string, unknown> = {};
  if (settings.searchRadiusKm          != null) body.browse_radius_km          = settings.searchRadiusKm;
  if (settings.locationServicesEnabled  != null) body.location_services_enabled = settings.locationServicesEnabled;
  if (settings.saveLocationHistory      != null) body.save_location_history     = settings.saveLocationHistory;
  if (settings.latitude                 != null) body.latitude                  = settings.latitude;
  if (settings.longitude                != null) body.longitude                 = settings.longitude;
  const res = await api.patch('/receiver/settings/location/', body);
  const s = res.data.data;
  return {
    searchRadiusKm: s.browse_radius_km,
    radiusOptionsKm: s.radius_options_km,
    locationServicesEnabled: s.location_services_enabled,
    saveLocationHistory: s.save_location_history,
    latitude: s.latitude,
    longitude: s.longitude,
    recentPlacesCount: s.recent_places_count,
    recentPlaces: (s.recent_places as ApiRecentPlace[]).map(mapApiRecentPlace),
  };
};

export const clearLocationHistory = async (): Promise<void> => {
  await api.delete('/receiver/settings/location/history/');
};

export const getReportReasons = async (): Promise<ReportReason[]> => {
  const res = await api.get('/receiver/reports/reasons/');
  return (res.data.data as ApiReportReason[]).map((r) => ({
    id: r.id,
    code: r.code,
    label: r.label,
  }));
};

export const reportFood = async (
  foodId: string,
  reasonId: string,
  comment?: string,
): Promise<void> => {
  await api.post(`/receiver/donations/${foodId}/report/`, {
    reason_id: reasonId,
    comment: comment || undefined,
  });
};

export const getReceiverProfile = async (): Promise<ReceiverProfile> => {
  const res = await api.get('/receiver/profile/');
  const p = res.data.data;
  return {
    id: p.id,
    displayName: p.display_name,
    phone: p.phone,
    photoUrl: p.photo_url ?? null,
    browseRadiusKm: p.browse_radius_km,
    memberSince: p.member_since,
    daysActive: p.stats.days_active,
    totalClaims: p.total_claims,
    lastClaimDate: p.last_claim_date ?? null,
    lifetimeMeals: p.stats.lifetime_meals,
    restaurantsCount: p.stats.restaurants_count,
  };
};
