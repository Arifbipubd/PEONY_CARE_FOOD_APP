// Restaurant service — dashboard, donation management, profile.

import {
  RestaurantDashboard, RestaurantDonation, RestaurantProfile, PublicRestaurant, FoodItem,
  DonationSummary, CreateDonationPayload, RestaurantAnalytics, RestaurantClaim,
  ClaimReportContext, LocationResult, LocationSearchResponse,
  RestaurantNotificationSettings,
} from '../types';
import type { ClaimStatus } from '../types';
import {
  ApiRestaurantDonation, ApiRestaurantDashboard, ApiPublicRestaurant,
  ApiRestaurantDetail, ApiRestaurantMealSummary,
  ApiRestaurantProfile, ApiRestaurantClaim, ApiClaimReportContext,
  ApiLocationResult, ApiLocationSearchResponse,
  ApiRestaurantNotificationSettings,
} from '../types/api';
import { api, logApiCatch } from './api';
import { compressImageForUpload } from '../utils/compressImage';
import { parseRecurrenceDays, serializeRecurrenceDays } from '../utils/availability';

async function photoFormValue(localUri: string): Promise<Blob> {
  const photo = await compressImageForUpload(localUri);
  return { uri: photo.uri, name: photo.name, type: photo.mimeType } as unknown as Blob;
}

function logRestaurant(step: string, info?: unknown): void {
  if (__DEV__) console.log(`[RESTAURANT] ${step}`, info ?? '');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const DAY_TO_INT: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

function daysToInts(days: string[]): number[] {
  return days.map((d) => DAY_TO_INT[d] ?? -1).filter((n) => n >= 0);
}

function intsToDays(ints: number[]): string[] {
  return ints.map((n) => DAY_ABBR[n]).filter(Boolean) as string[];
}

function stripSeconds(t: string | undefined): string | undefined {
  if (!t) return undefined;
  const parts = t.split(':');
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : t;
}

function parseOpeningHours(raw: string): { opensAt?: string; closesAt?: string; openDays?: string[] } {
  if (!raw) return {};
  const [timePart, daysPart] = raw.split(' · ');
  const times = (timePart ?? '').split('–');
  return {
    opensAt:  times[0]?.trim() || undefined,
    closesAt: times[1]?.trim() || undefined,
    openDays: daysPart ? daysPart.split(', ').map((d) => d.trim()).filter(Boolean) : undefined,
  };
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
    estimatedReachLabel: d.estimated_reach_label,
    isRepeating: d.recurrence_type != null
      ? d.recurrence_type !== 'NONE'
      : d.is_repeating,
    recurrenceType: d.recurrence_type ?? null,
    recurrenceDays: parseRecurrenceDays(d.recurrence_days),
    repeatTimeLabel: d.recurrence_label ?? d.recurrence_schedule_summary ?? d.repeat_time_label,
    nextPostLabel: d.next_post_label,
    donationSourceNote: d.source?.detail || d.source_note || d.donation_source_note,
    claims: d.claims?.map((c) => ({
      id: c.id,
      receiverName: c.receiver_name,
      claimedAt: c.claimed_at,
      collectedAt: c.collected_at,
      status: c.status as ClaimStatus,
    })),
  };
}

export const pauseDonation = async (foodId: string): Promise<void> => {
  await api.post(`/restaurant/donations/${foodId}/close/`);
};

function mapApiDashboard(d: ApiRestaurantDashboard): RestaurantDashboard {
  const groups = d.active_donations?.groups ?? [];
  const todayGroup     = groups.find((g) => g.label === 'Today');
  const yesterdayGroup = groups.find((g) => g.label === 'Yesterday');

  const todayListings = (todayGroup?.items ?? d.today_listings ?? []).map(mapApiDonation);
  const todayPortions = todayGroup?.portions
    ?? d.today_portions
    ?? todayListings.reduce((sum, item) => sum + item.quantityOriginal, 0);

  const pastGroups = groups
    .filter((g) => g.label !== 'Today' && g.label !== 'Yesterday')
    .map((g) => ({ label: g.label, listings: g.items.map(mapApiDonation), fed: g.fed ?? 0 }));

  return {
    restaurantName:    d.restaurant_name ?? '',
    photoUrl:          null,
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
    pastGroups,
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

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
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


export const getDashboard = async (): Promise<RestaurantDashboard> => {
  const [dashRes, profileRes, activeRes] = await Promise.all([
    api.get('/restaurant/dashboard/'),
    api.get('/restaurant/profile/'),
    // Active donations endpoint returns ALL date groups (Today, 19 Jul, etc.)
    // The dashboard endpoint only gives us Today — so we need this to build pastGroups.
    api.get('/restaurant/donations/', { params: { status: 'active' } }).catch(() => null),
  ]);
  const raw: ApiRestaurantDashboard = dashRes.data.data;
  if ((raw.active_count ?? 0) > 0 || (raw.donations_this_year ?? 0) > 0) {
    _hasDonations = true;
  }
  const d: ApiRestaurantDashboard = {
    ...raw,
    restaurant_name: profileRes.data.data.name as string,
  };
  const mapped = mapApiDashboard(d);
  mapped.photoUrl = (profileRes.data.data.photo_url as string | null) ?? null;

  if (activeRes) {
    // Mirror DonationListScreen: flatten the response (ignore API group labels),
    // then group client-side by pickup_start date — same logic as groupByDate().
    const activeData = activeRes.data.data as Record<string, unknown>;
    const rawGroups = activeData?.groups as Array<{ items?: ApiRestaurantDonation[]; donations?: ApiRestaurantDonation[] }> | undefined;
    let flatItems: ApiRestaurantDonation[] = [];
    if (Array.isArray(rawGroups) && rawGroups.length > 0) {
      flatItems = rawGroups.flatMap((g) => g.items ?? g.donations ?? []);
    } else {
      const flat = (activeData?.donations ?? activeData?.items ?? activeData?.results) as ApiRestaurantDonation[] | undefined;
      if (Array.isArray(flat)) flatItems = flat;
    }

    if (flatItems.length > 0) {
      // Dashboard already shows Today / Yesterday / pastGroups from BE labels.
      // Skip those IDs so pickup-date regrouping cannot duplicate the same listing
      // (e.g. BE "Today" + FE "13 Aug" for an Aug-13 pickup_start).
      const shownIds = new Set([
        ...mapped.todayListings.map((i) => i.id),
        ...mapped.yesterdayListings.map((i) => i.id),
        ...mapped.pastGroups.flatMap((g) => g.listings.map((i) => i.id)),
      ]);
      const todayIso = new Date().toISOString().slice(0, 10);
      const byDate = new Map<string, ApiRestaurantDonation[]>();
      for (const item of flatItems) {
        if (shownIds.has(item.id)) continue;
        const date = (item.pickup_start ?? '').slice(0, 10);
        if (!date || date === todayIso) continue;
        const arr = byDate.get(date) ?? [];
        arr.push(item);
        byDate.set(date, arr);
      }
      const existingLabels = new Set(mapped.pastGroups.map((g) => g.label));
      for (const [date, items] of byDate.entries()) {
        if (items.length === 0) continue;
        const label = formatDateLabel(date);
        if (existingLabels.has(label)) continue;
        mapped.pastGroups.push({
          label,
          listings: items.map(mapApiDonation),
          fed: items.reduce((sum, i) => sum + (i.quantity_claimed ?? 0), 0),
        });
        existingLabels.add(label);
      }
    }
  }

  return mapped;
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
  const res = await api.post(`/restaurant/donations/${foodId}/reactivate/`);
  return mapApiDonation(res.data.data);
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

function mapApiRestaurantClaim(c: ApiRestaurantClaim): RestaurantClaim {
  return {
    id: c.id,
    receiverName: c.receiver_name,
    receiverInitials: c.receiver_initials,
    foodId: c.food_id,
    foodName: c.food_name,
    itemsLabel: c.items_label,
    claimedAt: c.claimed_at,
    collectedAt: c.collected_at,
    collectedAtLabel: c.collected_at_label,
    noShowAt: c.no_show_at,
    pickupWindow: c.pickup_window,
    pickupWindowShort: c.pickup_window_short,
    status: c.status,
    statusKey: c.status_key,
    statusLabel: c.status_label,
    canMarkCollected: c.can_mark_collected,
    canMarkNoShow: c.can_mark_no_show,
    canUndoNoShow: c.can_undo_no_show,
  };
}

export const getClaimsForDonation = async (foodId: string): Promise<RestaurantClaim[]> => {
  const res = await api.get(`/restaurant/donations/${foodId}/claims/`);
  return (res.data.data as ApiRestaurantClaim[]).map(mapApiRestaurantClaim);
};

export const collectClaim = async (claimId: string): Promise<void> => {
  await api.post(`/restaurant/claims/${claimId}/collect/`, {});
};

function mapApiLocationResult(d: ApiLocationResult): LocationResult {
  return {
    addressLine: d.address_line,
    address: d.address,
    postalCode: d.postal_code,
    latitude: d.latitude,
    longitude: d.longitude,
    country: d.country,
    subtitle: d.subtitle,
    display: d.display,
  };
}

export const searchLocation = async (q: string): Promise<LocationSearchResponse> => {
  const res = await api.get('/restaurant/location/search/', { params: { q } });
  const d: ApiLocationSearchResponse = res.data.data;
  return {
    query: d.query,
    count: d.count,
    results: d.results.map(mapApiLocationResult),
  };
};

export const reverseGeocode = async (lat: number, lng: number): Promise<LocationResult> => {
  const res = await api.get('/restaurant/location/reverse/', { params: { lat, lng } });
  return mapApiLocationResult(res.data.data as ApiLocationResult);
};

export const confirmLocation = async (payload: {
  address: string;
  addressLine?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
}): Promise<LocationResult> => {
  const res = await api.post('/restaurant/location/confirm/', {
    address: payload.address,
    address_line: payload.addressLine,
    postal_code: payload.postalCode,
    latitude: payload.latitude,
    longitude: payload.longitude,
  });
  return mapApiLocationResult(res.data.data as ApiLocationResult);
};

export const getClaimReportContext = async (claimId: string): Promise<ClaimReportContext> => {
  const res = await api.get(`/restaurant/claims/${claimId}/report/`);
  const d: ApiClaimReportContext = res.data.data;
  return {
    claimId: d.claim_id,
    receiverName: d.receiver_name,
    receiverPhoneTail: d.receiver_phone_tail,
    foodName: d.food_name,
    pickupWindowShort: d.pickup_window_short,
    contextLine: d.context_line,
    footerNote: d.footer_note,
    reasons: d.reasons.map((r) => ({ id: r.id, code: r.code, label: r.label })),
  };
};

export const submitClaimReport = async (
  claimId: string,
  reasonId: string,
  comment?: string,
): Promise<void> => {
  await api.post(`/restaurant/claims/${claimId}/report/`, {
    reason_id: reasonId,
    comment: comment || undefined,
  });
};

/** Map create/update payload recurrence into API field names. */
function resolveRecurrenceFields(
  payload: CreateDonationPayload,
): { recurrence_type: string; recurrence_days?: number[] } | null {
  if (payload.recurrenceType != null) {
    const days =
      (payload.recurrenceType === 'CUSTOM' || payload.recurrenceType === 'WEEKLY')
      && payload.recurrenceDays
      && payload.recurrenceDays.length > 0
        ? payload.recurrenceDays
        : undefined;
    return {
      recurrence_type: payload.recurrenceType,
      ...(days ? { recurrence_days: days } : {}),
    };
  }
  if (payload.isRepeating != null) {
    return { recurrence_type: payload.isRepeating ? 'DAILY' : 'NONE' };
  }
  return null;
}

export const updateDonation = async (foodId: string, payload: CreateDonationPayload): Promise<RestaurantDonation> => {
  const recurrence = resolveRecurrenceFields(payload);
  let res;
  if (payload.localPhotoUri) {
    const formData = new FormData();
    formData.append('name',         payload.name);
    formData.append('description',  payload.description ?? '');
    formData.append('category',     payload.category);
    formData.append('unit',         payload.unit);
    formData.append('quantity',     String(payload.quantityOriginal));
    formData.append('pickup_start', payload.pickupStart);
    formData.append('pickup_end',   payload.pickupEnd);
    if (recurrence) {
      formData.append('recurrence_type', recurrence.recurrence_type);
      if (recurrence.recurrence_days) {
        formData.append('recurrence_days', serializeRecurrenceDays(recurrence.recurrence_days));
      }
    }
    formData.append('photo', await photoFormValue(payload.localPhotoUri));
    res = await api.patch(`/restaurant/donations/${foodId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } else {
    res = await api.patch(`/restaurant/donations/${foodId}/`, {
      name:         payload.name,
      description:  payload.description,
      category:     payload.category,
      unit:         payload.unit,
      quantity:     payload.quantityOriginal,
      pickup_start: payload.pickupStart,
      pickup_end:   payload.pickupEnd,
      ...recurrence,
    });
  }
  return mapApiDonation(res.data.data);
};

export const createDonation = async (payload: CreateDonationPayload): Promise<RestaurantDonation> => {
  const recurrence = resolveRecurrenceFields(payload);
  let res;
  if (payload.localPhotoUri) {
    const formData = new FormData();
    formData.append('name',         payload.name);
    formData.append('description',  payload.description ?? '');
    formData.append('category',     payload.category);
    formData.append('unit',         payload.unit);
    formData.append('quantity',     String(payload.quantityOriginal));
    formData.append('pickup_start', payload.pickupStart);
    formData.append('pickup_end',   payload.pickupEnd);
    if (recurrence) {
      formData.append('recurrence_type', recurrence.recurrence_type);
      if (recurrence.recurrence_days) {
        formData.append('recurrence_days', serializeRecurrenceDays(recurrence.recurrence_days));
      }
    }
    formData.append('photo', await photoFormValue(payload.localPhotoUri));
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
      ...recurrence,
    });
  }
  _hasDonations = true;
  return mapApiDonation(res.data.data);
};

export interface TodaysClaimsData {
  total:     number;
  pending:   number;
  collected: number;
  noShow:    number;
  claims:    RestaurantClaim[];
}

export const getTodaysClaims = async (): Promise<TodaysClaimsData> => {
  const res = await api.get('/restaurant/claims/today/');
  const raw = res.data.data;
  // Backend returns grouped shape: { total, summary: { pending, collected, no_show }, groups: [{ key, claims[] }] }
  const groups: Array<{ claims: ApiRestaurantClaim[] }> = raw.groups ?? [];
  const flatArr: ApiRestaurantClaim[] = groups.flatMap((g) => g.claims ?? []);
  const claims = flatArr.map(mapApiRestaurantClaim);
  const summary = raw.summary ?? {};
  const pending   = (summary.pending   as number | undefined) ?? claims.filter(c => (c.statusKey ?? c.status) === 'CLAIMED').length;
  const collected = (summary.collected as number | undefined) ?? claims.filter(c => (c.statusKey ?? c.status) === 'COLLECTED').length;
  const noShow    = (summary.no_show   as number | undefined) ?? claims.filter(c => (c.statusKey ?? c.status) === 'NO_SHOW').length;
  return {
    total:     (raw.total as number | undefined) ?? claims.length,
    pending,
    collected,
    noShow,
    claims,
  };
};

export const markNoShow = async (claimId: string): Promise<void> => {
  await api.post(`/restaurant/claims/${claimId}/no-show/`, {});
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
  cuisineType?:   string;
  address?:       string;
  latitude?:      number;
  longitude?:     number;
  contactPhone?:  string;
  contactEmail?:  string;
  opensAt?:       string;
  closesAt?:      string;
  openDays?:      string[];
  openingHours?:  string;
  about?:         string;
}

export const uploadRestaurantProfilePhoto = async (localUri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('photo', await photoFormValue(localUri));

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
  if (payload.cuisineType  != null) body.cuisine       = payload.cuisineType;
  if (payload.address      != null) body.address        = payload.address;
  if (payload.latitude     != null) body.latitude       = payload.latitude;
  if (payload.longitude    != null) body.longitude      = payload.longitude;
  if (payload.contactPhone != null) body.contact_phone  = payload.contactPhone;
  if (payload.contactEmail != null) body.contact_email  = payload.contactEmail;
  if (payload.opensAt      != null) body.opens_at       = payload.opensAt;
  if (payload.closesAt     != null) body.closes_at      = payload.closesAt;
  if (payload.openDays     != null) body.open_days      = daysToInts(payload.openDays);
  if (payload.openingHours != null) body.opening_hours  = payload.openingHours;
  if (payload.about        != null) body.about          = payload.about;

  const res = await api.patch('/restaurant/profile/', body);
  const p: ApiRestaurantProfile = res.data.data;
  const parsedUpdate = parseOpeningHours(p.opening_hours ?? '');
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
    cuisineType:    p.cuisine,
    openingHours:   p.opening_hours ?? '',
    opensAt:  stripSeconds(p.opens_at)  ?? parsedUpdate.opensAt,
    closesAt: stripSeconds(p.closes_at) ?? parsedUpdate.closesAt,
    openDays: p.open_days?.length ? intsToDays(p.open_days) : parsedUpdate.openDays,
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
  const compressed = await Promise.all(assets.map((asset) => compressImageForUpload(asset.uri)));
  compressed.forEach((photo) => {
    formData.append('photos', {
      uri:  photo.uri,
      type: photo.mimeType,
      name: photo.name,
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

export const reorderMenuPhotos = async (photoIds: string[]): Promise<MenuPhoto[]> => {
  const res = await api.patch('/restaurant/menu-photos/reorder/', { photo_ids: photoIds });
  const photos = mapMenuPhotos(res.data.data);
  _menuPhotoCount = photos.length;
  return photos;
};

export const getRestaurantProfile = async (): Promise<RestaurantProfile> => {
  const res = await api.get('/restaurant/profile/');
  const p: ApiRestaurantProfile = res.data.data;
  const parsed = parseOpeningHours(p.opening_hours ?? '');
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
    cuisineType: p.cuisine,
    openingHours: p.opening_hours ?? '',
    opensAt:  p.opens_at  ?? parsed.opensAt,
    closesAt: p.closes_at ?? parsed.closesAt,
    openDays: p.open_days?.length ? intsToDays(p.open_days) : parsed.openDays,
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

function mapApiNotificationSettings(
  s: ApiRestaurantNotificationSettings,
): RestaurantNotificationSettings {
  return {
    pushEnabled: s.push_enabled,
    emailEnabled: s.email_enabled,
    alertNewClaim: s.alert_new_claim,
    alertSponsored: s.alert_sponsored,
    alertAllClaimed: s.alert_all_claimed,
    alertWindowExpiring: s.alert_window_expiring,
    alertNoShow: s.alert_no_show,
    alertDonationClaimed: s.alert_donation_claimed,
    alertReceipts: s.alert_receipts,
  };
}

/** GET /restaurant/notifications/settings/ */
export const getNotificationSettings = async (): Promise<RestaurantNotificationSettings> => {
  const res = await api.get('/restaurant/notifications/settings/');
  return mapApiNotificationSettings(res.data.data as ApiRestaurantNotificationSettings);
};

/** PATCH /restaurant/notifications/settings/ */
export const updateNotificationSettings = async (
  settings: RestaurantNotificationSettings,
): Promise<RestaurantNotificationSettings> => {
  const res = await api.patch('/restaurant/notifications/settings/', {
    push_enabled: settings.pushEnabled,
    email_enabled: settings.emailEnabled,
    alert_new_claim: settings.alertNewClaim,
    alert_sponsored: settings.alertSponsored,
    alert_all_claimed: settings.alertAllClaimed,
    alert_window_expiring: settings.alertWindowExpiring,
    alert_no_show: settings.alertNoShow,
    alert_donation_claimed: settings.alertDonationClaimed,
    alert_receipts: settings.alertReceipts,
  });
  return mapApiNotificationSettings(res.data.data as ApiRestaurantNotificationSettings);
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
