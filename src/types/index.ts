// Shared TypeScript types — mirrors the shapes the backend API will return.
// All screens and services import types from here.

export type UserRole = 'RECEIVER' | 'RESTAURANT' | 'DONOR';

export type CreditPreference = 'SHOW_NAME' | 'INITIALS' | 'ANONYMOUS';

export type FoodCategory = 'RICE' | 'NOODLES' | 'BREAD' | 'SNACKS' | 'DRINKS' | 'OTHER';

export type FoodStatus = 'AVAILABLE' | 'PARTIALLY_CLAIMED' | 'FULLY_CLAIMED' | 'EXPIRED';

export type FoodListStatus = 'ACTIVE' | 'PAST' | 'INACTIVE';

export type ClaimStatus = 'CLAIMED';

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
  isApproved: boolean; // restaurants only — false = show approval pending screen
}

// ─── Food Items ───────────────────────────────────────────────────────────────

export interface FoodItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
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
  pickupStart: string;  // ISO string SGT
  pickupEnd: string;    // ISO string SGT
  distanceKm: number;
  sponsorshipType: SponsorshipType;
  sponsorDisplayName: string | null;
  foodQrData: string;   // "{food_id}|{restaurant_id}|{unix_ts}"
}

// ─── Claims ───────────────────────────────────────────────────────────────────

export interface Claim {
  claimId: string;
  status: ClaimStatus;
  foodName: string;
  restaurantName: string;
  pickupAddress: string;
  distanceKm: number;
  pickupWindow: string;
  claimedAt: string;
  message: string;
  dailyLimit: { used: number; limit: number };
}

export interface DailyLimitStatus {
  used: number;
  limit: number;
  canClaim: boolean;
  resetsAt: string;
}

// ─── Restaurant Profile ───────────────────────────────────────────────────────

export interface RestaurantProfile {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  contactName: string;
  contactEmail: string;
  openingHours: string;
  about: string;
  photoUrl: string;
  isApproved: boolean;
  isVerified: boolean;
  totalFoodShared: number;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}
