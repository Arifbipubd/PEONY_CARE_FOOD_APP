// Shared TypeScript types — mirrors the shapes the backend API will return.
// All screens and services import types from here.

export type UserRole = 'RECEIVER' | 'RESTAURANT' | 'DONOR';

export type CreditPreference = 'SHOW_NAME' | 'INITIALS' | 'ANONYMOUS';

export type FoodCategory = 'RICE' | 'NOODLES' | 'BREAD' | 'SNACKS' | 'DRINKS' | 'OTHER';

export type FoodStatus = 'AVAILABLE' | 'PARTIALLY_CLAIMED' | 'FULLY_CLAIMED' | 'EXPIRED';

export type FoodListStatus = 'ACTIVE' | 'PAST' | 'INACTIVE';

export type ClaimStatus = 'CLAIMED' | 'COLLECTED';
export type ClaimHistoryItemStatus = 'CLAIMED' | 'EXPIRED';

export type SponsorshipType = 'DIRECT' | 'SPONSORED_NAMED' | 'SPONSORED_ANONYMOUS';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isApproved: boolean;
}

// ─── Food Items ───────────────────────────────────────────────────────────────

export interface ClaimProgress {
  claimed: number;
  total: number;
  remaining: number;
  percentClaimed: number;
}

// FoodItem is the receiver-facing view of a food listing.
// Mapped from the backend snake_case response in the service layer.
// Note: list_status and food_qr_data are NOT returned by the receiver API.
export interface FoodItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantLatitude: number;
  restaurantLongitude: number;
  restaurantIsVerified: boolean;
  restaurantRating?: number;
  restaurantReviewCount?: number;
  name: string;
  description: string;
  category: FoodCategory;
  unit: string;
  photoUrl: string;
  quantityOriginal: number;
  quantityAvailable: number;
  quantityClaimed: number;
  status: FoodStatus;
  pickupStart: string;   // ISO string SGT
  pickupEnd: string;     // ISO string SGT
  pickupWindow: string;  // pre-formatted, e.g. "6:00 PM – 8:00 PM"
  distanceKm: number;
  sponsorshipType: SponsorshipType;
  sponsorDisplayName: string | null;
  isHalal: boolean;
  isVegetarian: boolean;
  claimProgress?: ClaimProgress; // only present in food detail response
}

// ─── Claims ───────────────────────────────────────────────────────────────────

export interface DailyLimitStatus {
  used: number;
  limit: number;
  canClaim: boolean;
  resetsAt: string;
}

export interface Claim {
  claimId: string;
  status: ClaimStatus;
  foodName: string;
  restaurantId: string;
  restaurantName: string;
  restaurantPhotoUrl: string | null;
  pickupAddress: string;
  distanceKm: number;
  pickupWindow: string;
  claimedAt: string;
  message: string;
  dailyLimit: {
    used: number;
    limit: number;
    canClaim: boolean;
    resetsAt: string;
  };
}

export interface ReviewPayload {
  claimId: string;
  rating: number;
  tags: string[];
  comment: string;
}

export interface ClaimHistoryItem {
  id: string;
  foodName: string;
  restaurantName: string;
  photoUrl?: string;
  sponsorDisplayName?: string | null;
  status: ClaimHistoryItemStatus;
  claimedAt: string;
  pickupWindow: string;
}

export interface ClaimHistory {
  count: number;
  results: ClaimHistoryItem[];
  groupedByWeek: Array<{
    weekStart: string;
    claims: ClaimHistoryItem[];
  }>;
}

// ─── Receiver Profile ─────────────────────────────────────────────────────────

export interface ReceiverProfile {
  id: string;
  displayName: string;
  phone: string;
  photoUrl: string | null;
  browseRadiusKm: number;
  memberSince: string;
  daysActive: number;
  totalClaims: number;
  lastClaimDate: string | null;
  lifetimeMeals: number;
  restaurantsCount: number;
}

export interface RecentPlace {
  id: string;
  name: string;
  area: string;
  placeType: string;
  latitude: number;
  longitude: number;
  visitedAt: string;
}

export interface LocationSettings {
  searchRadiusKm: number;
  radiusOptionsKm: number[];
  locationServicesEnabled: boolean;
  saveLocationHistory: boolean;
  latitude: number | null;
  longitude: number | null;
  recentPlacesCount: number;
  recentPlaces: RecentPlace[];
}

// ─── Public Restaurant Page ───────────────────────────────────────────────────

export interface PublicRestaurant {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  isVerified: boolean;
  distanceKm: number;
  mealCount: number;
  cuisineType?: string;
  closesAt?: string;
  openingHours?: string;
  about?: string;
  totalFoodShared?: number;
}

// ─── Restaurant-side types ────────────────────────────────────────────────────

// RestaurantProfile is the private profile — includes UEN, contact, approval status
export interface RestaurantProfile {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  uen: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  cuisineType?: string;
  openingHours: string;
  opensAt?: string;
  closesAt?: string;
  openDays?: string[];
  about: string;
  photoUrl: string | null;
  isApproved: boolean;
  isVerified: boolean;
  totalFoodShared: number;
  peopleFed: number;
  claimRatePct: number;
  rating: number;
  reviewCount: number;
}

// RestaurantDonation is a food listing from the restaurant's own management view.
// Includes list_status, food_qr_data — NOT part of receiver view.
export interface RestaurantDonation {
  id: string;
  name: string;
  description: string;
  category: FoodCategory;
  unit: string;
  photoUrl: string;
  quantityOriginal: number;
  quantityAvailable: number;
  quantityClaimed: number;
  status: FoodStatus;
  listStatus: FoodListStatus;
  pickupStart: string;
  pickupEnd: string;
  pickupWindow: string;
  foodQrData: string;
  foodQrImageUrl: string | null;
  claimsCount: number;
  createdAt: string;
  sponsorDisplayName?: string | null;
  sponsorInitials?: string | null;
  noShowCount?: number;
  expiredCount?: number;
  estimatedReachLabel?: string;
  isRepeating?: boolean;
  repeatTimeLabel?: string;
  nextPostLabel?: string;
  donationSourceNote?: string;
  claims?: Array<{
    id: string;
    receiverName: string;
    claimedAt: string;
    collectedAt?: string;
    status: ClaimStatus;
  }>;
}

export interface DonationSummary {
  activeCount: number;
  pastCount: number;
  inactiveCount: number;
  weeklyMeals: number;
}

export interface CreateDonationPayload {
  name: string;
  description: string;
  category: string;
  unit: string;
  quantityOriginal: number;
  pickupStart: string;
  pickupEnd: string;
  localPhotoUri?: string | null;
}

export interface RestaurantDashboard {
  restaurantName: string;
  photoUrl: string | null;
  livesImpacted: number;
  donationsThisYear: number;
  growthPctThisWeek: number;
  claimRatePct: number;
  activeCount: number;
  claimedToday: number;
  thisWeekDonations: number;
  thisWeekMeals: number;
  thisWeekInactive: number;
  todayPortions: number;
  todayListings: RestaurantDonation[];
  yesterdayListings: RestaurantDonation[];
  yesterdayFed: number;
  pastGroups: Array<{ label: string; listings: RestaurantDonation[]; fed: number }>;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsDish {
  id: string;
  name: string;
  photoUrl: string | null;
  mealCount: number;
  claimRatePct: number;
}

export interface AnalyticsSponsor {
  id: string;
  displayName: string;
  initials: string | null;
  sponsoredCount: number;
  totalAmountSGD: number;
  isAnonymous: boolean;
}

export interface WeeklyMealPoint {
  week: string;
  meals: number;
}

export interface ClaimRatePoint {
  week: string;
  ratePct: number;
}

export interface RestaurantAnalytics {
  livesFed: number;
  totalDonations: number;
  claimRatePct: number;
  growthPctThisWeek: number;
  directCount: number;
  sponsoredCount: number;
  weeklyMeals: WeeklyMealPoint[];
  claimRateTrend: ClaimRatePoint[];
  heatmap: number[][];
  topDishes: AnalyticsDish[];
  topSponsors: AnalyticsSponsor[];
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}
