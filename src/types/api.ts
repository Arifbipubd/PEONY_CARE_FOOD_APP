// Raw API response types — mirrors backend snake_case JSON exactly.
// Used only in mock data files and service mappers.
// Screens never import from here — they use the camelCase types in index.ts.

export interface ApiRestaurantRef {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  rating?: number;
  review_count?: number;
}

export interface ApiFoodItem {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  photo_url: string;
  quantity_available: number;
  quantity_original: number;
  quantity_claimed: number;
  status: string;
  pickup_start: string;
  pickup_end: string;
  pickup_window: string;
  distance_km: number;
  restaurant: ApiRestaurantRef;
  sponsorship_type: string;
  sponsor_display_name: string | null;
  is_halal?: boolean;
  is_vegetarian?: boolean;
}

export interface ApiClaimProgress {
  claimed: number;
  total: number;
  remaining: number;
  percent_claimed: number;
}

export interface ApiFoodDetail extends ApiFoodItem {
  claim_progress: ApiClaimProgress;
}

export interface ApiDailyLimit {
  used: number;
  limit: number;
  can_claim: boolean;
  resets_at: string;
}

export interface ApiClaimResponse {
  claim_id: string;
  status: string;
  food_name: string;
  restaurant_name: string;
  pickup_address: string;
  distance_km: number;
  pickup_window: string;
  claimed_at: string;
  message: string;
  daily_limit: ApiDailyLimit;
}

export interface ApiClaimHistoryItem {
  id: string;
  food_name: string;
  restaurant_name: string;
  photo_url?: string;
  sponsor_display_name?: string | null;
  status: string;
  claimed_at: string;
  pickup_window: string;
}

export interface ApiClaimHistory {
  count: number;
  results: ApiClaimHistoryItem[];
  grouped_by_week: Array<{
    week_start: string;
    claims: ApiClaimHistoryItem[];
  }>;
}

export interface ApiReceiverProfile {
  id: string;
  display_name: string;
  phone: string;
  email: string;
  is_verified: boolean;
  member_since: string;
  days_active: number;
  total_claims: number;
  last_claim_date: string | null;
  stats: {
    lifetime_meals: number;
    restaurants_count: number;
  };
}

export interface ApiRecentPlace {
  id: string;
  place_name: string;
  area_label: string;
  place_type: string;
  latitude: number;
  longitude: number;
  visited_at: string;
}

export interface ApiLocationSettings {
  browse_radius_km: number;
  radius_options_km: number[];
  location_services_enabled: boolean;
  save_location_history: boolean;
  latitude: number | null;
  longitude: number | null;
  recent_places_count: number;
  recent_places: ApiRecentPlace[];
}

export interface ApiPublicRestaurant {
  id: string;
  name: string;
  address: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  photo_url: string | null;
  is_verified: boolean;
  distance_km: number;
  active_meal_count?: number;
  cuisine_type?: string;
  closes_at?: string;
  opening_hours?: string;
  about?: string;
  total_food_shared?: number;
  meal_count?: number;
}

export interface ApiRestaurantMealSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  photo_url: string | null;
  quantity_available: number;
  pickup_start: string;
  pickup_end: string;
  pickup_window: string;
  sponsorship_type: string;
  sponsor_display_name: string | null;
}

export interface ApiRestaurantDetail {
  id: string;
  name: string;
  address: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  photo_url: string | null;
  about: string;
  opening_hours: string;
  contact_phone: string;
  is_verified: boolean;
  distance_km: number;
  active_meal_count: number;
  categories: string[];
  available_meals: ApiRestaurantMealSummary[];
}

export interface ApiRestaurantDonation {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  photo_url: string;
  quantity_original: number;
  quantity_available: number;
  quantity_claimed: number;
  status: string;
  list_status: string;
  pickup_start: string;
  pickup_end: string;
  pickup_window: string;
  food_qr_data: string;
  food_qr_image_url: string | null;
  claims_count: number;
  created_at: string;
  sponsor_display_name?: string | null;
  sponsor_initials?: string | null;
  no_show_count?: number;
  expired_count?: number;
  estimated_reach_label?: string;
  claims?: Array<{
    id: string;
    receiver_name: string;
    claimed_at: string;
    status: string;
  }>;
}

export interface ApiDonationSummary {
  active_count: number;
  past_count: number;
  inactive_count: number;
  weekly_meals: number;
}

export interface ApiCreateDonationPayload {
  name: string;
  description: string;
  category: string;
  unit: string;
  quantity_original: number;
  pickup_start: string;
  pickup_end: string;
  photo_url?: string | null;
}

export interface ApiRestaurantProfile {
  id: string;
  name: string;
  address: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  uen: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  cuisine?: string;
  opening_hours: string;
  opens_at?: string;
  closes_at?: string;
  open_days?: number[];
  about: string;
  photo_url: string | null;
  is_approved: boolean;
  is_verified: boolean;
  total_food_shared: number;
  people_fed: number;
  claim_rate_pct: number;
  rating: number;
  review_count: number;
}

export interface ApiRestaurantDashboardGroup {
  key: string;
  label: string;
  date: string | null;
  listings_count: number;
  portions: number;
  fed: number;
  items: ApiRestaurantDonation[];
}

export interface ApiRestaurantDashboard {
  // Backward-compat flat fields (always present)
  lives_impacted: number;
  donations_this_year: number;
  claim_rate_pct: number;
  active_count: number;
  claimed_today: number;
  today_listings: ApiRestaurantDonation[];
  // Injected by getDashboard after profile call
  restaurant_name?: string;
  // Nested structure returned by backend
  impact?: {
    lives_impacted: number;
    donations_this_year: number;
    week_over_week_pct: number;
  };
  this_week?: {
    donations: number;
    meals: number;
    inactive_count: number;
  };
  active_donations?: {
    groups: ApiRestaurantDashboardGroup[];
  };
  // Legacy optional fields kept for safety
  growth_pct_this_week?: number;
  this_week_donations?: number;
  this_week_meals?: number;
  this_week_inactive?: number;
  today_portions?: number;
  yesterday_listings?: ApiRestaurantDonation[];
  yesterday_fed?: number;
}

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface ApiNotificationList {
  count: number;
  results: ApiNotification[];
}

export interface ApiOtpSendResponse {
  phone: string;
  purpose: string;
  expires_at: string;
  message: string;
}

export interface ApiOtpVerifyNewUser {
  registration_token: string;
  phone: string;
  message: string;
}

export interface ApiAuthUser {
  id: string;
  phone: string;
  role: string;
  is_active: boolean;
}

export interface ApiAuthTokens {
  access: string;
  refresh: string;
  user: ApiAuthUser;
}
